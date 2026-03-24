import React, { useState } from "react";

function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imagesPublicId, setImagesPublicId] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    //const res = await fetch("https://novainternational-backend.onrender.com/api/products/add", {
    
    const res = await fetch( `${import.meta.env.VITE_API_URL}/api/products/add`, // fetch("https://novainternational-backend.onrender.com/api/products/add",
    { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, price, images_public_id: imagesPublicId })
    });

    const data = await res.json();
    console.log(data);
    alert("Product added successfully!");
  };

  return (
    <div>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          id="add-product-name"
          name="productName"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br />
        <textarea
          id="add-product-description"
          name="productDescription"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br />
        <input
          id="add-product-price"
          name="productPrice"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <br />
        <input
          id="add-product-images"
          name="productImages"
          type="text"
          placeholder="Image public IDs (comma separated)"
          value={imagesPublicId.join(",")}
          onChange={(e) => setImagesPublicId(e.target.value.split(","))}
          required
        />
        <br />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}

export default AddProduct;