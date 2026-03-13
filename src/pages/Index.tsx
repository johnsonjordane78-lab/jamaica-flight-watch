import { useState, useMemo } from "react";
import JamaicaMap from "@/components/JamaicaMap";
import FlightLog from "@/components/FlightLog";
import { airports } from "@/data/flights";
import { useFlightSimulation } from "@/hooks/useFlightSimulation";
import { Plane, ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";

const Index = () => {
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const { flights, lastUpdated, changedIds, isLive } = useFlightSimulation(20000);

  const flightCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    airports.forEach(a => {
      counts[a.code] = flights.filter(f => f.airport === a.code).length;
    });
    return counts;
  }, [flights]);

  const stats = useMemo(() => {
    const relevant = selectedAirport
      ? flights.filter(f => f.airport === selectedAirport)
      : flights;
    return {
      total: relevant.length,
      inbound: relevant.filter(f => f.direction === 'inbound').length,
      outbound: relevant.filter(f => f.direction === 'outbound').length,
      onTime: relevant.filter(f => f.status === 'on-time' || f.status === 'arrived').length,
    };
  }, [selectedAirport, flights]);

  const secondsAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary pt-8 pb-12 px-4">
        <div className="container">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
                Jamaica Flight Tracker
              </h1>
              <p className="text-primary-foreground/60 text-sm">
                Real-time monitoring across all major Jamaican airports
              </p>
            </div>
            {isLive && (
              <div className="flex items-center gap-2 bg-success/15 border border-success/30 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                </span>
                <span className="text-xs font-medium text-success">LIVE</span>
              </div>
            )}
          </div>
          <JamaicaMap
            selectedAirport={selectedAirport}
            onSelectAirport={setSelectedAirport}
            flightCounts={flightCounts}
            flights={flights}
          />
        </div>
      </section>

      {/* Stats */}
      <section className="container -mt-6 mb-6 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Flights', value: stats.total, icon: Plane, color: 'text-primary' },
            { label: 'Inbound', value: stats.inbound, icon: ArrowDownLeft, color: 'text-success' },
            { label: 'Outbound', value: stats.outbound, icon: ArrowUpRight, color: 'text-accent' },
            { label: 'On Time', value: stats.onTime, icon: Clock, color: 'text-success' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-display text-2xl font-bold text-card-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Airport filter chips */}
      <section className="container px-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedAirport(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedAirport ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All Airports
          </button>
          {airports.map((airport) => (
            <button
              key={airport.code}
              onClick={() => setSelectedAirport(selectedAirport === airport.code ? null : airport.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedAirport === airport.code
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {airport.shortName}
            </button>
          ))}
        </div>
      </section>

      {/* Flight Log */}
      <section className="container px-4 pb-12">
        <FlightLog flights={flights} selectedAirport={selectedAirport} changedIds={changedIds} />
      </section>
    </div>
  );
};

export default Index;
