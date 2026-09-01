import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wind, LogOut, ArrowRight, Activity, Navigation, Bell, Sparkles } from "lucide-react";
import ForecastChart from "../components/ForecastChart";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const getBand = (aqi) => {
  if (aqi <= 100) return { label: "Satisfactory", bg: "#dcfce7", color: "#15803d" };
  if (aqi <= 200) return { label: "Moderate", bg: "#ffedd5", color: "#c2410c" };
  if (aqi <= 300) return { label: "Poor", bg: "#fee2e2", color: "#991b1b" };
  return { label: "Severe", bg: "#fca5a5", color: "#7f1d1d" };
};

const getTranslatedLabel = (label, lang) => {
  if (lang === 'hi') {
    if (label === "Satisfactory") return "संतोषजनक";
    if (label === "Moderate") return "मध्यम";
    if (label === "Poor") return "खराब";
    if (label === "Severe") return "गंभीर";
  }
  return label;
};

const defaultForecast = [
  { horizon: "+1h", time: "Now", aqi: 312 },
  { horizon: "+6h", time: "12 PM", aqi: 328 },
  { horizon: "+12h", time: "4 PM", aqi: 301 },
  { horizon: "+18h", time: "8 PM", aqi: 276 },
  { horizon: "+24h", time: "12 AM", aqi: 245 },
  { horizon: "+30h", time: "4 AM", aqi: 212 }
];

function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [stationData, setStationData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/dashboard/stations")
      .then((res) => res.json())
      .then((data) => {
        if (data.stations && data.stations.length > 0) {
          const primary = data.stations[0]; // Fetch the first live CPCB station
          setStationData(primary);
          return fetch(`http://localhost:8000/api/dashboard/forecast?station=${encodeURIComponent(primary.name)}`);
        }
      })
      .then((res) => res ? res.json() : null)
      .then((data) => {
        if (data) {
          setForecast(data.forecast);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading live home data:", err);
        setLoading(false);
      });
  }, []);

  const currentBand = stationData ? getBand(stationData.aqi) : { label: "Poor", bg: "#fee2e2", color: "#991b1b" };

  return (
    <div className="home-page" style={{ background: "#faf9f6" }}>
      {/* ================= NAVBAR ================= */}
      <Navbar activePage="Home" />

      {/* ================= HERO SECTION ================= */}
      <main className="hero-section-new">


        {/* Content Row: Text + Badges pushed to the right */}
        <div className="hero-main-layout">
          <div className="hero-content-right">
            <div className="hero-badge" style={{ background: "#e2fbe8", color: "#15803d", borderColor: "#86efac" }}>
              <Sparkles size={14} className="badge-sparkle" />
              <span>{t('homeHeroBadge')}</span>
            </div>

            <h1 className="hero-headline" style={{ fontSize: "64px", lineHeight: "1.1", marginBottom: "20px" }}>
              {t('homeHeroTitle1')}<br />
              <span style={{ color: "#0284c7" }}>{t('homeHeroTitle2')}</span>
            </h1>

            <p className="hero-description" style={{ fontSize: "16px", color: "#475569", marginBottom: "24px" }}>
              {t('homeWelcome')}{user?.first_name ? `, ${user.first_name}` : ""}. {t('homeOverviewDesc')}
            </p>

            <div className="hero-buttons" style={{ marginBottom: "36px" }}>
              <Link to="/dashboard" className="primary-button" style={{ padding: "14px 28px", borderRadius: "12px", background: "#047857", textDecoration: "none" }}>
                {t('homeExploreBtn')} <ArrowRight size={16} style={{ marginLeft: "8px" }} />
              </Link>

              <Link to="/routes" className="secondary-button" style={{ padding: "14px 28px", borderRadius: "12px", background: "#ffffff", border: "1px solid #cbd5e1", textDecoration: "none" }}>
                {t('homeSaferRouteBtn')}
              </Link>
            </div>


            {/* Live Data Overlay at Bottom - Unified Mockup Container */}
            <div className="hero-bottom-data-card contrast-card" style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "24px 28px",
              boxShadow: "0 10px 40px rgba(15, 23, 42, 0.05)",
              border: "1.5px solid #cbd5e1",
              display: "grid",
              gridTemplateColumns: "1fr 1.6fr",
              gap: "28px",
              width: "100%",
              marginTop: "28px",
              boxSizing: "border-box"
            }}>
              {/* Left Side: Live CPCB Data */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "900", color: "#475569", letterSpacing: "1px", textTransform: "uppercase" }}>
                      {stationData?.shortName || "DELHI"}
                    </span>
                    <span style={{ 
                      color: "#ef4444", 
                      fontSize: "11px", 
                      fontWeight: "900", 
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "6px" 
                    }}>
                      <span className="live-pulse-red"></span>
                      {t('homeLive')}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: "13px", color: "#475569", marginTop: "18px", fontWeight: "600" }}>
                    {t('homeCurrentAqi')}
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
                    <span style={{ fontSize: "2.6rem", fontWeight: "800", color: "#0f172a", lineHeight: "1" }}>
                      {stationData?.aqi || 312}
                    </span>
                    <span style={{ 
                      fontSize: "11px", 
                      fontWeight: "800", 
                      padding: "4px 12px", 
                      borderRadius: "100px", 
                      background: currentBand.bg, 
                      color: currentBand.color 
                    }}>
                      {getTranslatedLabel(currentBand.label, language)}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  fontSize: "11px", 
                  color: "#64748b", 
                  borderTop: "1px solid #f1f5f9", 
                  paddingTop: "14px", 
                  marginTop: "16px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.2px"
                }}>
                  PM2.5: <strong style={{ color: "#334155" }}>{stationData?.pm25 || 180}</strong> <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: "normal" }}>µg/m³</span>
                  <span style={{ color: "#cbd5e1", margin: "0 6px" }}>|</span>
                  PM10: <strong style={{ color: "#334155" }}>{stationData?.pm10 || 312}</strong> <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: "normal" }}>µg/m³</span>
                  <span style={{ color: "#cbd5e1", margin: "0 6px" }}>|</span>
                  NO₂: <strong style={{ color: "#334155" }}>42</strong> <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: "normal" }}>ppb</span>
                </div>
              </div>

              {/* Right Side: 24-Hour Forecast Chart */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: "900", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px", display: "block" }}>
                  {t('homeForecastChartHeader')}
                </span>
                <div style={{ height: "185px", display: "flex", alignItems: "flex-end" }}>
                  <ForecastChart forecastData={forecast.length > 0 ? forecast : defaultForecast} />
                </div>
              </div>
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
        borderTop: "1px solid rgba(226, 232, 240, 0.8)",
        background: "rgba(250, 249, 246, 0.45)",
        backdropFilter: "blur(14px)",
        fontSize: "13px",
        width: "100%"
      }}>
        <div style={{ color: "#475569", fontSize: "13px", fontWeight: "800" }}>
          {t('homeFootSubtitle')}
        </div>
        <div style={{ display: "flex", gap: "16px", color: "#475569", fontSize: "13px", fontWeight: "600", alignItems: "center" }}>
          <span>{t('homeFootStack')}</span>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <span>{t('homeFootCopy')}</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;