import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { 
  Bell, AlertTriangle, ShieldCheck, Check, Trash2, ShieldAlert,
  Play, CheckCircle2, Info, BellOff, Clock, Wind
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function AlertsPage() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  
  // Stations & Selected for Scan
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  
  // Alerts Feed
  const [alerts, setAlerts] = useState([]);
  
  // Notification API Permission
  const [notifPermission, setNotifPermission] = useState("default");
  
  // States
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Selected Station Details and Forecast
  const [stationDetail, setStationDetail] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    
    // Check Notification API support
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }

    // 1. Fetch dashboard stations to populate scan dropdown
    fetch("http://localhost:8000/api/dashboard/stations")
      .then(res => res.json())
      .then(data => {
        if (data.stations && data.stations.length > 0) {
          setStations(data.stations);
          setSelectedStation(data.stations[0].name);
        }
      })
      .catch(err => console.error("Error loading stations for scan:", err));

    // 2. Fetch historical alerts feed
    fetchAlertsFeed();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      setForecastLoading(true);
      fetch(`http://localhost:8000/api/dashboard/forecast?station=${encodeURIComponent(selectedStation)}`)
        .then(res => res.json())
        .then(data => {
          setStationDetail(data);
          setForecastLoading(false);
        })
        .catch(err => {
          console.error("Error loading station details:", err);
          setForecastLoading(false);
        });
    }
  }, [selectedStation]);

  const fetchAlertsFeed = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setLoading(true);
    fetch("http://localhost:8000/api/alerts", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          navigate("/login");
          throw new Error("Session expired. Please log in again.");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setAlerts(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading alerts feed:", err);
        setLoading(false);
      });
  };

  const requestPermission = () => {
    if (!("Notification" in window)) {
      setErrorMsg(language === 'en' ? "This browser does not support desktop notifications." : "यह ब्राउज़र डेस्कटॉप सूचनाओं का समर्थन नहीं करता है।");
      return;
    }

    Notification.requestPermission().then(permission => {
      setNotifPermission(permission);
      if (permission === "granted") {
        setSuccessMsg(language === 'en' ? "Browser notifications enabled successfully!" : "ब्राउज़र सूचनाएं सफलतापूर्वक सक्षम की गईं!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(language === 'en' ? "Browser notifications permission denied." : "ब्राउज़र सूचनाएं अनुमति अस्वीकार कर दी गई।");
      }
    });
  };

  const handleManualScan = (e) => {
    e.preventDefault();
    if (!selectedStation) return;

    setScanning(true);
    setSuccessMsg("");
    setErrorMsg("");

    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/alerts/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ station_name: selectedStation })
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          navigate("/login");
          throw new Error("Session expired. Please log in again.");
        }
        return res.json();
      })
      .then(data => {
        setScanning(false);
        if (data.detail) {
          setErrorMsg(data.detail);
        } else if (Array.isArray(data)) {
          if (data.length > 0) {
            setSuccessMsg(language === 'en' 
              ? `Scan finished! Triggered ${data.length} new forecast alerts.` 
              : `स्कैन समाप्त! ${data.length} नए पूर्वानुमान अलर्ट सक्रिय हुए।`
            );
            
            // Trigger local browser push alerts for each new breach
            if (Notification.permission === "granted") {
              data.forEach(alert => {
                new Notification(language === 'en' ? "Air Quality Alert" : "वायु गुणवत्ता चेतावनी", {
                  body: alert.message,
                  icon: "/favicon.svg"
                });
              });
            }
            
            // Reload feed log
            fetchAlertsFeed();
          } else {
            setSuccessMsg(language === 'en' 
              ? "Scan finished! No forecast breaches detected for this station. Safe to travel." 
              : "स्कैन समाप्त! इस स्टेशन के लिए कोई पूर्वानुमान उल्लंघन नहीं मिला। यात्रा करना सुरक्षित है।"
            );
            setTimeout(() => setSuccessMsg(""), 5000);
          }
        }
      })
      .catch(err => {
        setScanning(false);
        setErrorMsg(language === 'en' ? "Failed to run forecast threshold check scan." : "पूर्वानुमान सीमा जांच स्कैन चलाने में विफल।");
      });
  };

  const handleMarkAsRead = (alertId) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`http://localhost:8000/api/alerts/${alertId}/read`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.detail) {
          setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
        }
      })
      .catch(err => console.error("Error marking alert read:", err));
  };

  const handleClearHistory = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    if (!window.confirm(language === 'en' ? "Are you sure you want to clear your alerts history feed?" : "क्या आप वाकई अपना अलर्ट इतिहास साफ़ करना चाहते हैं?")) return;

    fetch("http://localhost:8000/api/alerts/clear", {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(() => {
        setAlerts([]);
      })
      .catch(err => console.error("Error clearing alert log:", err));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === 'en' ? "en-US" : "hi-IN", { 
        month: "short", 
        day: "numeric", 
        hour: "numeric", 
        minute: "2-digit" 
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getAqiStatus = (aqi) => {
    if (aqi <= 50) return { label: language === 'en' ? "Good" : "अच्छा", color: "#15803d", bg: "#dcfce7" };
    if (aqi <= 100) return { label: language === 'en' ? "Satisfactory" : "संतोषजनक", color: "#16a34a", bg: "#f0fdf4" };
    if (aqi <= 200) return { label: language === 'en' ? "Moderate" : "मध्यम", color: "#d97706", bg: "#fef3c7" };
    if (aqi <= 300) return { label: language === 'en' ? "Poor" : "खराब", color: "#ea580c", bg: "#ffedd5" };
    if (aqi <= 400) return { label: language === 'en' ? "Very Poor" : "बहुत खराब", color: "#dc2626", bg: "#fee2e2" };
    return { label: language === 'en' ? "Severe" : "गंभीर", color: "#991b1b", bg: "#fde8e8" };
  };

  return (
    <div className="home-page" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Background Ambience */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <Navbar activePage="Alerts" />

      <main style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "30px 2rem 60px 2rem", boxSizing: "border-box", position: "relative", zIndex: 10 }}>
        
        {/* Header Summary */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#0f172a", margin: "0" }}>
            {language === 'en' ? "Personalized Alerts Feed" : "व्यक्तिगत अलर्ट फ़ीड"}
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px", marginBottom: "0" }}>
            {language === 'en' 
              ? "Monitor forecast thresholds dynamically. Get browser alert notifications whenever neural LSTM models predict AQI breaching your threshold." 
              : "डाइनैमिक रूप से पूर्वानुमान सीमाओं की निगरानी करें। जब भी तंत्रिका एलएसटीएम मॉडल आपके थ्रेसहोल्ड को तोड़ने वाले एक्यूआई की भविष्यवाणी करते हैं, तो ब्राउज़र अलर्ट सूचनाएं प्राप्त करें।"
            }
          </p>
        </div>

        {/* Browser Notification Permission Banner */}
        {notifPermission !== "granted" && (
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "16px",
            padding: "16px 20px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <BellOff size={20} color="#d97706" />
              <div>
                <strong style={{ fontSize: "14px", color: "#92400e", display: "block" }}>
                  {language === 'en' ? "Push notifications are disabled" : "पुश सूचनाएं अक्षम हैं"}
                </strong>
                <span style={{ fontSize: "12px", color: "#b45309" }}>
                  {language === 'en' 
                    ? "Enable browser notification permissions to receive real-time alert popups when forecasts exceed your safety threshold." 
                    : "पूर्वानुमान आपकी सुरक्षा सीमा से अधिक होने पर वास्तविक समय के अलर्ट पॉपअप प्राप्त करने के लिए ब्राउज़र अधिसूचना अनुमतियों को सक्षम करें।"
                  }
                </span>
              </div>
            </div>
            <button
              onClick={requestPermission}
              style={{
                background: "#d97706",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#b45309"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#d97706"}
            >
              {language === 'en' ? "Enable Notifications" : "अधिसूचनाएं सक्षम करें"}
            </button>
          </div>
        )}

        {/* Dashboard Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "28px" }}>
          
          {/* Left Column: Manual Scanner Widget */}
          <div>
            <div className="contrast-card" style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "32px 28px",
              height: "580px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 16px 0", color: "#0f172a" }}>
                {language === 'en' ? "Scan monitoring station" : "निगरानी केंद्र स्कैन करें"}
              </h3>
              <p style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.4", margin: "0 0 16px 0" }}>
                {language === 'en' 
                  ? "Select a specific Delhi monitoring station and check its 24-hour predicted LSTM forecast against your current health safety limits." 
                  : "एक विशिष्ट दिल्ली निगरानी स्टेशन का चयन करें और अपनी वर्तमान स्वास्थ्य सुरक्षा सीमाओं के खिलाफ इसके 24 घंटे के अनुमानित एलएसटीएम पूर्वानुमान की जांच करें।"
                }
              </p>

              <form onSubmit={handleManualScan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                    {language === 'en' ? "Select Station" : "स्टेशन चुनें"}
                  </label>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    border: "1px solid var(--border-color)", 
                    borderRadius: "10px", 
                    padding: "8px 12px", 
                    background: "var(--input-bg)" 
                  }}>
                    <select 
                      value={selectedStation}
                      onChange={(e) => setSelectedStation(e.target.value)}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        fontSize: "13.5px",
                        color: "#0f172a",
                        background: "transparent",
                        cursor: "pointer"
                      }}
                    >
                      {stations.map(st => (
                        <option key={st.id} value={st.name}>{st.shortName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={scanning || !selectedStation}
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
                    marginTop: "6px"
                  }}
                >
                  <Play size={13} fill="#ffffff" />
                  {scanning 
                    ? (language === 'en' ? "Scanning forecasts..." : "पूर्वानुमान स्कैन किए जा रहे हैं...") 
                    : (language === 'en' ? "Scan Forecast for Risks" : "जोखिमों के लिए पूर्वानुमान स्कैन करें")
                  }
                </button>
              </form>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>

              {successMsg && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "#dcfce7", color: "#15803d", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", marginTop: "16px", lineHeight: "1.4" }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "#fee2e2", color: "#b91c1c", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", marginTop: "16px", lineHeight: "1.4" }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Station Detail Live Card */}
              {stationDetail && stationDetail.station ? (
                <div style={{
                  padding: "20px 18px",
                  borderRadius: "18px",
                  background: "rgba(2, 132, 199, 0.04)",
                  border: "1px solid rgba(2, 132, 199, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  boxSizing: "border-box"
                }}>
                  {/* Header: Name and Live dot */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "210px" }}>
                      {stationDetail.station.shortName}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="live-pulse-green" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)", animation: "pulseDotGreen 2s infinite" }}></span>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {language === 'en' ? "Live" : "लाइव"}
                      </span>
                    </div>
                  </div>

                  {/* Main Grid: AQI vs Peak */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderBottom: "1px solid rgba(2, 132, 199, 0.08)", paddingBottom: "12px" }}>
                    {/* Left: Real-time AQI */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                        {language === 'en' ? "Real-Time AQI" : "वास्तविक समय AQI"}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>
                          {stationDetail.station.aqi}
                        </span>
                        <span style={{ 
                          fontSize: "9px", 
                          fontWeight: "800", 
                          padding: "2px 6px", 
                          borderRadius: "4px",
                          color: getAqiStatus(stationDetail.station.aqi).color,
                          background: getAqiStatus(stationDetail.station.aqi).bg
                        }}>
                          {getAqiStatus(stationDetail.station.aqi).label}
                        </span>
                      </div>
                    </div>

                    {/* Right: Predicted Peak */}
                    <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(2, 132, 199, 0.08)", paddingLeft: "12px" }}>
                      <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                        {language === 'en' ? "24h Peak AQI" : "24h शिखर AQI"}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>
                          {stationDetail.forecast && stationDetail.forecast.length > 0 
                            ? Math.max(...stationDetail.forecast.map(f => f.aqi)) 
                            : stationDetail.station.aqi + 15
                          }
                        </span>
                        <span style={{ fontSize: "9px", fontWeight: "800", color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                          {language === 'en' ? "Forecast" : "पूर्वानुमान"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detail Info: Primary Pollutant and Status */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11.5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Wind size={12} color="#64748b" />
                      <span style={{ color: "#64748b", fontWeight: "600" }}>{language === 'en' ? "Primary Pollutant" : "मुख्य प्रदूषक"}:</span>
                      <span style={{ color: "#0f172a", fontWeight: "800" }}>
                        {stationDetail.station.pm25 > stationDetail.station.pm10 ? "PM2.5" : "PM10"}
                      </span>
                      <span style={{ color: "#64748b", fontSize: "10.5px", fontWeight: "700" }}>
                        ({stationDetail.station.pm25 > stationDetail.station.pm10 ? stationDetail.station.pm25 : stationDetail.station.pm10} µg/m³)
                      </span>
                    </div>
                    
                    <div style={{ color: "#0284c7", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", marginTop: "2px" }}>
                      <Clock size={11} />
                      <span>{language === 'en' ? "LSTM Model: Synced 5m ago" : "LSTM मॉडल: 5 मिनट पहले सिंक किया गया"}</span>
                    </div>
                  </div>
                </div>
              ) : forecastLoading ? (
                <div style={{ 
                  height: "185px", 
                  border: "1px dashed rgba(2, 132, 199, 0.2)", 
                  borderRadius: "18px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "#64748b",
                  fontSize: "12.5px"
                }}>
                  {language === 'en' ? "Loading station live metrics..." : "स्टेशन लाइव मेट्रिक्स लोड हो रहे हैं..."}
                </div>
              ) : null}
              </div>

            </div>
          </div>

          {/* Right Column: Historical Notifications Feed Log */}
          <div className="contrast-card" style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "28px",
            height: "580px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Feed Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "18px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={18} color="#0f172a" />
                <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#0f172a" }}>
                  {language === 'en' ? "Notifications Log" : "अधिसूचना लॉग"} ({alerts.filter(a => !a.is_read).length} {language === 'en' ? "unread" : "अपठित"})
                </h3>
              </div>

              {alerts.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
                >
                  <Trash2 size={13} />
                  {language === 'en' ? "Clear history feed" : "इतिहास साफ़ करें"}
                </button>
              )}
            </div>

            {/* Loading / Content Feed */}
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden", height: "450px" }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9", background: "#ffffff", display: "flex", gap: "14px", alignItems: "center" }}>
                    <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }}></div>
                    <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div className="skeleton" style={{ width: "85%", height: "14px", borderRadius: "4px" }}></div>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div className="skeleton" style={{ width: "120px", height: "10px", borderRadius: "3px" }}></div>
                        <div className="skeleton" style={{ width: "80px", height: "10px", borderRadius: "3px" }}></div>
                      </div>
                    </div>
                    <div className="skeleton" style={{ width: "70px", height: "30px", borderRadius: "6px", flexShrink: 0 }}></div>
                  </div>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              /* Empty State */
              <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px" }}>
                <span style={{ background: "#dcfce7", color: "#15803d", padding: "16px", borderRadius: "100px", marginBottom: "16px" }}>
                  <ShieldCheck size={40} />
                </span>
                <strong style={{ fontSize: "16px", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                  {language === 'en' ? "All clear! No pollution risks" : "सब साफ़ है! कोई प्रदूषण जोखिम नहीं"}
                </strong>
                <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "340px", margin: 0, lineHeight: "1.4" }}>
                  {language === 'en' 
                    ? "No forecast threshold breaches have been detected. Your local Delhi air remains safe within your custom profile parameters." 
                    : "कोई पूर्वानुमान सीमा उल्लंघन का पता नहीं चला है। आपकी स्थानीय दिल्ली की हवा आपकी कस्टम प्रोफ़ाइल मापदंडों के भीतर सुरक्षित है।"
                  }
                </p>
              </div>
            ) : (
              /* Alerts List */
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", height: "450px" }}>
                {alerts.map((alert) => {
                  const isCritical = alert.triggered_aqi >= 300;
                  
                  return (
                    <div
                      key={alert.id}
                      className={`alert-item-card ${alert.is_read ? 'read' : (isCritical ? 'critical' : 'warning')}`}
                      style={{
                        padding: "16px",
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                        background: alert.is_read ? "#ffffff" : (isCritical ? "#fff5f5" : "#fffbeb"),
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                        opacity: alert.is_read ? 0.6 : 1,
                        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.05)";
                        e.currentTarget.style.borderColor = isCritical ? "#fca5a5" : "#cbd5e1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.01)";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }}
                    >
                      {/* Severity Icon */}
                      <span style={{ 
                        background: isCritical ? "#fee2e2" : "#fef3c7", 
                        color: isCritical ? "#ef4444" : "#d97706",
                        padding: "8px",
                        borderRadius: "10px",
                        flexShrink: 0
                      }}>
                        {isCritical ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                      </span>

                      {/* Content details */}
                      <div style={{ flexGrow: 1 }}>
                        <span style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0f172a", lineHeight: "1.4" }}>
                          {alert.message}
                        </span>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                          <span style={{ fontSize: "11px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={11} />
                            {language === 'en' ? "Triggered" : "सक्रिय हुआ"} {formatDate(alert.created_at)}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>•</span>
                          <span style={{ fontSize: "10px", fontWeight: "900", background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
                            {language === 'en' ? "Limit" : "सीमा"}: AQI {alert.threshold_aqi}
                          </span>
                        </div>
                      </div>

                      {/* Read Action Button */}
                      {!alert.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          style={{
                            background: "#e2e8f0",
                            border: "none",
                            borderRadius: "10px",
                            padding: "6px 12px",
                            fontSize: "11.5px",
                            fontWeight: "800",
                            color: "#475569",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            flexShrink: 0,
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#cbd5e1"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#e2e8f0"}
                        >
                          <Check size={11} />
                          {language === 'en' ? "Read" : "पढ़ा"}
                        </button>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
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
          <span>ALERT SYSTEM • FORECAST BREACH SCANNING • WEB PUSH NOTIFICATIONS</span>
        </div>
      </footer>
    </div>
  );
}
