import { create } from 'zustand';

interface FlightState {
  selectedAirport: string | null;
  selectedFlightId: string | null;
  viewMode: '3d' | '2d';
  setAirport: (airportId: string | null) => void;
  setFlight: (flightId: string | null) => void;
  setViewMode: (mode: '3d' | '2d') => void;
}

export const useFlightStore = create<FlightState>((set) => ({
  selectedAirport: null,
  selectedFlightId: null,
  viewMode: '3d',
  setAirport: (airportId) => set({ selectedAirport: airportId }),
  setFlight: (flightId) => set({ selectedFlightId: flightId }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
