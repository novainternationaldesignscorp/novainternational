import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePO } from "../context/PurchaseOrderContext.jsx";
import { useGuest } from "../context/GuestContext.jsx";
import { UserContext } from "../context/UserContext";
import "./CSS/purchaseorder.css";

function PurchaseOrder() {
  const { user, loading } = useContext(UserContext);
  const { guest } = useGuest();
  const navigate = useNavigate();
  const { poItems, removeFromPO } = usePO();

  const [error, setError] = useState("");
  const [removingKey, setRemovingKey] = useState("");

  // ✅ Safe redirect (production correct)
  useEffect(() => {
    if (!loading && !user && !guest) {
      navigate("/signin");
    }
  }, [user, guest, loading, navigate]);

  // ✅ Block render until auth resolved (prevents flicker)
  if (loading) return <p className="po-loading">Checking login status...</p>;

  if (!user && !guest) return null;

  if (!poItems || poItems.length === 0) {
    return <p className="po-empty">No items added in Purchase Order.</p>;
  }

  const totalAmount = poItems.reduce((acc, item) => {
    const qty = item.quantity ?? item.qty ?? 0;
    return acc + (item.price || 0) * qty;
  }, 0);

  const handleRemove = async (item) => {
    setError("");

    const productId = item.productId || item.styleNo;

    if (!productId) {
      setError("Missing product id. Please refresh and try again.");
      return;
    }

    const key = `${productId}|${item.color || ""}|${item.size || ""}`;

    try {
      setRemovingKey(key);
      await removeFromPO({
        productId,
        color: item.color,
        size: item.size,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to remove item");
    } finally {
      setRemovingKey("");
    }
  };

  return (
    <div className="purchase-order-page">

      <div className="business-log-purchase">
        <img src="/images/logo.png" alt="Company Logo" />
      </div>

      <h1 className="po-title">Purchase Order</h1>

      {error && <p className="po-error">{error}</p>}

      <div className="po-table-wrapper">
        <table className="po-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Color</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {poItems.map((item, idx) => {
              const qty = item.quantity ?? item.qty ?? 0;

              const itemKey = `${item.productId || item.styleNo || idx}|${item.color || ""}|${item.size || ""}`;
              const isRemoving = removingKey === itemKey;

              return (
                <tr key={itemKey}>
                  <td>{item.name}</td>
                  <td>{item.color || "-"}</td>
                  <td>{item.size || "-"}</td>
                  <td>{qty}</td>
                  <td>${(item.price || 0).toFixed(2)}</td>
                  <td>${((item.price || 0) * qty).toFixed(2)}</td>

                  <td>
                    <button
                      className="po-remove-btn"
                      onClick={() => handleRemove(item)}
                      disabled={isRemoving}
                    >
                      {isRemoving ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      <h2 className="po-total">
        Total: ${totalAmount.toFixed(2)}
      </h2>

      <div className="po-actions">
        <button
          className="confirm-order-btn"
          disabled={!poItems.length}
          onClick={() => navigate("/purchase-order/form")}
        >
          Confirm Order & Checkout
        </button>

        <a
          href="mailto:ritika@novainternationaldesigns.com?subject=Need%20Help%20with%20Purchase%20Order"
          className="po-help-link"
        >
          Need Help?
        </a>
      </div>

    </div>
  );
}

export default PurchaseOrder;