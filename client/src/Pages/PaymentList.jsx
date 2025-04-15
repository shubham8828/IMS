import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import Spinner from "../Component/Spinner";
import { FaCloudDownloadAlt } from "react-icons/fa";

import "./PaymentList.css";
const PaymentList = () => {
  const [paymentData, setPaymentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Number of items per page
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(""); // New state for payment status filter
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/payment/get`,{ headers }
      );
      const fetchedData = response.data.data || [];
      setPaymentData(fetchedData); // Set full payment data
      setFilteredData(fetchedData); // Initially set filtered data to full data
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();

    const handlePopState = () => {
      // When a popstate event occurs, redirect to /home
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };

  }, [navigate]);

  // Search functionality: Update filtered data
  useEffect(() => {
    const lowerCasedSearchTerm = searchTerm.toLowerCase().trim();
    const filtered = paymentData.filter(
      (payment) =>
        (payment.customerName.toLowerCase().includes(lowerCasedSearchTerm) ||
          payment.invoiceId.toLowerCase().includes(lowerCasedSearchTerm) ||
          payment.customerPhone.toLowerCase().includes(lowerCasedSearchTerm) ||
          payment.paymentMethod.toLowerCase().includes(lowerCasedSearchTerm)) &&
        (paymentStatus === "" || payment.paymentStatus === paymentStatus) // Filter by payment status
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to the first page when search or status changes
  }, [searchTerm, paymentData, paymentStatus]);

  // Pagination: Get current page payment data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPayments = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleAction = async (paymentStatus, invoiceId) => {
    if (paymentStatus === "Successful") {
      toast.success("Payment Already Done");
    } else if (paymentStatus === "Pending") {
      setLoading(true)
      await axios
        .post(
          "http://localhost:4000/api/getInvoice",
          { invoiceId },
          { headers }
        )
        .then((response) => {
          setLoading(false)
          navigate("/payments", { state: response.data.invoice });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const downloadTableData = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredData.map((payment, index) => ({
        "Sr. No.": startIndex + index + 1,
        "Invoice ID": payment.invoiceId,
        "Customer Name": payment.customerName,
        Phone: payment.customerPhone,
        Amount: payment.amount.toFixed(2),
        Currency: payment.currency,
        "Payment Status": payment.paymentStatus,
        "Payment Date": payment.paymentDate
          ? new Date(payment.paymentDate).toLocaleDateString()
          : "N/A",
        "Payment Method": payment.paymentMethod,
        "Payment ID": payment.paymentId,
        "Card Details":
          payment.paymentMethod === "Card" && payment.cardDetails
            ? `**** **** **** ${payment.cardDetails.cardNumber.slice(-4)}`
            : "N/A",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "Payment_Data.xlsx");
  };

  if(loading)
  {
    return <Spinner />
  }

  return (
    <div className="main-container">
      <div className="payment-list-container">
        <div className="payment-search-bar-group">
          <h1 className="payment-header">Payment Details</h1>
          <div className="payment-filters">
            <input
              type="text"
              placeholder="Search by Customer Name, Invoice ID, Phone, or Payment Method"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id='search'
              className="payment-search-bar"
            />
            <select
              className="payment-status-filter"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              id="filter"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Successful">Successful</option>
            </select>
          </div>
        </div>

        <div className="payment-table-container">
          {filteredData.length === 0 ? (
            <div className="no-payment-data">
              {" "}
              <p>No Payment Data Available</p>
            </div>
          ) : (
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Invoice ID</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Payment Status</th>
                  <th>Payment Date</th>
                  <th>Payment Method</th>
                  <th>Payment ID</th>
                  <th>Card Details</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((transaction, index) => (
                  <tr key={index}>
                    <td>{startIndex + index + 1}</td>
                    <td>{transaction.invoiceId}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {transaction.customerName}
                    </td>
                    <td>{transaction.customerPhone}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.currency}</td>
                    <td>{transaction.paymentStatus}</td>
                    <td>
                      {transaction.paymentStatus === "Pending"
                        ? "N/A"
                        : transaction.paymentDate
                        ? new Date(transaction.paymentDate).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>{transaction.paymentMethod}</td>
                    <td>{transaction.paymentId}</td>
                    <td style={{ minWidth: "150px" }}>
                      {transaction.paymentMethod === "Card" &&
                      transaction.cardDetails
                        ? `**** **** **** ${transaction.cardDetails.cardNumber.slice(
                            -4
                          )}`
                        : "N/A"}
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          handleAction(
                            transaction.paymentStatus,
                            transaction.invoiceId
                          )
                        }
                        style={{
                          background:
                            transaction.paymentStatus === "Pending"
                              ? "red"
                              : "green",
                          color: "white",
                        }}
                        className="payment-btn"
                      >
                        {transaction.paymentStatus === "Pending"
                          ? "Pay"
                          : "Done"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredData.length > itemsPerPage && (
          <div className="payment-more">
            <button
              className="payment-previous-btn"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              <FaArrowLeft />
            </button>
            <button
              className="payment-next-btn"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              <FaArrowRight />
            </button>
          </div>
        )}
            <button className="download-btn" title="click to download invoice data"  onClick={downloadTableData}> <FaCloudDownloadAlt /></button>

      </div>
    </div>
  );
};

export default PaymentList;
