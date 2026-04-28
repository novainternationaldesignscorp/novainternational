import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useGuest } from "../context/GuestContext";
import { usePO } from "../context/PurchaseOrderContext.jsx";
import "./CSS/ProductDetails.css";
import { getImageUrl } from "../utils/getImageUrl";

function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { guest } = useGuest();
  const { addToPO } = usePO();

  const [product, setProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAddedBar, setShowAddedBar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  //  SAFE IMAGE HELPER
  const getSafeImage = (image_public_id) => {
    if (!image_public_id) return null;
    if (Array.isArray(image_public_id)) {
      return image_public_id[0] || null;
    }
    return image_public_id;
  };

  const getVariantImageValue = (variant) => {
    if (!variant) return null;
    return getSafeImage(variant.images_public_id);
  };

  const getProductImages = (product) => {
    const images_public_id = product?.images_public_id || [];
    return Array.isArray(images_public_id) ? images_public_id : [images_public_id];
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);
      setOrderItems([]);
      setSelectedColor(null);
      setSelectedVariant(null);
      setSelectedImage(null);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/slug/${slug}`
        );
        if (!res.ok) throw new Error("Product not found");

        const data = await res.json();
        
        // console.log(" Product Fetched:", {
        //   name: data.name,
        //   images_public_id: data.images_public_id,
        //   images_count: data.images_public_id?.length || 0
        // });

        const variants = data.variants || [];
        const colors =
          variants.length > 0
            ? [...new Set(variants.map((v) => v.color).filter(Boolean))]
            : data.colors || [];
        const sizes =
          variants.length > 0
            ? [...new Set(variants.map((v) => v.size).filter(Boolean))]
            : data.sizes || [];

        const product_images_public_id = getProductImages(data);
        const firstImage = product_images_public_id[0] || null;

        const imageMatchedVariant = firstImage
          ? variants.find(
              (v) => getVariantImageValue(v) === firstImage
            )
          : null;

        const defaultColor =
          imageMatchedVariant?.color || colors?.[0] || null;
        const defaultSize = sizes?.[0] || null;

        setProduct({ ...data, colors, sizes });
        setSelectedImage(firstImage);

        setOrderItems([
          {
            color: defaultColor,
            size: defaultSize,
            quantity: "",
          },
        ]);

        setSelectedColor(defaultColor);

        const initVariant = variants.find(
          (v) =>
            v.color === defaultColor &&
            (defaultSize ? v.size === defaultSize : true)
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

  const hasColorVariants =
    product?.variants && product.variants.length > 0;

  const variantHasSizes =
    (product?.sizes && product.sizes.length > 0) ||
    (hasColorVariants &&
      product.variants.some(
        (v) => v.size && v.size.trim().length > 0
      ));

  const getVariantColors = () => {
    if (product?.variants && product.variants.length > 0) {
      return [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
    }
    return product?.colors || [];
  };

  const getVariantSizes = () => {
    if (product?.sizes && product.sizes.length > 0) return product.sizes;
    if (product?.variants && product.variants.length > 0) {
      return [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
    }
    return [];
  };

  const findVariant = (color, size = null) => {
    if (!product?.variants) return null;
    return product.variants.find((v) => {
      const colorMatch = v.color === color;
      const sizeMatch = size
        ? v.size === size
        : !v.size || v.size === "";
      return colorMatch && sizeMatch;
    });
  };

  const slugify = (str) =>
    String(str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const navigateToColorProduct = async (targetColor) => {
    if (!product) return updateOrderItem(0, "color", targetColor);

    const targetSlug = slugify(targetColor);
    const currentColor = selectedColor || orderItems[0]?.color || "";
    const currentColorSlug = slugify(currentColor);

    const parts = product.slug ? product.slug.split("-") : [];
    const baseParts = parts.filter((p) => p !== currentColorSlug);
    const base = baseParts.join("-") || product.slug || "";

    const candidates = [`${base}-${targetSlug}`, `${targetSlug}-${base}`].filter(Boolean);

    for (const cand of candidates) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/slug/${cand}`
        );
        if (res.ok) {
          navigate(`/product/${cand}`);
          return;
        }
      } catch (e) {}
    }

    updateOrderItem(0, "color", targetColor);
    const variant = findVariant(targetColor, orderItems[0]?.size);

    const selected_images_public_id =
      getVariantImageValue(variant) ||
      getProductImages(product)[0];

    if (selected_images_public_id) setSelectedImage(selected_images_public_id);
  };

  const updateOrderItem = (index, field, value) => {
    const updated = [...orderItems];

    if (field === "quantity") {
      updated[index][field] = value === "" ? "" : Number(value);
    } else {
      updated[index][field] = value;
    }

    if (field === "color") {
      setSelectedColor(value);
      const variant = findVariant(value, updated[index].size || null);
      setSelectedVariant(variant || null);

      const selected_images_public_id =
        getVariantImageValue(variant) ||
        getProductImages(product)[0];

      if (selected_images_public_id) setSelectedImage(selected_images_public_id);
    }

    if (field === "size") {
      const variant = findVariant(updated[index].color, value);

      const selected_images_public_id =
        getVariantImageValue(variant) ||
        getProductImages(product)[0];

      if (selected_images_public_id) setSelectedImage(selected_images_public_id);

      setSelectedVariant(variant || null);
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
    const minQty = product?.minQty ?? 1;
    if (totalQuantity < minQty) {
      setValidationError(
        `Minimum total order quantity is ${minQty}. You selected: ${totalQuantity}`
      );
      setShowPopup(true);
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleAddToPO = async () => {
    if (!user && !guest) {
      // alert("Please log in or proceed as guest");
      navigate("/signin");
      return;
    }

    if (!validateTotalQty()) return;

    const poData = orderItems.map((item) => {
      const variant = findVariant(item.color, item.size);
      return {
        productId: variant?.productId || product._id,
        styleNo: variant?.styleNo || product.styleNo || null,
        name: product.name,
        description: product.description || null,
        price: variant?.price ?? product.price,
        quantity: Number(item.quantity || 0),
        color: item.color || null,
        size: item.size || null,
        sku: variant?.sku || null,
        image: getImageUrl(
          getVariantImageValue(variant) ||
            getProductImages(product)[0]
        ),
      };
    });

    try {
      const ownerType = user ? "User" : "Guest";
      const ownerId = user?._id || guest?._id;
      const endpoint = `${import.meta.env.VITE_API_URL}/api/purchaseOrderDraft/${ownerType}/${ownerId}/items`;

      const isProd = !window.location.hostname.includes('localhost') &&
                    !window.location.hostname.includes('127.0.0.1');

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: isProd ? 'include' : 'omit',
        body: JSON.stringify({ items: poData }),
      });

      if (!res.ok) throw new Error("Failed");

      poData.forEach((itm) => addToPO(itm));
      setShowAddedBar(true);
    } catch (err) {
      alert("Error adding to Purchase Order");
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!product) return null;

  return (
    <div className="product-details">
      <div className="images-section">
        <div className="thumbnails">
          {getProductImages(product).map((images_public_id, idx) => (
          <img
            key={idx}
            src={getImageUrl(images_public_id)}
            className={
              selectedImage === images_public_id ? "thumbnail active" : "thumbnail"
            }
            onClick={() => setSelectedImage(images_public_id)}
            alt=""
          />
        ))}
        </div>

        <div className="main-image">
          <img
            src={getImageUrl(
              selectedImage ||
                getProductImages(product)[0] ||
                getVariantImageValue(product.variants?.[0])
            )}
            alt={product.name}
          />
        </div>
      </div>



      <div className="info-section">
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
        <p className="style-no">Style No: {selectedVariant?.styleNo || product.styleNo}</p>
        <h2 className="price">USD {selectedVariant?.price ?? product.price}</h2>
        {/* <p className="category">{product.category}</p> */}
        <p className="description">{product.description || "N/A"}</p>

        {getVariantColors().length > 0 && (
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

        {variantHasSizes && (
          <div className="size-selector">
            <h4>Sizes</h4>
            <div className="order-combinations">
              {orderItems.map((item, idx) => (
                <div key={idx} className="order-row">
                  <select
                    id={`product-size-${idx}`}
                    name={`productSize-${idx}`}
                    value={item.size || ""}
                    onChange={(e) => updateOrderItem(idx, "size", e.target.value)}
                  >
                    <option value="">Select Size</option>
                    {getVariantSizes().map((sizeOpt) => (
                      <option key={sizeOpt} value={sizeOpt}>
                        {sizeOpt}
                      </option>
                    ))}
                  </select>

                  <input
                    id={`product-qty-${idx}`}
                    name={`productQty-${idx}`}
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Qty"
                    value={item.quantity ?? ""}
                    onChange={(e) => updateOrderItem(idx, "quantity", e.target.value)}
                  />

                  {orderItems.length > 1 && (
                    <button onClick={() => removeOrderItem(idx)}>Remove</button>
                  )}
                </div>
              ))}

              <button onClick={addOrderItem}>Add Another Size</button>
              {/* <p>Total Quantity: {totalQuantity}</p>
              <p className="min-qty-note">
                Minimum total order quantity: <strong>{product?.minQty ?? 1}</strong>
              </p> */}
            </div>
          </div>
        )}

        {!variantHasSizes && (
          <div className="single-quantity">
            <label>Quantity:</label>
            <div className="single-qty-wrap">
              <input
                id="product-qty-single"
                name="productQtySingle"
                type="number"
                min={product?.minQty ?? 1}
                step={1}
                placeholder="Qty"
                value={orderItems[0]?.quantity ?? ""}
                onChange={(e) => updateOrderItem(0, "quantity", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* temporary disable Add to PO button until we finalize the order item structure and flow */}
        <div className="action-buttons">
          {!showAddedBar && (
            <button className="add-po-btn" onClick={handleAddToPO}>
              Add to Purchase Order
            </button>
          )}
        </div>

         {/* <div className="action-buttons">
          {!showAddedBar && (
            <button className="add-po-btn">
              Add to Purchase Order
            </button>
          )}
        </div> */}

        {showAddedBar && (
          <div className="action-buttons">
            <button onClick={() => navigate("/checkout")}>
              View Purchase Order
            </button>
            <button onClick={() => navigate("/")}>Continue Shopping</button>
          </div>
        )}

        {showPopup && (
          <div className="po-popup-overlay">
            <div className="po-popup">
              <p>{validationError}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;