import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useGuest } from "../context/GuestContext";
import { usePO } from "../context/PurchaseOrderContext.jsx";
import "./CSS/PurchaseOrderForm.css";

export default function PurchaseOrderForm({ items }) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { guest } = useGuest();
  const { poItems, clearPO, removeFromPO } = usePO();

  const [authChecked, setAuthChecked] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNo: "",
    routingNo: "",
    email: "",
    customerName: "",
    attn: "",
    address: "",
    tel: "",
    fax: "",
    notes: ""
  });
  const [formError, setFormError] = useState("");
  const [orderItems, setOrderItems] = useState([]);

  // Check login status
  useEffect(() => {
    if (user || guest) setAuthChecked(true);
    else navigate("/signin");
  }, [user, guest, navigate]);

  // Load items from summary page
  useEffect(() => {
    const source = items && items.length > 0 ? items : poItems;
    if (source && source.length > 0) {
      setOrderItems(
        source.map((item) => ({
          productId: item.productId || item.styleNo,
          styleNo: item.styleNo || item.productId,
          name: item.name || item.description || "",
          description: item.name || item.description,
          color: item.color || "",
          size: item.size || "",
          qty: item.quantity ?? item.qty ?? 0,
          price: item.price || 0,
          image:
            item.image ||
            item.imageUrl ||
            item.thumbnail ||
            item.images?.[0] ||
            null,
          total: (item.quantity ?? item.qty ?? 0) * (item.price || 0),
        }))
      );
    }
  }, [items, poItems]);

  // Pre-fill form with user/guest data
  useEffect(() => {
    if (user || guest) {
      setFormData((prev) => ({
        ...prev,
        customerName: user?.name || guest?.name || "",
        email: user?.email || guest?.email || "",
      }));
    }
  }, [user, guest]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "email") setFormError("");
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    if (field === "qty" || field === "price") {
      updated[index].total =
        (updated[index].qty || 0) * (updated[index].price || 0);
    }
    setOrderItems(updated);
  };

  const removeRow = async (index) => {
    const item = orderItems[index];
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
    const productId = item.productId || item.styleNo;
    if (productId) {
      try {
        await removeFromPO({ productId, color: item.color, size: item.size });
      } catch (err) {
        console.error("Failed to remove PO item:", err);
        setFormError("Failed to remove item from Purchase Order");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(formData.email).toLowerCase())) {
        setFormError("Please enter a valid email address.");
        return;
      }
    }
    const totalAmount = orderItems.reduce(
      (sum, it) => sum + (it.qty || 0) * (it.price || 0),
      0
    );
    navigate("/checkout", { state: { items: orderItems, form: formData, totalAmount } });
  };

  if (!authChecked) return <p>Checking login status...</p>;
  if (orderItems.length === 0) return <p>No items in Purchase Order.</p>;

  return (
      <div className="purchase-order-form">
        <div className="business-log-purchase"><img src="/images/logo.png" alt="Company Logo" /></div>
        <h2>Purchase Order</h2>

        <div className="po-left">
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
              {orderItems.map((item, index) => (
                <tr key={index}>
                  <td><input value={item.styleNo} readOnly /></td>
                  <td><input value={item.description} readOnly /></td>
                  <td><input value={item.size} onChange={(e) => handleItemChange(index, "size", e.target.value)} /></td>
                  <td><input value={item.color} onChange={(e) => handleItemChange(index, "color", e.target.value)} /></td>
                  <td><input type="number" value={item.qty} onChange={(e) => handleItemChange(index, "qty", Number(e.target.value))} min={0} /></td>
                  <td><input type="number" value={item.price} readOnly /></td>
                  <td><input value={item.total} readOnly /></td>
                  <td><button type="button" onClick={() => removeRow(index)}>X</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="po-container">
          
          <form onSubmit={handleSubmit}>
            <div className="po-right po-form-section">  

              {/* LEFT: Business Details */}         
                {/* <h3>BUSINESS DETAILS</h3>
                <div className="input-row">
                  <input name="customerName" placeholder="Customer Name" value={formData.customerName} onChange={handleChange} required />
                  <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                  <input name="attn" placeholder="ATTN" value={formData.attn} onChange={handleChange} required />
                  <input name="tel" placeholder="Telephone" value={formData.tel} onChange={handleChange} required />
                  <input name="fax" placeholder="Fax" value={formData.fax} onChange={handleChange} />
                  <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                </div> */}
                {/* RIGHT: Bank Details */}
                {/* <div className="po-left po-form-section">      
                    <h3>BANK DETAILS</h3>
                    <div className="input-row">
                      <input name="bankName" placeholder="Bank Name" value={formData.bankName} onChange={handleChange} required />
                      <input name="accountNo" placeholder="A/C Number" value={formData.accountNo} onChange={handleChange} required />
                      <input name="routingNo" placeholder="Routing Number" value={formData.routingNo} onChange={handleChange} required />
                    </div>
                </div>   */}

                {formError && <p className="po-form-error">{formError}</p>}

                <div>
                  <strong>Grand Total: $</strong>
                  <strong>{orderItems.reduce((sum, it) => sum + (it.qty || 0) * (it.price || 0), 0).toFixed(2)}</strong>
                </div>

                <button type="submit">Proceed to Checkout</button>   
              </div>    
            </form>
          </div>
      </div>
    
  );
}
