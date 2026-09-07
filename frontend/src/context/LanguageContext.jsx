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
  },
  gu: {
    nav_dashboard: 'ડેશબોર્ડ',
    nav_services: 'સેવા બુક કરો',
    nav_bookings: 'મારી બુકિંગ',
    nav_cooperative: 'સહકારી હબ',
    nav_switch_role: 'ભૂમિકા બદલો',
    nav_notifications: 'સૂચનાઓ',
    nav_profile: 'મારી પ્રોફાઇલ',
    nav_logout: 'લૉગ આઉટ',
    dash_welcome: 'ફરી સ્વાગત છે',
    dash_banner_sub: 'ઉચિત ભાવ અને સુરક્ષિત બુકિંગ સાથે ચકાસાયેલ સ્થાનિક વ્યાવસાયિકો શોધો.',
    dash_search_placeholder: 'પ્લમ્બિંગ, ઇલેક્ટ્રિક, સફાઈ, સુથારી શોધો...',
    dash_popular_title: 'લોકપ્રિય સેવાઓ',
    dash_popular_sub: 'ચકાસાયેલ સહકારી કારીગરો સાથે પારદર્શક ભાવ',
    dash_nearby_title: 'નજીકના સહકારી સેવા પ્રદાતાઓ',
    dash_nearby_sub: 'તમારા વિસ્તારના ચકાસાયેલ ટેકનિશ્યનો',
    dash_recommended_title: 'AI ભલામણ',
    dash_stat_protected: 'સુરક્ષિત બુકિંગ',
    dash_stat_points: 'રિવોર્ડ પોઇન્ટ',
    dash_stat_trust: 'ચકાસાયેલ કામ ઇતિહાસ',
    dash_stat_rating: 'સરેરાશ રેટિંગ',
    dash_active_booking: 'સક્રિય બુકિંગ',
    dash_view_details: 'વિગતો જુઓ',
    dash_explore_services: 'સેવાઓ શોધો',
    dash_see_all: 'બધું જુઓ',
    filter_all_categories: 'બધી શ્રેણીઓ',
    filter_search: 'સેવા પ્રદાતા શોધો...',
    filter_sort_by: 'ક્રમ',
    filter_sort_relevance: 'AI સુસંગતતા',
    filter_sort_rating: 'સૌથી વધુ રેટિંગ',
    filter_sort_distance: 'સૌથી નજીક',
    filter_sort_price_low: 'ભાવ: ઓછો',
    filter_sort_trust: 'સૌથી વધુ ટ્રસ્ટ',
    filter_rating: 'ન્યૂનતમ રેટિંગ',
    filter_availability: 'ઉપલબ્ધતા',
    filter_avail_today: 'માત્ર આજે',
    filter_price_range: 'મહત્તમ ભાવ',
    filter_reset: 'ફિલ્ટર હટાવો',
    filter_showing: 'બતાવી રહ્યા છે',
    filter_providers: 'ચકાસાયેલ પ્રદાતા',
    card_trust_score: 'ટ્રસ્ટ સ્કોર',
    card_verified: 'ચકાસાયેલ પ્રદાતા',
    card_completed_jobs: 'કામ પૂર્ણ',
    card_starting_from: 'ભાવ શરૂ',
    card_view_profile: 'પ્રોફાઇલ જુઓ',
    card_book_now: 'સેવા બુક કરો',
    card_available: 'આજે ઉપલબ્ધ',
    card_km_away: 'કિ.મી. દૂર',
    prof_about: 'ટેકનિશ્યન વિશે',
    prof_services_pricing: 'સેવાઓ અને ભાવ',
    prof_work_history: 'ચકાસાયેલ કામ ઇતિહાસ',
    prof_reviews: 'ગ્રાહક સમીક્ષાઓ',
    prof_trust_breakdown: 'ટ્રસ્ટ સ્કોર',
    prof_member_id: 'સહકારી સભ્ય ID',
    prof_experience: 'અનુભવ',
    prof_direct_book: 'સુરક્ષિત બુકિંગ',
    prof_coop_badge: 'ચકાસાયેલ સહકારી સભ્ય',
    common_loading: 'લોડ થઈ રહ્યું છે...',
    common_guarantee: 'CoopServe સુરક્ષા: 90% સીધા કામદારને, 100% ગેરંટી',
  },
  ta: {
    nav_dashboard: 'டாஷ்போர்டு',
    nav_services: 'சேவை பதிவு',
    nav_bookings: 'என் பதிவுகள்',
    nav_cooperative: 'கூட்டுறவு மையம்',
    nav_switch_role: 'பங்கை மாற்று',
    nav_notifications: 'அறிவிப்புகள்',
    nav_profile: 'என் சுயவிவரம்',
    nav_logout: 'வெளியேறு',
    dash_welcome: 'மீண்டும் வரவேற்கிறோம்',
    dash_banner_sub: 'நியாயமான விலையில் சரிபார்க்கப்பட்ட தொழிலாளர்களை கண்டறியுங்கள்.',
    dash_search_placeholder: 'பிளம்பர், மின்சாரம், சுத்தம், தச்சர் தேடு...',
    dash_popular_title: 'பிரபலமான சேவைகள்',
    dash_popular_sub: 'கூட்டுறவு தொழிலாளர்களுடன் வெளிப்படையான விலை',
    dash_nearby_title: 'அருகில் உள்ள சேவையாளர்கள்',
    dash_nearby_sub: 'சரிபார்க்கப்பட்ட உள்ளூர் தொழில்நுட்ப வல்லுனர்கள்',
    dash_recommended_title: 'AI பரிந்துரை',
    dash_stat_protected: 'பாதுகாக்கப்பட்ட பதிவுகள்',
    dash_stat_points: 'வெகுமதி புள்ளிகள்',
    dash_stat_trust: 'சரிபார்க்கப்பட்ட வேலை வரலாறு',
    dash_stat_rating: 'சராசரி மதிப்பீடு',
    dash_active_booking: 'செயலில் உள்ள பதிவு',
    dash_view_details: 'விவரங்கள் பார்',
    dash_explore_services: 'சேவைகளை ஆராய்',
    dash_see_all: 'அனைத்தும் பார்',
    filter_all_categories: 'அனைத்து வகைகள்',
    filter_search: 'சேவையாளரை தேடு...',
    filter_sort_by: 'வரிசைப்படுத்து',
    filter_sort_relevance: 'AI பொருத்தம்',
    filter_sort_rating: 'அதிக மதிப்பீடு',
    filter_sort_distance: 'அருகில்',
    filter_sort_price_low: 'விலை: குறைவு',
    filter_sort_trust: 'அதிக நம்பகம்',
    filter_rating: 'குறைந்த மதிப்பீடு',
    filter_availability: 'கிடைக்கும் நேரம்',
    filter_avail_today: 'இன்று மட்டும்',
    filter_price_range: 'அதிகபட்ச விலை',
    filter_reset: 'வடிகட்டியை அழி',
    filter_showing: 'காட்டுகிறோம்',
    filter_providers: 'சரிபார்க்கப்பட்ட சேவையாளர்கள்',
    card_trust_score: 'நம்பகத்தன்மை',
    card_verified: 'சரிபார்க்கப்பட்ட',
    card_completed_jobs: 'முடிந்த வேலைகள்',
    card_starting_from: 'தொடக்க விலை',
    card_view_profile: 'சுயவிவரம் பார்',
    card_book_now: 'சேவை பதிவு',
    card_available: 'இன்று கிடைக்கும்',
    card_km_away: 'கி.மீ தூரத்தில்',
    prof_about: 'தொழிலாளர் பற்றி',
    prof_services_pricing: 'சேவைகள் மற்றும் விலை',
    prof_work_history: 'வேலை வரலாறு',
    prof_reviews: 'வாடிக்கையாளர் மதிப்புரைகள்',
    prof_trust_breakdown: 'நம்பகத்தன்மை பகுப்பாய்வு',
    prof_member_id: 'கூட்டுறவு உறுப்பினர் ID',
    prof_experience: 'அனுபவம்',
    prof_direct_book: 'பாதுகாப்பான பதிவு',
    prof_coop_badge: 'சரிபார்க்கப்பட்ட கூட்டுறவு உறுப்பினர்',
    common_loading: 'ஏற்றுகிறோம்...',
    common_guarantee: 'CoopServe பாதுகாப்பு: 90% நேரடியாக தொழிலாளர்களுக்கு',
  },
  bn: {
    nav_dashboard: 'ড্যাশবোর্ড',
    nav_services: 'সেবা বুক করুন',
    nav_bookings: 'আমার বুকিং',
    nav_cooperative: 'সমবায় হাব',
    nav_switch_role: 'ভূমিকা পরিবর্তন',
    nav_notifications: 'বিজ্ঞপ্তি',
    nav_profile: 'আমার প্রোফাইল',
    nav_logout: 'লগ আউট',
    dash_welcome: 'আবার স্বাগতম',
    dash_banner_sub: 'ন্যায্য মূল্যে যাচাইকৃত স্থানীয় পেশাদার খুঁজুন।',
    dash_search_placeholder: 'প্লাম্বিং, বৈদ্যুতিক, পরিষ্কার, কাঠমিস্ত্রি খুঁজুন...',
    dash_popular_title: 'জনপ্রিয় সেবা',
    dash_popular_sub: 'যাচাইকৃত সমবায় কর্মীদের সাথে স্বচ্ছ মূল্য',
    dash_nearby_title: 'কাছের সমবায় সেবা প্রদানকারী',
    dash_nearby_sub: 'আপনার এলাকার যাচাইকৃত টেকনিশিয়ান',
    dash_recommended_title: 'AI সুপারিশ',
    dash_stat_protected: 'সুরক্ষিত বুকিং',
    dash_stat_points: 'রিওয়ার্ড পয়েন্ট',
    dash_stat_trust: 'যাচাইকৃত কাজের ইতিহাস',
    dash_stat_rating: 'গড় রেটিং',
    dash_active_booking: 'সক্রিয় বুকিং',
    dash_view_details: 'বিস্তারিত দেখুন',
    dash_explore_services: 'সেবা অন্বেষণ',
    dash_see_all: 'সব দেখুন',
    filter_all_categories: 'সব বিভাগ',
    filter_search: 'সেবা প্রদানকারী খুঁজুন...',
    filter_sort_by: 'সাজান',
    filter_sort_relevance: 'AI প্রাসঙ্গিকতা',
    filter_sort_rating: 'সর্বোচ্চ রেটিং',
    filter_sort_distance: 'সবচেয়ে কাছে',
    filter_sort_price_low: 'মূল্য: কম',
    filter_sort_trust: 'সর্বোচ্চ বিশ্বাসযোগ্যতা',
    filter_rating: 'ন্যূনতম রেটিং',
    filter_availability: 'উপলব্ধতা',
    filter_avail_today: 'শুধু আজ',
    filter_price_range: 'সর্বোচ্চ মূল্য',
    filter_reset: 'ফিল্টার মুছুন',
    filter_showing: 'দেখাচ্ছি',
    filter_providers: 'যাচাইকৃত প্রদানকারী',
    card_trust_score: 'বিশ্বাস স্কোর',
    card_verified: 'যাচাইকৃত',
    card_completed_jobs: 'সম্পন্ন কাজ',
    card_starting_from: 'শুরুর মূল্য',
    card_view_profile: 'প্রোফাইল দেখুন',
    card_book_now: 'সেবা বুক করুন',
    card_available: 'আজ উপলব্ধ',
    card_km_away: 'কি.মি. দূরে',
    prof_about: 'টেকনিশিয়ান সম্পর্কে',
    prof_services_pricing: 'সেবা ও মূল্য',
    prof_work_history: 'কাজের ইতিহাস',
    prof_reviews: 'গ্রাহক পর্যালোচনা',
    prof_trust_breakdown: 'বিশ্বাস স্কোর বিশ্লেষণ',
    prof_member_id: 'সমবায় সদস্য ID',
    prof_experience: 'অভিজ্ঞতা',
    prof_direct_book: 'সুরক্ষিত বুকিং',
    prof_coop_badge: 'যাচাইকৃত সমবায় সদস্য',
    common_loading: 'লোড হচ্ছে...',
    common_guarantee: 'CoopServe সুরক্ষা: 90% সরাসরি শ্রমিকদের কাছে',
  },
  te: {
    nav_dashboard: 'డాష్‌బోర్డ్',
    nav_services: 'సేవ బుక్ చేయి',
    nav_bookings: 'నా బుకింగ్‌లు',
    nav_cooperative: 'సహకార కేంద్రం',
    nav_switch_role: 'పాత్ర మార్చు',
    nav_notifications: 'నోటిఫికేషన్‌లు',
    nav_profile: 'నా ప్రొఫైల్',
    nav_logout: 'లాగ్ అవుట్',
    dash_welcome: 'తిరిగి స్వాగతం',
    dash_banner_sub: 'న్యాయమైన ధరకు ధృవీకరించబడిన స్థానిక నిపుణులను కనుగొనండి.',
    dash_search_placeholder: 'ప్లంబింగ్, విద్యుత్, శుభ్రత, వడ్రంగి వెతుకు...',
    dash_popular_title: 'ప్రసిద్ధ సేవలు',
    dash_popular_sub: 'ధృవీకరించబడిన సహకార కార్మికులతో పారదర్శక ధర',
    dash_nearby_title: 'సమీప సహకార సేవా ప్రదాతలు',
    dash_nearby_sub: 'ధృవీకరించబడిన స్థానిక సాంకేతిక నిపుణులు',
    dash_recommended_title: 'AI సిఫారసు',
    dash_stat_protected: 'రక్షిత బుకింగ్‌లు',
    dash_stat_points: 'రివార్డ్ పాయింట్లు',
    dash_stat_trust: 'ధృవీకరించబడిన పని చరిత్ర',
    dash_stat_rating: 'సగటు రేటింగ్',
    dash_active_booking: 'క్రియాశీల బుకింగ్',
    dash_view_details: 'వివరాలు చూడండి',
    dash_explore_services: 'సేవలు అన్వేషించు',
    dash_see_all: 'అన్నీ చూడు',
    filter_all_categories: 'అన్ని వర్గాలు',
    filter_search: 'సేవా ప్రదాత వెతుకు...',
    filter_sort_by: 'క్రమబద్ధం',
    filter_sort_relevance: 'AI సంబంధం',
    filter_sort_rating: 'అత్యధిక రేటింగ్',
    filter_sort_distance: 'సమీపస్థం',
    filter_sort_price_low: 'ధర: తక్కువ',
    filter_sort_trust: 'అత్యధిక నమ్మకం',
    filter_rating: 'కనీస రేటింగ్',
    filter_availability: 'అందుబాటు',
    filter_avail_today: 'నేడు మాత్రమే',
    filter_price_range: 'గరిష్ట ధర',
    filter_reset: 'ఫిల్టర్ తొలగించు',
    filter_showing: 'చూపిస్తున్నాము',
    filter_providers: 'ధృవీకరించబడిన ప్రదాతలు',
    card_trust_score: 'నమ్మక స్కోరు',
    card_verified: 'ధృవీకరించబడిన',
    card_completed_jobs: 'పూర్తైన పనులు',
    card_starting_from: 'ప్రారంభ ధర',
    card_view_profile: 'ప్రొఫైల్ చూడు',
    card_book_now: 'సేవ బుక్ చేయి',
    card_available: 'నేడు అందుబాటులో',
    card_km_away: 'కి.మీ దూరంలో',
    prof_about: 'సాంకేతిక నిపుణుడి గురించి',
    prof_services_pricing: 'సేవలు మరియు ధర',
    prof_work_history: 'పని చరిత్ర',
    prof_reviews: 'కస్టమర్ సమీక్షలు',
    prof_trust_breakdown: 'నమ్మక స్కోరు విశ్లేషణ',
    prof_member_id: 'సహకార సభ్య ID',
    prof_experience: 'అనుభవం',
    prof_direct_book: 'రక్షిత బుకింగ్',
    prof_coop_badge: 'ధృవీకరించబడిన సహకార సభ్యుడు',
    common_loading: 'లోడ్ అవుతోంది...',
    common_guarantee: 'CoopServe రక్షణ: 90% నేరుగా కార్మికులకు',
  },
  kn: {
    nav_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    nav_services: 'ಸೇವೆ ಬುಕ್ ಮಾಡಿ',
    nav_bookings: 'ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು',
    nav_cooperative: 'ಸಹಕಾರ ಕೇಂದ್ರ',
    nav_switch_role: 'ಪಾತ್ರ ಬದಲಿಸಿ',
    nav_notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    nav_profile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    nav_logout: 'ಲಾಗ್ ಔಟ್',
    dash_welcome: 'ಮತ್ತೆ ಸ್ವಾಗತ',
    dash_banner_sub: 'ನ್ಯಾಯಯುತ ಧರದಲ್ಲಿ ಪರಿಶೀಲಿಸಿದ ಸ್ಥಳೀಯ ವೃತ್ತಿಪರರನ್ನು ಹುಡುಕಿ.',
    dash_search_placeholder: 'ಪ್ಲಂಬಿಂಗ್, ವಿದ್ಯುತ್, ಸ್ವಚ್ಛತೆ, ಬಡಗಿ ಹುಡುಕಿ...',
    dash_popular_title: 'ಜನಪ್ರಿಯ ಸೇವೆಗಳು',
    dash_popular_sub: 'ಪರಿಶೀಲಿತ ಸಹಕಾರ ಕಾರ್ಮಿಕರೊಂದಿಗೆ ಪಾರದರ್ಶಕ ಧರ',
    dash_nearby_title: 'ಹತ್ತಿರದ ಸಹಕಾರ ಸೇವಾ ಪೂರೈಕೆದಾರರು',
    dash_nearby_sub: 'ಪರಿಶೀಲಿತ ಸ್ಥಳೀಯ ತಂತ್ರಜ್ಞರು',
    dash_recommended_title: 'AI ಶಿಫಾರಸು',
    dash_stat_protected: 'ಸಂರಕ್ಷಿತ ಬುಕಿಂಗ್‌ಗಳು',
    dash_stat_points: 'ರಿವಾರ್ಡ್ ಪಾಯಿಂಟ್‌ಗಳು',
    dash_stat_trust: 'ಪರಿಶೀಲಿತ ಕಾರ್ಯ ಇತಿಹಾಸ',
    dash_stat_rating: 'ಸರಾಸರಿ ರೇಟಿಂಗ್',
    dash_active_booking: 'ಸಕ್ರಿಯ ಬುಕಿಂಗ್',
    dash_view_details: 'ವಿವರಗಳು ನೋಡಿ',
    dash_explore_services: 'ಸೇವೆಗಳು ಅನ್ವೇಷಿಸಿ',
    dash_see_all: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
    filter_all_categories: 'ಎಲ್ಲಾ ವರ್ಗಗಳು',
    filter_search: 'ಸೇವಾ ಪೂರೈಕೆದಾರ ಹುಡುಕಿ...',
    filter_sort_by: 'ವರ್ಗೀಕರಿಸಿ',
    filter_sort_relevance: 'AI ಸಂಬಂಧ',
    filter_sort_rating: 'ಅತ್ಯಧಿಕ ರೇಟಿಂಗ್',
    filter_sort_distance: 'ಹತ್ತಿರ',
    filter_sort_price_low: 'ಧರ: ಕಡಿಮೆ',
    filter_sort_trust: 'ಅತ್ಯಧಿಕ ವಿಶ್ವಾಸ',
    filter_rating: 'ಕನಿಷ್ಠ ರೇಟಿಂಗ್',
    filter_availability: 'ಲಭ್ಯತೆ',
    filter_avail_today: 'ಇಂದು ಮಾತ್ರ',
    filter_price_range: 'ಗರಿಷ್ಠ ಧರ',
    filter_reset: 'ಫಿಲ್ಟರ್ ತೆಗೆದುಹಾಕಿ',
    filter_showing: 'ತೋರಿಸುತ್ತಿದ್ದೇವೆ',
    filter_providers: 'ಪರಿಶೀಲಿತ ಪೂರೈಕೆದಾರರು',
    card_trust_score: 'ವಿಶ್ವಾಸ ಸ್ಕೋರ್',
    card_verified: 'ಪರಿಶೀಲಿತ',
    card_completed_jobs: 'ಪೂರ್ಣಗೊಂಡ ಕೆಲಸ',
    card_starting_from: 'ಪ್ರಾರಂಭ ಧರ',
    card_view_profile: 'ಪ್ರೊಫೈಲ್ ನೋಡಿ',
    card_book_now: 'ಸೇವೆ ಬುಕ್ ಮಾಡಿ',
    card_available: 'ಇಂದು ಲಭ್ಯ',
    card_km_away: 'ಕಿ.ಮೀ ದೂರ',
    prof_about: 'ತಂತ್ರಜ್ಞನ ಬಗ್ಗೆ',
    prof_services_pricing: 'ಸೇವೆಗಳು ಮತ್ತು ಧರ',
    prof_work_history: 'ಕಾರ್ಯ ಇತಿಹಾಸ',
    prof_reviews: 'ಗ್ರಾಹಕ ವಿಮರ್ಶೆಗಳು',
    prof_trust_breakdown: 'ವಿಶ್ವಾಸ ಸ್ಕೋರ್ ವಿಶ್ಲೇಷಣೆ',
    prof_member_id: 'ಸಹಕಾರ ಸದಸ್ಯ ID',
    prof_experience: 'ಅನುಭವ',
    prof_direct_book: 'ಸಂರಕ್ಷಿತ ಬುಕಿಂಗ್',
    prof_coop_badge: 'ಪರಿಶೀಲಿತ ಸಹಕಾರ ಸದಸ್ಯ',
    common_loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    common_guarantee: 'CoopServe ಸಂರಕ್ಷಣೆ: 90% ನೇರವಾಗಿ ಕಾರ್ಮಿಕರಿಗೆ',
  }
};

