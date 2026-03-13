import { useState, useMemo } from "react";
import JamaicaMap from "@/components/JamaicaMap";
import FlightLog from "@/components/FlightLog";
import { mockFlights, airports } from "@/data/flights";
import { Plane, ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";

const Index = () => {
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);

  const flightCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    airports.forEach(a => {
      counts[a.code] = mockFlights.filter(f => f.airport === a.code).length;
    });
    return counts;
  }, []);

  const stats = useMemo(() => {
    const relevant = selectedAirport
      ? mockFlights.filter(f => f.airport === selectedAirport)
      : mockFlights;
    return {
      total: relevant.length,
      inbound: relevant.filter(f => f.direction === 'inbound').length,
      outbound: relevant.filter(f => f.direction === 'outbound').length,
      onTime: relevant.filter(f => f.status === 'on-time' || f.status === 'arrived').length,
    };
  }, [selectedAirport]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary pt-8 pb-12 px-4">
        <div className="container">
          <div className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
              Jamaica Flight Tracker
            </h1>
            <p className="text-primary-foreground/60 text-sm">
              Real-time monitoring across all major Jamaican airports
            </p>
          </div>
          <JamaicaMap
            selectedAirport={selectedAirport}
            onSelectAirport={setSelectedAirport}
            flightCounts={flightCounts}
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
        <FlightLog flights={mockFlights} selectedAirport={selectedAirport} />
      </section>
    </div>
  );
};

export default Index;
