import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaUserAlt,
  FaCog,
  FaFileInvoiceDollar,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaMoneyCheckAlt,
  FaUsers,
} from "react-icons/fa";
import { IoPersonAdd } from "react-icons/io5";
import { MdOutlinePostAdd } from "react-icons/md";
import { GrMultiple } from "react-icons/gr";
import { CgProfile } from "react-icons/cg";
import { RiTeamLine, RiLogoutBoxRLine } from "react-icons/ri";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import "./NavBar.css";
import userIcon from "../asset/user.png";

const Navbar = ({ setToken }) => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [invoiceDropdown, setInvoiceDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const logOut = () => {
    localStorage.clear();
    toast.success("Logout successful", { position: "top-center" });
    navigate("/", { replace: true });
    setToken(null);
    setUser(null);
  };

  const fetchUserData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/current`, {
        headers,
      });
      if (response.status === 404) {
        localStorage.clear();
        navigate("/login", { replace: true });
      }
      setUser(response.data.user);
    } catch (error) {
      console.error(
        "Error fetching user data:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <h1>AIMPS</h1>

        {/* Hamburger Icon */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? (
            <FaTimes size={28} color="white" />
          ) : (
            <FaBars size={28} color="white" />
          )}
        </div>

        {/* Menu Items */}
        <div className={`menuItems ${menuOpen ? "open" : ""}`}>
          <NavLink
            to="/"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <FaHome /> Home
          </NavLink>
          <NavLink
            to="/about"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <FaInfoCircle /> About
          </NavLink>
          {!user && (
            <NavLink
              to="/contact"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              <FaEnvelope /> Contact
            </NavLink>
          )}
          {!user && (
            <NavLink
              to="/team"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              <RiTeamLine /> Developer
            </NavLink>
          )}
          {!user && (
            <NavLink
              to="/login"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              <FaUserAlt /> Login
            </NavLink>
          )}

          {user && (
            <>
                <div
                  className="dropdown"
                  onClick={() => setInvoiceDropdown(!invoiceDropdown)}
                >
                  <button className="dropdown-btn">
                    <FaFileInvoiceDollar /> Invoice
                  </button>
                  {invoiceDropdown && (
                    <div className="dropdown-content">
                      <NavLink
                        to="/invoices"
                        onClick={() => setMenuOpen(false)}
                      >
                        <GrMultiple /> Invoices
                      </NavLink>
                      {user.role==='user'&&(
                      <NavLink
                        to="/new-invoice"
                        onClick={() => setMenuOpen(false)}
                      >
                        <MdOutlinePostAdd /> New Invoice
                      </NavLink>
                      )}
                    </div>
                  )}
                </div>

              <NavLink
                to="/message"
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <FaUserAlt /> Message
              </NavLink>
              <NavLink to="/payment-details" onClick={() => setMenuOpen(false)} className="nav-link">
                <FaMoneyCheckAlt /> Payments
              </NavLink>
              {/* User Dropdown */}
              {user && (user.role === "admin") && (
                <div
                  className="dropdown"
                  onClick={() => setUserDropdown(!userDropdown)}
                >
                  <button className="dropdown-btn">
                    <FaUsers /> User
                  </button>
                  {userDropdown && (
                    <div className="dropdown-content">
                      <NavLink to="/users" onClick={() => setMenuOpen(false)}>
                        <FaUsers /> Users
                      </NavLink>
                      <NavLink to="/adduser" onClick={() => setMenuOpen(false)}>
                        <IoPersonAdd /> Add User
                      </NavLink>
                    </div>
                  )}
                </div>
              )}

              <div
                className="dropdown"
                onClick={() => setProfileDropdown(!profileDropdown)}
              >
                <button className="dropdown-btn">
                  <img src={user.image || userIcon} alt="User" />
                </button>
                {profileDropdown && (
                  <div className="dropdown-content">
                    <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
                      <CgProfile /> Profile
                    </NavLink>
                    {/* <NavLink to="/setting" onClick={() => setMenuOpen(false)}>
                      <FaCog /> Setting
                    </NavLink> */}
                    
                    <button onClick={logOut} className="logout-button">
                      <RiLogoutBoxRLine /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