const customerBookingTranslations = {
  en: {
    booking_title: 'Book Protected Service', booking_confirmed: 'Booking Confirmed', booking_step_service: 'Service', booking_step_schedule: 'Schedule & Location', booking_step_breakdown: 'Protected Breakdown', booking_step_payment: 'Payment', booking_continue: 'Continue to Schedule', booking_back: 'Back', booking_date: 'Appointment Date', booking_time: 'Preferred Time Slot', booking_address: 'Service Address', booking_address_placeholder: 'Enter your complete service address', booking_notes: 'Service Notes & Instructions (Optional)', booking_notes_placeholder: 'Add any instructions for the provider', booking_review_price: 'Review Protected Price', booking_total: 'Total Booking Amount', booking_upfront: 'Upfront Payable Now (25%)', booking_remaining: 'Remaining Balance (75%)', booking_proceed_payment: 'Proceed to Payment', booking_slot_unavailable: 'This time slot is no longer available. Please choose another slot.', booking_slots_loading: 'Loading available slots...', booking_slots_full: 'All slots are booked for this date.', booking_payment_gateway: 'Payment Gateway', booking_pay_now: 'Pay Upfront via Razorpay', booking_receipt: 'Digital Receipt', booking_view_bookings: 'View All Bookings', booking_track: 'Track Live Service Status', payment_submitted: 'Payment submitted. Awaiting verification.', payment_pending: 'Payment verification pending', payment_confirmed: 'Payment confirmed', cancellation_title: 'Cancel Protected Booking?', cancellation_message: 'A 10% cancellation charge is deducted from the 25% upfront payment. The remaining 15% is refunded.', cancellation_total: 'Original Booking Amount', cancellation_paid: 'Amount Paid (25% upfront)', cancellation_charge: 'Cancellation Charge (10% of paid amount)', cancellation_refund: 'Refund Amount (15% of original booking amount)', cancellation_reason: 'Reason for Cancellation', cancellation_keep: 'Keep Protected Booking', cancellation_confirm: 'Confirm Cancellation', cancellation_notice: '10% cancellation charge applies; the remaining 15% of the upfront payment is refunded.', cancelled: 'Booking cancelled', status_completed: 'Completed', status_cancelled: 'Cancelled by Customer', status_declined: 'Declined by Provider', status_in_progress: 'In Progress', status_arrived: 'Arrived at Site', status_on_way: 'On The Way', status_accepted: 'Provider Accepted', status_confirmed: 'Order Confirmed'
  },
  hi: {
    booking_title: 'सुरक्षित सेवा बुक करें', booking_confirmed: 'बुकिंग की पुष्टि', booking_step_service: 'सेवा', booking_step_schedule: 'समय और स्थान', booking_step_breakdown: 'सुरक्षित मूल्य विवरण', booking_step_payment: 'भुगतान', booking_continue: 'समय चुनें', booking_back: 'वापस', booking_date: 'सेवा की तारीख', booking_time: 'पसंदीदा समय', booking_address: 'सेवा का पता', booking_address_placeholder: 'पूरा सेवा पता दर्ज करें', booking_notes: 'सेवा निर्देश (वैकल्पिक)', booking_notes_placeholder: 'प्रदाता के लिए निर्देश लिखें', booking_review_price: 'सुरक्षित मूल्य देखें', booking_total: 'कुल बुकिंग राशि', booking_upfront: 'अग्रिम भुगतान (25%)', booking_remaining: 'शेष राशि (75%)', booking_proceed_payment: 'भुगतान पर जाएं', booking_slot_unavailable: 'यह समय स्लॉट उपलब्ध नहीं है। दूसरा स्लॉट चुनें।', booking_slots_loading: 'उपलब्ध स्लॉट लोड हो रहे हैं...', booking_slots_full: 'इस तारीख के सभी स्लॉट बुक हैं।', booking_payment_gateway: 'भुगतान गेटवे', booking_pay_now: 'Razorpay से अग्रिम भुगतान करें', booking_receipt: 'डिजिटल रसीद', booking_view_bookings: 'सभी बुकिंग देखें', booking_track: 'सेवा की स्थिति देखें', payment_submitted: 'भुगतान भेज दिया गया है। पुष्टि की प्रतीक्षा है।', payment_pending: 'भुगतान पुष्टि लंबित है', payment_confirmed: 'भुगतान की पुष्टि हो गई', cancellation_title: 'सुरक्षित बुकिंग रद्द करें?', cancellation_message: '25% अग्रिम भुगतान में से 10% रद्दीकरण शुल्क कटेगा। शेष 15% वापस किया जाएगा।', cancellation_total: 'मूल बुकिंग राशि', cancellation_paid: 'भुगतान राशि (25% अग्रिम)', cancellation_charge: 'रद्दीकरण शुल्क (भुगतान राशि का 10%)', cancellation_refund: 'वापसी राशि (मूल राशि का 15%)', cancellation_reason: 'रद्दीकरण का कारण', cancellation_keep: 'बुकिंग रखें', cancellation_confirm: 'रद्दीकरण की पुष्टि करें', cancellation_notice: '10% रद्दीकरण शुल्क लागू है; अग्रिम भुगतान का शेष 15% वापस किया जाएगा।', cancelled: 'बुकिंग रद्द की गई', status_completed: 'पूर्ण', status_cancelled: 'ग्राहक द्वारा रद्द', status_declined: 'प्रदाता ने अस्वीकार किया', status_in_progress: 'सेवा जारी है', status_arrived: 'स्थान पर पहुंच गया', status_on_way: 'रास्ते में', status_accepted: 'प्रदाता ने स्वीकार किया', status_confirmed: 'ऑर्डर की पुष्टि'
  },
  mr: {
    booking_title: 'सुरक्षित सेवा बुक करा', booking_confirmed: 'बुकिंग निश्चित झाली', booking_step_service: 'सेवा', booking_step_schedule: 'वेळ आणि ठिकाण', booking_step_breakdown: 'सुरक्षित किंमत', booking_step_payment: 'पेमेंट', booking_continue: 'वेळ निवडा', booking_back: 'मागे', booking_date: 'सेवेची तारीख', booking_time: 'पसंतीची वेळ', booking_address: 'सेवेचा पत्ता', booking_address_placeholder: 'पूर्ण सेवा पत्ता लिहा', booking_notes: 'सेवा सूचना (ऐच्छिक)', booking_notes_placeholder: 'सेवादारासाठी सूचना लिहा', booking_review_price: 'सुरक्षित किंमत पहा', booking_total: 'एकूण बुकिंग रक्कम', booking_upfront: 'आगाऊ रक्कम (25%)', booking_remaining: 'शिल्लक रक्कम (75%)', booking_proceed_payment: 'पेमेंटकडे जा', booking_slot_unavailable: 'हा वेळ उपलब्ध नाही. दुसरी वेळ निवडा.', booking_slots_loading: 'उपलब्ध वेळा लोड होत आहेत...', booking_slots_full: 'या तारखेच्या सर्व वेळा बुक आहेत.', booking_payment_gateway: 'पेमेंट गेटवे', booking_pay_now: 'Razorpay द्वारे आगाऊ भरा', booking_receipt: 'डिजिटल पावती', booking_view_bookings: 'सर्व बुकिंग पहा', booking_track: 'सेवेची स्थिती पहा', payment_submitted: 'पेमेंट पाठवले. पुष्टीची प्रतीक्षा आहे.', payment_pending: 'पेमेंट पुष्टी प्रलंबित', payment_confirmed: 'पेमेंट निश्चित झाले', cancellation_title: 'सुरक्षित बुकिंग रद्द करायचे?', cancellation_message: '25% आगाऊ रकमेपैकी 10% रद्दीकरण शुल्क वजा होईल. उर्वरित 15% परत मिळेल.', cancellation_total: 'मूळ बुकिंग रक्कम', cancellation_paid: 'भरलेली रक्कम (25% आगाऊ)', cancellation_charge: 'रद्दीकरण शुल्क (भरलेल्या रकमेचे 10%)', cancellation_refund: 'परतावा (मूळ रकमेचे 15%)', cancellation_reason: 'रद्दीकरणाचे कारण', cancellation_keep: 'बुकिंग ठेवा', cancellation_confirm: 'रद्दीकरण निश्चित करा', cancellation_notice: '10% रद्दीकरण शुल्क लागू आहे; आगाऊ रकमेपैकी उर्वरित 15% परत मिळेल.', cancelled: 'बुकिंग रद्द झाले', status_completed: 'पूर्ण', status_cancelled: 'ग्राहकाने रद्द केले', status_declined: 'सेवादाराने नाकारले', status_in_progress: 'सेवा सुरू आहे', status_arrived: 'ठिकाणी पोहोचले', status_on_way: 'मार्गावर', status_accepted: 'सेवादाराने स्वीकारले', status_confirmed: 'ऑर्डर निश्चित'
  },
  gu: {
    booking_title: 'સુરક્ષિત સેવા બુક કરો', booking_confirmed: 'બુકિંગની પુષ્ટિ', booking_step_service: 'સેવા', booking_step_schedule: 'સમય અને સ્થળ', booking_step_breakdown: 'સુરક્ષિત કિંમત', booking_step_payment: 'ચુકવણી', booking_continue: 'સમય પસંદ કરો', booking_back: 'પાછા', booking_date: 'સેવાની તારીખ', booking_time: 'પસંદગીનો સમય', booking_address: 'સેવાનું સરનામું', booking_address_placeholder: 'પૂરું સરનામું દાખલ કરો', booking_notes: 'સેવા સૂચનાઓ (વૈકલ્પિક)', booking_notes_placeholder: 'પ્રદાતા માટે સૂચના લખો', booking_review_price: 'સુરક્ષિત કિંમત જુઓ', booking_total: 'કુલ બુકિંગ રકમ', booking_upfront: 'આગોતરી ચુકવણી (25%)', booking_remaining: 'બાકી રકમ (75%)', booking_proceed_payment: 'ચુકવણી પર જાઓ', booking_slot_unavailable: 'આ સમય ઉપલબ્ધ નથી. બીજો સમય પસંદ કરો.', booking_slots_loading: 'ઉપલબ્ધ સમય લોડ થઈ રહ્યા છે...', booking_slots_full: 'આ તારીખના બધા સમય બુક છે.', booking_payment_gateway: 'ચુકવણી ગેટવે', booking_pay_now: 'Razorpay દ્વારા આગોતરી ચુકવણી', booking_receipt: 'ડિજિટલ રસીદ', booking_view_bookings: 'બધી બુકિંગ જુઓ', booking_track: 'સેવાની સ્થિતિ જુઓ', payment_submitted: 'ચુકવણી મોકલાઈ. પુષ્ટિની રાહ છે.', payment_pending: 'ચુકવણી પુષ્ટિ બાકી', payment_confirmed: 'ચુકવણીની પુષ્ટિ થઈ', cancellation_title: 'સુરક્ષિત બુકિંગ રદ કરવું?', cancellation_message: '25% આગોતરી રકમમાંથી 10% રદ ચાર્જ કપાશે. બાકીની 15% પરત મળશે.', cancellation_total: 'મૂળ બુકિંગ રકમ', cancellation_paid: 'ચૂકવેલી રકમ (25% આગોતરી)', cancellation_charge: 'રદ ચાર્જ (ચૂકવેલી રકમના 10%)', cancellation_refund: 'રિફંડ (મૂળ રકમના 15%)', cancellation_reason: 'રદ કરવાનું કારણ', cancellation_keep: 'બુકિંગ રાખો', cancellation_confirm: 'રદ કરવાની પુષ્ટિ', cancellation_notice: '10% રદ ચાર્જ લાગુ છે; આગોતરી રકમમાંથી 15% પરત મળશે.', cancelled: 'બુકિંગ રદ થયું', status_completed: 'પૂર્ણ', status_cancelled: 'ગ્રાહકે રદ કર્યું', status_declined: 'પ્રદાતાએ નકાર્યું', status_in_progress: 'સેવા ચાલુ', status_arrived: 'સ્થળે પહોંચ્યા', status_on_way: 'રસ્તામાં', status_accepted: 'પ્રદાતાએ સ્વીકાર્યું', status_confirmed: 'ઓર્ડરની પુષ્ટિ'
  }
};

