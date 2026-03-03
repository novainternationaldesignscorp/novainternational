import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { useGuest } from "./GuestContext";

const POContext = createContext();

export const PurchaseOrderProvider = ({ children }) => {
  const [poItems, setPoItems] = useState([]);
  const [purchaseOrderId, setPurchaseOrderId] = useState(null);
  const { user } = useContext(UserContext);
  const { guest } = useGuest();
  const API_URL = import.meta.env.VITE_API_URL;

  const mapDraftItems = (source) =>
    (source || []).map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.qty ?? i.quantity ?? 0,
      color: i.color || null,
      size: i.size || null,
      image: i.image || null,
    }));

  // Load from server (when logged in or guest) or from localStorage
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
          const res = await fetch(`${API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}`, {
            credentials: "include",
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

      // If no server draft found and no owner, start with empty PO items
      // (do not persist to localStorage in testing/production)
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
    if (!productId) return;

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
      ? `${API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}/items`
      : null;

    // If user or guest is logged in, request backend to remove
    if (endpoint) {
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
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || "Failed to remove item");
        }

        const data = await res.json();
        const items = mapDraftItems(data.po?.items || data.po);
        setPoItems(items);
        return items;
      } catch (err) {
        console.error("Error removing item from server PO:", err);
        // fall through to local-only removal
      }
    }

    setPoItems((prev) => {
      if (typeof productId === "string") {
        return prev.filter((p) => p.productId !== productId);
      }

      const { productId: id, color, size } = productId;
      return prev.filter(
        (p) => !(p.productId === id && (color ? p.color === color : true) && (size ? p.size === size : true))
      );
    });

    return null;
  };

  const updatePOItemQty = async ({ productId, color = null, size = null, qty }) => {
    if (!productId) throw new Error("productId is required");

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
      ? `${API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}/items`
      : null;

    if (endpoint) {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, color, size, qty: numericQty }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to update item quantity");
      }

      const data = await res.json();
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
      ? `${API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}/items`
      : null;

    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || "Failed to clear PO");
        }

        setPoItems([]);
        return;
      } catch (err) {
        console.error("Error clearing server PO:", err);
        // fall through to local clear
      }
    }

    setPoItems([]);
  };

  return (
    <POContext.Provider value={{ poItems, purchaseOrderId, setPurchaseOrderId, addToPO, removeFromPO, updatePOItemQty, clearPO }}>
      {children}
    </POContext.Provider>
  );
};

export const usePO = () => useContext(POContext);