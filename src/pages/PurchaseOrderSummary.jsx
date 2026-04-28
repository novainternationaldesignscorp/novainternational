import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useGuest } from "../context/GuestContext";
import { useNavigate } from "react-router-dom";

function PurchaseOrderSummary() {
  const { user } = useContext(UserContext);
  const { guest } = useGuest();
  const navigate = useNavigate();
  const [po, setPO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user && !guest) {
      // alert("Please log in or proceed as guest");
      navigate("/signin");
      return;
    }

    const fetchPO = async () => {
      try {
        // Determine which endpoint to use
        const ownerType = user ? "User" : "Guest";
        const ownerId = user?._id || guest?._id;
        const endpoint = `${import.meta.env.VITE_API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch purchase order");

        const data = await res.json();
        setPO(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPO();
  }, [user, guest, navigate]);

  if (loading) return <p>Loading Purchase Order...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!po || !po.items.length) {
    return (
      <div>
        <h2>Your Purchase Order is empty.</h2>
        <button onClick={() => navigate("/")}>Continue Shopping</button>
      </div>
    );
  }

  const totalPrice = po.items.reduce(
    (acc, item) => acc + (item.qty || item.quantity) * item.price,
    0
  );

  return (
    <div className="purchase-order-summary">
      <h1>Your Purchase Order</h1>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Color</th>
            <th>Size</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {po.items.map((item, idx) => {
            const qty = item.qty || item.quantity;
            return (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.color || "-"}</td>
                <td>{item.size || "-"}</td>
                <td>{qty}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(qty * item.price).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h3>Total: ${totalPrice.toFixed(2)}</h3>
      <button onClick={() => navigate("/purchase-order")}>Confirm Order</button>
      <button onClick={() => navigate("/")}>Continue Shopping</button>
    </div>
  );
}

export default PurchaseOrderSummary;
