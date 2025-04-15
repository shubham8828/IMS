import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OtpVerification.css";
import verificationVideo from "../asset/Verification.mp4";
import axios from "axios";
import toast from "react-hot-toast";

const AddUserVerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.payload;

  useEffect(() => {
    if (!data?.email) {
      toast.error("Invalid access. Please request a new OTP.", { position: "top-center" });
      navigate("/login", { replace: true });
    }
  }, [data, navigate]);

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [otpExpireTimer, setOtpExpireTimer] = useState(120);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => setResendTimer((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    const interval = setInterval(() => setOtpExpireTimer((prev) => Math.max(prev - 1, 0)), 1000);
    if (otpExpireTimer === 0) {
      toast.error("OTP expired! Please request a new OTP.", { position: "top-center" });
      navigate("/", { replace: true });
    }
    return () => clearInterval(interval);
  }, [otpExpireTimer, navigate]);

  const handleChange = (index, value) => {
    if (!/\d?/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (otp.includes("")) return setError("Please enter all 6 digits.");
    setError("");
    try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
        };
    
      await axios.post(`${import.meta.env.VITE_API_URL}/api/user/add/verifyOtp`, { email: data.email, otp: otp.join("") },{headers});
      setShowAnimation(true);
    } catch {
      toast.error("Invalid OTP", { position: "top-center" });
    }
  };

  const handleAnimationEnd = async () => {
    toast.success("OTP verified successfully!", { position: "top-center" });
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_URL}/api/user/add`, data, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("User Added Successfully", { position: "top-center" });
      navigate("/", { replace: true });
    } catch {
      toast.error("Internal Server Error. Try Again!", { position: "top-center" });
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_URL}/api/user/add/sendOtp`, { email: data.email }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("OTP sent successfully", { position: "top-center" });
      navigate("/user/add/otp-verification", { state: { payload: data }, replace: true });
      setResendTimer(60);
    } catch {
      toast.error("Email does not exist!", { position: "top-center" });
      navigate("/login", { replace: true });
    }
  };

  if (showAnimation) {
    return (
      <div className="animation-container">
        <video className="verification-video" src={verificationVideo} autoPlay muted onEnded={handleAnimationEnd} />
      </div>
    );
  }

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2>OTP Verification</h2>
        <p>Enter the 6-digit code sent to <strong>{data.email}</strong></p>
        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
        </div>
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleSubmit}>Verify OTP</button>
        <div className="resend-container">
          <button onClick={handleResend} disabled={resendTimer > 0} className="resend-button">
            Resend OTP
          </button>
          {resendTimer > 0 && <p className="resend-timer">Resend OTP in {resendTimer}s</p>}
        </div>
        <p className="otp-expire-timer">OTP expires in {otpExpireTimer}s</p>
      </div>
    </div>
  );
};

export default AddUserVerifyOtp;