Object.entries(customerBookingTranslations).forEach(([language, values]) => {
  Object.assign(translations[language], values);
});

const customerUiTranslations = {
  en: {
    auth_cooperative: 'Cooperative', auth_platform_tagline: 'Gig Services Platform', auth_sign_in: 'Sign In', auth_email: 'Email Address', auth_password: 'Password', auth_forgot_password: 'Forgot password?', auth_sign_in_button: 'Sign In to Platform', auth_new_member: 'New to CoopServe?', auth_create_account: 'Create new account', auth_login_failed: 'Login failed', auth_join_cooperative: 'Join the cooperative', auth_create_account_title: 'Create Account', auth_registration_subtitle: 'Join the cooperative in under 2 minutes', auth_role_prompt: 'I am a...', auth_customer_role: 'Household Customer', auth_provider_role: 'Service Worker / Pro', auth_full_name: 'Full Name', auth_mobile: 'Mobile Number', auth_password_placeholder: 'Min 8 chars, 1 letter, 1 number', auth_service_location: 'Service Location', auth_use_location: 'Use my location', auth_locating: 'Locating...', auth_gps_captured: 'GPS Captured', auth_gps_unavailable: 'GPS Unavailable', auth_state: 'State', auth_select_state: 'Select State', auth_city: 'City', auth_city_placeholder: 'Enter your city', auth_neighbourhood: 'Neighbourhood', auth_primary_skill: 'Primary Trade / Skill', auth_complete_registration: 'Complete Registration & Join', auth_existing_account: 'Already have an account?', auth_registration_failed: 'Registration failed. Please try again.', validation_full_name_required: 'Full name is required.', validation_email_required: 'Email address is required.', validation_email_invalid: 'Enter a valid email address.', validation_phone_required: 'Phone number is required.', validation_phone_invalid: 'Enter a valid Indian mobile number.', validation_password_required: 'Password is required.', validation_password_length: 'Password must be at least 8 characters.', validation_password_requirements: 'Password must contain at least one letter and one number.', validation_neighbourhood_required: 'Please select a neighbourhood.', validation_skill_required: 'Please specify your trade or skill.', common_server_error: 'Error communicating with server.', profile_loading: 'Loading your profile and reward wallet...', profile_customer_title: 'My Customer Profile & Rewards', profile_customer_description: 'Manage your account, saved addresses, and cooperative benefits.', profile_points: 'Cooperative Points', profile_points_description: 'Earned from verified bookings.', profile_saved_addresses: 'Saved Addresses', common_default: 'Default', profile_account_information: 'Account Information', profile_phone: 'Phone Number', profile_email_locked: 'Email cannot be modified.', profile_save_changes: 'Save Profile Changes', notifications_description: 'Stay updated with service timings, rewards, and verified receipts.', notifications_unread: 'Unread', notifications_all_caught_up: 'All Caught Up', notifications_empty_title: 'No notifications right now', notifications_empty_description: 'Alerts about your service will appear here.', notifications_mark_read: 'Mark Read', notifications_marked_read: 'Notification marked as read', notifications_update_failed: 'Failed to update notification', bookings_filter_all: 'All Bookings', bookings_filter_active: 'Active / In Progress', bookings_filter_completed: 'Completed History', bookings_filter_declined: 'Declined / Cancelled', bookings_loading: 'Loading your service orders...', bookings_empty_title: 'No bookings found in this view', bookings_empty_description: 'Book a verified professional with Protected Booking.', bookings_book_service: 'Book a Service Now', common_coop_protected: 'CoopServe Protected', booking_assigned_provider: 'Assigned Provider', booking_protected_total: 'Protected Total', booking_rematch: 'Find Another Provider', booking_view_receipt: 'View Details & Receipt', nav_home: 'Home', nav_providers: 'Providers', nav_change_language: 'Change language', role_customer: 'Customer', profile_signed_in_as: 'Signed in as', profile_location_unset: 'Location not set', nav_verified_providers: 'Verified Providers', layout_portal_view: 'Portal View', common_guarantee_title: 'CoopServe Guarantee', common_guarantee_description: 'Protected bookings and transparent fees.', common_processing: 'Processing...', common_no_items: 'No items found', common_no_active_records: 'No active records', common_user_avatar: 'User avatar', common_verified_provider: 'Verified CoopServe Provider', common_reviews: 'reviews', common_rating: 'Rating', common_today: 'Today', category_verified_providers: 'Verified Providers', common_from_price: 'From', card_years_experience: 'yrs experience', filter_all_ratings: 'All Ratings', filter_rating_above: '{value} and above', payment_protected_receipt: 'Protected Receipt', payment_paid: 'PAID', payment_failed: 'PAYMENT FAILED', payment_base_price: 'Base Service Price', payment_travel_fee: 'Travel Fee', payment_extra_charges: 'Extra Charges', payment_total_paid: 'Total Amount Paid', payment_worker_earnings: 'Worker Earnings', payment_platform_operations: 'Platform Operations', payment_transaction_id: 'Transaction ID', payment_method: 'Method', payment_pay_via_razorpay: 'Pay via Razorpay', payment_download_receipt: 'Download PDF Receipt', booking_cancel_service: 'Cancel Service Booking', common_calling: 'Calling', booking_id_label: 'ID', booking_status_label: 'Status'
  },
  hi: {
    auth_cooperative: 'सहकारी', auth_platform_tagline: 'गीग सेवा मंच', auth_sign_in: 'साइन इन', auth_email: 'ईमेल पता', auth_password: 'पासवर्ड', auth_forgot_password: 'पासवर्ड भूल गए?', auth_sign_in_button: 'मंच पर साइन इन करें', auth_new_member: 'CoopServe में नए हैं?', auth_create_account: 'नया खाता बनाएं', auth_login_failed: 'साइन इन विफल', auth_join_cooperative: 'सहकारी से जुड़ें', auth_create_account_title: 'खाता बनाएं', auth_registration_subtitle: '2 मिनट से कम में सहकारी से जुड़ें', auth_role_prompt: 'मैं हूं...', auth_customer_role: 'घरेलू ग्राहक', auth_provider_role: 'सेवा कर्मचारी / विशेषज्ञ', auth_full_name: 'पूरा नाम', auth_mobile: 'मोबाइल नंबर', auth_password_placeholder: 'कम से कम 8 अक्षर, 1 अक्षर और 1 अंक', auth_service_location: 'सेवा स्थान', auth_use_location: 'मेरा स्थान उपयोग करें', auth_locating: 'स्थान खोज रहे हैं...', auth_gps_captured: 'GPS मिल गया', auth_gps_unavailable: 'GPS उपलब्ध नहीं', auth_state: 'राज्य', auth_select_state: 'राज्य चुनें', auth_city: 'शहर', auth_city_placeholder: 'अपना शहर दर्ज करें', auth_neighbourhood: 'इलाका', auth_primary_skill: 'मुख्य कौशल', auth_complete_registration: 'पंजीकरण पूरा करें', auth_existing_account: 'पहले से खाता है?', auth_registration_failed: 'पंजीकरण विफल। फिर प्रयास करें।', validation_full_name_required: 'पूरा नाम आवश्यक है।', validation_email_required: 'ईमेल पता आवश्यक है।', validation_email_invalid: 'मान्य ईमेल पता दर्ज करें।', validation_phone_required: 'फोन नंबर आवश्यक है।', validation_phone_invalid: 'मान्य भारतीय मोबाइल नंबर दर्ज करें।', validation_password_required: 'पासवर्ड आवश्यक है।', validation_password_length: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।', validation_password_requirements: 'पासवर्ड में कम से कम एक अक्षर और एक अंक होना चाहिए।', validation_neighbourhood_required: 'इलाका चुनें।', validation_skill_required: 'अपना कौशल बताएं।', common_server_error: 'सर्वर से संपर्क में त्रुटि।', profile_loading: 'प्रोफाइल और रिवार्ड वॉलेट लोड हो रहा है...', profile_customer_title: 'मेरी ग्राहक प्रोफाइल और रिवार्ड्स', profile_customer_description: 'अपना खाता, सहेजे पते और सहकारी लाभ प्रबंधित करें।', profile_points: 'सहकारी अंक', profile_points_description: 'सत्यापित बुकिंग से अर्जित।', profile_saved_addresses: 'सहेजे पते', common_default: 'डिफ़ॉल्ट', profile_account_information: 'खाता जानकारी', profile_phone: 'फोन नंबर', profile_email_locked: 'ईमेल बदला नहीं जा सकता।', profile_save_changes: 'प्रोफाइल बदलाव सहेजें', notifications_description: 'सेवा समय, रिवार्ड्स और सत्यापित रसीदों की जानकारी पाएं।', notifications_unread: 'अपठित', notifications_all_caught_up: 'सब पढ़ लिया गया', notifications_empty_title: 'अभी कोई सूचना नहीं', notifications_empty_description: 'आपकी सेवा से जुड़ी सूचनाएं यहां दिखेंगी।', notifications_mark_read: 'पढ़ा हुआ करें', notifications_marked_read: 'सूचना पढ़ी हुई है', notifications_update_failed: 'सूचना अपडेट नहीं हो सकी', bookings_filter_all: 'सभी बुकिंग', bookings_filter_active: 'सक्रिय / जारी', bookings_filter_completed: 'पूर्ण इतिहास', bookings_filter_declined: 'अस्वीकृत / रद्द', bookings_loading: 'आपकी सेवा बुकिंग लोड हो रही हैं...', bookings_empty_title: 'इस दृश्य में कोई बुकिंग नहीं', bookings_empty_description: 'सुरक्षित बुकिंग के साथ सत्यापित विशेषज्ञ बुक करें।', bookings_book_service: 'अभी सेवा बुक करें', common_coop_protected: 'CoopServe सुरक्षित', booking_assigned_provider: 'नियुक्त प्रदाता', booking_protected_total: 'सुरक्षित कुल', booking_rematch: 'दूसरा प्रदाता खोजें', booking_view_receipt: 'विवरण और रसीद देखें', nav_home: 'होम', nav_providers: 'प्रदाता', nav_change_language: 'भाषा बदलें', role_customer: 'ग्राहक', profile_signed_in_as: 'साइन इन खाता', profile_location_unset: 'स्थान सेट नहीं है', nav_verified_providers: 'सत्यापित प्रदाता', layout_portal_view: 'पोर्टल दृश्य', common_guarantee_title: 'CoopServe गारंटी', common_guarantee_description: 'सुरक्षित बुकिंग और पारदर्शी शुल्क।', common_processing: 'प्रक्रिया जारी...', common_no_items: 'कोई आइटम नहीं', common_no_active_records: 'कोई सक्रिय रिकॉर्ड नहीं', common_user_avatar: 'उपयोगकर्ता चित्र', common_verified_provider: 'सत्यापित CoopServe प्रदाता', common_reviews: 'समीक्षाएं', common_rating: 'रेटिंग', common_today: 'आज', category_verified_providers: 'सत्यापित प्रदाता', common_from_price: 'से', card_years_experience: 'वर्ष अनुभव', filter_all_ratings: 'सभी रेटिंग', filter_rating_above: '{value} या अधिक', payment_protected_receipt: 'सुरक्षित रसीद', payment_paid: 'भुगतान हुआ', payment_failed: 'भुगतान विफल', payment_base_price: 'मूल सेवा मूल्य', payment_travel_fee: 'यात्रा शुल्क', payment_extra_charges: 'अतिरिक्त शुल्क', payment_total_paid: 'कुल भुगतान', payment_worker_earnings: 'कर्मचारी कमाई', payment_platform_operations: 'मंच संचालन', payment_transaction_id: 'लेनदेन आईडी', payment_method: 'तरीका', payment_pay_via_razorpay: 'Razorpay से भुगतान करें', payment_download_receipt: 'PDF रसीद डाउनलोड करें', booking_cancel_service: 'सेवा बुकिंग रद्द करें', common_calling: 'कॉल किया जा रहा है', booking_id_label: 'आईडी', booking_status_label: 'स्थिति'
  }
};

