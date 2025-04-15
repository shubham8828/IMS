import React, { useState, useEffect } from "react";
import defaultProfile from "../asset/user.png"; // Replace with your default profile image path
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Spinner from "../Component/Spinner.jsx";
import "./AddUser.css";

const AddAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...formData };
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    axios
      .post(`${import.meta.env.VITE_API_URL}api/user/add/sendOtp`, { email: formData.email }, { headers })
      .then(() => {
        console.log(payload)
        toast.success("OTP sent successfully", { position: "top-center" });
        navigate("/user/add/otp-verification", { state: { payload }, replace: true });
        resetForm();
      })
      .catch(() => {
        toast.error("Some error occurred while sending OTP", { position: "top-center" });
        navigate("/login", { replace: true });
      })
      .finally(() => setLoading(false));
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
    });
  };

  // Redirect to home on back navigation
  useEffect(() => {
    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="main-container">
      <div className="auth-container">
        <h2 className="modern-title">Add User</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="profile-image">
              <img src={defaultProfile} alt="Profile" className="profile-pic" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setFormData({ ...formData, name: inputValue });
              }}
              required
              minLength={3}
              maxLength={50}
              autoComplete="on"
              placeholder="Enter your name"
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Enter your email"
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Mobile No.</label>
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
              autoComplete="tel"
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={20}
              autoComplete="current-password"
              placeholder="Enter a strong password"
              className="modern-input"
            />
          </div>

          <div className="form-group center-text">
            <button type="submit" className="modern-btn">
              Send OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
