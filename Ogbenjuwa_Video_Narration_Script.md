# 🎬 OGBENJUWA COMMUNITY SAFETY NETWORK
## Video Presentation & Narration Script
### Hackathon Showcase Edition — July 2026

---

> **Total Runtime:** ~12–15 minutes  
> **Format:** Screen recording with voiceover narration  
> **Tone:** Confident, empathetic, urgent — this is a real problem with real lives at stake  
> **Background Music:** Ambient, low-key (suggest: soft Afrobeats instrumental or cinematic strings)

---

## 📋 PRE-PRODUCTION NOTES

**What to record:**
- Open all 3 app URLs in separate browser tabs before starting
- Have the admin panel (`localhost:4000`) logged in as `daniel@ogbenjuwa.local`
- Have the Beacon Network (`localhost:3000`) loaded and alert map visible
- Have the Citizen Portal (`localhost:3001`) loaded on mobile simulation (Chrome DevTools → Mobile view, 390px width)
- Have the SMS Simulator open in a second window

**Screen setup:**
- Use Chrome DevTools mobile simulation for Citizen Portal scenes
- Set zoom to 80% for admin panel to show more content
- Disable browser extensions that might show popups

---

---

## 🎬 SCENE 1 — THE HOOK (0:00 – 0:45)

**[VISUAL: Black screen, then slowly fade in — a map of Benue State, Nigeria, zooming into Idoma land. Show a dark, atmospheric shot of a rural Nigerian community at night.]**

**[MUSIC: Fades in softly — cinematic tension building]**

---

### NARRATION:

*"Somewhere in Agatu. A mother hears shots fired outside her window.*

*Her phone rings — it's her son, warning her of an attack. She doesn't know where to run. She doesn't know if help is coming. She doesn't know if her family is safe.*

*This is the reality for millions of Idoma people in Benue State, Nigeria — a region facing persistent armed attacks, kidnappings, and communal violence.*

*For too long, there has been no system. No warning. No coordination. No record.*

*Until now."*

---

**[VISUAL: Ogbenjuwa logo fades in dramatically — red on dark background]**

**[MUSIC: Builds to a confident, resolute tone]**

---

### NARRATION:

*"Introducing OGBENJUWA — the Community Safety Network built specifically for Idoma communities. A platform that turns chaos into coordination, and isolation into community protection."*

---
---

## 🎬 SCENE 2 — THE PROBLEM (0:45 – 1:45)

**[VISUAL: Slide/screen with simple statistics — bold text on dark background]**

---

### NARRATION:

*"Before we show you the solution, let's understand the scale of the problem.*

*The Idoma region spans 9 Local Government Areas, over 900 villages, and hundreds of thousands of people — farmers, traders, teachers, parents.*

*They face five critical failures in their current safety infrastructure:"*

---

**[VISUAL: Reveal each point one by one — animated text]**

*"First — no real-time alert system. When danger strikes, information spreads by word of mouth. By the time news reaches the next village, it's already too late.*

*Second — no coordination layer. Community vigilante groups operate in silos. There's no shared command, no shared map, no shared knowledge.*

*Third — the digital divide. Most community members don't have smartphones. Any solution must work on a basic ₦3,000 phone with a ₦50 data credit.*

*Fourth — the language barrier. The average English-only app excludes elderly residents and low-literacy populations who speak Idoma.*

*And fifth — no accountability. There's no system to track patrols, log incidents, or produce data that helps communities plan ahead.*

*Ogbenjuwa solves all five."*

---
---

## 🎬 SCENE 3 — PLATFORM OVERVIEW (1:45 – 2:30)

**[VISUAL: Architecture diagram — the three-layer system]**

---

### NARRATION:

*"Ogbenjuwa is not one app. It's a three-layer ecosystem — each layer serving a different user with exactly what they need.*

*Layer 1: The Beacon Network — a public, real-time alert map that any community member can access without registering. It's the emergency broadcast system.*

