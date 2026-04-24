import React, { useContext, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { useGuest } from "../../context/GuestContext.jsx";
import SignOutButton from "../SignOutButton";
import { usePO } from "../../context/PurchaseOrderContext.jsx";
import "./navbar.css";

/* ✅ MOVE STATIC DATA OUTSIDE */
const TOP_LINKS = [
  { title: "About Us", path: "/about" },
  { title: "Gift Cards", path: "#" },
  { title: "Sign In", path: "/signin" },
  { title: "Contact Us", path: "/contact" },
  { title: "Careers", path: "/careers" },
];

  // Menu Data
  const MENU_DATA = [
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
            { title: "Tops", path: "/category/fashion/women" },
            { title: "Dresses", path: "/category/fashion/women" },
          ],
        },
        {
          heading: "More Sizes >",
          links: [
            { title: "Plus Sizes", path: "#" },
            { title: "Petites", path: "/category/fashion/women" },
            { title: "Juniors & Young Adult", path: "/category/fashion/women" },
            { title: "Maternity", path: "#" },
          ],
        },
        {
          heading: "New & Trending >",
          links: [
            { title: "New Arrivals In Women", path: "/products" },
            { title: "Contemporary Trending", path: "/products" },
            { title: "New Fashion Designs", path: "/products" },
            { title: "Trending Colors Designs", path: "/products" },
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
            { title: "Vacuum Sealing Machine", path: "/product/vacuum-sealing-machine" },
            // { title: "Kitchenware Vacuum Sealers", path: "/product/kitchenware-vacuum-sealers" },
            // { title: "Technologically Advance Vacuum Sealers", path: "/product/technologically-advance-vacuum-sealers" },
          ],
        },
        {
          heading: "Speakers & Audio >",
          links: [
            { title: "Campfire Light And Musical Speaker", path: "/product/campfire-light-and-musical-speaker" },
            // { title: "Campfire Bluetooth Speakers", path: "/product/campfire-bluetooth-speakers" },
            // { title: "Technologically Advanced Bluetooth Speakers", path: "/product/technologically-advanced-bluetooth-speakers" },
          ],
        },
        {
          heading: "Fans >",
          links: [
            // { title: "Technologically Advanced Fans", path: "/product/technologically-advanced-fans" },
            { title: "Bladeless Fans", path: "/product/bladeless-fan" },
            // { title: "Musical Fans", path: "/product/musical-fans" },
          ],
        },
        {
          heading: "Digital Photo Frame >",
          links: [
            { title: "Digital Photo Frames", path: "/product/digital-photo-frame" },
          ],
        },
        {
          heading: "Kids Tech and Electronics >",
          links: [
            // { title: "Kids Robot", path: "/product/kids-robot" },
            { title: "Nova T2 Robot", path: "/product/nova-t2-robot" },
          ],
        },
        {
          heading: "New & Trending >",
          links: [
            { title: "New Arrivals In Electronics", path: "/products" },
            { title: "Contemporary Trending", path: "/products" },
            { title: "New Electronics Designs", path: "/products" },
            { title: "Trending Colors Designs", path: "/products" },
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
            { title: "Jute Bag", path: "/category/accessories/jute-bag" },
            { title: "Evening Designer Bags", path: "/category/accessories/bags" },
            { title: "Designer Bags", path: "/category/accessories" },
          ],
        },
        {
          heading: "New & Trending >",
          links: [
            { title: "New Arrivals In Designer Bags", path: "/category/accessories" },
            { title: "Contemporary Trending", path: "/category/accessories" },
            { title: "New Fashion Designs", path: "/category/accessories" },
            { title: "Trending Colors Designs", path: "/category/accessories" },
          ],
        },
      ],
    },
    {
      title: "Wedding Gifts",
      path: "/category/wedding-gifts",
      megaMenu: [
        {
          heading: "Wedding Gifts >",
          links: [
            { title: "Wedding Gift Box", path: "/category/wedding-gifts" },
          ],
        },
        {
          heading: "New & Trending >",
          links: [
            { title: "New Arrivals In Wedding Gift Box", path: "/products" },
            { title: "Contemporary Trending", path: "/products" },
            { title: "New Fashion Designs", path: "/products" },
            { title: "Trending Colors Designs", path: "/products" },
          ],
        },
      ],
    },
    {
      title: "Nova Chocolates",
      path: "/category/nova-chocolates",
      megaMenu: [
        {
          heading: "Nova Chocolates >",
          links: [
            { title: "Nova Chocolate Box", path: "/category/nova-chocolates/nova-chocolate-box" },
            { title: "Nova Chocolate Bar", path: "/category/nova-chocolates/nova-chocolate-bar" },
          ],
        },
        {
          heading: "New & Trending >",
          links: [
            { title: "New Arrivals In Nova Chocolates", path: "/products" },
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
            { title: "Investor Relations", path: "/investor-relations" },
            { title: "Inventory Details", path: "#" },
            { title: "Digital Purchase Order", path: "/purchase-order/form" },
            { title: "Latest Updates", path: "#" },
          ],
        },
      ],
    },
  ];

