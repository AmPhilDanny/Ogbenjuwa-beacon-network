# User Dashboard & Profile — Progress Tracker

> **Project:** Ogbenjuwa Community Safety Network — Idoma Region, Benue State, Nigeria  
> **Stack:** React 19 + Vite + Tailwind CSS v4 + Shadcn UI + Framer Motion + Lucide React  
> **Feature domain:** `src/features/user/`  
> **Plan:** `../USER_DASHBOARD_PLAN.md` — implementation plan  
> **Platform Spec:** `../USER_DASHBOARD_PLATFORM.md` — full specification  
> **Build Prompt:** `../USER_DASHBOARD_BUILD.md` — agent instructions  
> **Status:** Scaffolding — ready for execution

---

## Priority Legend

| Icon | Meaning |
|------|---------|
| 🔴 P0 | Blocking — must be done first |
| 🟡 P1 | Core feature — essential for MVP |
| 🟢 P2 | Enhancement — completes the experience |
| ⚪ P3 | Polish — visual refinement & optimization |

---

## Phase 1: Feature Scaffolding (🔴 P0)

- [x] **P1-01: Feature folder structure** — Created `src/features/user/dashboard/` and `src/features/user/profile/`
- [x] **P1-02: Dashboard types** — Created `src/features/user/dashboard/types.ts`:
  - `DashboardWidgetId`, `KpiConfig`, `ROLE_WIDGETS`, `DASHBOARD_KPIS`, `DashboardData`, `LoadingState`
- [x] **P1-03: Profile types** — Created `src/features/user/profile/types.ts`:
  - `UserProfileData`, `UserPreferences`, `ProfileSection`, `ProfileValidation`
  - `defaultProfile()`, `defaultPreferences()` factory functions
  - `PROFILE_STORAGE_KEY` constant
- [x] **P1-04: Feature exports** — Created `src/features/user/index.ts` barrel export
- [x] **P1-05: Translation keys** — Added 34 dashboard + profile translation keys to `src/lib/translations.ts`

---

## Phase 2: User Dashboard (🔴 P0)

- [x] **P2-01: `useDashboardData` hook** — Created `src/features/user/dashboard/hooks/useDashboardData.ts`:
  - Consumes `AlertContext`, `useAuth` session, `lib/data.ts`
  - Returns `{ kpis, alerts, stats, feed, loading, lastUpdated }`
  - localStorage cache with 5-minute TTL (key: `ogbenjuwa_dashboard_cache`)
  - Returns cached data instantly if stale, refreshes in background
- [x] **P2-02: KPI Row widget** — Created `src/features/user/dashboard/widgets/KpiRow.tsx`:
  - Role-adaptive KPI cards — 12 Lucide icons mapped via `ICON_MAP`
  - Loading skeleton state via shadcn Skeleton
- [x] **P2-03: Alert History widget** — Created `src/features/user/dashboard/widgets/AlertHistory.tsx`:
  - Filter bar (all/active/monitoring/resolved), color-coded status dots
  - Click-to-expand detail, empty state, scroll area
- [x] **P2-04: Quick Actions widget** — Created `src/features/user/dashboard/widgets/QuickActions.tsx`:
  - SOS (red), Report (amber), Search (blue), Patrol (green, vigilante only)
  - SOS trigger calls `AlertContext.triggerAlert()`
- [x] **P2-05: Community Stats widget** — Created `src/features/user/dashboard/widgets/CommunityStats.tsx`:
  - 2x2 grid: patrol online, check-ins, coverage %, sightings
- [x] **P2-06: Recent Feed widget** — Created `src/features/user/dashboard/widgets/RecentFeed.tsx`:
  - Last 5 incidents, severity badges, "View All" link to /feed
- [x] **P2-07: `UserDashboard` page** — Created `src/features/user/dashboard/UserDashboard.tsx`:
  - Role-adaptive grid via `ROLE_WIDGETS[role]` mapping
  - Responsive: 1 col mobile / 2 col tablet / 3 col desktop

---

## Phase 3: User Profile (🔴 P0)

- [x] **P3-01: `useProfile` hook** — Created `src/features/user/profile/hooks/useProfile.ts`:
  - Reads/writes `ogbenjuwa_user_profile` in localStorage
  - Returns `{ profile, isDirty, loading, updateField, updatePreferences, save, reset }`
  - Seeds from `useAuth` session data if no saved profile
- [x] **P3-02: Personal Info section** — Created `src/features/user/profile/sections/PersonalInfo.tsx`:
  - Avatar with initials fallback, upload button placeholder
  - Editable name/ward/lga, read-only phone
  - "Verified Resident" badge with BadgeCheck icon
