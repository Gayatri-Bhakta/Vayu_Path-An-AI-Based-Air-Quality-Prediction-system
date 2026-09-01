import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wind, LogOut, MessageSquare } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function Navbar({ activePage = "Dashboard" }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { t, language } = useLanguage();

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
        <span className="brand-title">{t('logoTitle')}</span>
      </Link>

      <div className="nav-links">
        <Link to="/home" className={`nav-item ${activePage === "Home" ? "active" : ""}`}>{t('navHome')}</Link>
        <Link to="/dashboard" className={`nav-item ${activePage === "Dashboard" ? "active" : ""}`}>{t('navDashboard')}</Link>
        <Link to="/routes" className={`nav-item ${activePage === "Routes" ? "active" : ""}`}>{t('navRoutes')}</Link>
        <Link to="/alerts" className={`nav-item ${activePage === "Alerts" ? "active" : ""}`}>{t('navAlerts')}</Link>
        <Link to="/profile" className={`nav-item ${activePage === "Profile" ? "active" : ""}`}>{t('navProfile')}</Link>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button 
            onClick={() => window.dispatchEvent(new Event("open-feedback"))} 
            style={{ 
              background: "#f0f9ff", 
              color: "#0369a1", 
              border: "1px solid #bae6fd", 
              borderRadius: "20px", 
              padding: "8px 16px", 
              fontSize: "13px", 
              fontWeight: "600", 
              cursor: "pointer", 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px",
              fontFamily: "inherit",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e0f2fe";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(2, 132, 199, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f0f9ff";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <MessageSquare size={13} />
            {t('navFeedback')}
          </button>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={13} />
            {t('navLogout')} ({language === 'hi' && (user?.first_name?.toLowerCase() === 'gayatri' || !user?.first_name) ? 'गायत्री' : (user?.first_name || "Gayatri")})
          </button>
        </div>
      </div>
    </nav>
  );
}