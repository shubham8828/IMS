import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";
import { useLocation} from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const location = useLocation();
  const email = location.state?.email || "your email";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Both fields are required!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    const password=confirmPassword;
    
    axios.post(`${import.meta.env.VITE_API_URL}/api/reset-password`,{email,password})
    .then((res)=>{
      toast.success("Password reste successfully",{position:'top-center'})
      navigate("/login", { replace: true });

    })
    .catch(()=>{
      toast.error("Failed to resete password Try again!",{position:'top-center'})
    })
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h2>Reset Password</h2>
        <p>Enter your new password below</p>
        {error && <p className="error-message" style={{color:'red'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            maxLength={20}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            maxLength={20}
          />
          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
