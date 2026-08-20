// ─── Ogbenjuwa Citizen Portal — Translation Dictionary ─────────────────

export type Language = 'en' | 'idoma';

interface TranslationEntry {
  en: string;
  idoma: string;
}

const translations: Record<string, TranslationEntry> = {
  // ── Auth ──────────────────────────────────────────────────────────────
  'auth.login': { en: 'Welcome', idoma: 'Awa (Singular) / Iwa (Plural)' },
  'auth.subtitle':        { en: 'Enter your phone to continue', idoma: 'Enter your phone to continue' },
  'auth.phone_label': { en: 'Phone Number', idoma: 'Aluka ku uwáyà' },
  'auth.send_otp':        { en: 'Send Code',                 idoma: 'Send Code' },
  'auth.enter_otp':       { en: 'Enter Verification Code',   idoma: 'Enter Verification Code' },
  'auth.otp_hint': { en: 'Back to phone entry', idoma: 'Cigbihi gā ɛga uwáyà' },
  'auth.login_button': { en: 'Sign In', idoma: 'Wínú' },
  'auth.phone_error':     { en: 'Enter a valid Nigerian number: +234 803 XXX XXXX', idoma: 'Enter a valid Nigerian number' },
  'auth.phone_instruction': { en: 'Enter your Nigerian phone number', idoma: 'Enter your phone number' },
  'auth.otp_label': { en: 'Code', idoma: 'Ine' },
  'auth.code_sent':       { en: 'Code sent to',              idoma: 'Code sent to' },
  'auth.wrong_code':      { en: 'Wrong code',                idoma: 'Wrong code' },
  'auth.attempt':         { en: 'Attempt',                   idoma: 'Attempt' },
  'auth.locked':          { en: 'Too many attempts. Locked for 15 minutes.', idoma: 'Locked for 15 minutes' },

  // ── Nav ────────────────────────────────────────────────────────────────
  'nav.vigilante':        { en: 'Vigilante',                 idoma: 'Vigilante' },
  'nav.community':        { en: 'Community',                 idoma: 'Community' },
  'nav.directory':        { en: 'Directory',                 idoma: 'Directory' },
  'nav.report': { en: 'Report', idoma: 'ɛ̀pɔ̄' },
  'nav.profile': { en: 'Profile', idoma: 'Ɔkā ku abɔyi' },
  'nav.logout': { en: 'Logout', idoma: 'Bɛ̄cɛ' },

  // ── Vigilante Dashboard ────────────────────────────────────────────────
  'vigilante.title':      { en: 'Vigilante Dashboard',       idoma: 'Vigilante Dashboard' },
  'vigilante.subtitle': { en: 'Community safety overview', idoma: 'Ɔdā Oobū: Ocē Ku Ogbotu Ku Ajé' },
  'vigilante.active_patrols': { en: 'Active Patrols', idoma: 'Aiódē nōó yɔ i ta abɔ a' },
  'vigilante.coverage': { en: 'Coverage', idoma: 'Oká' },
  'vigilante.checkins':         { en: 'Check-ins Today',     idoma: 'Check-ins Today' },
  'vigilante.sightings': { en: 'Sightings Today', idoma: 'Amá Ícɛ̀' },
  'vigilante.alert_log':        { en: 'Public Alert Log',    idoma: 'Public Alert Log' },
  'vigilante.no_alerts':        { en: 'No active alerts in your area', idoma: 'No active alerts in your area' },
  'vigilante.patrol_online':    { en: 'Patrol Members Online', idoma: 'Patrol Members Online' },

  // ── Community Dashboard ────────────────────────────────────────────────
  'community.title':          { en: 'Community Dashboard',    idoma: 'Community Dashboard' },
  'community.select_lga': { en: 'Select LGA', idoma: 'Igomenti' },
  'community.alerts_by_lga':  { en: 'Alerts by LGA',          idoma: 'Alerts by LGA' },
  'community.total_alerts': { en: 'Total Alerts', idoma: 'Íbá odúdú' },
  'community.high': { en: 'High', idoma: 'Nɛ̄hi' },
  'community.medium': { en: 'Medium', idoma: 'Ɔtɛyi' },
  'community.low': { en: 'Low', idoma: 'Waajɛ' },
  'community.lga_monitored':  { en: 'LGAs Monitored',         idoma: 'LGAs Monitored' },
  'community.live_map':       { en: 'Live Incident Map',      idoma: 'Live Incident Map' },
  'community.stats_title': { en: 'Community Stats', idoma: 'Aluka ku igeli' },
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
  'directory.verified': { en: 'Verified Resident', idoma: 'Océ l\'ājé nōō jé ojójé' },
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
  'report.submit': { en: 'Submit Report', idoma: 'Fu ɛpɔ' },
  'report.success': { en: 'Report Submitted', idoma: 'Ɛpɔ lẹ je' },
  'report.success_desc':      { en: 'Your report has been logged and will be reviewed.', idoma: 'Your report has been logged and will be reviewed.' },
  'report.incident_type':     { en: 'What type of incident?',  idoma: 'What type of incident?' },
  'report.report_another':    { en: 'Report Another',        idoma: 'Report Another' },

  // ── Profile ────────────────────────────────────────────────────────────
  'profile.title': { en: 'My Profile', idoma: 'Iyē ku abōyīm' },
  'profile.personal_info': { en: 'Personal Information', idoma: 'Elā ku abɔyi' },
  'profile.name': { en: 'Name', idoma: 'Iye' },
  'profile.phone': { en: 'Phone', idoma: 'Uwáyà' },
  'profile.lga': { en: 'LGA', idoma: 'Egà ku Igẹmẹnti Ajé' },
  'profile.ward': { en: 'Ward', idoma: 'Ɛlā / Úlé' },
  'profile.verified': { en: 'Verified Resident', idoma: 'Océ l\'ājé nōō jé ojójé' },
  'profile.change_photo': { en: 'Change Photo', idoma: 'Piyabɔ Ifoto' },
  'profile.notifications': { en: 'Notifications', idoma: 'Onà' },
  'profile.sms_alerts': { en: 'SMS Alerts', idoma: 'Íbá ku elā uwaya' },
  'profile.in_app': { en: 'In-App Notifications', idoma: 'Aiọka ipu uwaya' },
  'profile.language': { en: 'Language', idoma: 'Uce' },
  'profile.lang_en': { en: 'English', idoma: 'Ẹla Enefu' },
  'profile.lang_idoma': { en: 'Idoma', idoma: 'Idọma' },
  'profile.save': { en: 'Save Changes', idoma: 'Cè opiyabɔ' },
  'profile.saved':            { en: 'Profile saved',         idoma: 'Profile saved' },
  'profile.logout': { en: 'Logout', idoma: 'Bɛ̄cɛ' },
  'profile.delete_account': { en: 'Delete Account', idoma: 'Tónū ɛbɛ' },
  'profile.ward_placeholder': { en: 'e.g. Ward 1',           idoma: 'e.g. Ward 1' },
  'profile.sms_desc': { en: 'Receive SMS alerts for incidents in your area', idoma: 'Mīyɛ ukɔ ku SMS nōo gē tu uwɔ ɛlá kwu unwalu ipu ɛga ku uwɔ.' },
  'profile.in_app_desc': { en: 'Get push notifications within the app', idoma: 'Lɛ ōmiya ku ɔdā nōo géē tu uwɔ ɛlá kwu ɔ ipu uwaya a ya.' },
  'profile.delete_confirm':   { en: 'This action cannot be undone. Type DELETE to confirm.', idoma: 'This action cannot be undone.' },
  'profile.delete_placeholder': { en: 'Type DELETE to confirm', idoma: 'Type DELETE to confirm' },
  'profile.delete_confirm_btn': { en: 'Delete', idoma: 'Okpa nyi' },

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
  'general.loading': { en: 'Loading...', idoma: 'Yɔ i gbòògà...' },
  'general.offline':          { en: 'You are offline. Some features may be limited.', idoma: 'You are offline.' },
  'general.error':            { en: 'Something went wrong',  idoma: 'Something went wrong' },
  'general.demo':             { en: 'Demo',                   idoma: 'Demo' },
  'general.of':               { en: 'of',                     idoma: 'of' },
  'general.welcome': { en: 'Welcome', idoma: 'Awa (Singular) / Iwa (Plural)' },
  'general.all': { en: 'All', idoma: 'Òdúdú' },
  'general.cancel': { en: 'Cancel', idoma: 'Kwu nya' },
  'general.no_data':          { en: 'No announcements',       idoma: 'No announcements' },
};

export function t(key: string, lang: Language): string {
  const entry = translations[key];
  if (!entry) return key;
  if (lang === 'idoma') return entry.idoma;
  return entry.en;
}
