import React from "react";
import "./CSS/cookiepolicy.css";

const CookiePolicy = () => {
  return (
    <div className="cookie-container">
      <h1>Nova International Designs</h1>
      <h2>Cookie Policy</h2>

      <p className="effective-date">
        <strong>Effective Date:</strong> March 1, 2026
      </p>

      <p className="website-link">www.novainternationaldesigns.com</p>

      <section>
        <h3>1. Introduction</h3>
        <p>
          This Cookie Policy explains how Nova International Designs ("we",
          "us," or "our") uses cookies and similar technologies on our website
          at www.novainternationaldesigns.com. This policy should be read
          together with our Privacy Policy.
        </p>

        <p>
          We are committed to transparency about the cookies we use. This policy
          reflects our actual cookie usage — we only use cookies that are
          strictly necessary for the website to function or that support basic
          functionality.
        </p>
      </section>

      <section>
        <h3>2. What Are Cookies?</h3>

        <p>
          Cookies are small text files stored on your device (computer, tablet,
          or mobile) when you visit a website. They help websites work
          correctly, maintain security, and support basic features.
        </p>

        <p>Cookies can be:</p>

        <ul>
          <li>
            <strong>Session cookies</strong> — temporary, deleted automatically
            when you close your browser
          </li>

          <li>
            <strong>Persistent cookies</strong> — remain on your device until
            they expire or you delete them
          </li>

          <li>
            <strong>First-party cookies</strong> — set directly by our website
          </li>

          <li>
            <strong>Third-party cookies</strong> — set by external services we
            use (such as Stripe for payments)
          </li>
        </ul>
      </section>

      <section>
        <h3>3. Cookies We Use</h3>

        <p>We use only essential and functional cookies. We do NOT use:</p>

        <ul>
          <li>Analytics cookies (e.g. Google Analytics)</li>
          <li>Advertising or retargeting cookies</li>
          <li>Social media tracking pixels</li>
          <li>Behavioral tracking or profiling cookies</li>
        </ul>
      </section>

      <section>
        <h3>3.1 Strictly Necessary Cookies</h3>

        <p>
          These cookies are required for our website to operate correctly and
          cannot be disabled.
        </p>

        <ul>
          <li>Session authentication cookies</li>
          <li>Security cookies (CSRF tokens)</li>
          <li>Load balancing cookies</li>
          <li>Stripe payment cookies</li>
        </ul>

        <p className="legal-basis">
          <strong>Legal basis:</strong> Legitimate interest / Necessary for the
          performance of a contract
        </p>
      </section>

      <section>
        <h3>3.2 Functional Cookies</h3>

        <p>
          These cookies support basic features and improve your experience
          without tracking you across other websites.
        </p>

        <ul>
          <li>
            Guest session identifiers — allow non-registered users to use the
            shopping cart temporarily
          </li>
        </ul>

        <p className="legal-basis">
          <strong>Legal basis:</strong> Legitimate interest
        </p>
      </section>

      <section>
        <h3>3.3 Third-Party Service Cookies</h3>

        <p>
          The following third-party services may set cookies when you use our
          website.
        </p>

        <ul>
          <li>Stripe — payment processing and fraud prevention</li>
          <li>Cloudinary — secure media delivery and image optimization</li>
        </ul>
      </section>

      <section>
        <h3>4. Cookie Details</h3>

        <table className="cookie-table">
          <thead>
            <tr>
              <th>Cookie Name</th>
              <th>Type</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>connect.sid</td>
              <td>Necessary</td>
              <td>User session authentication</td>
              <td>Session</td>
            </tr>

            <tr>
              <td>csrfToken</td>
              <td>Necessary</td>
              <td>Security protection against CSRF attacks</td>
              <td>Session</td>
            </tr>

            <tr>
              <td>guestId</td>
              <td>Functional</td>
              <td>Guest session management</td>
              <td>30 days</td>
            </tr>

            <tr>
              <td>stripe.sid</td>
              <td>Third-party</td>
              <td>Secure payment processing</td>
              <td>Session</td>
            </tr>

            <tr>
              <td>GoDaddy LB</td>
              <td>Necessary</td>
              <td>Load balancing for hosting stability</td>
              <td>Session</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>5. Why No Cookie Banner?</h3>

        <p>
          Because we only use strictly necessary and functional cookies required
          for the website to operate, we are not legally required to display a
          cookie consent banner.
        </p>

        <p>
          These cookies do not track you for advertising purposes and do not
          require prior consent.
        </p>
      </section>

      <section>
        <h3>6. How to Control Cookies</h3>

        <h4>6.1 Browser Settings</h4>

        <p>You can manage or delete cookies through your browser settings.</p>

        <h4>6.2 Browser-Specific Instructions</h4>

        <ul>
          <li>Google Chrome: Settings &gt; Privacy and Security</li>
          <li>Mozilla Firefox: Settings &gt; Privacy & Security</li>
          <li>Microsoft Edge: Settings &gt; Cookies and site permissions</li>
          <li>Safari: Preferences &gt; Privacy</li>
        </ul>
      </section>

      <section>
        <h3>7. Do Not Track</h3>

        <p>
          Our website does not currently respond to Do Not Track signals.
          Because we do not use tracking or analytics cookies, DNT has no
          practical effect.
        </p>
      </section>

      <section>
        <h3>8. Changes to This Policy</h3>

        <p>
          We may update this Cookie Policy from time to time to reflect changes
          in our technology or legal requirements.
        </p>
      </section>

      <section>
        <h3>9. Contact Us</h3>

        <p>
          If you have any questions about how we use cookies, please contact us:
        </p>

        <ul>
          <li>Nova International Designs</li>
          <li>Email: <a href="mailto:info@novainternationaldesigns.com">info@novainternationaldesigns.com</a></li>
          <li>Website: <a href="http://www.novainternationaldesigns.com">www.novainternationaldesigns.com</a></li>
        </ul>
      </section>

      <p className="policy-footer">
        This Cookie Policy is effective as of March 1, 2026.
      </p>
    </div>
  );
};

export default CookiePolicy;