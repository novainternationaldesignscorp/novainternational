// src/pages/OrderConfirmation.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePO } from "../context/PurchaseOrderContext";
import "./CSS/orderConfirmation.css";

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  
  const { clearPO } = usePO();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found in the URL.");
      setLoading(false);
      return;
    }

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchOrderWithRetry = async () => {
      const maxAttempts = 6;
      const retryDelayMs = 1200;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/order/${sessionId}`, {
          credentials: "include",
        });

        const payload = await res.json().catch(() => ({}));

        if (res.ok) {
          return payload;
        }

        if (res.status === 404 && attempt < maxAttempts) {
          await wait(retryDelayMs);
          continue;
        }

        if (res.status === 404) {
          throw new Error(payload.error || "Order not found for this session.");
        }

        const detailText = payload.details ? ` ${payload.details}` : "";
        throw new Error(
          payload.error || `Failed to fetch order. Status: ${res.status}.${detailText}`
        );
      }

      throw new Error("Unable to fetch order confirmation.");
    };

    const fetchOrder = async () => {
      try {
        const data = await fetchOrderWithRetry();

        if (!data) throw new Error("Order data is empty.");

        setOrder(data);

        // Clear only cart/draft data; keep user/guest authenticated.
        clearPO();
      } catch (err) {
        console.error("Fetch order error:", err);
        setError(err.message || "Failed to fetch order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId, import.meta.env.VITE_API_URL, clearPO]);

  useEffect(() => {
    if (loading || error || !order) return undefined;

    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading, error, order, navigate]);

  // Loading state
  if (loading) return <div className="loading">Loading your order...</div>;

  // Error state
  if (error)
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );

  // Safe rendering with defaults
  const items = order.items || [];
  const shipping = order.shippingInfo || {};

  return (
    <div className="order-confirmation">
      <h2>
        Thank you for your order {order.customerName || order.form?.customerName}!
      </h2>
      <p><strong>Purchase Order ID:</strong> {order.purchaseOrderId || order._id || "N/A"}</p>
      <p className="success-text">Your payment was successful.</p>

      <div className="order-summary">
        <div className="order-meta">
          <div>
            <span>Order Total:</span> ${order.totalAmount?.toFixed(2) || "0.00"}
          </div>
        </div>

        <ul className="order-items">
          {items.length ? (
            items.map((item, idx) => (
              <li className="order-item" key={idx}>
                <div className="item-name">{item.description || item.name || "Item"}</div>
                <div className="item-qty">x {item.qty || 1}</div>
                <div className="item-total">
                  ${((item.qty || 1) * (item.price || 0)).toFixed(2)}
                </div>
              </li>
            ))
          ) : (
            <li>No items found in this order.</li>
          )}
        </ul>

        <div className="order-total">
          <span>Total</span>
          <span>${order.totalAmount?.toFixed(2) || "0.00"}</span>
        </div>
      </div>

      {shipping.name && (
        <div className="shipping-info">
          <h4>Shipping Information</h4>
          <p>{shipping.name}</p>
          <p>{shipping.address}</p>
          <p>{shipping.city}, {shipping.postalCode}</p>
          <p>{shipping.country}</p>
        </div>
      )}

      <div className="back-home">
        <button onClick={() => navigate("/")}>Back to Home</button>
        <p>You will be redirected to Home in 5 seconds.</p>
      </div>
    </div>
  );
}
