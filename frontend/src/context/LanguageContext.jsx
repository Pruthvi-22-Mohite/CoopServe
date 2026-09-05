import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  en: {
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_services: 'Book Services',
    nav_bookings: 'My Bookings',
    nav_cooperative: 'Cooperative Hub',
    nav_switch_role: 'Switch Role',
    nav_notifications: 'Notifications',
    nav_profile: 'My Profile',
    nav_logout: 'Log Out',

    // Dashboard
    dash_welcome: 'Welcome back',
    dash_banner_sub: 'Discover verified local professionals with guaranteed fair fees and Protected Booking.',
    dash_search_placeholder: 'Search plumbing, electrical, cleaning, gardening...',
    dash_popular_title: 'Popular Services in Pune',
    dash_popular_sub: 'Fair pricing with verified community cooperative workers',
    dash_nearby_title: 'Nearby Cooperative Providers',
    dash_nearby_sub: 'Verified local technicians in your neighborhood',
    dash_recommended_title: 'AI Recommended Match',
    dash_stat_protected: 'Protected Bookings',
    dash_stat_points: 'Co-op Reward Points',
    dash_stat_trust: 'Verified Work History',
    dash_stat_rating: 'Avg Provider Rating',
    dash_active_booking: 'Active Protected Booking',
    dash_view_details: 'View Details',
    dash_explore_services: 'Explore Services',
    dash_see_all: 'See All',

    // Discovery & Filters
    filter_all_categories: 'All Categories',
    filter_search: 'Search providers or skills...',
    filter_sort_by: 'Sort By',
    filter_sort_relevance: 'AI Match & Relevance',
    filter_sort_rating: 'Highest Rating',
    filter_sort_distance: 'Nearest Distance',
    filter_sort_price_low: 'Price: Low to High',
    filter_sort_trust: 'Highest Trust Score',
    filter_rating: 'Minimum Rating',
    filter_availability: 'Availability',
    filter_avail_today: 'Available Today Only',
    filter_price_range: 'Max Starting Price',
    filter_reset: 'Reset Filters',
    filter_showing: 'Showing',
    filter_providers: 'verified providers',

    // Provider Card
    card_trust_score: 'Trust Score',
    card_verified: 'Verified Provider',
    card_completed_jobs: 'jobs done',
    card_starting_from: 'Starting from',
    card_view_profile: 'View Profile',
    card_book_now: 'Book Service',
    card_available: 'Available Today',
    card_km_away: 'km away',

    // Provider Profile
    prof_about: 'About Technician',
    prof_services_pricing: 'Services & Transparent Rates',
    prof_work_history: 'Verified Work History',
    prof_reviews: 'Customer Reviews',
    prof_trust_breakdown: 'Trust Score Telemetry',
    prof_member_id: 'Cooperative Member ID',
    prof_experience: 'Experience',
    prof_direct_book: 'Book Protected Service Now',
    prof_coop_badge: 'Verified CoopServe Cooperative Member',

    // Common
    common_loading: 'Loading CoopServe details...',
    common_guarantee: 'CoopServe Protected: 90% Direct to Worker, 100% Guaranteed',
  },
  hi: {
    // Navigation
    nav_dashboard: 'डैशबोर्ड',
    nav_services: 'सेवाएं बुक करें',
    nav_bookings: 'मेरी बुकिंग्स',
    nav_cooperative: 'सहकारी हब',
    nav_switch_role: 'रोल बदलें',
    nav_notifications: 'सूचनाएं',
    nav_profile: 'मेरी प्रोफाइल',
    nav_logout: 'लॉग आउट',

    // Dashboard
    dash_welcome: 'स्वागत है',
    dash_banner_sub: 'उचित दरों और संरक्षित बुकिंग के साथ सत्यापित स्थानीय कारीगर खोजें।',
    dash_search_placeholder: 'प्लंबिंग, बिजली, सफ़ाई, बढ़ई काम खोजें...',
    dash_popular_title: 'पुणे में लोकप्रिय सेवाएं',
    dash_popular_sub: 'सत्यापित सहकारी कारीगरों के साथ पारदर्शी मूल्य',
    dash_nearby_title: 'आपके नजदीकी सहकारी सेवा प्रदाता',
    dash_nearby_sub: 'आपके इलाके के सत्यापित तकनीशियन',
    dash_recommended_title: 'एआई अनुशंसित मैच',
    dash_stat_protected: 'संरक्षित बुकिंग',
    dash_stat_points: 'सहकारी रिवार्ड्स',
    dash_stat_trust: 'सत्यापित कार्य इतिहास',
    dash_stat_rating: 'औसत रेटिंग',
    dash_active_booking: 'सक्रिय सुरक्षित बुकिंग',
    dash_view_details: 'विवरण देखें',
    dash_explore_services: 'सेवाएं देखें',
    dash_see_all: 'सभी देखें',

    // Discovery & Filters
    filter_all_categories: 'सभी श्रेणियां',
    filter_search: 'प्रदाता या कौशल खोजें...',
    filter_sort_by: 'क्रमबद्ध करें',
    filter_sort_relevance: 'एआई मैच और प्रासंगिकता',
    filter_sort_rating: 'सर्वोच्च रेटिंग',
    filter_sort_distance: 'नजदीकी दूरी',
    filter_sort_price_low: 'मूल्य: कम से ज्यादा',
    filter_sort_trust: 'सर्वोच्च ट्रस्ट स्कोर',
    filter_rating: 'न्यूनतम रेटिंग',
    filter_availability: 'उपलब्धता',
    filter_avail_today: 'केवल आज उपलब्ध',
    filter_price_range: 'अधिकतम प्रारंभिक मूल्य',
    filter_reset: 'फ़िल्टर हटाएं',
    filter_showing: 'दिखा रहे हैं',
    filter_providers: 'सत्यापित प्रदाता',

    // Provider Card
    card_trust_score: 'ट्रस्ट स्कोर',
    card_verified: 'सत्यापित कारीगर',
    card_completed_jobs: 'काम पूरे किए',
    card_starting_from: 'शुरुआती दर',
    card_view_profile: 'प्रोफ़ाइल देखें',
    card_book_now: 'सेवा बुक करें',
    card_available: 'आज उपलब्ध',
    card_km_away: 'किमी दूर',

    // Provider Profile
    prof_about: 'कारीगर के बारे में',
    prof_services_pricing: 'सेवाएं और पारदर्शी दरें',
    prof_work_history: 'सत्यापित कार्य इतिहास',
    prof_reviews: 'ग्राहकों की समीक्षाएं',
    prof_trust_breakdown: 'ट्रस्ट स्कोर विश्लेषण',
    prof_member_id: 'सहकारी सदस्य आईडी',
    prof_experience: 'अनुभव',
    prof_direct_book: 'सुरक्षित बुकिंग करें',
    prof_coop_badge: 'सत्यापित कूपसर्व सहकारी सदस्य',

    // Common
    common_loading: 'कूपसर्व लोड हो रहा है...',
    common_guarantee: 'कूपसर्व सुरक्षा: 90% सीधे कामगार को, 100% गारंटी',
  },
  mr: {
    // Navigation
    nav_dashboard: 'डॅशबोर्ड',
    nav_services: 'सेवा बुक करा',
    nav_bookings: 'माझ्या बुकिंग्ज',
    nav_cooperative: 'सहकारी केंद्र',
    nav_switch_role: 'भूमिका बदला',
    nav_notifications: 'सूचना',
    nav_profile: 'माझे प्रोफाइल',
    nav_logout: 'बाहेर पडा',

    // Dashboard
    dash_welcome: 'पुन्हा स्वागत आहे',
    dash_banner_sub: 'वाजवी दर आणि सुरक्षित बुकिंगसह परिसरातील पडताळणी केलेले सेवादार शोधा.',
    dash_search_placeholder: 'प्लंबिंग, इलेक्ट्रिकल, स्वच्छता, सुतारकाम शोधा...',
    dash_popular_title: 'पुण्यातील लोकप्रिय सेवा',
    dash_popular_sub: 'स्थानिक सहकारी कामगारांसोबत पारदर्शक दर',
    dash_nearby_title: 'तुमच्या परिसरातील सहकारी सेवादार',
    dash_nearby_sub: 'परिसरातील पडताळलेले तंत्रज्ञ',
    dash_recommended_title: 'एआय शिफारस केलेला पर्याय',
    dash_stat_protected: 'संरक्षित बुकिंग्ज',
    dash_stat_points: 'सहकारी गुण',
    dash_stat_trust: 'पडताळलेला कामाचा इतिहास',
    dash_stat_rating: 'सरासरी रेटिंग',
    dash_active_booking: 'सक्रिय सुरक्षित बुकिंग',
    dash_view_details: 'तपशील पहा',
    dash_explore_services: 'सेवा शोधा',
    dash_see_all: 'सर्व पहा',

    // Discovery & Filters
    filter_all_categories: 'सर्व श्रेणी',
    filter_search: 'सेवादार किंवा कौशल्य शोधा...',
    filter_sort_by: 'क्रमवारी',
    filter_sort_relevance: 'एआय सुसंगतता',
    filter_sort_rating: 'सर्वोच्च रेटिंग',
    filter_sort_distance: 'सर्वात जवळ',
    filter_sort_price_low: 'दर: कमी ते जास्त',
    filter_sort_trust: 'सर्वोच्च ट्रस्ट स्कोअर',
    filter_rating: 'किमान रेटिंग',
    filter_availability: 'उपलब्धता',
    filter_avail_today: 'केवळ आज उपलब्ध',
    filter_price_range: 'कमाल सुरुवातीचा दर',
    filter_reset: 'फिल्टर काढा',
    filter_showing: 'दर्शवित आहे',
    filter_providers: 'पडताळणी केलेले सेवादार',

    // Provider Card
    card_trust_score: 'ट्रस्ट स्कोअर',
    card_verified: 'पडताळलेला सेवादार',
    card_completed_jobs: 'कामे पूर्ण',
    card_starting_from: 'किमान दर',
    card_view_profile: 'प्रोफाइल पहा',
    card_book_now: 'सेवा बुक करा',
    card_available: 'आज उपलब्ध',
    card_km_away: 'किमी अंतरावर',

    // Provider Profile
    prof_about: 'कारागिराबद्दल माहिती',
    prof_services_pricing: 'सेवा आणि पारदर्शक दर',
    prof_work_history: 'पडताळलेला कामाचा इतिहास',
    prof_reviews: 'ग्राहकांचे अभिप्राय',
    prof_trust_breakdown: 'ट्रस्ट स्कोअर विश्लेषण',
    prof_member_id: 'सहकारी सदस्य आयडी',
    prof_experience: 'अनुभव',
    prof_direct_book: 'संरक्षित बुकिंग करा',
    prof_coop_badge: 'पडताळलेला कूपसर्व्ह सहकारी सदस्य',

    // Common
    common_loading: 'माहिती लोड होत आहे...',
    common_guarantee: 'कूपसर्व्ह सुरक्षा: ९०% थेट कामगाराला, १००% सुरक्षित',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('coopserve_lang') || 'en');

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('coopserve_lang', lang);
    }
  };

  const t = (key, defaultText) => {
    return translations[language]?.[key] || translations['en']?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: [
      { code: 'en', label: 'English', flag: '🇬🇧' },
      { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
      { code: 'mr', label: 'मराठी', flag: '🇮🇳' }
    ] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
