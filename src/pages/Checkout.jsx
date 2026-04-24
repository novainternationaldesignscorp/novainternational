import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./CSS/checkout.css";
import { usePO } from "../context/PurchaseOrderContext.jsx";
import { useGuest } from "../context/GuestContext.jsx";
import { UserContext } from "../context/UserContext.jsx";

const TAX_RATE = 0.11;
const PROCESSING_FEE_RATE = 0.05;

const getQty = (item) => Number(item.qty ?? item.quantity ?? 0);
const getPrice = (item) => Number(item.price ?? item.unitPrice ?? 0);

// ✅ Safe JSON (fix BigInt crash)
const safeStringify = (obj) =>
  JSON.stringify(obj, (_, value) =>
    typeof value === "bigint" ? value.toString() : value
  );

// ✅ Load Square SDK once
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
  const location = useLocation();
  const navigate = useNavigate();

  const { guest } = useGuest();
  const { user, loading } = useContext(UserContext);
  const { poItems, clearPO } = usePO();

  const { items = [], form = {} } = location.state || {};

  const [orderData, setOrderData] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cardRef = useRef(null);
  const squareLoaded = useRef(false); // prevents double init

  // ------------------------
  // AUTH CHECK
  // ------------------------
  useEffect(() => {
    if (!loading) {
      if (!user && !guest) navigate("/checkout-guest");
      if (!items.length && !poItems.length) navigate("/");
    }
  }, [user, guest, loading]);

  // ------------------------
  // ORDER DATA
  // ------------------------
  useEffect(() => {
    const source = poItems?.length ? poItems : items;

    setOrderData(
      (source || []).map((item) => ({
        ...item,
        qty: item.quantity ?? item.qty ?? 0,
      }))
    );
  }, [poItems, items]);

  // ------------------------
  // SHIPPING
  // ------------------------
  const [shippingInfo, setShippingInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    setShippingInfo((prev) => ({
      ...prev,
      email: prev.email || form?.email || user?.email || guest?.email || "",
      firstName: prev.firstName || form?.firstName || user?.name?.split(" ")[0] || "",
      lastName: prev.lastName || form?.lastName || user?.name?.split(" ")[1] || "",
    }));
  }, [form, user, guest]);

  // ------------------------
  // CALCULATIONS
  // ------------------------
  const subtotal = useMemo(
    () => orderData.reduce((acc, i) => acc + getQty(i) * getPrice(i), 0),
    [orderData]
  );

  const tax = subtotal * TAX_RATE;
  const processingFee = subtotal * PROCESSING_FEE_RATE;
  const total = subtotal + tax + processingFee;

  // ------------------------
  // SQUARE INIT (FIXED)
  // ------------------------
  useEffect(() => {
    const initSquare = async () => {
      try {
        if (squareLoaded.current) return;
        squareLoaded.current = true;

        const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

        console.log("ENV CHECK:", { appId, locationId });

        if (!appId || !locationId) {
          throw new Error("Missing Square credentials in .env");
        }

        await loadSquareScript();

        if (!window.Square) {
          throw new Error("Square SDK failed to load");
        }

        const payments = window.Square.payments(appId, locationId);

        const card = await payments.card();
        await card.attach("#card-container");

        cardRef.current = card;
      } catch (err) {
        console.error("Square init error:", err);
        setError("Payment system not ready");
      }
    };

    initSquare();
  }, []);

  // ------------------------
  // PAYMENT
  // ------------------------
  const handlePayment = async () => {
    setError("");

    if (!cardRef.current) {
      setError("Payment system not ready");
      return;
    }

    setSubmitting(true);

    try {
      const result = await cardRef.current.tokenize();

      console.log("Square tokenize result:", result);

      if (result.status !== "OK") {
        throw new Error(
          result.errors?.[0]?.message || "Card tokenization failed"
        );
      }

      const payload = {
        token: result.token,
        orderData,
        subtotal,
        tax,
        processingFee,
        total,
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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Payment failed");
      }

      if (!data?.order?._id) {
        throw new Error("Order not created properly");
      }

      // Clear the cart after successful payment
      clearPO();

    navigate(`/order-confirmation/${data.order._id}`);
    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      setError(err.message);
    }

    setSubmitting(false);
  };

  if (loading) return null;
  if (!user && !guest) return null;

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="po-container">
        <div className="po-left">
          <h3>Shipping Information</h3>
          
          <input
            name="firstName"
            placeholder="First Name"
            value={shippingInfo.firstName}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, firstName: e.target.value })
            }
          />
          
          <input
            name="lastName"
            placeholder="Last Name"
            value={shippingInfo.lastName}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, lastName: e.target.value })
            }
          />
          
          <input
            name="email"
            placeholder="Email"
            value={shippingInfo.email}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, email: e.target.value })
            }
          />
          
          <input
            name="address"
            placeholder="Street Address"
            value={shippingInfo.address}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, address: e.target.value })
            }
          />
          
          <input
            name="city"
            placeholder="City"
            value={shippingInfo.city}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, city: e.target.value })
            }
          />
          
          <input
            name="zip"
            placeholder="ZIP Code"
            value={shippingInfo.zip}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, zip: e.target.value })
            }
          />
          
          <input
            name="country"
            placeholder="Country"
            value={shippingInfo.country}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, country: e.target.value })
            }
          />
        </div>

        <div className="po-right">
          <h3>Order Summary</h3>

          {orderData.map((item, i) => (
            <p key={i}>
              {item.name} × {getQty(item)} = $
              {(getQty(item) * getPrice(item)).toFixed(2)}
            </p>
          ))}

          <hr />

          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Tax (11%): ${tax.toFixed(2)}</p>
          <p>Processing Fee (5%): ${processingFee.toFixed(2)}</p>

          <h3>Total: ${total.toFixed(2)}</h3>

          <div id="card-container" />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button className="paynow-btn" onClick={handlePayment} disabled={submitting}>
            {submitting ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}