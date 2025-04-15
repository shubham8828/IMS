import React, { useEffect, useState } from "react";
import axios from "axios";
import './Cards.css'

const formatNumber = (num) => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num;
};

const Cards = ({ isAdmin }) => {
  const [invoices, setInvoices] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCities, setTotalCities] = useState(0);
  const [totalStates, setTotalStates] = useState(0);
  const [monthlyCollection, setMonthlyCollection] = useState(0); // Monthly collection state

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Fetch invoices data
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/invoice/all`, { headers })
      .then((response) => {
        setInvoices(response.data.invoices);

        // Calculate the overall total
        const overallTotal = response.data.invoices.reduce(
          (acc, invoice) => acc + invoice.total,
          0
        );
        setTotalAmount(overallTotal);

        // Calculate the monthly collection
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyTotal = response.data.invoices.reduce((acc, invoice) => {
          const invoiceDate = new Date(invoice.date); // Assuming invoices have a 'date' field
          if (
            invoiceDate.getMonth() === currentMonth &&
            invoiceDate.getFullYear() === currentYear
          ) {
            return acc + invoice.total;
          }
          return acc;
        }, 0);
        setMonthlyCollection(monthlyTotal);
      })
      .catch((error) => {
        console.log(error);
      });

    // Fetch users data
    axios
      .get(`${import.meta.env.VITE_API_URL}api/user/all`, { headers })
      .then((response) => {
        setTotalUsers(response.data.users.length); // Total number of users
        const cities = new Set(response.data.users.map((user) => user.city)); // Unique cities
        setTotalCities(cities.size);
        const states = new Set(response.data.users.map((user) => user.state)); // Unique states
        setTotalStates(states.size);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    
      <div className="card-container" >
        <div className="home-box">
          <h1>Rs.{formatNumber(totalAmount)}</h1>
          <p>Overall Total</p>
        </div>
        <div className="home-box">
          <h1>{invoices.length}</h1>
          <p>Total Invoices</p>
        </div>
        <div className="home-box">
          <h1>Rs.{formatNumber(monthlyCollection)}</h1>
          <p>This Month's Collection</p>
        </div>
        {isAdmin && (
          <>
            <div className="home-box">
              <h1>{totalUsers}</h1>
              <p>Total Users</p>
            </div>
            <div className="home-box">
              <h1>{totalCities}</h1>
              <p>Total Cities</p>
            </div>
            <div className="home-box">
              <h1>{totalStates}</h1>
              <p>Total States</p>
            </div>
          </>
        )}
      </div>
  );
};

export default Cards;
