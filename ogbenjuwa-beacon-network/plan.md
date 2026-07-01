# Implementation Plan - Ogbenjuwa Community Safety Network (Localized for Idoma, Benue State, Nigeria)

> **Last updated:** June 2026 — ALL PHASES COMPLETE. See `../deepseek.md` for full task tracking.

## Progress Summary
| Phase | Status |
|-------|--------|
| Phase 0: Foundation & Setup | ✅ Done |
| Phase 1: Authentication | ✅ Done — Login (phone/OTP/role), auth guard, session display, role-based nav |
| Phase 2: Alert System | ✅ Done — SOS button, Leaflet alert map, triggerAlert/resetAlert, SMS feed, USSD simulation, alert stats bar |
| Phase 3: Patrol Map | ✅ Done — Leaflet map, 5 patrol members, dead man's switch, sighting system, coverage zones, verified working |
| Phase 4: Family Reunification | ✅ Done — Search registry, fuzzy matching, result cards with status colours, reunion code modal, privacy controls |
| Phase 5: Command Dashboard | ✅ Done — Collapsible sidebar, KPI row, heatmap simulation, live incident feed, severity bar chart, response time table |
| Phase 6: Investor Landing Page | ✅ Done — Crisis ticker, stats card, problem/solution sections, revenue model, roadmap, CTA with investment ask, conditional nav |
| Phase 7+: Polish & Docs | ✅ Done — Nav polish, USSD/SMS, offline persistence, Idoma localization, testing QA, mobile responsiveness, color audit, documentation |

Build a comprehensive community safety platform localized for the Idoma region in Benue State, Nigeria. The platform will facilitate neighborhood watch (Nyumba Kumi adapted to local Ward/Cluster structures), real-time emergency reporting, and resource management.

## Scope Summary
- **Core Platform:** Web-based dashboard for residents and administrators.
- **Localization:** Specific focus on Otukpo and the wider Idoma region (Wards, Clusters).
- **Key Features:** 
  - Real-time SOS Trigger (Visual/Audio alerts).
  - Incident Reporting (Crime, Fire, Medical, Utilities) with status tracking.
  - Community Feed (Announcements, Incident updates).
  - Resource Directory (FMC Otukpo, Police stations, Fire service).
  - Neighborhood Management (Ward-level organization).
- **Tech Stack:** React, Vite, Tailwind CSS (v4), Shadcn UI, Lucide Icons, Framer Motion.
- **Data Strategy:** Client-side only (localStorage/mock data) for initial MVP phase. No active Supabase backend yet.

## Auth & RLS model
**Auth in scope:** no
**Model:** no_auth_public_read
**RLS strategy:** none (Client-side simulation only)
**Frontend implication:** User role and Ward/Cluster assignment will be managed via localStorage/mock state.

## Migration baseline
**Local migrations in project:** none
**User confirmed proceed on connected DB:** not_applicable (Local development focus)

## Assumptions & Open Questions
- **Assumption:** The app is a PWA-ready web application for mobile-first use in Otukpo.
- **Assumption:** Localization includes specific Nigerian emergency numbers (112, 767) and local hospital contacts (FMC Otukpo).
- **Question:** Are there specific cultural symbols or colors for the Idoma community to incorporate? (Will start with standard safety palette: Green/White for Nigeria, Red for SOS).

## Affected Areas
- **Frontend:** Multi-page routing, responsive dashboard, real-time alert state management.
- **Localization:** All placeholder data (Names, Locations, Contacts) must reflect Benue State / Idoma context.
- **Components:** SOS overlay, Incident cards, Ward-specific announcement lists.

## Phases

### Phase 1: Localization & Layout Foundation
- Update `MainLayout`, `TopNav`, and `Sidebar` with Ogbenjuwa branding and Nigerian context.
- Configure routing for Home, Feed, Report, Resources, and Profile.
- Establish a "Local Context" hook to provide Ward/Cluster information (e.g., Otukpo Township Ward 1).
- **Owner:** `frontend_engineer`

### Phase 2: SOS & Emergency Directory
- Build the "Big Red Button" SOS trigger flow with sound/visual feedback.
- Implement the "Emergency Resources" page localized for Otukpo (FMC Otukpo, Otukpo Police Division).
- Create a persistent "Active Alert" banner when SOS is triggered.
- **Owner:** `frontend_engineer`

### Phase 3: Incident Reporting & Community Feed
- Develop the "Report Incident" form with categories relevant to Nigeria (e.g., Power Outage, Highway Robbery).
- Build the Community Feed with filtering by "My Ward" vs "Global".
- Integrate `localStorage` to persist reports and display them in the feed.
- **Owner:** `frontend_engineer`

### Phase 4: Neighborhood & Profiles (Idoma Context)
- Build the "My Neighborhood" page showing Ward structure and Cluster leaders.
- Create the Profile page with simulated "Verified Resident" status.
- Add "Community Guidelines" specific to local peace-building efforts.
- **Owner:** `frontend_engineer`

### Phase 5: Polish & Responsiveness
- Refine mobile navigation (Bottom bar for mobile, Sidebar for desktop).
- Add Framer Motion animations for incident card entry and SOS pulses.
- Fix any UI typos and ensure all text aligns with Idoma/Nigerian English conventions.
- **Owner:** `quick_fix_engineer`

## Execution Handoff

**Plan status:** ready

**Dispatch order:**
1. frontend_engineer — Localization, Foundation, and Core Feature Implementation.
2. quick_fix_engineer — Mobile responsiveness and UI polish.

**Per-agent instructions:**

### 1. frontend_engineer
- **Phases:** 1, 2, 3, 4
- **Scope:** 
    - Ensure all mock data refers to Otukpo/Idoma (e.g., "Chief Sunday", "Otukpo Ward 3").
    - Implement `react-router-dom` for navigation.
    - Build functional SOS toggle state across the app.
    - Create the Incident Report form and Feed list using `localStorage`.
- **Files:** `src/App.tsx`, `src/pages/*`, `src/components/*`, `src/hooks/useIncidents.ts`
- **Depends on:** none
- **Acceptance criteria:**
    - App navigates correctly between localized pages.
    - SOS button activates a "Danger" UI state.
    - Incident reports submitted by the user appear in the feed.

### 2. quick_fix_engineer
- **Phases:** 5
- **Scope:** 
    - Optimize layout for Android/iPhone screens (standard in Nigeria).
    - Add entrance animations for a "premium" feel.
    - Verify all localized text for clarity and consistency.
- **Files:** `src/index.css`, `src/components/layout/MainLayout.tsx`
- **Depends on:** frontend_engineer
- **Acceptance criteria:**
    - 100% responsive on mobile.
    - Smooth transitions between views.
    - Professional "Ogbenjuwa" branding throughout.

**Do not dispatch:** supabase_engineer (No backend work requested for this step).
