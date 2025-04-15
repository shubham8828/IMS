import React from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import img from "../../asset/invoice.webp";
import "./Section.css";
const Section = () => {
  const navigate = useNavigate();
  const getStart = () => {
    navigate("/login");
  };

  return (
      <div className="landingpage-image-container">
        <img src={img} alt="" />
        <button onClick={getStart}> Try Now</button>
      </div>
  );
};

export default Section;
