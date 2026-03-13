import { useState, useEffect, useCallback, useRef } from "react";
import { mockFlights, type Flight } from "@/data/flights";

const STATUS_PROGRESSION: Record<Flight['status'], Flight['status'][]> = {
  'on-time': ['boarding', 'delayed'],
  'boarding': ['departed'],
  'departed': ['arrived'],
  'arrived': ['arrived'],
  'delayed': ['boarding', 'cancelled'],
  'cancelled': ['cancelled'],
};

const GATES = ['A1', 'A3', 'A5', 'A7', 'B1', 'B2', 'B4', 'C1', 'C2', 'C5', 'C8', '1', '2'];

function shiftTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const nm = ((total % 1440) + 1440) % 1440 % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export function useFlightSimulation(intervalMs = 20000) {
  const [flights, setFlights] = useState<Flight[]>(() => [...mockFlights]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const tick = useCallback(() => {
    setFlights(prev => {
      const changed = new Set<string>();
      const next = prev.map(f => {
        if (Math.random() > 0.3) return f; // ~30% chance per tick
        const options = STATUS_PROGRESSION[f.status];
        if (!options || options.length === 0 || (options.length === 1 && options[0] === f.status)) return f;
        const newStatus = options[Math.floor(Math.random() * options.length)];
        if (newStatus === f.status) return f;
        changed.add(f.id);
        return {
          ...f,
          status: newStatus,
          scheduledTime: newStatus === 'delayed' ? shiftTime(f.scheduledTime, Math.floor(Math.random() * 30) + 10) : f.scheduledTime,
          gate: newStatus === 'boarding' ? GATES[Math.floor(Math.random() * GATES.length)] : f.gate,
        };
      });
      if (changed.size > 0) {
        setChangedIds(changed);
        setLastUpdated(new Date());
        // Clear highlights after 2.5s
        setTimeout(() => setChangedIds(new Set()), 2500);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs]);

  return { flights, lastUpdated, changedIds, isLive: true };
}
