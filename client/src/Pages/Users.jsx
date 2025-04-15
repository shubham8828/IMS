import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaCloudDownloadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Users.css"; 
import Spinner from "../Component/Spinner";
import * as XLSX from "xlsx";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currUser, setCurrUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
  
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/all`, { headers });
  
      const userList = response.data.users || [];
      setUsers(userList);
      setCurrUser(response.data.user);

    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id,role) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    if(role==='admin'){
      alert("You Cant Delete Admin");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:4000/api/user/delete/${id}`, { headers });

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };
  const filteredUsers = users.filter((user) => {
    // Exclude the current logged-in user
    if (user.email === currUser?.email) return false;
    
    // For everyone else, apply the standard filtering
    const query = searchQuery.toLowerCase().trim();
    return (
      (selectedRole === "" || user.role?.toLowerCase() === selectedRole.toLowerCase()) &&
      (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query) ||
        user.address?.city?.toLowerCase().includes(query) ||
        user.address?.state?.toLowerCase().includes(query) ||
        user.address?.country?.toLowerCase().includes(query) ||
        user.address?.localArea?.toLowerCase().includes(query) ||
        user.address?.pin?.toString().includes(query) ||
        user.createdBy?.toLowerCase().includes(query)
      )
    );
  });

  // Download user data as Excel (.xlsx)
  const downloadUserData = () => {
    if (users.length === 0) {
      console.error("No users available to download.");
      return;
    }

    const userData = users.map((user) => ({
      "User ID": user._id || "N/A",
      Name: user.name || "N/A",
      Email: user.email || "N/A",
      Phone: user.phone || "N/A",
      "Local Area": user.address?.localArea || "N/A",
      City: user.address?.city || "N/A",
      State: user.address?.state || "N/A",
      Country: user.address?.country || "N/A",
      Pin: user.address?.pin || "N/A",
      Role: user.role || "N/A",
      "Created By": user.createdBy || "N/A",
      "Created At": user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "N/A",
    }));

    const wb = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(userData);
    XLSX.utils.book_append_sheet(wb, worksheet, "User Data");
    XLSX.writeFile(wb, "User-Data.xlsx");
  };

  if (loading) return <Spinner />;

  return (
    <div className="main-container">
      <div className="user-container">
        <div className="users-search-bar-group">
          <h1 className="users-table-header">Users</h1>
          <input
            type="text"
            placeholder="Search by Name, Email, City, State, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="users-search-bar"
          />
              <select
                className="users-filter"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">All Users</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              
        </div>

        {filteredUsers.length === 0 ? (
          <div className="no-users">No users available</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Country</th>
                  <th>Local Area</th>
                  <th>Pin Code</th>
                  {currUser?.role === "root" && <th>Created By</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.role}</td>
                    <td>{user.address?.city || "N/A"}</td>
                    <td>{user.address?.state || "N/A"}</td>
                    <td>{user.address?.country || "N/A"}</td>
                    <td>{user.address?.localArea || "N/A"}</td>
                    <td>{user.address?.pin || "N/A"}</td>
                    {currUser?.role === "root" && <td>{user.createdBy}</td>}
                    <td style={{display:'flex', flexDirection:'row'}}>
                      <button className="users-edit-btn" onClick={() => navigate("/user/edit", { state: user })}>
                        <FaEdit />
                      </button>
                      <button className="users-delete-btn" onClick={() => handleDelete(user._id,user.role)}>
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button className="download-btn" title="Download user data" onClick={downloadUserData}>
          <FaCloudDownloadAlt /> 
        </button>
      </div>
    </div>
  );
};

export default Users;
