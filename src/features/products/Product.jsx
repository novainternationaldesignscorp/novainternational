import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Product.css"

function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products/slug/${slug}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="product-detail">
      <h1>{product.name}</h1>
      <img src={product.images[0]} alt={product.name} />
      <p>Price: US${product.price}</p>
      <p>Category: {product.category}</p>
      {product.subcategory && <p>Subcategory: {product.subcategory}</p>}
      {product.colors && <p>Colors: {product.colors.join(", ")}</p>}
      {product.sizes && <p>Sizes: {product.sizes.join(", ")}</p>}
      <p>{product.description}</p>
    </div>
  );
}

export default ProductPage;