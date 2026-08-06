// ─── Ogbenjuwa Citizen App — i18n (English / Idoma) ─────────────────────
// data-i18n="key" attribute binding + dynamic t() lookup.
// Translation base from the citizen MVP spec §6.

(function () {
  'use strict';

  var Session = window.OGBENJUWA.Session;

  var TRANSLATIONS = {
    idoma: {
      'app.name': 'Ogbenjuwa',
      'home': 'Ulo',
      'alerts': 'Obe',
      'report': 'Kọọ',
      'family': 'Ezinulo',
      'profile': 'Onwe m',
      'panic': 'Gbaa Oso!',
      'panic_long': 'GBAA OSO!',
      'panic_note': 'A ga-ekekọrịta ọnọdụ gị na ndị ịkpọtụrụ mberede na onyeisi obodo LGA gị.',
      'all_clear': 'Ilu di mma',
      'active_alert': 'Ihe ize ndụ!',
      'seek_shelter': 'Nọọ n\'ụlọ',
      'help_coming': 'Enyemaka na-abịa',
      'send_alert': 'Zipu Obe',
      'find_family': 'Cheta Ezinulo',
      'find_resources': 'Chere Obe',
      'emergency': 'Oge ọchịchọ',
      'report_incident': 'Kọọ ihe mere',
      'safety_status': 'Ọnọdụ nchebe',
      'stay_alert': 'Cheta ebe',
      'danger': 'IHE IZE NDỤ!',
      'recent_alerts': 'Obe ndị na-adịbeghị anya',
      'community_feed': 'Ozi obodo',
      'view_all': 'Lee ihe niile',
      'login': 'Banye',
      'logout': 'Pụọ',
      'signup': 'Deba aha',
      'password': 'Okwu nzuzo',
      'email': 'Email',
      'phone': 'Ekwe ntị',
      'name': 'Aha',
      'username': 'Aha njirimara',
      'lga': 'Ọchịchị ime obodo',
      'village': 'Obodo',
      'submit': 'Ziga',
      'cancel': 'Kagbuo',
      'send': 'Zipu',
      'loading': 'Na-ebubata...',
      'offline': 'Enweghị netwọk — na-eji data echekwara',
      'retry': 'Nwaa ọzọ',
      'back': 'Laghachi',
      'next': 'Ọzọ',
      'no_data': 'Ọ nweghị ihe e nwetara',
      'safety_card': 'Kaadị nchebe m',
      'emergency_contacts': 'Ndị ịkpọtụrụ mberede',
      'notifications': 'Ozi ọkwa',
      'language': 'Asụsụ',
      'help': 'Enyemaka',
      'call_emergency': 'Kpọọ akara mberede',
      'sms_fallback': 'Enweghị intanet? Ziga SMS na ',
      'settings': 'Ntọala',
      'account': 'Akaụntụ',
      'ward': 'Ward',
      'search': 'Chọọ',
      'resources': 'Akụrụngwa',
      'shelter': 'Ebe mgbaba',
      'water': 'Mmiri',
      'medical': 'Ọgwụ',
      'food': 'Nri',
      'active': 'Na-arụ ọrụ',
      'resolved': 'Edozila',
      'monitoring': 'Na-enyocha',
      'just_now': 'Ugbu a',
      'min_ago': 'nkeji gara aga',
      'hr_ago': 'awa gara aga',
      'day_ago': 'ụbọchị gara aga',
      'see_all': 'Lee ihe niile',
      'welcome': 'Nnọọ',
      'your_area': 'Obodo gị',
      'no_alerts_msg': 'Ọ nweghị obe na-arụ ọrụ na mpaghara gị ugbu a.',
      'report_success': 'E zigala akụkọ gị!',
      'report_ref': 'Ntụaka:',
      'ack': 'Ahụla m',
      'share': 'Kesaa',
      'comment': 'Kwu okwu',
      'subscribed_lgas': 'Ọchịchị ndị ị na-enweta obe',
      'save': 'Chekwaa',
      'add': 'Tinye',
      'remove': 'Wepụ',
      'edit': 'Dezie',
      'change': 'Gbanwee',
      'delete_account': 'Hichapụ akaụntụ m',
      'change_phone': 'Gbanwee nọmba ekwe ntị',
      'call_now': 'Kpọọ ugbu a',
      'get_directions': 'Nweta ntụzịaka',
      'capacity': 'Ikike',
      'near_me': 'Nso m',
      'all': 'Ihe niile',
      'high': 'Elu',
      'medium': 'Ọkara',
      'low': 'Ala',
      'critical': 'Dị oke egwu',
      'report_type': 'Kedu ihe mere?',
      'location': 'Ebee?',
      'details': 'Nkọwa',
      'photo_optional': 'Foto (nhọrọ)',
      'urgency': 'Oke ọsọ',
      'sos_sent': 'E zipụrụ akara SOS!',
      'safe_now': 'Anọ m n\'udo ugbu a',
      'sos_cancel': 'Kagbuo',
      'hold_to_confirm': 'Jide iji gosi',
      'family_search': 'Chọọ ezinụlọ',
      'register_self': 'Deba aha onwe m',
      'report_missing': 'Kọọ onye furu efu',
      'my_cases': 'Okwu m',
      'reunion_search': 'Chọọ ndebanye',
      'lang_english': 'English',
      'lang_idoma': 'Idoma',
      'log_in_help': 'Enweghị ike ịbanye? Kpọọ ',
    },
    english: {
      'app.name': 'Ogbenjuwa',
      'home': 'Home',
      'alerts': 'Alerts',
      'report': 'Report',
      'family': 'Family',
      'profile': 'Profile',
      'panic': 'PANIC',
      'panic_long': 'PANIC',
      'panic_note': 'Your location will be shared with your emergency contacts and your LGA community admin.',
      'all_clear': 'All Clear',
      'active_alert': 'ACTIVE ALERT',
      'seek_shelter': 'Seek shelter',
      'help_coming': 'Help is coming',
      'send_alert': 'Send Alert',
      'find_family': 'Find Family',
      'find_resources': 'Find Resources',
      'emergency': 'Emergency',
      'report_incident': 'Report Incident',
      'safety_status': 'Safety status',
      'stay_alert': 'Stay Alert',
      'danger': 'DANGER',
      'recent_alerts': 'Recent alerts',
      'community_feed': 'Community feed',
      'view_all': 'See all',
      'login': 'Log in',
      'logout': 'Log out',
      'signup': 'Create account',
      'password': 'Password',
      'email': 'Email',
      'phone': 'Phone',
      'name': 'Full name',
      'username': 'Username',
      'lga': 'Local Government Area',
      'village': 'Village',
      'submit': 'Submit',
      'cancel': 'Cancel',
      'send': 'Send',
      'loading': 'Loading...',
      'offline': 'No connection — using saved data',
      'retry': 'Retry',
      'back': 'Back',
      'next': 'Next',
      'no_data': 'Nothing here yet',
      'safety_card': 'My Safety Card',
      'emergency_contacts': 'Emergency contacts',
      'notifications': 'Notifications',
      'language': 'Language',
      'help': 'Help',
      'call_emergency': 'Call LGA Emergency',
      'sms_fallback': 'No internet? Send SMS to ',
      'settings': 'Settings',
      'account': 'Account',
      'ward': 'Ward',
      'search': 'Search',
      'resources': 'Resources',
      'shelter': 'Shelter',
      'water': 'Water',
      'medical': 'Medical',
      'food': 'Food',
      'active': 'ACTIVE',
      'resolved': 'Resolved',
      'monitoring': 'Monitoring',
      'just_now': 'Just now',
      'min_ago': 'min ago',
      'hr_ago': 'h ago',
      'day_ago': 'd ago',
      'see_all': 'See all →',
      'welcome': 'Welcome',
      'your_area': 'Your area',
      'no_alerts_msg': 'No active alerts in your area right now.',
      'report_success': 'Report submitted',
      'report_ref': 'Reference:',
      'ack': 'Noted',
      'share': 'Share',
      'comment': 'Comment',
      'subscribed_lgas': 'Alerts from',
      'save': 'Save',
      'add': 'Add',
      'remove': 'Remove',
      'edit': 'Edit',
      'change': 'Change',
      'delete_account': 'Delete my account',
      'change_phone': 'Change phone number',
      'call_now': 'Call Now',
      'get_directions': 'Get Directions',
      'capacity': 'capacity',
      'near_me': 'Near me',
      'all': 'All',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low',
      'critical': 'Critical',
      'report_type': 'What happened?',
      'location': 'Where?',
      'details': 'Details',
      'photo_optional': 'Photo (optional)',
      'urgency': 'How urgent?',
      'sos_sent': 'HELP IS COMING',
      'safe_now': 'I am safe now',
      'sos_cancel': 'Cancel',
      'hold_to_confirm': 'Hold to confirm',
      'family_search': 'Find Family',
      'register_self': 'Register Myself',
      'report_missing': 'Report Missing',
      'my_cases': 'My Cases',
      'reunion_search': 'Search reunification registry',
      'lang_english': 'English',
      'lang_idoma': 'Idoma',
      'log_in_help': 'Can\'t log in? Call ',
      'community_resources': 'Community resources',
      'resources_note': 'Emergency facilities, vigilante posts and help points near you.',
      'health': 'Health',
      'security': 'Security',
      'fire': 'Fire',
      'disaster': 'Disaster',
      'no_resources': 'No resources found for this area yet.',
      'family_note': 'Keep your loved ones reachable — search the community directory or keep emergency contacts.',
      'search_directory': 'Search community directory',
      'search_hint': 'Enter a name, phone or village to find people in your community.',
      'contact_name': 'Contact name',
      'contact_phone': 'Phone number',
      'add_contact': 'Add contact',
      'family_sms_fallback': 'Full registration needs a community admin — SMS *347# with your LGA name to register family offline.',
      'no_results': 'No results found.',
      'search_failed': 'Search failed — try again.',
      'no_contacts': 'No emergency contacts yet — add one below.',
      'load_failed': 'Could not load — check your connection.',
      'fill_all': 'Please fill in all fields.',
      'contact_added': 'Contact added!',
      'contact_fallback': 'Admin-only — SMS *347# to register instead.',
      'add_failed': 'Could not add contact.',
      'feed': 'Feed',
      'feed_note': 'Announcements from your LGA admin and neighbours. Acknowledge posts so your community knows you are safe.',
      'announcements': 'Announcements',
      'safety_updates': 'Safety updates',
      'no_posts': 'No posts yet.',
      'acknowledge': 'Acknowledge',
      'acknowledged': 'Acknowledged',
      'ack_done': 'Acknowledged — stay safe.',
      'ack_failed': 'Could not acknowledge — try again.',
      'ack_requires_login': 'Sign in to acknowledge announcements.',
      'my_profile': 'My Profile',
      'account_details': 'Account details',
      'full_name': 'Full name',
      'push_alerts': 'Push alerts (SMS)',
      'notif_note': 'We\'ll SMS you when there\'s an alert in your LGA. Standard rates apply.',
      'sessions': 'Sessions',
      'notif_on': 'Notifications on',
      'notif_off': 'Notifications off',
      'logged_out': 'Logged out — see you soon.',
      'delete_confirm': 'Delete your account? This cannot be undone.',
      'delete_failed': 'Could not delete account — try again.',
    },
  };

  function getLang() {
    return Session.getLang() === 'idoma' ? 'idoma' : 'english';
  }

  function t(key) {
    var lang = getLang();
    var table = TRANSLATIONS[lang] || TRANSLATIONS.english;
    return table[key] || TRANSLATIONS.english[key] || key;
  }

  /** Re-render every [data-i18n] element on the current page. */
  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(key));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      el.setAttribute('title', t(key));
    });
    // Toggle button states
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang') === getLang();
      btn.classList.toggle('active', isActive);
    });
    // Set document lang
    document.documentElement.setAttribute('lang', getLang() === 'idoma' ? 'ig' : 'en');
  }

  function setLang(lang) {
    Session.setLang(lang);
    apply();
    emitChange(lang);
  }

  var changeListeners = [];
  function onChange(fn) { changeListeners.push(fn); }
  function emitChange(lang) {
    changeListeners.forEach(function (fn) { try { fn(lang); } catch (e) {} });
  }

  // Auto-bind toggle buttons
  document.addEventListener('DOMContentLoaded', function () {
    apply();
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang') === 'idoma' ? 'idoma' : 'english');
      });
    });
  });

  window.OGBENJUWA = window.OGBENJUWA || {};
  window.OGBENJUWA.i18n = {
    t: t,
    getLang: getLang,
    setLang: setLang,
    apply: apply,
    onChange: onChange,
  };
})();
