import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { Airport3D } from "./Airport3D";
import { createJamaicaDEMTexture } from "@/utils/generateHeightmap";

// Same projection logic used historically
const SCALE = 9;
const CENTER = { lat: 18.15, lon: -77.35 };

function toScene(lon: number, lat: number): [number, number] {
  return [
    (lon - CENTER.lon) * SCALE,
    -(lat - CENTER.lat) * SCALE,
  ];
}

interface GeoFeature {
  type: string;
  geometry: { type: string; coordinates: [number, number][] };
}

const IslandMesh = () => {
  const [coastlineGeometry, setCoastlineGeometry] = useState<THREE.BufferGeometry | null>(null);
  
  // Memoize the procedural DEM texture so it's not regenerated on every render
  const demTexture = useMemo(() => createJamaicaDEMTexture(256, 128), []);

  useEffect(() => {
    fetch("/jamaica-coastline.geojson")
      .then((res) => res.json())
      .then((data) => {
        const features: GeoFeature[] = data.features || [];
        
        // Since OSM geometry is highly fragmented strings that fail Three.js triangulation
        // (ExtrudeGeometry requires mathematically perfect closed polygons), 
        // we will render the raw GeoJSON segments directly as a high-density Line curve.
        
        const vertices: number[] = [];
        
        features.forEach((feature) => {
          const coords = feature.geometry.coordinates;
          // Add line segments. To build a Three.js Line, we can just push the connected points.
          for (let i = 0; i < coords.length; i++) {
             const [x, z] = toScene(coords[i][0], coords[i][1]);
             vertices.push(x, 0, z); // y is 0 (flat ocean level)
          }
           // Insert a NaN gap between distinct LineStrings to prevent Three.js from 
           // drawing a line connecting the end of one segment to the start of another far away
           vertices.push(NaN, NaN, NaN);
        });

        const geo = new THREE.BufferGeometry();
        // Float32Array doesn't like NaN for defining separate lines easily in a single Line loop,
        // so we'll use a LineSegments approach. We pair each point with its next point.
        
        const segmentVertices: number[] = [];
        features.forEach((feature) => {
          const coords = feature.geometry.coordinates;
          for (let i = 0; i < coords.length - 1; i++) {
             const [x1, z1] = toScene(coords[i][0], coords[i][1]);
             const [x2, z2] = toScene(coords[i + 1][0], coords[i + 1][1]);
             segmentVertices.push(x1, 0, z1);
             segmentVertices.push(x2, 0, z2);
          }
        });

        geo.setAttribute('position', new THREE.Float32BufferAttribute(segmentVertices, 3));
        setCoastlineGeometry(geo);
      })
      .catch((err) => console.error("Failed to load GeoJSON for 3D:", err));
  }, []);

  return (
    <group>
      {/* High-detail Coastlines (Rendered as glowing Lines) */}
      {coastlineGeometry && (
        <lineSegments geometry={coastlineGeometry}>
          <lineBasicMaterial color="#4da6ff" linewidth={2} transparent opacity={0.6} />
        </lineSegments>
      )}

      {/* Detailed Island Plane w/ Displacement Map */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
         <planeGeometry args={[25, 10, 200, 80]} />
         <meshStandardMaterial 
            color="#05101a" 
            transparent 
            opacity={0.8}
            displacementMap={demTexture}
            displacementScale={1.5}
            roughness={0.9}
         />
      </mesh>

      {/* 3D Airports parsed from OpenStreetMap */}
      <Airport3D iataCode="MBJ" fileName="/mbj_osm.json" />
      <Airport3D iataCode="KIN" fileName="/kin_osm.json" />
      <Airport3D iataCode="OCJ" fileName="/ocj_osm.json" />
    </group>
  );
};

export default IslandMesh;
