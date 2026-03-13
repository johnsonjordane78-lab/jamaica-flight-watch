import { useState, useMemo } from "react";
import { Plane, ArrowDownLeft, ArrowUpRight, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { type Flight, airports } from "@/data/flights";
import { motion, AnimatePresence } from "framer-motion";

interface FlightLogProps {
  flights: Flight[];
  selectedAirport: string | null;
}

const statusConfig: Record<Flight['status'], { label: string; className: string }> = {
  'on-time': { label: 'On Time', className: 'bg-success/15 text-success border-success/30' },
  'arrived': { label: 'Arrived', className: 'bg-success/15 text-success border-success/30' },
  'departed': { label: 'Departed', className: 'bg-primary/10 text-primary border-primary/20' },
  'boarding': { label: 'Boarding', className: 'bg-accent/20 text-accent-foreground border-accent/40' },
  'delayed': { label: 'Delayed', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'cancelled': { label: 'Cancelled', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

const FlightLog = ({ flights, selectedAirport }: FlightLogProps) => {
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<'all' | 'inbound' | 'outbound'>('all');

  const filtered = useMemo(() => {
    return flights.filter((f) => {
      const matchesAirport = !selectedAirport || f.airport === selectedAirport;
      const matchesDirection = directionFilter === 'all' || f.direction === directionFilter;
      const matchesSearch = !search || 
        f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
        f.airline.toLowerCase().includes(search.toLowerCase()) ||
        f.planeName.toLowerCase().includes(search.toLowerCase()) ||
        f.modelNumber.toLowerCase().includes(search.toLowerCase());
      return matchesAirport && matchesDirection && matchesSearch;
    });
  }, [flights, selectedAirport, directionFilter, search]);

  const airportName = selectedAirport 
    ? airports.find(a => a.code === selectedAirport)?.shortName 
    : 'All Airports';

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-card-foreground">Flight Log</h2>
            <p className="text-sm text-muted-foreground">{airportName} · {filtered.length} flights</p>
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
            {(['all', 'inbound', 'outbound'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize ${
                  directionFilter === dir
                    ? 'bg-card text-card-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-card-foreground'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flights, airlines, aircraft..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-none"
          />
        </div>
      </div>

      {/* Flight list */}
      <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filtered.map((flight) => {
            const status = statusConfig[flight.status];
            return (
              <motion.div
                key={flight.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 p-1.5 rounded-md ${flight.direction === 'inbound' ? 'bg-success/10' : 'bg-accent/15'}`}>
                      {flight.direction === 'inbound' 
                        ? <ArrowDownLeft className="h-4 w-4 text-success" />
                        : <ArrowUpRight className="h-4 w-4 text-accent" />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-display font-semibold text-card-foreground">{flight.flightNumber}</span>
                        <span className="text-xs text-muted-foreground">{flight.airline}</span>
                      </div>
                      <p className="text-sm font-medium text-card-foreground truncate">{flight.planeName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Plane className="h-3 w-3" />
                        {flight.modelNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className={`${status.className} text-xs mb-1`}>
                      {status.label}
                    </Badge>
                    <p className="font-display text-sm font-semibold text-card-foreground">{flight.scheduledTime}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {flight.direction === 'inbound' ? `From ${flight.origin}` : `To ${flight.destination}`}
                    </p>
                    {flight.gate && (
                      <p className="text-xs text-muted-foreground">Gate {flight.gate}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Plane className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No flights found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightLog;
