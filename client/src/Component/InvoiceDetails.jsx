import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import "./InvoiceDetails.css";

const InvoiceDetails = () => {
  const location = useLocation();
  const [data, setData] = useState(location.state || {});
  const [user, setUser] = useState({});
  const [invoice, setInvoice] = useState({});
  const [payment, setPayment] = useState({});
  const [product, setProduct] = useState([]);
  // const navigate = useNavigate();

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch user data and invoice details
  useEffect(() => {
    const token = localStorage.getItem("token");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const invoiceId = data.invoiceId;
    const fetchUserData = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/invoice/get`,
          { invoiceId },
          { headers }
        );

        const { invoice, payment, user } = response.data;
        setInvoice(invoice);
        setPayment(payment);
        setProduct(invoice.products);
        setUser(user);
      } catch (error) {
        toast.error("Internal Server Error");
      }
    };

    fetchUserData();
  }, []);

  console.log(product);

  // PDF Generation
  const generatePDF = (customerName) => {
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => (button.style.display = "none"));

    const input = document.querySelector(".invoice-container");
    html2canvas(input, { useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("portrait", "pt", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${customerName}_invoice.pdf`);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF.");
      })
      .finally(() => {
        buttons.forEach((button) => (button.style.display = "inline-block"));
      });
  };

  const handlePayNow = () => {
    // navigate("/payments", { state: data });
  };

  return (
    <div className="main-container">
      <div className="invoice-container" id="invoice-content">
        <div className="header-container">
          <img src={user.image} alt="Company Logo" className="Company-logo" />
          <div className="user-detail-container">
            <span className="userName">{user.shopname}</span>
            <br />
            <span className="address">
              {`${user.address?.localArea || ""}, ${
                user.address?.city || ""
              }, ${user.address?.state || ""}, ${
                user.address?.country || ""
              }, ${user.address?.pin || ""}`}
            </span>
            <br />
            <span className="contact">
              {user.email} || +91 {user.phone}
            </span>
            <br />
          </div>
        </div>

        <div className="main-detail-container">
          <div className="detail-container">
            <h4>Bill to:</h4>

            <span>Name: {invoice.to}</span>
            <br />
            <span>Address: {invoice.address}</span>
            <br />
            <span>Phone No: +91 {invoice.phone}</span>
          </div>

          <div className="detail-container">
            <p>Invoice No.: {invoice.invoiceId}</p>
            <p>Date: {formatDate(invoice.date)}</p>
          </div>
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Discount</th>
              <th>GST</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {product.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>{item.discount}%</td>
                <td>{item.gst}%</td>
                <td>{item.totalPrice}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                Total
              </td>
              <td>Rs: 
                {" "+product
                  .reduce((sum, item) => sum + item.totalPrice, 0)
                  .toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="invoice-main-footer">
          <p>
            <b>Payment Terms:</b> Payment due within 30 days of invoice date.
          </p>
          <p>
            <b>Late Fees:</b> A late fee of 1% per month will apply for
            overdue balances.
          </p>
          <p>
            <b>Contact:</b> For questions, email us at{" "}
            <a href="mailto:aimps24x7@gmail.com">aimps24x7@gmail.com</a>.
          </p>
        </div>

        <div className="actions-container">
          {payment === null ? (
            <button onClick={handlePayNow}>Pay Now</button>
          ) : (
            <button onClick={() => generatePDF(data.to)}>Download PDF</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