Object.entries(customerUiTranslations).forEach(([language, values]) => {
  Object.assign(translations[language], values);
});

const authHeroTranslations = {
  en: { auth_fair_work: 'Fair work.', auth_direct_livelihoods: 'Direct livelihoods.', auth_hero_description: 'CoopServe replaces exploitative gig algorithms with democratic cooperative ownership. Certified professionals receive fair wages, and customers get guaranteed quality with Protected Bookings.', auth_feature_cooperative: 'Cooperative-owned, not corporate', auth_feature_cooperative_text: 'Members co-govern fee rules, dividend allocations, and trust standards democratically.', auth_feature_ai: 'AI-matched in seconds', auth_feature_ai_text: 'Intelligent proximity and reputation routing without predatory surge pricing.', auth_feature_earnings: 'Transparent 90/10 earnings split', auth_feature_earnings_text: '90% net take-home to local workers with zero hidden deductions.', auth_feature_verified: 'Verified & insured workers', auth_feature_verified_text: 'Every booking includes insurance protection, skill badges, and community feedback.', auth_certified_professionals: 'Certified cooperative professionals', auth_payment_enabled: 'Protected payments enabled', auth_enter_credentials: 'Or enter credentials', auth_email_placeholder: 'Enter your email address', auth_admin_login: 'Administrator Portal Login', auth_create_account_title: 'Create Account' },
  hi: { auth_fair_work: 'न्यायपूर्ण काम।', auth_direct_livelihoods: 'सीधी आजीविका।', auth_hero_description: 'CoopServe शोषणकारी गीग एल्गोरिदम की जगह लोकतांत्रिक सहकारी स्वामित्व देता है। सत्यापित विशेषज्ञों को उचित वेतन और ग्राहकों को सुरक्षित बुकिंग मिलती है।', auth_feature_cooperative: 'सहकारी स्वामित्व, कॉर्पोरेट नहीं', auth_feature_cooperative_text: 'सदस्य शुल्क, लाभांश और भरोसे के मानकों पर लोकतांत्रिक निर्णय लेते हैं।', auth_feature_ai: 'सेकंडों में AI मिलान', auth_feature_ai_text: 'उचित निकटता और प्रतिष्ठा के आधार पर सेवा मिलान।', auth_feature_earnings: 'पारदर्शी 90/10 कमाई विभाजन', auth_feature_earnings_text: 'स्थानीय कर्मचारियों को 90% शुद्ध कमाई और कोई छिपी कटौती नहीं।', auth_feature_verified: 'सत्यापित और बीमित कर्मचारी', auth_feature_verified_text: 'हर बुकिंग में बीमा सुरक्षा, कौशल बैज और सामुदायिक प्रतिक्रिया शामिल है।', auth_certified_professionals: 'सत्यापित सहकारी विशेषज्ञ', auth_payment_enabled: 'सुरक्षित भुगतान सक्षम', auth_enter_credentials: 'या जानकारी दर्ज करें', auth_email_placeholder: 'अपना ईमेल दर्ज करें', auth_admin_login: 'प्रशासक पोर्टल लॉगिन', auth_create_account_title: 'खाता बनाएं' }
};
Object.entries(authHeroTranslations).forEach(([language, values]) => Object.assign(translations[language], values));

