import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  Navigation, 
  Wind, 
  SunMedium,
  ShieldCheck
} from "lucide-react";
import delhiGateBg from "../assets/delhi-gate.jpg";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Invalid email or password.");
        setLoading(false);
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setLoading(false);

      // Redirect to Home landing page after login
      navigate("/home");
    } catch (err) {
      setError("Unable to connect to server. Please verify backend is running.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="vp-auth-page vp-login-bg"
      style={{ backgroundImage: `url(${delhiGateBg})` }}
    >
      <div className="vp-auth-overlay" />

      <div className="vp-auth-container">
        {/* LEFT COLUMN: HERO MARKETING */}
        <div className="vp-left-col">
          {/* Brand Badge */}
          <div className="vp-brand-pill">
            <div className="vp-brand-icon">
              <Wind size={18} color="#0c2c17" />
            </div>
            <span className="vp-brand-text">Air Quality Prediction</span>
          </div>

          {/* Hero Titles */}
          <div className="vp-hero-text">
            <h1>
              Cleaner Air.<br />
              Smarter Routes.<br />
              <span className="vp-green-accent">Better Living.</span>
            </h1>
            <p>
              Real-time air quality insights, AI-driven risk alerts, and exposure-optimized routes.
            </p>
          </div>

          {/* AQI Glass Card */}
          <div className="vp-aqi-card">
            <div className="vp-aqi-header">
              <span className="vp-aqi-tag">LIVE AQI</span>
              <div className="vp-weather-pill">
                <SunMedium size={14} />
                <span>31°C</span>
              </div>
            </div>

            <div className="vp-aqi-body">
              <span className="vp-aqi-val">128</span>
              <div className="vp-aqi-info">
                <strong>Moderate Risk</strong>
                <span>Sensitive groups take caution</span>
              </div>
            </div>

            <div className="vp-aqi-footer">
              <MapPin size={12} />
              <span>Connaught Place, Central Station</span>
            </div>
          </div>

          {/* Bottom Dock */}
          <div className="vp-bottom-dock">
            <div className="vp-dock-item">
              <Sparkles size={14} color="#4ade80" />
              <span>Real-Time Sensing</span>
            </div>
            <div className="vp-dock-sep" />
            <div className="vp-dock-item">
              <TrendingUp size={14} color="#4ade80" />
              <span>AI Predictions</span>
            </div>
            <div className="vp-dock-sep" />
            <div className="vp-dock-item">
              <Navigation size={14} color="#4ade80" />
              <span>Safer Routes</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED LOGIN CARD */}
        <div className="vp-right-col">
          <div className="vp-form-card">
            <div className="vp-card-icon-wrap">
              <Wind size={22} color="#0c2c17" />
            </div>

            <h2 className="vp-card-title">Welcome back!</h2>
            <p className="vp-card-subtitle">Sign in to continue.</p>

            <form onSubmit={handleSubmit} className="vp-form-element">
              <div className="vp-field-box">
                <label>Email address</label>
                <div className="vp-input-wrap">
                  <Mail className="vp-field-icon" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="vp-field-box">
                <div className="vp-label-row">
                  <label>Password</label>
                  <a href="#forgot" className="vp-forgot-btn">Forgot password?</a>
                </div>
                <div className="vp-input-wrap">
                  <Lock className="vp-field-icon" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="vp-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <div className="vp-error-banner">{error}</div>}

              <button type="submit" className="vp-submit-btn" disabled={loading}>
                <span>{loading ? "Signing in..." : "Sign In"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="vp-or-divider">
              <span>or</span>
            </div>

            <div className="vp-switch-prompt">
              Don't have an account? <Link to="/signup" className="vp-green-link">Create one</Link>
            </div>

            {/* Subtle Security Message */}
            <div className="vp-security-footer">
              <ShieldCheck size={14} color="#16a34a" />
              <span>Your information is securely protected.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;