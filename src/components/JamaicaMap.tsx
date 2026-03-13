import { Plane, MapPin } from "lucide-react";
import { airports, type Airport } from "@/data/flights";
import { motion } from "framer-motion";

interface JamaicaMapProps {
  selectedAirport: string | null;
  onSelectAirport: (code: string | null) => void;
  flightCounts: Record<string, number>;
}

const JamaicaMap = ({ selectedAirport, onSelectAirport, flightCounts }: JamaicaMapProps) => {
  return (
    <div className="relative w-full aspect-[2/1] bg-primary rounded-lg overflow-hidden select-none">
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

      {/* Jamaica island shape (simplified) */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="islandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(152, 40%, 35%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(152, 50%, 25%)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Simplified Jamaica outline */}
        <path
          d="M12,45 Q15,38 22,35 Q28,32 35,33 Q42,30 50,28 Q55,27 60,30 Q65,28 70,32 Q75,35 78,38 Q82,42 88,45 Q90,48 88,52 Q85,58 82,62 Q78,68 72,72 Q68,74 62,73 Q55,72 50,68 Q45,65 40,62 Q35,58 28,55 Q22,52 18,50 Q14,48 12,45 Z"
          fill="url(#islandGrad)"
          stroke="hsl(152, 100%, 32%)"
          strokeWidth="0.5"
          strokeOpacity="0.4"
        />

        {/* Airport markers */}
        {airports.map((airport) => (
          <g key={airport.code} className="cursor-pointer" onClick={() => onSelectAirport(selectedAirport === airport.code ? null : airport.code)}>
            {/* Pulse ring for active */}
            <circle
              cx={airport.x}
              cy={airport.y}
              r={selectedAirport === airport.code ? 4 : 2.5}
              fill="none"
              stroke="hsl(40, 96%, 61%)"
              strokeWidth="0.5"
              className="animate-pulse-gold"
            />
            {/* Marker dot */}
            <circle
              cx={airport.x}
              cy={airport.y}
              r={selectedAirport === airport.code ? 2.5 : 1.5}
              fill="hsl(40, 96%, 61%)"
              className="transition-all duration-300"
            />
            {/* Label */}
            <text
              x={airport.x}
              y={airport.y - 5}
              textAnchor="middle"
              fill="hsl(0, 0%, 100%)"
              fontSize="2.8"
              fontWeight="600"
              fontFamily="'Space Grotesk', sans-serif"
            >
              {airport.shortName}
            </text>
            <text
              x={airport.x}
              y={airport.y + 6}
              textAnchor="middle"
              fill="hsl(0, 0%, 85%)"
              fontSize="2"
              fontFamily="'Inter', sans-serif"
            >
              {flightCounts[airport.code] || 0} flights
            </text>
          </g>
        ))}

        {/* Flight paths (decorative arcs) */}
        <path d="M22,35 Q37,15 52,28" fill="none" stroke="hsl(40, 96%, 61%)" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.4" />
        <path d="M52,28 Q65,50 78,72" fill="none" stroke="hsl(40, 96%, 61%)" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.4" />
        <path d="M22,35 Q50,60 78,72" fill="none" stroke="hsl(40, 96%, 61%)" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.4" />

        {/* Small plane icons on paths */}
        <g transform="translate(37, 22) rotate(30)">
          <polygon points="0,-1.5 1,1.5 -1,1.5" fill="hsl(40, 96%, 61%)" opacity="0.8" />
        </g>
        <g transform="translate(65, 50) rotate(140)">
          <polygon points="0,-1.5 1,1.5 -1,1.5" fill="hsl(40, 96%, 61%)" opacity="0.8" />
        </g>
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
    </div>
  );
};

export default JamaicaMap;