*Layer 2: The Citizen Portal — a personal safety companion for registered community members. Panic button. Alert notifications. Family reunification. All offline-capable.*

*Layer 3: Central Command — the administrative backbone. A full command-and-control dashboard for LGA coordinators, vigilante leaders, and system administrators.*

*All three layers connect to a single, unified API backend built on Node.js, with a PostgreSQL database holding over 934 mapped villages across 9 LGAs.*

*Let's walk through each layer."*

---
---

## 🎬 SCENE 4 — LAYER 1: THE BEACON NETWORK (2:30 – 5:00)

**[VISUAL: Navigate to `localhost:3000` or `ogbenjuwa.com.ng`]**

### NARRATION:
*"We start with the Beacon Network — the public-facing heart of Ogbenjuwa."*

---

### 4A — Landing Page (2:30 – 3:00)

**[VISUAL: Show the Landing page — scroll slowly through it]**

### NARRATION:
*"The landing page makes the mission clear immediately. The crisis ticker at the top shows live incident counts. Below, the platform statistics — LGAs covered, villages mapped, patrol teams active.*

*There's a clear problem statement, a solution breakdown, and a revenue model — because we've built this to scale, not just for a demo."*

---

### 4B — The Alert Map (3:00 – 3:50)

**[VISUAL: Click to `/alert` — the interactive Leaflet map. Make sure alert markers are visible.]**

### NARRATION:
*"Now the most critical screen — the Alert Map.*

*This is a real-time Leaflet map showing the entire Idoma region, with all 9 LGA boundaries drawn. Every active security incident is pinned on this map with a color-coded marker.*

*Red markers are armed attacks. Orange is fire. Blue is medical emergency. Purple is abduction.*

*Watch what happens when an alert is active — the village flashes with a pulse animation. A radius circle shows the affected zone — a 25-kilometer radius so nearby communities can see the threat before it reaches them.*

*Every person, every coordinator, every vigilante leader across the region sees the same map, in real time."*

**[VISUAL: Click on an alert marker to show the popup with details]**

### NARRATION:
*"Tap any marker and you get full incident details — type, severity, village, time reported, and safety instructions.*

*You can also filter by alert type using the selector — showing only medical emergencies, or only attacks — to focus your attention where it's needed."*

---

### 4C — Incident Feed (3:50 – 4:15)

**[VISUAL: Navigate to `/feed`]**

### NARRATION:
*"The Incident Feed is the chronological record of everything that's happened — with severity badges, timestamps, and full descriptions. This is the community's memory of what occurred, and when.*

*Every incident report submitted — whether from the web, from the admin, or via SMS — shows up here."*

---

### 4D — Report Incident (4:15 – 4:40)

**[VISUAL: Navigate to `/report` — show the form]**

### NARRATION:
*"Any community member can report an incident directly through this form. Select the type — attack, fire, medical — pin the location on the map, describe what's happening, set the severity, and submit.*

*The report is instantly delivered to the Central Command for review and response."*

---

### 4E — Patrol Map & Family Reunification (4:40 – 5:00)

**[VISUAL: Briefly show `/patrol` and `/reunify`]**

### NARRATION:
*"The Patrol Map shows active vigilante teams on the ground — their locations updated by the dead man's switch check-in system. If a team goes silent for too long, coordinators are alerted.*

*And the Family Reunification registry — in the chaos of displacement, families get separated. This registry lets community members search for missing persons, register themselves as safe, or report someone missing. SMS fallback included."*

---
---

## 🎬 SCENE 5 — LAYER 2: THE CITIZEN PORTAL (5:00 – 7:30)

**[VISUAL: Switch to mobile simulation in Chrome DevTools — 390px width. Navigate to `localhost:3001`]**

### NARRATION:
*"Now Layer 2 — the Citizen Portal. Switch to mobile view, because this is designed first and foremost for the phone in your pocket.*

*This is what Mama Ojoma in Agatu actually uses — every day, in any condition."*

---

### 5A — Login / Registration (5:00 – 5:20)

**[VISUAL: Show the login screen]**

