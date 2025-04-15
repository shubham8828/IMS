import React, { useState, useRef } from "react";
import axios from "axios";
import ImageCompressor from "image-compressor.js"; // For image compression
import toast from "react-hot-toast";
import Spinner from "../Component/Spinner";
import { useLocation, useNavigate } from "react-router-dom";

import "./Profile.css";

const statesOfIndia = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const roles = ["user", "admin"];

const EditUser = () => {
  const location = useLocation();

  const [formData, setFormData] = useState(location.state || {}); // Store form data
  const imageRef = useRef();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      new ImageCompressor(files[0], {
        quality: 0.6,
        success: (compressedResult) => {
          const fileReader = new FileReader();
          fileReader.onloadend = () => {
            setFormData({ ...formData, image: fileReader.result });
          };
          fileReader.readAsDataURL(compressedResult);
        },
        error(e) {
          console.error(e.message);
        },
      });
    } else {
      const keys = name.split(".");
      if (keys.length > 1) {
        setFormData({
          ...formData,
          [keys[0]]: { ...formData[keys[0]], [keys[1]]: value },
        });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/user/update`, formData, {
        headers,
      });
      toast.success("Profile updated successfully", { position: "top-center" });
    } catch (error) {
      toast.error("Failed to update profile", { position: "top-center" });
    } finally {
      setLoading(false);
      navigate("/");
    }
  };

  const triggerImageUpload = () => {
    imageRef.current.click();
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile-container">
      <h2 style={{ textAlign: "center", marginBottom: "20px",textTransform:'capitalize' }}>
        {formData.role +" "}Profile
      </h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <p style={{ textAlign: "center" }}>Profile Image</p>
          <div className="profile-image">
            <img
              src={formData.image || defaultProfile}
              alt="Profile"
              className="profile-pic"
              onClick={triggerImageUpload}
            />
          </div>
          <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            onChange={handleChange}
            ref={imageRef}
            style={{ display: "none" }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={(e) => {
              const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
              setFormData({ ...formData, name: inputValue });
            }}
            required
            minLength={3}
            maxLength={50}
            autoComplete="name"
            placeholder="Enter your name"
            style={{ textTransform: "capitalize" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="on"
            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            placeholder="Enter your email"
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Mobile No.</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={(e) => {
              const inputValue = e.target.value.replace(/[^0-9]/g, "");
              if (inputValue.length <= 10) {
                setFormData({ ...formData, phone: inputValue });
              }
            }}
            required
            pattern="[0-9]{10}"
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            autoComplete="on"
          />
        </div>

        <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="shopname">Shop Name</label>
            <input
              type="text"
              name="shopname"
              id="shopname"
              value={formData.shopname}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
                setFormData({ ...formData, shopname: inputValue });
              }}
              readOnly
              required
              minLength={3}
              maxLength={50}
              autoComplete="on"
              style={{ textTransform: "capitalize" }}
            />
          </div>

        <div className="form-group">
          <label htmlFor="localArea">Local Area</label>
          <input
            type="text"
            name="address.localArea"
            id="localArea"
            value={formData.address.localArea}
            onChange={(e) => {
              const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
              setFormData({
                ...formData,
                address: { ...formData.address, localArea: inputValue },
              });
            }}
            required
            style={{ textTransform: "capitalize" }}
            autoComplete="on"
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            name="address.city"
            id="city"
            value={formData.address.city}
            onChange={(e) => {
              const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
              setFormData({
                ...formData,
                address: { ...formData.address, city: inputValue },
              });
            }}
            required
            style={{ textTransform: "capitalize" }}
            autoComplete="on"
          />
        </div>

        <div className="form-group">
          <label htmlFor="state">State</label>
          <select
            name="address.state"
            id="state"
            value={formData.address.state}
            onChange={handleChange}
            required
          >
            <option value={formData ? formData.address.state : ""}>
              {" "}
              {formData ? formData.address.state : "Select State"}
            </option>
            {statesOfIndia.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <select
            name="address.country"
            id="country"
            value={formData.address.country}
            onChange={handleChange}
            required
            autoComplete="country"
          >
            <option value={formData ? formData.address.country : "India"}>
              {formData ? formData.address.country : "India"}
            </option>
            <option value={"India"}>{"India"}</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="pin">PIN</label>
          <input
            type="text"
            name="address.pin"
            id="pin"
            value={formData.address.pin}
            required
            onChange={(e) => {
              const inputValue = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
              if (inputValue.length <= 6) {
                // Limit input to 6 characters
                setFormData({
                  ...formData,
                  address: {
                    ...formData.address,
                    pin: inputValue, // Update the pin field correctly
                  },
                });
              }
            }}
            pattern="[0-9]{6}" // Ensure exactly 6 digits
            maxLength={6}
            autoComplete="postal-code" // Suggest browser autocomplete for postal codes
          />
        </div>

        <button type="submit" className="submit-btn">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default EditUser;
