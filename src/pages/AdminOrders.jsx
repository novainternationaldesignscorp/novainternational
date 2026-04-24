import React, { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/purchase-order`,
        {
          credentials: "include", // 🔐 important for admin auth later
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load orders");
      }

      setOrders(data.orders || data);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ---------------- UI STATES ----------------

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={fetchOrders}>Retry</button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div style={{ padding: 20 }}>
        <h2>All Purchase Orders</h2>
        <p>No orders found.</p>
      </div>
    );
  }

  // ---------------- MAIN TABLE ----------------

  return (
    <div style={{ padding: 20 }}>
      <h2>All Purchase Orders</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o._id} style={{ borderTop: "1px solid #eee" }}>
              <td>{o._id}</td>

              <td>
                {o.customerName ||
                  o.shippingInfo?.firstName + " " + o.shippingInfo?.lastName ||
                  "N/A"}
              </td>

              <td>{o.email || o.shippingInfo?.email || "N/A"}</td>

              <td>{o.items?.length || 0}</td>

              <td>${o.totalAmount?.toFixed(2) || "0.00"}</td>

              <td>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    background:
                      o.paymentStatus === "COMPLETED"
                        ? "#d4f8d4"
                        : "#fff3cd",
                  }}
                >
                  {o.paymentStatus || "PENDING"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}