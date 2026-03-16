import * as THREE from 'three';

// Jamaica bounds
const JAMAICA_CENTER = { lat: 18.15, lon: -77.35 };
const SCALE = 9;

// Convert lat/lon to scene coords
function toScene(lon: number, lat: number): [number, number] {
  return [
    (lon - JAMAICA_CENTER.lon) * SCALE,
    -(lat - JAMAICA_CENTER.lat) * SCALE,
  ];
}

// Create a procedural grayscale Heightmap (DEM) as a DataTexture
export function createJamaicaDEMTexture(width = 256, height = 128) {
  const size = width * height;
  const data = new Uint8Array(4 * size);

  // Scene dimensions roughly bounding Jamaica (-78.4 to -76.2 lon, 17.7 to 18.5 lat)
  // Let's say the plane spans X: -12.5 to 12.5, Z: -5 to 5
  const planeWidth = 25;
  const planeHeight = 10;
  
  const [blueMtnX, blueMtnZ] = toScene(-76.58, 18.18);
  const [centralHighX, centralHighZ] = toScene(-77.5, 18.2);

  for (let i = 0; i < size; i++) {
    const xIndex = i % width;
    const yIndex = Math.floor(i / width);
    
    // Map to scene coordinates
    const sx = (xIndex / width) * planeWidth - (planeWidth / 2);
    const sz = (yIndex / height) * planeHeight - (planeHeight / 2);
    
    // Distance to Blue Mountains
    const distBlue = Math.sqrt((sx - blueMtnX) ** 2 + (sz - blueMtnZ) ** 2);
    // Distance to Central Highlands
    const distCentral = Math.sqrt((sx - centralHighX) ** 2 + (sz - centralHighZ) ** 2);
    
    // Calculate elevation
    let elevation = 0;
    
    // Blue Mountains (Highest peak)
    if (distBlue < 3.0) {
      // Smooth falloff
      const intensity = Math.pow(1 - (distBlue / 3.0), 2);
      elevation = Math.max(elevation, intensity * 255);
    }
    
    // Central Highlands
    if (distCentral < 4.0) {
      const intensity = Math.pow(1 - (distCentral / 4.0), 2);
      elevation = Math.max(elevation, intensity * 150); // Lower than Blue mtns
    }
    
    const stride = i * 4;
    data[stride] = elevation;     // R
    data[stride + 1] = elevation; // G
    data[stride + 2] = elevation; // B
    data[stride + 3] = 255;       // A
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}
