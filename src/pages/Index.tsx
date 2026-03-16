import { useMemo } from "react";
import { useFlightStore } from "@/store/useFlightStore";
import Jamaica3DScene from "@/components/3d/Jamaica3DScene";
import JamaicaMap from "@/components/JamaicaMap";
import FlightLog from "@/components/FlightLog";
import { airports } from "@/data/flights";
import { useFlights } from "@/hooks/useFlights";
import { Plane, ArrowDownLeft, ArrowUpRight, Clock, Box, Map } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ATCRadio } from "@/components/ATCRadio";

const Index = () => {
  const { selectedAirport, setAirport, viewMode, setViewMode } = useFlightStore();
  const { flights, lastUpdated, changedIds, isLive, isLoading } = useFlights(60000);

  const flightCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    flights.forEach(f => {
      counts[f.airport] = (counts[f.airport] || 0) + 1;
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero - 3D Scene */}
      <section className="bg-primary pt-6 pb-10 px-4">
        <div className="container">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
                Jamaica Flight Tracker
              </h1>
              <p className="text-primary-foreground/60 text-sm">
                Real-time 3D monitoring across all major Jamaican airports
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

          {isLoading ? (
            <Skeleton className="w-full aspect-[2/1] rounded-lg" />
          ) : (
            <div className="relative w-full">
              {viewMode === '3d' ? (
                <Jamaica3DScene
                  flights={flights}
                  isLive={isLive}
                />
              ) : (
                <JamaicaMap
                   flights={flights}
                   flightCounts={flightCounts}
                />
              )}
              
              {/* ATC Radio Overlay */}
              <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
                <ATCRadio />
              </div>
            </div>
          )}
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

      {/* View Toggle & Airport filter chips */}
      <section className="container px-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-secondary p-1 rounded-full">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === '3d' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Box className="h-3.5 w-3.5" /> 3D View
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === '2d' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Map className="h-3.5 w-3.5" /> 2D Map (GeoJSON)
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAirport(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !selectedAirport ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              All Airports
            </button>
            {airports.map((airport) => (
              <button
                key={airport.code}
                onClick={() => setAirport(selectedAirport === airport.code ? null : airport.code)}
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
        </div>
      </section>

      {/* Flight Log */}
      <section className="container px-4 pb-12">
        <FlightLog flights={flights} changedIds={changedIds} />
      </section>
    </div>
  );
};

export default Index;
