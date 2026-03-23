import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Product.css";
import { getImageUrl } from "../../utils/getImageUrl";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data); // array of products
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
            {product.images && product.images[0] && (
              <Link to={`/product/${product.slug || product._id}`}>
              <img className="product-image" src={product.images && product.images[0] ? getImageUrl(product.images[0]) : "/images/no-image.png" }alt={product.name} />
              </Link>
            )}

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