const Navbar = () => {
  const { user, signOut, loading } = useContext(UserContext);
  const { guest, endGuestSession } = useGuest();
  const { poItems } = usePO();

  const [activeMenu, setActiveMenu] = useState(null);
  const [forceHide, setForceHide] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState(null);

  /* ✅ MEMO (prevents recreation every render) */
  const topLinks = useMemo(() => TOP_LINKS, []);
  const menuData = useMemo(() => MENU_DATA, []);

  /* ✅ STABLE HANDLERS */
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleMobileSubMenu = useCallback((i) => {
    setActiveMobileMenu((prev) => (prev === i ? null : i));
  }, []);

  if (loading) return null;

  return (
    <header>
      {/* TOP NAV */}
      <div className="top-nav">
        <div className="container">
          <ul>
            {topLinks.map((link, i) => {
              if (link.title === "Sign In" && (user || guest)) return null;
              return (
                <li key={i}>
                  <Link to={link.path}>{link.title}</Link>
                </li>
              );
            })}

            {user?.role === "admin" && (
              <li>
                <Link to="/admin/products">Admin</Link>
              </li>
            )}

            {user && (
              <>
                <li>Welcome, {user.name || user.email}</li>
                <li><SignOutButton onSignOut={signOut} /></li>
                <li>
                  <Link to="/purchase-order/form">
                    <span className="cart-count">{poItems?.length || 0}</span>
                  </Link>
                </li>
                <li><Link to="/purchase-history">Purchase History</Link></li>
              </>
            )}

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
                    <span className="cart-count">{poItems?.length || 0}</span>
                  </Link>
                </li>
                <li><Link to="/purchase-history">Purchase History</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* MAIN NAV */}
      <nav className="navbar">
        <div>
          <Link to="/">
            <img src="/images/logo.png" alt="logo" className="logo" />
          </Link>
        </div>

        {/* ✅ FIXED handler */}
        <div className="menu-toggle" onClick={toggleMobileMenu}>
          ☰
        </div>

        <ul className={`menu ${mobileMenuOpen ? "active" : ""}`}>
          {menuData.map((menu, i) => (
            <li
              key={i}
              className={`menu-item ${activeMobileMenu === i ? "active" : ""}`}
              onMouseEnter={() =>
                window.innerWidth > 768 && setActiveMenu(i)
              }
              onMouseLeave={() =>
                window.innerWidth > 768 && setActiveMenu(null)
              }
            >
              <div
                className="menu-title"
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    toggleMobileSubMenu(i);
                  }
                }}
              >
                <Link to={menu.path}>{menu.title}</Link>
              </div>

              <div
                className={`mega-menu 
                  ${activeMenu === i ? "show" : ""} 
                  ${activeMobileMenu === i ? "show-mobile" : ""} 
                  ${forceHide ? "force-hidden" : ""}`}
              >
                {menu.megaMenu.map((section, idx) => (
                  <div key={idx} className="mega-section">
                    <h4>{section.heading}</h4>
                    <ul>
                      {section.links.map((link, k) => (
                        <li key={k}>
                          <Link
                            to={link.path}
                            onClick={() => {
                              setActiveMenu(null);
                              setActiveMobileMenu(null);
                              setMobileMenuOpen(false);
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

/* ✅ PREVENT RE-RENDER */
export default React.memo(Navbar);