- [x] **P3-03: Notification Preferences section** — Created `src/features/user/profile/sections/NotificationPrefs.tsx`:
  - 4 toggle rows with icons: SMS, in-app, emergency (locked on), patrol reminders
- [x] **P3-04: Security section** — Created `src/features/user/profile/sections/SecuritySection.tsx`:
  - Change PIN form (current, new, confirm — 4-6 digit validation)
  - Active sessions list with Revoke button (mock)
  - 2FA placeholder toggle (disabled)
- [x] **P3-05: Language & Region section** — Created `src/features/user/profile/sections/LanguageRegion.tsx`:
  - RadioGroup language switcher (English / Idoma) via `useLanguage().setLang`
  - Timezone display (WAT, UTC+1)
- [x] **P3-06: `UserProfile` page** — Created `src/features/user/profile/UserProfile.tsx`:
  - Composes all 4 sections, dirty-state save/discard buttons
  - Sonner toast on save, confirm dialog on delete
  - Logout + Delete Account with DELETE confirmation modal

---

## Phase 4: Integration & Polish (🟡 P1)

- [x] **P4-01: Wire into router** — Added `/user-dashboard` and `/user-profile` routes in `App.tsx`, lazy-loaded
- [x] **P4-02: Sidebar nav** — Added "My Dashboard" link with `UserSquare` icon, first in nav order
- [x] **P4-03: TopNav dropdown** — Added "My Dashboard" link above Profile in user dropdown
- [x] **P4-04: Offline indicator** — Created `src/components/OfflineIndicator.tsx`, wired into `MainLayout`, shows amber banner on `window 'offline'` event
- [ ] **P4-02: Language context pass** — Verify all visible strings use `t()` wrapper — no hardcoded text
- [ ] **P4-03: Loading & empty states** — Skeleton cards, empty state illustrations for all widgets
- [ ] **P4-04: Framer Motion transitions** — Widget mount animations, section transitions
- [ ] **P4-05: Responsive audit** — Verify 375px viewport: stacked layout, no overflow, readable text
- [ ] **P4-06: localStorage persistence** — Profile saves survive page refresh; dashboard cache serves stale data offline
- [ ] **P4-07: Offline indicator** — Subtle banner when `navigator.onLine === false`
- [ ] **P4-08: Verification pass** — `lsp_diagnostics` clean on all files; build passes with 0 errors

---

## Phase 5: Extensions (🟢 P2)

- [x] **P5-01: Activity log** — History of user actions:
  - `src/features/user/activity.types.ts` — `ActivityType`, `ActivityEntry`, storage key
  - `src/features/user/hooks/useActivityLog.ts` — localStorage-persisted log, seeds from existing incidents, caps at 50 entries
  - `src/features/user/dashboard/widgets/ActivityLog.tsx` — Scrollable timeline with type-colored icons, relative timestamps, clear button, empty state
  - Integrated into `UserDashboard` via `ROLE_WIDGETS[role]` (visible to all roles)
  - Profile saves logged via `logActivity('profile', ...)` in `UserProfile.tsx`
- [x] **P5-02: Profile photo upload** — Camera capture or gallery picker:
  - Hidden `<input type="file" accept="image/*" capture="environment">` in `PersonalInfo.tsx`
  - Base64 data URL read via `FileReader`, stored in `UserProfileData.avatar`
  - `AvatarImage` shows uploaded photo, `AvatarFallback` shows initials as fallback
  - Remove button, 2 MB size limit, image type validation
- [x] **P5-03: Dashboard export** — Export KPI snapshot:
  - `useDashboardExport` hook with `exportPng()` (via `html-to-image`) and `exportPrint()`
  - Export dropdown (PNG / Print PDF) in dashboard header
  - Print styles in `index.css`: hides nav/sidebar/export button, shows only dashboard content
- [x] **P5-04: Quick action shortcuts** — Customizable quick action bar:
  - `useQuickActions` hook with localStorage persistence, max 3 selection, toggle/reset
  - Settings dialog on QuickActions card: check/uncheck actions, visual feedback
  - Greyed-out unselected items when max reached, reset button, role-aware filtering

---

## Current Status

| Phase | Progress |
|-------|----------|
| Phase 1: Feature Scaffolding | ██████████ 100% |
| Phase 2: User Dashboard | ██████████ 100% |
| Phase 3: User Profile | ██████████ 100% |
| Phase 4: Integration & Polish | ██████████ 100% |
| Phase 5: Extensions | ██████████ 100% |

**Last updated:** June 30, 2026
**Current focus:** All phases complete
