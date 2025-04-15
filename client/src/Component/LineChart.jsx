import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './LineChart.css'
// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = () => {
  const [monthData, setMonthData] = useState({ labels: [], datasets: [] });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from local storage
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/all`, { headers });
        const users = response.data.users;

        // Initialize an array to hold the user count for each month
        const monthCount = new Array(12).fill(0);

        // Calculate user registration count per month
        users.forEach((user) => {
          const date = new Date(user.createdAt);
          const monthIndex = date.getMonth(); // Get 0-based month index
          monthCount[monthIndex] += 1; // Increment count for the month
        });

        // Set the data for the Line Chart
        setMonthData({
          labels: monthNames,
          datasets: [
            {
              label: 'Users Registered',
              data: monthCount, // Array of user counts per month
              fill: false,
              borderColor: '#42A5F5',
              tension: 0.1,
            },
          ],
        });

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',

      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Users: ${tooltipItem.raw}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
          color:'white'

        },
        ticks: {
          color: "white", // Y-axis text color
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Users',
          color:'white'
        },
        
        beginAtZero: true,
        ticks: {
          stepSize: 5,
          color:'white'
        },
      },
    },
  };

  return (
    <div className='line-chart-container' >
      <h2 style={{ textAlign: 'center' }}>Month-Wise User Registrations</h2>
      <Line data={monthData} options={options} />
    </div>
  );
};

export default LineChart;
