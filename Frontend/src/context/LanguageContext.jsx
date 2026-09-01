import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Top Auth Header & System Status
    sysStatus: "System Status: Online",
    logoTitle: "Air Quality Prediction",
    
    // Navbar
    navHome: "Home",
    navDashboard: "Dashboard",
    navRoutes: "Routes",
    navAlerts: "Alerts",
    navProfile: "Profile",
    navFeedback: "Feedback",
    navLogout: "Logout",
    
    // Auth Pages (Login & Signup)
    welcomeTitle: "Welcome back!",
    signInSubtitle: "Sign in to continue.",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    signInBtn: "Sign In",
    orText: "or",
    noAccountText: "Don't have an account?",
    createOne: "Create one",
    secureInfo: "Your information is securely protected.",
    loginHeroTitle1: "Cleaner Air.",
    loginHeroTitle2: "Smarter Routes.",
    loginHeroDesc: "Real-time air quality insights, AI predictions and pollution-aware routes.",
    signupHeroTitle1: "Join us for a",
    signupHeroTitle2: "Cleaner, Healthier",
    signupHeroTitle3: "Tomorrow.",
    signupHeroDesc: "Get personalized air-quality alerts and routes based on your needs.",
    
    // Landing Page
    landingHeroTag: "INTRODUCING THE ADVANCED SYSTEM",
    landingHeading: "Air Quality & Intelligent Routing Platform",
    landingDescription: "Experience Delhi's first AI-powered platform for real-time air quality intelligence, 24-hour deep learning forecasts, and personalized, pollution-minimized travel route optimization.",
    landingStartBtn: "Get Started / Sign In",
    landingLearnMore: "Learn More",
    landingFeatureTitle: "Key Platform features",
    landingGoToApp: "Go to Platform",
    landingNavFeatures: "Features",
    landingNavHowItWorks: "How It Works",
    landingHowItWorksTitle: "How the Platform Works",
    landingStep1Title: "1. Real-Time Telemetry Ingestion",
    landingStep1Desc: "Collect live air pollutant parameters (PM2.5, PM10, meteorological markers) from CPCB monitoring stations across Delhi NCR in real time.",
    landingStep2Title: "2. Predictive AI Models",
    landingStep2Desc: "Leverage highly trained recurrent LSTM neural networks to compute predictions for the upcoming 24 hours.",
    landingStep3Title: "3. Pollution-Minimized Routing",
    landingStep3Desc: "Run advanced route optimization algorithms with Inverse Distance Weighting interpolation to guide travelers away from toxic air corridors.",
    landingStep4Title: "4. Health-Adaptive Alerts",
    landingStep4Desc: "Trigger automated email notifications customized to user health sensitivities when pollutant limits are breached.",
    
    // Signup specific
    createAccountTitle: "Create Your Account",
    getStartedSubtitle: "Let's get you started",
    firstNameLabel: "First name",
    firstNamePlaceholder: "First name",
    lastNameLabel: "Last name",
    lastNamePlaceholder: "Last name",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    agreeTerms: "I agree to the Terms of Service and Privacy Policy",
    createAccountBtn: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    signInLink: "Sign in",
    dataEncrypted: "Your data is encrypted and securely stored.",
    
    // Live AQI preview card
    liveAqiTag: "LIVE AQI",
    cpStation: "Connaught Place, Central Station",
    modRisk: "Moderate Risk",
    sensCaution: "Sensitive groups take caution",
    
    // Features Stack (Login)
    featAiTitle: "AI Forecasting",
    featAiDesc: "24h deep learning LSTM predictions for Delhi CAAQMS stations.",
    featRouteTitle: "Pollution-Aware Routing",
    featRouteDesc: "Avoid highly polluted corridors while traveling across Delhi.",
    featAlertsTitle: "Personalized Alerts",
    featAlertsDesc: "Email alerts customized to your health sensitivity settings.",

    // Features Stack (Signup)
    featLiveTitle: "Real-Time Air Quality",
    featLiveDesc: "High-resolution forecasts up to 24 hours ahead",
    featPersonalAlertsTitle: "Personalized Alerts",
    featPersonalAlertsDesc: "Alerts tailored to your sensitivity and preferences",
    featSmartRouteTitle: "Smart Route Optimization",
    featSmartRouteDesc: "Routes optimized to reduce pollution exposure",

    // Home Page
    homeWelcome: "Welcome back",
    homeOverviewDesc: "Get a clearer picture of the air ahead with intelligent forecasts, personalized insights, and smarter routes tailored to your journey.",
    homeHeroBadge: "AI-POWERED AIR QUALITY INTELLIGENCE",
    homeHeroTitle1: "Breathe better.",
    homeHeroTitle2: "Move smarter.",
    homeExploreBtn: "Explore Dashboard",
    homeSaferRouteBtn: "Find a Safer Route",
    homeCapabilityAiTitle: "AI Powered",
    homeCapabilityAiDesc: "Smart models for better predictions",
    homeCapabilityForecastTitle: "24h Forecasting",
    homeCapabilityForecastDesc: "Accurate 24-hour air quality forecast",
    homeCapabilityCpcbTitle: "CPCB Live Data",
    homeCapabilityCpcbDesc: "Trusted data from official sources",
    homeCurrentAqi: "Current AQI",
    homeLastUpdated: "Last updated: Just now",
    homeLive: "LIVE",
    homeForecastChartHeader: "24-Hour Forecast Trend",
    homeFootSubtitle: "AI Environmental Intel & Optimized Routes",
    homeFootStack: "React 19 • FastAPI • LSTM",
    homeFootCopy: "Built with ❤ for cleaner air",

    // Dashboard Page
    dashTitle: "Delhi Air Quality Intelligence Dashboard",
    dashSubtitle: "Live CAAQMS telemetry readings and deep learning forecasts",
    dashSelectStation: "Select Monitoring Station",
    dashStationDetail: "Station Details",
    dashAqiIndex: "Air Quality Index",
    dashWeatherTitle: "Weather Live Status",
    dashAqiCategory: "AQI Category",
    dashForecastHeading: "Deep Learning LSTM Forecasts",
    dashForecastSub: "Predictive AQI horizons generated via time-series model",
    dashForecast1h: "1-Hour Forecast",
    dashForecast6h: "6-Hour Forecast",
    dashForecast12h: "12-Hour Forecast",
    dashForecast24h: "24-Hour Forecast",
    dashHistoricalTrends: "Historical 24-Hour Trends",
    dashHistoryPm: "Historical PM2.5 Progression",
    dashHistoryNo: "Historical NO2 Progression",
    dashSearchPlaceholder: "Search stations...",
    
    // Routes Page
    routesTitle: "Pollution-Aware Route Planner",
    routesSubtitle: "Find travel paths optimized to minimize exposure to PM2.5 and PM10",
    routesStartLoc: "Starting Location",
    routesEndLoc: "Destination Location",
    routesSelectPlaceholder: "Select coordinate station...",
    routesFindBtn: "Find Safest Path",
    routesAnalyzing: "Calculating pollution exposures...",
    routesResultsHeading: "Optimized Route Alternative Comparisons",
    routesExposureDiff: "Exposure Difference",
    routesSafetyAdvice: "Safety Travel Recommendation",
    routesSafestRoute: "Safest Route (AI Preferred)",
    routesAlternativeRoute: "Alternative Route (Fastest)",
    routesCleanAdvantage: "cleaner path advantage",
    routesAvoidCorridors: "Avoids high-pollution corridors",
    routesTravelAdvice: "Travel Advice: Keep windows rolled up and use air recirculation mode.",
    routesNoPath: "Enter your starting point and destination to compute optimized route directions.",
    
    // Alerts Page
    alertsTitle: "Personalized Environmental Alerts",
    alertsSubtitle: "Configure email alerts and monitor real-time atmospheric hazards",
    alertsRadarTitle: "Delhi Atmospheric Radar Sweep",
    alertsScanBtn: "Scan Forecast for Risks",
    alertsScanning: "Scanning forecast arrays...",
    alertsScanIdle: "Active Radar Scope",
    alertsRiskAssessment: "Active Health Risk Assessments",
    alertsNoRisks: "No active hazard alerts found for your current sensitivity profile.",
    alertsHistoryLog: "Personal Alerts Log History",
    alertsConfigTitle: "Alert Settings Panel",
    alertsSensLabel: "Health Sensitivity Tier",
    alertsEmailNotifications: "Enable Email Alerts",
    alertsNotifyMethod: "Notification Channel",
    alertsDailySummary: "Send Daily Summary Emails",
    alertsSaveSettingsBtn: "Save Settings",
    alertsSaving: "Saving...",
    alertsSavedSuccess: "Alert configuration saved successfully!",

    // Profile Page
    profileTitle: "User Profile Settings",
    profileSubtitle: "Manage your personal profile and account parameters",
    profilePersonalDetails: "Personal Details",
    profileFirstName: "First Name",
    profileLastName: "Last Name",
    profileEmail: "Email Address",
    profilePreferences: "System Preferences",
    profileLangSelect: "Application Language",
    profileSensitivity: "Ailment Sensitivity Level",
    profileSaveBtn: "Save Profile Changes",
    profileSuccessMsg: "Profile updated successfully!",
    profileMemberSince: "Member Since",
    profileGeneralUser: "General Citizen",
    profileAsthmaTier: "Asthma Sensitive",
    profileElderlyTier: "Elderly Care Group",
    profileChildTier: "Child Protection Group",
    profileSensitiveLabel: "Sensitive"
  },
  hi: {
    // Top Auth Header & System Status
    sysStatus: "सिस्टम स्थिति: सक्रिय",
    logoTitle: "वायु गुणवत्ता पूर्वानुमान",
    
    // Navbar
    navHome: "मुख्य पृष्ठ",
    navDashboard: "डैशबोर्ड",
    navRoutes: "मार्ग योजना",
    navAlerts: "अलर्ट",
    navProfile: "प्रोफ़ाइल",
    navFeedback: "प्रतिक्रिया",
    navLogout: "लॉगआउट",
    
    // Auth Pages (Login & Signup)
    welcomeTitle: "स्वागत है!",
    signInSubtitle: "आगे बढ़ने के लिए साइन इन करें।",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "you@example.com",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    forgotPassword: "पासवर्ड भूल गए?",
    signInBtn: "लॉग इन करें",
    orText: "अथवा",
    noAccountText: "खाता नहीं है?",
    createOne: "नया बनाएं",
    secureInfo: "आपकी जानकारी पूरी तरह सुरक्षित है।",
    loginHeroTitle1: "स्वच्छ हवा।",
    loginHeroTitle2: "स्मार्ट मार्ग।",
    loginHeroDesc: "वास्तविक समय वायु गुणवत्ता जानकारी, एआई पूर्वानुमान और प्रदूषण-सचेत मार्ग।",
    signupHeroTitle1: "हमारे साथ जुड़ें",
    signupHeroTitle2: "स्वच्छ, स्वस्थ",
    signupHeroTitle3: "कल के लिए।",
    signupHeroDesc: "अपनी आवश्यकताओं के अनुसार व्यक्तिगत वायु गुणवत्ता अलर्ट और मार्ग प्राप्त करें।",
    
    // Landing Page
    landingHeroTag: "उन्नत प्रणाली का परिचय",
    landingHeading: "वायु गुणवत्ता और इंटेलिजेंट मार्ग प्रणाली",
    landingDescription: "दिल्ली की पहली एआई-संचालित प्रणाली का अनुभव करें जो वास्तविक समय वायु गुणवत्ता जानकारी, 24 घंटे के गहन शिक्षण पूर्वानुमान और व्यक्तिगत, प्रदूषण-मुक्त यात्रा मार्ग प्रदान करती है।",
    landingStartBtn: "शुरू करें / साइन इन करें",
    landingLearnMore: "अधिक जानें",
    landingFeatureTitle: "प्रणाली की मुख्य विशेषताएं",
    landingGoToApp: "प्लेटफ़ॉर्म पर जाएँ",
    landingNavFeatures: "विशेषताएं",
    landingNavHowItWorks: "यह कैसे काम करता है",
    landingHowItWorksTitle: "प्रणाली कैसे काम करती है",
    landingStep1Title: "1. वास्तविक समय डेटा संग्रह",
    landingStep1Desc: "दिल्ली एनसीआर के CPCB निगरानी स्टेशनों से वास्तविक समय प्रदूषक मानकों (PM2.5, PM10, मौसम संबंधी संकेतक) को एकत्र करता है।",
    landingStep2Title: "2. भविष्य कहनेवाला एआई मॉडल",
    landingStep2Desc: "आगामी 24 घंटों के लिए सटीक वायु गुणवत्ता का अनुमान लगाने के लिए प्रशिक्षित एलएसटीएम (LSTM) आवर्ती न्यूरल नेटवर्क का उपयोग करता है।",
    landingStep3Title: "3. प्रदूषण-मुक्त मार्ग योजना",
    landingStep3Desc: "यात्रियों को अत्यधिक प्रदूषित क्षेत्रों से बचाने और सबसे स्वच्छ मार्ग सुझाने के लिए दूरी भारित प्रक्षेप तकनीक (IDW) के साथ उन्नत एल्गोरिदम चलाता है।",
    landingStep4Title: "4. स्वास्थ्य-अनुकूल ईमेल अलर्ट",
    landingStep4Desc: "जब प्रदूषक सीमाएं पार हो जाती हैं, तो उपयोगकर्ता की स्वास्थ्य संवेदनशीलता (जैसे अस्थमा या बाल सुरक्षा) के अनुसार अनुकूलित स्वचालित ईमेल अलर्ट भेजता है।",
    
    // Signup specific
    createAccountTitle: "नया खाता बनाएं",
    getStartedSubtitle: "शुरू करने के लिए अपनी जानकारी भरें",
    firstNameLabel: "पहला नाम",
    firstNamePlaceholder: "पहला नाम",
    lastNameLabel: "अंतिम नाम",
    lastNamePlaceholder: "अंतिम नाम",
    confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
    confirmPasswordPlaceholder: "पासवर्ड दोबारा दर्ज करें",
    agreeTerms: "मैं सेवा की शर्तों और गोपनीयता नीति से सहमत हूँ",
    createAccountBtn: "खाता बनाएं",
    alreadyHaveAccount: "पहले से खाता है?",
    signInLink: "साइन इन करें",
    dataEncrypted: "आपका डेटा एन्क्रिप्टेड और सुरक्षित रूप से संग्रहीत है।",
    
    // Live AQI preview card
    liveAqiTag: "लाइव AQI",
    cpStation: "कनॉट प्लेस, सेंट्रल स्टेशन",
    modRisk: "मध्यम जोखिम",
    sensCaution: "संवेदनशील समूह सावधानी बरतें",
    
    // Features Stack (Login)
    featAiTitle: "एआई पूर्वानुमान",
    featAiDesc: "दिल्ली CAAQMS स्टेशनों के लिए 24 घंटे का गहन शिक्षण एलएसटीएम पूर्वानुमान।",
    featRouteTitle: "प्रदूषण-सचेत मार्ग",
    featRouteDesc: "दिल्ली में यात्रा के दौरान अत्यधिक प्रदूषित क्षेत्रों से बचें।",
    featAlertsTitle: "व्यक्तिगत अलर्ट",
    featAlertsDesc: "आपकी स्वास्थ्य संवेदनशीलता सेटिंग्स के अनुसार अनुकूलित ईमेल अलर्ट।",

    // Features Stack (Signup)
    featLiveTitle: "वास्तविक समय वायु गुणवत्ता",
    featLiveDesc: "24 घंटे आगे तक का उच्च-सटीकता पूर्वानुमान",
    featPersonalAlertsTitle: "व्यक्तिगत अलर्ट",
    featPersonalAlertsDesc: "आपकी स्वास्थ्य संवेदनशीलता और प्राथमिकताओं के अनुरूप अलर्ट",
    featSmartRouteTitle: "स्मार्ट मार्ग अनुकूलन",
    featSmartRouteDesc: "प्रदूषण जोखिम को न्यूनतम करने के लिए अनुकूलित यात्रा मार्ग",

    // Home Page
    homeWelcome: "स्वागत है",
    homeOverviewDesc: "अपनी यात्रा के लिए तैयार किए गए बुद्धिमान पूर्वानुमानों, व्यक्तिगत अंतर्दृष्टि और स्मार्ट मार्गों के साथ आगे की हवा की एक स्पष्ट तस्वीर प्राप्त करें।",
    homeHeroBadge: "एआई-संचालित वायु गुणवत्ता खुफिया प्रणाली",
    homeHeroTitle1: "स्वच्छ सांस लें।",
    homeHeroTitle2: "स्मार्ट चलें।",
    homeExploreBtn: "डैशबोर्ड देखें",
    homeSaferRouteBtn: "सुरक्षित मार्ग खोजें",
    homeCapabilityAiTitle: "एआई संचालित",
    homeCapabilityAiDesc: "बेहतर भविष्यवाणियों के लिए स्मार्ट मॉडल",
    homeCapabilityForecastTitle: "24 घंटे का पूर्वानुमान",
    homeCapabilityForecastDesc: "सटीक 24-घंटे वायु गुणवत्ता पूर्वानुमान",
    homeCapabilityCpcbTitle: "CPCB लाइव डेटा",
    homeCapabilityCpcbDesc: "आधिकारिक स्रोतों से विश्वसनीय डेटा",
    homeCurrentAqi: "वर्तमान AQI",
    homeLastUpdated: "अंतिम अपडेट: अभी-अभी",
    homeLive: "लाइव",
    homeForecastChartHeader: "24 घंटे का पूर्वानुमान रुझान",
    homeFootSubtitle: "एआई पर्यावरण खुफिया और अनुकूलित मार्ग",
    homeFootStack: "रिएक्ट 19 • फास्टएपीआई • एलएसटीएम",
    homeFootCopy: "स्वच्छ हवा के लिए ❤ से निर्मित",

    // Dashboard Page
    dashTitle: "दिल्ली वायु गुणवत्ता खुफिया डैशबोर्ड",
    dashSubtitle: "लाइव CAAQMS टेलीमेट्री और डीप लर्निंग पूर्वानुमान",
    dashSelectStation: "निगरानी स्टेशन चुनें",
    dashStationDetail: "स्टेशन विवरण",
    dashAqiIndex: "वायु गुणवत्ता सूचकांक (AQI)",
    dashWeatherTitle: "मौसम की लाइव स्थिति",
    dashAqiCategory: "AQI श्रेणी",
    dashForecastHeading: "डीप लर्निंग LSTM पूर्वानुमान",
    dashForecastSub: "टाइम-सीरीज मॉडल के माध्यम से जनरेट किए गए पूर्वानुमान",
    dashForecast1h: "1 घंटे का पूर्वानुमान",
    dashForecast6h: "6 घंटे का पूर्वानुमान",
    dashForecast12h: "12 घंटे का पूर्वानुमान",
    dashForecast24h: "24 घंटे का पूर्वानुमान",
    dashHistoricalTrends: "ऐतिहासिक 24 घंटे के रुझान",
    dashHistoryPm: "ऐतिहासिक PM2.5 प्रगति",
    dashHistoryNo: "ऐतिहासिक NO2 प्रगति",
    dashSearchPlaceholder: "स्टेशन खोजें...",
    
    // Routes Page
    routesTitle: "प्रदूषण-मुक्त मार्ग नियोजक",
    routesSubtitle: "PM2.5 और PM10 के जोखिम को कम करने वाले यात्रा मार्गों की खोज करें",
    routesStartLoc: "प्रस्थान स्थान",
    routesEndLoc: "गंतव्य स्थान",
    routesSelectPlaceholder: "स्टेशन चुनें...",
    routesFindBtn: "सबसे सुरक्षित मार्ग खोजें",
    routesAnalyzing: "प्रदूषण स्तर की गणना की जा रही है...",
    routesResultsHeading: "अनुकुकृत मार्ग विकल्पों की तुलना",
    routesExposureDiff: "प्रदूषण जोखिम में अंतर",
    routesSafetyAdvice: "सुरक्षित यात्रा सलाह",
    routesSafestRoute: "सबसे सुरक्षित मार्ग (एआई पसंदीदा)",
    routesAlternativeRoute: "वैकल्पिक मार्ग (सबसे तेज़)",
    routesCleanAdvantage: "स्वच्छ हवा का लाभ",
    routesAvoidCorridors: "अत्यधिक प्रदूषित क्षेत्रों से बचाता है",
    routesTravelAdvice: "यात्रा सलाह: कार के शीशे बंद रखें और एयर रीसर्क्युलेशन मोड चालू करें।",
    routesNoPath: "अनुकूलित मार्ग की गणना करने के लिए अपना प्रस्थान और गंतव्य बिंदु दर्ज करें।",
    
    // Alerts Page
    alertsTitle: "व्यक्तिगत पर्यावरण अलर्ट",
    alertsSubtitle: "ईमेल अलर्ट कॉन्फ़िगर करें और वास्तविक समय के वायु खतरों की निगरानी करें",
    alertsRadarTitle: "दिल्ली वायुमंडलीय रडार स्कैन",
    alertsScanBtn: "जोखिमों के लिए स्कैन करें",
    alertsScanning: "पूर्वानुमान स्कैन किया जा रहा है...",
    alertsScanIdle: "सक्रिय रडार स्कोप",
    alertsRiskAssessment: "सक्रिय स्वास्थ्य जोखिम मूल्यांकन",
    alertsNoRisks: "आपकी वर्तमान स्वास्थ्य संवेदनशीलता के लिए कोई सक्रिय खतरा नहीं पाया गया।",
    alertsHistoryLog: "व्यक्तिगत अलर्ट का इतिहास",
    alertsConfigTitle: "अलर्ट सेटिंग्स पैनल",
    alertsSensLabel: "स्वास्थ्य संवेदनशीलता श्रेणी",
    alertsEmailNotifications: "ईमेल अलर्ट सक्षम करें",
    alertsNotifyMethod: "अधिसूचना माध्यम",
    alertsDailySummary: "दैनिक सारांश ईमेल प्राप्त करें",
    alertsSaveSettingsBtn: "सेटिंग्स सहेजें",
    alertsSaving: "सहेजा जा रहा है...",
    alertsSavedSuccess: "अलर्ट सेटिंग्स सफलतापूर्वक सहेजी गईं!",

    // Profile Page
    profileTitle: "उपयोगकर्ता प्रोफ़ाइल सेटिंग्स",
    profileSubtitle: "अपनी व्यक्तिगत प्रोफ़ाइल और खाता सेटिंग्स प्रबंधित करें",
    profilePersonalDetails: "व्यक्तिगत विवरण",
    profileFirstName: "पहला नाम",
    profileLastName: "अंतिम नाम",
    profileEmail: "ईमेल पता",
    profilePreferences: "प्रणाली प्राथमिकताएं",
    profileLangSelect: "एप्लिकेशन की भाषा",
    profileSensitivity: "स्वास्थ्य संवेदनशीलता स्तर",
    profileSaveBtn: "प्रोफ़ाइल सहेजें",
    profileSuccessMsg: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
    profileMemberSince: "सदस्यता की शुरुआत",
    profileGeneralUser: "सामान्य नागरिक",
    profileAsthmaTier: "अस्थमा संवेदनशील",
    profileElderlyTier: "बुजुर्ग देखभाल समूह",
    profileChildTier: "बाल संरक्षण समूह",
    profileSensitiveLabel: "संवेदनशील"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_lang') || 'en';
  });

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const setAppLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setAppLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