### NARRATION:
*"Registration is frictionless. Enter your name and Nigerian phone number. Confirm a 6-digit OTP. Select your LGA. Choose your language — Idoma or English, Idoma is the default. Add emergency contacts.*

*No passwords. No email. Just your phone. And you're in — for 72 hours before you need to re-authenticate."*

---

### 5B — Idoma Language Toggle (5:20 – 5:35)

**[VISUAL: Tap the language toggle in the top-right corner — switch between Idoma and English]**

### NARRATION:
*"Watch what happens when I toggle the language.*

*Every label, every button, every instruction switches to Idoma. 'Home' becomes 'Ulo'. 'Alerts' becomes 'Obe'. 'PANIC' becomes 'Gbaa Oso' — which means Run! Help! in Idoma.*

*This is not a translation addon. This is baked into the core design philosophy: Idoma first."*

---

### 5C — The Panic Button (5:35 – 6:20)

**[VISUAL: Navigate to the Panic screen — show the large red button dominating the screen]**

### NARRATION:
*"This is the most critical screen in the entire platform — the Panic Button.*

*The entire screen is one large red button. Nothing else competes for attention.*

*When I press it, a 3-second countdown begins with a ring animation — to prevent accidental triggers. I can cancel by tapping again.*

*On confirmation, the app captures my GPS location, sends a distress signal to my three emergency contacts, and notifies my LGA Community Admin.*

*A reference number is generated — so my signal can be tracked and responded to. A timer shows how long ago the panic was sent. And there's a big green 'I am safe now' button when the danger has passed."*

**[VISUAL: Show the SMS fallback text below the panic button]**

### NARRATION:
*"And for users without internet — the SMS fallback is always shown: type PANIC, your name, and your village — send it to 347. No smartphone needed. No data needed. It works on any phone made in the last 30 years."*

---

### 5D — Active Alerts (6:20 – 6:45)

**[VISUAL: Navigate to the Alerts tab]**

### NARRATION:
*"The Alerts screen shows all active and recent incidents in the LGAs the citizen has subscribed to. Filter tabs at the top let you focus on your home LGA or any other you're concerned about.*

*Each card shows the type, village, time ago, status, and safety instructions in both Idoma and English.*

*Citizens subscribed to multiple LGAs — say, a trader who moves between Otukpo and Agatu — can monitor all the areas they care about."*

---

### 5E — Community Feed (6:45 – 7:10)

**[VISUAL: Navigate to the Feed tab]**

### NARRATION:
*"The Community Feed is the neighbourhood safety conversation. Verified updates flow from community admins and vigilante leaders — not from random unverified sources.*

*Red border means active alert. Amber is a situation update. Green is an all-clear. Blue is a community notice like market postponements or road closures.*

*Citizens can 'Note' a post — equivalent to acknowledging they've seen it — and share it directly to WhatsApp with a single tap, spreading verified safety information through trusted family networks."*

---

### 5F — Find Resources (7:10 – 7:30)

**[VISUAL: Navigate to the Resources tab]**

### NARRATION:
*"During displacement — when attacks force families out of their homes — the Find Resources screen becomes a lifeline. Nearest shelters, water points, medical posts, and food distribution sites are pinned on the map.*

*Each card shows real-time capacity — green means space available, amber means filling up, red means nearly full. GPS sorting shows you the closest options first.*

*No internet? Dial *347*2 then your LGA code and press hash. The same information, available on any phone."*

---
---

## 🎬 SCENE 6 — LAYER 3: CENTRAL COMMAND (7:30 – 11:00)

**[VISUAL: Switch back to desktop. Navigate to `localhost:4000` — Admin login screen]**

### NARRATION:
*"Now we move to the command layer — Central Command. This is where the coordination happens. Where the decisions are made."*

---

### 6A — Login & Role System (7:30 – 7:55)

**[VISUAL: Login with `daniel@ogbenjuwa.local` / `Password123!`]**

