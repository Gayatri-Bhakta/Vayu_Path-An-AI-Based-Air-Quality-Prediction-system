import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { MessageSquare, Star, X, Check } from "lucide-react";

import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard"; // <-- 1. Import your Dashboard page
import RoutesPage from "./pages/Routes";
import ProfilePage from "./pages/Profile";
import AlertsPage from "./pages/Alerts";

// Route guard for pages that require authentication
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Route guard for public-only pages (redirects to home if already logged in)
function PublicRoute({ children }) {
  const token = localStorage.getItem("access_token");
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/routes" element={
          <ProtectedRoute>
            <RoutesPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute>
            <AlertsPage />
          </ProtectedRoute>
        } />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <FeedbackWidget />
    </BrowserRouter>
  );
}


function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("UI/UX");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    const handleOpenFeedback = () => setOpen(true);
    window.addEventListener("open-feedback", handleOpenFeedback);
    return () => window.removeEventListener("open-feedback", handleOpenFeedback);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const token = localStorage.getItem("access_token");
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch("http://localhost:8000/api/feedback", {
      method: "POST",
      headers,
      body: JSON.stringify({ rating, category, comments })
    })
      .then(res => res.json())
      .then(data => {
        setSubmitting(false);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setOpen(false);
          setRating(5);
          setComments("");
          setCategory("UI/UX");
        }, 1500);
      })
      .catch(err => {
        setSubmitting(false);
        console.error("Error submitting feedback:", err);
      });
  };

  return (
    <>
      {/* Modal Overlay */}
      {open && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "20px",
          boxSizing: "border-box"
        }}>
          {/* Modal Container */}
          <div className="contrast-card" style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "28px",
            width: "420px",
            maxWidth: "100%",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxSizing: "border-box"
          }}>
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <X size={18} />
            </button>

            {success ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", textAlign: "center", gap: "16px" }}>
                <span style={{ background: "#dcfce7", color: "#15803d", padding: "16px", borderRadius: "50%" }}>
                  <Check size={28} />
                </span>
                <div>
                  <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0" }}>Thank You!</h4>
                  <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Your feedback has been saved successfully.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0" }}>Submit Feedback</h4>
                  <p style={{ color: "#64748b", fontSize: "12.5px", margin: 0 }}>Help us improve your air quality forecasting experience.</p>
                </div>

                {/* Category Select */}
                <div>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Category</label>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 12px", background: "#f8fafc" }}>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "13.5px", color: "#0f172a", cursor: "pointer" }}
                    >
                      <option value="UI/UX">UI & UX Design</option>
                      <option value="Bug">Report a Bug</option>
                      <option value="Suggestion">Feature Suggestion</option>
                      <option value="Other">General Feedback</option>
                    </select>
                  </div>
                </div>

                {/* Star Ratings */}
                <div>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>Rating</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        <Star
                          size={24}
                          fill={star <= (hoverRating || rating) ? "#eab308" : "none"}
                          color={star <= (hoverRating || rating) ? "#eab308" : "#cbd5e1"}
                          style={{ transition: "transform 0.1s" }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments Textarea */}
                <div>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Comments</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    placeholder="Tell us what you think..."
                    style={{
                      width: "100%",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      background: "#f8fafc",
                      fontSize: "13px",
                      color: "#0f172a",
                      outline: "none",
                      resize: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{
                      flex: 1,
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 2,
                      background: "#0284c7",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer"
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;