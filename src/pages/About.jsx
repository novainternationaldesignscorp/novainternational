import React from "react";
import "./CSS/about.css";

const About = () => {
  return (
    <div className="about-page">
      <p><img src="images/logo2.png" alt="Nova International Designs Logo"></img></p>
      <p className="red-text">
        Nova International Designs Corporation is a NO Show Business and is not directly or indirectly NOT linked with Video gaming or entertainment digitalization  and we do not accept any bitcoins or crypto or money with QR code scanning's
      </p>

      <p className="red-text">
        We will only accept payments via credit or debit cards and by legal bank to bank wire transfers
      </p>

      <p>
        Nova International Designs Corporation is in Naperville, Illinois and is a women owned Business  with Various Business line including Fashion and Electronics and more.
      </p>

      <p>
        The company strictly focusing on consumer lifestyle and luxury goods with quality checks and is a NO SHOW Business and is Directly or indirectly not linked with any video gaming or digital money market  and does not accept crypto and Bitcoins and does not Offer QR code based transactions.
      </p>

      <p>
        Identifying the perfect supplier for your business requirements is always considered to be the most critical for the success in any business. Considering multiple factors such as cost, quality, consistency, on-time delivery, meeting regulations, compliances, and much more.
      </p>

      <p>
        As a sourcing partner, we help businesses meet their requirements at guaranteed competitive prices.
      </p>

      <p>
       Nova Chocolates with Nova International Designs Corporation collection offers a sophisticated gourmet option for high-end Corporate gifting and special occasions
      </p>
      <p>
        Nova International Designs Corporation is a Business to Business with it's Buying Office in Naperville, IL .
      </p>

      <p>
        Contact Information: For Business inquiries or Questions you can email at: ritika@novainternationaldesigns.com
      </p>

      <h2 className="team-heading">Meet The Team</h2>

      <table className="team-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Role</th>
            <th>Profile</th>
            <th>Linked In</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <img src="images/Ritika-photo.JPG" alt="Ritika" className="team-photo" />
            </td>
            <td>Ritika</td>
            <td>Founder and Owner for Nova International Designs Corporation</td>
            <td>Ritika has over 15 plus years experience in Various Business lines and has completed her Masters Degree in International Business Management .</td>
            <td>Linked In : https://www.linkedin.com/in/ritika-aurora-81797b35</td>
          </tr>

          <tr>
            <td>
              <img src="/images/Shila-photo.jpeg" alt="Shila Pattewar" className="team-photo" />
            </td>
            <td>Shila Pattewar</td>
            <td>Software Developer</td>
            <td>Shila has extensive experience in software development and has contributed to various projects within Nova International Designs Corporation.</td>
            <td>Linked In : https://www.linkedin.com/in/shila-front-end-developer/ </td>
          </tr>

          <tr>
            <td>
              <img src="/images/Kmohana-photo.jpg" alt="Krishna Mohana" className="team-photo" />
            </td>
            <td>Krishna Mohana</td>
            <td>Cyber Security Engineer</td>
            <td>Krishna has extensive experience in cyber security and that helps ensure the safety and security in Nova International Designs Corporation.</td>
            <td>Linked In : https://www.linkedin.com/in/mohana-krishna-chaganti-914823249</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default About;