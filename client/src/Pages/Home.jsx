import React, { lazy, Suspense, useEffect, useState } from "react";
const Cards = lazy(() => import("../Component/Cards.jsx"));
const Chart = lazy(() => import("../Component/Chart.jsx"));
const LineChart = lazy(() => import("../Component/LineChart.jsx"));
const PieChart = lazy(() => import("../Component/PieChart.jsx"));
const Typing = lazy(() => import("../Component/Typing.jsx"));
import "./Home.css";
import html2canvas from "html2canvas";
import axios from "axios";
import jsPDF from "jspdf";
import Spinner from "../Component/Spinner.jsx";
import { FaCloudDownloadAlt } from "react-icons/fa";

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/user/current`, { headers })
      .then((response) => {
        const { user } = response.data;
        if (user.role === "admin") {
          setIsAdmin(true);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const reportDownload = () => {
    setLoading(true);
    const element = document.querySelector(".home-container");

    if (element) {
      html2canvas(element, {
        scale: 2,
        useCORS: true,
      }).then((canvas) => {
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        let currentHeight = 0;
        while (currentHeight < canvasHeight) {
          const pageHeightInCanvas = (pdfHeight * canvasWidth) / pdfWidth;
          const croppedCanvas = document.createElement("canvas");
          croppedCanvas.width = canvasWidth;
          croppedCanvas.height = pageHeightInCanvas;
          const context = croppedCanvas.getContext("2d");
          context.drawImage(
            canvas,
            0,
            currentHeight,
            canvasWidth,
            pageHeightInCanvas,
            0,
            0,
            canvasWidth,
            pageHeightInCanvas
          );

          const croppedImgData = croppedCanvas.toDataURL("image/png");

          if (currentHeight > 0) pdf.addPage();
          const margin = 10; // Adjust margin
          pdf.addImage(
            croppedImgData,
            "PNG",
            margin,
            margin,
            pdfWidth - 2 * margin,
            pdfHeight - 2 * margin
          );

          currentHeight += pageHeightInCanvas;
          const nextElementBoundary = Math.floor(currentHeight);
          currentHeight = nextElementBoundary;
        }
        pdf.save("Report.pdf");
        setLoading(false);
      });
    }
  };
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="main-container">
      <Suspense fallback={<Spinner />}>
        <Typing />
        <div className="home-container">
          <Cards isAdmin={isAdmin} />
          {isAdmin && (
            <>
              <LineChart />
              <PieChart /> 
            </>
          )}
          <Chart />
        </div>
      </Suspense>
      <button
        className="download-btn"
        onClick={reportDownload}
        title="click to download report"
      >
        <FaCloudDownloadAlt />
      </button>
    </div>
  );
};

export default Home;
