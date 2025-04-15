import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaUserAlt, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import "./Contact.css";

const Contact = () => {

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
      <div className="contact-container">
        <h1 className="contact-header">Contact Us</h1>
        <p className="contact-text">
          We value your feedback and are here to assist you with any issues or
          queries. If you encounter any problems, please don't hesitate to reach
          out to us.
        </p>
        <p className="contact-text">
          <FaEnvelope className="contact-icon" /> Email us at:{" "}
          <a href="mailto:aimps24x7@gmail.com" className="contact-link">
            aimps24x7@gmail.com
          </a>
        </p>
        <p className="contact-text">
          <FaPhone className="contact-icon" /> Customer Support: +91 8828709874
          (Available 24x7)
        </p>
        <p className="contact-text">
          <FaMapMarkerAlt className="contact-icon" /> Office Address: Titwala
          (East), Kalyan, Thane, Maharashtra India 421605
        </p>
        <p className="contact-text">
          If you'd like to know more about AIMPS and our services, please{" "}
          <FaUserAlt className="contact-icon" />{" "}
          <a href="/login" className="contact-link">
            Login
          </a>          
          . Once logged in, you can explore all our features and services.
        </p>
        <p className="contact-text">
          To get instant help, go to the sidebar and click on{" "}
          <strong>Message</strong>. In the chat section, you will find two lists
          on the left side: <strong>Admins</strong> and <strong>Users</strong>.
          Select <strong>Admins</strong>, choose any admin, and start a
          conversation to resolve your issue. AIMPS guarantees 100% solutions to
          all your concerns.
        </p>
        <p className="contact-text">
          AIMPS is committed to providing the best customer service experience.
          Whether it's a technical issue, account-related question, or general
          inquiry, our team is here to assist you. Let us know how we can help
          you!
        </p>
        <p className="contact-text">
          Thank you for choosing AIMPS! Your satisfaction is our top priority.
        </p>
      </div>
    </div>
  );
};

export default Contact;
