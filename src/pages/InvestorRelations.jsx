import React from "react";
import "./CSS/investorrelations.css";

function InvestorRelations() {
  return (
    <div className="investor-page">

      <div className="investor-logo">
        <img src="/images/logo2.png" alt="Nova International Designs Corporation Logo" />
      </div>

      <div className="investor-header">
        <h2>Investor Relations</h2>
      </div>

      <section className="investor-section">
        <p>
          Nova International Designs Corporation located in Naperville, IL is a
          women-owned buying office with an e-commerce business-to-business presence.
        </p>

        <p className="red-text">
          Nova International Designs Corporation is a NO Show Business and is not directly or indirectly NOT linked with Video gaming or entertainment digitalization  and we do not accept any bitcoins or crypto or money with QR code scanning's
        </p>

        <p className="red-text">
          We will only accept payments via credit or debit cards and by legal bank to bank wire transfers
        </p> 
        <p>
          The company specializes in Fashion and Electronics, supplying its own
          brand while partnering with other businesses.
        </p>

        <p>
          It combines strong business sense with a modern, secure B2B model,
          creating a powerful blend with buying office and e-commerce platform.
        </p>

        <p>
          As a women-owned business, Nova International Designs Corpororation brings a unique perspective to the B2B
          supply chain.
        </p>
      </section>

      <section className="investor-section">
        <h3>Core Values</h3>
        <ul className="investor-list">
          <li>Integrity</li>
          <li>Quality</li>
          <li>Empowerment</li>
          <li>Innovation</li>
          <li>Reliability</li>
        </ul>
      </section>

      <section className="investor-section">
        <h3>Community</h3>
        <ul className="investor-list">
          <li>Active in Naperville, Illinois business community</li>
          <li>Mentorship and community support initiatives</li>
          <li>Commitment to local engagement</li>
        </ul>
      </section>

      <section className="investor-section">
        <h3>Investment & Contact</h3>
        <p>
          Interested in investing or learning more?
        </p>
      <p>Email - info@novainternationaldesigns.com</p>
      <p>www.novainternationaldesigns.com</p>
      </section>

    </div>
  );
}

export default InvestorRelations;