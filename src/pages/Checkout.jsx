import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";

import "./CSS/checkout.css";
import { usePO } from "../context/PurchaseOrderContext.jsx";
import { useGuest } from "../context/GuestContext.jsx";
import { UserContext } from "../context/UserContext.jsx";

const TAX_RATE = 0.11;
const PROCESSING_FEE_RATE = 0.05;

const getQty = (item) => Number(item.qty ?? item.quantity ?? 0);
const getPrice = (item) => Number(item.price ?? item.unitPrice ?? 0);

const safeStringify = (obj) =>
  JSON.stringify(obj, (_, value) =>
    typeof value === "bigint" ? value.toString() : value
  );

const loadSquareScript = () =>
  new Promise((resolve, reject) => {
    if (window.Square) return resolve();

    const script = document.createElement("script");
    script.src = "https://sandbox.web.squarecdn.com/v1/square.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

export default function Checkout() {
  const navigate = useNavigate();

  const { guest } = useGuest();
  const { user, loading } = useContext(UserContext);
  const {
    poItems,
    clearPO,
    removeFromPO,
    updatePOItemQty,
    updatePOItemSize,
  } = usePO();

  const [orderData, setOrderData] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cardRef = useRef(null);
  const squareLoaded = useRef(false);
  const isSquareReady = useRef(false);

  const [minQtyByProduct, setMinQtyByProduct] = useState({});
  const [sizeOptionsByProduct, setSizeOptionsByProduct] = useState({});

  // ---------------- AUTH ----------------
  useEffect(() => {
    if (!loading) {
      if (!user && !guest) navigate("/signin");
      if (!poItems.length) navigate("/");
    }
  }, [user, guest, loading, poItems]);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    setOrderData(
      (poItems || []).map((item) => ({
        ...item,
        qty: item.quantity ?? item.qty ?? 0,
      }))
    );
  }, [poItems]);

  // ---------------- FETCH MIN QTY + SIZE OPTIONS ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ids = [...new Set((poItems || []).map(i => i.productId))];

        const entries = await Promise.all(
          ids.map(async (productId) => {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/api/products/lookup/${productId}`
            );

            const product = res.ok ? await res.json() : null;

            const sizes =
              product?.variants?.length > 0
                ? [...new Set(product.variants.map(v => v.size).filter(Boolean))]
                : [];

            return [
              productId,
              product?.minQty ?? 1,
              sizes
            ];
          })
        );

        const minQtyMap = {};
        const sizeMap = {};

        entries.forEach(([id, minQty, sizes]) => {
          minQtyMap[id] = minQty;
          sizeMap[id] = sizes;
        });

        setMinQtyByProduct(minQtyMap);
        setSizeOptionsByProduct(sizeMap);

      } catch (err) {
        console.error(err);
      }
    };

    if (poItems?.length) fetchData();
  }, [poItems]);

  // ---------------- ITEM CHANGE ----------------
  const handleItemChange = async (index, field, value) => {
    const updated = [...orderData];
    const item = updated[index];
    const oldValue = item[field];

    item[field] = value;
    setOrderData([...updated]);

    try {
      if (field === "size") {
        const variants = item.variants || [];
        const selected = variants.find(v => v.size === value);

        const newPrice = selected?.price || item.price;

        item.price = newPrice;

        await updatePOItemSize({
          productId: item.productId,
          color: item.color,
          size: oldValue,
          newSize: value,
        });

        setOrderData([...updated]);
      }

      if (field === "qty") {
        const minQty = minQtyByProduct[item.productId] || 1;
        const newQty = Number(value) || 0;

        if (newQty > 0 && newQty < minQty) {
          setError(`Minimum quantity is ${minQty}`);
          updated[index][field] = oldValue;
          setOrderData([...updated]);
          return;
        }

        if (newQty <= 0) {
          setError("Quantity must be greater than 0");
          updated[index][field] = oldValue;
          setOrderData([...updated]);
          return;
        }

        await updatePOItemQty({
          productId: item.productId,
          color: item.color,
          size: item.size,
          qty: newQty,
        });

        setError("");
      }
    } catch (err) {
      console.error(err);
      setError("Update failed");
      updated[index][field] = oldValue;
      setOrderData([...updated]);
    }
  };

  // ---------------- REMOVE ----------------
  const handleRemove = async (index) => {
    const item = orderData[index];

    await removeFromPO({
      productId: item.productId,
      color: item.color,
      size: item.size,
    });

    setOrderData((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------- SHIPPING (ONLY CHANGE HERE) ----------------
  const [shippingInfo, setShippingInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  const validateShipping = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!shippingInfo.firstName.trim()) return "First Name is required";
    if (!shippingInfo.lastName.trim()) return "Last Name is required";
    if (!shippingInfo.email.trim() || !emailRegex.test(shippingInfo.email))
      return "Valid Email is required";

    
    if (!shippingInfo.phone.trim()) return "Phone number is required";
    if (!phoneRegex.test(shippingInfo.phone)) return "Valid Phone number is required.";

    if (!shippingInfo.address.trim()) return "Address is required";
    if (!shippingInfo.city.trim()) return "City is required";
    if (!shippingInfo.zip.trim()) return "ZIP is required";
    if (!shippingInfo.zip.trim()) return "ZIP is required";
    if (!shippingInfo.country.trim()) return "Country is required";

    return null;
  };

  useEffect(() => {
    setShippingInfo((prev) => ({
      ...prev,
      email: user?.email || guest?.email || "",
      firstName: user?.name?.split(" ")[0] || "",
      lastName: user?.name?.split(" ")[1] || "",
    }));
  }, [user, guest]);

  // ---------------- CALC ----------------
  const subtotal = useMemo(
    () => orderData.reduce((acc, i) => acc + getQty(i) * getPrice(i), 0),
    [orderData]
  );

  const tax = subtotal * TAX_RATE;
  const processingFee = subtotal * PROCESSING_FEE_RATE;
  const total = subtotal + tax + processingFee;

  // ---------------- SQUARE INIT ----------------
  useEffect(() => {
    const initSquare = async () => {
      try {
        if (squareLoaded.current) return;

        const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

        if (!appId || !locationId) {
          throw new Error("Missing Square env variables");
        }

        await loadSquareScript();

        let retries = 10;
        while (!window.Square && retries > 0) {
          await new Promise((r) => setTimeout(r, 300));
          retries--;
        }

        const payments = window.Square.payments(appId, locationId);
        const card = await payments.card();

        const container = document.getElementById("card-container");
        if (container) container.innerHTML = "";

        await card.attach("#card-container");

        cardRef.current = card;
        squareLoaded.current = true;
        isSquareReady.current = true;
      } catch (err) {
        console.error(err);
        setError("Payment system not ready");
        isSquareReady.current = false;
      }
    };

    initSquare();
  }, []);

  // ---------------- PAYMENT ----------------
  const handlePayment = async () => {
    setError("");

    const validationError = validateShipping();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!cardRef.current) {
      setError("Payment system not ready");
      return;
    }

    setSubmitting(true);

    try {
      const result = await cardRef.current.tokenize();

      if (result.status !== "OK") {
        throw new Error(result.errors?.[0]?.message);
      }

      const payload = {
        token: result.token,
        orderData,
        subtotal,
        tax,
        processingFee,
        total,
        amount: Math.round(total * 100),
        shippingInfo,
        ownerId: String(user?._id || guest?._id),
        ownerType: user ? "User" : "Guest",
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/square/pay`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: safeStringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message);

      clearPO();
      navigate(`/order-confirmation/${data.order._id}`);
    } catch (err) {
      setError(err.message);
    }

    setSubmitting(false);
  };

  if (loading) return null;

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "India",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Mexico",
  ];

  return (
    <div className="checkout-page">
      <div className="business-log-purchase">
        <img src="/images/logo.png" alt="Company Logo" />
      </div>

      <table className="po-table">
        <thead>
          <tr>
            <th>Style No</th>
            <th>Description</th>
            <th>Size</th>
            <th>Color</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orderData.map((item, index) => {
            const sizes = sizeOptionsByProduct[item.productId] || [];
            const hasSizes = sizes.length > 0;

            return (
              <tr key={index}>
                <td><input value={item.styleNo || "N/A"} readOnly /></td>
                <td><input value={item.description || item.name} readOnly /></td>

                <td>
                  {hasSizes ? (
                    <select
                      value={item.size || ""}
                      onChange={(e) =>
                        handleItemChange(index, "size", e.target.value)
                      }
                    >
                      <option value="">Select Size</option>
                      {sizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input value="N/A" readOnly />
                  )}
                </td>

                <td><input value={item.color || "N/A"} readOnly /></td>

                <td>
                  <input
                    type="number"
                    value={getQty(item)}
                    onChange={(e) =>
                      handleItemChange(index, "qty", e.target.value)
                    }
                  />
                </td>

                <td><input value={getPrice(item)} readOnly /></td>

                <td>{(getQty(item) * getPrice(item)).toFixed(2)}</td>

                <td>
                  <button onClick={() => handleRemove(index)}>X</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="po-container">
        <div className="po-left">
          <h3>Shipping Information</h3>

          <input placeholder="First Name" value={shippingInfo.firstName}
            onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })} />

          <input placeholder="Last Name" value={shippingInfo.lastName}
            onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })} />

          <input placeholder="Email" value={shippingInfo.email}
            onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })} />

          <input placeholder="Phone Number" value={shippingInfo.phone}
            onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })} />

          <input placeholder="Address" value={shippingInfo.address}
            onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} />

          <input placeholder="City" value={shippingInfo.city}
            onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })} />

          <input placeholder="ZIP" value={shippingInfo.zip}
            onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })} />

            <select
              className="po-input"
              value={shippingInfo.country}
              onChange={(e) =>
                setShippingInfo({ ...shippingInfo, country: e.target.value })
              }
            >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="po-right">
          <h3>Summary</h3>
          <div className="po-summary-items">
            {orderData.map((item, index) => (
              <div key={index} className="po-summary-item">
                
                <img
                  src={item.image || item.images?.[0] || "/images/placeholder.png"}
                  alt={item.name}
                  className="po-summary-img"
                />

                <div className="po-summary-details">
                  <p><strong>{item.name}</strong></p>
                  <p>Size: {item.size || "N/A"}</p>
                  <p>Color: {item.color || "N/A"}</p>
                  <p>Qty: {getQty(item)}</p>
                  <p>${(getQty(item) * getPrice(item)).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Tax: ${tax.toFixed(2)}</p>
          <p>Processing Fee: ${processingFee.toFixed(2)}</p>

          <h3>Total: ${total.toFixed(2)}</h3>

          <div id="card-container" />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button className="paynow-btn" onClick={handlePayment} disabled={submitting}>
            {submitting ? "Processing..." : "Submit Purchase Order"}
          </button>
        </div>
      </div>
    </div>
  );
}