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
        id: f.id || String(Math.random()),
        flightNumber: f.flightNumber || 'Unknown',
        airline: f.airline || 'Unknown Airline',
        planeName: f.planeName || 'Commercial Flight',
        modelNumber: f.modelNumber || 'Unknown Aircraft',
        origin: f.origin || 'Unknown',
        destination: f.destination || 'Unknown',
        airport: f.airport as Flight['airport'],
        direction: f.direction as Flight['direction'],
        status: f.status as Flight['status'] || 'on-time',
        scheduledTime: f.scheduledTime || '--:--',
        gate: f.gate || undefined,
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
      console.warn('Failed to fetch live flights, falling back to mock data:', err);
      // Fallback to mock data so the UI doesn't break
      setFlights([...mockFlights]);
      // We still set error, but the app continues working with mock data
      setError(err.message);
      setIsLive(false);
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