### NARRATION:
*"The admin platform uses full role-based access control. We have six roles: super admin, state observer, LGA coordinator, vigilante leader, community admin, and resident.*

*Each role sees only what's relevant to their scope. An LGA coordinator can only see and manage their assigned LGA's data. A vigilante leader can only manage their patrol team.*

*Data isolation is enforced at the database level — not just the UI."*

---

### 6B — Live Command Dashboard (7:55 – 8:45)

**[VISUAL: Show the main dashboard — scroll through KPI cards, charts, feed]**

### NARRATION:
*"The Command Dashboard is the real-time nerve center.*

*At the top: live KPI cards — active patrols, active alerts broken down by severity in a donut chart, open incidents, SOS signals active, check-ins today, and overall patrol coverage percentage.*

*Below: the live alert feed — a scrolling list of the most recent alerts across all LGAs, updating in real time via WebSocket. Click any alert to jump to its full detail page.*

*The LGA summary grid shows per-region status at a glance — each card color-coded based on alert activity.*

*And the incident trend chart shows the last 30 days of activity — filterable by LGA, type, and time aggregation — giving coordinators the intelligence they need to allocate patrol resources."*

---

### 6C — Alert Management (8:45 – 9:20)

**[VISUAL: Navigate to `/alerts` — show the alert list]**

### NARRATION:
*"The Alert Management center. Every alert that comes in — whether from the public map, a citizen report, or directly from a coordinator — appears here.*

*The table is sortable and filterable by LGA, severity, type, status, and date range. Color-coded severity badges: red for critical, orange for high, yellow for medium.*

*Let me create a new alert."*

**[VISUAL: Click 'Create Alert', fill in the form — type: Armed Attack, severity: Critical, LGA: Agatu, title, description]**

### NARRATION:
*"When I create this alert, an auto-incremented ID is generated — AL-2026-0701-042. I can choose to make it public — meaning it appears on the public Beacon Network map for all citizens to see — and I can assign it directly to a specific responder.*

*The moment I save this, the WebSocket broadcasts it to every connected dashboard, and if the system is configured, SMS notifications go out to registered emergency contacts in the affected LGA — within 30 seconds."*

---

### 6D — Incident Management with Evidence (9:20 – 9:50)

**[VISUAL: Navigate to `/incidents` — show the incident list, then click into one]**

### NARRATION:
*"The Incident Management System is where detailed case management happens.*

*Open an incident and you see the full picture: a timeline of every status change, an evidence gallery where coordinators can upload photos, videos, and documents — drag and drop, 10MB limit, preview thumbnails.*

*Response notes, assignee history, related alerts, and a resolution workflow that requires closure notes before marking complete.*

*This creates the paper trail needed for community accountability and, eventually, legal proceedings."*

---

### 6E — Patrol Operations (9:50 – 10:25)

**[VISUAL: Navigate to `/patrols` — show team list, then shifts]**

### NARRATION:
*"The Patrol Operations Hub is how vigilante groups are managed as a professional force.*

*Patrol teams are organized by LGA and ward. Each team has a designated leader, a list of members, and a shift schedule on a calendar view.*

*When a patrol shift goes active, members check in through their phones. Each check-in records a timestamp and GPS location.*

*The check-in compliance rate is tracked — if a team goes silent, late check-in alerts fire. The coverage heat map shows patrol density across the region: green areas are well-covered, red areas need more resources.*

*At the end of a shift, the team leader submits a patrol report — which can be exported as a PDF."*

---

### 6F — SOS Response (10:25 – 10:45)

**[VISUAL: Navigate to `/sos` — show the SOS signal list]**

### NARRATION:
*"SOS signals from the Citizen Portal appear here in real time — priority sorted so the oldest unattended signal is always at the top. A browser sound plays when a new SOS arrives.*

*Coordinators can mark themselves as responding, assign the nearest patrol team, and auto-create a linked incident for full case tracking.*

*Every second matters with a SOS signal. This workflow is optimized for speed."*

---

### 6G — Analytics (10:45 – 11:00)

