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
  'alert.attack': { en: 'Armed Attack', idoma: 'Èfü mla égbè' },
  'alert.fire': { en: 'Fire Outbreak', idoma: 'Ɔlá nēē tū' },
  'alert.medical': { en: 'Medical Emergency', idoma: 'Ecī acigili' },
  'alert.abduction': { en: 'Abduction Report', idoma: 'Ɛpɔ̄ kú ō kwú ɔ̄cɛ' },
  'alert.other': { en: 'Other / Unknown', idoma: 'Ɔhá / Ɔdā nɛ ā i jé ŋ' },
  'alert.type': { en: 'Alert Type', idoma: 'Èdò ku íbá' },
  'alert.active': { en: 'ALERT ACTIVE', idoma: 'Íbá yɔ' },
  'alert.sos': { en: 'SOS', idoma: 'Túmàbɔ!' },
  'ussd.alert_sent': { en: 'ALERT SENT', idoma: 'É tū íbá le' },

  // ═══ ENGLISH-ONLY ENTRIES (idoma falls back to same text) ═══════╗
  // ── Alert System Labels ─────────────────────────────────────────
  'alert.system': { en: 'Alert System', idoma: 'Owē ku íbá' },
  'alert.in_progress': { en: 'Alert in progress', idoma: 'Íbá yɔ̄ dū' },
  'alert.standing_by': { en: 'Standing by', idoma: 'Māhàyì' },
  'alert.broadcasting': { en: 'Broadcasting to all contacts...', idoma: 'Ō tū ɛlā gā ācɛ òdúdú nɛ alɔ jé a...' },
  'alert.notified': { en: 'All contacts notified', idoma: 'Alɔ tóònà lɛ ācɛ nɛ alɔ hi igwú a òdúdú ẹẹ.' },
  'alert.warriors': { en: 'Warriors alerted', idoma: 'Aiaícɔ́ɔja lẹ íbá da.' },
  'alert.reset': { en: 'Reset Alert', idoma: 'Ce íbá' },
  'alert.sms_preview': { en: 'SMS Preview', idoma: 'Ɔdā nɛ alọ gáā nwu a ku ẹhọ uwaya' },
  'alert.broadcast_feed': { en: 'SMS Broadcast Feed', idoma: 'Oolẹ ku uwaya tọkpa alẹwa' },
  'alert.waiting': { en: 'Waiting for alert...', idoma: 'Yɔ i gbeyi ku íbá...' },
  'alert.location': { en: 'Location & Severity', idoma: 'Ẹga mlā Otɛyi nɛhi' },
  'alert.severity': { en: 'Severity', idoma: 'Unɛhi' },
  'alert.village_lga': { en: 'Village / LGA', idoma: 'Epɔlɛ' },

  // ── Nav ──────────────────────────────────────────────────────────
  'nav.dashboard': { en: 'Dashboard', idoma: 'Ɛga nɛ á màfú ɔdā a' },
  'nav.alert': { en: 'Alert System', idoma: 'Odā ku íbá' },
  'nav.patrol': { en: 'Patrol Map', idoma: 'Ọkpa ku ajẹ ō gbō' },
  'nav.reunify': { en: 'Reunification', idoma: 'Ōpiyātɔha kpɔ' },
  'nav.feed': { en: 'Community Feed', idoma: 'Odlé ku Ace' },
  'nav.report': { en: 'Report Incident', idoma: 'Fu ɛ̀pɔ̄ kú ɔdā nōo ya' },
  'nav.neighborhood': { en: 'My Neighborhood', idoma: 'Adógbè kú m̄' },
  'nav.resources': { en: 'Emergency Resources', idoma: 'Aubrociɔ ku amiya' },
  'nav.home': { en: 'Home', idoma: 'Olé' },
  'nav.help': { en: 'Help', idoma: 'Tábō' },
  'nav.inbox': { en: 'Inbox', idoma: 'İgbé kú umɛseji' },
  'nav.profile': { en: 'Profile', idoma: 'Ɔkā ku abɔyi' },
  'nav.user_dashboard': { en: 'My Dashboard', idoma: 'Dashboard Kum' },
  'nav.settings': { en: 'Settings', idoma: 'Oōmìyà' },
  'nav.about': { en: 'About Ogbenjuwa', idoma: 'Ẹla ku Ogbenjuwa' },
  'nav.operations': { en: 'Operations', idoma: 'Aɔdā ō ya' },

  // ── Dashboard ────────────────────────────────────────────────────
  'dashboard.title': { en: 'Command Dashboard', idoma: 'Gbɛla Ku Inè' },
  'dashboard.incidents': { en: 'Active Incidents', idoma: 'Āhɔ̄ nōó yọ i ya anana a' },
  'dashboard.sms_today': { en: 'SMS Today', idoma: 'Message ícɛ̀' },
  'dashboard.avg_delivery': { en: 'Avg Delivery', idoma: 'Ō ce ɔnya nōo gē bá' },
  'dashboard.contacts': { en: 'Contacts', idoma: 'ƐgƐ Nɛ A Géē Ceyitikwu' },
  'dashboard.heatmap': { en: 'Incident Heatmap', idoma: 'Ọkpa Idòlá ku Ámíyā' },
  'dashboard.feed': { en: 'Live Incidents', idoma: 'Aiɔdā nōo yɔ i ya anana a' },
  'dashboard.by_lga': { en: 'Incidents by LGA', idoma: 'Āhɔ̄ lɛyikwu LGA' },
  'dashboard.response_times': { en: 'Response Times', idoma: 'Èkò-to\' òhì fiaa' },

  // ── Sidebar ──────────────────────────────────────────────────────
  'sidebar.overview': { en: 'Overview', idoma: 'Oce' },
  'sidebar.incident_map': { en: 'Incident Map', idoma: 'Ifoto ku Ámíyā' },
  'sidebar.analytics': { en: 'Analytics', idoma: 'Ō leyi yɛ Ɔdā/Aɛlā' },
  'sidebar.alert_history': { en: 'Alert History', idoma: 'Òtát\'äje ku Íbá' },
  'sidebar.patrol_status': { en: 'Patrol Status', idoma: 'Ahɔ ku ōgb\'ājē' },
  'sidebar.reunification': { en: 'Reunification', idoma: 'Ō túbá kpɔ' },
  'sidebar.lga_nodes': { en: 'LGA Nodes', idoma: 'Aɛgà ku LGA' },
  'sidebar.comm_admins': { en: 'Community Admins', idoma: 'Ācɛ ō leyi kwu ujɔ' },
  'sidebar.settings': { en: 'Settings', idoma: 'Omiya' },
  'sidebar.admin': { en: 'Admin', idoma: 'Ɔcɛ nōo lēyī kwū' },

  // ── Landing ──────────────────────────────────────────────────────
  'landing.hero_title': { en: 'Warriors Protecting', idoma: 'Ogbenjuwa Achɛ ɛfu oogbo' },
  'landing.hero_highlight': { en: 'Idoma', idoma: 'Idọma' },
  'landing.live_demo': { en: 'Live Demo', idoma: 'Cabōmàfú Kpaakpa' },
  'landing.invest': { en: 'Invest in the Warriors of Idoma', idoma: 'Je ije tu aícɔ́ɔja kú Idoma ā' },
  'landing.problem': { en: 'The Problem', idoma: 'Unwalu a' },
  'landing.solution': { en: 'The Ogbenjuwa Platform', idoma: 'Ọwa ọgbọ ku Ogbenjuwa' },
  'landing.crisis_numbers': { en: 'The Crisis in Numbers', idoma: 'Unwalu Ipu Áluka' },
  'landing.live_feed': { en: 'Live Incident Feed', idoma: 'Òf\'ɛ̀pɔ̀ ɛpɔ̀ èncéèncé' },
  'landing.patrol_map': { en: 'Patrol Map', idoma: 'Okpá ajé kú ō gb\'āje' },
  'landing.community_safety': { en: 'Community Safety Network', idoma: 'Ígwù ku Èbó ku Ajé' },
  'landing.displaced': { en: 'Displaced', idoma: 'Fu ŋmá' },
  'landing.lgas': { en: 'LGAs', idoma: 'Aiɛga ku Igẹmẹnti ku ajɛ' },
  'landing.response': { en: 'Response', idoma: 'Òhì' },
  'landing.alert_systems': { en: 'Alert Systems', idoma: 'Ami ɔdā ku íbá' },
  'landing.revenue_model': { en: 'Revenue Model', idoma: 'Ocabɔ ku ije eli' },
  'landing.roadmap': { en: 'Roadmap', idoma: 'Ojuju ku ɔwɛ' },

  // ── Home ─────────────────────────────────────────────────────────
  'home.community_status': { en: 'Community Status', idoma: 'Ahō k\'ajé' },
  'home.active_alerts': { en: 'Active Alerts', idoma: 'Aiibá nɛ e yɔ a' },
  'home.neighborhood': { en: 'Neighborhood', idoma: 'Adógbè' },
  'home.response_time': { en: 'Response Time', idoma: 'Èkò-to\' òhì fiaa' },
  'home.secure': { en: 'Secure', idoma: 'Ogbotu je' },
  'home.recent_activity': { en: 'Recent Activity', idoma: 'Uklɔ Ɛpɛpɛ' },
  'home.quick_actions': { en: 'Quick Actions', idoma: 'Ayá fia' },
  'home.report_suspicious': { en: 'Report Suspicious Activity', idoma: 'T\'oka ku odā nɛ i lẹ ufi a' },
  'home.find_neighbor': { en: 'Find My Neighbor', idoma: 'Dọka adogbe m' },
  'home.emergency_contacts': { en: 'Emergency Contacts', idoma: 'Achẹ ō higwu eko amiya' },
  'home.view_all': { en: 'View All Activity', idoma: 'Má aɔdā odudu' },

  // ── Feed / Report / Profile ──────────────────────────────────────
  'feed.title': { en: 'Community Feed', idoma: 'Oka ku Acē' },
  'report.title': { en: 'Report Incident', idoma: 'fā épɔ̄' },
  'report.submit': { en: 'Submit Report', idoma: 'Fu ɛpɔ' },
  'report.cancel': { en: 'Cancel', idoma: 'Kwu nya' },
  // ── Patrol ───────────────────────────────────────────────────────
  'patrol.map': { en: 'Patrol Map', idoma: 'Okpá ajé ku iyāwù ō gb\'áje' },
  'patrol.active': { en: 'Active Patrols', idoma: 'Aiódē nōó yɔ i ta abɔ a' },
  'patrol.coverage': { en: 'Coverage Zones', idoma: 'Ajɛ nɛ̄ó hɛ́tá ā' },
  'patrol.resources': { en: 'Resources', idoma: 'Aɔdā' },
  'patrol.response': { en: 'Response Ready', idoma: 'Lɛ otutu ya ku o tūhɔ' },
  'patrol.status': { en: 'Patrol Status', idoma: 'Ahɔ ku ō gb\'ājē' },
  'patrol.legend': { en: 'Map Legend', idoma: 'Èyí kú ínà kú okpá ajé' },
  'patrol.live_map': { en: 'Live Map', idoma: 'Omapu yéèyī' },

  // ── Reunification ────────────────────────────────────────────────
  'reunify.title': { en: 'Family Reunification', idoma: 'Ōcigbihi Gā Ipu Apɔlɛ' },
  'reunify.search': { en: 'Search Registry', idoma: 'Dɔka Òtát\'äje' },
  'reunify.registered': { en: 'Registered', idoma: 'tá iyē tāajɛ' },
  'reunify.reunited': { en: 'Reunited', idoma: 'Cigbihi má' },
  'reunify.searching': { en: 'Searching', idoma: 'Ō dɔka' },
  'reunify.at_camp': { en: 'At Camp', idoma: 'Ipú áklɔ̄kpɛ' },

  // ── USSD ─────────────────────────────────────────────────────────
  'ussd.title':           { en: 'Ogbenjuwa USSD',      idoma: 'Ogbenjuwa USSD' },
  'ussd.stay_safe': { en: 'Stay safe.', idoma: 'Lɛ ogbotu.' },

  // ── Auth ─────────────────────────────────────────────────────────
  'auth.login': { en: 'Operator Login', idoma: 'Ō wínú ku ọyauklọ' },
  'auth.enter_otp': { en: 'Enter OTP Code', idoma: 'Kà oka OTP' },
  'auth.select_role': { en: 'Select Your Role', idoma: 'Leyi ɛcɔbu ku uwɔ' },
  'auth.send_otp': { en: 'Send OTP', idoma: 'OTP Tẹhọ wa' },
  'auth.sign_in': { en: 'Sign In', idoma: 'Wínú' },
  'auth.logout': { en: 'Logout', idoma: 'Bɛ̄cɛ' },
  'auth.phone_label': { en: 'Phone Number', idoma: 'Aluka ku uwáyà' },
  'auth.otp_hint': { en: 'Back to phone entry', idoma: 'Cigbihi gā ɛga uwáyà' },

  // ── User Dashboard (Phase 2) ──────────────────────────────────────
  'dashboard.kpi.active_alerts': { en: 'Active Alerts', idoma: 'Íbá nōo yɔ̄ a' },
  'dashboard.kpi.patrol_online': { en: 'Patrol Online', idoma: 'Gbāje Ip\'intanẹti' },
  'dashboard.kpi.reports_today': { en: 'Reports Today', idoma: 'Aiọka ichẹ' },
  'dashboard.kpi.members_online': { en: 'Members Online', idoma: 'Ācɛ nōo yɔ ipu intanɛt' },
  'dashboard.kpi.checkins_today': { en: "Check-ins Today",   idoma: "Check-ins Today" },
  'dashboard.kpi.coverage': { en: 'Coverage', idoma: 'Oká' },
  'dashboard.kpi.avg_response': { en: 'Avg Response', idoma: 'Òhì' },
  'dashboard.kpi.open_incidents': { en: 'Open Incidents', idoma: 'Aɛlā nōo i clá ŋ' },
  'dashboard.kpi.reunifications': { en: 'Reunifications', idoma: 'Ātóóbá kpɔ' },
  'dashboard.kpi.total_alerts': { en: 'Total Alerts', idoma: 'Íbá odúdú' },
  'dashboard.kpi.lgas_affected': { en: 'LGAs Affected', idoma: 'Igɔmɛnti ku ɛga má owe.' },
  'dashboard.kpi.critical_inc': { en: 'Critical Incidents', idoma: 'Aɔ̄dā Amiya' },
  'dashboard.kpi.response_rate': { en: 'Response Rate', idoma: 'Idaago ku òhì' },
  'dashboard.widget.quick_actions': { en: 'Quick Actions', idoma: 'Uyá fiafia' },
  'dashboard.widget.alert_history': { en: 'Alert History', idoma: 'Íbá Ɔ̄kā ku ɔdā nōo ya eko ikee' },
  'dashboard.widget.community_stats': { en: 'Community Stats', idoma: 'Aluka ku igeli' },
  'dashboard.widget.recent_feed': { en: 'Recent Incidents', idoma: 'Aɔ̄kā Nōo Ya Anana' },
  'dashboard.widget.view_all': { en: 'View All', idoma: 'Má odúdú' },

  // ── User Profile (Phase 3) ────────────────────────────────────────
  'profile.title': { en: 'My Profile', idoma: 'Iyē ku abōyīm' },
  'profile.personal_info': { en: 'Personal Information', idoma: 'Elā ku abɔyi' },
  'profile.notifications': { en: 'Notifications', idoma: 'Onà' },
  'profile.security': { en: 'Security', idoma: 'Upolihi / Idahanda' },
  'profile.language_region': { en: 'Language & Region', idoma: 'Úcē mlà Ajé' },
  'profile.first_name': { en: 'First Name', idoma: 'Iye ogbọbu' },
  'profile.last_name': { en: 'Last Name', idoma: 'Iye k\'apɔlɛ' },
  'profile.phone': { en: 'Phone Number', idoma: 'Aluka ku uwáyà' },
  'profile.lga': { en: 'LGA', idoma: 'Egà ku Igẹmẹnti Ajé' },
  'profile.ward': { en: 'Ward', idoma: 'Uwadu' },
  'profile.verified': { en: 'Verified Resident', idoma: 'Océ l\'ājé nōō jé ojójé' },
  'profile.change_photo': { en: 'Change Photo', idoma: 'Piyabɔ Ifoto' },
  'profile.sms_alerts': { en: 'SMS Alerts', idoma: 'Íbá ku elā uwaya' },
  'profile.in_app_notifs': { en: 'In-App Notifications', idoma: 'Aiọka ipu uwaya' },
  'profile.patrol_reminders': { en: 'Patrol Reminders', idoma: 'Aɔdā ō Tu Ɛlá Kwu ku Ō Gb\'ājē' },
  'profile.emergency_broadcast': { en: 'Emergency Broadcasts', idoma: 'Onà ku íbá' },
  'profile.change_pin': { en: 'Change PIN', idoma: 'Kwu PIN piyabɔ' },
  'profile.active_sessions': { en: 'Active Sessions', idoma: 'Ājila nōo yọ i ya uklọ' },
  'profile.two_factor': { en: 'Two-Factor Auth', idoma: 'Ō Mafu L\'aɛlā Ẹpa' },
  'profile.language': { en: 'Language', idoma: 'Uce' },
  'profile.timezone': { en: 'Timezone', idoma: 'Èkò kú ajé' },
  'profile.save': { en: 'Save Changes', idoma: 'Cè opiyabɔ' },
  'profile.discard': { en: 'Discard Changes', idoma: 'Tónū apiyabɔ' },
  'profile.logout': { en: 'Logout', idoma: 'Oōbēcè' },
  'profile.delete_account': { en: 'Delete Account', idoma: 'Tónū ɛbɛ' },

  // ─── User Dashboard (Phase 5 extensions) ───────────────────────────────
  'user.dashboard.title': { en: 'Dashboard', idoma: 'Akpà Ɔdā' },
  'user.dashboard.subtitle': { en: 'Community Safety Overview', idoma: 'Ɔdā Oobū: Ocē Ku Ogbotu Ku Ajé' },
  'user.dashboard.export': { en: 'Export', idoma: 'Tẹhọ gècè' },
  'user.dashboard.export_png': { en: 'Download as PNG', idoma: 'Downloadu ifoto' },
  'user.dashboard.export_print': { en: 'Print / PDF', idoma: 'Print nu uu-PDF' },
  'user.dashboard.activity_log': { en: 'Activity Log', idoma: 'Ɔ̄kā ku ɔdā nōo ya' },
  'user.dashboard.clear': { en: 'Clear', idoma: 'Onyaa' },
  'user.dashboard.no_activity': { en: 'No activity yet', idoma: 'Uklọ i yọ gɛ ŋ ma.' },
  'user.dashboard.no_recent': { en: 'No recent activity', idoma: 'Uklɔ duuma i yɔ énénke ŋ.' },

  // ─── Alert History ────────────────────────────────────────────────────
  'alert.filter_all': { en: 'All', idoma: 'Òdúdú' },
  'alert.filter_active': { en: 'Active', idoma: 'Obē' },
  'alert.filter_monitoring': { en: 'Monitoring', idoma: 'O jila' },
  'alert.filter_resolved': { en: 'Resolved', idoma: 'Lɛ ɔtu ya ekponu' },
  'alert.no_incidents': { en: 'No incidents found', idoma: 'É má ámíyā odúúmā ŋ́' },
  'alert.detail_id': { en: 'ID', idoma: 'Eyī' },
  'alert.detail_lga': { en: 'LGA', idoma: 'Egà ku igẹmẹnti' },
  'alert.detail_type': { en: 'Type', idoma: 'Èdò' },
  'alert.detail_reported': { en: 'Reported', idoma: 'Ka εpɔ' },

  // ─── Community Stats labels ────────────────────────────────────────────
  'stats.patrol_online': { en: 'Patrol Online', idoma: 'Gb\'áje İcō Intanɛti' },
  'stats.checkins_today':   { en: "Check-ins Today",   idoma: "Check-ins Today" },
  'stats.coverage': { en: 'Coverage', idoma: 'Owū' },
  'stats.sightings_today': { en: 'Sightings Today', idoma: 'Amá Ícɛ̀' },

  // ─── Customize Shortcuts ───────────────────────────────────────────────
  'shortcuts.customize': { en: 'Customize Shortcuts', idoma: 'Piya aiẹpā a abɔ' },
  'shortcuts.desc': { en: 'Choose up to 3 shortcuts. Drag to reorder.', idoma: 'Mìyā aépà jáā tú ètá.' },
  'shortcuts.reset': { en: 'Reset', idoma: 'Ya i cigbihi kpɔ' },
  'shortcuts.done': { en: 'Done', idoma: 'Ó mɛ' },

  // ─── Security Section ──────────────────────────────────────────────────
  'security.cancel': { en: 'Cancel', idoma: 'Ya ɛhi' },
  'security.change': { en: 'Change', idoma: 'Piyabɔ' },
  'security.current_pin': { en: 'Current PIN', idoma: 'PIN ki-ícè' },
  'security.new_pin': { en: 'New PIN (4-6 digits)', idoma: 'PIN ẹrẹre (aluka ẹpẹ-hili)' },
  'security.confirm_pin': { en: 'Confirm PIN', idoma: 'Kpɔtuce PIN' },
  'security.update_pin': { en: 'Update PIN', idoma: 'Kwú PIN Piyabɔ' },
  'security.session_current': { en: 'Current', idoma: 'Abālɔbányā' },
  'security.revoke': { en: 'Revoke', idoma: 'Kwu' },
  'security.coming_soon': { en: 'Coming soon', idoma: 'Ó gáā gboji wā' },

  // ─── Notification descriptions ────────────────────────────────────────
  'notif.desc.sms': { en: 'Receive SMS alerts for incidents in your area', idoma: 'Mīyɛ ukɔ ku SMS nōo gē tu uwɔ ɛlá kwu unwalu ipu ɛga ku uwɔ.' },
  'notif.desc.in_app': { en: 'Get push notifications within the app', idoma: 'Lɛ ōmiya ku ɔdā nōo géē tu uwɔ ɛlá kwu ɔ ipu uwaya a ya.' },
  'notif.desc.emergency': { en: 'Emergency broadcasts (always enabled)', idoma: 'Aɔtóònà íbá (ō yuklɔ gbógbóō)' },
  'notif.desc.patrol': { en: 'Patrol shift reminders and check-in prompts', idoma: 'Oblatū ku èkò ō gb\'ājē mlā íbá ku ō bī ɛpò wā.' },

  // ─── Language & Region ─────────────────────────────────────────────────
  'lang.english': { en: 'English', idoma: 'Ẹla Enefu' },
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