const recoveryTranslations = {
  en: { auth_account_recovery: 'Account Recovery', auth_reset_password: 'Reset your password', auth_send_reset_link: 'Send Reset Link', auth_back_sign_in: 'Back to Sign In' },
  hi: { auth_account_recovery: 'खाता पुनर्प्राप्ति', auth_reset_password: 'पासवर्ड रीसेट करें', auth_send_reset_link: 'रीसेट लिंक भेजें', auth_back_sign_in: 'साइन इन पर वापस जाएं' }
};
Object.entries(recoveryTranslations).forEach(([language, values]) => Object.assign(translations[language], values));

const layoutTranslations = {
  en: { role_worker_provider: 'Worker / Provider', role_admin_portal: 'Admin Portal', brand_coop_label: 'Co-op', brand_tagline: 'Fair Cooperative Gig Platform', nav_active_pros: 'Active Cooperative Pros', nav_certified_count: 'Certified', nav_verified_providers: 'Verified Providers', layout_portal_view: 'Portal View' },
  hi: { role_worker_provider: 'कर्मचारी / प्रदाता', role_admin_portal: 'प्रशासक पोर्टल', brand_coop_label: 'सहकारी', brand_tagline: 'न्यायपूर्ण सहकारी गीग मंच', nav_active_pros: 'सक्रिय सहकारी विशेषज्ञ', nav_certified_count: 'सत्यापित', nav_verified_providers: 'सत्यापित प्रदाता', layout_portal_view: 'पोर्टल दृश्य' }
};
Object.entries(layoutTranslations).forEach(([language, values]) => Object.assign(translations[language], values));

const customerPageTranslations = {
  en: { dash_points_suffix: 'Pts', booking_protected_badge: 'CoopServe Protected Booking', dash_recommendation_description: 'Smart balancing of skill, response time, distance and fair workload', dash_ai_match_score: 'AI Match Score', dash_ai_recommendation_reason: 'Why AI Recommends', dash_multi_factor_scoring: 'Multi-Factor Cooperative Scoring', dash_skill_match: 'Skill & Certification Match', dash_proximity: 'Proximity', dash_trust_score: 'Cooperative Trust Score', dash_workload_distribution: 'Fair Workload Distribution', dash_balanced_allocation: 'Balanced Allocation', dash_fixed_fee_guarantee: 'Guaranteed fixed fee via Protected Booking', dash_view_profile_book: 'View Profile & Book', services_directory_description: 'Choose a verified service with transparent pricing and protected booking.', services_search_placeholder: 'Search service title...', services_loading: 'Loading cooperative service catalog...', services_included: "What's Included:", services_starting_base: 'Starting from (Base)', services_instant_match: 'Instant Match', services_emergency_booking: 'Emergency Booking', services_browse: 'Browse', providers_title: 'Verified Cooperative Service Providers', providers_available: 'Available', providers_ai_spotlight: 'AI Smart Recommendation Spotlight', providers_ai_basis: 'Based on skill, proximity, Trust Score & fair workload', providers_filtered_by: 'Filtered by', providers_loading: 'Searching verified providers...', providers_empty_title: 'No providers match your filter criteria', providers_empty_description: 'Try broadening your search or selecting all categories.', filter_reset_all: 'Reset All Filters', provider_profile_not_found: 'Provider profile not found', providers_back: 'Back to Providers', provider_verified_partner: 'Verified Cooperative Service Partner', provider_member_id: 'Member ID', provider_verified_pro: 'Verified Pro', provider_worker_net: 'Worker Net', provider_trust_score: 'CoopServe Trust Score', provider_trust_description: 'Verified reliability based on completed work', provider_on_time_record: '100% on-time record', provider_service_hubs: 'Service Hubs', provider_rate_card: 'Standard Service Rate Card', provider_rate_description: 'Fixed cooperative rate with zero hidden costs', provider_protected_rate: 'Protected Rate', provider_work_record: 'Verified Platform Work Record', provider_work_record_description: 'Every completed job is recorded in the cooperative work history.', provider_verified: 'Verified', provider_verified_job: 'Verified Job', common_customer: 'Customer', common_date: 'Date', common_id: 'ID', provider_reviews_title: 'Verified Customer Reviews', provider_reviews_description: 'Authentic feedback from completed bookings', provider_protection_description: 'Protected booking with transparent fees', provider_selected_task: 'Selected Task', provider_starting_from: 'Starting from', provider_direct_payout: 'Direct Worker Payout (90%)', provider_platform_fee: 'Platform Fee & Guarantee (10%)', provider_rework_protection: 'Includes 30-day rework protection.' },
  hi: { dash_points_suffix: 'अंक', booking_protected_badge: 'CoopServe सुरक्षित बुकिंग', dash_recommendation_description: 'कौशल, प्रतिक्रिया समय, दूरी और उचित काम का संतुलित मिलान', dash_ai_match_score: 'AI मिलान स्कोर', dash_ai_recommendation_reason: 'AI की सिफारिश का कारण', dash_multi_factor_scoring: 'बहु-कारक सहकारी स्कोरिंग', dash_skill_match: 'कौशल और प्रमाणन मिलान', dash_proximity: 'निकटता', dash_trust_score: 'सहकारी भरोसा स्कोर', dash_workload_distribution: 'उचित काम वितरण', dash_balanced_allocation: 'संतुलित आवंटन', dash_fixed_fee_guarantee: 'सुरक्षित बुकिंग के साथ निश्चित शुल्क', dash_view_profile_book: 'प्रोफाइल देखें और बुक करें', services_directory_description: 'पारदर्शी मूल्य और सुरक्षित बुकिंग के साथ सत्यापित सेवा चुनें।', services_search_placeholder: 'सेवा खोजें...', services_loading: 'सहकारी सेवा सूची लोड हो रही है...', services_included: 'क्या शामिल है:', services_starting_base: 'आरंभिक मूल्य', services_instant_match: 'तुरंत मिलान', services_emergency_booking: 'आपातकालीन बुकिंग', services_browse: 'देखें', providers_title: 'सत्यापित सहकारी सेवा प्रदाता', providers_available: 'उपलब्ध', providers_ai_spotlight: 'AI स्मार्ट सिफारिश', providers_ai_basis: 'कौशल, निकटता, भरोसा स्कोर और उचित काम के आधार पर', providers_filtered_by: 'फ़िल्टर:', providers_loading: 'सत्यापित प्रदाता खोज रहे हैं...', providers_empty_title: 'आपके फ़िल्टर से कोई प्रदाता नहीं मिला', providers_empty_description: 'खोज विस्तृत करें या सभी श्रेणियां चुनें।', filter_reset_all: 'सभी फ़िल्टर हटाएं', provider_profile_not_found: 'प्रदाता प्रोफाइल नहीं मिली', providers_back: 'प्रदाताओं पर वापस जाएं', provider_verified_partner: 'सत्यापित सहकारी सेवा भागीदार', provider_member_id: 'सदस्य आईडी', provider_verified_pro: 'सत्यापित विशेषज्ञ', provider_worker_net: 'कर्मचारी शुद्ध कमाई', provider_trust_score: 'CoopServe भरोसा स्कोर', provider_trust_description: 'पूर्ण काम के आधार पर सत्यापित विश्वसनीयता', provider_on_time_record: '100% समय पर रिकॉर्ड', provider_service_hubs: 'सेवा क्षेत्र', provider_rate_card: 'मानक सेवा दर सूची', provider_rate_description: 'बिना छिपे शुल्क के निश्चित सहकारी दर', provider_protected_rate: 'सुरक्षित दर', provider_work_record: 'सत्यापित कार्य रिकॉर्ड', provider_work_record_description: 'हर पूरा काम सहकारी इतिहास में दर्ज होता है।', provider_verified: 'सत्यापित', provider_verified_job: 'सत्यापित काम', common_customer: 'ग्राहक', common_date: 'तारीख', common_id: 'आईडी', provider_reviews_title: 'सत्यापित ग्राहक समीक्षाएं', provider_reviews_description: 'पूरी बुकिंग से वास्तविक प्रतिक्रिया', provider_protection_description: 'पारदर्शी शुल्क वाली सुरक्षित बुकिंग', provider_selected_task: 'चयनित कार्य', provider_starting_from: 'आरंभिक मूल्य', provider_direct_payout: 'सीधा कर्मचारी भुगतान (90%)', provider_platform_fee: 'मंच शुल्क और गारंटी (10%)', provider_rework_protection: '30 दिन की दोबारा सेवा सुरक्षा शामिल।' }
};
Object.entries(customerPageTranslations).forEach(([language, values]) => Object.assign(translations[language], values));

Object.assign(translations.en, {
  auth_select_area: 'Select area', auth_manual_area: 'Enter another area', auth_area_placeholder: 'Enter your area', auth_use_location: 'Use My Location', validation_location_required: 'Select or enter your state, city, and area.', booking_use_saved_location: 'Use saved location', booking_location_required: 'Select a complete service location with state, city, and area.', booking_location_unavailable: 'This location could not be resolved.', cancellation_charge_notice: '10% cancellation charges will be deducted. The remaining 15% of the upfront payment will be refunded.', dash_completed_services: 'Completed services', dash_customer_rating: 'Your average rating', auth_feature_cooperative: 'Cooperative-owned, not corporate', auth_feature_cooperative_text: 'Members vote on fee rules, dividend allocations, and trust standards democratically.', auth_feature_ai: 'AI-matched in seconds', auth_feature_ai_text: 'Intelligent proximity and reputation routing without predatory surge pricing.', auth_feature_earnings: 'Transparent 90/10 earnings split', auth_feature_earnings_text: '90% net take-home to local workers with zero hidden deductions.', auth_feature_verified: 'Verified & insured workers', auth_feature_verified_text: 'Every booking includes cooperative insurance, skill badges, and community feedback.', auth_certified_professionals: 'Certified cooperative professionals', auth_payment_enabled: 'Protected payments enabled'
});
Object.assign(translations.hi, {
  auth_select_area: 'इलाका चुनें', auth_manual_area: 'दूसरा इलाका लिखें', auth_area_placeholder: 'अपना इलाका दर्ज करें', auth_use_location: 'मेरा स्थान उपयोग करें', validation_location_required: 'राज्य, शहर और इलाका चुनें या दर्ज करें।', booking_use_saved_location: 'सहेजा स्थान उपयोग करें', booking_location_required: 'राज्य, शहर और इलाके वाला पूरा सेवा स्थान चुनें।', booking_location_unavailable: 'यह स्थान नहीं मिला।', dash_completed_services: 'पूर्ण सेवाएं', dash_customer_rating: 'आपकी औसत रेटिंग', auth_feature_cooperative: 'सहकारी स्वामित्व, कॉर्पोरेट नहीं', auth_feature_cooperative_text: 'सदस्य शुल्क, लाभांश और भरोसे के मानकों पर लोकतांत्रिक निर्णय लेते हैं।', auth_feature_ai: 'सेकंडों में AI मिलान', auth_feature_ai_text: 'उचित निकटता और प्रतिष्ठा के आधार पर सेवा मिलान।', auth_feature_earnings: 'पारदर्शी 90/10 कमाई विभाजन', auth_feature_earnings_text: 'स्थानीय कर्मचारियों को 90% शुद्ध कमाई और कोई छिपी कटौती नहीं।', auth_feature_verified: 'सत्यापित और बीमित कर्मचारी', auth_feature_verified_text: 'हर बुकिंग में बीमा सुरक्षा, कौशल बैज और सामुदायिक प्रतिक्रिया शामिल है।', auth_certified_professionals: 'सत्यापित सहकारी विशेषज्ञ', auth_payment_enabled: 'सुरक्षित भुगतान सक्षम'
});

