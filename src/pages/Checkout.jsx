import React, { useEffect, useState, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CSS/checkout.css";

import { usePO } from "../context/PurchaseOrderContext.jsx";
import { useGuest } from "../context/GuestContext.jsx";
import { UserContext } from "../context/UserContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const TAX_RATE = 0.07;
const SHIPPING_FLAT = 15;
const FREE_SHIPPING_THRESHOLD = 500;

const getQty = (item) => Number(item.qty ?? item.quantity ?? 0);
const getPrice = (item) => Number(item.price ?? item.unitPrice ?? 0);

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { guest, endGuestSession } = useGuest();
  const { user, loading } = useContext(UserContext);
  const { purchaseOrderId, removeFromPO, updatePOItemQty } = usePO();

  const { items = [], form = {} } = location.state || {};
  const [orderData, setOrderData] = useState(items);

  const [shippingInfo, setShippingInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user && !guest) navigate("/checkout-guest");
      if (!items.length) navigate("/");
    }
  }, [user, guest, loading, navigate, items]);

  useEffect(() => {
    setShippingInfo((prev) => ({
      ...prev,
      email: prev.email || form?.email || user?.email || guest?.email || "",
    }));
  }, [form, user, guest]);

  // ------------------------
  // CALCULATIONS
  // ------------------------
  const subtotal = useMemo(
    () => orderData.reduce((acc, item) => acc + getQty(item) * getPrice(item), 0),
    [orderData]
  );

  const shippingCost = subtotal <= 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const estimatedTax = subtotal <= 0 ? 0 : (subtotal + shippingCost) * TAX_RATE;
  const total = subtotal + shippingCost + estimatedTax;

  // ------------------------
  // VALIDATION
  // ------------------------
  const validateFields = () => {
    const errors = {};

    if (!shippingInfo.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!shippingInfo.firstName.trim()) {
      errors.firstName = "First name is required.";
    } else if (!/^[a-zA-Z\s'-]{2,30}$/.test(shippingInfo.firstName)) {
      errors.firstName = "First name must be 2–30 letters only.";
    }

    if (shippingInfo.lastName && !/^[a-zA-Z\s'-]{2,30}$/.test(shippingInfo.lastName)) {
      errors.lastName = "Last name must be 2–30 letters only.";
    }

    if (!shippingInfo.address.trim()) {
      errors.address = "Address is required.";
    } else if (shippingInfo.address.length < 5) {
      errors.address = "Address is too short.";
    }

    if (!shippingInfo.city.trim()) {
      errors.city = "City is required.";
    }

    if (shippingInfo.state && shippingInfo.state.length < 2) {
      errors.state = "State must be at least 2 characters.";
    }

    if (!shippingInfo.zip.trim()) {
      errors.zip = "ZIP code is required.";
    } else if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(shippingInfo.zip)) {
      errors.zip = "Invalid ZIP code format.";
    }

    if (!shippingInfo.country.trim()) {
      errors.country = "Country is required.";
    }

    if (shippingInfo.phone && !/^[0-9+\-\s()]{7,20}$/.test(shippingInfo.phone)) {
      errors.phone = "Invalid phone number.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleQtyChange = async (index, value) => {
    const nextQty = Math.max(1, Number(value) || 1);
    const targetItem = orderData[index];
    if (!targetItem) return;

    const previousQty = getQty(targetItem);

    setOrderData((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              qty: nextQty,
              quantity: nextQty,
            }
          : item
      )
    );

    try {
      const updatedItems = await updatePOItemQty({
        productId: targetItem.productId || targetItem.styleNo,
        color: targetItem.color || null,
        size: targetItem.size || null,
        qty: nextQty,
      });

      if (Array.isArray(updatedItems)) {
        setOrderData(
          updatedItems.map((item) => ({
            ...item,
            qty: item.quantity ?? item.qty ?? 0,
          }))
        );
      }

      setError("");
    } catch (err) {
      setOrderData((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                qty: previousQty,
                quantity: previousQty,
              }
            : item
        )
      );
      setError(err.message || "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (index) => {
    const targetItem = orderData[index];
    if (!targetItem) return;

    const previousItems = orderData;
    setOrderData((prev) => prev.filter((_, i) => i !== index));

    try {
      const updatedItems = await removeFromPO({
        productId: targetItem.productId || targetItem.styleNo,
        color: targetItem.color || null,
        size: targetItem.size || null,
      });

      if (Array.isArray(updatedItems)) {
        setOrderData(
          updatedItems.map((item) => ({
            ...item,
            qty: item.quantity ?? item.qty ?? 0,
          }))
        );
      }

      setError("");
    } catch (err) {
      setOrderData(previousItems);
      setError(err.message || "Failed to remove item");
    }
  };

  // ------------------------
  // CHECKOUT
  // ------------------------
  const handleStripeCheckout = async () => {
    setError("");

    if (!validateFields()) return;

    setSubmitting(true);

    try {
      const sessionRes = await fetch(
        `${API_URL}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: orderData,
            purchaseOrderId,
            shippingCost,
            estimatedTax,
            subtotal,
            totalAmount: total,
            shippingInfo,
            form: {
              ...form,
              email: shippingInfo.email,
            },
            ownerType: guest ? "Guest" : "User",
            ownerId: guest?._id || user?._id,
          }),
        }
      );

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok)
        throw new Error(sessionData.error || "Stripe session creation failed");

      if (guest && endGuestSession) endGuestSession();

      window.location.assign(sessionData.url);
    } catch (err) {
      setError(err.message || "Checkout failed");
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!user && !guest) return null;

  return (
    <div className="purchase-order-form">
      <h2>Checkout</h2>

      <div className="po-container">
        <div className="po-left po-form-section">
          <h3>Shipping Details</h3>

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={shippingInfo.email}
            onChange={handleInputChange}
          />
          {fieldErrors.email && (
            <p className="field-error">{fieldErrors.email}</p>
          )}

          <div className="input-row">
            <div>
              <input
                name="firstName"
                placeholder="First Name"
                value={shippingInfo.firstName}
                onChange={handleInputChange}
              />
              {fieldErrors.firstName && (
                <p className="field-error">{fieldErrors.firstName}</p>
              )}
            </div>

            <div>
              <input
                name="lastName"
                placeholder="Last Name"
                value={shippingInfo.lastName}
                onChange={handleInputChange}
              />
              {fieldErrors.lastName && (
                <p className="field-error">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          <input
            name="company"
            placeholder="Company"
            value={shippingInfo.company}
            onChange={handleInputChange}
          />

          <textarea
            name="address"
            placeholder="Address"
            value={shippingInfo.address}
            onChange={handleInputChange}
          />
          {fieldErrors.address && (
            <p className="field-error">{fieldErrors.address}</p>
          )}

          <div className="input-row">
            <div>
              <input
                name="city"
                placeholder="City"
                value={shippingInfo.city}
                onChange={handleInputChange}
              />
              {fieldErrors.city && (
                <p className="field-error">{fieldErrors.city}</p>
              )}
            </div>

            <div>
              <input
                name="state"
                placeholder="State"
                value={shippingInfo.state}
                onChange={handleInputChange}
              />
              {fieldErrors.state && (
                <p className="field-error">{fieldErrors.state}</p>
              )}
            </div>
          </div>

          <div className="input-row">
            <div>
              <input
                name="zip"
                placeholder="ZIP Code"
                value={shippingInfo.zip}
                onChange={handleInputChange}
              />
              {fieldErrors.zip && (
                <p className="field-error">{fieldErrors.zip}</p>
              )}
            </div>

            <div>
              <input
                name="country"
                placeholder="Country"
                value={shippingInfo.country}
                onChange={handleInputChange}
              />
              {fieldErrors.country && (
                <p className="field-error">{fieldErrors.country}</p>
              )}
            </div>
          </div>

          <input
            name="phone"
            placeholder="Phone"
            value={shippingInfo.phone}
            onChange={handleInputChange}
          />
          {fieldErrors.phone && (
            <p className="field-error">{fieldErrors.phone}</p>
          )}
        </div>

        <div className="po-right po-form-section">
          <h3>Purchase Order Summary</h3>

          {!orderData.length && (
            <p className="checkout-empty-summary">No items in checkout summary.</p>
          )}

          <div className="checkout-summary-items">
            {orderData.map((item, idx) => {
              const qty = getQty(item);
              const imageSrc =
                item.image ||
                item.imageUrl ||
                item.thumbnail ||
                item.images?.[0] ||
                "/images/no-image.png";
              const productName = item.name || item.description || "Product";

              return (
                <div className="checkout-summary-item" key={`${item.productId || item.styleNo || productName || "item"}-${idx}`}>
                  <img
                    src={imageSrc}
                    alt={productName}
                    className="checkout-summary-thumb"
                  />

                  <div className="checkout-summary-details">
                    <p className="checkout-summary-name">{productName}</p>
                    <div className="checkout-summary-actions">
                      <label className="checkout-qty-wrap">
                        <span className="checkout-summary-meta">Qty</span>
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          className="checkout-qty-input"
                        />
                      </label>

                      <button
                        type="button"
                        className="checkout-remove-btn"
                        onClick={() => handleRemoveItem(idx)}>X</button>
                    </div>
                  </div>

                  <p className="checkout-summary-line-total">
                    ${(qty * getPrice(item)).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Estimated Tax</span>
            <span>${estimatedTax.toFixed(2)}</span>
          </div>

          <hr />

          <div className="grand-total">
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>

          {error && <p className="po-form-error">{error}</p>}

          <button
            type="button"
            onClick={handleStripeCheckout}
            disabled={submitting || !orderData.length}
          >
            {submitting ? "Redirecting..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;