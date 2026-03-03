import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useGuest } from "../context/GuestContext";
import { usePO } from "../context/PurchaseOrderContext.jsx";
import "./CSS/ProductDetails.css";

function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { guest } = useGuest();
  const { addToPO } = usePO();

  const MIN_QTY = 1;

  const [product, setProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showAddedBar, setShowAddedBar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      // reset UI for new slug immediately
      setLoading(true);
      setError("");
      setProduct(null);
      setOrderItems([]);
      setSelectedColor(null);
      setSelectedVariant(null);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/slug/${slug}`
        );
        if (!res.ok) throw new Error("Product not found");

        const data = await res.json();

        // Normalize variants -> colors / sizes lists for selects
        const variants = data.variants || [];
        const colors =
          variants.length > 0
            ? [...new Set(variants.map((v) => v.color).filter(Boolean))]
            : data.colors || [];
        const sizes =
          variants.length > 0
            ? [...new Set(variants.map((v) => v.size).filter(Boolean))]
            : data.sizes || [];

        const firstImage = data.images?.[0] || null;
        const imageMatchedVariant = firstImage
          ? variants.find((v) => v.image && v.image === firstImage)
          : null;
        const defaultColor = imageMatchedVariant?.color || colors?.[0] || null;
        const defaultSize = sizes?.[0] || null;

        setProduct({ ...data, colors, sizes });

        // Start quantity as blank with first available color/size
        setOrderItems([
          {
            color: defaultColor,
            size: defaultSize,
            quantity: "",
          },
        ]);

        // Initialize selected color/variant for page-wide display
        setSelectedColor(defaultColor);
        const initVariant = (data.variants || []).find(
          (v) => v.color === defaultColor && (defaultSize ? v.size === defaultSize : true)
        );
        setSelectedVariant(initVariant || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Check if product has variants for color switching
  const hasColorVariants = product?.variants && product.variants.length > 0;

  // Check if variants or product define sizes (e.g., dress or jute bag)
  const variantHasSizes =
    (product?.sizes && product.sizes.length > 0) ||
    (hasColorVariants && product.variants.some((v) => v.size && v.size.trim().length > 0));

  // Get unique colors and sizes from variants
  const getVariantColors = () => {
    if (product?.variants && product.variants.length > 0) {
      return [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
    }
    // fallback to product.colors
    return product?.colors || [];
  };

  const getVariantSizes = () => {
    if (product?.sizes && product.sizes.length > 0) return product.sizes;
    if (product?.variants && product.variants.length > 0) {
      return [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
    }
    return [];
  };

  // Find variant by color and optional size
  const findVariant = (color, size = null) => {
    if (!product?.variants) return null;
    return product.variants.find((v) => {
      const colorMatch = v.color === color;
      const sizeMatch = size ? v.size === size : !v.size || v.size === "";
      return colorMatch && sizeMatch;
    });
  };

  // Slug helper: convert a string to url-friendly slug
  const slugify = (str) =>
    String(str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // Try to find a product by slug for the given color and navigate to it if found.
  // Tries two patterns: `${base}-${color}` and `${color}-${base}` where `base` is
  // the current product.slug with the current color token removed (if present).
  const navigateToColorProduct = async (targetColor) => {
    if (!product) return updateOrderItem(0, "color", targetColor);

    const targetSlug = slugify(targetColor);
    const currentColor = selectedColor || orderItems[0]?.color || "";
    const currentColorSlug = slugify(currentColor);

    // derive base by removing any current color tokens from product.slug
    const parts = product.slug ? product.slug.split("-") : [];
    const baseParts = parts.filter((p) => p !== currentColorSlug);
    const base = baseParts.join("-") || product.slug || "";

    const candidates = [
      `${base}-${targetSlug}`,
      `${targetSlug}-${base}`,
    ].filter(Boolean);

    for (const cand of candidates) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/slug/${cand}`);
        if (res.ok) {
          navigate(`/product/${cand}`);
          return;
        }
      } catch (e) {
        // ignore and try next
      }
    }

    // fallback: no product page found for color — do in-place update
    updateOrderItem(0, "color", targetColor);
  };

  // Allow blank quantity
  const updateOrderItem = (index, field, value) => {
    const updated = [...orderItems];

    if (field === "quantity") {
      if (value === "") {
        updated[index][field] = "";
      } else {
        updated[index][field] = Number(value);
      }
    } else {
      updated[index][field] = value;
    }

    // if user changed color, update page-wide selectedColor/variant as well
    if (field === "color") {
      setSelectedColor(value);
      const v = findVariant(value, updated[index].size || null);
      setSelectedVariant(v || null);
    }

    setOrderItems(updated);
    setValidationError("");
  };

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        color: product.colors?.[0] || null,
        size: product.sizes?.[0] || null,
        quantity: "",
      },
    ]);
    setValidationError("");
  };

  const removeOrderItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
    setValidationError("");
  };

  const totalQuantity = orderItems.reduce(
    (acc, item) => acc + Number(item.quantity || 0),
    0
  );

  const validateTotalQty = () => {
    if (totalQuantity < MIN_QTY) {
      const msg = `Minimum total order quantity is ${MIN_QTY}. Selected: ${totalQuantity}`;
      setValidationError(msg);
      setShowPopup(true);
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleAddToPO = async () => {
    if (!user && !guest) {
      alert("Please log in or proceed as guest");
      navigate("/signin");
      return;
    }

    if (!validateTotalQty()) return;

    const poData = orderItems.map((item) => {
      const variant = findVariant(item.color, item.size);
      return {
        productId: product._id,
        name: product.name,
        price: variant?.price ?? product.price,
        quantity: Number(item.quantity || 0),
        color: item.color || null,
        size: item.size || null,
        sku: variant?.sku || null,
        image: variant?.image || product.images?.[0] || null,
      };
    });

    try {
      const ownerType = user ? "User" : "Guest";
      const ownerId = user?._id || guest?._id;
      const endpoint = `${import.meta.env.VITE_API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}/items`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: poData }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add to Purchase Order");
      }

      const data = await res.json();
      console.log("PO Response:", data);

      poData.forEach((itm) => {
        addToPO(itm);
      });

      setShowAddedBar(true);
    } catch (err) {
      console.error("Error adding PO:", err);
      alert("Error adding to Purchase Order: " + err.message);
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!product) return null;

  return (
    <div className="product-details">

      <div className="images-section">
        <Link to={`/product/${product.slug}`}>
          <img
            src={
              (function () {
                const color = orderItems[0]?.color;
                const size = orderItems[0]?.size;
                const v = findVariant(color, size);
                return v?.image || product.images?.[0] || "/images/no-image.png";
              })()
            }
            alt={product.name}
          />
        </Link>
      </div>

      <div className="info-section">
        {/* Dynamic title: combine base name with selected color when available */}
        <h1>
          {(() => {
            const colors = getVariantColors();
            let baseName = product.name;
            if (product.name.includes("-")) baseName = product.name.split("-")[0].trim();
            else if (colors.length > 0) {
              const firstWord = product.name.split(" ")[0].toLowerCase();
              if (colors.map((c) => c.toLowerCase()).includes(firstWord)) {
                baseName = product.name.split(" ").slice(1).join(" ");
              }
            }
            return selectedColor ? `${baseName} - ${selectedColor}` : baseName;
          })()}
        </h1>
        <h2 className="price">US$ {selectedVariant?.price ?? product.price}</h2>
        <p className="category">{product.category}</p>
        <p className="description">{product.description}</p>

        {/* Color selector for variant switching (always show if variants exist) */}
        {hasColorVariants && (
          <div className="color-selector">
            <h4>Available Colors</h4>
            <div className="color-options">
              {getVariantColors().map((colorOpt) => (
                <button
                  key={colorOpt}
                  onClick={() => navigateToColorProduct(colorOpt)}
                  className={`color-btn ${
                    (orderItems[0]?.color || selectedColor) === colorOpt ? "active" : ""
                  }`}
                  title={colorOpt}
                >
                  {colorOpt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes (only show if variants have sizes, like dress) */}
        {variantHasSizes && (
          <div className="size-selector">
            <h4>Sizes</h4>
            <div className="order-combinations">
              {orderItems.map((item, idx) => (
                <div key={idx} className="order-row">
                  <select
                    value={item.size || ""}
                    onChange={(e) =>
                      updateOrderItem(idx, "size", e.target.value)
                    }
                  >
                    <option value="">Select Size</option>
                    {getVariantSizes().map((sizeOpt) => (
                      <option key={sizeOpt} value={sizeOpt}>
                        {sizeOpt}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Qty"
                    value={item.quantity ?? ""}
                    onChange={(e) =>
                      updateOrderItem(idx, "quantity", e.target.value)
                    }
                  />

                  {orderItems.length > 1 && (
                    <button onClick={() => removeOrderItem(idx)}>Remove</button>
                  )}
                </div>
              ))}

              <button onClick={addOrderItem}>Add Another Size</button>

              <p>Total Quantity: {totalQuantity}</p>
              <p className="min-qty-note">
                Minimum total order quantity: <strong>{MIN_QTY}</strong>
              </p>
            </div>
          </div>
        )}

        {/* No variant sizes? Just quantity input */}
        {!variantHasSizes && (
          <div className="single-quantity">
            <label>Quantity:</label>
            <div className="single-qty-wrap">
              <input
                type="number"
                min={MIN_QTY}
                step={1}
                placeholder="Qty"
                value={orderItems[0]?.quantity ?? ""}
                onChange={(e) => updateOrderItem(0, "quantity", e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="action-buttons">
          {!showAddedBar && (
            <button className="add-po-btn" onClick={handleAddToPO}>
              Add to Purchase Order
            </button>
          )}
        </div>

        {showAddedBar && (
          <div className="action-buttons">
            <button onClick={() => navigate("/purchase-order/form")}>
              View Purchase Order
            </button>
            <button onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        )}

        {showPopup && (
          <div className="po-popup-overlay">
            <div className="po-popup">
              <p>{validationError}</p>
              {/* <div className="po-popup-actions">
                <button onClick={() => setShowPopup(false)}>
                  OK
                </button>
              </div> */}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProductDetails;