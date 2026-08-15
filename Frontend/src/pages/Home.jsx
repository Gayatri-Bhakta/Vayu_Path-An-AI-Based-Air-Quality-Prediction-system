import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wind, LogOut, ArrowRight, Activity, Navigation, Bell, Sparkles } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="home-page">
      {/* Background Animated Ambient Lights */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <div className="ambient-blob blob-3"></div>

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <Link to="/home" className="brand">
          <span className="brand-mark">
            <Wind size={20} color="#ffffff" />
          </span>
          <span className="brand-title">Air Quality Prediction</span>
        </Link>

        <div className="nav-links">
          <Link to="/home" className="nav-item active">Home</Link>
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/routes" className="nav-item">Routes</Link>
          <Link to="/alerts" className="nav-item">Alerts</Link>
          <Link to="/profile" className="nav-item">Profile</Link>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={14} />
            Logout ({user?.first_name || "User"})
          </button>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>AI-POWERED AIR QUALITY INTELLIGENCE</span>
            </div>

            <h1 className="hero-headline">
              <span className="text-gradient-emerald">Breathe better.</span>
              <br />
              <span className="text-gradient-blue">Move smarter.</span>
            </h1>

            <p className="hero-description">
              Welcome back{user?.first_name ? `, ${user.first_name}` : ""}. Understand air pollution before it affects your day. Access intelligent LSTM forecasts, personalized alerts, and pollution-aware routes.
            </p>

            <div className="hero-buttons">
              <Link to="/dashboard" className="primary-button group">
                <span>Explore Dashboard</span>
                <ArrowRight size={16} className="btn-arrow" />
              </Link>

              <Link to="/routes" className="secondary-button">
                Find a Safer Route
              </Link>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <strong>AI</strong>
                <span>Powered</span>
              </div>
              <div className="trust-divider"></div>
              <div className="trust-item">
                <strong>24h</strong>
                <span>Forecasting</span>
              </div>
              <div className="trust-divider"></div>
              <div className="trust-item">
                <strong>CPCB</strong>
                <span>Live Data</span>
              </div>
            </div>
          </div>

          <div className="hero-image-wrapper">
            <div className="hero-card-glow"></div>
            <div className="hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1669089511653-3af3565f6877?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDd8fHxlbnwwfHx8fHw%3D"
                alt="Delhi Air Quality Visual"
                className="hero-img"
              />
              <div className="image-overlay"></div>

              <div className="image-label">
                <span className="live-pulse"></span>
                <span>AIR QUALITY INTELLIGENCE</span>
              </div>

              {/* Floating Cards with CSS Animation */}
              <div className="floating-info-card forecast-card float-anim-1">
                <div className="floating-icon forecast-icon">↗</div>
                <div>
                  <span className="float-tag">AI FORECAST</span>
                  <strong className="float-val">Next 24 hours</strong>
                </div>
              </div>

              <div className="floating-info-card alert-card float-anim-2">
                <div className="floating-icon alert-icon">!</div>
                <div>
                  <span className="float-tag">SMART ALERTS</span>
                  <strong className="float-val">Personalized</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4-FEATURE GRID ================= */}
        <section className="features-section">
          <div className="feature-grid">
            <div className="feature-card feature-green">
              <div className="feature-top">
                <div className="feature-icon"><Activity size={22} /></div>
                <span className="feature-number">01</span>
              </div>
              <h3>Live AQI Monitoring</h3>
              <p>Observe live station readings across Delhi with real-time pollutant index calculation.</p>
              <Link to="/dashboard" className="feature-link">Explore monitoring <span>→</span></Link>
            </div>

            <div className="feature-card feature-blue">
              <div className="feature-top">
                <div className="feature-icon"><Wind size={22} /></div>
                <span className="feature-number">02</span>
              </div>
              <h3>LSTM Forecasting</h3>
              <p>Predict upcoming air conditions at +1h, +6h, +12h, and +24h time horizons using deep learning.</p>
              <Link to="/dashboard" className="feature-link">View forecasts <span>→</span></Link>
            </div>

            <div className="feature-card feature-orange">
              <div className="feature-top">
                <div className="feature-icon"><Bell size={22} /></div>
                <span className="feature-number">03</span>
              </div>
              <h3>Personalized Alerts</h3>
              <p>Receive proactive notifications calibrated to your specific health sensitivity profile.</p>
              <Link to="/alerts" className="feature-link">Manage alerts <span>→</span></Link>
            </div>

            <div className="feature-card feature-purple">
              <div className="feature-top">
                <div className="feature-icon"><Navigation size={22} /></div>
                <span className="feature-number">04</span>
              </div>
              <h3>OSRM Route Scoring</h3>
              <p>Compare driving paths scored by interpolated pollution exposure to select the safest commute.</p>
              <Link to="/routes" className="feature-link">Find safer routes <span>→</span></Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="home-footer">
        <div className="footer-brand">
          <span className="brand-mark">
            <Wind size={16} color="#ffffff" />
          </span>
          <div>
            <strong>Air Quality Prediction</strong>
            <p>AI-based air quality intelligence & route optimization system.</p>
          </div>
        </div>
        <div className="footer-tech">
          React 19 • FastAPI • TensorFlow LSTM
        </div>
      </footer>
    </div>
  );
}

export default Home;