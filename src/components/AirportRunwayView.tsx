import { motion } from "framer-motion";
import { ArrowLeft, Plane } from "lucide-react";
import { type Flight } from "@/data/flights";

interface AirportRunwayViewProps {
  airportCode: string;
  flights: Flight[];
  onBack: () => void;
}

const runwayConfigs: Record<string, { label: string; heading: string; length: string; terminals: { x: number; y: number; w: number; h: number; label: string }[]; runway: { x1: number; y1: number; x2: number; y2: number }; taxiways?: { d: string }[] }> = {
  MKJS: {
    label: 'Sangster Intl',
    heading: '07/25',
    length: '8,910 ft',
    terminals: [
      { x: 25, y: 58, w: 50, h: 12, label: 'Main Terminal' },
    ],
    runway: { x1: 8, y1: 42, x2: 92, y2: 42 },
    taxiways: [
      { d: 'M30,42 L30,55' },
      { d: 'M55,42 L55,55' },
      { d: 'M75,42 L75,55' },
    ],
  },
  MKJF: {
    label: 'Ian Fleming Intl',
    heading: '10/28',
    length: '5,300 ft',
    terminals: [
      { x: 35, y: 58, w: 30, h: 10, label: 'Terminal' },
    ],
    runway: { x1: 15, y1: 42, x2: 85, y2: 42 },
    taxiways: [
      { d: 'M50,42 L50,55' },
    ],
  },
  MKJP: {
    label: 'Norman Manley Intl',
    heading: '12/30',
    length: '8,911 ft',
    terminals: [
      { x: 20, y: 55, w: 25, h: 12, label: 'Terminal 1' },
      { x: 52, y: 55, w: 25, h: 12, label: 'Terminal 2' },
    ],
    runway: { x1: 5, y1: 40, x2: 95, y2: 40 },
    taxiways: [
      { d: 'M25,40 L25,52' },
      { d: 'M50,40 L50,52' },
      { d: 'M75,40 L75,52' },
    ],
  },
};

const AirportRunwayView = ({ airportCode, flights, onBack }: AirportRunwayViewProps) => {
  const config = runwayConfigs[airportCode];
  if (!config) return null;

  const airportFlights = flights.filter(f => f.airport === airportCode);
  const parkedFlights = airportFlights.filter(f => ['boarding', 'on-time', 'arrived', 'delayed'].includes(f.status));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="relative w-full aspect-[2/1] bg-primary rounded-lg overflow-hidden"
    >
      <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Ground */}
        <rect width="100" height="80" fill="hsl(152, 30%, 22%)" />

        {/* Runway */}
        <line
          x1={config.runway.x1} y1={config.runway.y1}
          x2={config.runway.x2} y2={config.runway.y2}
          stroke="hsl(0, 0%, 30%)" strokeWidth="5"
        />
        {/* Runway center line */}
        <line
          x1={config.runway.x1 + 2} y1={config.runway.y1}
          x2={config.runway.x2 - 2} y2={config.runway.y2}
          stroke="hsl(0, 0%, 95%)" strokeWidth="0.3" strokeDasharray="3,2"
        />
        {/* Runway edge markings */}
        <line
          x1={config.runway.x1} y1={config.runway.y1 - 2.2}
          x2={config.runway.x2} y2={config.runway.y2 - 2.2}
          stroke="hsl(0, 0%, 95%)" strokeWidth="0.2"
        />
        <line
          x1={config.runway.x1} y1={config.runway.y1 + 2.2}
          x2={config.runway.x2} y2={config.runway.y2 + 2.2}
          stroke="hsl(0, 0%, 95%)" strokeWidth="0.2"
        />
        {/* Threshold markings */}
        {[config.runway.x1 + 3, config.runway.x2 - 3].map((tx, i) => (
          <g key={i}>
            {[-1.5, -0.5, 0.5, 1.5].map((offset, j) => (
              <line key={j} x1={tx} y1={config.runway.y1 + offset} x2={tx + 2} y2={config.runway.y2 + offset} stroke="hsl(0, 0%, 95%)" strokeWidth="0.3" />
            ))}
          </g>
        ))}
        {/* Heading labels */}
        <text x={config.runway.x1 + 1} y={config.runway.y1 - 4} fill="hsl(0, 0%, 80%)" fontSize="2.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="600">
          {config.heading.split('/')[0]}
        </text>
        <text x={config.runway.x2 - 5} y={config.runway.y2 - 4} fill="hsl(0, 0%, 80%)" fontSize="2.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="600" textAnchor="end">
          {config.heading.split('/')[1]}
        </text>

        {/* Taxiways */}
        {config.taxiways?.map((tw, i) => (
          <path key={i} d={tw.d} fill="none" stroke="hsl(0, 0%, 35%)" strokeWidth="2" />
        ))}

        {/* Terminals */}
        {config.terminals.map((term, i) => (
          <g key={i}>
            <rect x={term.x} y={term.y} width={term.w} height={term.h} rx="1" fill="hsl(210, 30%, 25%)" stroke="hsl(210, 40%, 40%)" strokeWidth="0.3" />
            <text x={term.x + term.w / 2} y={term.y + term.h / 2 + 1} textAnchor="middle" fill="hsl(0, 0%, 80%)" fontSize="2.2" fontFamily="'Space Grotesk', sans-serif">
              {term.label}
            </text>
          </g>
        ))}

        {/* Parked planes at gates */}
        {parkedFlights.slice(0, 6).map((flight, i) => {
          const term = config.terminals[i % config.terminals.length];
          const px = term.x + 5 + (i * 8) % term.w;
          const py = term.y - 3;
          return (
            <g key={flight.id}>
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <polygon
                  points={`${px},-2 ${px + 1},1 ${px - 1},1`}
                  transform={`translate(0, ${py})`}
                  fill={flight.status === 'boarding' ? 'hsl(40, 96%, 61%)' : 'hsl(0, 0%, 75%)'}
                />
                <text x={px} y={py - 3} textAnchor="middle" fill="hsl(0, 0%, 90%)" fontSize="1.6" fontFamily="'Inter', sans-serif">
                  {flight.flightNumber}
                </text>
              </motion.g>
            </g>
          );
        })}

        {/* Plane on runway (departed/arriving) */}
        {airportFlights.filter(f => f.status === 'departed').slice(0, 1).map(f => (
          <motion.g
            key={f.id}
            initial={{ x: config.runway.x1 + 10 }}
            animate={{ x: config.runway.x2 - 5 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
          >
            <polygon
              points="0,-2 1.5,2 -1.5,2"
              transform={`translate(0, ${config.runway.y1}) rotate(-90)`}
              fill="hsl(40, 96%, 61%)"
            />
          </motion.g>
        ))}
      </svg>

      {/* Header */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors bg-primary/60 backdrop-blur-sm px-2.5 py-1.5 rounded-md">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Map
        </button>
        <div className="text-right bg-primary/60 backdrop-blur-sm px-2.5 py-1.5 rounded-md">
          <p className="font-display text-sm font-semibold text-primary-foreground">{config.label}</p>
          <p className="text-xs text-primary-foreground/60">Runway {config.heading} · {config.length}</p>
        </div>
      </div>

      {/* Flight count */}
      <div className="absolute bottom-3 left-3 bg-primary/60 backdrop-blur-sm px-2.5 py-1.5 rounded-md">
        <div className="flex items-center gap-1.5 text-xs text-primary-foreground/70">
          <Plane className="h-3 w-3" />
          <span>{airportFlights.length} flights</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AirportRunwayView;
