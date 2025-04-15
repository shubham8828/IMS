import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      // When a popstate event occurs, redirect to /home
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  return (
    <div className="main-container">
      <div className="about-container">
        <h2>About AIMPS</h2>
        <p>
          Welcome to AIMPS (Advanced Invoice Management & Payment Solutions),
          your one-stop platform for streamlining invoicing and payment processes.
          Our goal is to offer a seamless solution for businesses and individuals
          looking to manage their invoicing more efficiently, effectively eliminating
          the complexities of traditional methods.
        </p>
      </div>
      <div className="about-container">
        <h2>What We Offer</h2>
        <ul>
          <li>
            Automated Invoice Creation: Generate invoices in seconds with our
            automated system, reducing time spent on manual entries.
          </li>
          <li>
            Customizable Invoice Templates: Tailor invoices to reflect your
            brand with our diverse range of templates.
          </li>
          <li>
            Smart Payment Solutions via QR Codes and Payment Gateways: Accept
            payments easily through integrated QR codes and a variety of payment
            gateways.
          </li>
          <li>
            AI-driven Insights and Advanced Reporting: Utilize our AI tools to
            gain valuable insights and create detailed reports to track your
            financial health.
          </li>
          <li>
            Tax Calculation and Management Tools: Simplify your tax obligations
            with automated calculations and organized record-keeping.
          </li>
        </ul>
      </div>
      <div className="about-container">
        <h2>Our Mission</h2>
        <p>
          At AIMPS, our mission is to make invoice management smarter and easier.
          We aim to reduce manual work, improve accuracy, and offer a reliable platform
          that helps businesses of all sizes handle their financial processes effectively.
          We believe in empowering our users with tools that enhance productivity and
          decision-making, paving the way for their growth.
        </p>
      </div>
      <div className="about-container">
        <h2>Why Choose AIMPS?</h2>
        <p>
          AIMPS stands out with its user-friendly interface, powerful automation
          features, and AI-enhanced tools. Our platform adapts to the unique needs
          of each business, whether you're a small startup or a large enterprise,
          ensuring efficient financial management. We prioritize customer satisfaction,
          providing exceptional support and regular updates to enhance your experience.
        </p>
      </div>
      <div className="about-container">
        <h2>Our Team</h2>
        <p>
          AIMPS is developed by a dedicated team of passionate individuals,
          including <strong>Shubham Vishwakarma</strong> and{" "}
          <strong>Vikas Vishwakarma</strong>, under the guidance of{" "}
          <strong>Prof. Vandana Maurya</strong> at BK Birla College of Arts,
          Commerce & Science, Kalyan. We believe in continuous innovation to
          meet the ever-evolving needs of our users, driven by feedback and
          technological advancements.
        </p>
      </div>

      <div className="about-container">
        <h2>Customer Testimonials</h2>
        <p>
          Our users have expressed their satisfaction with AIMPS, highlighting
          its ease of use and effectiveness. Here’s what some of them say:
        </p>
        <blockquote>
          “AIMPS has transformed the way I handle invoicing. The automated
          features save me hours every week!” —{" "}
          <em>Rajesh Kumar, Small Business Owner</em>
        </blockquote>
        <blockquote>
          “The reporting tools provided by AIMPS have helped us make informed
          decisions that improved our cash flow.” —{" "}
          <em>Sneha Patel, Freelancer</em>
        </blockquote>
      </div>
      <div className="about-container">
        <h2>Get Started Today</h2>
        <p>
          Join the growing community of satisfied users and take control of your
          invoicing and payment processes. Sign up for a free trial today and
          experience the power of AIMPS for yourself!
        </p>
      </div>
    </div>
  );
};

export default About;
