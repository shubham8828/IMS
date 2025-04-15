import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";
import "./Message.css";

import Spinner from "../Component/Spinner";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showAdmin, setShowAdmin] = useState(true); // State to toggle between Admins and Users
  const [currUser, setCurrUser] = useState(null); // Current logged-in user
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token"); // Retrieve the token from localStorage
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedUser && users.length > 0) {
      getMessageData();
    }
  }, [selectedUser, users]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/all`, {
        headers,
      });
      setUsers(usersResponse.data.users);
      setCurrUser(usersResponse.data.user); // Assuming `user` contains the logged-in user's data
    } catch (error) {
      console.error("Error fetching users:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMessageData = () => {
    if (!selectedUser || !currUser) return;

    const sender = currUser.email;
    const receiver = users.find((user) => user._id === selectedUser)?.email;

    if (!receiver) {
      console.error("Receiver email not found.");
      return;
    }

    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/message/all`,
        { sender, receiver },
        { headers }
      )
      .then((response) => {
        setMessages(response.data.conversation.message || []);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error.message);
      });
  };

  const handleUserClick = (userId) => {
    setSelectedUser(userId);
  };
  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !currUser || !selectedUser) {
      // Ensure message is not empty and user is selected
      return;
    }

    const newMessageObject = {
      sender: currUser.email,
      msg: newMessage,
      createdAt: Date.now(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessageObject]);
    setNewMessage("");

    const receiverEmail = users.find(
      (user) => user._id === selectedUser
    )?.email;

    if (!receiverEmail) {
      console.error("Receiver email not found for sending message.");
      return;
    }

    const collectedData = {
      sender: currUser.email,
      receiver: receiverEmail,
      message: [newMessageObject], // Wrap message in an array
    };

    axios
      .post(`${import.meta.env.VITE_API_URL}/api/message/new`, collectedData, { headers })
      .then((response) => {
        console.log("Message sent:", response.data);
        // Optionally update state if needed with the saved message
      })
      .catch((error) => {
        console.error("Error sending message:", error.message);
      });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
      <div className="chat-container">
        <div className="user-list-container">
          <h3>AIMPS</h3>

          {/* Toggle Buttons */}
          <div className="btn-group">
            <button
              className={`toggle-btn ${showAdmin ? "act" : ""}`}
              onClick={() => setShowAdmin(true)}
            >
              Admins
            </button>
            <button
              className={`toggle-btn ${!showAdmin ? "act" : ""}`}
              onClick={() => setShowAdmin(false)}
            >
              Users
            </button>
          </div>
          <div className="user-list">
            <ul>
              {users
                .filter(
                  (user) =>
                    user.email !== currUser?.email && // Exclude the current logged-in user
                    (showAdmin ? user.role === "admin" : user.role === "user") // Filter by role
                )
                .map((user) => (
                  <li key={user._id} onClick={() => handleUserClick(user._id)}>
                    <div className="user-item">
                      <img
                        src={user.image}
                        alt={user.name}
                        className="user-avatar"
                      />
                      <span>{user.name}</span>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="chat-window">
          {selectedUser ? (
            <div className="chat-content">
              <div className="chat-header">
                <img
                  src={users.find((user) => user._id === selectedUser)?.image}
                  alt=""
                />
                <h3>
                  {
                    users
                      .find((user) => user._id === selectedUser)
                      ?.name.split(" ")[0]
                  }
                </h3>
              </div>
              <div className="messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={
                      msg.sender === currUser.email ? "sent" : "received"
                    }
                  >
                    <p>{msg.msg}</p>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="message-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={handleSendMessage}>
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          ) : (
            <p
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "35%",
              }}
            >
              Select a user to start chatting
            </p>
          )}
        </div>
      </div>
  );
};

export default Message;
