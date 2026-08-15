import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Bell, 
  Navigation,
  Wind
} from "lucide-react";
import delhiMetroBg from "../assets/delhi-metro.png";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to create account.");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setLoading(false);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError("Unable to connect to server. Please verify backend is running.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="vp-auth-page vp-signup-bg"
      style={{ backgroundImage: `url(${delhiMetroBg})` }}
    >
      <div className="vp-auth-overlay" />

      <div className="vp-auth-container">
        {/* LEFT COLUMN: SHORTENED PRODUCT BENEFITS */}
        <div className="vp-left-col">
          {/* Brand Badge */}
          <div className="vp-brand-pill">
            <div className="vp-brand-icon">
              <Wind size={18} color="#16a34a" />
            </div>
            <span className="vp-brand-text">Air Quality Prediction</span>
          </div>

          {/* Headline */}
          <div className="vp-hero-text">
            <h1>
              Join us for a <br/>
              Cleaner, Healthier <span className="vp-green-accent">Tomorrow.</span>
            </h1>
            
            <p>
              Get personalized air-quality alerts and routes based on your needs.
            </p>
          </div>

          {/* 3 Streamlined Feature Cards */}
          <div className="vp-feature-card-stack">
            <div className="vp-white-pill-card">
              <div className="vp-pill-icon-circle">
                <TrendingUp size={18} color="#16a34a" />
              </div>
              <div className="vp-pill-card-text">
                <strong>Real-Time Air Quality</strong>
                <p>High-resolution forecasts up to 24 hours ahead</p>
              </div>
            </div>

            <div className="vp-white-pill-card">
              <div className="vp-pill-icon-circle">
                <Bell size={18} color="#16a34a" />
              </div>
              <div className="vp-pill-card-text">
                <strong>Personalized Alerts</strong>
                <p>Alerts tailored to your sensitivity and preferences</p>
              </div>
            </div>

            <div className="vp-white-pill-card">
              <div className="vp-pill-icon-circle">
                <Navigation size={18} color="#16a34a" />
              </div>
              <div className="vp-pill-card-text">
                <strong>Smart Route Optimization</strong>
                <p>Routes optimized to reduce pollution exposure</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STREAMLINED SIGNUP CARD */}
        <div className="vp-right-col">
          <div className="vp-form-card vp-signup-card">
            <div className="vp-card-icon-wrap">
              <User size={22} color="#16a34a" />
            </div>

            <h2 className="vp-card-title">Create Your Account</h2>
            <p className="vp-card-subtitle">Let's get you started</p>

            <form onSubmit={handleSubmit} className="vp-form-element">
              <div className="vp-grid-2">
                <div className="vp-field-box">
                  <label>First name</label>
                  <div className="vp-input-wrap">
                    <User className="vp-field-icon" size={15} />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>

                <div className="vp-field-box">
                  <label>Last name</label>
                  <div className="vp-input-wrap">
                    <User className="vp-field-icon" size={15} />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="vp-field-box">
                <label>Email address</label>
                <div className="vp-input-wrap">
                  <Mail className="vp-field-icon" size={15} />
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
                <label>Password</label>
                <div className="vp-input-wrap">
                  <Lock className="vp-field-icon" size={15} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    className="vp-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="vp-field-box">
                <label>Confirm Password</label>
                <div className="vp-input-wrap">
                  <Lock className="vp-field-icon" size={15} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="vp-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <span className="vp-field-hint">Use 8+ characters with a number and symbol.</span>
              </div>

              <div className="vp-terms-row">
                <input
                  type="checkbox"
                  id="vp-terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="vp-terms">
                  I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                </label>
              </div>

              {error && <div className="vp-error-banner">{error}</div>}
              {success && <div className="vp-success-banner">{success}</div>}

              <button type="submit" className="vp-submit-btn" disabled={loading}>
                <span>{loading ? "Creating Account..." : "Create Account"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="vp-or-divider">
              <span>or</span>
            </div>

            <div className="vp-switch-prompt">
              Already have an account? <Link to="/login" className="vp-green-link">Sign in</Link>
            </div>

            {/* Subtle Security Line */}
            <div className="vp-security-footer">
              <ShieldCheck size={14} color="#16a34a" />
              <span>Your data is encrypted and securely stored.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;