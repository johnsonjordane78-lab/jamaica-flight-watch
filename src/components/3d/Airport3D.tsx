import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

// Uses the same projection logic as the IslandMesh
const SCALE = 9;
const CENTER = { lat: 18.15, lon: -77.35 };

function toScene(lon: number, lat: number): [number, number] {
  return [
    (lon - CENTER.lon) * SCALE,
    -(lat - CENTER.lat) * SCALE,
  ];
}

interface OSMNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
}

interface OSMWay {
  type: 'way';
  id: number;
  nodes: number[];
  geometry: { lat: number, lon: number }[];
  tags?: { [key: string]: string };
}

interface OSMData {
  elements: (OSMNode | OSMWay)[];
}

interface AirportProps {
  iataCode: 'MBJ' | 'KIN' | 'OCJ';
  fileName: string; // e.g., '/mbj_osm.json'
  positionOffset?: [number, number, number]; // Minor tweaks if OSM data doesn't align perfectly with IslandMesh
}

const parseOSMGeometry = (data: OSMData) => {
  const nodes = new Map<number, {lat: number, lon: number}>();
  
  // First pass: store all node coordinates and ways
  data.elements.forEach((el) => {
    if (el.type === 'node') {
      nodes.set(el.id, { lat: el.lat, lon: el.lon });
    }
  });

  const ways = data.elements.filter((el): el is OSMWay => el.type === 'way');

  const parsedFeatures: { 
    type: 'terminal' | 'runway' | 'taxiway' | 'apron', 
    shape: THREE.Shape, 
    height: number 
  }[] = [];

  ways.forEach(way => {
    if (!way.tags) return;

    // Overpass sometimes uses 'aeroway' or 'building' depending on the polygon
    const isBuilding = way.tags.building === 'terminal' || way.tags.building === 'yes';
    const aerowayType = way.tags.aeroway;
    
    // We only care about specific aeroway strings or terminal buildings
    if (!aerowayType && !isBuilding) return;

    let type: 'terminal' | 'runway' | 'taxiway' | 'apron' = 'apron';
    let height = 0.01; // Ground level by default

    // Terminals are either explicitly marked as building=terminal, or are generic buildings on the aeroway layer
    if (isBuilding || aerowayType === 'terminal') {
      type = 'terminal';
      height = 0.1; // Extrude height for buildings
    } else if (aerowayType === 'runway') {
      type = 'runway';
    } else if (aerowayType === 'taxiway') {
      type = 'taxiway';
    } // Otherwise it falls back to 'apron' default

    // Convert node IDs to Vector2 using our nodes map
    const pts: THREE.Vector2[] = [];
    
    if (way.geometry) {
       // if we used out geom, we have geometry embedded directly
       way.geometry.forEach(pt => {
         const [x, z] = toScene(pt.lon, pt.lat);
         pts.push(new THREE.Vector2(x, z));
       });
    } else if (way.nodes) {
       // fallback if geometry isn't embedded
       way.nodes.forEach(nodeId => {
         const node = nodes.get(nodeId);
         if (node) {
           const [x, z] = toScene(node.lon, node.lat);
           pts.push(new THREE.Vector2(x, z));
         }
       });
    }

    if (pts.length > 2) {
      const shape = new THREE.Shape(pts);
      parsedFeatures.push({ type, shape, height });
    }
  });

  return parsedFeatures;
};

export const Airport3D: React.FC<AirportProps> = ({ iataCode, fileName, positionOffset = [0, 0, 0] }) => {
  const [features, setFeatures] = useState<{ type: string, shape: THREE.Shape, height: number }[]>([]);

  useEffect(() => {
    fetch(fileName)
      .then(res => res.json())
      .then(data => {
        const parsed = parseOSMGeometry(data);
        setFeatures(parsed);
      })
      .catch(err => console.error(`Failed to load ${iataCode} OSM data:`, err));
  }, [fileName, iataCode]);

  const extrudeSettingsBuilding = { depth: 0.1, bevelEnabled: false };

  return (
    <group position={positionOffset}>
      {features.map((feature, idx) => {
        if (feature.type === 'terminal') {
          // 3D Extruded Building
          return (
            <mesh key={`${iataCode}-term-${idx}`} rotation-x={Math.PI / 2} position-y={0.01}>
              <extrudeGeometry args={[feature.shape, extrudeSettingsBuilding]} />
              <meshStandardMaterial color="#8892b0" roughness={0.3} metalness={0.2} transparent opacity={0.9} />
            </mesh>
          );
        } else if (feature.type === 'runway') {
          // Flat Runway (slightly raised above base island)
          return (
            <mesh key={`${iataCode}-runway-${idx}`} rotation-x={-Math.PI / 2} position-y={0.02}>
              <shapeGeometry args={[feature.shape]} />
              <meshStandardMaterial color="#2d3748" roughness={0.9} />
            </mesh>
          );
        } else {
          // Aprons / Taxiways
          return (
            <mesh key={`${iataCode}-apron-${idx}`} rotation-x={-Math.PI / 2} position-y={0.015}>
              <shapeGeometry args={[feature.shape]} />
              <meshStandardMaterial color="#4a5568" roughness={0.8} />
            </mesh>
          );
        }
      })}
    </group>
  );
};
