import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGuest } from "../context/GuestContext.jsx";
import { usePO } from "../context/PurchaseOrderContext.jsx";
import "./CSS/checkout.css";

const CheckoutGuest = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setGuest, endGuestSession } = useGuest();
  const { clearPO } = usePO();

  const handleGuestCheckout = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Validation
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const guestRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/guests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
          }),
        }
      );

      const guestData = await guestRes.json();

      if (!guestRes.ok) {
        throw new Error(guestData.error || "Failed to create guest session");
      }

      // ✅ Save guest globally
      setGuest(guestData.guest);

      // ✅ Reset any previous cart/PO
      clearPO();

      // ✅ Go shopping → then Checkout.jsx handles Square
      navigate("/checkout");

    } catch (err) {
      console.error("Guest checkout error:", err);
      setError(err.message || "Failed to proceed as guest.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearGuest = () => {
    if (endGuestSession) {
      endGuestSession();
      clearPO();
      navigate("/");
    }
  };

  return (
    <div className="purchase-order-form">
      <h2>Checkout as Guest</h2>

      <div className="po-container">
        <div className="po-left">
          <form onSubmit={handleGuestCheckout}>
            
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p className="po-form-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Proceeding..." : "Continue to Checkout"}
            </button>

            {/* <button
              type="button"
              onClick={handleClearGuest}
              style={{ marginTop: "10px", background: "#555" }}
            >
              Cancel Guest Checkout
            </button> */}

          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutGuest;