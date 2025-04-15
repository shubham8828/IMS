import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, ArcElement, Legend } from "chart.js";
import './PieChart.css'

ChartJS.register(Title, Tooltip, ArcElement, Legend);

const PieChart = () => {
  const [cityData, setCityData] = useState({ labels: [], datasets: [] });
  const [stateData, setStateData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from local storage
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/all`, {
          headers,
        });

        const users = response.data.users;

        if (!users || users.length === 0) {
          throw new Error("No users found");
        }

        // Initialize counts
        const cityCounts = {};
        const stateCounts = {};

        // Count users by city and state (accessing address object)
        users.forEach((user) => {
          if (user.role === "user") {
            const { city, state } = user.address || {}; // Safely access city and state

            if (city) {
              cityCounts[city] = (cityCounts[city] || 0) + 1;
            }

            // Clean up the state by trimming and normalizing it (e.g., remove leading/trailing spaces)
            if (state) {
              const normalizedState = state.trim(); // Remove any extra spaces
              stateCounts[normalizedState] =
                (stateCounts[normalizedState] || 0) + 1;
            }
          }
        });

        // Prepare data for Pie chart (City)
        setCityData({
          labels: Object.keys(cityCounts),
          datasets: [
            {
              label: "Users by City",
              data: Object.values(cityCounts),
              backgroundColor: generateRandomColors(
                Object.keys(cityCounts).length
              ),
              hoverBackgroundColor: generateRandomColors(
                Object.keys(cityCounts).length
              ),
            },
          ],
        });

        // Prepare data for Pie chart (State)
        setStateData({
          labels: Object.keys(stateCounts),
          datasets: [
            {
              label: "Users by State",
              data: Object.values(stateCounts),
              backgroundColor: generateRandomColors(
                Object.keys(stateCounts).length
              ),
              hoverBackgroundColor: generateRandomColors(
                Object.keys(stateCounts).length
              ),
            },
          ],
        });

        setLoading(false); // Data fetched successfully
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Error fetching user data. Please try again.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Function to generate random colors for charts
  const generateRandomColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(`hsl(${Math.random() * 360}, 70%, 60%)`);
    }
    return colors;
  };

  if (loading) {
    return <p>Loading data...</p>; // Optionally, use a spinner component
  }

  if (error) {
    return <p>{error}</p>; // Show error message if there was an issue
  }

  return (
    <div className="pie-chart-container">
      <h2 className="chart-title">Users by City and State</h2>
      <div className="chart-wrapper">
        <div className="chart-box">
          <h3>Users by City</h3>
          <Pie data={cityData} />
        </div>
        <div className="chart-box">
          <h3>Users by State</h3>
          <Pie data={stateData} />
        </div>
      </div>
    </div>
  );
};

export default PieChart;
