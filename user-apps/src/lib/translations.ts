// ─── Ogbenjuwa Citizen Portal — Translation Dictionary ─────────────────

export type Language = 'en' | 'idoma';

interface TranslationEntry {
  en: string;
  idoma: string;
}

const translations: Record<string, TranslationEntry> = {
  // ── Auth ──────────────────────────────────────────────────────────────
  'auth.login':           { en: 'Welcome',                   idoma: 'Welcome' },
  'auth.subtitle':        { en: 'Enter your phone to continue', idoma: 'Enter your phone to continue' },
  'auth.phone_label':     { en: 'Phone Number',              idoma: 'Phone Number' },
  'auth.send_otp':        { en: 'Send Code',                 idoma: 'Send Code' },
  'auth.enter_otp':       { en: 'Enter Verification Code',   idoma: 'Enter Verification Code' },
  'auth.otp_hint':        { en: 'Back to phone entry',       idoma: 'Back to phone entry' },
  'auth.login_button':    { en: 'Sign In',                   idoma: 'Sign In' },
  'auth.phone_error':     { en: 'Enter a valid Nigerian number: +234 803 XXX XXXX', idoma: 'Enter a valid Nigerian number' },
  'auth.phone_instruction': { en: 'Enter your Nigerian phone number', idoma: 'Enter your phone number' },
  'auth.otp_label':       { en: 'Code',                      idoma: 'Code' },
  'auth.code_sent':       { en: 'Code sent to',              idoma: 'Code sent to' },
  'auth.wrong_code':      { en: 'Wrong code',                idoma: 'Wrong code' },
  'auth.attempt':         { en: 'Attempt',                   idoma: 'Attempt' },
  'auth.locked':          { en: 'Too many attempts. Locked for 15 minutes.', idoma: 'Locked for 15 minutes' },

  // ── Nav ────────────────────────────────────────────────────────────────
  'nav.vigilante':        { en: 'Vigilante',                 idoma: 'Vigilante' },
  'nav.community':        { en: 'Community',                 idoma: 'Community' },
  'nav.directory':        { en: 'Directory',                 idoma: 'Directory' },
  'nav.report':           { en: 'Report',                    idoma: 'Report' },
  'nav.profile':          { en: 'Profile',                   idoma: 'Profile' },
  'nav.logout':           { en: 'Logout',                    idoma: 'Logout' },

  // ── Vigilante Dashboard ────────────────────────────────────────────────
  'vigilante.title':      { en: 'Vigilante Dashboard',       idoma: 'Vigilante Dashboard' },
  'vigilante.subtitle':   { en: 'Community safety overview', idoma: 'Community safety overview' },
  'vigilante.active_patrols':   { en: 'Active Patrols',      idoma: 'Active Patrols' },
  'vigilante.coverage':         { en: 'Coverage',            idoma: 'Coverage' },
  'vigilante.checkins':         { en: 'Check-ins Today',     idoma: 'Check-ins Today' },
  'vigilante.sightings':        { en: 'Sightings Today',     idoma: 'Sightings Today' },
  'vigilante.alert_log':        { en: 'Public Alert Log',    idoma: 'Public Alert Log' },
  'vigilante.no_alerts':        { en: 'No active alerts in your area', idoma: 'No active alerts in your area' },
  'vigilante.patrol_online':    { en: 'Patrol Members Online', idoma: 'Patrol Members Online' },

  // ── Community Dashboard ────────────────────────────────────────────────
  'community.title':          { en: 'Community Dashboard',    idoma: 'Community Dashboard' },
  'community.select_lga':     { en: 'Select LGA',             idoma: 'Select LGA' },
  'community.alerts_by_lga':  { en: 'Alerts by LGA',          idoma: 'Alerts by LGA' },
  'community.total_alerts':   { en: 'Total Alerts',           idoma: 'Total Alerts' },
  'community.high':           { en: 'High',                   idoma: 'High' },
  'community.medium':         { en: 'Medium',                 idoma: 'Medium' },
  'community.low':            { en: 'Low',                    idoma: 'Low' },
  'community.announcements':  { en: 'Community Announcements', idoma: 'Community Announcements' },
  'community.safety_tips':    { en: 'Safety Tips',            idoma: 'Safety Tips' },
  'community.tip_1':          { en: 'Stay alert and report suspicious activity immediately', idoma: 'Stay alert and report suspicious activity immediately' },
  'community.tip_2':          { en: 'Keep emergency contacts saved on your phone', idoma: 'Keep emergency contacts saved on your phone' },
  'community.tip_3':          { en: 'Know your nearest safe assembly point', idoma: 'Know your nearest safe assembly point' },

  // ── Directory ──────────────────────────────────────────────────────────
  'directory.title':          { en: 'Resident Directory',    idoma: 'Resident Directory' },
  'directory.search':         { en: 'Search by name or LGA', idoma: 'Search by name or LGA' },
  'directory.filter_lga':     { en: 'Filter by LGA',         idoma: 'Filter by LGA' },
  'directory.connect':        { en: 'Connect',               idoma: 'Connect' },
  'directory.connected':      { en: 'Connected',             idoma: 'Connected' },
  'directory.pending':        { en: 'Pending',               idoma: 'Pending' },
  'directory.no_results':     { en: 'No residents found',    idoma: 'No residents found' },
  'directory.verified':       { en: 'Verified Resident',     idoma: 'Verified Resident' },
  'directory.subtitle':       { en: 'Find and connect with neighbors', idoma: 'Find and connect with neighbors' },

  // ── Report ──────────────────────────────────────────────────────────────
  'report.title':             { en: 'Quick Report',          idoma: 'Quick Report' },
  'report.subtitle':          { en: 'Report an incident to your community', idoma: 'Report an incident to your community' },
  'report.type_attack':       { en: 'Armed Attack',          idoma: 'Ufele' },
  'report.type_fire':         { en: 'Fire',                  idoma: 'Ole' },
  'report.type_medical':      { en: 'Medical',               idoma: 'Ochere' },
  'report.type_abduction':    { en: 'Abduction',             idoma: 'Ofa' },
  'report.type_other':        { en: 'Other',                 idoma: 'Obu Ofu' },
  'report.description':       { en: 'Description (optional)', idoma: 'Description (optional)' },
  'report.char_count':        { en: '/ 200 characters',      idoma: '/ 200 characters' },
  'report.submit':            { en: 'Submit Report',         idoma: 'Submit Report' },
  'report.success':           { en: 'Report Submitted',      idoma: 'Report Submitted' },
  'report.success_desc':      { en: 'Your report has been logged and will be reviewed.', idoma: 'Your report has been logged and will be reviewed.' },
  'report.incident_type':     { en: 'What type of incident?',  idoma: 'What type of incident?' },
  'report.report_another':    { en: 'Report Another',        idoma: 'Report Another' },

  // ── Profile ────────────────────────────────────────────────────────────
  'profile.title':            { en: 'My Profile',            idoma: 'My Profile' },
  'profile.personal_info':    { en: 'Personal Information',  idoma: 'Personal Information' },
  'profile.name':             { en: 'Name',                  idoma: 'Name' },
  'profile.phone':            { en: 'Phone',                 idoma: 'Phone' },
  'profile.lga':              { en: 'LGA',                   idoma: 'LGA' },
  'profile.ward':             { en: 'Ward',                  idoma: 'Ward' },
  'profile.verified':         { en: 'Verified Resident',     idoma: 'Verified Resident' },
  'profile.change_photo':     { en: 'Change Photo',          idoma: 'Change Photo' },
  'profile.notifications':    { en: 'Notifications',         idoma: 'Notifications' },
  'profile.sms_alerts':       { en: 'SMS Alerts',            idoma: 'SMS Alerts' },
  'profile.in_app':           { en: 'In-App Notifications',  idoma: 'In-App Notifications' },
  'profile.language':         { en: 'Language',              idoma: 'Language' },
  'profile.lang_en':          { en: 'English',               idoma: 'English' },
  'profile.lang_idoma':       { en: 'Idoma',                 idoma: 'Idoma' },
  'profile.save':             { en: 'Save Changes',          idoma: 'Save Changes' },
  'profile.saved':            { en: 'Profile saved',         idoma: 'Profile saved' },
  'profile.logout':           { en: 'Logout',                idoma: 'Logout' },
  'profile.delete_account':   { en: 'Delete Account',        idoma: 'Delete Account' },
  'profile.ward_placeholder': { en: 'e.g. Ward 1',           idoma: 'e.g. Ward 1' },
  'profile.sms_desc':         { en: 'Receive SMS alerts for incidents in your area', idoma: 'Receive SMS alerts for incidents in your area' },
  'profile.in_app_desc':      { en: 'Get push notifications within the app', idoma: 'Get push notifications within the app' },
  'profile.delete_confirm':   { en: 'This action cannot be undone. Type DELETE to confirm.', idoma: 'This action cannot be undone.' },
  'profile.delete_placeholder': { en: 'Type DELETE to confirm', idoma: 'Type DELETE to confirm' },
  'profile.delete_confirm_btn': { en: 'Delete',                idoma: 'Delete' },

  // ── Report: Camera ──────────────────────────────────────────────────────
  'report.camera':            { en: 'Add Media',              idoma: 'Add Media' },
  'report.photo':             { en: 'Take Photo',             idoma: 'Take Photo' },
  'report.video':             { en: 'Record Video',           idoma: 'Record Video' },
  'report.live':              { en: 'Live Feed',              idoma: 'Live Feed' },
  'report.captured_photo':    { en: 'Photo captured',         idoma: 'Photo captured' },
  'report.captured_video':    { en: 'Video recorded',         idoma: 'Video recorded' },
  'report.retake':            { en: 'Retake',                 idoma: 'Retake' },
  'report.camera_error':      { en: 'Camera unavailable',     idoma: 'Camera unavailable' },
  'report.live_active':       { en: 'Live feed active',       idoma: 'Live feed active' },
  'report.live_stop':         { en: 'Stop Live',              idoma: 'Stop Live' },

  // ── General ────────────────────────────────────────────────────────────
  'general.loading':          { en: 'Loading...',             idoma: 'Loading...' },
  'general.offline':          { en: 'You are offline. Some features may be limited.', idoma: 'You are offline.' },
  'general.error':            { en: 'Something went wrong',  idoma: 'Something went wrong' },
  'general.demo':             { en: 'Demo',                   idoma: 'Demo' },
  'general.of':               { en: 'of',                     idoma: 'of' },
  'general.welcome':          { en: 'Welcome',                idoma: 'Welcome' },
  'general.all':              { en: 'All',                    idoma: 'All' },
  'general.cancel':           { en: 'Cancel',                 idoma: 'Cancel' },
};

export function t(key: string, lang: Language): string {
  const entry = translations[key];
  if (!entry) return key;
  if (lang === 'idoma') return entry.idoma;
  return entry.en;
}
