import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Spinner from "../Component/Spinner.jsx";
import "./NewInvoices.css";

const NewInvoices = () => {
  const [to, setTo] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [gst, setGst] = useState(0);
  const [productList, setProductList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const navigate = useNavigate();

  useEffect(() => {


    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/user/search`, { headers })
      .then((response) => {
        setInvoice(response.data.invoices);
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });


      
    const handlePopState = () => {
      // When a popstate event occurs, redirect to /home
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };

  }, [navigate]);

  const addProduct = () => {
    // Validate product fields
    if (!name.trim()) {
      toast.error("Product name cannot be empty.", { position: "top-center" });
      return;
    }

    if (!price || price <= 0) {
      toast.error("Price must be a positive number.", {
        position: "top-center",
      });
      return;
    }

    if (!quantity || quantity <= 0) {
      toast.error("Quantity must be a positive number.", {
        position: "top-center",
      });
      return;
    }

    if (discount < 0) {
      toast.error("Discount cannot be negative.", { position: "top-center" });
      return;
    }

    if (gst < 0) {
      toast.error("GST cannot be negative.", { position: "top-center" });
      return;
    }

    // Calculate discount and GST
    const discountedPrice = price - price * (discount / 100);
    const gstAmount = discountedPrice * (gst / 100);
    const totalPrice = (discountedPrice + gstAmount) * quantity;

    const newProduct = {
      id: productList.length + 1,
      name,
      price,
      quantity,
      discount,
      gst,
      totalPrice,
    };

    const updatedProductList = [...productList, newProduct];
    setProductList(updatedProductList);

    // Update the total invoice amount
    const newTotal = updatedProductList.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );
    setTotal(newTotal);

    // Clear product input fields
    setName("");
    setPrice("");
    setQuantity(1);
    setDiscount(0);
    setGst(0);
  };

  const handleSaveData = async () => {
    // Validate required fields
    if (!to.trim()) {
      toast.error("Recipient name cannot be empty.", {
        position: "top-center",
      });
      return;
    }

    if (!phone || phone.trim().length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.", {
        position: "top-center",
      });
      return;
    }

    if (!address.trim()) {
      toast.error("Address cannot be empty.", { position: "top-center" });
      return;
    }

    // Check if at least one product is added
    if (productList.length === 0) {
      toast.error("Please add at least one product to the invoice.", {
        position: "top-center",
      });
      return;
    }

    const formData = {
      to,
      phone,
      address,
      products: productList,
      total,
    };

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/invoice/new`,
        formData,
        { headers }
      );
      toast.success(response.data.msg, { position: "top-center" });

      // Clear the form after successful submission
      setTo("");
      setPhone("");
      setAddress("");
      setProductList([]);
      setTotal(0);
      setName("");
      setPrice(0);
      setQuantity(1);
      setDiscount(0);
      setGst(0);
      setLoading(false);

      navigate("/payments", { state: response.data.invoice });
    } catch (error) {
      setLoading(false);
      toast.error("There was an error saving the invoice.", {
        position: "top-center",
      });
    }
  };

  const handleSelectCustomer = (customer) => {
    setTo(customer.to);
    setPhone(customer.phone);
    setAddress(customer.address);
    setSearchTerm('')
  };

  // Filter invoices based on the search term
  const filteredInvoices = invoice.filter((inv) => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    return (
      (inv.to && inv.to.toLowerCase().includes(lowerCaseTerm)) ||
      (inv.invoiceId && inv.invoiceId.toLowerCase().includes(lowerCaseTerm)) ||
      (inv.phone && String(inv.phone).includes(lowerCaseTerm)) ||
      (inv.address && inv.address.toLowerCase().includes(lowerCaseTerm))
    );
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="main-container">
      <div className="new-invoice-container">
        <div className="header-row">
          <div className="search">
            <input
              type="text"
              placeholder="Search by Name, Email, City, State, etc."
              id="search"
              className="users-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="new-invoice-heading">New Invoice</p>
          <button type="button" onClick={handleSaveData} className="add-btn">
            Save Data
          </button>
        </div>

        {/* Display search results in a table if a search term is entered */}
        {searchTerm && (
          <div className="invoice-results">
            {filteredInvoices.length > 0 ? (
              <table className="invoice-table modern-table" border={1} cellSpacing={0}>
                <thead>
                  <tr>
                    <th>Sr.No</th>
                    <th>Invoice ID</th>
                    <th>Recipient</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv, index) => (
                    <tr
                      key={index}
                      onClick={() => handleSelectCustomer(inv)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{index+1}</td>
                      <td>{inv.invoiceId}</td>
                      <td>{inv.to}</td>
                      <td>{inv.phone}</td>
                      <td>{inv.address}</td>
                      <td>{new Date(inv.date).toLocaleDateString()}</td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No matching invoices found.</p>
            )}
          </div>
        )}

        <form className="new-invoice-form">
          <div className="first-row">
            <input
              placeholder="To"
              onChange={(e) => setTo(e.target.value)}
              value={to}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              onChange={(e) => {
                const inputValue = e.target.value;
                if (/^\d{0,10}$/.test(inputValue)) {
                  setPhone(inputValue);
                }
              }}
              value={phone}
              required
              maxLength={10}
              pattern="\d{10}"
              title="Please enter a valid 10-digit phone number"
            />
            <input
              placeholder="Address"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              required
            />
          </div>

          <div className="first-row">
            <input
              placeholder="Product Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              title="Product Name"
              required
            />
            <input
              placeholder="Price"
              type="number"
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              value={price}
              required
              min="0"
              title="Price"
            />
            <input
              type="number"
              placeholder="Quantity"
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              value={quantity}
              required
              min="1"
              title="Quantity"
            />
          </div>
          <div className="first-row">
            <input
              placeholder="Discount (%)"
              type="number"
              onChange={(e) => setDiscount(parseFloat(e.target.value))}
              value={discount}
              required
              title="Discount (%)"
              min="0"
            />
            <input
              type="number"
              placeholder="GST (%)"
              onChange={(e) => setGst(parseFloat(e.target.value))}
              value={gst}
              required
              title="GST (%)"
              min="0"
            />
          </div>

          <button type="button" onClick={addProduct} className="add-btn">
            Add Product
          </button>
        </form>
      </div>
          {productList.length>0&&
          <div className="product-wrapper">
            <table className="product-table modern-table" border={1} cellSpacing={0}>
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Discount (%)</th>
                  <th>GST (%)</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {productList.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.discount}</td>
                    <td>{product.gst}</td>
                    <td>{product.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" className="text-right">Total:</td>
                  <td>Rs. {total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
    } 
    </div>
  );
};

export default NewInvoices;
