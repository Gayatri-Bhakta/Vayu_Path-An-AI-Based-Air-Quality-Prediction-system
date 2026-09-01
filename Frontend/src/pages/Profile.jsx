import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  User, Shield, Key, Bell, Activity, Clock, ShieldAlert, CheckCircle, 
  Settings, Heart, AlertCircle, Save, LogOut, Wind, MessageSquare, Star
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, setAppLanguage, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  // Account Information State
  const [account, setAccount] = useState({
    first_name: "",
    last_name: "",
    email: "",
    created_at: "",
    password: "",
    confirm_password: ""
  });

  // Health Profile State
  const [healthProfile, setHealthProfile] = useState({
    sensitivity: "general",
    aqi_threshold: 150,
    alerts_enabled: true
  });

  // Stats
  const [routesCount, setRoutesCount] = useState(0);

  // Status & Notification Banners
  const [accountSuccess, setAccountSuccess] = useState("");
  const [accountError, setAccountError] = useState("");
  const [healthSuccess, setHealthSuccess] = useState("");
  const [healthError, setHealthError] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);

  // Threshold descriptions based on target values
  const sensitivityPresets = {
    general: { 
      label: language === 'en' ? "General Public" : "आम जनता", 
      threshold: 150, 
      desc: language === 'en' ? "Standard CPCB warning threshold. Standard safety precautions apply." : "मानक सीपीसीबी चेतावनी सीमा। सामान्य सुरक्षा सावधानियां लागू होती हैं।" 
    },
    child: { 
      label: language === 'en' ? "Children" : "बच्चे", 
      threshold: 100, 
      desc: language === 'en' ? "Lower threshold suited for children's respiratory safety." : "बच्चों की श्वसन सुरक्षा के लिए उपयुक्त कम सीमा।" 
    },
    elderly: { 
      label: language === 'en' ? "Elderly Citizens" : "वरिष्ठ नागरिक", 
      threshold: 100, 
      desc: language === 'en' ? "Recommended limit for senior citizens to reduce exposure risks." : "जोखिमों को कम करने के लिए वरिष्ठ नागरिकों के लिए अनुशंसित सीमा।" 
    },
    asthmatic: { 
      label: language === 'en' ? "Asthmatic Patients" : "अस्थमा के रोगी", 
      threshold: 80, 
      desc: language === 'en' ? "Highly sensitive threshold tailored for asthma triggers and breathing safety." : "अस्थमा के कारणों और सांस लेने की सुरक्षा के लिए अत्यधिक संवेदनशील सीमा।" 
    },
    cardio: { 
      label: language === 'en' ? "Cardio-Vascular Concerns" : "हृदय संबंधी चिंताएं", 
      threshold: 80, 
      desc: language === 'en' ? "Restricted exposure limit to safeguard heart and circulatory health." : "हृदय और संचार स्वास्थ्य की रक्षा के लिए प्रतिबंधित सीमा।" 
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    
    // 1. Fetch user account details
    const fetchUser = fetch("http://localhost:8000/auth/me", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(res => res.json());

    // 2. Fetch health profile
    const fetchHealth = fetch("http://localhost:8000/api/routes/health-profile", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(res => res.json());

    // 3. Fetch routes history count
    const fetchHistory = fetch("http://localhost:8000/api/routes/history", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(res => res.json());

    Promise.all([fetchUser, fetchHealth, fetchHistory])
      .then(([userData, healthData, historyData]) => {
        if (userData && !userData.detail) {
          setAccount(prev => ({
            ...prev,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            created_at: userData.created_at
          }));
        }
        
        if (healthData && !healthData.detail) {
          setHealthProfile(healthData);
        }

        if (Array.isArray(historyData)) {
          setRoutesCount(historyData.length);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile data:", err);
        setLoading(false);
      });
  }, [navigate]);

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    setAccountSuccess("");
    setAccountError("");
    
    // Check password matches if trying to change it
    if (account.password || account.confirm_password) {
      if (account.password !== account.confirm_password) {
        setAccountError(language === 'en' ? "Passwords do not match." : "पासवर्ड मेल नहीं खाते हैं।");
        return;
      }
      if (account.password.length < 6) {
        setAccountError(language === 'en' ? "Password must be at least 6 characters." : "पासवर्ड कम से कम 6 वर्णों का होना चाहिए।");
        return;
      }
    }

    const token = localStorage.getItem("access_token");
    setSavingAccount(true);

    fetch("http://localhost:8000/auth/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        first_name: account.first_name,
        last_name: account.last_name,
        email: account.email,
        password: account.password || null,
        confirm_password: account.confirm_password || null
      })
    })
      .then(res => res.json())
      .then(data => {
        setSavingAccount(false);
        if (data.detail) {
          setAccountError(data.detail);
        } else {
          setAccountSuccess(language === 'en' ? "Account updated successfully." : "खाता विवरण सफलतापूर्वक सहेजा गया।");
          
          // Clear password fields
          setAccount(prev => ({ ...prev, password: "", confirm_password: "" }));
          
          // Update local storage user details
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem("user", JSON.stringify({
            ...storedUser,
            first_name: account.first_name,
            last_name: account.last_name,
            email: account.email
          }));
        }
      })
      .catch(err => {
        setSavingAccount(false);
        setAccountError(language === 'en' ? "Failed to update account details." : "खाता विवरण अपडेट करने में विफल।");
      });
  };

  const handleHealthSubmit = (e) => {
    e.preventDefault();
    setHealthSuccess("");
    setHealthError("");
    setSavingHealth(true);

    const token = localStorage.getItem("access_token");

    fetch("http://localhost:8000/api/routes/health-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(healthProfile)
    })
      .then(res => res.json())
      .then(data => {
        setSavingHealth(false);
        if (data.detail) {
          setHealthError(data.detail);
        } else {
          setHealthSuccess(language === 'en' ? "Sensitivity configurations saved." : "संवेदनशीलता सेटिंग्स सफलतापूर्वक सहेजी गईं।");
        }
      })
      .catch(err => {
        setSavingHealth(false);
        setHealthError(language === 'en' ? "Failed to update health parameters." : "स्वास्थ्य मापदंडों को अपडेट करने में विफल।");
      });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === 'en' ? "en-US" : "hi-IN", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="home-page" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar activePage="Profile" />
        <main style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
          <span>{language === 'en' ? "Loading user profile preferences..." : "उपयोगकर्ता प्रोफ़ाइल प्राथमिकताओं को लोड किया जा रहा है..."}</span>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Background Ambience */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <Navbar activePage="Profile" />

      <main style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "30px 2rem 60px 2rem", boxSizing: "border-box", position: "relative", zIndex: 10 }}>
        
        {/* Header Summary */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--text-primary)", margin: "0" }}>
            {language === 'en' ? "User Settings & Profile" : "उपयोगकर्ता सेटिंग्स और प्रोफ़ाइल"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px", marginBottom: "0" }}>
            {language === 'en' 
              ? "Manage your account credentials and customize your health profile parameters for pollution alert thresholds." 
              : "अपने खाते के क्रेडेंशियल्स प्रबंधित करें और प्रदूषण अलर्ट सीमाओं के लिए अपने स्वास्थ्य प्रोफ़ाइल मापदंडों को अनुकूलित करें।"
            }
          </p>
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "28px" }}>
          
          {/* Left Column: Account Details & Change Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* Account Details Form */}
            <div className="contrast-card" style={{
              background: "var(--card-bg)",
              borderRadius: "24px",
              padding: "28px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{ background: "#e0f2fe", padding: "8px", borderRadius: "10px", color: "#0284c7" }}>
                  <User size={20} />
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>
                  {language === 'en' ? "Account details" : "खाता विवरण"}
                </h3>
              </div>

              <form onSubmit={handleAccountSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                      {language === 'en' ? "First Name" : "पहला नाम"}
                    </label>
                    <input 
                      type="text" 
                      value={language === 'hi' && account.first_name === 'Gayatri' ? 'गायत्री' : account.first_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAccount(prev => ({ ...prev, first_name: val === 'गायत्री' ? 'Gayatri' : val }));
                      }}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px",
                        color: "var(--text-primary)",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "6px" }}>
                      {language === 'en' ? "Last Name" : "अंतिम नाम"}
                    </label>
                    <input 
                      type="text" 
                      value={language === 'hi' && account.last_name === 'Bhakta' ? 'भक्ता' : account.last_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAccount(prev => ({ ...prev, last_name: val === 'भक्ता' ? 'Bhakta' : val }));
                      }}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        fontSize: "13.5px",
                        color: "var(--text-primary)",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "6px" }}>
                    {language === 'en' ? "Email Address" : "ईमेल पता"}
                  </label>
                  <input 
                    type="email" 
                    value={account.email}
                    onChange={(e) => setAccount(prev => ({ ...prev, email: e.target.value }))}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      fontSize: "13.5px",
                      color: "var(--text-primary)",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "18px", marginTop: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <Key size={14} color="var(--text-secondary)" />
                    <span style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--text-primary)" }}>
                      {language === 'en' ? "Change Password (Optional)" : "पासवर्ड बदलें (वैकल्पिक)"}
                    </span>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "6px" }}>
                        {language === 'en' ? "New Password" : "नया पासवर्ड"}
                      </label>
                      <input 
                        type="password" 
                        placeholder={language === 'en' ? "Leave blank to keep current" : "वर्तमान रखने के लिए खाली छोड़ें"}
                        value={account.password}
                        onChange={(e) => setAccount(prev => ({ ...prev, password: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-color)",
                          fontSize: "13.5px",
                          color: "var(--text-primary)",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "6px" }}>
                        {language === 'en' ? "Confirm Password" : "पासवर्ड की पुष्टि करें"}
                      </label>
                      <input 
                        type="password" 
                        placeholder={language === 'en' ? "Leave blank to keep current" : "वर्तमान रखने के लिए खाली छोड़ें"}
                        value={account.confirm_password}
                        onChange={(e) => setAccount(prev => ({ ...prev, confirm_password: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-color)",
                          fontSize: "13.5px",
                          color: "var(--text-primary)",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {accountSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#dcfce7", color: "#15803d", padding: "10px 14px", borderRadius: "8px", fontSize: "12.5px", fontWeight: "600" }}>
                    <CheckCircle size={14} />
                    {accountSuccess}
                  </div>
                )}

                {accountError && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "12.5px", fontWeight: "600" }}>
                    <AlertCircle size={14} />
                    {accountError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={savingAccount}
                  style={{
                    background: "#0284c7",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    alignSelf: "flex-end",
                    width: "180px",
                    marginTop: "8px"
                  }}
                >
                  <Save size={14} />
                  {savingAccount 
                    ? (language === 'en' ? "Saving details..." : "विवरण सहेजा जा रहा है...") 
                    : (language === 'en' ? "Save Account Info" : "खाता जानकारी सहेजें")
                  }
                </button>

              </form>
            </div>
             <div className="contrast-card" style={{
              background: "var(--card-bg)",
              borderRadius: "24px",
              padding: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  {language === 'en' ? "Member Since" : "सदस्यता की शुरुआत"}
                </span>
                <strong style={{ fontSize: "16px", color: "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={14} color="var(--text-secondary)" />
                  {formatDate(account.created_at)}
                </strong>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderLeft: "1px solid var(--border-color)", paddingLeft: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  {language === 'en' ? "Logged Searches" : "लॉग की गई खोजें"}
                </span>
                <strong style={{ fontSize: "18px", color: "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Activity size={14} color="#0284c7" />
                  {language === 'en' ? `${routesCount} routes` : `${routesCount} मार्ग`}
                </strong>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderLeft: "1px solid var(--border-color)", paddingLeft: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  {language === 'en' ? "Safety Limit" : "सुरक्षा सीमा"}
                </span>
                <strong style={{ fontSize: "18px", color: "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Heart size={14} color="#047857" />
                  AQI {healthProfile.aqi_threshold}
                </strong>
              </div>
            </div>

            {/* System Preferences Card */}
            <div className="contrast-card" style={{
              background: "var(--card-bg)",
              borderRadius: "24px",
              padding: "24px",
              marginTop: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ background: "#f3e8ff", padding: "8px", borderRadius: "10px", color: "#a855f7" }}>
                  <Settings size={20} />
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>
                  {language === 'en' ? "System Preferences" : "प्रणाली प्राथमिकताएं"}
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Language selection dropdown */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "6px" }}>
                    {language === 'en' ? "Language Preference" : "भाषा वरीयता"}
                  </label>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    border: "1px solid var(--border-color)", 
                    borderRadius: "10px", 
                    padding: "8px 12px", 
                    background: "var(--card-bg)",
                    width: "100%",
                    boxSizing: "border-box"
                  }}>
                    <select 
                      value={language}
                      onChange={(e) => setAppLanguage(e.target.value)}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        fontSize: "13.5px",
                        color: "var(--text-primary)",
                        background: "transparent",
                        cursor: "pointer"
                      }}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                </div>

                {/* Theme Selector */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "6px" }}>
                    {language === 'en' ? "Display Theme" : "प्रदर्शित थीम"}
                  </label>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    border: "1px solid var(--border-color)", 
                    borderRadius: "10px", 
                    padding: "8px 12px", 
                    background: "var(--card-bg)",
                    width: "100%",
                    boxSizing: "border-box"
                  }}>
                    <select 
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        fontSize: "13.5px",
                        color: "var(--text-primary)",
                        background: "transparent",
                        cursor: "pointer"
                      }}
                    >
                      <option value="light">{language === 'en' ? "Light Mode" : "लाइट मोड"}</option>
                      <option value="dark">{language === 'en' ? "Dark Mode" : "डार्क मोड"}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Health Sensitivity Configuration */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            <div className="contrast-card" style={{
              background: "var(--card-bg)",
              borderRadius: "24px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              height: "100%"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{ background: "#dcfce7", padding: "8px", borderRadius: "10px", color: "#047857" }}>
                  <Heart size={20} />
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>
                  {language === 'en' ? "Health profile sensitivity" : "स्वास्थ्य प्रोफ़ाइल संवेदनशीलता"}
                </h3>
              </div>

              <form onSubmit={handleHealthSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", flexGrow: 1 }}>
                
                {/* Sensitivity Selection */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "6px" }}>
                    {language === 'en' ? "Sensitivity Preset Profile" : "संवेदनशीलता प्रीसेट प्रोफ़ाइल"}
                  </label>
                  <select 
                    value={healthProfile.sensitivity}
                    onChange={(e) => {
                      const sens = e.target.value;
                      setHealthProfile(prev => ({
                        ...prev,
                        sensitivity: sens,
                        aqi_threshold: sensitivityPresets[sens].threshold
                      }));
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      fontSize: "13.5px",
                      color: "var(--text-primary)",
                      background: "var(--card-bg)",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="general">{language === 'en' ? "General Public (AQI 150)" : "सामान्य जनता (AQI 150)"}</option>
                    <option value="child">{language === 'en' ? "Children Profile (AQI 100)" : "बच्चों की प्रोफ़ाइल (AQI 100)"}</option>
                    <option value="elderly">{language === 'en' ? "Elderly Citizen Profile (AQI 100)" : "वरिष्ठ नागरिकों की प्रोफ़ाइल (AQI 100)"}</option>
                    <option value="asthmatic">{language === 'en' ? "Asthmatic Patients Profile (AQI 80)" : "अस्थमा रोगियों की प्रोफ़ाइल (AQI 80)"}</option>
                    <option value="cardio">{language === 'en' ? "Cardio-Vascular Profile (AQI 80)" : "हृदय रोगियों की प्रोफ़ाइल (AQI 80)"}</option>
                  </select>
                  
                  <span style={{ display: "block", fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "8px", lineHeight: "1.4" }}>
                    * {sensitivityPresets[healthProfile.sensitivity].desc}
                  </span>
                </div>

                {/* AQI Slider Threshold */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                      {language === 'en' ? "Custom AQI Safety Threshold" : "कस्टम AQI सुरक्षा सीमा"}
                    </label>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#047857" }}>
                      AQI {healthProfile.aqi_threshold}
                    </span>
                  </div>
                  
                  <input 
                    type="range"
                    min="30"
                    max="300"
                    step="5"
                    value={healthProfile.aqi_threshold}
                    onChange={(e) => setHealthProfile(prev => ({ ...prev, aqi_threshold: parseInt(e.target.value) || 150 }))}
                    style={{
                      width: "100%",
                      margin: "8px 0"
                    }}
                  />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8", fontWeight: "700" }}>
                    <span>{language === 'en' ? "30 (Very Sensitive)" : "30 (अत्यधिक संवेदनशील)"}</span>
                    <span>{language === 'en' ? "150 (Moderate)" : "150 (मध्यम)"}</span>
                    <span>{language === 'en' ? "300 (High Exposure)" : "300 (उच्च जोखिम)"}</span>
                  </div>
                </div>

                {/* System Notifications Enable */}
                <div style={{ 
                  background: "var(--bg-color)", 
                  border: "1px solid var(--border-color)", 
                  borderRadius: "14px", 
                  padding: "16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginTop: "8px"
                }}>
                  <input 
                    type="checkbox"
                    id="alerts_checked_prof"
                    checked={healthProfile.alerts_enabled}
                    onChange={(e) => setHealthProfile(prev => ({ ...prev, alerts_enabled: e.target.checked }))}
                    style={{ marginTop: "4px" }}
                  />
                  <div>
                    <label htmlFor="alerts_checked_prof" style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "var(--text-primary)", cursor: "pointer" }}>
                      {language === 'en' ? "Enable notification alerts" : "अधिसूचना अलर्ट सक्षम करें"}
                    </label>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginTop: "3px", lineHeight: "1.4" }}>
                      {language === 'en' 
                        ? "Triggers web browser notifications dynamically when forecasting values exceed your personalized threshold levels." 
                        : "पूर्वानुमान मान आपकी व्यक्तिगत सीमा स्तरों से अधिक होने पर डाइनैमिक रूप से वेब ब्राउज़र सूचनाओं को सक्रिय करता है।"
                      }
                    </span>
                  </div>
                </div>

                {/* Status messages */}
                {healthSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#dcfce7", color: "#15803d", padding: "10px 14px", borderRadius: "8px", fontSize: "12.5px", fontWeight: "600", marginTop: "auto" }}>
                    <CheckCircle size={14} />
                    {healthSuccess}
                  </div>
                )}

                {healthError && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "12.5px", fontWeight: "600", marginTop: "auto" }}>
                    <AlertCircle size={14} />
                    {healthError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={savingHealth}
                  style={{
                    background: "#047857",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    alignSelf: "flex-end",
                    width: "180px",
                    marginTop: healthSuccess || healthError ? "8px" : "auto"
                  }}
                >
                  <Save size={14} />
                  {savingHealth 
                    ? (language === 'en' ? "Saving preferences..." : "वरीयताएँ सहेजी जा रही हैं...") 
                    : (language === 'en' ? "Save Preferences" : "पसंदीदा सहेजें")
                  }
                </button>
              </form>
            </div>
          </div>

        </div>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="home-footer" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "24px 4%",
        boxSizing: "border-box",
        borderTop: "1px solid #e2e8f0",
        background: "#ffffff",
        fontSize: "13px",
        width: "100%",
        marginTop: "auto"
      }}>
        <div style={{ color: "#475569", fontSize: "13px", fontWeight: "800" }}>
          {t('homeFootSubtitle')}
        </div>
        <div style={{ display: "flex", gap: "16px", color: "#0284c7", fontSize: "11px", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase", alignItems: "center" }}>
          <span>USER ACCOUNT MANAGEMENT • PERSONALIZED SETTINGS • ALERTS PREFERENCES</span>
        </div>
      </footer>
    </div>
  );
}
