import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { getImageUrl } from "../utils/getImageUrl";

const CATEGORY_SUBCATEGORY_MAP = {
  Fashion: ["women"],
  Accessories: ["bags", "jute-bag"],
  Electronics: ["vacuum-sealing-machine", "digital-photo-frame", "campfire-light", "bladeless-fan", "baby-monitor"],
  "wedding-gifts": ["wedding-gift-box"],
  "nova-chocolates": ["nova-chocolate-box", "nova-chocolate-bar"],
};

const AVAILABLE_SIZES = ["S", "M", "L"];

function AdminProducts() {
  const { token } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    _id: "",
    name: "",
    styleNo: "",
    category: "",
    subcategory: "",
    price: "",
    description: "",
    colors: "",
    sizes: "",
    slug: "",
    images_public_id: [],
  });
  const [uploading, setUploading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/products`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to load products");
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const authHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const resetForm = () => {
    setFormState({
      _id: "",
      name: "",
      styleNo: "",
      category: "",
      subcategory: "",
      price: "",
      description: "",
      colors: "",
      sizes: "",
      slug: "",
      images_public_id: [],
      imageUrl: "",
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Image upload failed");
      setFormState((prev) => ({
        ...prev,
        images_public_id: [...prev.images_public_id, data.public_id],
      }));
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    const url = formState.imageUrl.trim();
    if (!url) {
      setError("Please enter a valid image URL.");
      return;
    }
    setFormState((prev) => ({
      ...prev,
      images_public_id: [...prev.images_public_id, url],
      imageUrl: "",
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formState.name || !formState.styleNo || !formState.category) {
      setError("Please provide product name, style number, and category.");
      return;
    }

    const payload = {
      name: formState.name,
      styleNo: formState.styleNo,
      category: formState.category,
      subcategory: formState.subcategory,
      price: parseFloat(formState.price) || 0,
      description: formState.description,
      colors: formState.colors.split(",").map((item) => item.trim()).filter(Boolean),
      sizes: Array.isArray(formState.sizes) ? formState.sizes : formState.sizes.split(",").map((item) => item.trim()).filter(Boolean),
      slug: formState.slug || undefined,
      images_public_id: formState.images_public_id,
    };

    const method = formState._id ? "PUT" : "POST";
    const url = formState._id
      ? `${apiUrl}/api/products/${formState._id}`
      : `${apiUrl}/api/products`;

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Product save failed");
      resetForm();
      await fetchProducts();
      setError("Product saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Product save failed");
    }
  };

  const handleEdit = (product) => {
    setFormState({
      _id: product._id,
      name: product.name || "",
      styleNo: product.styleNo || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      price: product.price || "",
      description: product.description || "",
      colors: (product.colors || []).join(", "),
      sizes: (product.sizes || []).join(", "),
      slug: product.slug || "",
      images_public_id: product.images_public_id || [],
      imageUrl: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed");
    }
  };

  if (loading) return <p>Loading admin product dashboard...</p>;

  return (
    <div className="admin-products-page" style={{ padding: "24px" }}>
      <h2>Admin Product Dashboard</h2>
      <p>Use this page to create, update, delete, and upload images for products.</p>

      <div style={{ marginBottom: "24px", maxWidth: "760px" }}>
        <h3>{formState._id ? "Edit Product" : "Create Product"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
          <input
            name="name"
            type="text"
            placeholder="Product name"
            value={formState.name}
            onChange={handleInputChange}
            required
          />
          <input
            name="styleNo"
            type="text"
            placeholder="Style number"
            value={formState.styleNo}
            onChange={handleInputChange}
            required
          />
          <select
            name="category"
            value={formState.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            {Object.keys(CATEGORY_SUBCATEGORY_MAP).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            name="subcategory"
            value={formState.subcategory}
            onChange={handleInputChange}
          >
            <option value="">Select Subcategory (Optional)</option>
            {formState.category && CATEGORY_SUBCATEGORY_MAP[formState.category]?.map((subcat) => (
              <option key={subcat} value={subcat}>
                {subcat}
              </option>
            ))}
          </select>
          <input
            name="price"
            type="number"
            placeholder="Price"
            value={formState.price}
            onChange={handleInputChange}
          />
          <textarea
            name="description"
            placeholder="Product description"
            value={formState.description}
            onChange={handleInputChange}
            rows={4}
          />
          <input
            name="colors"
            type="text"
            placeholder="Colors (comma separated)"
            value={formState.colors}
            onChange={handleInputChange}
          />
          
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              Sizes (select one or more):
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {AVAILABLE_SIZES.map((size) => (
                <label key={size} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(formState.sizes)
                        ? formState.sizes.includes(size)
                        : formState.sizes.split(",").map(s => s.trim()).includes(size)
                    }
                    onChange={(e) => {
                      const currentSizes = Array.isArray(formState.sizes)
                        ? formState.sizes
                        : formState.sizes.split(",").map(s => s.trim()).filter(Boolean);
                      
                      const newSizes = e.target.checked
                        ? [...currentSizes, size]
                        : currentSizes.filter(s => s !== size);
                      
                      setFormState((prev) => ({
                        ...prev,
                        sizes: newSizes,
                      }));
                    }}
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>
          
          <input
            name="slug"
            type="text"
            placeholder="Slug (optional)"
            value={formState.slug}
            onChange={handleInputChange}
          />

          <div style={{ display: "grid", gap: "12px", maxWidth: "100%" }}>
            {/* <label style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Upload image
              <input type="file" accept="image/*" onChange={handleUploadImage} />
            </label>
            {uploading && <span>Uploading...</span>} */}

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                name="imageUrl"
                placeholder="Paste Cloudinary image URL"
                value={formState.imageUrl}
                onChange={(e) => setFormState((prev) => ({ ...prev, imageUrl: e.target.value }))}
                style={{ flex: 1, minWidth: "220px" }}
              />
              <button type="button" onClick={handleAddImageUrl} style={{ whiteSpace: "nowrap" }}>
                Add URL
              </button>
            </div>
          </div>

          {formState.images_public_id.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {formState.images_public_id.map((imageValue, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(imageValue)}
                  alt={`upload-${idx}`}
                  style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "6px" }}
                />
              ))}
            </div>
          )}

          <button type="submit">{formState._id ? "Save Changes" : "Create Product"}</button>
          {formState._id && (
            <button type="button" onClick={resetForm} style={{ background: "#ccc" }}>
              Cancel Edit
            </button>
          )}
        </form>
        {error && <p style={{ color: error.includes("success") ? "green" : "red" }}>{error}</p>}
      </div>

      <div>
        <h3>Existing Products</h3>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {products.map((product) => (
              <div key={product._id} style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}>
                <strong>{product.name}</strong> ({product.styleNo})
                <div>Category: {product.category}</div>
                <div>Subcategory: {product.subcategory || "—"}</div>
                <div>Price: {product.price ?? "—"}</div>
                <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                  <button onClick={() => handleEdit(product)}>Edit</button>
                  <button onClick={() => handleDelete(product._id)} style={{ background: "#c00", color: "white" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;
