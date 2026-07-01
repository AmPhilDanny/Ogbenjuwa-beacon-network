// ─── Ogbenjuwa Translation Dictionary ───────────────────────────────────
// Only Idoma words documented in the platform spec are used in the `idoma`
// field. All other entries have idoma === en — the toggle produces no
// visible change for those strings, which is honest.
//
// Documented Idoma vocabulary (from platform spec, never auto-translated):
//   Ufele   = Armed Attack
//   Ole     = Fire Outbreak
//   Ochere  = Medical Emergency
//   Ofa     = Abduction Report
//   Obu Ofu = Other / Unknown

export type Language = 'en' | 'idoma';

interface TranslationEntry {
  en: string;
  idoma: string;
}

const translations: Record<string, TranslationEntry> = {
  // ═══ REAL IDOMA TRANSLATIONS (from spec) ═══════════════════════════

  // ── Alert Types ──────────────────────────────────────────────────
  'alert.attack':         { en: 'Armed Attack',        idoma: 'Ufele' },
  'alert.fire':           { en: 'Fire Outbreak',       idoma: 'Ole' },
  'alert.medical':        { en: 'Medical Emergency',   idoma: 'Ochere' },
  'alert.abduction':      { en: 'Abduction Report',    idoma: 'Ofa' },
  'alert.other':          { en: 'Other / Unknown',     idoma: 'Obu Ofu' },
  'alert.type':           { en: 'Alert Type',          idoma: 'Ufele' },
  'alert.active':         { en: 'ALERT ACTIVE',        idoma: 'Ufele' },
  'alert.sos':            { en: 'SOS',                 idoma: 'Ufele' },
  'ussd.alert_sent':      { en: 'ALERT SENT',          idoma: 'Ufele' },

  // ═══ ENGLISH-ONLY ENTRIES (idoma falls back to same text) ═══════╗
  // ── Alert System Labels ─────────────────────────────────────────
  'alert.system':         { en: 'Alert System',        idoma: 'Alert System' },
  'alert.in_progress':    { en: 'Alert in progress',   idoma: 'Alert in progress' },
  'alert.standing_by':    { en: 'Standing by',         idoma: 'Standing by' },
  'alert.broadcasting':   { en: 'Broadcasting to all contacts...', idoma: 'Broadcasting to all contacts...' },
  'alert.notified':       { en: 'All contacts notified', idoma: 'All contacts notified' },
  'alert.warriors':       { en: 'Warriors alerted',    idoma: 'Warriors alerted' },
  'alert.reset':          { en: 'Reset Alert',         idoma: 'Reset Alert' },
  'alert.sms_preview':    { en: 'SMS Preview',         idoma: 'SMS Preview' },
  'alert.broadcast_feed': { en: 'SMS Broadcast Feed',  idoma: 'SMS Broadcast Feed' },
  'alert.waiting':        { en: 'Waiting for alert...', idoma: 'Waiting for alert...' },
  'alert.location':       { en: 'Location & Severity', idoma: 'Location & Severity' },
  'alert.severity':       { en: 'Severity',            idoma: 'Severity' },
  'alert.village_lga':    { en: 'Village / LGA',       idoma: 'Village / LGA' },

  // ── Nav ──────────────────────────────────────────────────────────
  'nav.dashboard':        { en: 'Dashboard',           idoma: 'Dashboard' },
  'nav.alert':            { en: 'Alert System',        idoma: 'Alert System' },
  'nav.patrol':           { en: 'Patrol Map',          idoma: 'Patrol Map' },
  'nav.reunify':          { en: 'Reunification',       idoma: 'Reunification' },
  'nav.feed':             { en: 'Community Feed',      idoma: 'Community Feed' },
  'nav.report':           { en: 'Report Incident',     idoma: 'Report Incident' },
  'nav.neighborhood':     { en: 'My Neighborhood',     idoma: 'My Neighborhood' },
  'nav.resources':        { en: 'Emergency Resources', idoma: 'Emergency Resources' },
  'nav.home':             { en: 'Home',                idoma: 'Home' },
  'nav.help':             { en: 'Help',                idoma: 'Help' },
  'nav.profile':          { en: 'Profile',             idoma: 'Profile' },
  'nav.user_dashboard':   { en: 'My Dashboard',        idoma: 'My Dashboard' },
  'nav.settings':         { en: 'Settings',            idoma: 'Settings' },
  'nav.about':            { en: 'About Ogbenjuwa',     idoma: 'About Ogbenjuwa' },
  'nav.operations':       { en: 'Operations',          idoma: 'Operations' },

  // ── Dashboard ────────────────────────────────────────────────────
  'dashboard.title':      { en: 'Command Dashboard',   idoma: 'Command Dashboard' },
  'dashboard.incidents':  { en: 'Active Incidents',    idoma: 'Active Incidents' },
  'dashboard.sms_today':  { en: 'SMS Today',           idoma: 'SMS Today' },
  'dashboard.avg_delivery': { en: 'Avg Delivery',      idoma: 'Avg Delivery' },
  'dashboard.contacts':   { en: 'Contacts',            idoma: 'Contacts' },
  'dashboard.heatmap':    { en: 'Incident Heatmap',    idoma: 'Incident Heatmap' },
  'dashboard.feed':       { en: 'Live Incidents',      idoma: 'Live Incidents' },
  'dashboard.by_lga':     { en: 'Incidents by LGA',    idoma: 'Incidents by LGA' },
  'dashboard.response_times': { en: 'Response Times',  idoma: 'Response Times' },

  // ── Sidebar ──────────────────────────────────────────────────────
  'sidebar.overview':     { en: 'Overview',            idoma: 'Overview' },
  'sidebar.incident_map': { en: 'Incident Map',        idoma: 'Incident Map' },
  'sidebar.analytics':    { en: 'Analytics',           idoma: 'Analytics' },
  'sidebar.alert_history':{ en: 'Alert History',       idoma: 'Alert History' },
  'sidebar.patrol_status':{ en: 'Patrol Status',       idoma: 'Patrol Status' },
  'sidebar.reunification':{ en: 'Reunification',       idoma: 'Reunification' },
  'sidebar.lga_nodes':    { en: 'LGA Nodes',           idoma: 'LGA Nodes' },
  'sidebar.comm_admins':  { en: 'Community Admins',    idoma: 'Community Admins' },
  'sidebar.settings':     { en: 'Settings',            idoma: 'Settings' },
  'sidebar.admin':        { en: 'Admin',               idoma: 'Admin' },

  // ── Landing ──────────────────────────────────────────────────────
  'landing.hero_title':   { en: 'Warriors Protecting', idoma: 'Warriors Protecting' },
  'landing.hero_highlight': { en: 'Idoma',             idoma: 'Idoma' },
  'landing.live_demo':    { en: 'Live Demo',           idoma: 'Live Demo' },
  'landing.invest':       { en: 'Invest in the Warriors of Idoma', idoma: 'Invest in the Warriors of Idoma' },
  'landing.problem':      { en: 'The Problem',         idoma: 'The Problem' },
  'landing.solution':     { en: 'The Ogbenjuwa Platform', idoma: 'The Ogbenjuwa Platform' },
  'landing.crisis_numbers': { en: 'The Crisis in Numbers', idoma: 'The Crisis in Numbers' },
  'landing.live_feed':    { en: 'Live Incident Feed',  idoma: 'Live Incident Feed' },
  'landing.patrol_map':   { en: 'Patrol Map',          idoma: 'Patrol Map' },
  'landing.community_safety': { en: 'Community Safety Network', idoma: 'Community Safety Network' },
  'landing.displaced':    { en: 'Displaced',           idoma: 'Displaced' },
  'landing.lgas':         { en: 'LGAs',                idoma: 'LGAs' },
  'landing.response':     { en: 'Response',            idoma: 'Response' },
  'landing.alert_systems': { en: 'Alert Systems',      idoma: 'Alert Systems' },
  'landing.revenue_model': { en: 'Revenue Model',      idoma: 'Revenue Model' },
  'landing.roadmap':      { en: 'Roadmap',             idoma: 'Roadmap' },

  // ── Home ─────────────────────────────────────────────────────────
  'home.community_status': { en: 'Community Status',   idoma: 'Community Status' },
  'home.active_alerts':   { en: 'Active Alerts',       idoma: 'Active Alerts' },
  'home.neighborhood':    { en: 'Neighborhood',        idoma: 'Neighborhood' },
  'home.response_time':   { en: 'Response Time',       idoma: 'Response Time' },
  'home.secure':          { en: 'Secure',              idoma: 'Secure' },
  'home.recent_activity': { en: 'Recent Activity',     idoma: 'Recent Activity' },
  'home.quick_actions':   { en: 'Quick Actions',       idoma: 'Quick Actions' },
  'home.report_suspicious': { en: 'Report Suspicious Activity', idoma: 'Report Suspicious Activity' },
  'home.find_neighbor':   { en: 'Find My Neighbor',    idoma: 'Find My Neighbor' },
  'home.emergency_contacts': { en: 'Emergency Contacts', idoma: 'Emergency Contacts' },
  'home.view_all':        { en: 'View All Activity',   idoma: 'View All Activity' },

  // ── Feed / Report / Profile ──────────────────────────────────────
  'feed.title':           { en: 'Community Feed',      idoma: 'Community Feed' },
  'report.title':         { en: 'Report Incident',     idoma: 'Report Incident' },
  'report.submit':        { en: 'Submit Report',       idoma: 'Submit Report' },
  'report.cancel':        { en: 'Cancel',              idoma: 'Cancel' },
  // ── Patrol ───────────────────────────────────────────────────────
  'patrol.map':           { en: 'Patrol Map',          idoma: 'Patrol Map' },
  'patrol.active':        { en: 'Active Patrols',      idoma: 'Active Patrols' },
  'patrol.coverage':      { en: 'Coverage Zones',      idoma: 'Coverage Zones' },
  'patrol.resources':     { en: 'Resources',           idoma: 'Resources' },
  'patrol.response':      { en: 'Response Ready',      idoma: 'Response Ready' },
  'patrol.status':        { en: 'Patrol Status',       idoma: 'Patrol Status' },
  'patrol.legend':        { en: 'Map Legend',          idoma: 'Map Legend' },
  'patrol.live_map':      { en: 'Live Map',            idoma: 'Live Map' },

  // ── Reunification ────────────────────────────────────────────────
  'reunify.title':        { en: 'Family Reunification', idoma: 'Family Reunification' },
  'reunify.search':       { en: 'Search Registry',     idoma: 'Search Registry' },
  'reunify.registered':   { en: 'Registered',          idoma: 'Registered' },
  'reunify.reunited':     { en: 'Reunited',            idoma: 'Reunited' },
  'reunify.searching':    { en: 'Searching',           idoma: 'Searching' },
  'reunify.at_camp':      { en: 'At Camp',             idoma: 'At Camp' },

  // ── USSD ─────────────────────────────────────────────────────────
  'ussd.title':           { en: 'Ogbenjuwa USSD',      idoma: 'Ogbenjuwa USSD' },
  'ussd.stay_safe':       { en: 'Stay safe.',          idoma: 'Stay safe.' },

  // ── Auth ─────────────────────────────────────────────────────────
  'auth.login':           { en: 'Operator Login',      idoma: 'Operator Login' },
  'auth.enter_otp':       { en: 'Enter OTP Code',      idoma: 'Enter OTP Code' },
  'auth.select_role':     { en: 'Select Your Role',    idoma: 'Select Your Role' },
  'auth.send_otp':        { en: 'Send OTP',            idoma: 'Send OTP' },
  'auth.sign_in':         { en: 'Sign In',             idoma: 'Sign In' },
  'auth.logout':          { en: 'Logout',              idoma: 'Logout' },
  'auth.phone_label':     { en: 'Phone Number',        idoma: 'Phone Number' },
  'auth.otp_hint':        { en: 'Back to phone entry', idoma: 'Back to phone entry' },

  // ── User Dashboard (Phase 2) ──────────────────────────────────────
  'dashboard.kpi.active_alerts':  { en: 'Active Alerts',     idoma: 'Active Alerts' },
  'dashboard.kpi.patrol_online':  { en: 'Patrol Online',     idoma: 'Patrol Online' },
  'dashboard.kpi.reports_today':  { en: 'Reports Today',     idoma: 'Reports Today' },
  'dashboard.kpi.members_online': { en: 'Members Online',    idoma: 'Members Online' },
  'dashboard.kpi.checkins_today': { en: "Check-ins Today",   idoma: "Check-ins Today" },
  'dashboard.kpi.coverage':       { en: 'Coverage',          idoma: 'Coverage' },
  'dashboard.kpi.avg_response':   { en: 'Avg Response',      idoma: 'Avg Response' },
  'dashboard.kpi.open_incidents': { en: 'Open Incidents',    idoma: 'Open Incidents' },
  'dashboard.kpi.reunifications': { en: 'Reunifications',    idoma: 'Reunifications' },
  'dashboard.kpi.total_alerts':   { en: 'Total Alerts',      idoma: 'Total Alerts' },
  'dashboard.kpi.lgas_affected':  { en: 'LGAs Affected',     idoma: 'LGAs Affected' },
  'dashboard.kpi.critical_inc':   { en: 'Critical Incidents',idoma: 'Critical Incidents' },
  'dashboard.kpi.response_rate':  { en: 'Response Rate',     idoma: 'Response Rate' },
  'dashboard.widget.quick_actions':   { en: 'Quick Actions',     idoma: 'Quick Actions' },
  'dashboard.widget.alert_history':   { en: 'Alert History',     idoma: 'Alert History' },
  'dashboard.widget.community_stats': { en: 'Community Stats',   idoma: 'Community Stats' },
  'dashboard.widget.recent_feed':     { en: 'Recent Incidents',  idoma: 'Recent Incidents' },
  'dashboard.widget.view_all':        { en: 'View All',          idoma: 'View All' },

  // ── User Profile (Phase 3) ────────────────────────────────────────
  'profile.title':             { en: 'My Profile',           idoma: 'My Profile' },
  'profile.personal_info':     { en: 'Personal Information', idoma: 'Personal Information' },
  'profile.notifications':     { en: 'Notifications',        idoma: 'Notifications' },
  'profile.security':          { en: 'Security',             idoma: 'Security' },
  'profile.language_region':   { en: 'Language & Region',    idoma: 'Language & Region' },
  'profile.first_name':        { en: 'First Name',           idoma: 'First Name' },
  'profile.last_name':         { en: 'Last Name',            idoma: 'Last Name' },
  'profile.phone':             { en: 'Phone Number',         idoma: 'Phone Number' },
  'profile.lga':               { en: 'LGA',                  idoma: 'LGA' },
  'profile.ward':              { en: 'Ward',                 idoma: 'Ward' },
  'profile.verified':          { en: 'Verified Resident',    idoma: 'Verified Resident' },
  'profile.change_photo':      { en: 'Change Photo',         idoma: 'Change Photo' },
  'profile.sms_alerts':        { en: 'SMS Alerts',           idoma: 'SMS Alerts' },
  'profile.in_app_notifs':     { en: 'In-App Notifications', idoma: 'In-App Notifications' },
  'profile.patrol_reminders':  { en: 'Patrol Reminders',     idoma: 'Patrol Reminders' },
  'profile.emergency_broadcast': { en: 'Emergency Broadcasts', idoma: 'Emergency Broadcasts' },
  'profile.change_pin':        { en: 'Change PIN',           idoma: 'Change PIN' },
  'profile.active_sessions':   { en: 'Active Sessions',      idoma: 'Active Sessions' },
  'profile.two_factor':        { en: 'Two-Factor Auth',      idoma: 'Two-Factor Auth' },
  'profile.language':          { en: 'Language',             idoma: 'Language' },
  'profile.timezone':          { en: 'Timezone',             idoma: 'Timezone' },
  'profile.save':              { en: 'Save Changes',         idoma: 'Save Changes' },
  'profile.discard':           { en: 'Discard Changes',      idoma: 'Discard Changes' },
  'profile.logout':            { en: 'Logout',               idoma: 'Logout' },
  'profile.delete_account':    { en: 'Delete Account',        idoma: 'Delete Account' },

  // ─── User Dashboard (Phase 5 extensions) ───────────────────────────────
  'user.dashboard.title':         { en: 'Dashboard',               idoma: 'Dashboard' },
  'user.dashboard.subtitle':      { en: 'Community Safety Overview', idoma: 'Community Safety Overview' },
  'user.dashboard.export':        { en: 'Export',                  idoma: 'Export' },
  'user.dashboard.export_png':    { en: 'Download as PNG',         idoma: 'Download as PNG' },
  'user.dashboard.export_print':  { en: 'Print / PDF',             idoma: 'Print / PDF' },
  'user.dashboard.activity_log':  { en: 'Activity Log',            idoma: 'Activity Log' },
  'user.dashboard.clear':         { en: 'Clear',                   idoma: 'Clear' },
  'user.dashboard.no_activity':   { en: 'No activity yet',         idoma: 'No activity yet' },
  'user.dashboard.no_recent':     { en: 'No recent activity',      idoma: 'No recent activity' },

  // ─── Alert History ────────────────────────────────────────────────────
  'alert.filter_all':        { en: 'All',            idoma: 'All' },
  'alert.filter_active':     { en: 'Active',         idoma: 'Active' },
  'alert.filter_monitoring': { en: 'Monitoring',     idoma: 'Monitoring' },
  'alert.filter_resolved':   { en: 'Resolved',       idoma: 'Resolved' },
  'alert.no_incidents':      { en: 'No incidents found', idoma: 'No incidents found' },
  'alert.detail_id':         { en: 'ID',              idoma: 'ID' },
  'alert.detail_lga':        { en: 'LGA',             idoma: 'LGA' },
  'alert.detail_type':       { en: 'Type',            idoma: 'Type' },
  'alert.detail_reported':   { en: 'Reported',        idoma: 'Reported' },

  // ─── Community Stats labels ────────────────────────────────────────────
  'stats.patrol_online':    { en: 'Patrol Online',     idoma: 'Patrol Online' },
  'stats.checkins_today':   { en: "Check-ins Today",   idoma: "Check-ins Today" },
  'stats.coverage':         { en: 'Coverage',           idoma: 'Coverage' },
  'stats.sightings_today':  { en: 'Sightings Today',    idoma: 'Sightings Today' },

  // ─── Customize Shortcuts ───────────────────────────────────────────────
  'shortcuts.customize': { en: 'Customize Shortcuts',  idoma: 'Customize Shortcuts' },
  'shortcuts.desc':      { en: 'Choose up to 3 shortcuts. Drag to reorder.', idoma: 'Choose up to 3 shortcuts.' },
  'shortcuts.reset':     { en: 'Reset',                idoma: 'Reset' },
  'shortcuts.done':      { en: 'Done',                 idoma: 'Done' },

  // ─── Security Section ──────────────────────────────────────────────────
  'security.cancel':          { en: 'Cancel',                 idoma: 'Cancel' },
  'security.change':          { en: 'Change',                 idoma: 'Change' },
  'security.current_pin':     { en: 'Current PIN',            idoma: 'Current PIN' },
  'security.new_pin':         { en: 'New PIN (4-6 digits)',   idoma: 'New PIN (4-6 digits)' },
  'security.confirm_pin':     { en: 'Confirm PIN',            idoma: 'Confirm PIN' },
  'security.update_pin':      { en: 'Update PIN',             idoma: 'Update PIN' },
  'security.session_current': { en: 'Current',                idoma: 'Current' },
  'security.revoke':          { en: 'Revoke',                 idoma: 'Revoke' },
  'security.coming_soon':     { en: 'Coming soon',            idoma: 'Coming soon' },

  // ─── Notification descriptions ────────────────────────────────────────
  'notif.desc.sms':       { en: 'Receive SMS alerts for incidents in your area', idoma: 'Receive SMS alerts for incidents in your area' },
  'notif.desc.in_app':    { en: 'Get push notifications within the app',          idoma: 'Get push notifications within the app' },
  'notif.desc.emergency': { en: 'Emergency broadcasts (always enabled)',          idoma: 'Emergency broadcasts (always enabled)' },
  'notif.desc.patrol':    { en: 'Patrol shift reminders and check-in prompts',    idoma: 'Patrol shift reminders and check-in prompts' },

  // ─── Language & Region ─────────────────────────────────────────────────
  'lang.english': { en: 'English', idoma: 'English' },
  'lang.idoma':   { en: 'Idoma',   idoma: 'Idoma' },
  'lang.timezone': { en: 'West Africa Time (WAT) · UTC+1', idoma: 'West Africa Time (WAT) · UTC+1' },

  // ─── Photo upload ──────────────────────────────────────────────────────
  'photo.size_error':  { en: 'Photo must be under 2 MB',   idoma: 'Photo must be under 2 MB' },
  'photo.type_error':  { en: 'Please select an image file', idoma: 'Please select an image file' },
  'photo.hint':        { en: 'PNG, JPG · max 2 MB',        idoma: 'PNG, JPG · max 2 MB' },
  'photo.placeholder': { en: 'e.g. Ward 1',                idoma: 'e.g. Ward 1' },
};

// ─── Lookup helper ─────────────────────────────────────────────────────
export function t(key: string, lang: Language): string {
  const entry = translations[key];
  if (!entry) return key;
  if (lang === 'idoma') return entry.idoma;
  return entry.en;
}
