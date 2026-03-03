import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";


import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from "react";
import "./App.css";
import { GuestProvider } from "./context/GuestContext.jsx";

/* Components */
import Navbar from "./components/navbar/Navbar.jsx";
import Carousel from "./components/carousel/Carousel.jsx";
import Footer from "./components/footer/Footer.jsx";
import ProtectedRoute from './components/ProtectedRoute.jsx';

/* Pages */
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Category from "./pages/Category.jsx";
import Product from "./features/products/Product.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import PurchaseOrderForm from "./pages/PurchaseOrderForm.jsx";
import PurchaseOrder from "./pages/PurchaseOrder.jsx";
import DigitalLetterHead from './pages/DigitalLetterhead.jsx';
import Checkout from './pages/Checkout.jsx';
import SignIn from './pages/SignIn.jsx';
import Signup from './pages/Signup.jsx';
import CheckoutGuest from './pages/CheckoutGuest.jsx';
import PurchaseOrderSummary from './pages/PurchaseOrderSummary.jsx';
import OrderConfirmation from "./pages/OrderConfirmation";
import AdminOrders from "./pages/AdminOrders.jsx";
import PurchaseHistory from "./pages/PurchaseHistory.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_PUBLISHABLE_KEY);


function App() {
  return (
    <BrowserRouter>
      <GuestProvider>
        <Elements stripe={stripePromise}>
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Carousel />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products" element={<Product />} />
            <Route path="/product/:slug" element={<ProductDetails />} />

            <Route path="/category/:category" element={<Category />} />
            <Route path="/category/:category/:subcategory" element={<Category />} />

            <Route path="/digital-letter-head/:orderId" element={<DigitalLetterHead />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/checkout-guest" element={<CheckoutGuest />} />  
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Protected Routes */}
            <Route path="/purchase-order" element={<ProtectedRoute><PurchaseOrder /></ProtectedRoute>} />
            <Route path="/purchase-order/form" element={<ProtectedRoute><PurchaseOrderForm /></ProtectedRoute>} />
            <Route path="/purchaseordersummary" element={<ProtectedRoute><PurchaseOrderSummary /></ProtectedRoute>} />       
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
            <Route path="/purchase-history" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />
          </Routes>

          <Footer />
        </Elements>
      </GuestProvider>
    </BrowserRouter>
  );
}

export default App;