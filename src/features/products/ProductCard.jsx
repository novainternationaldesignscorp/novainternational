import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./productcard.css";
import { getImageUrl } from "../../utils/getImageUrl";

function ProductCard({ product }) {
  const navigate = useNavigate();

  // Product-specific minimum quantity (fallback to 1)
  const MIN_QTY = product.minQty || 1;

  const [qty, setQty] = useState(MIN_QTY);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ""
  );

  const handleQtyChange = (value) => {
    if (value < MIN_QTY) {
      setQty(MIN_QTY);
      return;
    }
    setQty(value);
  };

  const validateQty = () => {
    if (qty < MIN_QTY) {
      alert(`Minimum order quantity for this product is ${MIN_QTY}`);
      return false;
    }
    return true;
  };

  const handleAddToPO = () => {
    if (!validateQty()) return;

    const poItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      color: selectedColor,
      quantity: qty,
      image: product.images?.[0]
        ? getImageUrl(product.images[0])
        : null,
    };

    console.log("Add to Purchase Order:", poItem);
  };

  const handleBuyNow = () => {
    if (!validateQty()) return;

    const order = {
      productId: product._id,
      name: product.name,
      price: product.price,
      color: selectedColor,
      quantity: qty,
      image: product.images?.[0]
        ? getImageUrl(product.images[0])
        : null,
    };

    navigate("/checkout", { state: order });
  };

  return (
    <div className="product-card">
      <img
        src={
          product.images?.[0]
            ? getImageUrl(product.images[0])
            : "/images/no-image.png"
        }
        alt={product.name}
        className="product-image"
        onClick={() =>
          navigate(`/product/${product.slug || product._id}`)
        }
      />

      <h3
        className="product-name"
        onClick={() =>
          navigate(`/product/${product.slug || product._id}`)
        }
      >
        {product.name}
      </h3>

      <h4>Style No: {product.styleNo}</h4>
      <p className="price">USD {product.price}</p>
    </div>
  );
}

export default ProductCard;