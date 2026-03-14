import { useState, useEffect, useCallback, useRef } from "react";
import { mockFlights, type Flight } from "@/data/flights";
import { supabase } from "@/integrations/supabase/client";

export function useFlights(refreshIntervalMs = 60000) {
  const [flights, setFlights] = useState<Flight[]>(() => [...mockFlights]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevFlightsRef = useRef<Map<string, string>>(new Map());

  const fetchFlights = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-flights');

      if (fnError) throw new Error(fnError.message);
      if (!data?.flights?.length) throw new Error('No flight data returned');

      const newFlights: Flight[] = data.flights.map((f: any) => ({
        id: f.id,
        flightNumber: f.flightNumber,
        airline: f.airline,
        planeName: f.planeName,
        modelNumber: f.modelNumber,
        origin: f.origin,
        destination: f.destination,
        airport: f.airport as Flight['airport'],
        direction: f.direction as Flight['direction'],
        status: f.status as Flight['status'],
        scheduledTime: f.scheduledTime,
        gate: f.gate,
      }));

      // Track changes
      const changed = new Set<string>();
      const prevMap = prevFlightsRef.current;
      newFlights.forEach(f => {
        const prevStatus = prevMap.get(f.id);
        if (prevStatus && prevStatus !== f.status) {
          changed.add(f.id);
        }
      });

      // Update prev map
      const newMap = new Map<string, string>();
      newFlights.forEach(f => newMap.set(f.id, f.status));
      prevFlightsRef.current = newMap;

      setFlights(newFlights);
      setIsLive(true);
      setError(null);
      setLastUpdated(new Date());

      if (changed.size > 0) {
        setChangedIds(changed);
        setTimeout(() => setChangedIds(new Set()), 2500);
      }
    } catch (err: any) {
      console.error('Failed to fetch live flights:', err);
      setError(err.message);
      setIsLive(false);
      // Keep existing flights (mock or last successful fetch)
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    const id = setInterval(fetchFlights, refreshIntervalMs);
    return () => clearInterval(id);
  }, [fetchFlights, refreshIntervalMs]);

  return { flights, lastUpdated, changedIds, isLive, isLoading, error };
}
