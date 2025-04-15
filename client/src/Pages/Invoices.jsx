import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaArrowLeft, FaArrowRight, FaTrashAlt, FaEye } from "react-icons/fa";
import * as XLSX from "xlsx";
import Spinner from "../Component/Spinner";
import { FaCloudDownloadAlt } from "react-icons/fa";

import "./Invoices.css";
const Invoices = () => {
  const [allInvoices, setAllInvoices] = useState([]); // Holds all invoices
  const [filteredInvoices, setFilteredInvoices] = useState([]); // Holds filtered invoices
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const itemsPerPage = 50;

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/invoice/all`, {
        headers,
      });
      const { invoices, user } = response.data;
      setUser(user);
      const sortedInvoices = invoices.reverse();
      setAllInvoices(sortedInvoices);
      setFilteredInvoices(sortedInvoices); // Initially set filtered invoices to all invoices
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
    finally{
      setLoading(false);

    }
  };

  useEffect(() => {
    fetchInvoices();

    const handlePopState = () => {
      // When a popstate event occurs, redirect to /home
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);   


  // Handle invoice deletion
  const deleteInvoice = async (id) => {
    setLoading(true);

    try {
      await axios
        .delete(`http://localhost:4000/api/invoice/delete/${id}`, { headers })
        .then((res) => {
          toast.success(res.data.msg, { position: "top-center" });
          setAllInvoices(allInvoices.filter((invoice) => invoice._id !== id));
          setFilteredInvoices(
            filteredInvoices.filter((invoice) => invoice._id !== id)
          );
        });
    } catch (error) {
      toast.error("Internal Server Error", { position: "top-center" });
    }
    setLoading(false)

  };

  useEffect(() => {
    const results = allInvoices.filter((invoice) =>
      invoice.to.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(results);
    setCurrentPage(1); 
  }, [searchTerm, allInvoices]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prevPage) => prevPage + 1);
  };
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  const downloadCustomerData = (invoices) => {
    if (!Array.isArray(invoices) || invoices.length === 0) {
      console.error("No invoices found.");
      return;
    }
    setLoading(true)
    const customerData = invoices.map((invoice) => ({
      "Invoice ID": invoice.invoiceId || "N/A",
      Name: invoice.to || "N/A",
      Email: invoice.email || "N/A",
      Phone: invoice.phone || "N/A",
      Address: invoice.address || "N/A",
      Date: new Date(invoice.date).toLocaleDateString() || "N/A",
      Total: invoice.total || 0,
    }));

    const productData = invoices.flatMap((invoice, index) =>
      (invoice.products || []).map((product, productIndex) => ({
        Product_id: index + 1,
        "Invoice ID": invoice.invoiceId || "N/A",
        "Product Name": product.name || "N/A",
        Price: product.price || 0,
        Quantity: product.quantity || 0,
        Discount:product.discount||0,
        "GST (%) ":product.gst||0,
        "Total Price": product.totalPrice || 0,
      }))
    );

    const wb = XLSX.utils.book_new();
    const customerSheet = XLSX.utils.json_to_sheet(customerData);
    const productSheet = XLSX.utils.json_to_sheet(productData);
    XLSX.utils.book_append_sheet(wb, customerSheet, "Customer Info");
    XLSX.utils.book_append_sheet(wb, productSheet, "Product Info");
    XLSX.writeFile(wb, `Invoice-Data.xlsx`);
    setLoading(false)
  };

  if(loading){
    return <Spinner />
  }
  return (
    <div className="main-container">
      <div className="invoice-container">
        {allInvoices.length === 0 ? (
          // If no invoices are available
          <div className="no-invoice-wrapper">
            {user?.role === "user" ? (
              <>
                <p>No invoices available</p>
                <button onClick={() => navigate("/new-invoice")}>
                  Create New Invoice
                </button>
              </>
            ) : (
              <p>No invoices available</p>
            )}
          </div>
        ) : (
          <>
            <div className="invoice-search-bar-group">
              <h1 className="invoice-header">Invoices </h1>
              <input
                type="text"
                placeholder="Search by Customer Name"
                value={searchTerm}
                id='search'
                onChange={(e) => setSearchTerm(e.target.value)}
                className="invoice-search-bar"
              />
            </div>

            <div className="invoice-table-container">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Invoice ID</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Created by</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvoices.map((data, index) => {
                    const serialNumber = startIndex + index + 1;
                    return (
                      <tr key={data._id || index}>
                        <td>{serialNumber}</td>
                        <td>{data.invoiceId}</td>
                        <td style={{textTransform:'capitalize'}}>{data.to}</td>
                        <td>{new Date(data.date).toLocaleDateString()}</td>
                        <td>Rs.{data.total}</td>
                        <td style={{textTransform:'capitalize'}}>{data.address}</td>
                        <td>{data.phone}</td>
                        <td>{data.email}</td>
                        <td style={{display:'flex'}}>
                          <button
                            className="invoice-delete-btn"
                            onClick={() => deleteInvoice(data._id)}
                          >
                            <FaTrashAlt />
                          </button>
                          <button
                            onClick={() =>
                              navigate("/invoice-details", { state:data })
                            }
                            className="invoice-edit-btn"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredInvoices.length > itemsPerPage && (
              <div className="invoice-more">
                <button
                  className="invoice-previous-btn"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  <FaArrowLeft />
                </button>
                <button
                  className="invoice-next-btn"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  <FaArrowRight />
                </button>
              </div>
            )}
            <button className="download-btn" title="click to download invoice data" onClick={() => downloadCustomerData(filteredInvoices)}> <FaCloudDownloadAlt /></button>

          </>
        )}
      </div>
    </div>
  );
};

export default Invoices;
