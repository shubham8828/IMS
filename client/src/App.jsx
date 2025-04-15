import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import ForgetPassword from "./Component/ForgetPassword.jsx";
import OtpVerification from "./Component/OtpVerification.jsx";
import ResetPassword from "./Component/ResetPassword.jsx";
import AddUserVerifyOtp from "./Component/AddUserVerifyOtp.jsx";
import Sppiner from "./Component/Spinner.jsx";

// Lazy Loaded Components
const Navbar = React.lazy(() => import("./Component/Navbar.jsx"));
const LandingPage = React.lazy(() => import("./Pages/LandingPage.jsx"));
const Contact = React.lazy(() => import("./Pages/Contact.jsx"));
const Invoices = React.lazy(() => import("./Pages/Invoices.jsx"));
const NewInvoices = React.lazy(() => import("./Pages/NewInvoices.jsx"));
const Profile = React.lazy(() => import("./Pages/Profile.jsx"));
const Login = React.lazy(() => import("./Component/Login.jsx"));
const Home = React.lazy(() => import("./Pages/Home.jsx"));
const InvoiceDetails = React.lazy(() =>
  import("./Component/InvoiceDetails.jsx")
);
const About = React.lazy(() => import("./Pages/About.jsx"));
const Footer = React.lazy(() => import("./Pages/Footer.jsx"));
const Payment = React.lazy(() => import("./Pages/Payment.jsx"));
const PaymentList = React.lazy(() => import("./Pages/PaymentList.jsx"));
const Message = React.lazy(() => import("./Pages/Message.jsx"));
const Users = React.lazy(() => import("./Pages/Users.jsx"));
const AddUser = React.lazy(() => import("./Pages/AddUser.jsx"));
const Team = React.lazy(() => import("./Pages/Team.jsx"));
const EditUser = React.lazy(() => import("./Pages/EditUser.jsx"));

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(false);

  // Update token in localStorage when changed
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {    
    if (token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/user/current`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const { user } = response.data;
          setIsAdmin(user.role === "admin");
        })
        .catch((error) => {
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
          setIsRoot(false);
        });
    }
  }, [token]);

  const PrivateRoute = ({
    children,
    allowedRoles = ["user", "admin"],
  }) => {
    if (!token) return <Navigate to="/" />;

    const userHasAccess =
      (allowedRoles.includes("admin") && (isAdmin)) ||
      allowedRoles.includes("user");

    return userHasAccess ? children : <Navigate to="/" />;
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<Sppiner/>}>
        <Navbar setToken={setToken} />
        <div className="main">
          <Routes>
            <Route path="/" element={token ? <Home /> : <LandingPage />} />
            <Route path="/home" element={token && <Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/team" element={<Team />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgetpassword" element={<ForgetPassword />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            {/* Private Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <PrivateRoute>
                  <Invoices />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/add/otp-verification"
              element={
                <PrivateRoute>
                  <AddUserVerifyOtp />
                </PrivateRoute>
              }
            />

            <Route
              path="/users"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <Users />
                </PrivateRoute>
              }
            />

            <Route
              path="/adduser"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AddUser />
                </PrivateRoute>
              }
            />

            <Route
              path="/user/edit"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <EditUser />
                </PrivateRoute>
              }
            />
            <Route
              path="/new-invoice"
              element={
                <PrivateRoute>
                  <NewInvoices />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/invoice-details"
              element={
                <PrivateRoute>
                  <InvoiceDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <PrivateRoute>
                  <Payment />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment-details"
              element={
                <PrivateRoute>
                  <PaymentList />
                </PrivateRoute>
              }
            />
            <Route
              path="/message"
              element={
                <PrivateRoute>
                  <Message />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
        <Footer />
      </Suspense>
    </BrowserRouter>
  );
};
export default App;
