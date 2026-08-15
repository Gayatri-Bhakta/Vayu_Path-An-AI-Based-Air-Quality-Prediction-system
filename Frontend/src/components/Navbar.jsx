import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wind, LogOut } from "lucide-react";

export default function Navbar({ activePage = "Dashboard" }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/home" className="brand">
        <span className="brand-mark">
          <Wind size={18} color="#ffffff" />
        </span>
        <span className="brand-title">Air Quality Prediction</span>
      </Link>

      <div className="nav-links">
        <Link to="/home" className={`nav-item ${activePage === "Home" ? "active" : ""}`}>Home</Link>
        <Link to="/dashboard" className={`nav-item ${activePage === "Dashboard" ? "active" : ""}`}>Dashboard</Link>
        <Link to="/routes" className={`nav-item ${activePage === "Routes" ? "active" : ""}`}>Routes</Link>
        <Link to="/alerts" className={`nav-item ${activePage === "Alerts" ? "active" : ""}`}>Alerts</Link>
        <Link to="/profile" className={`nav-item ${activePage === "Profile" ? "active" : ""}`}>Profile</Link>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={13} />
          Logout ({user?.first_name || "Gayatri"})
        </button>
      </div>
    </nav>
  );
}