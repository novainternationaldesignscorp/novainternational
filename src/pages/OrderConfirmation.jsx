import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CSS/orderConfirmation.css";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Order not found");
        }

        setOrder(data);

        // ✅ Draft is already cleared by backend during payment processing

      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!loading && order) {
      const timer = setTimeout(() => navigate("/"), 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, order, navigate]);

  if (loading) return <div className="loading">Loading your order...</div>;

  if (error)
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );

  const items = order.items || [];
  const shipping = order.shippingInfo || {};
  const customerName = shipping.firstName && shipping.lastName 
    ? `${shipping.firstName} ${shipping.lastName}` 
    : order.customerName || "Customer";

  return (
    <div className="order-confirmation">
      <h2>Thank you for your order {customerName}!</h2>

      <p>
        <strong>Purchase Order ID:</strong> {order.purchaseOrderId || order._id}
      </p>

      <p className="success-text">Your payment was successful.</p>

      <div className="order-summary">
        <p><strong>Total:</strong> ${order.totalAmount?.toFixed(2)}</p>

        <ul>
          {items.map((item, idx) => (
            <li key={idx}>
              {item.styleNo || item.name || "Item"} × {item.qty} = $
              {(item.qty * item.price).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      {shipping.address && (
        <div className="shipping-info">
          <h4>Shipping Address</h4>
          <p>
            {shipping.firstName} {shipping.lastName}<br/>
            {shipping.address}<br/>
            {shipping.city}, {shipping.zip}<br/>
            {shipping.country}
          </p>
        </div>
      )}

      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}