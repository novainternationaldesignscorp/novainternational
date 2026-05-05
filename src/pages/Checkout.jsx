import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
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

  // ---------------- FETCH PRODUCT DATA ----------------
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
        await updatePOItemSize({
          productId: item.productId,
          color: item.color,
          size: oldValue,
          newSize: value,
        });
      }

      if (field === "qty") {
        const minQty = minQtyByProduct[item.productId] || 1;
        const newQty = Number(value) || 0;

        if (newQty < minQty) {
          setError(`Minimum quantity is ${minQty}`);
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

  // ---------------- SHIPPING ----------------
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
  // First Name (letters only)
  if (!shippingInfo.firstName.trim()) return "First Name is required";
  if (!/^[A-Za-z]+$/.test(shippingInfo.firstName.trim())) {
    return "First Name must contain only letters";
  }

  // Last Name (letters only)
  if (!shippingInfo.lastName.trim()) return "Last Name is required";
  if (!/^[A-Za-z]+$/.test(shippingInfo.lastName.trim())) {
    return "Last Name must contain only letters";
  }

  // Email
  if (!shippingInfo.email.trim()) return "Email is required";
  if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
    return "Invalid email address";
  }

  // Phone (exactly 10 digits, numbers only)
  if (!shippingInfo.phone.trim()) return "Phone is required";
  if (!/^\d{10,}$/.test(shippingInfo.phone)) {
    return "Phone must be at least 10 digits";
  }

  // Address
  if (!shippingInfo.address.trim()) return "Address is required";

  // City (letters + spaces allowed)
  if (!shippingInfo.city.trim()) return "City is required";
  if (!/^[A-Za-z\s]+$/.test(shippingInfo.city.trim())) {
    return "City must contain only letters";
  }

  // ZIP (exactly 5 digits)
  if (!shippingInfo.zip.trim()) return "ZIP is required";
  if (!/^\d{5,}$/.test(shippingInfo.zip)) {
    return "ZIP must be minimum 5 digits";
  }

  // Country
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

  // ---------------- STRIPE PAYMENT ----------------
  const handlePayment = async () => {
  setError("");

  const validationError = validateShipping();
  if (validationError) {
    setError(validationError);
    return;
  }

  setSubmitting(true);

  try {
    const payload = {
      items: orderData,
      shippingInfo,
      subtotal,
      estimatedTax: tax,
      totalAmount: total,
      form: { email: shippingInfo.email },
      ownerId: String(user?._id || guest?._id),
      ownerType: user ? "User" : "Guest",
    };

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/payment/create-checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: safeStringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Stripe session creation failed");
    }

    if (!data.url) {
      throw new Error("Stripe URL not returned from backend");
    }

    // IMPORTANT: redirect first
    window.location.href = data.url;

  } catch (err) {
    setError(err.message);
    setSubmitting(false);
  }
};

  if (loading) return null;

  const countries = ["United States","Canada","United Kingdom","Australia","India"];

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
          {orderData.map((item, index) => (
            <tr key={index}>
              <td><input value={item.styleNo || "N/A"} readOnly /></td>
              <td><input value={item.description || item.name} readOnly /></td>

              <td>
                <input
                  value={item.size || "N/A"}
                  onChange={(e) =>
                    handleItemChange(index, "size", e.target.value)
                  }
                />
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
          ))}
        </tbody>
      </table>

      <div className="po-container">

        <div className="po-left">
          <h3>Shipping Information</h3>

          <input placeholder="First Name"
            value={shippingInfo.firstName}
            onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })} />

          <input placeholder="Last Name"
            value={shippingInfo.lastName}
            onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })} />

          <input placeholder="Email"
            value={shippingInfo.email}
            onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })} />

          <input placeholder="Phone"
            value={shippingInfo.phone}
            onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })} />

          <input placeholder="Address"
            value={shippingInfo.address}
            onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} />

          <input placeholder="City"
            value={shippingInfo.city}
            onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })} />

          <input placeholder="ZIP"
            value={shippingInfo.zip}
            onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })} />

          <select className="checkout-country-select"
            value={shippingInfo.country}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, country: e.target.value })
            }
          >
            <option value="">Select Country</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="po-right">
          <h3>Summary</h3>

          {orderData.map((item, index) => (
            <div key={index}>
              
              {/* ✅ ADDED IMAGE ONLY */}
              <img
                src={item.image || item.images?.[0] || "/images/placeholder.png"}
                alt={item.name || "Product"}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "5px",
                  marginBottom: "5px",
                  border: "1px solid #ccc",
                }}
              />

              <p>{item.name}</p>
              <p>{getQty(item)} x {getPrice(item)}</p>
            </div>
          ))}

          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Tax: ${tax.toFixed(2)}</p>
          <p>Fee: ${processingFee.toFixed(2)}</p>

          <h3>Total: ${total.toFixed(2)}</h3>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button className="checkout-submit-btn" onClick={handlePayment} disabled={submitting}>
            {submitting ? "Redirecting..." : "Submit Purchase Order"}
          </button>
        </div>

      </div>
    </div>
  );
}