const bookingSurfaceTranslations = {
  en: { booking_trust_score: 'Trust Score', booking_protected_title: 'COOPSERVE PROTECTED BOOKING', booking_guaranteed_transaction: '100% Guaranteed Transaction', booking_coop_verified: 'Co-op Verified', booking_verified_provider: 'Verified Provider', booking_protection: 'Booking Protection', booking_digital_receipt: 'Digital Receipt', booking_dispute_support: 'Dispute Support', booking_work_record: 'Verified Work Record', booking_worker_payout: '90% Direct Worker Payout', booking_price_breakdown: 'Transparent Service Pricing Breakdown', booking_clear_pricing: 'Clear Pricing Before Booking', booking_base_price: 'Base Service Price', booking_distance_fee: 'Distance Travel Fee', booking_free_short_distance: 'Free under 2 km', booking_extra_charges: 'Extra Work / Material Charges', booking_total: 'Total Booking Amount', booking_remaining: 'Remaining Balance (75%)', booking_fair_share: 'Fair Share Economics (90 / 10 Split)', booking_worker_earnings: 'Worker Take-Home Payout (90%)', booking_platform_operations: 'Platform Operations & Dispute Cover (10%)', payment_gateway: 'Payment Gateway', payment_sandbox: 'Razorpay Sandbox', payment_gateway_description: 'Use the official Razorpay checkout sandbox to pay securely.', payment_upi: 'UPI', payment_cards: 'Cards', payment_netbanking: 'NetBanking', payment_wallets: 'Wallets', payment_verifying: 'Verifying payment', payment_confirmed_title: 'Payment confirmed', payment_scheduled: 'Booking scheduled', payment_receipt: 'Digital Receipt', payment_booking_id: 'Booking ID', payment_assigned_provider: 'Assigned Provider', payment_service: 'Service', payment_scheduled_time: 'Scheduled Time', payment_total_customer: 'Total Customer Amount', booking_view_all: 'View All Bookings', booking_track_status: 'Track Live Service Status' },
  hi: { booking_trust_score: 'भरोसा स्कोर', booking_protected_title: 'CoopServe सुरक्षित बुकिंग', booking_guaranteed_transaction: '100% गारंटीकृत लेनदेन', booking_coop_verified: 'सहकारी सत्यापित', booking_verified_provider: 'सत्यापित प्रदाता', booking_protection: 'बुकिंग सुरक्षा', booking_digital_receipt: 'डिजिटल रसीद', booking_dispute_support: 'विवाद सहायता', booking_work_record: 'सत्यापित कार्य रिकॉर्ड', booking_worker_payout: '90% सीधा कर्मचारी भुगतान', booking_price_breakdown: 'पारदर्शी सेवा मूल्य विवरण', booking_clear_pricing: 'बुकिंग से पहले स्पष्ट मूल्य', booking_base_price: 'मूल सेवा मूल्य', booking_distance_fee: 'यात्रा शुल्क', booking_free_short_distance: '2 किमी तक निःशुल्क', booking_extra_charges: 'अतिरिक्त काम / सामग्री शुल्क', booking_total: 'कुल बुकिंग राशि', booking_remaining: 'शेष राशि (75%)', booking_fair_share: 'न्यायपूर्ण हिस्सा (90 / 10 विभाजन)', booking_worker_earnings: 'कर्मचारी की कमाई (90%)', booking_platform_operations: 'मंच संचालन और विवाद सुरक्षा (10%)', payment_gateway: 'भुगतान गेटवे', payment_sandbox: 'Razorpay सैंडबॉक्स', payment_gateway_description: 'आधिकारिक Razorpay चेकआउट से सुरक्षित भुगतान करें।', payment_upi: 'UPI', payment_cards: 'कार्ड', payment_netbanking: 'नेट बैंकिंग', payment_wallets: 'वॉलेट', payment_verifying: 'भुगतान की पुष्टि हो रही है', payment_confirmed_title: 'भुगतान की पुष्टि', payment_scheduled: 'बुकिंग निर्धारित', payment_receipt: 'डिजिटल रसीद', payment_booking_id: 'बुकिंग आईडी', payment_assigned_provider: 'नियुक्त प्रदाता', payment_service: 'सेवा', payment_scheduled_time: 'निर्धारित समय', payment_total_customer: 'ग्राहक की कुल राशि', booking_view_all: 'सभी बुकिंग देखें', booking_track_status: 'सेवा की स्थिति देखें' }
};
Object.entries(bookingSurfaceTranslations).forEach(([language, values]) => Object.assign(translations[language], values));

Object.assign(translations.en, { common_loading_subtext: 'Loading verified records', common_close: 'Close' });
Object.assign(translations.hi, { common_loading_subtext: 'सत्यापित रिकॉर्ड लोड हो रहे हैं', common_close: 'बंद करें' });
Object.assign(translations.en, {
  profile_points_rule: 'Points are added after a completed verified service: 1 point per ₹10 spent.',
  profile_default_location: 'Default City / Location',
  booking_protection_description: 'Your payment is protected and your service is recorded on CoopServe.',
  booking_upfront: 'Upfront payable now (25%)',
  booking_upfront_note: '25% paid now. No hidden charges.',
  booking_proceed_payment: 'Proceed to payment',
  booking_pay_upfront: 'Pay upfront', payment_transaction_id: 'Transaction ID', status_cancelled_customer: 'Cancelled by customer', status_declined_provider: 'Declined by provider', status_in_progress: 'In progress', status_arrived: 'Arrived at site', status_on_the_way: 'On the way', status_provider_accepted: 'Provider accepted', status_order_confirmed: 'Order confirmed', booking_status_progress: 'Service status and progress', booking_cancelled_customer: 'This booking was cancelled by the customer.', cancellation_schedule_change: 'Schedule change', booking_declined_title: 'Job request declined by provider', provider_unavailable: 'Provider unavailable', booking_protection_active: 'CoopServe protection guarantee active', booking_assigned_professional: 'Assigned cooperative professional', booking_scheduled_slot: 'Scheduled slot', booking_service_location: 'Service location', booking_customer_notes: 'Customer notes', booking_review_title: 'Verified service review and rating', booking_feedback_optional: 'Written feedback (optional)'
});
Object.assign(translations.hi, {
  profile_points_rule: 'पूर्ण सत्यापित सेवा के बाद अंक मिलते हैं: खर्च किए गए प्रत्येक ₹10 पर 1 अंक।',
  profile_default_location: 'डिफ़ॉल्ट शहर / स्थान',
  booking_protection_description: 'आपका भुगतान सुरक्षित है और आपकी सेवा CoopServe पर दर्ज है।',
  booking_upfront: 'अभी अग्रिम भुगतान (25%)',
  booking_upfront_note: 'अभी 25% भुगतान। कोई छिपा शुल्क नहीं।',
  booking_proceed_payment: 'भुगतान पर जाएं',
  booking_pay_upfront: 'अग्रिम भुगतान करें', payment_transaction_id: 'लेनदेन आईडी', status_cancelled_customer: 'ग्राहक ने रद्द किया', status_declined_provider: 'प्रदाता ने अस्वीकार किया', status_in_progress: 'कार्य जारी है', status_arrived: 'स्थान पर पहुंच गया', status_on_the_way: 'रास्ते में', status_provider_accepted: 'प्रदाता ने स्वीकार किया', status_order_confirmed: 'ऑर्डर की पुष्टि', booking_status_progress: 'सेवा स्थिति और प्रगति', booking_cancelled_customer: 'यह बुकिंग ग्राहक द्वारा रद्द की गई।', cancellation_schedule_change: 'कार्यक्रम में बदलाव', booking_declined_title: 'प्रदाता ने अनुरोध अस्वीकार किया', provider_unavailable: 'प्रदाता उपलब्ध नहीं', booking_protection_active: 'CoopServe सुरक्षा गारंटी सक्रिय', booking_assigned_professional: 'नियुक्त सहकारी विशेषज्ञ', booking_scheduled_slot: 'निर्धारित समय', booking_service_location: 'सेवा स्थान', booking_customer_notes: 'ग्राहक के नोट्स', booking_review_title: 'सत्यापित सेवा समीक्षा और रेटिंग', booking_feedback_optional: 'लिखित प्रतिक्रिया (वैकल्पिक)'
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('coopserve_lang') || 'en');

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('coopserve_lang', lang);
    }
  };

  const t = (key, defaultText) => {
    return translations[language]?.[key] || (language !== 'en' ? translations.hi?.[key] : null) || translations['en']?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: [
      { code: 'en', label: 'English',   flag: '🇬🇧' },
      { code: 'hi', label: 'हिन्दी',    flag: '🇮🇳' },
      { code: 'mr', label: 'मराठी',     flag: '🇮🇳' },
      { code: 'gu', label: 'ગુજરાતી',  flag: '🇮🇳' },
      { code: 'ta', label: 'தமிழ்',    flag: '🇮🇳' },
      { code: 'bn', label: 'বাংলা',     flag: '🇮🇳' },
      { code: 'te', label: 'తెలుగు',   flag: '🇮🇳' },
      { code: 'kn', label: 'ಕನ್ನಡ',    flag: '🇮🇳' },
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
