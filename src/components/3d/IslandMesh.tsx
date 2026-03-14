import { useMemo } from "react";
import * as THREE from "three";

// Simplified Jamaica outline as lat/lon points, converted to local scene coords
// Jamaica center: 18.15°N, 77.35°W, scale: 9 units/degree
const SCALE = 9;
const CENTER = { lat: 18.15, lon: -77.35 };

// Jamaica coastline outline (simplified polygon)
const JAMAICA_OUTLINE: [number, number][] = [
  // West coast (Negril area)
  [-78.37, 18.20], [-78.34, 18.25], [-78.30, 18.30], [-78.22, 18.35],
  // North coast (Montego Bay → Ocho Rios → Port Antonio)
  [-78.00, 18.45], [-77.90, 18.50], [-77.80, 18.47], [-77.60, 18.47],
  [-77.40, 18.47], [-77.20, 18.45], [-77.00, 18.45], [-76.80, 18.40],
  [-76.60, 18.38], [-76.40, 18.35], [-76.20, 18.28], [-76.18, 18.22],
  // East coast (Morant Point)
  [-76.18, 18.15], [-76.20, 18.05], [-76.25, 17.95],
  // South coast (Kingston → Black River)
  [-76.40, 17.85], [-76.60, 17.82], [-76.80, 17.85], [-76.90, 17.88],
  [-77.00, 17.85], [-77.10, 17.83], [-77.30, 17.80], [-77.50, 17.82],
  [-77.70, 17.85], [-77.85, 17.90], [-78.00, 17.95], [-78.10, 18.00],
  [-78.20, 18.05], [-78.30, 18.10], [-78.35, 18.15],
  // Close
  [-78.37, 18.20],
];

function toScene(lon: number, lat: number): [number, number] {
  return [
    (lon - CENTER.lon) * SCALE,
    -(lat - CENTER.lat) * SCALE,
  ];
}

const IslandMesh = () => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = JAMAICA_OUTLINE.map(([lon, lat]) => toScene(lon, lat));

    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i][0], points[i][1]);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.03,
      bevelSegments: 3,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <group>
      {/* Main island body */}
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#1a5c3a"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Mountain ridge highlight */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.16, 0]}
      >
        <mesh>
          {/* Blue Mountains area - elevated bump */}
          <sphereGeometry args={[0.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#2d7a4f" roughness={0.9} transparent opacity={0.7} />
        </mesh>
      </mesh>
      {/* Blue Mountains peak */}
      <mesh position={[((-76.58) - CENTER.lon) * SCALE, 0.35, -(18.18 - CENTER.lat) * SCALE]}>
        <coneGeometry args={[0.6, 0.4, 8]} />
        <meshStandardMaterial color="#2d7a4f" roughness={0.85} />
      </mesh>
      {/* Central highlands */}
      <mesh position={[((-77.5) - CENTER.lon) * SCALE, 0.25, -(18.2 - CENTER.lat) * SCALE]}>
        <coneGeometry args={[1.2, 0.3, 8]} />
        <meshStandardMaterial color="#246b3e" roughness={0.85} />
      </mesh>
    </group>
  );
};

export default IslandMesh;
