import React, { useState, useEffect } from "react";
import user from "../asset/user.png"; // Replace with your user icon path
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Sppiner from "./Spinner";

const AuthForm = ({ setToken }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // Redirect to home if already logged in and handle back navigation
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/", { replace: true });
    }

    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const clearFormData = () => ({
    email: "",
    password: "",
  });

  // Email validation function
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate email before proceeding
    if (!validateEmail(formData.email)) {
      toast.error("Invalid email address", { position: "top-center" });
      setLoading(false);
      return;
    }

    try {
      const { email, password } = formData;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      toast.success(res.data.msg, { position: "top-center" });
      setFormData(clearFormData());
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.msg || "An error occurred", { position: "top-center" });
      setFormData(clearFormData());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Sppiner />;
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="modern-title">Sign In</h1>
        <div className="icon-wrapper">
          <img src={user} alt="User Icon" className="user-icon" />
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="modern-label">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="on"
              placeholder="Enter your email"
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="modern-label">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={20}
              autoComplete="on"
              placeholder="Enter your password"
              className="modern-input"
            />
          </div>

          <button type="submit" className="modern-btn">
            Sign In
          </button>
          <div className="forgot-password">
            <Link to="/forgetpassword" className="modern-link">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
