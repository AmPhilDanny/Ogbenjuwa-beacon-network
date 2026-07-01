# Ogbenjuwa Citizen App — MVP Specification
**Community Safety Network · Idoma Region · Benue State, Nigeria**
*The public-facing citizen platform — what every Idoma person uses*

---

> **Version:** 1.0 — MVP Release
> **Date:** June 2026
> **Type:** Citizen Community App (public-facing)
> **Coverage:** Idoma Region — 9 LGAs, Benue State
> **Sits inside:** `Ogbenjuwa-mvp/citizen/` — same project, shared `assets/`
> **Users:** Any Idoma community member — farmer, trader, parent, youth, elder
> **Contact:** help@Ogbenjuwa.ng · Ogbenjuwa.ng/citizen

---

## Table of Contents

1. [What the Citizen App Is](#1-what-the-citizen-app-is)
2. [How It Differs From the Operator App](#2-how-it-differs-from-the-operator-app)
3. [File Structure](#3-file-structure)
4. [Citizen Auth Flow](#4-citizen-auth-flow)
5. [Page Specifications](#5-page-specifications)
   - [5.1 Home — citizen/index.html](#51-home--citizenindexhtml)
   - [5.2 Panic Button — citizen/panic.html](#52-panic-button--citizenpanichtml)
   - [5.3 Active Alerts — citizen/alerts.html](#53-active-alerts--citizenalertshtml)
   - [5.4 Report Incident — citizen/report.html](#54-report-incident--citizenreporthtml)
   - [5.5 Find Resources — citizen/resources.html](#55-find-resources--citizenresourceshtml)
   - [5.6 Find Family — citizen/family.html](#56-find-family--citizenfamilyhtml)
   - [5.7 Community Feed — citizen/feed.html](#57-community-feed--citizenfeedhtml)
   - [5.8 My Profile — citizen/profile.html](#58-my-profile--citizenprofilehtml)
   - [5.9 Citizen Login — citizen/login.html](#59-citizen-login--citizenloginhtml)
6. [Shared Citizen Data Layer](#6-shared-citizen-data-layer)
7. [Offline & 2G Behaviour](#7-offline--2g-behaviour)
8. [Language Toggle — Idoma / English](#8-language-toggle--idoma--english)
9. [Citizen Component Library](#9-citizen-component-library)
10. [SMS Fallback Reference](#10-sms-fallback-reference)
11. [Deployment Checklist](#11-deployment-checklist)
12. [MVP Cost](#12-mvp-cost)

---

## 1. What the Citizen App Is

The citizen app is what **Mama Ojoma in Agatu**, **the youth in Otukpo**, and **every Idoma household** actually uses day to day. It is the community-facing layer of Ogbenjuwa — simpler, faster, more emotional, and built for people who may never have used a safety app before.

Where the operator app is a tool for trained coordinators, the citizen app is a **lifeline in someone's pocket**. It must work on a ₦15,000 Tecno phone with 200MB data left. It must be usable in darkness, in fear, one-handed, in Idoma.

### Core citizen capabilities
| # | Capability | One-sentence description |
|---|-----------|--------------------------|
| 1 | **Panic Button** | One tap sends your GPS location and a distress signal to your registered emergency contacts and nearest community admin |
| 2 | **Receive Alerts** | Push notifications + in-app alert feed for all active incidents near your LGA |
| 3 | **Report Incident** | Submit a text, photo, voice, or GPS report — queued offline, syncs when connected |
| 4 | **Find Resources** | Map and list of nearest shelter, water, medical posts, and food distribution during displacement |
| 5 | **Find Family** | Search the reunification registry; register yourself or a missing person |
| 6 | **Community Feed** | Neighbourhood safety updates from verified community admins and vigilante leaders in your LGA |
| 7 | **My Profile** | Emergency contacts, LGA registration, language preference, alert subscription settings |

---

## 2. How It Differs From the Operator App

| Dimension | Operator App | Citizen App |
|-----------|-------------|------------|
| **Who uses it** | Trained admins, vigilante leaders, LGA coordinators | Any Idoma community member |
| **Auth** | Phone OTP + role selection + admin approval | Phone OTP only — self-registration, instant access |
| **Primary action** | Send & manage alerts, coordinate patrol, command view | Receive alerts, send panic, report, find family |
| **Map access** | Full patrol coordination, sighting management, zone editing | View-only map: resources, active incidents, evacuation routes |
| **Complexity** | Multi-panel dashboards, analytics, data tables | Single-purpose screens, large tap targets, minimal text |
| **Language default** | English (with Idoma toggle) | **Idoma (with English toggle)** |
| **Bottom nav** | Top navigation bar | **Bottom tab bar** — thumb-reachable on mobile |
| **Font sizes** | Standard (13–16px body) | Larger (16–20px body) — elderly users, low literacy |
| **Offline behaviour** | Queues operator actions | Queues citizen reports + caches alert history |
| **Location** | `Ogbenjuwa-mvp/*.html` (root) | `Ogbenjuwa-mvp/citizen/*.html` (subfolder) |
| **Shared assets** | `../assets/style.css`, `../assets/app.js` | Same — paths go one level up |

---

## 3. File Structure

```
Ogbenjuwa-mvp/
├── index.html              ← Operator landing (existing)
├── alert.html              ← Operator alert system (existing)
├── patrol.html             ← Operator patrol map (existing)
├── assets/
│   ├── style.css           ← Shared design tokens (existing)
│   └── app.js              ← Shared data + operator auth (existing)
│
└── citizen/                ← NEW — all citizen pages live here
    ├── index.html          ← Citizen home dashboard
    ├── login.html          ← Citizen OTP registration & login
    ├── panic.html          ← Panic button + emergency contacts
    ├── alerts.html         ← Active alerts near me
    ├── report.html         ← Report an incident
    ├── resources.html      ← Find shelter, water, medical, food
    ├── family.html         ← Find family / register missing person
    ├── feed.html           ← Community safety feed
    ├── profile.html        ← My profile & settings
    └── assets/
        ├── citizen.css     ← Citizen-specific styles (extends shared)
        └── citizen.js      ← Citizen data, auth, nav, utilities
```

### Path conventions for citizen pages
```html
<!-- Link to shared assets (one level up) -->
<link rel="stylesheet" href="../assets/style.css">
<link rel="stylesheet" href="assets/citizen.css">
<script src="../assets/app.js"></script>
<script src="assets/citizen.js"></script>
```

---

## 4. Citizen Auth Flow

### Registration (first time)
```
citizen/login.html
─────────────────────────────────────────────────────
Step 1: Enter name (preferred name, any language)
        + Nigerian phone number (+234 XXX XXX XXXX)

Step 2: Enter 6-digit OTP
        Demo OTP: 123456 (shown as hint on screen)
        3 attempts max → 15 min lockout

Step 3: Select your LGA  (dropdown — 9 Idoma LGAs)
        Select your village (text field)

Step 4: Choose language preference
        ○ Idoma (default)
        ○ English

Step 5: Add up to 3 emergency contacts
        (names + phone numbers — shown on panic screen)
        Can skip, set later in Profile

→ Session created → redirect to citizen/index.html
```

### Login (returning user)
```
citizen/login.html
─────────────────────────────────────────────────────
Step 1: Enter phone number
Step 2: Enter OTP
→ Session loaded → redirect to citizen/index.html
```

### Citizen session object
```js
{
  phone: '+234 803 441 2290',
  name: 'Mama Ojoma',
  lga: 'Agatu',
  village: 'Oglewu',
  language: 'idoma',           // 'idoma' | 'english'
  emergencyContacts: [
    { name: 'Daniel (son)', phone: '+234 806 553 1177' },
    { name: 'Pastor James', phone: '+234 809 334 5521' },
  ],
  alertSubscriptions: ['Agatu', 'Otukpo'],  // LGAs to receive alerts from
  token: 'CITIZEN-demo-xxxxxxxx',
  loginAt: Date.now(),
  expiresAt: Date.now() + 72 * 60 * 60 * 1000,   // 72-hour citizen session
  type: 'citizen'              // distinguishes from operator session
}
```

### Citizen auth guard (`citizen/assets/citizen.js`)
```js
function requireCitizenAuth(redirectTo = 'login.html') {
  const raw = sessionStorage.getItem('OgbenjuwaCitizenAuth');
  if (!raw) { window.location.href = redirectTo; return null; }
  try {
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem('OgbenjuwaCitizenAuth');
      window.location.href = redirectTo;
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem('OgbenjuwaCitizenAuth');
    window.location.href = redirectTo;
    return null;
  }
}
```

> **Key difference from operator auth:** Citizen sessions last **72 hours** (not 8). Citizens should not need to re-authenticate every workday. No role selection — all citizens have identical access.

---

## 5. Page Specifications

---

### 5.1 Home — `citizen/index.html`

**Purpose:** The citizen's daily safety dashboard. Glanceable at-a-time view of their LGA status, quick access to all features, and the most recent alert if one is active.

#### Layout
- **Top bar:** Ogbenjuwa logo (left), `👤 Mama Ojoma` name + LGA badge (right), language toggle (🇬🇧 / Idoma)
- **Safety status card** (hero, full width) — one of three states:
  - 🟢 **All Clear** — "Your area is quiet. No active alerts near Agatu LGA."
  - 🟡 **Monitoring** — "Suspicious activity reported near Otukpo. Stay alert."
  - 🔴 **ACTIVE ALERT** — Red pulsing card with alert type, village, time since reported
- **Quick action grid** (2×2, large tap targets ≥80px height):
  - 🚨 Panic Button → `panic.html`
  - 📋 Report Incident → `report.html`
  - 🗺️ Find Resources → `resources.html`
  - 👥 Find Family → `family.html`
- **Recent alerts strip** — horizontal scroll of last 3 alerts in citizen's subscribed LGAs
- **Community feed preview** — 2 most recent posts from `feed.html`, "See all →" link
- **Bottom tab bar** (fixed, 5 tabs):
  - 🏠 Home · 🔔 Alerts · 📋 Report · 👥 Family · 👤 Profile

#### Safety status logic (MVP — simulated)
```js
const SAFETY_STATES = {
  clear:      { level: 'clear',     color: '#22C55E', label: 'Ilu di mma',    sublabel: 'All Clear' },
  monitoring: { level: 'monitoring',color: '#F59E0B', label: 'Cheta ebe',     sublabel: 'Stay Alert' },
  active:     { level: 'active',    color: '#EF4444', label: 'Ihe ize ndụ!', sublabel: 'DANGER' },
};
```

In demo: status rotates every 8 seconds through the three states to show investors all states.

#### Key UI behaviours
- Active alert card pulses with CSS animation (same `.badge-pulse` pattern)
- Quick action buttons have large icons (32px), bold labels in current language
- Bottom tab bar is `position: fixed; bottom: 0` — 64px height, always visible
- Active tab shows green underline indicator

---

### 5.2 Panic Button — `citizen/panic.html`

**Purpose:** The most critical screen in the citizen app. One tap sends distress. Zero friction.

#### Design requirements
- **Entire screen** is dominated by one large red button (200px diameter minimum)
- **No other interactive elements** above the fold except the button
- Button label: `"PANIC" / "GBAA OSO"` (Idoma for "Run! / Help!")
- Below button: `"Your location will be shared with your emergency contacts and your LGA community admin"`
- Emergency contacts list shown below (from profile), each with a direct call button

#### Panic trigger sequence
```
1. User taps PANIC button
2. Button shows 3-second countdown with "Hold to confirm" ring animation
   (prevents accidental triggers)
   - Can cancel by tapping again during countdown
3. On confirm:
   a. GPS location captured (browser Geolocation API)
   b. Demo: shows "Sending..." with animated progress
   c. Demo: shows confirmation — "✓ Alert sent to 3 contacts + Agatu LGA Admin"
   d. Screen shows: "HELP IS COMING · Ref: AMU-PANIC-3847"
   e. Large "CALL LGA EMERGENCY LINE" button appears: tel:+23480XXXXXXX
4. On-screen timer starts counting up: "Alert sent 0:32 ago"
5. "I am safe now" button shown — cancels the alert, sends "False alarm" notice
```

#### Emergency contacts display
```html
<!-- Each contact card -->
<div class="contact-card">
  <div class="contact-name">Daniel (son)</div>
  <div class="contact-phone">+234 806 553 1177</div>
  <a href="tel:+2348065531177" class="btn btn-outline btn-sm">📞 Call Now</a>
</div>
```

If no emergency contacts set: show `"You have no emergency contacts set. [Add contacts →]"` linking to profile.

#### SMS fallback shown below
```
No internet? Send this SMS to 347:
PANIC [your name] [your village]
Example: PANIC Ojoma Agatu Oglewu
```

---

### 5.3 Active Alerts — `citizen/alerts.html`

**Purpose:** Full list of active and recent alerts in the citizen's subscribed LGAs. Push notification hub.

#### Layout
- **Filter tabs** (horizontal scroll): All · Agatu · Otukpo · Apa · Obi · [other LGAs]
- **Active alerts section** (red header) — currently active incidents
- **Recent alerts section** (last 24 hours, greyed)
- **Subscription settings** link — "Manage which LGAs you receive alerts from →"

#### Alert card
```
┌─────────────────────────────────────────────────┐
│ ⚔️  Armed Attack                  🔴 ACTIVE     │
│ Oglewu village, Agatu LGA                        │
│ Reported 14 minutes ago by Community Admin       │
│                                                  │
│ ⚠️  Seek shelter. Avoid farm roads.              │
│                                                  │
│ [📞 Call LGA Emergency]  [🗺️ Get Safe Route]    │
└─────────────────────────────────────────────────┘
```

#### Alert card data model
```js
{
  id: 'AMU-3847',
  type: 'attack',            // attack|fire|medical|abduction|other
  typeLabel: 'Armed Attack',
  typeIdoma: 'Ufele',
  icon: '⚔️',
  village: 'Oglewu',
  lga: 'Agatu',
  status: 'active',          // active|monitoring|resolved
  reportedAt: Date.now() - 14 * 60 * 1000,
  reportedBy: 'Community Admin',
  safetyInstruction: 'Seek shelter. Avoid farm roads.',
  safetyInstructionIdoma: 'Nọọ n\'ụlọ. Ịzọ n\'ụzọ ugbo.',
  resolvedAt: null,
}
```

#### Demo alerts (pre-loaded)
```js
const CITIZEN_ALERTS = [
  { id:'AMU-3847', type:'attack',   village:'Oglewu',  lga:'Agatu',   status:'active',    reportedAt: Date.now()-14*60*1000 },
  { id:'AMU-3801', type:'fire',     village:'Otukpo',  lga:'Otukpo',  status:'monitoring',reportedAt: Date.now()-2*60*60*1000 },
  { id:'AMU-3788', type:'medical',  village:'Igumale', lga:'Apa',     status:'resolved',  reportedAt: Date.now()-5*60*60*1000 },
  { id:'AMU-3762', type:'attack',   village:'Otukpa',  lga:'Ado',     status:'resolved',  reportedAt: Date.now()-22*60*60*1000 },
];
```

#### Relative time display
```js
function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}
```

---

### 5.4 Report Incident — `citizen/report.html`

**Purpose:** Citizen submits an incident report. Offline-first — queues locally, syncs on connection.

#### Layout — single-column, step by step
```
Step 1: What happened?  [4 large icon buttons: Attack · Fire · Medical · Other]
Step 2: Where?          [GPS auto-detect button] OR [Village dropdown]
Step 3: Details         [Text area — Idoma or English, placeholder in both]
Step 4: Photo (optional)[Camera button → file input accept="image/*"]
Step 5: How urgent?     [HIGH / MED / LOW — coloured buttons]
        [SUBMIT REPORT]
```

#### GPS capture
```js
async function getLocation() {
  const btn = document.getElementById('gps-btn');
  btn.textContent = 'Getting location...';
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
    );
    const { latitude: lat, longitude: lng } = pos.coords;
    document.getElementById('gps-display').textContent =
      `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)} — accuracy ±${Math.round(pos.coords.accuracy)}m`;
    return { lat, lng };
  } catch {
    btn.textContent = '📍 Could not get location — select village instead';
    return null;
  }
}
```

#### Offline queue (MVP — `sessionStorage`)
```js
function queueReport(report) {
  const queue = JSON.parse(sessionStorage.getItem('OgbenjuwaReportQueue') || '[]');
  queue.push({ ...report, id: 'LOCAL-' + Date.now(), status: 'pending', createdAt: Date.now() });
  sessionStorage.setItem('OgbenjuwaReportQueue', JSON.stringify(queue));
  showToast('Report saved. Will send when connected.');
}
```

In Phase 2: replace with IndexedDB + Service Worker background sync.

#### Photo capture
```html
<input type="file" id="photo-input" accept="image/*" capture="environment" style="display:none">
<button onclick="document.getElementById('photo-input').click()" class="btn btn-outline">
  📷 Add Photo
</button>
<div id="photo-preview" style="display:none;">
  <img id="preview-img" style="max-width:100%;border-radius:10px;margin-top:12px;">
  <button onclick="removePhoto()" class="btn btn-sm" style="margin-top:8px;">Remove</button>
</div>
```

#### Submission confirmation
```
✅ Report submitted
Reference: AMU-RPT-5512
Your report has been sent to the Agatu LGA Community Admin.
You will receive an SMS update when it is reviewed.
```

---

### 5.5 Find Resources — `citizen/resources.html`

**Purpose:** Find the nearest shelter, water, medical post, and food during displacement.

#### Layout
- **Resource type filter tabs**: All · 🏠 Shelter · 💧 Water · 🏥 Medical · 🍽️ Food
- **Leaflet map** (top half, 300px height) — pins for all resources in current LGA
- **Resource list** (bottom half, scrollable) — sorted by distance if GPS available

#### Resource card
```
┌─────────────────────────────────────────────────┐
│ 🏠 St. John's Primary School                    │
│ Otukpo LGA · Shelter                            │
│ ████████████░░ 143 / 200 capacity (72%)         │
│ Health worker on site: ✅                        │
│ [🗺️ Get Directions]  [📞 Contact Admin]         │
└─────────────────────────────────────────────────┘
```

#### Capacity bar colour logic
```js
function capacityColor(occupied, capacity) {
  if (!capacity) return '#6B7280';
  const pct = occupied / capacity;
  if (pct < 0.6) return '#22C55E';   // Green — space available
  if (pct < 0.85) return '#F59E0B';  // Amber — filling up
  return '#EF4444';                   // Red — nearly full
}
```

#### USSD fallback shown prominently
```
No internet? Dial:
*347*2*[LGA code]#
Example: *347*2*AGT# for Agatu resources
```

#### Map behaviour
- Same Leaflet setup as operator app (shared CDN links)
- Resource type colours: Shelter=blue, Water=cyan, Medical=red, Food=amber
- Click pin → resource card scrolls into view + highlights
- "Near me" button triggers GPS and sorts list by distance

---

### 5.6 Find Family — `citizen/family.html`

**Purpose:** Search for separated family members. Register yourself or report someone missing.

#### Tab structure
```
[🔍 Search]  [📝 Register Myself]  [➕ Report Missing]  [📋 My Cases]
```

#### Search tab
Identical search interface to operator `reunify.html` but with:
- Larger input fields (mobile-first)
- Idoma-first labels
- Results show "SMS to connect" option prominently (for users without smartphones)
- No admin controls (cannot issue reunion codes — that triggers an SMS to an operator)

#### Register Myself tab
```
Your name: [input]
Idoma name (if different): [input]
Age: [number input]
LGA you're in now: [dropdown]
Village you're in now: [text]
Are you at a shelter/camp? [Yes/No toggle]
  If yes → which one: [dropdown from RESOURCES]
Your phone number: [pre-filled from session]
Any injuries or medical needs? [text]
[Register Now]
```

#### Report Missing Person tab
```
Their name: [input]
Idoma name: [input]
Approximate age: [number]
Last seen in: [LGA dropdown] + [village text]
Relationship to you: [dropdown: child/parent/spouse/sibling/other]
Any identifying features: [text]
Photo (optional): [file input]
[Submit Report]
```

#### My Cases tab
List of cases this citizen has opened (registered self or reported missing).
Each case shows: Reference ID, status badge, last updated, action button.

#### SMS fallback
```
No smartphone? Send:
FIND ME [name] [age] [village] → sends to 347
FIND [name] [age] [LGA]        → search by SMS
```

---

### 5.7 Community Feed — `citizen/feed.html`

**Purpose:** Verified safety updates from community admins and vigilante leaders. The neighbourhood safety conversation.

#### Layout
- **Feed header:** "Agatu LGA Safety Feed" + subscriber count badge
- **LGA selector** (if citizen subscribed to multiple LGAs)
- **Post stream** — chronological, newest first
- **Post types:**
  - 🔴 **Alert** (red border) — from operator app, auto-posted to feed
  - 🟡 **Update** (amber border) — situation update from community admin
  - 🟢 **Clear** (green border) — all-clear confirmation
  - 📢 **Notice** (blue border) — community information (market day, road closure)

#### Feed post card
```
┌─────────────────────────────────────────────────┐
│ 🟡 Community Admin · Agatu LGA    14 min ago    │
│ ─────────────────────────────────────────────── │
│ Update: Security forces have arrived at         │
│ Oglewu junction. Situation being managed.       │
│ Remain indoors until further notice.            │
│                                                 │
│ 47 people saw this  ·  [👍 Noted]  [🔔 Share]  │
└─────────────────────────────────────────────────┘
```

#### Post data model
```js
{
  id: 'POST-001',
  type: 'update',         // alert|update|clear|notice
  author: 'Community Admin',
  authorRole: 'community_admin',
  lga: 'Agatu',
  body: 'Security forces have arrived...',
  bodyIdoma: 'Ndị nche eruola...',
  createdAt: Date.now() - 14 * 60 * 1000,
  viewCount: 47,
  verified: true,
}
```

#### Demo posts (pre-loaded)
```js
const CITIZEN_FEED = [
  { id:'POST-001', type:'update',  author:'Agatu Community Admin',  lga:'Agatu',  body:'Security forces arrived at Oglewu junction. Remain indoors.', createdAt: Date.now()-14*60*1000 },
  { id:'POST-002', type:'clear',   author:'Otukpo LGA Coordinator', lga:'Otukpo', body:'All-clear confirmed for Otukpo South. Fire is fully extinguished.', createdAt: Date.now()-2*60*60*1000 },
  { id:'POST-003', type:'notice',  author:'Apa Community Admin',    lga:'Apa',    body:'Weekly market at Igumale is postponed to Thursday due to security concerns.', createdAt: Date.now()-5*60*60*1000 },
  { id:'POST-004', type:'alert',   author:'Ogbenjuwa SYSTEM',            lga:'Agatu',  body:'Armed attack reported near Oglewu. Seek shelter immediately.', createdAt: Date.now()-16*60*1000 },
];
```

#### Interaction rules
- Citizens can tap "Noted" (thumbs up equivalent) — increments view count
- Citizens can "Share" — copies a text summary to clipboard for WhatsApp
- Citizens **cannot post** to the feed — only verified operators can post
- "Share" text: `"[Ogbenjuwa ALERT] Armed attack near Oglewu, Agatu LGA. 14 min ago. Stay safe. Ogbenjuwa.ng"`

---

### 5.8 My Profile — `citizen/profile.html`

**Purpose:** Citizen account settings, emergency contacts, alert subscriptions, language preference.

#### Sections

**Personal Information**
```
Name: Mama Ojoma                    [Edit]
Phone: +234 803 441 2290
LGA: Agatu
Village: Oglewu
Language: Idoma ●  English ○       [Change]
```

**Emergency Contacts** (up to 3)
```
1. Daniel (son) · +234 806 553 1177    [Call] [Remove]
2. Pastor James · +234 809 334 5521   [Call] [Remove]
3. [+ Add contact]
```

**Alert Subscriptions**
```
Receive alerts from:
☑ Agatu LGA (home)
☑ Otukpo LGA
☐ Apa LGA
☐ Ado LGA
☐ Okpokwu LGA
☐ Obi LGA
[Save preferences]
```

**Notification Settings**
```
☑ In-app alerts
☑ SMS alerts (always on — cannot be disabled)
☐ Vibration only (silent mode)
```

**Safety Card** (downloadable / printable)
```
My Ogbenjuwa Safety Card
Name: Mama Ojoma
LGA: Agatu · Village: Oglewu
Emergency: +234 806 553 1177 (Daniel)
Ogbenjuwa Helpline: *347#
Registration: AMU-2891
```

**Account**
```
[📞 Change phone number]
[🌐 Switch to English / Idoma]
[🔓 Log out]
[⚠️  Delete my account]
```

---

### 5.9 Citizen Login — `citizen/login.html`

Full 5-step registration / 2-step returning login described in Section 4.

**Design requirements specific to citizen login:**
- Background: same dark `--ink` (#0D1F14) as all other pages
- Language selector shown at the very top before any fields: `[🇬🇧 English] [Idoma]`
- Steps shown as progress dots (not numbered list)
- All labels in both Idoma and English simultaneously (not toggled — both visible)
- "Help" button (bottom) → shows SMS fallback: `"Can't log in? Call *347# from any phone"`
- No "forgot password" — no passwords exist. Always OTP.

---

## 6. Shared Citizen Data Layer

**File:** `citizen/assets/citizen.js`
**Export:** `window.CITIZEN`

```js
window.CITIZEN = {
  // Auth
  requireCitizenAuth,   // () => session | null
  getCitizenSession,    // () => session | null
  createCitizenSession, // (phone, name, lga, village, language) => session
  citizenLogout,        // () => void

  // Nav
  initCitizenNav,       // (activePage) => void — injects bottom tab bar

  // Data
  CITIZEN_ALERTS,       // Active + recent alert objects
  CITIZEN_FEED,         // Community feed post objects
  CITIZEN_RESOURCES,    // Extended resource list with capacity
  SAFETY_STATES,        // clear | monitoring | active state objects

  // Language
  t,                    // (key) => string — translation lookup
  getCurrentLang,       // () => 'idoma' | 'english'
  setLang,              // (lang) => void

  // Utilities
  timeAgo,              // (timestamp) => string ("14 min ago")
  capacityColor,        // (occupied, capacity) => hex color
  generateReunionCode,  // () => 'REU-XXXX'
  queueReport,          // (report) => void — saves to sessionStorage
  getQueuedReports,     // () => report[]
};
```

### Translation object structure
```js
const TRANSLATIONS = {
  idoma: {
    'home':           'Ulo',
    'alerts':         'Obe',
    'report':         'Kọọ',
    'family':         'Ezinulo',
    'profile':        'Onwe m',
    'panic':          'Gbaa Oso!',
    'all_clear':      'Ilu di mma',
    'active_alert':   'Ihe ize ndụ!',
    'seek_shelter':   'Nọọ n\'ụlọ',
    'help_coming':    'Enyemaka na-abịa',
    'send_alert':     'Zipu Obe',
    'find_family':    'Cheta Ezinulo',
    'find_resources': 'Chere Obe',
    'emergency':      'Oge ọchịchọ',
    'report_incident':'Kọọ ihe mere',
  },
  english: {
    'home':           'Home',
    'alerts':         'Alerts',
    'report':         'Report',
    'family':         'Family',
    'profile':        'Profile',
    'panic':          'PANIC',
    'all_clear':      'All Clear',
    'active_alert':   'ACTIVE ALERT',
    'seek_shelter':   'Seek shelter',
    'help_coming':    'Help is coming',
    'send_alert':     'Send Alert',
    'find_family':    'Find Family',
    'find_resources': 'Find Resources',
    'emergency':      'Emergency',
    'report_incident':'Report Incident',
  }
};

function t(key) {
  const lang = getCurrentLang();
  return (TRANSLATIONS[lang] || TRANSLATIONS['english'])[key] || key;
}
```

---

## 7. Offline & 2G Behaviour

### What works without internet

| Feature | Offline behaviour |
|---------|-----------------|
| View recent alerts | Cached in `sessionStorage` — last 10 alerts always available |
| View emergency contacts | Stored in session — always available |
| Panic button | Shows contacts for manual calling; queues digital panic to send when connected |
| Submit report | Queued in `sessionStorage.OgbenjuwaReportQueue`, sends on reconnect |
| View resources | Cached resource list from last successful load |
| View feed posts | Cached last 10 posts |
| Register for reunification | Queued in `sessionStorage`, sends on reconnect |

### What requires internet

| Feature | Offline message shown |
|---------|----------------------|
| Live alert map | "No connection — showing last known data" |
| New alerts from server | "Checking for new alerts when connected" |
| Submit photo with report | "Photo will upload when connected" |
| Search family registry | "Search requires connection — use SMS: FIND [name] [age] [LGA] → 347" |

### Connection status indicator
```html
<!-- Always shown in bottom bar when offline -->
<div id="offline-banner" style="display:none;
  background:rgba(180,83,9,0.9);padding:8px 16px;text-align:center;
  font-size:12px;color:white;position:fixed;top:64px;left:0;right:0;z-index:999;">
  📴 No connection — using saved data · SMS: *347#
</div>
```
```js
window.addEventListener('online',  () => document.getElementById('offline-banner').style.display='none');
window.addEventListener('offline', () => document.getElementById('offline-banner').style.display='block');
```

---

## 8. Language Toggle — Idoma / English

### Toggle UI (top-right of every citizen page)
```html
<div class="lang-toggle" id="lang-toggle">
  <button class="lang-btn" id="btn-idoma" onclick="setLang('idoma')">Idoma</button>
  <button class="lang-btn" id="btn-english" onclick="setLang('english')">EN</button>
</div>
```

### CSS
```css
.lang-toggle {
  display: flex; gap: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 20px; padding: 3px;
}
.lang-btn {
  font-size: 12px; font-weight: 600;
  border: none; border-radius: 16px;
  padding: 4px 12px; cursor: pointer;
  background: transparent; color: var(--muted);
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.2s;
}
.lang-btn.active {
  background: var(--green-mid); color: white;
}
```

### `setLang()` implementation
```js
function setLang(lang) {
  const session = getCitizenSession();
  if (session) {
    session.language = lang;
    sessionStorage.setItem('OgbenjuwaCitizenAuth', JSON.stringify(session));
  }
  // Update all [data-i18n] elements on current page
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  // Update toggle button states
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${lang}`)?.classList.add('active');
}
```

### Usage in HTML
```html
<!-- Every visible text element that should translate carries data-i18n -->
<button class="sos-btn" data-i18n="panic">Gbaa Oso!</button>
<p data-i18n="seek_shelter">Nọọ n'ụlọ</p>
```

---

## 9. Citizen Component Library

### Bottom Tab Bar (fixed, all citizen pages)
```html
<nav class="citizen-tabs" id="citizen-tabs">
  <a href="index.html"     class="tab-item" data-tab="home">
    <span class="tab-icon">🏠</span>
    <span class="tab-label" data-i18n="home">Ulo</span>
  </a>
  <a href="alerts.html"    class="tab-item" data-tab="alerts">
    <span class="tab-icon">🔔</span>
    <span class="tab-label" data-i18n="alerts">Obe</span>
    <span class="tab-badge" id="alert-badge" style="display:none;">3</span>
  </a>
  <a href="report.html"    class="tab-item tab-center" data-tab="report">
    <div class="tab-report-btn">📋</div>
  </a>
  <a href="family.html"    class="tab-item" data-tab="family">
    <span class="tab-icon">👥</span>
    <span class="tab-label" data-i18n="family">Ezinulo</span>
  </a>
  <a href="profile.html"   class="tab-item" data-tab="profile">
    <span class="tab-icon">👤</span>
    <span class="tab-label" data-i18n="profile">Onwe m</span>
  </a>
</nav>
```

### Safety Status Card
```html
<div class="safety-card safety-clear" id="safety-card">
  <div class="safety-icon">🟢</div>
  <div>
    <div class="safety-level" data-i18n="all_clear">Ilu di mma</div>
    <div class="safety-sub">No active alerts near Agatu LGA</div>
  </div>
</div>
```

### Quick Action Button
```html
<a href="panic.html" class="quick-action quick-danger">
  <div class="qa-icon">🚨</div>
  <div class="qa-label" data-i18n="panic">Gbaa Oso!</div>
</a>
```

### Alert Card (citizen view)
```html
<div class="citizen-alert-card alert-active">
  <div class="alert-card-header">
    <span class="alert-icon">⚔️</span>
    <span class="alert-type">Armed Attack · Ufele</span>
    <span class="badge badge-red badge-pulse">ACTIVE</span>
  </div>
  <div class="alert-location">Oglewu, Agatu LGA</div>
  <div class="alert-time">14 minutes ago</div>
  <div class="alert-instruction">⚠️ Seek shelter. Avoid farm roads.</div>
  <div class="alert-actions">
    <a href="tel:+234000000" class="btn btn-danger btn-sm">📞 Emergency</a>
    <a href="resources.html" class="btn btn-outline btn-sm">🗺️ Find Shelter</a>
  </div>
</div>
```

### Toast Notification
```js
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `citizen-toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('visible'), 10);
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

---

## 10. SMS Fallback Reference

Every citizen page shows the relevant SMS command for the feature it hosts.

| Page | SMS Command | Example |
|------|------------|---------|
| Panic | `PANIC [name] [village]` | `PANIC Ojoma Oglewu` |
| Alerts | `OBE [LGA code]` | `OBE AGT` → active alerts for Agatu |
| Report | `REPORT [type] [location] [desc]` | `REPORT FIRE AGATU bush near road` |
| Resources | `*347*2*[LGA]#` via USSD | `*347*2*OTK#` |
| Family Search | `FIND [name] [age] [LGA]` | `FIND Ene Ojoma 52 Agatu` |
| Family Register | `FIND ME [name] [age] [village]` | `FIND ME Ojoma 52 Oglewu` |
| Feed | `NEWS [LGA]` | `NEWS AGT` → latest 3 posts for Agatu |

SMS shortcode for all commands: **347**

---

## 11. Deployment Checklist

- [ ] `citizen/` subfolder created inside `Ogbenjuwa-mvp/`
- [ ] All 9 citizen HTML files present (index, login, panic, alerts, report, resources, family, feed, profile)
- [ ] `citizen/assets/citizen.css` linked with `../assets/style.css` as base
- [ ] `citizen/assets/citizen.js` linked with `../assets/app.js` loaded first
- [ ] Language toggle visible and functional on all citizen pages
- [ ] Idoma is the default language (not English)
- [ ] Bottom tab bar renders and correct tab is highlighted on each page
- [ ] Citizen login registers with name + phone + LGA in 5 steps
- [ ] Demo OTP `123456` shown as hint on login page
- [ ] Session stored as `OgbenjuwaCitizenAuth` (not `OgbenjuwaAuth` — different key)
- [ ] Panic button shows 3-second countdown before sending
- [ ] "I am safe now" button shown after panic trigger
- [ ] Report form GPS capture works (or shows village fallback)
- [ ] Report queued to `sessionStorage` when offline banner shows
- [ ] Offline banner appears when `navigator.onLine === false`
- [ ] Resource capacity bars show correct colours
- [ ] Family search returns 2 results for "Ene Ojoma"
- [ ] Community feed shows 4 posts with correct type borders
- [ ] Profile shows emergency contacts with call links
- [ ] Language toggle switches all `[data-i18n]` elements on page
- [ ] All pages load under 5 seconds on throttled 3G
- [ ] All tap targets ≥44×44px on 375px viewport
- [ ] Panic button minimum 200px diameter

---

## 12. MVP Cost

| Item | Cost |
|------|------|
| Citizen pages (9 HTML files) | ₦0 |
| Shared assets (already built) | ₦0 |
| Leaflet maps (same CDN) | ₦0 |
| Google Fonts (same CDN) | ₦0 |
| No additional hosting needed | ₦0 |
| **Total additional MVP cost** | **₦0** |

The citizen app is a subfolder in the same Vercel project. Zero additional deployment cost.

---

*Ogbenjuwa Community Safety Network · Citizen App*
*Idoma Region, Benue State, Nigeria · June 2026*
*Document: CITIZEN-MVP-SPEC-1.0*
