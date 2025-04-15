import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ImageCompressor from "image-compressor.js"; // For image compression
import toast from "react-hot-toast";
import "./Profile.css";
import Spinner from "../Component/Spinner";
import defaultProfile from "../asset/user.png"; // Define a default profile image

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

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    shopname: "",
    address: {
      localArea: "",
      city: "",
      state: "",
      country: "India",
      pin: "",
    },
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const imageRef = useRef();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchUserData();
    const handlePopState = () => navigate("/", { replace: true });
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/current`, { headers });
      setUser(res.data.user);
      setFormData(res.data.user || {});
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to fetch user data", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      new ImageCompressor(files[0], {
        quality: 0.6,
        success: (compressedResult) => {
          const fileReader = new FileReader();
          fileReader.onloadend = () => setFormData({ ...formData, image: fileReader.result });
          fileReader.readAsDataURL(compressedResult);
        },
        error: (e) => console.error(e.message),
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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(formData.email)) {
      toast.error("Invalid email address", { position: "top-center" });
      setLoading(false);
      return;
    }

    if (
      !formData.name ||
      !formData.phone ||
      !formData.address.localArea ||
      !formData.address.city ||
      !formData.address.state ||
      !formData.address.pin
    ) {
      toast.error("Please fill all required fields", { position: "top-center" });
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/user/update`, formData, { headers });
      toast.success("Profile updated successfully", { position: "top-center" });
    } catch (error) {
      toast.error("Failed to update profile", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return <Spinner />;

  return (
    <div className="main-container">
      <div className="profile-container">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Profile</h2>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <p style={{ textAlign: "center" }}>Profile Image</p>
            <div className="profile-image">
              <img
                src={formData.image || defaultProfile}
                alt="Profile"
                className="profile-pic"
                onClick={() => imageRef.current.click()}
              />
            </div>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              ref={imageRef}
              style={{ display: "none" }}
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email || ""} readOnly />
          </div>

          <div className="form-group">
            <label>Mobile No.</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              required
              maxLength={10}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input type="text" value={formData.role || ""} readOnly />
          </div>

          {formData.role === "admin" && (
            <>
            <div className="form-group">
              <label>Shop Name</label>
              <input
                type="text"
                name="shopname"
                value={formData.shopname || ""}
                onChange={handleChange}
                required
              />
            </div>
          

          <div className="form-group">
            <label>Local Area</label>
            <input
              type="text"
              name="address.localArea"
              value={formData.address?.localArea || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="address.city"
              value={formData.address?.city || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <select
              name="address.state"
              value={formData.address?.state || ""}
              onChange={handleChange}
              required
            >
              {statesOfIndia.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>PIN</label>
            <input
              type="text"
              name="address.pin"
              value={formData.address?.pin || ""}
              onChange={handleChange}
              maxLength={6}
              required
            />
          </div>
          </>)}

          <button type="submit" className="submit-btn">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
