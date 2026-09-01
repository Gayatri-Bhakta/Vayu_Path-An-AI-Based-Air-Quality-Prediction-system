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
import { useLanguage } from "../context/LanguageContext.jsx";
import delhiMetroBg from "../assets/delhi-metro.png";

function Signup() {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();

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
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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
      setError(language === 'en' ? "Please agree to the Terms of Service and Privacy Policy." : "कृपया सेवा की शर्तों और गोपनीयता नीति से सहमत हों।");
      return;
    }

    if (formData.password.length < 8) {
      setError(language === 'en' ? "Password must be at least 8 characters long." : "पासवर्ड कम से कम 8 वर्णों का होना चाहिए।");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError(language === 'en' ? "Passwords do not match." : "पासवर्ड मेल नहीं खाते हैं।");
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

      setSuccess(language === 'en' ? "Account created successfully! Redirecting to login..." : "खाता सफलतापूर्वक बन गया! लॉगिन पर पुनर्निर्देशित किया जा रहा है...");
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
        {/* LEFT COLUMN: SHORTENED PRODUCT BENEFITS */}
        <div className="vp-left-col">
          {/* Headline */}
          <div className="vp-hero-text">
            <h1>
              {t('signupHeroTitle1')} <br/>
              <span style={{ whiteSpace: "nowrap" }}>{t('signupHeroTitle2')}</span> <span className="vp-green-accent">{t('signupHeroTitle3')}</span>
            </h1>
            
            <p>
              {t('signupHeroDesc')}
            </p>
          </div>

          {/* 3 Streamlined Feature Cards */}
          <div className="vp-feature-card-stack">
            <div className="vp-white-pill-card">
              <div className="vp-pill-icon-circle">
                <TrendingUp size={20} />
              </div>
              <div className="vp-pill-card-text">
                <strong>{t('featLiveTitle')}</strong>
                <p>{t('featLiveDesc')}</p>
              </div>
            </div>

            <div className="vp-white-pill-card">
              <div className="vp-pill-icon-circle">
                <Bell size={20} />
              </div>
              <div className="vp-pill-card-text">
                <strong>{t('featPersonalAlertsTitle')}</strong>
                <p>{t('featPersonalAlertsDesc')}</p>
              </div>
            </div>

            <div className="vp-white-pill-card">
              <div className="vp-pill-icon-circle">
                <Navigation size={20} />
              </div>
              <div className="vp-pill-card-text">
                <strong>{t('featSmartRouteTitle')}</strong>
                <p>{t('featSmartRouteDesc')}</p>
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

            <h2 className="vp-card-title">{t('createAccountTitle')}</h2>
            <p className="vp-card-subtitle">{t('getStartedSubtitle')}</p>

            <form onSubmit={handleSubmit} className="vp-form-element">
              <div className="vp-grid-2">
                <div className="vp-field-box">
                  <label>{t('firstNameLabel')}</label>
                  <div className="vp-input-wrap">
                    <User className="vp-field-icon" size={15} />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder={t('firstNamePlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="vp-field-box">
                  <label>{t('lastNameLabel')}</label>
                  <div className="vp-input-wrap">
                    <User className="vp-field-icon" size={15} />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder={t('lastNamePlaceholder')}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="vp-field-box">
                <label>{t('emailLabel')}</label>
                <div className="vp-input-wrap">
                  <Mail className="vp-field-icon" size={15} />
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
                <label>{t('passwordLabel')}</label>
                <div className="vp-input-wrap">
                  <Lock className="vp-field-icon" size={15} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder={language === 'en' ? "Create a password" : "पासवर्ड बनाएं"}
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
                <label>{t('confirmPasswordLabel')}</label>
                <div className="vp-input-wrap">
                  <Lock className="vp-field-icon" size={15} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder={t('confirmPasswordPlaceholder')}
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
                {isPasswordFocused && (
                  <span className="vp-field-hint">
                    {language === 'en' ? "Use 8+ characters with a number and symbol." : "संख्या और प्रतीक के साथ 8+ वर्णों का उपयोग करें।"}
                  </span>
                )}
              </div>

              <div className="vp-terms-row">
                <input
                  type="checkbox"
                  id="vp-terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="vp-terms">
                  {language === 'en' ? (
                    <>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></>
                  ) : (
                    <>मैं <a href="#terms">सेवा की शर्तों</a> और <a href="#privacy">गोपनीयता नीति</a> से सहमत हूँ</>
                  )}
                </label>
              </div>

              {error && <div className="vp-error-banner">{error}</div>}
              {success && <div className="vp-success-banner">{success}</div>}

              <button type="submit" className="vp-submit-btn" disabled={loading}>
                <span>{loading ? (language === 'en' ? "Creating Account..." : "खाता बनाया जा रहा है...") : t('createAccountBtn')}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="vp-or-divider">
              <span>{t('orText')}</span>
            </div>

            <div className="vp-switch-prompt">
              {t('alreadyHaveAccount')} <Link to="/login" className="vp-green-link">{t('signInLink')}</Link>
            </div>

            {/* Subtle Security Line */}
            <div className="vp-security-footer">
              <ShieldCheck size={14} color="#16a34a" />
              <span>{t('dataEncrypted')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;