import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { useGuest } from "./GuestContext";

const POContext = createContext();

export const PurchaseOrderProvider = ({ children }) => {
  const [poItems, setPoItems] = useState([]);
  const [purchaseOrderId, setPurchaseOrderId] = useState(null);
  const { user } = useContext(UserContext);
  const { guest } = useGuest();

  const mapDraftItems = (source) =>
    (source || []).map((i) => ({
      productId: i.productId,
      styleNo: i.styleNo || "",
      name: i.name,
      description: i.description || "",
      price: i.price,
      quantity: i.qty ?? i.quantity ?? 0,
      color: i.color || null,
      size: i.size || null,
      image: i.image || null,
    }));

  // Load draft items from server for logged-in users and guests.
  useEffect(() => {
    const load = async () => {
      let ownerType, ownerId;

      // If user is logged in
      if (user && user._id) {
        ownerType = "User";
        ownerId = user._id;
      } else if (guest && guest._id) {
        // If guest is logged in
        ownerType = "Guest";
        ownerId = guest._id;
      }

      // Load from server if we have owner info
      if (ownerType && ownerId) {
        try {
          const isProd = !window.location.hostname.includes('localhost') &&
                        !window.location.hostname.includes('127.0.0.1');
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}`, {
            credentials: isProd ? 'include' : 'omit',
          });
          if (res.ok) {
            const data = await res.json();
            if (data.purchaseOrderId) setPurchaseOrderId(data.purchaseOrderId);
            const items = mapDraftItems(data.items);
            setPoItems(items);
            return;
          }
        } catch (err) {
          console.error(`Failed to fetch ${ownerType} PO draft:`, err);
        }
      }

      // If no server draft exists, keep an in-memory empty cart.
    };

    load();
  }, [user, guest]);

  // Do not persist PO items in localStorage; server-side drafts are used when available.

  const addToPO = (item) => {
    setPoItems((prev) => {
      // match by productId + color + size to keep combinations distinct
      const existing = prev.find(
        (p) =>
          p.productId === item.productId &&
          (p.color || null) === (item.color || null) &&
          (p.size || null) === (item.size || null)
      );

      if (existing) {
        return prev.map((p) =>
          p.productId === item.productId &&
          (p.color || null) === (item.color || null) &&
          (p.size || null) === (item.size || null)
            ? { ...p, quantity: (p.quantity || 0) + (item.quantity || 0) }
            : p
        );
      }

      return [...prev, item];
    });
  };

  const removeFromPO = async (productId) => {
    // Accept either a productId string or an object { productId, color, size }
    if (!productId) throw new Error("productId is required");

    const isProd = !window.location.hostname.includes('localhost') &&
                  !window.location.hostname.includes('127.0.0.1');

    // Determine ownerType and ownerId
    let ownerType, ownerId;
    if (user && user._id) {
      ownerType = "User";
      ownerId = user._id;
    } else if (guest && guest._id) {
      ownerType = "Guest";
      ownerId = guest._id;
    }

    const endpoint = ownerType && ownerId
      ? `${import.meta.env.VITE_API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}/items`
      : null;

    if (!endpoint) {
      throw new Error("Session not ready. Please wait a moment and try again.");
    }

    // If user or guest is logged in, request backend to remove
    try {
      let body = null;
      if (typeof productId === "string") body = { productId };
      else body = {
        productId: productId.productId,
        color: productId.color,
        size: productId.size,
      };

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: isProd ? 'include' : 'omit',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to remove item");
      }

      const data = await res.json();
      console.log("PO Response:", data);
      const items = mapDraftItems(data.po?.items || data.po);
      setPoItems(items);
      return items;
    } catch (err) {
      console.error("Error removing item from server PO:", err);
      throw err;
    }
  };

  const updatePOItemQty = async ({ productId, color = null, size = null, qty }) => {
    if (!productId) throw new Error("productId is required");

    const isProd = !window.location.hostname.includes('localhost') &&
                  !window.location.hostname.includes('127.0.0.1');

    const numericQty = Math.max(1, Number(qty) || 1);

    let ownerType, ownerId;
    if (user && user._id) {
      ownerType = "User";
      ownerId = user._id;
    } else if (guest && guest._id) {
      ownerType = "Guest";
      ownerId = guest._id;
    }

    const endpoint = ownerType && ownerId
      ? `${import.meta.env.VITE_API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}/items`
      : null;

    if (endpoint) {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: isProd ? 'include' : 'omit',
        body: JSON.stringify({ productId, color, size, qty: numericQty }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to update item quantity");
      }

      const data = await res.json();
      console.log("PO Response:", data);
      const items = mapDraftItems(data.po?.items || data.po);
      setPoItems(items);
      return items;
    }

    setPoItems((prev) =>
      prev.map((item) =>
        item.productId === productId &&
        (item.color || null) === (color || null) &&
        (item.size || null) === (size || null)
          ? { ...item, quantity: numericQty }
          : item
      )
    );

    return null;
  };

  const clearPO = async () => {
    const isProd =
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1");

    let ownerType, ownerId;

    if (user && user._id) {
      ownerType = "User";
      ownerId = user._id;
    } else if (guest && guest._id) {
      ownerType = "Guest";
      ownerId = guest._id;
    }

    const endpoint =
      ownerType && ownerId
        ? `${import.meta.env.VITE_API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}/items`
        : null;

    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: "DELETE",
          credentials: isProd ? "include" : "omit",
        });
      } catch (err) {
        console.error("Error clearing server PO:", err);
      }
    }

    // ALWAYS clear frontend state
    setPoItems([]);
  };

  const updatePOItemSize = async ({
    productId,
    color = null,
    size = null,
    newSize = null,
    newProductId,
    newStyleNo,
    newPrice,
    newImage,
  }) => {
    if (!productId) throw new Error("productId is required");

    const isProd = !window.location.hostname.includes('localhost') &&
                  !window.location.hostname.includes('127.0.0.1');

    let ownerType, ownerId;
    if (user && user._id) {
      ownerType = "User";
      ownerId = user._id;
    } else if (guest && guest._id) {
      ownerType = "Guest";
      ownerId = guest._id;
    }

    const endpoint = ownerType && ownerId
      ? `${import.meta.env.VITE_API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}/items/size`
      : null;

    if (!endpoint) {
      throw new Error("Session not ready. Please wait a moment and try again.");
    }

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: isProd ? 'include' : 'omit',
        body: JSON.stringify({
          productId,
          color,
          size,
          newSize,
          newProductId,
          newStyleNo,
          newPrice,
          newImage,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to update item size");
      }

      const data = await res.json();
      console.log("PO Response:", data);
      const items = mapDraftItems(data.po?.items || data.po);
      setPoItems(items);
      return items;
    } catch (err) {
      console.error("Error updating item size in server PO:", err);
      throw err;
    }
  };

  return (
    <POContext.Provider value={{ poItems, purchaseOrderId, setPurchaseOrderId, addToPO, removeFromPO, updatePOItemQty, updatePOItemSize, clearPO }}>
      {children}
    </POContext.Provider>
  );
};

export const usePO = () => useContext(POContext);