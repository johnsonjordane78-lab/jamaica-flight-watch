import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { type Flight } from "@/data/flights";

// We need a helper for airport coordinates
const JAMAICA_CENTER = { lat: 18.15, lon: -77.35 };
const SCALE = 9;

function latLonToScene(lat: number, lon: number): [number, number, number] {
  const x = (lon - JAMAICA_CENTER.lon) * SCALE;
  const z = -(lat - JAMAICA_CENTER.lat) * SCALE;
  return [x, 0.05, z];
}

// Map of Jamaican airport coords
const JA_AIRPORTS = {
  'MKJS': { lat: 18.5036, lon: -77.9133 },
  'MKJP': { lat: 17.9356, lon: -76.7875 },
  'MKJF': { lat: 18.4044, lon: -76.9689 },
};

// Generic coordinate map for foreign cities to fake the arc endpoints outside Jamaica
const getForeignCoord = (cityStr: string) => {
  const str = cityStr.toLowerCase();
  if (str.includes('miami') || str.includes('fll') || str.includes('orlando')) return { lat: 25.8, lon: -80.2 };
  if (str.includes('new york') || str.includes('jfk') || str.includes('ewr')) return { lat: 40.6, lon: -73.8 };
  if (str.includes('toronto') || str.includes('montreal') || str.includes('yyz')) return { lat: 43.6, lon: -79.6 };
  if (str.includes('london') || str.includes('lgw')) return { lat: 51.5, lon: -0.1 };
  if (str.includes('houston') || str.includes('iah') || str.includes('panama')) return { lat: 29.9, lon: -95.3 };
  if (str.includes('nassau')) return { lat: 25.0, lon: -77.4 };
  // Default to somewhere north
  return { lat: 25.0, lon: -77.0 };
};

interface Flight3DProps {
  flight: Flight;
  isSelected?: boolean;
  onClick?: () => void;
}

export const Flight3D = ({ flight, isSelected, onClick }: Flight3DProps) => {
  const planeRef = useRef<THREE.Group>(null);
  
  // Calculate arc and movement path
  const pathData = useMemo(() => {
    const jaCoord = JA_AIRPORTS[flight.airport];
    if (!jaCoord) return null;
    
    // Determine the foreign coordinate based on origin or destination
    const foreignCity = flight.direction === 'inbound' ? flight.origin : flight.destination;
    const foreignCoord = getForeignCoord(foreignCity);
    
    // Convert to scene coords
    // Scale down the foreign coord so it's not lightyears away, just off the island
    const dx = foreignCoord.lon - jaCoord.lon;
    const dz = foreignCoord.lat - jaCoord.lat;
    
    // Normalize and place arbitrary distance for visual purposes
    const dist = Math.sqrt(dx*dx + dz*dz);
    let fLon = jaCoord.lon + (dx/dist) * 1.5;
    let fLat = jaCoord.lat + (dz/dist) * 1.5;
    
    const startPos = flight.direction === 'outbound' ? latLonToScene(jaCoord.lat, jaCoord.lon) : latLonToScene(fLat, fLon);
    const endPos = flight.direction === 'outbound' ? latLonToScene(fLat, fLon) : latLonToScene(jaCoord.lat, jaCoord.lon);
    
    // Adjust height
    startPos[1] = flight.direction === 'outbound' ? 0.05 : 3.0; // Inbound starts high
    endPos[1] = flight.direction === 'outbound' ? 3.0 : 0.05;   // Outbound ends high
    
    const p0 = new THREE.Vector3(...startPos);
    const p2 = new THREE.Vector3(...endPos);
    const p1 = new THREE.Vector3(
      (p0.x + p2.x) / 2,
      Math.max(p0.y, p2.y) + 1.5, // Arc height
      (p0.z + p2.z) / 2
    );
    
    const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Base speed on distance or arbitrary value
    const duration = 20; // 20 seconds to complete full arc (for demo purposes)
    
    return { curve, geometry, duration };
  }, [flight]);

  // Animate plane along arc
  useFrame(({ clock }) => {
    if (!pathData || !planeRef.current) return;
    
    // For a real app, interpolation would be based on scheduledTime vs Date.now().
    // For visual simulation, we just loop along the arc.
    let t = (clock.elapsedTime % pathData.duration) / pathData.duration;
    
    // If status is "arrived" or "departed", fix it at the end
    if (flight.status === 'arrived' || flight.status === 'cancelled') t = 1;
    else if (flight.status === 'boarding') t = 0;
    
    const position = pathData.curve.getPointAt(t);
    planeRef.current.position.copy(position);
    
    // Orient plane to direction of travel
    if (t < 0.99) {
      const target = pathData.curve.getPointAt(Math.min(t + 0.01, 1));
      planeRef.current.lookAt(target);
    }
  });

  if (!pathData) return null;

  return (
    <group>
      {/* Flight Path Arc */}
      <primitive 
        object={new THREE.Line(
          pathData.geometry, 
          new THREE.LineBasicMaterial({
            color: flight.direction === 'inbound' ? "#4ade80" : "#3b82f6",
            transparent: true,
            opacity: isSelected ? 0.8 : 0.3
          })
        )} 
      />

      {/* Plane */}
      <group ref={planeRef} onClick={onClick}>
        <mesh>
          {/* Simple low-poly airplane shape */}
          <coneGeometry args={[0.08, 0.3, 4]} />
          <meshStandardMaterial 
            color={isSelected ? "#facc15" : (flight.direction === 'inbound' ? "#4ade80" : "#3b82f6")} 
            roughness={0.4} 
            metalness={0.8}
            emissive={isSelected ? "#facc15" : "#000000"}
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Wings */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.05, 0]}>
          <boxGeometry args={[0.04, 0.4, 0.08]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>
        
        {/* Label (only when selected or hovered, realistically would use Html from drei) */}
      </group>
    </group>
  );
};
