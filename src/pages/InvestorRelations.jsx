import React from "react";
import "./CSS/investorrelations.css";

function InvestorRelations() {
  return (
    <div className="investor-page">

      <div className="investor-logo">
        <img src="/images/logo.png" alt="Nova Logo" />
      </div>

      <div className="investor-header">
        <h1>Nova International Designs Corporation</h1>
        <h2>Investor Relations</h2>
      </div>

      <section className="investor-section">
        <p>
          Nova International Designs Corporation located in Naperville, IL is a
          women-owned buying office with an e-commerce business-to-business presence.
        </p>

        <p>
          The company specializes in Fashion and Electronics, supplying its own
          brand while partnering with other businesses.
        </p>

        <p>
          It combines strong business sense with a modern, secure B2B model,
          creating a powerful blend of buying office and e-commerce platform.
        </p>

        <p>
          As a women-owned business, Nova brings a unique perspective to the B2B
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
          Interested in investing or learning more? Reach out to us:
        </p>

        <div className="investor-contact">
          <a
            href="mailto:info@novainternationaldesigns.com"
            className="investor-btn"
          >
            Email Us
          </a>

          <a
            href="http://www.novainternationaldesigns.com"
            target="_blank"
            rel="noreferrer"
            className="investor-link"
          >
            Visit Website
          </a>
        </div>
      </section>

    </div>
  );
}

export default InvestorRelations;