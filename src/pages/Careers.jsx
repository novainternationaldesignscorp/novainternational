import React from "react";
import "./CSS/careers.css";

const Careers = () => {
  return (
    <div className="careers-page">

      {/* Job Opening 1 */}
      {/* <div className="job-page">      
        <header className="job-header">
          <h1>Nova International Designs Corporation</h1>
          <h2>Print Media Model Walk-In Interviews</h2>
          <p><strong>Location:</strong> Naperville, IL</p>
        </header>

        <section className="job-intro">
          <p>
            Nova International Designs Corporation has an opening for a
            <strong> Print Media Model</strong>. Walk-ins are welcome for interviews.
          </p>
        </section>

        <section className="job-description">
          <h3>Job Description</h3>
          <p>
            A print media model poses for still photography used in advertisements,
            magazines, catalogs, and product packaging.
          </p>
        </section>

        <section className="job-responsibilities">
          <h3>Job Responsibilities</h3>
          <ul>
            <li>Participate in commercial or editorial photo shoots.</li>
            <li>Work with photographers and stylists to achieve the desired look.</li>
            <li>Represent various fashion and lifestyle brands.</li>
          </ul>
        </section>

        <section className="job-footer">
          <h3>Walk-In Interviews Welcome</h3>
          <p>
            Interested candidates are encouraged to attend the walk-in interview
            during the scheduled time.
          </p>
        </section>
                <section className="job-event">
          <h3>Interview Details</h3>
          <ul>
            <li><strong>Date:</strong> Wednesday, March 11, 2026</li>
            <li><strong>Time:</strong> 9:30 AM - 1:30 PM (Central Time)</li>
            <li><strong>Location:</strong></li>
          </ul>

          <p>
            Nova International Designs Corporation <br />
            1755 Park St, Second Floor <br />
            Naperville, IL
          </p>
          <button className="careers-apply-btn"><a href="mailto:ritika@novainternationaldesigns.com">Apply Now</a></button>
        </section>
      </div> */}

      {/* <hr /> */}

      {/* Job Opening 2 */}
      <div className="job-page">
        <header className="job-header">
          <h1>Nova International Designs Corporation</h1>
          <h2>Sales Representative</h2>
          <p><strong>Location:</strong> Naperville, IL</p>
        </header>

        <section className="job-description">
          <h3>Job Responsibilities</h3>
          <p>
            As a Sales Representative you will be responsible for delivering
            presentations, negotiating contracts, building lasting client
            relationships, and achieving sales targets.
          </p>

          <ul>
            <li>
              Identify new leads, engage potential customers through cold
              calling/emailing, and deliver presentations.
            </li>
            <li>
              Maintain strong relationships with existing clients to encourage
              repeat business and provide excellent customer service.
            </li>
            <li>
              Deliver and exceed weekly, monthly, and annual sales quotas.
            </li>
            <li>
              Negotiate contract terms, pricing, and delivery schedules to
              confirm orders.
            </li>
            <li>
              Monitor industry trends and competitor activity to adjust sales
              strategies.
            </li>
          </ul>
        </section>

        <section className="job-requirements">
          <h3>Required Qualifications</h3>
          <ul>
            <li>
              Exceptional verbal and written communication skills for
              presentations and negotiations.
            </li>
            <li>Ability to build rapport and trust with clients.</li>
            <li>Highly motivated and driven to achieve sales targets.</li>
            <li>
              Experience with CRM software (e.g., Salesforce) and Microsoft
              Office Suite.
            </li>
            <li>High school diploma or equivalent is required.</li>
            <li>Bachelor's degree in Business or Marketing is preferred.</li>
            <li>Often includes competitive pay structure.</li>
          </ul>
        </section>
        <button className="careers-apply-btn"><a href="mailto:ritika@novainternationaldesigns.com">Apply Now</a></button>
      </div>

    </div>
  );
};

export default Careers;