**[VISUAL: Navigate to `/analytics` — show charts]**

### NARRATION:
*"And finally, Analytics — the intelligence layer. Charts for incident trends, response times, patrol performance, and resident engagement.*

*Filter by LGA, date range, type. Click into any data point to drill down. Export as CSV or PDF. Schedule automated weekly reports to be delivered to LGA coordinators.*

*This is how communities stop reacting to emergencies and start preventing them."*

---
---

## 🎬 SCENE 7 — SMS / USSD DEMO (11:00 – 11:45)

**[VISUAL: Navigate to the SMS Simulator in the admin panel — sidebar → SMS Simulator]**

### NARRATION:
*"One feature that makes Ogbenjuwa truly different: it doesn't require a smartphone.*

*The admin panel includes an SMS simulator. Let me show you how it works.*

*I'll send a simulated panic from a feature phone user — the format is: PANIC, the person's name, and their village."*

**[VISUAL: Type the SMS command, select recipients, press send — show the delivery log appear]**

### NARRATION:
*"The message is received, processed, and logged — with delivery status, timestamp, and recipient. In production, this connects to Africa's Talking — a Nigerian telecom API — and the message goes out on actual SMS networks within 30 seconds.*

*Citizens can also dial *347# to access a USSD menu — no data required. They can view active alerts, report incidents, search the family registry, or find emergency resources.*

*This is how Ogbenjuwa reaches every Idoma community member — regardless of what phone they have."*

---
---

## 🎬 SCENE 8 — TECHNICAL ARCHITECTURE (11:45 – 12:30)

**[VISUAL: Show the architecture diagram — can be a slide or drawn diagram]**

### NARRATION:
*"Let's talk about the technical foundation.*

*The backend is a Node.js Express API with TypeScript in strict mode — no any types, full Zod validation on every input. We use Drizzle ORM for type-safe PostgreSQL queries.*

*Authentication uses JWT access tokens with a 15-minute expiry and 7-day refresh tokens stored in httpOnly cookies. Role-based access control is enforced at every middleware layer.*

*Real-time updates are delivered via WebSocket — the command dashboard updates live as alerts are created, incidents change status, and patrol check-ins arrive.*

*The frontends are React 18 with Vite, Tailwind CSS, and Shadcn UI components — deployed as static sites on Vercel for global CDN delivery.*

*The backend is containerized in Docker and deployed on Render, with the database on Neon — a serverless PostgreSQL service.*

*The entire platform has been designed for production from day one — not a hackathon prototype, but a deployable product."*

---
---

## 🎬 SCENE 9 — THE NUMBERS (12:30 – 13:00)

**[VISUAL: Full-screen stats display — bold text on dark background]**

### NARRATION:
*"Here's what we've built:*

*3 independent, production-ready applications.*

*64 admin features across 13 categories.*

*21 API route files, covering authentication, alerts, incidents, patrols, SMS, analytics, audit logs, webhooks, and more.*

*18 database tables — a complete data model for community safety management.*

*9 LGAs covered. 24 wards mapped. 934 plus villages with GPS coordinates, seeded and ready.*

*5 alert types. 6 user roles. Full bilingual support in English and Idoma.*

*And a complete SMS/USSD fallback system — so no one is left out.*

*All deployed. All live."*

---
---

## 🎬 SCENE 10 — THE VISION & CLOSE (13:00 – 14:00)

**[VISUAL: Return to the Beacon Network map — show the full Idoma region with all its LGA boundaries]**

### NARRATION:
*"This map represents something bigger than software.*

*Each boundary is a Local Government Area where real people live, farm, worship, and raise their children. Each pin on this map is a community that deserves to know when danger is coming.*

*Ogbenjuwa is not built for investors first. It's built for Mama Ojoma in Agatu, who needs to know if it's safe for her children to walk to school. For the vigilante leader in Otukpo who needs to coordinate 20 men with no shared communication channel. For the LGA coordinator who needs data to justify putting more patrols in a high-risk ward.*

