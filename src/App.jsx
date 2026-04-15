import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from "react";
import "./App.css";

/* Components */
import Navbar from "./components/navbar/Navbar.jsx";
import Billboard from "./components/billboard/Billboard.jsx";
import Footer from "./components/footer/Footer.jsx";
import ProtectedRoute from './components/ProtectedRoute.jsx';

/* Pages */
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Careers from "./pages/Careers.jsx";

import CookiePolicy from "./pages/CookiePolicy.jsx";
import PrivacyNotice from "./pages/PrivacyNotice.jsx";
import LegalNotice from "./pages/LegalNotice.jsx";
import TermsConditions from "./pages/TermsConditions.jsx";

import InvestorRelations from "./pages/InvestorRelations.jsx";


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
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import PurchaseHistory from "./pages/PurchaseHistory.jsx";


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Billboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />

        <Route path="/cookiepolicy" element={<CookiePolicy />} />
        <Route path="/privacynotice" element={<PrivacyNotice />} />
        <Route path="/legalnotice" element={<LegalNotice />} />
        <Route path="/termsconditions" element={<TermsConditions />} />

        <Route path="/investor-relations" element={<InvestorRelations />} />


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
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/purchase-history" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;