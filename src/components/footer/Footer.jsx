import React from "react";
import "./footer.css";


const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-container">

        <div className="footer-col">
          <h4>Customer Service</h4>
          <ul>
            <li><a href="cookiepolicy">Cookie Policy</a></li>
            <li><a href="privacynotice">Privacy Notice</a></li>
            <li><a href="legalnotice">Legal Notice</a></li>
            <li><a href="termsconditions">Terms & Conditions</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>My Account</h4>
          <ul>
            <li><a href="signin">Sign In</a></li>         
            <li><a href="#">Gift Cards</a></li>
           
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="about">About Us</a></li>
            <li><a href="careers">Careers</a></li>
            <li><a href="contact">Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© Nova International Designs Corporation.<br />All rights reserved.</p>
      </div>

      <div className="social-icons">
        <a href="https://www.facebook.com/profile.php?id=61584196192112" target="_blank"><img src="/images/facebook-logo.png" alt="Facebook" /></a>
        <a href="https://www.instagram.com/novainternationaldesigns/" target="_blank"><img src="/images/instagram-logo.png" alt="Instagram" /></a>
        <a href="https://www.linkedin.com/in/ritika-aurora-81797b35" target="_blank"><img src="/images/linkedIn-logo.png" alt="LinkedIn" /></a>
        <a href="#" target="_blank"><img src="/images/x_logo.png" alt="X" /></a>
      </div>
    </div>
  );
};

export default Footer;