*But it IS built to scale. Phase 2 brings a native mobile app, Web Push notifications, and service worker offline-first architecture. Phase 3 adds predictive mapping of cattle migration routes — the leading trigger of communal conflict — and AI-assisted incident classification. Phase 4 integrates directly with Benue State's Emergency Management Agency."*

**[VISUAL: Ogbenjuwa logo fades in. Show the live URLs.]**

### NARRATION:
*"The Beacon Network is live at ogbenjuwa.com.ng.*

*The Citizen Portal is at portal.ogbenjuwa.com.ng.*

*The Admin Dashboard is at central-command.ogbenjuwa.com.ng.*

*The code is open on GitHub: AmPhilDanny / Ogbenjuwa-beacon-network.*

*Ogbenjuwa. Built with purpose. Protecting Idoma lives."*

**[MUSIC: Fades in — confident, hopeful closing theme]**

**[VISUAL: Fade to black. Logo remains.]**

---
---

## 📝 APPENDIX — QUICK DEMO TALKING POINTS

### If you only have 3 minutes:
1. Show the Alert Map with a live marker — explain color codes and epicentre radius
2. Show the Panic Button on the Citizen Portal in mobile view
3. Show the Central Command dashboard with live stats
4. Mention SMS/USSD fallback for feature phones

### If questions are asked:

**"How does the SMS integration work?"**
> "We use Africa's Talking SDK — a Nigerian telecom API. When an alert is triggered, our backend fires an SMS to all emergency contacts in the affected LGA. In demo mode, the admin panel has an SMS simulator so you can see delivery logs without needing real phone numbers. Delivery is under 30 seconds in production."

**"What's the tech stack?"**
> "React 18 with TypeScript and Tailwind CSS on the frontends, Node.js Express with Drizzle ORM on the backend, PostgreSQL via Neon, deployed on Vercel and Render. Everything containerized in Docker."

**"Is this really offline-capable?"**
> "Yes. The Citizen Portal caches the last 10 alerts, all emergency contacts, and recent community feed posts in session storage. Incident reports submitted while offline are queued and sync automatically when the connection returns. The USSD code *347# works on any phone — no internet required at all."

**"What's the business model?"**
> "Government subscriptions at the LGA and state level, NGO partnerships for humanitarian response, and diaspora community crowdfunding from Idoma communities abroad who want to contribute to home security."

**"How many users can it handle?"**
> "API targets 500+ concurrent connections, 200+ WebSocket connections simultaneously, with p95 response times under 200ms. The serverless PostgreSQL on Neon scales automatically."

---

## 🎬 HACKATHON SUBMISSION FORM — SUGGESTED ANSWERS

### Project Name:
**Ogbenjuwa Community Safety Network**

### Tagline:
**Real-time community safety and emergency response for Idoma communities in Benue State, Nigeria**

### Problem Statement:
Idoma communities in Benue State lack any real-time emergency alert system. Security threats spread by word-of-mouth, vigilante groups operate without coordination, and most residents cannot access digital safety tools due to language barriers and the digital divide. Lives are lost because information doesn't move fast enough.

### Solution Summary:
Ogbenjuwa is a three-layer community safety platform: a public alert map (Beacon Network), a personal citizen safety app with panic button and offline support (Citizen Portal), and a full admin command dashboard for LGA coordinators and vigilante leaders (Central Command). It supports SMS/USSD (*347#) for feature phones and is available in both English and Idoma.

### Tech Stack:
React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Leaflet, Node.js, Express, Drizzle ORM, PostgreSQL (Neon), JWT, WebSocket, Africa's Talking SDK, Framer Motion, Docker, Vercel, Render

### GitHub URL:
https://github.com/AmPhilDanny/Ogbenjuwa-beacon-network

### Demo URL:
https://ogbenjuwa.com.ng

### Video Demo URL:
[Your video URL here]

---

*Script Version 1.0 — July 8, 2026*  
*Ogbenjuwa Community Safety Network*  
*Built with purpose. Protecting Idoma lives.*
