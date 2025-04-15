import React, { useEffect, useState } from "react";
import axios from "axios";
import { TypeAnimation } from "react-type-animation";
import { FaSun, FaMoon, FaCloudSun, FaCloudMoon } from "react-icons/fa";
import Hero from "../asset/Hero.png";
import "./Typing.css";
const Typing = () => {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    axios
      .get(`${import.meta.env.VITE_API_URL}api/user/current`, { headers })
      .then((response) => {
        const { user } = response.data;
        setUser(user);
      })
      .catch((error) => {
        console.log(error);
      });

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good Afternoon");
    } else if (hour >= 18 && hour < 22) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }
  }, []);

  const generateMessages = (user) => {
    if (!user) return [];
    return [`${greeting} ${user.name}!`, `Welcome back, ${user.name}`];
  };

  const messages = generateMessages(user);

  const getBackgroundAndIcon = () => {
    switch (greeting) {
      case "Good Morning":
        return {
          background: "#FFD700",
          icon: <FaSun style={{ fontSize: "6em", marginBottom: "20px" }} />,
        };
      case "Good Afternoon":
        return {
          background: "#FFB347",
          icon: (
            <FaCloudSun style={{ fontSize: "6em", marginBottom: "20px" }} />
          ),
        };
      case "Good Evening":
        return {
          background: "#FF6347",
          icon: (
            <FaCloudMoon style={{ fontSize: "6em", marginBottom: "20px" }} />
          ),
        };
      case "Good Night":
        return {
          background: "#2F4F4F",
          icon: <FaMoon style={{ fontSize: "6em", marginBottom: "20px" }} />,
        };
      default:
        return { background: "#FFFFFF", icon: null };
    }
  };

  const { background, icon } = getBackgroundAndIcon();

  return (
      <div className="welcome-container" style={{ backgroundColor: background }}>
        <div className="welcome-left">
          <img src={Hero} alt="Hero" />
        </div>
        <div className="welcome-right">
          {user ? (
            <>
              {icon}
              <TypeAnimation
                sequence={[...messages, 2000]}
                wrapper="h1"
                speed={50}
                repeat={Infinity}
              />
            </>
          ) : (
            <h1>Loading...</h1>
          )}
        </div>
      </div>
  );
};

export default Typing;
