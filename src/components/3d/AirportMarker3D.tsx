import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface AirportMarker3DProps {
  name: string;
  city: string;
  flightCount: number;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

const AirportMarker3D = ({
  name,
  city,
  flightCount,
  isSelected,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: AirportMarker3DProps) => {
  const beaconRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (beaconRef.current) {
      const scale = isSelected ? 1.5 : isHovered ? 1.3 : 1;
      beaconRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      beaconRef.current.position.y = 0.3 + Math.sin(t * 2) * 0.05;
    }

    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.3 + Math.sin(t * 3) * 0.15;
      const ringScale = 1 + Math.sin(t * 1.5) * 0.2;
      ringRef.current.scale.set(ringScale, ringScale, 1);
    }
  });

  return (
    <group>
      {/* Clickable area */}
      <mesh
        position={[0, 0.2, 0]}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Pulse ring on ground */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.2, 0.28, 32]} />
        <meshStandardMaterial
          color="#f0c040"
          emissive="#f0c040"
          emissiveIntensity={1}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Beacon sphere */}
      <mesh ref={beaconRef} position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#f0c040"
          emissive="#f0c040"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Vertical line from ground to beacon */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.3, 8]} />
        <meshStandardMaterial color="#f0c040" transparent opacity={0.5} />
      </mesh>

      {/* HTML label */}
      <Html
        position={[0, 0.6, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`text-center transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}>
          <div className="font-display font-bold text-primary-foreground text-xs tracking-wider whitespace-nowrap bg-primary/80 backdrop-blur-sm px-2 py-0.5 rounded">
            {name}
          </div>
          <div className="text-[9px] text-primary-foreground/60 mt-0.5 whitespace-nowrap">
            {city} · {flightCount} flights
          </div>
        </div>
      </Html>
    </group>
  );
};

export default AirportMarker3D;
