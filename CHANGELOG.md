# Changelog

All notable changes to **World Cup 2026 Tracker** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.4.0] — 2026-06-12

### Changed
- `usePolling` now stores previous match data in a `useRef` to enable score diffing without triggering re-renders

---

## [1.3.0] — 2026-06-12

### Added
- **`usePolling` hook** (`hooks/usePolling.js`) — shared client-side data fetching with automatic background refresh
  - Adaptive intervals: **10 seconds** when live matches are detected, **30 seconds** otherwise
  - `useRef` pattern for `fetchFn` prevents stale closure issues without `fetchFn` as a dependency
  - `setTimeout(run, 0)` defers the initial fetch to avoid synchronous `setState` inside `useEffect` (fixes React cascade render warning)
  - `cancelled` flag prevents state updates after unmount or effect re-run

### Changed
- All pages converted from **server components** to **client components** (`"use client"`)
  - `app/page.jsx` — Home
  - `app/fixtures/page.jsx` — Fixtures
  - `app/standings/page.jsx` — Standings
  - `app/bracket/page.jsx` — Bracket
- Removed `export const dynamic = "force-dynamic"` from all pages (no longer needed)
- API calls moved from `lib/api.js` imports to direct `fetch()` calls inside each page's async fetcher function
- All pages now show a **loading skeleton** (pulsing placeholder cards) on first load

---

## [1.2.0] — 2026-06-12

### Added
- **GF (Goals For)** and **GA (Goals Against)** columns to the Group Standings table
- Standings now sort correctly by: **Points → Goal Difference → Goals For**
- `sortTeams()` helper function extracted to avoid duplicating sort logic across display, third-place detection, and best-8 selection

### Fixed
- Group standings were previously displaying teams in API response order instead of ranked order — teams are now sorted after mapping regardless of how the API returns them
- Third-place best-8 qualification logic now sorts teams first before picking index `[2]`, ensuring the correct 3rd-place team is identified per group

---

## [1.1.0] — 2026-06-12

### Added
- **Fixtures page** (`app/fixtures/page.jsx`)
  - All group stage matches grouped by Lebanon calendar date (Asia/Beirut timezone)
  - Dedicated **Live Now** section with red pulse indicator
  - Match count per day shown in section header
  - "Today" highlight on the current day's section header
- **Knockout Bracket page** (`app/bracket/page.jsx`)
  - SVG connector lines with gold arrowheads linking rounds
  - Desktop: horizontally scrollable bracket with absolute-positioned columns
  - Mobile: stacked rounds list
  - Empty state with placeholder TBD cards covering all 5 rounds (Round of 32 through Final)
  - Champion trophy displayed at the end of the bracket
- **`BracketMatchCard`** component — shared card for both desktop and mobile bracket views
- **`AbsoluteColumn`** and **`BracketConnectors`** layout components for the SVG bracket
- Live match detection in bracket (`isLive` derived from `time_elapsed` and match date)

### Changed
- Navbar active link style updated to filled gold pill
- Footer updated with data source attribution and refresh interval note

---

## [1.0.0] — 2026-06-11

### Added
- **Project initialised** with Next.js 15 App Router and Tailwind CSS
- **Design system** — dark pitch background, gold (`#D4AF37`) accent color, custom `font-display` and `font-body` typography, `animate-fade-in` and `animate-slide-up` keyframe animations
- **`Navbar`** component (`components/Navbar/page.jsx`)
  - Sticky, backdrop-blurred header
  - Active route detection with gold pill highlight
  - Links: Live · Fixtures · Groups · Bracket
- **`MatchCard`** component (`components/MatchCard/page.jsx`)
  - Three visual states: live (gold border + gradient), finished, upcoming
  - Team flags from API URL or emoji fallback
  - Score display with gold styling during live matches
  - Lebanon timezone formatting for kickoff times and dates
  - Venue display with pin emoji
- **Home page** (`app/page.jsx`)
  - Hero section with tournament branding
  - Live Now section with red pulse dot and auto-refresh label
  - Up Next section showing next 6 upcoming matches
  - Empty states for both sections
- **Group Standings page** (`app/standings/page.jsx`)
  - All groups rendered in a responsive 2-column grid
  - Columns: Rank · Flag · Team · MP · W · D · L · GD · Pts
  - Gold highlight for qualified teams (top 2 per group)
  - Best 8 third-place teams highlighted across all groups
  - Staggered slide-up animation per group card
- **`lib/api.js`** — `safeFetch` wrapper with error handling for `/get/games`, `/get/teams`, `/get/groups`
- **`lib/teams.js`** — `getTeamMap()` helper returning a keyed map of team data by ID
- **Root layout** (`app/layout.jsx`) with global metadata, Navbar, and footer
- **`force-dynamic`** export on all pages to disable caching and ensure fresh data on every request

---

*Dates reflect the Lebanon timezone (Asia/Beirut, UTC+3).*
