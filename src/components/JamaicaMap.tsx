import { useState, useEffect } from "react";
import { Plane, MapPin } from "lucide-react";
import { airports, type Flight } from "@/data/flights";
import { motion, AnimatePresence } from "framer-motion";
import AirportRunwayView from "./AirportRunwayView";
import { useFlightStore } from "@/store/useFlightStore";

interface JamaicaMapProps {
  flightCounts: Record<string, number>;
  flights: Flight[];
}

// ── Geographic bounds from the Geofabrik PBF extract ──────────────────────
const BBOX = { minLon: -78.3689, maxLon: -75.9700, minLat: 16.9463, maxLat: 18.5256 };

// Project [lon, lat] → SVG coordinate in a 100×100 viewBox
// x: 5–95 (90 units), y: 25–75 (50 units) — keeps island centred vertically
const project = (lon: number, lat: number): [number, number] => {
  const x = ((lon - BBOX.minLon) / (BBOX.maxLon - BBOX.minLon)) * 90 + 5;
  const y = ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * 50 + 25;
  return [x, y];
};

// Build an SVG path "d" string from a GeoJSON LineString coordinate array.
// Sample every Nth point to keep DOM lean while preserving visual detail.
const coordsToPath = (coords: [number, number][], step = 3): string =>
  coords
    .filter((_, i) => i % step === 0 || i === coords.length - 1)
    .map(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

// ── Updated flight arcs using real projected airport positions ─────────────
const FLIGHT_ARCS = [
  { from: "MKJS", to: "MKJF", path: "M22,26 Q40,15 58,35" },
  { from: "MKJF", to: "MKJP", path: "M58,35 Q65,28 64,44" },
  { from: "MKJS", to: "MKJP", path: "M22,26 Q43,55 64,44" },
];

interface GeoFeature {
  type: string;
  geometry: { type: string; coordinates: [number, number][] };
}

const JamaicaMap = ({ flightCounts, flights }: JamaicaMapProps) => {
  const { selectedAirport, setAirport } = useFlightStore();
  const [coastFeatures, setCoastFeatures] = useState<GeoFeature[]>([]);
  const [geoLoaded, setGeoLoaded] = useState(false);

  useEffect(() => {
    fetch("/jamaica-coastline.geojson")
      .then((r) => r.json())
      .then((data) => {
        setCoastFeatures(data.features ?? []);
        setGeoLoaded(true);
      })
      .catch((err) => {
        console.warn("Could not load coastline GeoJSON:", err);
        setGeoLoaded(true); // fall through to placeholder
      });
  }, []);

  return (
    <AnimatePresence mode="wait">
      {selectedAirport ? (
        <AirportRunwayView
          key="runway"
          airportCode={selectedAirport}
          flights={flights}
          onBack={() => setAirport(null)}
        />
      ) : (
        <motion.div
          key="map"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4 }}
          className="relative w-full aspect-[2.2/1] bg-primary rounded-lg overflow-hidden select-none"
        >
          {/* Ocean wave pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="waves" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 10 Q10 0, 20 10 Q30 20, 40 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-foreground" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#waves)" />
            </svg>
          </div>

          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="islandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="hsl(152, 40%, 35%)" stopOpacity="0.8" />
                <stop offset="50%"  stopColor="hsl(152, 50%, 28%)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(152, 45%, 22%)" stopOpacity="0.8" />
              </linearGradient>
              <filter id="island-shadow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0.3" dy="0.3" stdDeviation="0.8" floodColor="hsl(0,0%,0%)" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* ── Real Jamaica coastline from PBF/GeoJSON ── */}
            {geoLoaded && coastFeatures.length > 0 ? (
              <g filter="url(#island-shadow)">
                {coastFeatures.map((f, i) => (
                  <path
                    key={i}
                    d={coordsToPath(f.geometry.coordinates)}
                    fill="none"
                    stroke="url(#islandGrad)"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {/* Bright outline edge for contrast */}
                {coastFeatures.map((f, i) => (
                  <path
                    key={`outline-${i}`}
                    d={coordsToPath(f.geometry.coordinates)}
                    fill="none"
                    stroke="hsl(152, 100%, 38%)"
                    strokeWidth="0.25"
                    strokeOpacity="0.6"
                  />
                ))}
              </g>
            ) : (
              /* Fallback placeholder while loading */
              <path
                d="M8,44 Q14,34 25,29 Q37,27 49,24.5 Q61,26 69,28 Q79,37 89,47 Q88,53 83,60 Q75,69 64,73 Q52,69 41,61 Q29,53 17,48 Z"
                fill="hsl(152, 40%, 28%)"
                fillOpacity="0.5"
                stroke="hsl(152, 100%, 32%)"
                strokeWidth="0.4"
              />
            )}

            {/* Mountain ridge decoration */}
            <path
              d="M20,38 Q30,30 45,29 Q55,27 65,31 Q72,35 78,40"
              fill="none"
              stroke="hsl(152, 40%, 55%)"
              strokeWidth="0.3"
              strokeDasharray="1,1.5"
              opacity="0.45"
            />

            {/* ── Flight arcs ── */}
            {FLIGHT_ARCS.map((arc, i) => (
              <g key={i}>
                <path
                  id={`arc-${i}`}
                  d={arc.path}
                  fill="none"
                  stroke="hsl(40, 96%, 61%)"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                  opacity="0.4"
                />
                {/* Animated plane dot */}
                <circle r="1" fill="hsl(40, 96%, 61%)" opacity="0.9">
                  <animateMotion dur={`${6 + i * 2}s`} begin={`${i * 1.5}s`} repeatCount="indefinite" rotate="auto">
                    <mpath xlinkHref={`#arc-${i}`} />
                  </animateMotion>
                </circle>
                {/* Trail dot */}
                <circle r="0.6" fill="hsl(40, 96%, 61%)" opacity="0.4">
                  <animateMotion dur={`${6 + i * 2}s`} begin={`${i * 1.5 + 0.3}s`} repeatCount="indefinite" rotate="auto">
                    <mpath xlinkHref={`#arc-${i}`} />
                  </animateMotion>
                </circle>
              </g>
            ))}

            {/* ── Airport markers ── */}
            {airports.map((airport) => (
              <g key={airport.code} className="cursor-pointer" onClick={() => setAirport(airport.code)}>
                <circle cx={airport.x} cy={airport.y} r="4"   fill="none" stroke="hsl(40, 96%, 61%)" strokeWidth="0.3" className="animate-pulse-gold" />
                <circle cx={airport.x} cy={airport.y} r="2.5" fill="hsl(40, 96%, 61%)" fillOpacity="0.15" />
                <circle cx={airport.x} cy={airport.y} r="1.8" fill="hsl(40, 96%, 61%)" className="transition-all duration-300" />
                <text x={airport.x} y={airport.y - 6} textAnchor="middle" fill="hsl(0, 0%, 100%)"    fontSize="2.8" fontWeight="700" fontFamily="'Space Grotesk', sans-serif">{airport.shortName}</text>
                <text x={airport.x} y={airport.y + 7} textAnchor="middle" fill="hsl(0, 0%, 80%)"     fontSize="2"   fontFamily="'Inter', sans-serif">{flightCounts[airport.code] || 0} flights</text>
                <text x={airport.x} y={airport.y + 10} textAnchor="middle" fill="hsl(40, 96%, 61%)"  fontSize="1.5" fontFamily="'Inter', sans-serif" opacity="0.6">tap to zoom</text>
              </g>
            ))}
          </svg>

          {/* Title overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Plane className="h-5 w-5 text-accent" />
            <span className="font-display text-sm font-semibold text-primary-foreground tracking-wide">JAMAICA AIRSPACE</span>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-primary-foreground/70">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-gold" />
              Active
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Airport
            </span>
          </div>

          {/* Loading indicator */}
          {!geoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-primary-foreground/50 animate-pulse">Loading map…</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JamaicaMap;
