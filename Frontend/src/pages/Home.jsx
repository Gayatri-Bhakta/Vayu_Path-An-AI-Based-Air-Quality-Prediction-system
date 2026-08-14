import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="home-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar">

        <Link to="/" className="brand">
          <span className="brand-mark">
            AQ
          </span>

          <span>
            Air Quality Prediction
          </span>
        </Link>


        <div className="nav-links">

          <Link
            to="/"
            className="active"
          >
            Home
          </Link>

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/routes">
            Routes
          </Link>

          <Link to="/alerts">
            Alerts
          </Link>

          <Link to="/profile">
            Profile
          </Link>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <main>

        <section className="hero-section">

          {/* LEFT SIDE */}

          <div className="hero-content">

            <div className="hero-badge">
              <span className="badge-dot"></span>

              AI-POWERED AIR QUALITY INTELLIGENCE
            </div>


            <h1>
              Breathe better.
              <br />

              <span>
                Move smarter.
              </span>
            </h1>


            <p className="hero-description">

              Understand air pollution before it affects
              your day. Get intelligent forecasts,
              personalized alerts, and pollution-aware
              routes designed for Delhi.

            </p>


            <div className="hero-buttons">

              <Link
                to="/dashboard"
                className="primary-button"
              >
                Explore Dashboard

                <span>
                  →
                </span>

              </Link>


              <Link
                to="/routes"
                className="secondary-button"
              >
                Find a Safer Route
              </Link>

            </div>


            <div className="hero-trust">

              <div className="trust-item">
                <strong>
                  AI
                </strong>

                <span>
                  Powered
                </span>
              </div>


              <div className="trust-divider"></div>


              <div className="trust-item">
                <strong>
                  24h
                </strong>

                <span>
                  Forecasting
                </span>
              </div>


              <div className="trust-divider"></div>


              <div className="trust-item">
                <strong>
                  Delhi
                </strong>

                <span>
                  Focused
                </span>
              </div>

            </div>

          </div>


          {/* RIGHT SIDE IMAGE / VISUAL */}

          <div className="hero-image-wrapper">

            <div className="hero-image-glow"></div>


            <div className="hero-image-card">

              <img
                src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=85"
                alt="Clean atmospheric landscape"
              />


              <div className="image-overlay"></div>


              {/* IMAGE LABEL */}

              <div className="image-label">

                <span className="live-dot"></span>

                <span>
                  AIR QUALITY INTELLIGENCE
                </span>

              </div>


              {/* FLOATING FORECAST CARD */}

              <div className="floating-info-card forecast-card">

                <div className="floating-icon forecast-icon">
                  ↗
                </div>

                <div>

                  <span>
                    AI FORECAST
                  </span>

                  <strong>
                    Next 24 hours
                  </strong>

                </div>

              </div>


              {/* FLOATING ALERT CARD */}

              <div className="floating-info-card alert-card">

                <div className="floating-icon alert-icon">
                  !
                </div>

                <div>

                  <span>
                    SMART ALERTS
                  </span>

                  <strong>
                    Personalized
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            INTRO SECTION
        ===================================================== */}

        <section className="intro-section">

          <div className="section-label">
            WHY AIR QUALITY PREDICTION?
          </div>


          <h2>
            Smarter decisions start
            <br />
            with better air intelligence.
          </h2>


          <p>
            Air Quality Prediction combines air-quality
            observations, weather information and AI-based
            forecasting to help you understand pollution
            and make better everyday decisions.
          </p>

        </section>


        {/* =====================================================
            FEATURE CARDS
        ===================================================== */}

        <section className="features-section">

          <div className="feature-grid">


            {/* CARD 1 */}

            <div className="feature-card feature-green">

              <div className="feature-top">

                <div className="feature-icon">
                  ◉
                </div>

                <span className="feature-number">
                  01
                </span>

              </div>


              <h3>
                Live AQI Monitoring
              </h3>


              <p>
                Understand current air-quality conditions
                across Delhi through monitoring data and
                interactive visualizations.
              </p>


              <Link to="/dashboard">
                Explore monitoring
                <span>→</span>
              </Link>

            </div>


            {/* CARD 2 */}

            <div className="feature-card feature-blue">

              <div className="feature-top">

                <div className="feature-icon">
                  ↗
                </div>

                <span className="feature-number">
                  02
                </span>

              </div>


              <h3>
                AI-Powered Forecasts
              </h3>


              <p>
                Use LSTM-based forecasting to understand
                expected air-quality conditions from
                +1 hour through +24 hours.
              </p>


              <Link to="/dashboard">
                View forecasts
                <span>→</span>
              </Link>

            </div>


            {/* CARD 3 */}

            <div className="feature-card feature-orange">

              <div className="feature-top">

                <div className="feature-icon">
                  !
                </div>

                <span className="feature-number">
                  03
                </span>

              </div>


              <h3>
                Personalized Alerts
              </h3>


              <p>
                Receive meaningful pollution alerts based
                on your personal sensitivity and configured
                air-quality thresholds.
              </p>


              <Link to="/alerts">
                Manage alerts
                <span>→</span>
              </Link>

            </div>


            {/* CARD 4 */}

            <div className="feature-card feature-purple">

              <div className="feature-top">

                <div className="feature-icon">
                  ↝
                </div>

                <span className="feature-number">
                  04
                </span>

              </div>


              <h3>
                Pollution-Aware Routes
              </h3>


              <p>
                Compare route options and identify paths
                that can reduce predicted pollution exposure
                during your journey.
              </p>


              <Link to="/routes">
                Find safer routes
                <span>→</span>
              </Link>

            </div>

          </div>

        </section>


        {/* =====================================================
            VISUAL / DATA SECTION
        ===================================================== */}

        <section className="visual-section">

          <div className="visual-content">

            <div className="section-label">
              FROM DATA TO DECISIONS
            </div>


            <h2>
              Pollution isn't static.
              <br />

              <span>
                Your decisions shouldn't be either.
              </span>
            </h2>


            <p>
              Air quality can change throughout the day.
              Our system combines monitoring data,
              weather conditions and AI forecasting to
              turn complex information into actionable
              insights.
            </p>


            <Link
              to="/dashboard"
              className="text-button"
            >
              Open your dashboard →
            </Link>

          </div>


          <div className="visual-panel">

            <div className="visual-panel-header">

              <span>
                AI FORECAST
              </span>

              <span>
                +1h&nbsp;&nbsp; +6h&nbsp;&nbsp; +12h&nbsp;&nbsp; +24h
              </span>

            </div>


            <div className="forecast-visual">

              <div className="forecast-line"></div>

              <div className="forecast-points">

                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>

              </div>

            </div>


            <div className="visual-panel-footer">

              <span>
                Forecast horizon
              </span>

              <strong>
                Up to 24 hours
              </strong>

            </div>

          </div>

        </section>


        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className="how-section">

          <div className="section-heading">

            <div className="section-label">
              HOW IT WORKS
            </div>

            <h2>
              From pollution data
              <br />
              to smarter action.
            </h2>

          </div>


          <div className="steps">


            <div className="step">

              <div className="step-number">
                01
              </div>

              <h3>
                Monitor
              </h3>

              <p>
                Collect and visualize air-quality
                and weather information.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                02
              </div>

              <h3>
                Predict
              </h3>

              <p>
                Use the LSTM model to forecast
                upcoming pollution conditions.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                03
              </div>

              <h3>
                Personalize
              </h3>

              <p>
                Apply individual health sensitivity
                to make alerts more meaningful.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                04
              </div>

              <h3>
                Act
              </h3>

              <p>
                Respond to alerts and choose
                lower-exposure routes.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="cta-section">

          <div className="cta-background-image"></div>

          <div className="cta-overlay"></div>


          <div className="cta-content">

            <div className="section-label light">
              YOUR AIR. YOUR JOURNEY.
            </div>


            <h2>
              Make every decision
              <br />
              a little healthier.
            </h2>


            <p>
              Explore your air-quality dashboard
              and start making smarter decisions.
            </p>


            <Link
              to="/dashboard"
              className="cta-button"
            >
              Get Started →
            </Link>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="home-footer">

        <div className="footer-brand">

          <span className="brand-mark">
            AQ
          </span>

          <div>

            <strong>
              Air Quality Prediction
            </strong>

            <p>
              AI-based air quality intelligence for Delhi.
            </p>

          </div>

        </div>


        <div className="footer-tech">

          React • FastAPI • LSTM

        </div>

      </footer>

    </div>
  );
}

export default Home;