

## Plan: Live Flight Status & Enhanced Map with Airport Zoom

### 1. Create `src/hooks/useFlightSimulation.ts` — Live Status Hook
- Wraps `mockFlights` in React state, runs a `setInterval` every 20 seconds
- Randomly transitions flight statuses through realistic progressions (on-time -> boarding -> departed -> arrived), reassigns gates, shifts times
- Returns `{ flights, lastUpdated, isLive }` for use in Index.tsx
- Tracks which flight IDs changed so FlightLog can highlight them

### 2. Update `src/pages/Index.tsx` — Use Live Data + LIVE Indicator
- Replace static `mockFlights` with `useFlightSimulation()` hook
- Add a pulsing green "LIVE" badge next to the title with "Updated X seconds ago" text
- Pass live flights to both stats computation and FlightLog

### 3. Update `src/components/FlightLog.tsx` — Status Change Highlights
- Track previous flight statuses via `useRef`
- When a flight's status changes, briefly flash the row with a gold/green background highlight that fades after 2 seconds
- Show a small "Updated" indicator on recently changed flights

### 4. Rewrite `src/components/JamaicaMap.tsx` — Enhanced Map + Zoom
- **Better Jamaica outline**: Replace the simplified path with a more detailed, accurate Jamaica silhouette SVG path at a larger scale (aspect ratio ~2.2:1)
- **Animated planes on paths**: Use Framer Motion to animate plane icons continuously along the bezier flight path arcs between airports. Each active flight gets a small plane SVG moving along the corresponding arc
- **Airport zoom**: When `selectedAirport` is set, use `AnimatePresence` to transition from the island overview to the `AirportRunwayView` component within the same container

### 5. Create `src/components/AirportRunwayView.tsx` — Runway Detail View
- SVG-based top-down runway layout unique to each airport:
  - **MKJS (Sangster)**: Single main runway 07/25, terminal on south side
  - **MKJF (Ian Fleming)**: Short single runway 10/28, small terminal
  - **MKJP (Norman Manley)**: Runway 12/30 on the Palisadoes peninsula, terminal complex
- Shows planes parked at gates or on runway based on current flight data for that airport
- Includes a "Back to Map" button to zoom out
- Animated entry/exit with Framer Motion

### 6. Update `src/index.css` — New Animations
- Add `@keyframes status-flash` for row highlight on status change
- Add `@keyframes live-pulse` for the LIVE indicator dot
- Add plane-along-path animation keyframes

### Files Summary

| File | Action |
|------|--------|
| `src/hooks/useFlightSimulation.ts` | Create |
| `src/components/AirportRunwayView.tsx` | Create |
| `src/components/JamaicaMap.tsx` | Rewrite |
| `src/components/FlightLog.tsx` | Edit |
| `src/pages/Index.tsx` | Edit |
| `src/index.css` | Edit |

