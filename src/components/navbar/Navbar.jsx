// src/components/navbar/Navbar.jsx
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { useGuest } from "../../context/GuestContext.jsx";
import SignOutButton from "../SignOutButton";  // For sign-out functionality
import { usePO } from "../../context/PurchaseOrderContext.jsx";
import "./navbar.css";

const Navbar = () => {
  const { user, signOut, loading } = useContext(UserContext);  // Get user, signOut, and loading from context
  const { guest, endGuestSession } = useGuest();  // Get guest context
  const { poItems } = usePO();
  const [activeMenu, setActiveMenu] = useState(null);  // Manage active menu item state
  const [forceHide, setForceHide] = useState(false);

  if (loading) return null;  // Return null while the loading state is true

  // Top utility links
  const topLinks = [
    { title: "About Us", path: "/about" },
    // { title: "Add to Purchase Order", path: "/purchase-order" },
    { title: "Gift Cards", path: "#" },
    { title: "Sign In", path: "/signin" },
    { title: "Contact Us", path: "/contact" },
  ];

  // Menu Data
  const menuData = [
    {
      title: "Women",
      path: "/category/fashion/women",
      megaMenu: [
        {
          heading: "Womens >",
          links: [
            { title: "Womens Wear", path: "/category/fashion/women" },
            { title: "Coats and Jackets", path: "#" },
            { title: "Sweaters", path: "#" },
            { title: "Tops", path: "#" },
            { title: "Dresses", path: "/category/fashion/women" },
          ],
        },
        {
          heading: "More Sizes >",
          links: [
            { title: "Plus Sizes", path: "#" },
            { title: "Petites", path: "#" },
            { title: "Juniors & Young Adult", path: "#" },
            { title: "Maternity", path: "#" },
          ],
        },
        {
          heading: "New & Trending >",
          links: [
            { title: "New Arrivals In Women", path: "#" },
            { title: "Contemporary Trending", path: "#" },
            { title: "New Fashion Designs", path: "#" },
            { title: "Trending Colors Designs", path: "#" },
          ],
        },
      ],
    },
    {
      title: "Electronics",
      path: "/category/electronics",
      megaMenu: [
        {
          heading: "Vacuum Sealers >",
          links: [
            { title: "Zip Lock Vacuum Sealers", path: "/product/zip-lock-vacuum-sealers" },
            { title: "Kitchenware Vacuum Sealers", path: "/product/kitchenware-vacuum-sealers" },
            { title: "Technologically Advance Vacuum Sealers", path: "/product/technologically-advance-vacuum-sealers" },
          ],
        },
        {
          heading: "Speakers & Audio >",
          links: [
            { title: "Bluetooth & Wireless Speakers", path: "/product/bluetooth-wireless-speakers" },
            { title: "Campfire Bluetooth Speakers", path: "/product/campfire-bluetooth-speakers" },
            { title: "Technologically Advanced Bluetooth Speakers", path: "/product/technologically-advanced-bluetooth-speakers" },
          ],
        },
        {
          heading: "Fans >",
          links: [
            { title: "Technologically Advanced Fans", path: "/product/technologically-advanced-fans" },
            { title: "Bladeless Fans", path: "/product/bladeless-fan" },
            { title: "Musical Fans", path: "/product/musical-fans" },
          ],
        },
        {
          heading: "Digital Photo Frames >",
          links: [
            { title: "Digital Photo Frames", path: "/product/digital-photo-frame" },
          ],
        },
        {
          heading: "Kids Tech and Electronics >",
          links: [
            { title: "Kids Robot", path: "/product/kids-robot" },
            { title: "Technologically Advanced Robots", path: "/product/technologically-advanced-robots" },
          ],
        },
        {
          heading: "New & Trending >",
          links: [
            { title: "New Arrivals In Electronics", path: "#" },
            { title: "Contemporary Trending", path: "#" },
            { title: "New Electronics Designs", path: "#" },
            { title: "Trending Colors Designs", path: "#" },
          ],
        },
      ],
    },
    {
      title: "Bags And Accessories",
      path: "/category/accessories",
      megaMenu: [
        {
          heading: "Bags And Accessories >",
          links: [
            { title: "Jute Bags", path: "/product/jute-bag" },
            { title: "Evening Designer Bags", path: "/category/accessories/clutch" },
            { title: "Designer Bags", path: "/category/accessories" },
          ],
        },
        {
          heading: "New & Trending >",
          links: [
            { title: "New Arrivals In Clutches", path: "#" },
            { title: "Contemporary Trending", path: "#" },
            { title: "New Fashion Designs", path: "#" },
            { title: "Trending Colors Designs", path: "#" },
          ],
        },
      ],
    },
    {
      title: "Business To Business",
      path: "#",
      megaMenu: [
        {
          heading: "Business To Business >",
          links: [
            { title: "Investor Relations", path: "/women/clothing/womens-wear" },
            { title: "Inventory Details", path: "#" },
            { title: "Digital Purchase Order", path: "#" },
            { title: "Latest Updates", path: "#" },
          ],
        },
      ],
    },
  ];


  return (
    <header>
      {/* Top Links (Sign In, Contact Us, etc.) */}
      <div className="top-nav">
        <div className="container">
          <ul>
            {topLinks.map((link, i) => {
              // If the user is logged in or guest is active, hide the "Sign In" link
              if (link.title === "Sign In" && (user || guest)) return null;
              return (
                <li key={i}>
                  <Link to={link.path}>{link.title}</Link>
                </li>
              );
            })}

            {/* If user is logged in, show their name and Sign Out button */}
            {user && (
              <>
                <li>Welcome, {user.name || user.email}</li>
                <li><SignOutButton onSignOut={signOut} /></li>
                <li>
                  <Link to="/purchase-order/form">
                    {/* <span className="cart-icon">Purchase Order</span> */}
                    <span className="cart-count">{poItems?.length || 0}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/purchase-history">Purchase History</Link>
                </li>
              </>
            )}

            {/* If guest is active, show welcome message and sign out button */}
            {!user && guest && (
              <>
                <li>Welcome, {guest.name}</li>
                <li>
                  <button onClick={endGuestSession} className="signout-btn">
                    Sign Out
                  </button>
                </li>
                <li>
                  <Link to="/purchase-order/form">
                    {/* <span className="cart-icon">Purchase Order</span> */}
                    <span className="cart-count">{poItems?.length || 0}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/purchase-history">Purchase History</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Main Navbar with category menu items */}
      <nav className="navbar">
        <div>
          <Link to="/">
            <img src="/images/logo.png" alt="logo" className="logo" />
          </Link>
        </div>
        <ul className="menu">
          {menuData.map((menu, i) => (
            <li
              key={i}
              className="menu-item"
              onMouseEnter={() => setActiveMenu(i)} // Show mega menu on hover
              onMouseLeave={() => setActiveMenu(null)} // Hide mega menu on hover out
            >
              <Link to={menu.path} className="menu-title">{menu.title}</Link>

              {/* Mega Menu (will show when hovering on the menu item) */}
              <div className={`mega-menu ${activeMenu === i ? "show" : ""} ${forceHide ? "force-hidden" : ""}`}>
                {menu.megaMenu.map((section, idx) => (
                  <div key={idx} className="mega-section">
                    <h4>{section.heading}</h4>
                    <ul>
                      {section.links.map((link, k) => (
                        <li key={k}>
                          <Link
                            to={link.path}
                            onClick={() => {
                              // Immediately hide mega menu when a submenu is clicked
                              setActiveMenu(null);
                              setForceHide(true);
                              setTimeout(() => setForceHide(false), 300);
                            }}
                          >
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;