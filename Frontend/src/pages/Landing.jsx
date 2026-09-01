import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Wind, 
  ArrowRight, 
  Sparkles, 
  Navigation, 
  ShieldCheck,
  Globe
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import delhiGateBg from "../assets/delhi-gate.jpg";

function Landing() {
  const { t, toggleLanguage, language } = useLanguage();
  const token = localStorage.getItem("access_token");

  const [showCapabilities, setShowCapabilities] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleShowFeatures = (e) => {
    e.preventDefault();
    setShowCapabilities(true);
    setTimeout(() => {
      document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleShowHowItWorks = (e) => {
    e.preventDefault();
    setShowHowItWorks(true);
    setTimeout(() => {
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div 
      className="vp-auth-page"
      style={{ 
        backgroundImage: `url(${delhiGateBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        overflowY: 'auto'
      }}
    >
      <div className="vp-auth-overlay" style={{ background: 'rgba(11, 15, 25, 0.75)' }} />

      {/* ================= PUBLIC HEADER ================= */}
      <header 
        className="vp-auth-header" 
        style={{ 
          position: 'sticky', 
          top: 0, 
          width: '100%', 
          maxWidth: '100%',
          boxSizing: 'border-box',
          left: 0,
          right: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 100
        }}
      >
        <div className="vp-auth-header-brand">
          <div className="vp-auth-header-icon" style={{ background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wind size={18} color="#ffffff" />
          </div>
          <span className="vp-auth-header-title" style={{ color: '#ffffff', fontWeight: 'bold' }}>
            {t('logoTitle')}
          </span>
        </div>

        {/* Public Navigation Links */}
        <div style={{ display: 'flex', gap: '48px', alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} className="landing-nav-links">
          <a 
            href="#capabilities" 
            onClick={handleShowFeatures}
            style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '14.5px', 
              fontWeight: '600', 
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#10b981'}
            onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
          >
            {t('landingNavFeatures')}
          </a>
          <a 
            href="#how-it-works" 
            onClick={handleShowHowItWorks}
            style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '14.5px', 
              fontWeight: '600', 
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#10b981'}
            onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
          >
            {t('landingNavHowItWorks')}
          </a>
        </div>

        <div className="vp-auth-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Language Toggle */}
          <button 
            className="vp-lang-toggle" 
            onClick={toggleLanguage} 
            title="Change Language / भाषा बदलें"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 12px',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <Globe size={14} />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Contextual Auth Buttons */}
          {token ? (
            <Link 
              to="/home" 
              className="vp-submit-btn" 
              style={{ 
                margin: 0, 
                padding: '8px 16px', 
                height: 'auto', 
                minHeight: 'unset',
                textDecoration: 'none',
                background: '#10b981',
                fontSize: '14px'
              }}
            >
              <span>{t('landingGoToApp')}</span>
              <ArrowRight size={14} style={{ marginLeft: '6px' }} />
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link 
                to="/login" 
                style={{ 
                  color: '#ffffff', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent'
                }}
              >
                {t('signInLink')}
              </Link>
              <Link 
                to="/signup" 
                style={{ 
                  color: '#ffffff', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#10b981',
                  border: 'none'
                }}
              >
                {t('createOne')}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Page Scroll Container */}
      <div 
        style={{ 
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 4% 80px 4%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* ================= HERO SECTION ================= */}
        <div 
          style={{ 
            width: '100%',
            minHeight: 'calc(100vh - 128px)', // Fills viewport height perfectly
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '40px 0',
            boxSizing: 'border-box'
          }}
        >
          {/* Intro Badge */}
          <div 
            style={{ 
              background: 'rgba(16, 185, 129, 0.15)', 
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '100px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '1px',
              color: '#10b981',
              marginBottom: '32px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={14} />
            <span>{t('landingHeroTag')}</span>
          </div>

          {/* Main Headline */}
          <h1 
            style={{ 
              fontSize: 'calc(2.8rem + 2.2vw)', 
              fontWeight: '800', 
              color: '#ffffff', 
              lineHeight: '1.15', 
              maxWidth: '1050px',
              marginBottom: '28px',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            {t('landingHeading')}
          </h1>

          {/* Supporting Description */}
          <p 
            style={{ 
              fontSize: '22px', 
              color: '#94a3b8', 
              lineHeight: '1.65', 
              maxWidth: '850px',
              marginBottom: '48px'
            }}
          >
            {t('landingDescription')}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 0 }}>
            <Link 
              to={token ? "/home" : "/signup"} 
              style={{ 
                background: '#10b981',
                color: '#ffffff',
                padding: '16px 36px',
                borderRadius: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                fontSize: '15px'
              }}
            >
              <span>{token ? t('landingGoToApp') : t('landingStartBtn')}</span>
              <ArrowRight size={16} />
            </Link>
            
            <a 
              href="#capabilities" 
              onClick={handleShowFeatures}
              style={{ 
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '16px 36px',
                borderRadius: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px'
              }}
            >
              <span>{t('landingLearnMore')}</span>
            </a>
          </div>
        </div>

        {/* ================= PLATFORM CAPABILITIES ================= */}
        {showCapabilities && (
          <div 
            id="capabilities"
            style={{ 
              width: '100%',
              maxWidth: '1100px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '60px',
              textAlign: 'left'
            }}
          >
            <h2 
              style={{ 
                fontSize: '38px', 
                color: '#ffffff', 
                marginBottom: '40px',
                textAlign: 'center',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              {t('landingFeatureTitle')}
            </h2>

            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '24px' 
              }}
            >
              {/* AI Forecasting Card */}
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: 'rgba(16, 185, 129, 0.15)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#10b981',
                    marginBottom: '16px'
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>
                  {t('featAiTitle')}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
                  {t('featAiDesc')}
                </p>
              </div>

              {/* Smart Routing Card */}
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: 'rgba(59, 130, 246, 0.15)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#3b82f6',
                    marginBottom: '16px'
                  }}
                >
                  <Navigation size={20} />
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>
                  {t('featRouteTitle')}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
                  {t('featRouteDesc')}
                </p>
              </div>

              {/* Personalized Alerts Card */}
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: 'rgba(139, 92, 246, 0.15)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#8b5cf6',
                    marginBottom: '16px'
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>
                  {t('featAlertsTitle')}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
                  {t('featAlertsDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= HOW IT WORKS SECTION ================= */}
        {showHowItWorks && (
          <div 
            id="how-it-works"
            style={{ 
              width: '100%',
              maxWidth: '1100px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '60px',
              marginTop: '60px',
              textAlign: 'left'
            }}
          >
            <h2 
              style={{ 
                fontSize: '38px', 
                color: '#ffffff', 
                marginBottom: '40px',
                textAlign: 'center',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              {t('landingHowItWorksTitle')}
            </h2>

            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '24px' 
              }}
            >
              {/* Step 1 */}
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(4px)',
                  position: 'relative'
                }}
              >
                <h3 style={{ color: '#10b981', fontSize: '16px', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
                  {t('landingStep1Title')}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: '1.5' }}>
                  {t('landingStep1Desc')}
                </p>
              </div>

              {/* Step 2 */}
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(4px)',
                  position: 'relative'
                }}
              >
                <h3 style={{ color: '#3b82f6', fontSize: '16px', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
                  {t('landingStep2Title')}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: '1.5' }}>
                  {t('landingStep2Desc')}
                </p>
              </div>

              {/* Step 3 */}
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(4px)',
                  position: 'relative'
                }}
              >
                <h3 style={{ color: '#8b5cf6', fontSize: '16px', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
                  {t('landingStep3Title')}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: '1.5' }}>
                  {t('landingStep3Desc')}
                </p>
              </div>

              {/* Step 4 */}
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(4px)',
                  position: 'relative'
                }}
              >
                <h3 style={{ color: '#ec4899', fontSize: '16px', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
                  {t('landingStep4Title')}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: '1.5' }}>
                  {t('landingStep4Desc')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= LANDING FOOTER ================= */}
      <footer 
        style={{ 
          position: 'relative',
          zIndex: 10,
          width: '100%',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px 4%',
          background: 'rgba(11, 15, 25, 0.9)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '13px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#94a3b8', fontWeight: '700' }}>{t('homeFootSubtitle')}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', alignItems: 'center' }}>
          <span>{t('homeFootStack')}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span>{t('homeFootCopy')}</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
