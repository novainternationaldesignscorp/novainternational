import React from "react";
import "./CSS/about.css";

const About = () => {
  return (
    <div className="about-page">
      <p>
        <img src="images/logo2.png" alt="Nova International Designs Logo" />
      </p>

      <p className="red-text">
        Nova International Designs Corporation is a NO Show Business and is not directly or indirectly linked with video gaming or entertainment digitalization. We do not accept any bitcoins, crypto, or QR code payments.
      </p>

      <p className="red-text">
        Payments are accepted only via credit/debit cards or legal bank-to-bank wire transfers.
      </p>

      <p>
        Nova International Designs Corporation is located in Naperville, Illinois and is a women-owned business with various lines including Fashion, Electronics, and more.
      </p>

      <p>
        The company focuses on consumer lifestyle and luxury goods with quality checks. It is a NO SHOW Business and is not linked with any video gaming or digital money markets. Crypto, Bitcoin, and QR code transactions are not accepted.
      </p>

      <h2 className="team-heading">Meet The Team</h2>

      <div className="team-member">
        <img src="images/Ritika-photo.JPG" alt="Ritika" className="team-photo" />
        <div className="team-info">
          <p><strong>Name:</strong> Ritika</p>
          <p><strong>Designation:</strong> Founder and Owner</p>
          <p><strong>Experience:</strong> Over 15 years in various business lines, Master's in International Business Management</p>
          <p>
            <a href="https://www.linkedin.com/in/ritika-aurora-81797b35" target="_blank" >
              LinkedIn Account
            </a>
          </p>
        </div>
      </div>

      <div className="team-member">
        <img src="images/Shila-photo.jpeg" alt="Shila Pattewar" className="team-photo" />
        <div className="team-info">
          <p><strong>Name:</strong> Shila Pattewar</p>
          <p><strong>Designation:</strong> Software Developer</p>
          <p><strong>Experience:</strong> Extensive experience in software development and contributed to various projects at Nova International Designs Corporation</p>
          <p>
            <a href="https://www.linkedin.com/in/shila-front-end-developer/" target="_blank" >
              LinkedIn Account
            </a>
          </p>
        </div>
      </div>

      <div className="team-member">
        <img src="images/Kmohana-photo.jpg" alt="Krishna Mohana" className="team-photo" />
        <div className="team-info">
          <p><strong>Name:</strong> Krishna Mohana</p>
          <p><strong>Designation:</strong> Cyber Security Engineer</p>
          <p><strong>Experience:</strong> Experience in cyber security ensuring safety and security at Nova International Designs Corporation</p>
          <p>
            <a href="https://www.linkedin.com/in/mohana-krishna-chaganti-914823249" target="_blank" >
              LinkedIn Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;