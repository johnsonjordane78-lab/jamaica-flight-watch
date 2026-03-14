import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RunwayMeshProps {
  heading: number; // degrees magnetic
  lengthM: number; // meters
  widthM: number;  // meters
  label: string;   // e.g. "07/25"
  isSelected: boolean;
}

// Scale: 1 scene unit ≈ 1000m (since 9 units/degree and 1°lat ≈ 111km → 1 unit ≈ 12.3km)
// For runways to be visible, we scale them up relative to the island
const RUNWAY_SCALE = 0.0008; // meters to scene units (slightly exaggerated for visibility)

const RunwayMesh = ({ heading, lengthM, widthM, label, isSelected }: RunwayMeshProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const rwyLength = lengthM * RUNWAY_SCALE;
  const rwyWidth = widthM * RUNWAY_SCALE * 2; // slightly exaggerated width for visibility
  const rotationY = -((heading - 90) * Math.PI) / 180; // convert heading to Three.js rotation

  // Animate selection glow
  useFrame((_, delta) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      const targetOpacity = isSelected ? 0.4 : 0.1;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 3);
    }
  });

  const centerlineDashes = useMemo(() => {
    const dashes: JSX.Element[] = [];
    const dashLength = rwyLength * 0.04;
    const gapLength = rwyLength * 0.03;
    const totalStep = dashLength + gapLength;
    const count = Math.floor(rwyLength * 0.7 / totalStep);
    const startOffset = -rwyLength * 0.35;

    for (let i = 0; i < count; i++) {
      const z = startOffset + i * totalStep + dashLength / 2;
      dashes.push(
        <mesh key={`cl-${i}`} position={[0, 0.002, z]}>
          <boxGeometry args={[rwyWidth * 0.05, 0.001, dashLength]} />
          <meshStandardMaterial color="white" />
        </mesh>
      );
    }
    return dashes;
  }, [rwyLength, rwyWidth]);

  const thresholdBars = useMemo(() => {
    const bars: JSX.Element[] = [];
    const barCount = 6;
    const barWidth = rwyWidth * 0.08;
    const barLength = rwyWidth * 0.6;
    const spacing = barWidth * 1.8;
    const startX = -((barCount - 1) * spacing) / 2;

    // Both ends
    for (const end of [-1, 1]) {
      const zPos = end * (rwyLength / 2 - rwyLength * 0.05);
      for (let i = 0; i < barCount; i++) {
        bars.push(
          <mesh key={`tb-${end}-${i}`} position={[startX + i * spacing, 0.002, zPos]}>
            <boxGeometry args={[barWidth, 0.001, barLength * 0.15]} />
            <meshStandardMaterial color="white" />
          </mesh>
        );
      }
    }
    return bars;
  }, [rwyLength, rwyWidth]);

  return (
    <group ref={groupRef} rotation={[0, rotationY, 0]}>
      {/* Runway selection glow */}
      <mesh ref={glowRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[rwyWidth * 4, rwyLength * 1.3]} />
        <meshStandardMaterial
          color="#f0c040"
          transparent
          opacity={0.1}
          emissive="#f0c040"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Runway surface */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[rwyWidth, rwyLength]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>

      {/* Edge lines */}
      {[-1, 1].map((side) => (
        <mesh key={`edge-${side}`} position={[side * rwyWidth / 2, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[rwyWidth * 0.03, rwyLength]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}

      {/* Centerline dashes */}
      {centerlineDashes}

      {/* Threshold bars */}
      {thresholdBars}

      {/* Runway end lights */}
      {[-1, 1].map((end) => (
        <group key={`lights-${end}`}>
          {[-2, -1, 0, 1, 2].map((i) => (
            <mesh key={`light-${end}-${i}`} position={[i * rwyWidth * 0.2, 0.03, end * rwyLength / 2]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshStandardMaterial
                color={end === -1 ? "#00ff00" : "#ff0000"}
                emissive={end === -1 ? "#00ff00" : "#ff0000"}
                emissiveIntensity={2}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

export default RunwayMesh;
