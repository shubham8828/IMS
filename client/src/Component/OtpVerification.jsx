import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OtpVerification.css";
import verificationVideo from "../asset/Verification.mp4";
import axios from "axios";
import toast from "react-hot-toast";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email from navigation state or redirect if missing
  const email = location.state?.email || "";
 
  useEffect(() => {
    if (!email) {
      toast.error("Invalid access. Please request a new OTP.");
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [otpExpireTimer, setOtpExpireTimer] = useState(120);
  const inputRefs = useRef([]);

  // Countdown for Resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // Countdown for OTP expiration
  useEffect(() => {
    if (otpExpireTimer > 0) {
      const timer = setInterval(() => setOtpExpireTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      toast.error("OTP expired! Please request a new OTP.", { position: "top-center" });
      navigate("/", { replace: true });
    }
  }, [otpExpireTimer, navigate]);

  // Handle OTP input changes
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Allow only digits (0-9)
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace for OTP input navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // Handle OTP Verification
  const handleSubmit = async () => {
    if (otp.includes("")) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");

      axios.post(`${import.meta.env.VITE_API_URL}/api/verify-otp`, {email,otp: otp.join(""),
      })
      .then(()=>{
        setShowAnimation(true)
      })
      .catch((error) => {
      toast.error("Invalid OTP", { position: "top-center" });
    })
  };

  // Handle animation ending (redirect to reset password)
  const handleAnimationEnd = () => {
      toast.success("OTP verified successfully!", { position: "top-center" });
      navigate("/reset-password", { state:{email} , replace: true });
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (resendTimer > 0) return; // Prevent unnecessary calls
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/send-otp`, { email });
      setResendTimer(60);
      setOtpExpireTimer(120);
      toast.success("OTP Resent Successfully!", { position: "top-center" });
    } catch (error) {
      toast.error("Failed to resend OTP", { position: "top-center" });
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
        <p>Enter the 6-digit code sent to <strong>{email}</strong></p>

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

export default OtpVerification;
