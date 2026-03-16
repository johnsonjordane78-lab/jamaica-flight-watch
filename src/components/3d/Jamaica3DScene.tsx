import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Stars } from "@react-three/drei";
import { Suspense, useState, useCallback } from "react";
import IslandMesh from "./IslandMesh";
import RunwayMesh from "./RunwayMesh";
import AirportMarker3D from "./AirportMarker3D";
import { Flight3D } from "./Flight3D";
import { type Flight } from "@/data/flights";
import { useFlightStore } from "@/store/useFlightStore";

// Real-world coordinates converted to scene space
// Jamaica spans roughly 17.7°N–18.5°N, 78.4°W–76.2°W
// We center at ~18.1°N, 77.3°W and scale to fit a ~20 unit scene
const JAMAICA_CENTER = { lat: 18.15, lon: -77.35 };
const SCALE = 9; // units per degree

function latLonToScene(lat: number, lon: number): [number, number, number] {
  const x = (lon - JAMAICA_CENTER.lon) * SCALE;
  const z = -(lat - JAMAICA_CENTER.lat) * SCALE;
  return [x, 0.05, z];
}

// Airport data with real coordinates and runway specs
const AIRPORTS_3D = [
  {
    code: 'MKJS' as const,
    name: 'Sangster International',
    shortName: 'MBJ',
    city: 'Montego Bay',
    lat: 18.5036,
    lon: -77.9133,
    runway: { heading: 70, length: 2716, width: 46, label: '07/25' },
  },
  {
    code: 'MKJP' as const,
    name: 'Norman Manley International',
    shortName: 'KIN',
    city: 'Kingston',
    lat: 17.9356,
    lon: -76.7875,
    runway: { heading: 113, length: 2716, width: 46, label: '12/30' },
  },
  {
    code: 'MKJF' as const,
    name: 'Ian Fleming International',
    shortName: 'OCJ',
    city: 'Ocho Rios',
    lat: 18.4044,
    lon: -76.9689,
    runway: { heading: 100, length: 1524, width: 30, label: '10/28' },
  },
];

interface Jamaica3DSceneProps {
  flights: Flight[];
  isLive: boolean;
}

const Jamaica3DScene = ({ flights, isLive }: Jamaica3DSceneProps) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const { selectedAirport, setAirport } = useFlightStore();

  const handleAirportClick = useCallback((code: string) => {
    setAirport(selectedAirport === code ? null : code);
  }, [selectedAirport, setAirport]);

  return (
    <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-[hsl(210,70%,8%)]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 12, 14]} fov={45} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={0.2}
          target={[0, 0, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 15, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 8, -5]} intensity={0.4} color="#4da6ff" />

        {/* Sky */}
        <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
        <fog attach="fog" args={['#0a1628', 20, 50]} />

        <Suspense fallback={null}>
          {/* Ocean plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[60, 40]} />
            <meshStandardMaterial color="#0d2847" transparent opacity={0.9} />
          </mesh>

          {/* Jamaica island */}
          <IslandMesh />

          {/* Airport markers and runways */}
          {AIRPORTS_3D.map((airport) => {
            const pos = latLonToScene(airport.lat, airport.lon);
            const flightCount = flights.filter(f => f.airport === airport.code).length;
            const isSelected = selectedAirport === airport.code;
            const isHovered = hovered === airport.code;

            return (
              <group key={airport.code} position={pos}>
                {/* Runway */}
                <RunwayMesh
                  heading={airport.runway.heading}
                  lengthM={airport.runway.length}
                  widthM={airport.runway.width}
                  label={airport.runway.label}
                  isSelected={isSelected}
                />

                {/* Clickable marker */}
                <AirportMarker3D
                  name={airport.shortName}
                  city={airport.city}
                  flightCount={flightCount}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  onClick={() => handleAirportClick(airport.code)}
                  onPointerOver={() => setHovered(airport.code)}
                  onPointerOut={() => setHovered(null)}
                />
              </group>
            );
          })}

          {/* Render Active Flights */}
          {flights.map(flight => (
             <Flight3D 
                key={flight.id} 
                flight={flight} 
                // We'd ideally highlight the flight if it was selected in global state
                isSelected={false} 
             />
          ))}
        </Suspense>
      </Canvas>

      {/* Title overlay */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <div className="flex items-center gap-2 bg-primary/70 backdrop-blur-sm px-3 py-2 rounded-lg">
          <span className="font-display text-sm font-bold text-primary-foreground tracking-wider">
            JAMAICA AIRSPACE
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-[10px] font-semibold text-success">LIVE</span>
            </span>
          )}
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-3 right-3 pointer-events-none">
        <div className="bg-primary/50 backdrop-blur-sm px-2.5 py-1.5 rounded text-[10px] text-primary-foreground/50 font-body">
          Drag to rotate · Scroll to zoom · Click airport to select
        </div>
      </div>
    </div>
  );
};

export default Jamaica3DScene;
