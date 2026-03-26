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
  const { poItems, clearPO, removeFromPO, updatePOItemSize, updatePOItemQty } = usePO();

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
  const [sizeOptionsByProduct, setSizeOptionsByProduct] = useState({});
  const [minQtyByProduct, setMinQtyByProduct] = useState({});
  const [productLookupByKey, setProductLookupByKey] = useState({});

  // Check login status
  useEffect(() => {
    if (user || guest) setAuthChecked(true);
    else navigate("/signin");
  }, [user, guest, navigate]);

  // Load items from summary page
  useEffect(() => {
    const source = items && items.length > 0 ? items : poItems;
    if (source && source.length > 0) {
      const mappedItems = source.map((item) => {
            const draftProductId = item.productId || item.styleNo || "";
            const draftColor = item.color != null ? item.color : null;
            const draftSize = item.size != null ? item.size : null;
            return {
              // _draftKey preserves the original draft identity so Checkout
              // can delete with the exact keys stored on the server, even if
              // the user edits color/size in this form.
              _draftKey: { productId: draftProductId, color: draftColor, size: draftSize },
              productId: draftProductId,
              styleNo: item.styleNo || "",
              name: item.name || item.description || "",
              description: item.description || item.name || "",
              color: item.color || "",
              size: item.size || "",
              qty: item.quantity ?? item.qty ?? 0,
              price: item.price || 0,
              image:
                item.image ||
                item.imageUrl ||
                item.thumbnail ||
                item.images_public_id?.[0] ||
                null,
              total: (item.quantity ?? item.qty ?? 0) * (item.price || 0),
            };
          });

      setOrderItems(mappedItems);

      const uniqueProductIds = [...new Set(mappedItems.map((it) => it.productId).filter(Boolean))];
      if (uniqueProductIds.length > 0) {
        const fetchProductMeta = async () => {
          try {
            const entries = await Promise.all(
              uniqueProductIds.map(async (productId) => {
                // Flexible lookup so legacy/variant keys still resolve product metadata.
                const res = await fetch(
                  `${import.meta.env.VITE_API_URL}/api/products/lookup/${encodeURIComponent(productId)}`
                );
                const product = res.ok ? await res.json() : null;

                if (!product) return [productId, [], 1, null];

                const sizesFromList = Array.isArray(product.sizes)
                  ? product.sizes.filter((s) => String(s || "").trim())
                  : [];
                const sizesFromVariants = Array.isArray(product.variants)
                  ? [...new Set(product.variants.map((v) => v?.size).filter((s) => String(s || "").trim()))]
                  : [];
                const sizes = [...new Set([...sizesFromList, ...sizesFromVariants])];
                const minQty = product?.minQty ?? 1;
                return [productId, sizes, minQty, product];
              })
            );

            setSizeOptionsByProduct((prev) => ({
              ...prev,
              ...Object.fromEntries(entries.map(([id, sizes]) => [id, sizes])),
            }));
            setMinQtyByProduct((prev) => ({
              ...prev,
              ...Object.fromEntries(entries.map(([id, , minQty]) => [id, minQty])),
            }));
            setProductLookupByKey((prev) => ({
              ...prev,
              ...Object.fromEntries(entries.map(([id, , , product]) => [id, product]).filter(([, product]) => !!product)),
            }));
          } catch (err) {
            console.error("Failed to load product sizes:", err);
          }
        };

        fetchProductMeta();
      }
    } else {
      setOrderItems([]);
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

  const handleItemChange = async (index, field, value) => {
    const updated = [...orderItems];
    const oldValue = updated[index][field];
    updated[index][field] = value;
    if (field === "qty" || field === "price") {
      updated[index].total =
        (updated[index].qty || 0) * (updated[index].price || 0);
    }
    setOrderItems(updated);

    const item = updated[index];
    if (!item.productId) return;

    // Save size changes to database
    if (field === "size") {
      try {
        const lookupKey = item._draftKey?.productId || item.productId;
        const product = productLookupByKey[lookupKey] || productLookupByKey[item.productId] || null;
        const variants = Array.isArray(product?.variants) ? product.variants : [];
        const variant =
          variants.find(
            (v) =>
              (v?.size || null) === (value || null) &&
              (item.color ? (v?.color || null) === (item.color || null) : true)
          ) || variants.find((v) => (v?.size || null) === (value || null));

        const resolvedProductId =
          (variant?.productId && String(variant.productId).trim()) ||
          (product?._id && String(product._id).trim()) ||
          item.productId;
        const resolvedStyleNo =
          (variant?.styleNo && String(variant.styleNo).trim()) ||
          product?.styleNo ||
          item.styleNo ||
          null;
        const resolvedPrice = Number.isFinite(Number(variant?.price))
          ? Number(variant.price)
          : Number.isFinite(Number(product?.price))
            ? Number(product.price)
            : item.price;
        const resolvedImage = variant?.images_public_id || product?.images_public_id?.[0] || item.image || null;

        updated[index].productId = resolvedProductId;
        updated[index].styleNo = resolvedStyleNo || "";
        updated[index].price = resolvedPrice;
        updated[index].image = resolvedImage;
        updated[index].total = (updated[index].qty || 0) * (updated[index].price || 0);

        await updatePOItemSize({
          productId: item._draftKey?.productId || item.productId,
          color: item._draftKey?.color || item.color || null,
          size: item._draftKey?.size || oldValue || null,
          newSize: value || null,
          newProductId: resolvedProductId,
          newStyleNo: resolvedStyleNo,
          newPrice: resolvedPrice,
          newImage: resolvedImage,
        });

        // Keep draft key in sync so later qty/remove operations target the updated row.
        updated[index]._draftKey = {
          productId: resolvedProductId,
          color: item._draftKey?.color || item.color || null,
          size: value || null,
        };
        if (sizeOptionsByProduct[lookupKey] && !sizeOptionsByProduct[resolvedProductId]) {
          setSizeOptionsByProduct((prev) => ({ ...prev, [resolvedProductId]: prev[lookupKey] }));
        }
        if (minQtyByProduct[lookupKey] && !minQtyByProduct[resolvedProductId]) {
          setMinQtyByProduct((prev) => ({ ...prev, [resolvedProductId]: prev[lookupKey] }));
        }
        if (product && !productLookupByKey[resolvedProductId]) {
          setProductLookupByKey((prev) => ({ ...prev, [resolvedProductId]: product }));
        }
        setFormError("");
        setOrderItems([...updated]);
      } catch (err) {
        console.error("Failed to update size:", err);
        setFormError("Failed to save size change");
        // Revert the change
        updated[index][field] = oldValue;
        setOrderItems([...updated]);
      }
    }

    // Save qty changes to database
    if (field === "qty") {
      const minQty = minQtyByProduct[item.productId] || 1;
      const newQty = Number(value) || 0;
      
      if (newQty > 0 && newQty < minQty) {
        setFormError(`Minimum quantity for this item is ${minQty}. You cannot set quantity below that.`);
        // Revert the change
        updated[index][field] = oldValue;
        setOrderItems([...updated]);
        return;
      }

      if (newQty <= 0) {
        setFormError("Quantity must be greater than 0");
        // Revert the change
        updated[index][field] = oldValue;
        setOrderItems([...updated]);
        return;
      }

      try {
        await updatePOItemQty({
          productId: item._draftKey?.productId || item.productId,
          color: item._draftKey?.color || item.color || null,
          size: item._draftKey?.size || item.size || null,
          qty: newQty,
        });
        setFormError(""); // Clear error on success
      } catch (err) {
        console.error("Failed to update qty:", err);
        setFormError("Failed to save quantity change");
        // Revert the change
        updated[index][field] = oldValue;
        setOrderItems([...updated]);
      }
    }
  };

  const removeRow = async (index) => {
    const item = orderItems[index];
    const productId = item.productId || item.styleNo;
    if (!productId) {
      setOrderItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    try {
      await removeFromPO({ productId, color: item.color, size: item.size });
      setOrderItems((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Failed to remove PO item:", err);
      setFormError(err.message || "Failed to remove item from Purchase Order");
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
  if (orderItems.length === 0) return <p className="po-empty">No items added in Purchase Order.</p>;

  return (
      <div className="purchase-order-form">
        <div className="business-log-purchase"><img src="/images/logo.png" alt="Company Logo" /></div>
        <h2>Purchase Order Form</h2>

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
              {orderItems.map((item, index) => {
                const sizeOptions = sizeOptionsByProduct[item.productId] || sizeOptionsByProduct[item._draftKey?.productId] || [];
                const minQty = minQtyByProduct[item.productId] || minQtyByProduct[item._draftKey?.productId] || 1;
                const currentSize = String(item.size || "").trim();
                const mergedSizeOptions = currentSize
                  ? [currentSize, ...sizeOptions.filter((opt) => String(opt || "").trim() !== currentSize)]
                  : sizeOptions;
                const hasSizeOptions = mergedSizeOptions.length > 0;
                return (
                <tr key={index}>
                  <td><input id={`po-style-${index}`} name={`poStyle-${index}`} value={item.styleNo?.toString().trim() ? item.styleNo : "N/A"} readOnly /></td>
                  <td><input id={`po-description-${index}`} name={`poDescription-${index}`} value={item.description ?? ""} readOnly /></td>
                  <td>
                    {hasSizeOptions ? (
                      <select
                        id={`po-size-${index}`}
                        name={`poSize-${index}`}
                        value={item.size || currentSize || ""}
                        onChange={(e) => handleItemChange(index, "size", e.target.value)}
                      >
                        <option value="">Select Size</option>
                        {mergedSizeOptions.map((sizeOpt) => (
                          <option key={sizeOpt} value={sizeOpt}>
                            {sizeOpt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input id={`po-size-${index}`} name={`poSize-${index}`} value="N/A" readOnly />
                    )}
                  </td>
                  <td><input id={`po-color-${index}`} name={`poColor-${index}`} value={item.color?.toString().trim() ? item.color : "N/A"} readOnly /></td>
                  <td><input id={`po-qty-${index}`} name={`poQty-${index}`} type="number" value={item.qty ?? 0} onChange={(e) => handleItemChange(index, "qty", Number(e.target.value))} min={minQty} /></td>
                  <td><input id={`po-price-${index}`} name={`poPrice-${index}`} type="number" value={item.price ?? 0} readOnly /></td>
                  <td><input id={`po-total-${index}`} name={`poTotal-${index}`} value={item.total ?? 0} readOnly /></td>
                  <td><button type="button" onClick={() => removeRow(index)}>X</button></td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* <div className="po-left">
          <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
            <strong>Minimum Quantity Requirements:</strong>
            <ul style={{ marginTop: "5px", marginLeft: "20px" }}>
              {orderItems.map((item, index) => {
                const minQty = minQtyByProduct[item.productId] || 1;
                return (
                  <li key={index}>
                    {item.styleNo?.toString().trim() ? item.styleNo : "Item"} - Minimum: {minQty} {minQty === 1 ? "unit" : "units"}
                  </li>
                );
              })}
            </ul>
          </div>
        </div> */}

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
