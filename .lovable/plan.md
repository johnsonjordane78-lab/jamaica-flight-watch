

## Plan: Integrate AviationStack API for Real Flight Data

The AviationStack API key (`da95abd66390d57c830f67e843ddfc94`) will replace the mock flight simulation with real flight data from Jamaica's three airports.

### Architecture

Since the AviationStack API key is a **publishable/public API key** (it's used in client-side HTTP requests to aviationstack.com), we'll store it securely in an Edge Function to avoid exposing it in the browser. The Edge Function will proxy requests to AviationStack and return normalized flight data.

### 1. Store API Key as a Secret
Use the `add_secret` tool to store `AVIATIONSTACK_API_KEY` with value `da95abd66390d57c830f67e843ddfc94`.

### 2. Create Edge Function: `supabase/functions/fetch-flights/index.ts`
- Proxies requests to `http://api.aviationstack.com/v1/flights`
- Queries flights for IATA codes: `MBJ` (Sangster), `OCJ` (Ian Fleming), `KIN` (Norman Manley)
- Fetches both arrivals and departures for each airport
- Normalizes AviationStack response into the existing `Flight` interface format (mapping `flight_status`, `flight.iata`, `airline.name`, `aircraft.registration`, `aircraft.iata`, etc.)
- Returns combined, deduplicated flight list
- Includes CORS headers

### 3. Rewrite `src/hooks/useFlightSimulation.ts` → `src/hooks/useFlights.ts`
- Replace mock simulation with a hook that:
  - Calls the `fetch-flights` Edge Function on mount
  - Auto-refreshes every 60 seconds (AviationStack free tier has rate limits)
  - Maps API response to existing `Flight` type
  - Tracks `changedIds` by comparing previous vs new flight statuses
  - Falls back to mock data if API fails
  - Returns `{ flights, lastUpdated, changedIds, isLive, isLoading, error }`

### 4. Update `src/data/flights.ts`
- Add IATA-to-ICAO mapping (`MBJ`→`MKJS`, `OCJ`→`MKJF`, `KIN`→`MKJP`)
- Add helper to map AviationStack status strings to our status type

### 5. Update `src/pages/Index.tsx`
- Import new `useFlights` hook instead of `useFlightSimulation`
- Add loading skeleton state while fetching
- Show error toast if API fails (with fallback to mock data)
- Keep all existing UI (LIVE badge, stats, map, flight log) unchanged

### 6. Keep Existing UI Components Unchanged
- `FlightLog.tsx`, `JamaicaMap.tsx`, `AirportRunwayView.tsx` — no changes needed since they consume the same `Flight[]` interface

### Files Summary

| File | Action |
|------|--------|
| Secret: `AVIATIONSTACK_API_KEY` | Add via tool |
| `supabase/functions/fetch-flights/index.ts` | Create |
| `src/hooks/useFlights.ts` | Create (replaces useFlightSimulation) |
| `src/data/flights.ts` | Edit — add IATA mapping helpers |
| `src/pages/Index.tsx` | Edit — use new hook, add loading state |

### AviationStack API Notes
- Free tier: 100 requests/month, HTTP only (no HTTPS)
- Endpoint: `http://api.aviationstack.com/v1/flights?access_key=KEY&arr_iata=MBJ`
- We'll batch 6 requests per refresh (arrivals + departures × 3 airports), so ~10 refreshes/month on free tier
- To conserve quota, we cache results for 5 minutes in the Edge Function response headers

