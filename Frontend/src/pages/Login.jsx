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
import { useLanguage } from "../context/LanguageContext.jsx";
import delhiGateBg from "../assets/delhi-gate.jpg";

function Login() {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();

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

      {/* Glassmorphic Top Auth Header */}
      <header className="vp-auth-header">
        <div className="vp-auth-header-brand">
          <div className="vp-auth-header-icon">
            <Wind size={18} />
          </div>
          <span className="vp-auth-header-title">{t('logoTitle')}</span>
        </div>
        <div className="vp-auth-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button className="vp-lang-toggle" onClick={toggleLanguage} title="Change Language / भाषा बदलें">
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <div className="vp-auth-header-status">
            <span className="vp-status-dot" />
            <span>{t('sysStatus')}</span>
          </div>
        </div>
      </header>

      <div className="vp-auth-container">
        {/* LEFT COLUMN: HERO MARKETING */}
        <div className="vp-left-col">

          {/* Hero Titles */}
          <div className="vp-hero-text">
            <h1>
              {t('loginHeroTitle1')}<br />
              <span className="vp-green-accent">{t('loginHeroTitle2')}</span>
            </h1>
            <p>
              {t('loginHeroDesc')}
            </p>
          </div>

          {/* AQI Glass Card */}
          <div className="vp-aqi-card">
            <div className="vp-aqi-header">
              <span className="vp-aqi-tag">{t('liveAqiTag')}</span>
              <div className="vp-weather-pill">
                <SunMedium size={14} />
                <span>31°C</span>
              </div>
            </div>

            <div className="vp-aqi-body">
              <span className="vp-aqi-val">128</span>
              <div className="vp-aqi-info">
                <strong>{t('modRisk')}</strong>
                <span>{t('sensCaution')}</span>
              </div>
            </div>

            <div className="vp-aqi-footer">
              <MapPin size={12} />
              <span>{t('cpStation')}</span>
            </div>
          </div>

          {/* Core Capabilities Stack */}
          <div className="vp-feature-card-stack">
            <div className="vp-white-pill-card">
              <div className="vp-pill-icon-circle">
                <Sparkles size={16} />
              </div>
              <div className="vp-pill-card-text">
                <strong>{t('featAiTitle')}</strong>
                <p>{t('featAiDesc')}</p>
              </div>
            </div>
            
            <div className="vp-white-pill-card">
              <div className="vp-pill-icon-circle">
                <Navigation size={16} />
              </div>
              <div className="vp-pill-card-text">
                <strong>{t('featRouteTitle')}</strong>
                <p>{t('featRouteDesc')}</p>
              </div>
            </div>

            <div className="vp-white-pill-card">
              <div className="vp-pill-icon-circle">
                <ShieldCheck size={16} />
              </div>
              <div className="vp-pill-card-text">
                <strong>{t('featAlertsTitle')}</strong>
                <p>{t('featAlertsDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED LOGIN CARD */}
        <div className="vp-right-col">
          <div className="vp-form-card">
            <div className="vp-card-icon-wrap">
              <Wind size={22} color="#0c2c17" />
            </div>

            <h2 className="vp-card-title">{t('welcomeTitle')}</h2>
            <p className="vp-card-subtitle">{t('signInSubtitle')}</p>

            <form onSubmit={handleSubmit} className="vp-form-element">
              <div className="vp-field-box">
                <label>{t('emailLabel')}</label>
                <div className="vp-input-wrap">
                  <Mail className="vp-field-icon" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="vp-field-box">
                <div className="vp-label-row">
                  <label>{t('passwordLabel')}</label>
                  <a href="#forgot" className="vp-forgot-btn">{t('forgotPassword')}</a>
                </div>
                <div className="vp-input-wrap">
                  <Lock className="vp-field-icon" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('passwordPlaceholder')}
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
                <span>{loading ? (language === 'en' ? "Signing in..." : "साइन इन किया जा रहा है...") : t('signInBtn')}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="vp-or-divider">
              <span>{t('orText')}</span>
            </div>

            <div className="vp-switch-prompt">
              {t('noAccountText')} <Link to="/signup" className="vp-green-link">{t('createOne')}</Link>
            </div>

            {/* Subtle Security Message */}
            <div className="vp-security-footer">
              <ShieldCheck size={14} color="#16a34a" />
              <span>{t('secureInfo')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;