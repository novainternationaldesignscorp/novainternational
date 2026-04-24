import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useGuest } from "../context/GuestContext";
import "./CSS/orderConfirmation.css"; 

export default function PurchaseHistory() {
  const { user, getToken } = useContext(UserContext);
  const { guest } = useGuest();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user && !guest) {
      setError("Please log in or proceed as guest to view orders");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        let res;

        if (user) {
          // Authenticated user - use Authorization header
          const token = getToken();
          if (!token) {
            throw new Error("Authentication required. Please log in again.");
          }

          res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } else {
          // Guest user - use sessionId in query params
          res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/guest/${guest._id}?sessionId=${encodeURIComponent(
            guest.sessionId || ""
          )}`, { credentials: "include" });
        }

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please log in again.");
          }
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, guest, getToken]);

  if (loading) return <div style={{ padding: "2rem" }}>Loading your orders...</div>;
  if (error) return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;

  if (!orders || orders.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Purchase History</h2>
        <p>You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Your Purchase History</h2>
      <p>
        {user
          ? `Welcome, ${user.name}!`
          : guest
          ? `Welcome, ${guest.name}!`
          : "Guest"}
      </p>

      <div style={{ marginTop: "2rem" }}>
        {orders.map((order, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
              backgroundColor: "#f9f9f9",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h3>Purchase Order ID #{order.purchaseOrderId || order._id?.toString().slice(0, 8)}</h3>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
                  Order Purchase on: {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0", fontSize: "1.2rem", fontWeight: "bold" }}>
                  ${order.totalAmount?.toFixed(2) || "0.00"}
                </p>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
                  {order.items?.length || 0} items
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ marginBottom: "0.5rem" }}>Items</h4>
              <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                {order.items?.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    style={{
                      padding: "0.5rem 0",
                      borderBottom: "1px solid #eee",
                      fontSize: "0.95rem",
                    }}
                  >
                    <span>{item.description || item.name}</span>
                    {item.color && <span> - {item.color}</span>}
                    {item.size && <span> - {item.size}</span>}
                    <span> x {item.qty || item.quantity}</span>
                    <span style={{ float: "right" }}>
                      ${((item.qty || item.quantity) * item.price).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {order.shippingInfo && (
              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ marginBottom: "0.5rem" }}>Shipping Address</h4>
                <p style={{ margin: "0", fontSize: "0.95rem" }}>
                  {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                  <br />
                  {order.shippingInfo.address}
                  <br />
                  {order.shippingInfo.city}, {order.shippingInfo.zip || order.shippingInfo.postalCode}
                  <br />
                  {order.shippingInfo.country}
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
              <div>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
                  <strong>Status:</strong> <span style={{ textTransform: "capitalize", color: order.paymentStatus === "paid" ? "#4caf50" : "#ff9800" }}>{order.paymentStatus}</span>
                </p>
                {order.paymentMethod && (
                  <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
                    <strong>Payment Method:</strong> {order.paymentMethod}
                  </p>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
                  Order ID: <code>{order._id?.toString().slice(0, 12)}...</code>
                </p>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
                  Purchase Order ID: <code>{order.purchaseOrderId}</code>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
