import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Product.css";
import { getImageUrl } from "../../utils/getImageUrl";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPrimaryImage = (product) =>
    product.images_public_id?.[0] ||
    product.images?.[0] ||
    product.variants?.[0]?.images_public_id ||
    product.variants?.[0]?.image ||
    null;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!products || products.length === 0) return <p>No products found.</p>;

  return (
    <div className="product-page">
      <h1>Our Products</h1>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            {/* Wrap image in Link */}
            <Link to={`/product/${product.slug || product._id}`}>
              <img
                className="product-image"
                src={getImageUrl(getPrimaryImage(product))}
                alt={product.name}
              />
            </Link>

            {/* Product name can also be clickable */}
            <Link to={`/product/${product.slug || product._id}`} className="product-name">
              <h3>{product.name}</h3>
            </Link>

            <p className="price">USD {product.price}</p>
            <p className="category">{product.category}</p>
            {product.subcategory && <p className="category">{product.subcategory}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductPage;