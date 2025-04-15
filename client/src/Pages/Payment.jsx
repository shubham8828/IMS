import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PaymentSpinner from "../Component/Spinner.jsx";
import axios from "axios";
import "./Payment.css";

const generateRandomPaymentId = () => {
  const randomPart = Math.floor(Math.random() * 100000000);
  return `PAY${randomPart}`;
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(location.state || {});
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    paymentMethod: "",
  });
  const [spinner, setSpinner] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [paymentData, setPaymentData] = useState(null);

  // Generate paymentId once when the component is mounted
  useEffect(() => {
    const generatedPaymentId = generateRandomPaymentId();
    setPaymentId(generatedPaymentId);
  }, []);

  const generateTransactionData = (data, paymentDetails) => ({
    paymentId, // Use the generated paymentId
    customerName: data.to, // Customer name from the provided data
    amount: data.total, // Total amount from the provided data
    currency: "INR", // Hardcoded INR as currency
    paymentStatus: "Successful", // Payment status
    paymentDate: new Date().toISOString(), // Current date and time
    paymentMethod: paymentDetails.paymentMethod, // Payment method from the form
    invoiceId: data.invoiceId, // Invoice ID from the provided data
    remarks: "Paid in full", // Hardcoded remarks
    cardDetails: {
      cardNumber: paymentDetails.cardNumber, // Card number from the form
      expiry: paymentDetails.expiry, // Expiry date from the form
      cvv: paymentDetails.cvv, // CVV from the form
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restrict non-numeric input for certain fields
    if (name === "cardNumber" || name === "cvv") {
      if (!/^\d+$/.test(value)) return; // Allow only numbers
    }
    if (name === "expiry") {
      if (!/^\d{0,4}$/.test(value)) return; // Allow only numbers and restrict length
    }

    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const validatePaymentDetails = () => {
    const { paymentMethod, cardNumber, expiry, cvv } = paymentDetails;

    if (!paymentMethod) {
      toast.error("Please select a payment method.", {
        position: "top-center",
      });
      return false;
    }

    if (paymentMethod === "Card") {
      // Validate card details
      if (!cardNumber || !expiry || !cvv) {
        toast.error("Please fill all card details.", {
          position: "top-center",
        });
        return false;
      }

      // Card number validation (16 digits)
      if (cardNumber.length !== 16) {
        toast.error("Card number should be 16 digits.", {
          position: "top-center",
        });
        return false;
      }

      // Expiry date validation (MM/YY format)
      if (expiry.length !== 5 || !/^\d{2}\/\d{2}$/.test(expiry)) {
        toast.error(
          "Expiry date should be in MM/YY format (4 digits with /).",
          {
            position: "top-center",
          }
        );
        return false;
      }

      // CVV validation (3 digits)
      if (cvv.length !== 3) {
        toast.error("CVV should be 3 digits.", { position: "top-center" });
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validatePaymentDetails()) {
      return;
    }

    setSpinner(true);
    setTimeout(async () => {
      setSpinner(false);
      setPaymentSuccess(true);
      toast.success("Payment Successful!", { position: "top-center" });

      const transactionData = generateTransactionData(data, paymentDetails);
      setPaymentData(transactionData);

      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        // Sending payment data to the backend using axios
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/payment/new`,
          { transactionData },
          { headers }
        );
        console.log("Payment data sent to server:", response.data);

        // Handle any success response from your server if necessary
        // You can navigate to a different page if needed after the response
      } catch (error) {
        console.error("Error sending payment data to the server:", error);
        toast.error("Payment data could not be sent. Please try again.", {
          position: "top-center",
        });
      }
    }, 2000);
  };

  return (
    <div className="main-container" style={{display:'flex', justifyContent:'center',alignItems:'center'}}>
      <div className="payment-page">
        {paymentSuccess ? (
          <div className="payment-success">
            <h1>Payment Successful!</h1>
            <p>Thank you for your payment, {data.to}!</p>
            <p>
              <b>Invoice ID:</b> {data.invoiceId}
            </p>
            <p>
              <b>Total Paid:</b> ₹{data.total}
            </p>
            <p>We appreciate your business.</p>
            {paymentData && (
              <div className="payment-data">
                <h3>Transaction Details:</h3>
                <ul
                  style={{
                    textAlign: "left",
                    listStyleType: "none",
                    padding: 0,
                  }}
                >
                  {Object.entries(paymentData).map(([key, value]) => {
                    // Check if the value is an object (e.g., cardDetails)
                    if (typeof value === "object") {
                      return (
                        <li key={key} style={{ marginBottom: "10px" }}>
                          <strong style={{ textTransform: "capitalize" }}>
                            {key.replace(/([A-Z])/g, " $1").toUpperCase()}:
                          </strong>
                          <ul style={{ paddingLeft: "20px" }}>
                            {Object.entries(value).map(([subKey, subValue]) => (
                              <li key={subKey}>
                                <strong>
                                  {subKey
                                    .replace(/([A-Z])/g, " $1")
                                    .toUpperCase()}
                                  :
                                </strong>{" "}
                                {subValue}
                              </li>
                            ))}
                          </ul>
                        </li>
                      );
                    }

                    return (
                      <li key={key} style={{ marginBottom: "10px" }}>
                        <strong style={{ textTransform: "capitalize" }}>
                          {key.replace(/([A-Z])/g, " $1").toUpperCase()}:
                        </strong>{" "}
                        {value}
                      </li>
                    );
                  })}
                </ul>

                <button
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    backgroundColor: "#3498db",
                    border: "none",
                    color: "white",
                    borderRadius: "5px",
                    fontSize: "16px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                  }}
                  onClick={() => navigate("/dashboard")}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="payment-container">
            <h1>Payment Details</h1>
            <div className="invoice-summary">
              <h2>Invoice Summary</h2>
              <p>
                <b>Invoice No.:</b> {data.invoiceId}
              </p>
              <p>
                <b>Customer Name:</b> {data.to}
              </p>
              <p>
                <b>Total Amount:</b> ₹{data.total}
              </p>
              <p>
                <b>Phone:</b> {data.phone}
              </p>
              <p>
                <b>Address:</b> {data.address}
              </p>
              <p>
                <b>Email:</b> {data.email}
              </p>

              <h3>Product Details</h3>
              {data.products.length > 0 ? (
                <ul>
                  {data.products.map((product, index) => (
                    <li key={product._id}>
                      <b>{product.name}</b> - ₹{product.price} x{" "}
                      {product.quantity} = ₹{product.totalPrice}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No products found.</p>
              )}
            </div>

            <div className="payment-form">
              <h2>Enter Payment Details</h2>

              <label>
                Payment Method
                <select
                  name="paymentMethod"
                  value={paymentDetails.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </label>

              {paymentDetails.paymentMethod === "Card" && (
                <>
                  <label>
                    Card Number
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Enter your card number"
                      value={paymentDetails.cardNumber}
                      onChange={handleChange}
                      maxLength={16}
                    />
                  </label>
                  <label>
                    Expiry Date (MM/YY)
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={paymentDetails.expiry}
                      onChange={(e) => {
                        let value = e.target.value;

                        if (value.length === 2 && !value.includes("/")) {
                          value = `${value}/`; // Add semicolon here
                        }

                        // Allow only digits and a slash for MM/YY format
                        if (/^\d{0,2}\/?\d{0,2}$/.test(value)) {
                          // Handle MM part (01-12) and YY part (00-99)
                          if (value.length <= 5) {
                            // If MM is less than 01 or greater than 12, show toast error
                            const month = value.slice(0, 2);
                            if (month.length === 2) {
                              if (
                                parseInt(month, 10) < 1 ||
                                parseInt(month, 10) > 12
                              ) {
                                toast.error(
                                  "Enter a valid month number (01-12).",
                                  {
                                    position: "top-center",
                                  }
                                );
                              } else {
                                setPaymentDetails({
                                  ...paymentDetails,
                                  expiry: value,
                                });
                              }
                            } else {
                              setPaymentDetails({
                                ...paymentDetails,
                                expiry: value,
                              });
                            }
                          }
                        }
                      }}
                      maxLength={5} // Limit input to MM/YY format
                    />
                  </label>

                  <label>
                    CVV
                    <input
                      type="password"
                      name="cvv"
                      placeholder="CVV"
                      value={paymentDetails.cvv}
                      onChange={handleChange}
                      maxLength={3}
                    />
                  </label>
                </>
              )}

              <button onClick={handlePayment}>
                Pay ₹{data.total.toFixed(2)}
              </button>

              {spinner && <PaymentSpinner />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Payment;
