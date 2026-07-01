# Ogbenjuwa Citizen Platform — Full Specification
**Community Safety Network · Idoma Region · Benue State · Nigeria**
*The community-facing platform — what every Idoma person uses to stay safe*
*Version 1.0 — June 2026 · CONFIDENTIAL*

---

## Table of Contents

1. [Vision & Purpose](#1-vision--purpose)
2. [Who the Citizen Platform Serves](#2-who-the-citizen-platform-serves)
3. [Citizen Personas](#3-citizen-personas)
4. [Feature Set — Full Platform](#4-feature-set--full-platform)
5. [Platform Architecture](#5-platform-architecture)
6. [Authentication & Registration](#6-authentication--registration)
7. [Module Specifications](#7-module-specifications)
8. [Offline-First Architecture](#8-offline-first-architecture)
9. [Idoma Language System](#9-idoma-language-system)
10. [Push Notifications](#10-push-notifications)
11. [Security & Privacy](#11-security--privacy)
12. [Technology Stack](#12-technology-stack)
13. [Data Architecture](#13-data-architecture)
14. [Citizen Governance & Trust](#14-citizen-governance--trust)
15. [Integration with Operator Platform](#15-integration-with-operator-platform)
16. [Performance Requirements](#16-performance-requirements)
17. [Accessibility Requirements](#17-accessibility-requirements)
18. [Roadmap — Citizen Platform](#18-roadmap--citizen-platform)
19. [Success Metrics](#19-success-metrics)

---

## 1. Vision & Purpose

The Ogbenjuwa Citizen Platform is the **community-facing layer** of the Ogbenjuwa Community Safety Network. Where the operator platform serves trained coordinators and LGA officials, the citizen platform serves every Idoma household — the farmer in Agatu, the market trader in Otukpo, the mother in Apa, the student in Obi.

### The citizen platform exists to answer four questions in a crisis

> *"Am I in danger right now?"* → **Safety Status + Active Alerts**
> *"How do I call for help?"* → **Panic Button**
> *"Where do I go?"* → **Resource Map + Evacuation Routes**
> *"Where is my family?"* → **Family Reunification**

Everything else in the citizen platform — community feed, incident reporting, profile — exists to serve these four questions before, during, and after a crisis.

### Design philosophy
- **Speed over completeness** — the most important action on every screen is reachable in one tap
- **Idoma-first** — the platform speaks Idoma by default, English by choice
- **Trusted over technical** — citizens trust their community admin. The platform reflects this chain of trust.
- **Works when it's hardest** — designed for the moment of fear, darkness, poor signal, one hand

---

## 2. Who the Citizen Platform Serves

### User segments by phone type

| Segment | Device | Network | % of Idoma adult population (est.) |
|---------|--------|---------|--------------------------------------|
| Feature phone users | Nokia/Itel basic phone | 2G only | ~45% |
| Entry Android users | Tecno Spark / Infinix Smart | 2G–3G | ~35% |
| Mid-range Android users | Tecno Camon / Samsung A-series | 3G–4G | ~17% |
| iPhone / high-end Android | iPhone / Samsung S-series | 4G | ~3% |

### What this means for the platform
- The citizen **web app** targets entry Android users (35%) as the primary smartphone experience
- The citizen **SMS channel** serves feature phone users (45%) as a complete alternative
- The citizen **USSD channel** serves anyone with any phone and any network
- Feature phone users are NOT second-class citizens — their SMS experience is complete, not stripped down

---

## 3. Citizen Personas

### Persona A — Mama Ojoma, 52, Agatu LGA
**Device:** Nokia 105 · **Network:** MTN 2G · **Language:** Idoma only
**Situation:** Farmer. Has been through two attacks. Her son installed Ogbenjuwa on his phone and registered her number. She receives SMS alerts automatically. She dials `*347#` to report what she sees.
**What she needs:** Receive alerts in Idoma by SMS. Dial to report. Know where to go. Find her husband.
**What the platform must NOT do:** Require a smartphone. Require English. Require data.

### Persona B — Emeka Ochoche, 24, Otukpo LGA
**Device:** Tecno Spark 8 · **Network:** MTN 3G · **Language:** Idoma + English
**Situation:** Youth. Uses WhatsApp daily. Registered on Ogbenjuwa after the last attack. Has the app bookmarked in Chrome. His grandmother is in Agatu — he wants to know if she is safe when incidents happen.
**What he needs:** Push notifications. Alert map. Family search. Community feed to share with WhatsApp groups.
**What the platform must do:** Work like a real app (PWA). Fast loading. Easy sharing.

### Persona C — Ngozi Ene, 34, Apa LGA, Displaced
**Device:** Borrowed Android · **Network:** 3G at IDP camp · **Language:** Idoma
**Situation:** Fled attack in Igumale with her two children. At St. John's camp in Otukpo. Husband was separated during the attack. She has never used an app like this.
**What she needs:** Register herself and children. Search for husband. Find water and medical for her children. Know when it is safe to return.
**What the platform must do:** Be intuitive without instruction. Work in 5 minutes with no training. Never require her to know a reference number she wasn't given.

### Persona D — Clement Atabo, 68, Ohimini LGA
**Device:** None (feature phone belonging to his son) · **Language:** Idoma only
**Situation:** Elder. Community leader. His son shows him Ogbenjuwa on his phone but he struggles with small text and English. He trusts the vigilante leader to tell him what is happening.
**What the platform must do:** Community feed posts must be readable at font-size 18px minimum. Actions must be single-tap. Language must be Idoma. The platform should not require him to use it independently — it should also work via his son's phone without confusion.

---

## 4. Feature Set — Full Platform

### Tier 1 — Crisis features (must work offline, on 2G, in seconds)

| Feature | What it does | 2G/SMS fallback |
|---------|-------------|-----------------|
| **Safety Status** | Instant visual: green/amber/red for user's LGA | SMS: `STATUS [LGA]` → 347 |
| **Panic Button** | One-tap distress signal to emergency contacts + LGA admin | SMS: `PANIC [name] [village]` → 347 |
| **Receive Alerts** | Push notifications + in-app feed of active incidents | Automatic inbound SMS |
| **Find Resources** | Nearest shelter, water, medical, food with capacity | USSD: `*347*2*[LGA]#` |
| **Evacuation Routes** | Safest roads out of affected village, updated in real time | SMS: `ROUTE [village]` → 347 |

### Tier 2 — Safety features (work on 3G or better, partially offline)

| Feature | What it does | SMS fallback |
|---------|-------------|--------------|
| **Report Incident** | Submit text/photo/GPS/voice report | SMS: `REPORT [type] [location]` → 347 |
| **Find Family** | Search reunification registry, register self/missing | SMS: `FIND [name] [age] [LGA]` → 347 |
| **Community Feed** | Verified safety updates from LGA admins | SMS: `NEWS [LGA]` → 347 |
| **Alert History** | Timeline of all incidents in subscribed LGAs | SMS: `LOG [LGA]` → 347 |

### Tier 3 — Community features (require stable connection)

| Feature | What it does |
|---------|-------------|
| **Safe/Unsafe check-in** | Let family know your status ("I am safe in Otukpo") |
| **Group Safety Circles** | 5-person mutual safety circle — auto-notified on panic |
| **Resource Requests** | Request specific resources at your shelter location |
| **Return-Home Assessment** | Check if your village has been cleared for return |
| **Community Noticeboard** | LGA-specific announcements from verified community leaders |
| **Household Registration** | Register all household members under one account |

### Tier 4 — Long-term community features (Phase 3+)

| Feature | Description |
|---------|-------------|
| **Safety Score** | Community-contributed safety rating for roads and areas |
| **Anonymous Tip Line** | Report information without revealing identity |
| **Preparedness Checklist** | Community-specific go-bag and evacuation plan |
| **School Safety Module** | Parents notified if school reports emergency |
| **Livestock Alert** | Report cattle/herder conflicts (major trigger category) |

---

## 5. Platform Architecture

### Citizen platform in the full Ogbenjuwa system

```
CITIZEN PLATFORM (this document)          OPERATOR PLATFORM
─────────────────────────────────         ─────────────────────────────
citizen/index.html   (Home)               index.html     (Landing)
citizen/panic.html   (Panic)              alert.html     (Alert system)
citizen/alerts.html  (Alerts)             patrol.html    (Patrol map)
citizen/report.html  (Report)             reunify.html   (Reunification)
citizen/resources.html (Resources)        dashboard.html (Command)
citizen/family.html  (Find family)
citizen/feed.html    (Community feed)        SHARED LAYER
citizen/profile.html (My profile)         ──────────────────────
citizen/login.html   (Auth)               assets/style.css  (Design tokens)
                                          assets/app.js     (Data + operator auth)
citizen/assets/
  citizen.css        (Citizen styles)     SHARED BACKEND (Phase 2)
  citizen.js         (Citizen logic)      ──────────────────────
                                          PostgreSQL + PostGIS
                                          Africa's Talking API
                                          WebSocket bus
                                          AWS Lagos
```

### Data flow: Citizen receives alert

```
Operator triggers alert (alert.html)
        │
        ▼
Alert Engine → PostgreSQL incidents table
        │
        ├──→ Africa's Talking SMS → citizen feature phones (2G)
        │
        ├──→ WebSocket broadcast → citizen PWA apps (push notification)
        │
        └──→ citizen/alerts.html feed (real-time update)
```

### Data flow: Citizen sends panic

```
Citizen taps PANIC (citizen/panic.html)
        │
        ▼
GPS captured → /api/citizen/panic POST
        │
        ├──→ Africa's Talking SMS → emergency contacts (immediate)
        │
        ├──→ Africa's Talking SMS → LGA community admin (immediate)
        │
        ├──→ Incident created in PostgreSQL (type: 'panic')
        │
        └──→ WebSocket → operator patrol map (panic pin drops on map)
```

---

## 6. Authentication & Registration

### Philosophy
Citizen registration must be achievable by someone who has never registered for an app before. **Maximum 5 minutes from first open to fully registered.**

### Registration steps

```
Step 1 — Language selection
  Choose: ○ Idoma  ○ English
  (Cannot proceed without selecting — sets tone for entire experience)

Step 2 — Name
  "What is your name?" / "Kedu aha gị?"
  Single text input, any name, any script
  Min 2 characters

Step 3 — Phone number
  "+234 XXX XXX XXXX"
  Validation: /^\+234[789][01]\d{8}$/
  Error in selected language if invalid

Step 4 — OTP verification
  "Enter the 6-digit code sent to your phone"
  6 individual boxes, auto-advance
  Demo OTP: 123456

Step 5 — Your community
  LGA: [dropdown — 9 Idoma LGAs]
  Village: [text input with suggestions]

Step 6 — Emergency contacts (optional, skippable)
  "Who should we contact if you press the Panic button?"
  Up to 3 contacts: name + phone
  [Skip for now] button always visible

→ Complete → citizen/index.html
```

### Session model
```json
{
  "type": "citizen",
  "phone": "+234 803 441 2290",
  "name": "Mama Ojoma",
  "lga": "Agatu",
  "village": "Oglewu",
  "language": "idoma",
  "emergencyContacts": [
    { "name": "Daniel (son)", "phone": "+234 806 553 1177" }
  ],
  "alertSubscriptions": ["Agatu"],
  "token": "CITIZEN-demo-xxxxxxxx",
  "loginAt": 1751000000000,
  "expiresAt": 1751259200000,
  "registeredAt": 1751000000000
}
```

### Session duration
- Citizen session: **72 hours** (citizens should not re-auth every day)
- Phase 2: JWT access token 15 min, refresh token 30 days (remember device)
- "Remember me" option shown on login for returning users

### Account recovery
- No password to recover — always OTP
- If phone number changes: citizen calls LGA admin helpline, admin reassigns records
- No self-service phone number change in MVP (Phase 2 feature)

---

## 7. Module Specifications

---

### Module 1 — Safety Status (citizen/index.html hero card)

The first thing a citizen sees when opening the app is whether they are in danger.

#### Three states

**CLEAR — Green**
```
Colour:     var(--green-mid) background
Icon:       🟢
Idoma:      "Ilu di mma"
English:    "Your area is clear"
Sub-text:   "No active alerts near Agatu LGA"
Animation:  Subtle breathing scale (1 → 1.02 → 1, 4s loop)
```

**MONITORING — Amber**
```
Colour:     var(--amber) background
Icon:       🟡
Idoma:      "Cheta ebe"
English:    "Stay aware"
Sub-text:   "Suspicious activity reported near [village]"
Animation:  Slow pulse (opacity 1 → 0.7 → 1, 2s loop)
```

**ACTIVE ALERT — Red**
```
Colour:     var(--red) background with pulse border
Icon:       🔴
Idoma:      "Ihe ize ndụ!"
English:    "ACTIVE ALERT"
Sub-text:   "[Alert type] reported near [village], [LGA] · [N] min ago"
Animation:  Fast pulse + shadow expansion (0.8s loop) — CANNOT be disabled
Action:     Entire card is tappable → goes to citizen/alerts.html
```

---

### Module 2 — Panic Button (citizen/panic.html)

The most critical screen in the entire platform.

#### Design requirements (non-negotiable)
- Panic button minimum **200px diameter**
- Panic button must occupy **more than 50% of viewport height above fold**
- No other interactive element competes with the button above fold
- Button colour: `var(--red)` (`#DC2626`) — cannot be changed
- 3-second hold-to-confirm countdown to prevent accidental triggers
- Cancel available during countdown — single tap cancels

#### Confirmation countdown
```js
let panicCountdown = null;
let panicCount = 3;

function startPanicCountdown() {
  const btn = document.getElementById('panic-btn');
  btn.textContent = '3';
  btn.classList.add('counting');
  panicCountdown = setInterval(() => {
    panicCount--;
    if (panicCount <= 0) {
      clearInterval(panicCountdown);
      triggerPanic();
    } else {
      btn.textContent = String(panicCount);
    }
  }, 1000);
}

function cancelPanic() {
  if (panicCountdown) {
    clearInterval(panicCountdown);
    panicCountdown = null;
    panicCount = 3;
    const btn = document.getElementById('panic-btn');
    btn.textContent = t('panic');
    btn.classList.remove('counting');
  }
}
```

#### Post-trigger screen
```
✅ HELP IS COMING / ENYEMAKA NA-ABỊA

Your emergency contacts have been notified:
  ✓ Daniel (son) — +234 806 553 1177
  ✓ Pastor James — +234 809 334 5521

Your LGA admin has been notified.
Reference: AMU-PANIC-3847

[Time since alert: 0:47]

[📞 CALL AGATU EMERGENCY LINE]       ← tel: link, big red button
[I am safe now / Adị m mma ugbu a]   ← cancels panic, sends "false alarm"
```

#### Safety circle feature (Phase 2)
A safety circle is up to 5 mutual-consent connections. When any member sends a panic, all other members receive immediate notification — not just the LGA admin. Mutual consent: both parties must confirm. Designed for families spread across LGAs.

---

### Module 3 — Active Alerts (citizen/alerts.html)

#### Alert card hierarchy
```
ACTIVE (red border, pulsing badge)
  → Full card with safety instruction + actions
MONITORING (amber border)
  → Card with situation update
RESOLVED (grey border, collapsed)
  → Minimal card with "Resolved [time]"
```

#### Safety instructions by type
```js
const SAFETY_INSTRUCTIONS = {
  attack: {
    idoma:   'Nọọ n\'ụlọ. Mechie ụzọ. Ịzọ n\'ụzọ ubi.',
    english: 'Stay indoors. Lock doors. Avoid farm roads.',
  },
  fire: {
    idoma:   'Gbapụ n\'ọnọdụ ahụ ozugbo. Nọ n\'ala n\'ụzọ ụfọdụ.',
    english: 'Evacuate immediately. Stay low on smoke-filled paths.',
  },
  medical: {
    idoma:   'Kpọọ onye ọrụ ahụike gị. Anagọ onye ahụ ọrịa.',
    english: 'Contact your community health worker. Do not move the patient.',
  },
  abduction: {
    idoma:   'Kpọọ ndị uweojii ozugbo. Echefula ihe i hụrụ.',
    english: 'Call security forces immediately. Note what you observed.',
  },
};
```

#### Alert subscription management
On `citizen/alerts.html`, a gear icon (⚙️) opens subscription settings:
- Checkboxes for each of the 9 Idoma LGAs
- Citizen's home LGA is always checked and cannot be unchecked
- Changes saved immediately to citizen session and synced to server (Phase 2)

---

### Module 4 — Report Incident (citizen/report.html)

#### Report quality design
The citizen report form is designed to produce **actionable intelligence for operators**, not just raw text. This means:
- Type selection narrows the template (attack → armed group description; fire → spreading direction)
- GPS is always attempted first before village dropdown is shown
- Photo compression happens client-side before upload (target <200KB)
- Voice note transcription attempted (Web Speech API) — raw audio also stored

#### Photo compression (client-side)
```js
async function compressPhoto(file, maxKB = 200) {
  const canvas = document.createElement('canvas');
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise(r => img.onload = r);
  const ratio = Math.sqrt((maxKB * 1024) / (file.size));
  canvas.width  = img.width  * (ratio < 1 ? ratio : 1);
  canvas.height = img.height * (ratio < 1 ? ratio : 1);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.8));
}
```

#### Anonymous reporting option
A toggle at the bottom of the form: `"Submit anonymously / Zipu na-enweghị aha gị"`
When toggled: reporter identity is stripped from the report before submission. LGA admin sees report as "Anonymous Community Member." Used when citizen fears retaliation for reporting.

---

### Module 5 — Find Resources (citizen/resources.html)

#### Distance sorting
```js
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

#### Shelter capacity states
```
0–60% occupied:   🟢 Space available — [N] beds free
60–85% occupied:  🟡 Filling up — [N] beds left
85%+ occupied:    🔴 Nearly full — contact admin for overflow
100% occupied:    ⛔ Full — see next nearest shelter
```

#### Walk time estimate
For resources within 5km, show estimated walking time:
```js
function walkTime(km) {
  const mins = Math.round(km / 0.08);  // ~4.8km/hr walking pace
  if (mins < 60) return `~${mins} min walk`;
  return `~${Math.floor(mins/60)}h ${mins%60}m walk`;
}
```

#### "Near me" vs "Near my village"
If GPS unavailable, "Near me" falls back to resources in the citizen's registered LGA sorted by population centre distance. Never shows a blank state.

---

### Module 6 — Find Family (citizen/family.html)

#### Four tabs

**Search tab** — find a registered person
- Name input (Idoma or English)
- Age range slider (0–80+)
- LGA filter
- Status filter: All / At camp / Searching
- Results: fuzzy matched, confidence scored, sorted by confidence
- Result actions: "Send reunion request" (SMS to both parties) or "See which camp"

**Register Myself tab** — I am here, I am safe, find me
- Pre-fills from session (name, phone, LGA, village)
- "Are you at a shelter?" toggle → if yes, select shelter from dropdown
- "Any injuries?" checkbox → triggers health worker notification
- One tap: "Register Now" → confirmation with ID `AMU-XXXX`

**Report Missing tab** — someone I know is missing
- Their name, Idoma name, age, last known location, relationship
- Photo upload (optional)
- "Notify me when found" — phone alerts when a match is made
- Submits to FAMILY_REGISTRY with status: `searching`

**My Cases tab** — cases I have opened
- Lists all cases this phone number has submitted
- Status badges: open / matched / reunified / closed
- Each case: reference ID, name, LGA, last updated, action button
- "Close case" option: marks resolved, removes from active search

#### AI name matching (Phase 2)
The Idoma language has tonal variants and dialectal spelling inconsistencies that make exact string matching unreliable. Phase 2 implements:
- **Soundex** variant tuned for Idoma phonology
- **Levenshtein distance** with Idoma-specific substitution costs
- **Name fragment matching** (first name / last name separately)
- **Village name normalisation** (handles "Oglewu" / "Oglewu village" / "Oglewu, Agatu")

---

### Module 7 — Community Feed (citizen/feed.html)

#### Post verification badges
```
✅ Verified — operator-posted content (community admin or coordinator)
📢 Ogbenjuwa System — auto-generated alerts from the alert engine
⚠️  Unverified — citizen-submitted tip (Phase 3 feature only)
```

In MVP and Phase 2: only verified operator posts appear in the feed. No unverified citizen posts to prevent misinformation during crises.

#### Feed caching strategy
```js
// Cache last 20 posts in sessionStorage
function cacheFeed(posts) {
  sessionStorage.setItem('OgbenjuwaCitizenFeed',
    JSON.stringify({ posts: posts.slice(0, 20), cachedAt: Date.now() }));
}

function getCachedFeed() {
  const raw = sessionStorage.getItem('OgbenjuwaCitizenFeed');
  if (!raw) return null;
  const { posts, cachedAt } = JSON.parse(raw);
  // Cache is stale after 10 minutes
  if (Date.now() - cachedAt > 10 * 60 * 1000) return null;
  return posts;
}
```

#### Sharing posts to WhatsApp
```js
function sharePost(post) {
  const text = `[Ogbenjuwa ${post.lga}] ${post.body}\n\n${timeAgo(post.createdAt)}\nStay safe. Ogbenjuwa.ng`;
  const url  = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
```

---

### Module 8 — My Profile (citizen/profile.html)

#### Safety Card generation
```js
function generateSafetyCard(session) {
  return `
Ogbenjuwa SAFETY CARD
════════════════
Name:    ${session.name}
LGA:     ${session.lga}
Village: ${session.village}
Phone:   ${session.phone}

Emergency contact:
${session.emergencyContacts[0]?.name || 'None set'}
${session.emergencyContacts[0]?.phone || ''}

Ogbenjuwa Helpline: *347#
My ID: ${session.token.replace('CITIZEN-demo-', 'AMU-')}

In emergency: dial 112 or *347#
  `.trim();
}
```

The safety card is:
- Displayed as text that can be copied (for WhatsApp sharing)
- In Phase 2: downloadable as a printable PDF card (wallet-sized)

---

## 8. Offline-First Architecture

### Service Worker strategy (Phase 2)

```
CACHE_FIRST strategy:
  - citizen/assets/citizen.css
  - citizen/assets/citizen.js
  - ../assets/style.css
  - ../assets/app.js
  - Google Fonts
  - Leaflet JS/CSS
  - Offline map tiles (Idoma region, zoom 8–14)

NETWORK_FIRST with cache fallback:
  - /api/citizen/alerts
  - /api/citizen/feed
  - /api/citizen/resources

QUEUE_FOR_SYNC (IndexedDB):
  - POST /api/citizen/panic
  - POST /api/citizen/report
  - POST /api/citizen/family/register
  - POST /api/citizen/family/search
```

### IndexedDB store schema (Phase 2)
```js
// Store: 'citizen_queue'
{
  id: 'LOCAL-1751000000000',
  action: 'panic' | 'report' | 'family_register' | 'checkin',
  payload: { ...actionData },
  status: 'pending' | 'syncing' | 'synced' | 'failed',
  createdAt: timestamp,
  syncedAt: timestamp | null,
  retryCount: number
}
```

### MVP offline (sessionStorage — no service worker)
```js
// Report queue
sessionStorage.getItem('OgbenjuwaReportQueue')  // JSON array of pending reports
sessionStorage.getItem('OgbenjuwaCitizenFeed')  // Cached feed posts
sessionStorage.getItem('OgbenjuwaAlertCache')   // Cached active alerts
sessionStorage.getItem('OgbenjuwaResourceCache') // Cached resource list
```

---

## 9. Idoma Language System

### Translation coverage requirement
Every piece of citizen-facing text must have both an Idoma and English version. This is a **launch requirement**, not a post-launch addition.

### Text categories

| Category | Idoma required | Notes |
|----------|---------------|-------|
| UI labels (buttons, tabs, headings) | ✅ Must | All via `data-i18n` attribute |
| Alert type names | ✅ Must | Ufele, Ole, Ochere, Ofa |
| Safety instructions | ✅ Must | Validated by community health workers |
| SMS templates | ✅ Must | 160-character limit, Idoma first |
| USSD menu options | ✅ Must | Both languages shown simultaneously |
| Error messages | ✅ Must | Cannot show English errors on Idoma UI |
| System notifications | ✅ Must | Push notification body in user's language |
| Resource names | 🟡 Best effort | Official place names may be in English |
| Legal/privacy text | 🟡 Best effort | Plain language summary in Idoma required |

### Translation validation process (non-negotiable)
1. All Idoma text drafted by Ogbenjuwa team using community glossary
2. Reviewed by **Idoma Language Board** (official language body)
3. Validated by **5 community members** across different Idoma dialects
4. Community-editable after launch via LGA admin portal (Phase 2)

### Dialect variation handling
Idoma has multiple dialects across the 9 LGAs. The platform uses the **Otukpo central dialect** as the default, which is broadly understood across the region, while noting known variant forms in comments in the translation file.

---

## 10. Push Notifications

### Notification types and priority

| Notification type | Priority | Idoma title | When sent |
|------------------|----------|------------|-----------|
| Active attack alert | CRITICAL — alarm sound | "Ihe ize ndụ!" | Attack alert in subscribed LGA |
| Panic acknowledged | HIGH | "Enyemaka na-abịa" | After citizen's panic is confirmed received |
| Incident resolved | NORMAL | "Ilu di mma ugbu" | Alert marked resolved in citizen's LGA |
| Family match found | HIGH | "Afụọla ezinulo gị" | Registry match found for their search |
| Resource update | LOW | "Ọnọdụ mgbochi" | Shelter capacity change near citizen |
| Community feed post | LOW | "Ozi ọhụrụ" | New verified post in citizen's LGA |

### Web Push (Phase 2)
```js
// Request permission
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY
    });
    // Send sub to /api/citizen/push-subscribe
    await fetch('/api/citizen/push-subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription: sub, language: getCitizenSession()?.language }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### CRITICAL alert notifications
Active attack alerts bypass silent mode on Android using the Notification API with `requireInteraction: true`. The citizen must actively dismiss an active attack notification — it cannot be silently ignored.

---

## 11. Security & Privacy

### Data minimisation
The citizen platform collects **only what is needed for safety**:
- ✅ Collected: name, phone, LGA, village, emergency contacts, alert subscriptions
- ❌ Not collected: ID numbers, exact home address, household income, ethnic affiliation beyond Idoma region
- ❌ Never stored beyond 24h: precise GPS coordinates for regular non-panic actions

### Panic location data
Panic location is **the exception** to the 24-hour GPS rule:
- Precise panic GPS stored for **7 days** (in case of prolonged rescue operation)
- Accessible only to the citizen's own LGA admin and Benue State security council
- Citizen can delete their own panic location data from profile settings

### Anonymous reporting
When a citizen submits an anonymous report:
- Phone number is immediately stripped from the report record
- A one-way hash is stored for abuse prevention (cannot be reversed to phone number)
- LGA admin sees only: report content, GPS/village, timestamp, "Anonymous"

### Family registry privacy
- Name matching is performed **server-side on hashed data** (Phase 2)
- MVP: names are compared in-browser from demo data (no real personal data at risk)
- Reunion: only reference codes transmitted — never personal location
- Photo uploads (missing persons): stored with access control — only the submitter and LGA admin can view

### NDPR compliance (Nigeria Data Protection Regulation)
- Explicit consent screen at registration (not buried in terms)
- Consent covers: alert broadcasting, incident reporting, family registry
- Citizens can withdraw consent and delete account at any time
- Data retention schedule published in plain Idoma and English

---

## 12. Technology Stack

### Citizen app — MVP (no additional cost)
| Layer | Technology |
|-------|-----------|
| Pages | Vanilla HTML/CSS/JS — `citizen/*.html` |
| Styles | Extends `../assets/style.css` + `citizen/assets/citizen.css` |
| Data | `citizen/assets/citizen.js` — `window.CITIZEN` global |
| Maps | Same Leaflet 1.9.4 CDN as operator pages |
| Auth | `sessionStorage.OgbenjuwaCitizenAuth` (separate key from operator) |
| Offline | `sessionStorage` caching (MVP) |
| Lang | `data-i18n` attributes + `t()` function |

### Citizen app — Full Platform (Phase 2+)
| Layer | Technology | Why |
|-------|-----------|-----|
| PWA | React + Workbox Service Worker | Offline-first, installable, push notifications |
| Android | React Native 8MB APK | Native push, home screen widget, GPS background |
| Push | Web Push API + VAPID + FCM | Alarm-level notifications on Android |
| Sync | IndexedDB + Background Sync API | Never lose a report or panic request |
| Maps | Mapbox GL + offline tile cache (Idoma zoom 8–14) | Works without signal in the field |
| Auth | OTP → JWT + 30-day refresh token + device fingerprint | Stay logged in across sessions |
| API | GraphQL (citizen read) + REST (citizen write) | Efficient mobile data usage |
| SMS | Africa's Talking inbound + outbound | Feature phone complete parity |
| USSD | Africa's Talking `*347#` | Any phone, any network |
| Analytics | Privacy-preserving event tracking (no PII) | Understand which features citizens actually use |

---

## 13. Data Architecture

### Citizen-specific tables (Phase 2)

```sql
-- Citizen accounts (separate from operator users)
citizen_accounts (
  id           UUID PRIMARY KEY,
  phone        VARCHAR(20) UNIQUE NOT NULL,
  name         VARCHAR(100) NOT NULL,
  lga          VARCHAR(50) NOT NULL,
  village      VARCHAR(100),
  language     VARCHAR(10) DEFAULT 'idoma',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_active  TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT TRUE
);

-- Emergency contacts
emergency_contacts (
  id           UUID PRIMARY KEY,
  citizen_id   UUID REFERENCES citizen_accounts(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  phone        VARCHAR(20) NOT NULL,
  sort_order   INTEGER DEFAULT 0
);

-- Alert subscriptions
alert_subscriptions (
  citizen_id   UUID REFERENCES citizen_accounts(id) ON DELETE CASCADE,
  lga          VARCHAR(50) NOT NULL,
  active       BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (citizen_id, lga)
);

-- Panic events
panic_events (
  id           UUID PRIMARY KEY,
  citizen_id   UUID REFERENCES citizen_accounts(id),
  location     GEOMETRY(Point, 4326),
  status       VARCHAR(20) DEFAULT 'active',  -- active|acknowledged|resolved|false_alarm
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ,
  resolution   TEXT
);

-- Citizen reports (linked to main incidents table)
citizen_reports (
  id           UUID PRIMARY KEY,
  incident_id  UUID REFERENCES incidents(id),
  citizen_id   UUID REFERENCES citizen_accounts(id),
  is_anonymous BOOLEAN DEFAULT FALSE,
  photo_urls   TEXT[],
  voice_url    TEXT,
  raw_text     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Safety circles (Phase 3)
safety_circles (
  id           UUID PRIMARY KEY,
  created_by   UUID REFERENCES citizen_accounts(id),
  name         VARCHAR(100),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

safety_circle_members (
  circle_id    UUID REFERENCES safety_circles(id) ON DELETE CASCADE,
  citizen_id   UUID REFERENCES citizen_accounts(id) ON DELETE CASCADE,
  status       VARCHAR(20) DEFAULT 'pending', -- pending|active|removed
  PRIMARY KEY (circle_id, citizen_id)
);

-- Push subscriptions
push_subscriptions (
  id           UUID PRIMARY KEY,
  citizen_id   UUID REFERENCES citizen_accounts(id) ON DELETE CASCADE,
  endpoint     TEXT NOT NULL,
  p256dh       TEXT NOT NULL,
  auth         TEXT NOT NULL,
  language     VARCHAR(10) DEFAULT 'idoma',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 14. Citizen Governance & Trust

### Who controls what citizens see

**Community admins post to the feed.** Citizens read. Citizens cannot post. This is a deliberate decision to prevent misinformation spreading through the platform during a crisis.

**Community admins validate family matches.** A citizen finds a potential match — a community admin confirms before the reunion code is sent. This protects against bad actors using family search to locate people.

**Citizens own their own data.** A citizen can see all data stored about them, correct their village and name, delete their account completely, and withdraw from the family registry at any time.

**Citizens cannot see other citizens' data.** The feed shows verified operator posts only. Family search shows only reference IDs and status — never names, phone numbers, or precise locations of other citizens.

### Community admin as trusted bridge
The community admin role in the operator platform is the **trust bridge** between Ogbenjuwa and citizens. Citizens who don't trust an app trust their community admin. The design reflects this:
- Feed posts show the community admin's name (not just "Admin")
- Panic notifications are sent to the specific community admin the citizen's village is registered under
- Family matches are confirmed by a human admin, not an algorithm alone

---

## 15. Integration with Operator Platform

### Shared data (read by citizen, written by operator)
| Data | Operator writes | Citizen reads |
|------|----------------|---------------|
| Incident alerts | `alert.html` → `incidents` table | `citizen/alerts.html` |
| Resource capacity | `dashboard.html` → `resources` table | `citizen/resources.html` |
| Community feed posts | Operator dashboard feed module | `citizen/feed.html` |
| Patrol zone status | `patrol.html` → `patrol_sessions` | Safety status card |
| LGA all-clear | `dashboard.html` → `incidents` resolved | Safety status → green |

### Data written by citizen, read by operator
| Data | Citizen writes | Operator reads |
|------|---------------|----------------|
| Panic events | `citizen/panic.html` | `patrol.html` — panic pin drops on map |
| Incident reports | `citizen/report.html` | `dashboard.html` — live incident feed |
| Family registrations | `citizen/family.html` | `reunify.html` — registry search |
| Resource requests | `citizen/resources.html` | `dashboard.html` — resource alerts |

### What citizens can never do (enforced server-side)
- Trigger an LGA-wide broadcast alert (operator-only)
- View other citizens' personal data
- Access the command dashboard
- Edit patrol zones or resource details
- See GPS coordinates of patrol members

---

## 16. Performance Requirements

| Metric | Target | Why |
|--------|--------|-----|
| Citizen app first load (3G) | < 6 seconds | Entry Android on MTN 3G |
| Safety status display | < 1 second | First thing citizen sees |
| Panic button response | < 2 seconds to show countdown | Cannot feel sluggish in emergency |
| Alert received to displayed | < 5 seconds from server push | Time-critical |
| Report submission (online) | < 8 seconds | Includes photo compression |
| Report queue (offline) | < 100ms | Must feel instant when offline |
| Resource map load | < 8 seconds on 3G | Includes map tile load |
| Family search results | < 3 seconds | Urgency context |
| Max page payload | < 150KB | 3G constraint (slightly looser than operator) |
| Minimum tap target | 44 × 44px | Mobile accessibility |
| Panic button tap target | 200 × 200px | Emergency usability |

---

## 17. Accessibility Requirements

### Visual
- Minimum body font size: **16px** (larger than operator's 13px)
- Minimum heading size: **22px**
- Safety status card: uses both colour AND icon AND text label (never colour alone)
- Panic button: text label always shown (not icon-only)
- High contrast mode: all text must meet **WCAG AA** contrast ratio (4.5:1)

### Motor
- All interactive elements minimum **44 × 44px**
- Panic button minimum **200px diameter** — one-tap, no precision required
- 3-second countdown to cancel panic protects elderly/low-dexterity users from accidental triggers
- Swipe gestures are enhancements only — all navigation achievable by tap

### Cognitive
- Maximum 2 actions per screen (primary + secondary)
- Form steps are one question at a time during registration
- Progress indicator always visible during multi-step flows
- Error messages in plain Idoma/English — never technical codes
- Confirmation dialogs for destructive actions (delete account, false alarm)

### Language
- Default to Idoma on first open — do not assume English literacy
- Labels always shown alongside icons (never icon-only navigation)
- SMS fallback shown on every screen for users who cannot read the app

---

## 18. Roadmap — Citizen Platform

### Phase 2 (Months 5–10, alongside operator Phase 2)
- PWA with Service Worker + offline map tiles
- Africa's Talking SMS parity (all Tier 1 features by SMS)
- Real OTP via Africa's Talking
- Push notifications (Web Push + FCM)
- Photo upload on incident reports
- GPS auto-tag on reports and panic
- Family registry live (linked to operator reunify module)

### Phase 3 (Months 11–18)
- React Native Android app (Play Store)
- Safety Circles (mutual-notify groups)
- Voice-to-text report in Idoma (Web Speech API)
- Anonymous reporting
- Return-home assessment module
- Community noticeboard
- Household registration (register all family members under one account)

### Phase 4 (Month 19+)
- School safety module (parent notifications)
- Livestock conflict reporting module (major Idoma-specific trigger)
- Anonymous tip line
- Preparedness checklists (go-bag, evacuation plan)
- Offline-first Android (complete functionality with zero signal)

---

## 19. Success Metrics

### Adoption metrics
| Metric | Target (end of Phase 2) |
|--------|------------------------|
| Registered citizen accounts | 5,000+ across 3 pilot LGAs |
| Weekly active citizens | 40% of registered (2,000+) |
| Feature phone SMS registrations | 3,000+ additional (non-app) |
| Average time to register | < 5 minutes |
| Language split | > 70% Idoma default |

### Safety outcome metrics
| Metric | Target |
|--------|--------|
| Panic button → contact notified | < 30 seconds |
| Panic button → LGA admin notified | < 60 seconds |
| Alert → citizen in-app notification | < 5 seconds |
| Alert → citizen SMS | < 2 minutes |
| Citizen reports informing operator response | > 30% of incidents |

### Trust metrics
| Metric | Target |
|--------|--------|
| Citizens who used family search during an incident | > 60% of displaced persons at registered camps |
| Citizens who received an alert before hearing it by word-of-mouth | Track and report |
| Net Promoter Score (citizen would recommend Ogbenjuwa to family) | > 70 |

---

*Ogbenjuwa Community Safety Network · Citizen Platform*
*Idoma Region, Benue State, Nigeria · June 2026*
*Document: CITIZEN-PLATFORM-SPEC-1.0*
*Contact: help@Ogbenjuwa.ng · Ogbenjuwa.ng/citizen*
