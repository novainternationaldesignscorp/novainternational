import React from "react";
import "./CSS/privacynotice.css";

const PrivacyNotice = () => {
  return (
    <div className="privacy-container">
      <img src="images/logo.png" alt="Nova International Designs Logo" className="logo-heading"></img>
      <h1>Privacy Notice</h1>
      <p className="update">Last updated: March 2026</p>

      <p>
        Nova International Designs Corporation is committed to protecting your
        privacy. This Privacy Notice explains how we collect, use, and safeguard
        information when you visit <strong>www.novainternationaldesigns.com</strong>.
      </p>

      <p className="red-text">
        Nova International Designs Corporation is a NO Show Business and is not directly or indirectly NOT linked with Video gaming or entertainment digitalization  and we do not accept any bitcoins or crypto or money with QR code scanning's
      </p>

      <p className="red-text">
        We will only accept payments via credit or debit cards and by legal bank to bank wire transfers
      </p>
      
      <h2>1. Information We Collect</h2>

      <p>
        We follow a minimal data collection approach and only collect information
        necessary for business and to complete orders.
      </p>

      <h3>1.1 Information You Provide</h3>

      <p>
        We collect information you voluntarily provide when you create an
        account, place an order, or contact us:
      </p>

      <ul>
        <li>Name — to identify your account and process orders</li>
        <li>Email address — for login, order updates, and communication</li>
        <li>Password — stored securely using industry-standard encryption (bcrypt)</li>
        <li>Order details — items purchased, quantities, pricing, and shipping information</li>
        <li>Business information — company name, address, or tax details (if provided)</li>
      </ul>

      <p>We do not collect sensitive personal information.</p>

      <h3>1.2 Payment Information</h3>

      <p>
        Payments are processed securely by Stripe. We do not store or access your
        full card details on our servers.
      </p>

      <h3>1.3 Automatically Collected Information</h3>

      <p>
        When you visit <strong>www.novainternationaldesigns.com</strong> the Site
        automatically collects limited technical information such as:
      </p>

      <ul>
        <li>IP address</li>
        <li>Browser type</li>
        <li>Pages visited</li>
        <li>Device and session identifiers</li>
      </ul>

      <p>
        This information is used solely to maintain security, prevent fraud, and
        ensure proper functionality.
      </p>

      <h2>2. How We Use Your Information</h2>

      <p>We use your information to:</p>

      <ul>
        <li>Process, complete, and deliver orders</li>
        <li>Send order confirmations and status updates</li>
        <li>Manage your account and provide customer support</li>
        <li>Maintain security within our systems</li>
        <li>Comply with legal, tax, and regulatory obligations</li>
      </ul>

      <p>
        We do not use your information for advertising or marketing and we do
        not sell or rent your data.
      </p>

      <h2>3. How We Share Your Information</h2>

      <p>
        We share information only with trusted service providers who help us
        operate our business:
      </p>

      <ul>
        <li>Stripe — payment processing</li>
        <li>Cloudinary — secure image hosting for product photos</li>
        <li>MongoDB Atlas — encrypted cloud database hosting</li>
        <li>Hosting and infrastructure providers — for Site operation</li>
      </ul>

      <p>
        These providers are contractually required to protect your information
        and use it only as needed to perform their services.
      </p>

      <p>
        We may also disclose information if required by law or in response to
        valid legal requests.
      </p>

      <h2>4. Cookies</h2>

      <p>
        Our Site uses only essential cookies required for secure operation,
        including:
      </p>

      <ul>
        <li>Session cookies (e.g., connect.sid)</li>
        <li>Authentication cookies</li>
        <li>Security and CSRF protection cookies</li>
      </ul>

      <p>These cookies:</p>

      <ul>
        <li>Do not track you across other websites</li>
        <li>Do not collect marketing or analytics data</li>
        <li>Are deleted when you log out or close your browser</li>
      </ul>

      <p>We do not use advertising, tracking, or analytics cookies.</p>

      <h2>5. Data Security</h2>

      <p>
        We take data security seriously and implement industry-standard
        measures, including:
      </p>

      <ul>
        <li>HTTPS encryption across the entire Site</li>
        <li>Encrypted password storage using bcrypt</li>
        <li>Secure session management</li>
        <li>Regular security assessments and vulnerability checks</li>
        <li>PCI-compliant payment processing handled entirely by Stripe</li>
      </ul>

      <p>
        While we take reasonable precautions, no method of transmission or
        storage is completely secure.
      </p>

      <h2>6. Data Retention</h2>

      <p>
        We retain information only as long as necessary to:
      </p>

      <ul>
        <li>Provide services and maintain your account</li>
        <li>Complete orders and support transactions</li>
        <li>Meet tax, accounting, and legal requirements</li>
      </ul>

      <p>
        Order records are retained for at least 7 years for compliance purposes.
      </p>

      <p>
        You may request deletion of your account and associated data at any
        time.
      </p>

      <h2>7. Your Rights</h2>

      <p>You may request to:</p>

      <ul>
        <li>Access the personal information we hold</li>
        <li>Correct inaccurate information</li>
        <li>Delete your account and associated data</li>
        <li>Object to certain types of processing</li>
      </ul>

      <p>
        To exercise these rights, contact us at
        <strong> info@novainternationaldesigns.com</strong>.
      </p>

      <p>We respond to all requests within 30 days.</p>

      <h2>8. Children’s Privacy</h2>

      <p>
        This Site is intended for business use only and is not directed to
        individuals under the age of 18.
      </p>


        <p>Email - info@novainternationaldesigns.com</p>
        <p>www.novainternationaldesigns.com</p>

    </div>
  );
};

export default PrivacyNotice;