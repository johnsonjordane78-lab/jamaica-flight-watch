import { Plane, MapPin } from "lucide-react";
import { airports, type Airport, type Flight } from "@/data/flights";
import { motion, AnimatePresence } from "framer-motion";
import AirportRunwayView from "./AirportRunwayView";

interface JamaicaMapProps {
  selectedAirport: string | null;
  onSelectAirport: (code: string | null) => void;
  flightCounts: Record<string, number>;
  flights: Flight[];
}

// More detailed Jamaica outline path
const JAMAICA_PATH = "M8,44 Q9,40 12,37 Q14,34 18,32 Q21,30 25,29 Q28,28 31,28 Q34,27 37,27 Q40,26 43,25.5 Q46,25 49,24.5 Q52,24 55,24.5 Q58,25 61,26 Q63,27 65,28 Q67,27 69,28 Q71,29 73,31 Q75,33 77,35 Q79,37 81,39 Q83,41 85,43 Q87,45 89,47 Q90,49 89,51 Q88,53 87,55 Q85,58 83,60 Q81,63 79,65 Q77,67 75,69 Q73,71 70,72 Q67,73 64,73 Q61,73 58,72 Q55,71 52,69 Q49,67 47,65 Q44,63 41,61 Q38,59 35,57 Q32,55 29,53 Q26,51 23,50 Q20,49 17,48 Q14,47 12,46 Q10,45 8,44 Z";

// Flight path arcs between airports
const FLIGHT_ARCS = [
  { from: 'MKJS', to: 'MKJF', path: 'M22,35 Q37,12 52,28' },
  { from: 'MKJF', to: 'MKJP', path: 'M52,28 Q68,48 78,72' },
  { from: 'MKJS', to: 'MKJP', path: 'M22,35 Q50,62 78,72' },
];

const PlaneOnPath = ({ path, delay, duration }: { path: string; delay: number; duration: number }) => {
  return (
    <motion.g>
      <motion.circle
        r="1.2"
        fill="hsl(40, 96%, 61%)"
        initial={{ offsetDistance: '0%' }}
        animate={{ offsetDistance: '100%' }}
        transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
      >
        <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" fill="freeze">
          <mpath href={`#flight-path-anim`} />
        </animateMotion>
      </motion.circle>
    </motion.g>
  );
};

const JamaicaMap = ({ selectedAirport, onSelectAirport, flightCounts, flights }: JamaicaMapProps) => {
  return (
    <AnimatePresence mode="wait">
      {selectedAirport ? (
        <AirportRunwayView
          key="runway"
          airportCode={selectedAirport}
          flights={flights}
          onBack={() => onSelectAirport(null)}
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
          {/* Ocean pattern */}
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
                <stop offset="0%" stopColor="hsl(152, 40%, 35%)" stopOpacity="0.7" />
                <stop offset="50%" stopColor="hsl(152, 50%, 28%)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="hsl(152, 45%, 22%)" stopOpacity="0.7" />
              </linearGradient>
              <filter id="island-shadow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0.5" dy="0.5" stdDeviation="1" floodColor="hsl(0,0%,0%)" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Jamaica outline with shadow */}
            <path
              d={JAMAICA_PATH}
              fill="url(#islandGrad)"
              stroke="hsl(152, 100%, 32%)"
              strokeWidth="0.4"
              strokeOpacity="0.5"
              filter="url(#island-shadow)"
            />
            {/* Mountain ridges decorative */}
            <path
              d="M20,38 Q30,30 45,28 Q55,26 65,30 Q72,34 78,40"
              fill="none"
              stroke="hsl(152, 40%, 40%)"
              strokeWidth="0.3"
              strokeDasharray="1,1.5"
              opacity="0.5"
            />

            {/* Flight path arcs */}
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
                {/* Animated plane along each arc */}
                <circle r="1" fill="hsl(40, 96%, 61%)" opacity="0.9">
                  <animateMotion
                    dur={`${6 + i * 2}s`}
                    begin={`${i * 1.5}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                  >
                    <mpath xlinkHref={`#arc-${i}`} />
                  </animateMotion>
                </circle>
                {/* Trail */}
                <circle r="0.6" fill="hsl(40, 96%, 61%)" opacity="0.4">
                  <animateMotion
                    dur={`${6 + i * 2}s`}
                    begin={`${i * 1.5 + 0.3}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                  >
                    <mpath xlinkHref={`#arc-${i}`} />
                  </animateMotion>
                </circle>
              </g>
            ))}

            {/* Airport markers */}
            {airports.map((airport) => (
              <g
                key={airport.code}
                className="cursor-pointer"
                onClick={() => onSelectAirport(airport.code)}
              >
                {/* Outer pulse ring */}
                <circle
                  cx={airport.x}
                  cy={airport.y}
                  r="4"
                  fill="none"
                  stroke="hsl(40, 96%, 61%)"
                  strokeWidth="0.3"
                  className="animate-pulse-gold"
                />
                {/* Inner glow */}
                <circle
                  cx={airport.x}
                  cy={airport.y}
                  r="2.5"
                  fill="hsl(40, 96%, 61%)"
                  fillOpacity="0.15"
                />
                {/* Marker dot */}
                <circle
                  cx={airport.x}
                  cy={airport.y}
                  r="1.8"
                  fill="hsl(40, 96%, 61%)"
                  className="transition-all duration-300"
                />
                {/* Label */}
                <text
                  x={airport.x}
                  y={airport.y - 6}
                  textAnchor="middle"
                  fill="hsl(0, 0%, 100%)"
                  fontSize="2.8"
                  fontWeight="700"
                  fontFamily="'Space Grotesk', sans-serif"
                >
                  {airport.shortName}
                </text>
                <text
                  x={airport.x}
                  y={airport.y + 7}
                  textAnchor="middle"
                  fill="hsl(0, 0%, 80%)"
                  fontSize="2"
                  fontFamily="'Inter', sans-serif"
                >
                  {flightCounts[airport.code] || 0} flights
                </text>
                {/* Click hint */}
                <text
                  x={airport.x}
                  y={airport.y + 10}
                  textAnchor="middle"
                  fill="hsl(40, 96%, 61%)"
                  fontSize="1.5"
                  fontFamily="'Inter', sans-serif"
                  opacity="0.6"
                >
                  tap to zoom
                </text>
              </g>
            ))}
          </svg>

          {/* Title overlay */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-accent" />
              <span className="font-display text-sm font-semibold text-primary-foreground tracking-wide">JAMAICA AIRSPACE</span>
            </div>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JamaicaMap;
