export const DEFAULT_CENTER = [40, -74.5] as [number, number];
export const DEFAULT_ZOOM = 9;

export const getLocationName = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || 'Unknown location';
  } catch (error) {
    console.error('Error getting location name:', error);
    return 'Unknown location';
  }
};

// Utility functions for map operations

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  data: any;
}

export interface ClusteredMarker extends MapMarker {
  offset?: { x: number; y: number };
  clusterSize?: number;
  isClustered?: boolean;
}

/**
 * Clusters markers that are very close to each other by applying small offsets
 * @param markers Array of markers to cluster
 * @param threshold Distance threshold in degrees (default: 0.01 degrees ≈ 1km)
 * @returns Array of markers with offsets applied for clustering
 */
export function clusterMarkers(
  markers: MapMarker[],
  threshold: number = 0.01
): ClusteredMarker[] {
  const clusters: MapMarker[][] = [];
  const processed = new Set<string>();

  // Group markers into clusters
  markers.forEach((marker) => {
    if (processed.has(marker.id)) return;

    const cluster = [marker];

    markers.forEach((otherMarker) => {
      if (otherMarker.id === marker.id) return;
      const distance = calculateDistance(marker, otherMarker);
      if (distance <= threshold) {
        cluster.push(otherMarker);
      }
    });

    if (cluster.length > 1) {
      clusters.push(cluster);
      // Only mark the current marker as processed
      processed.add(marker.id);
    }
  });

  // Apply offsets to clustered markers
  const result: ClusteredMarker[] = [];
  
  markers.forEach((marker) => {
    const cluster = clusters.find(c => c.some(m => m.id === marker.id));
    
    if (cluster && cluster.length === 2) {
      // For exactly 2, offset one left and one right by a fixed amount
      const index = cluster.findIndex(m => m.id === marker.id);
      const offset = { x: (index === 0 ? -0.0005 : 0.0005), y: 0 };
      result.push({
        ...marker,
        offset,
        // No isClustered or clusterSize
      });
    } else if (cluster && cluster.length > 2) {
      // For 3 or more, show badge
      const index = cluster.findIndex(m => m.id === marker.id);
      const offset = calculateClusterOffset(index, cluster.length);
      result.push({
        ...marker,
        offset,
        clusterSize: cluster.length,
        isClustered: true,
      });
    } else {
      result.push({
        ...marker,
        isClustered: false,
      });
    }
  });

  return result;
}

/**
 * Calculate distance between two points in degrees (simplified)
 */
function calculateDistance(a: MapMarker, b: MapMarker): number {
  const dLat = Math.abs(b.lat - a.lat);
  const dLng = Math.abs(b.lng - a.lng);
  
  // Simple Euclidean distance in degrees
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Calculate offset for a marker within a cluster
 * Uses a spiral pattern to distribute markers around the center
 */
function calculateClusterOffset(index: number, clusterSize: number): { x: number; y: number } {
  if (clusterSize <= 1) return { x: 0, y: 0 };

  // Use a spiral pattern for better distribution
  const angle = (index * 2 * Math.PI) / clusterSize;
  const radius = 0.0005 + (index * 0.0001); // Base radius + increasing offset
  
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

/**
 * Parse coordinates from various formats
 */
export function parseCoordinates(coords: any): { lat: number; lng: number } | null {
  if (!coords) return null;
  
  if (typeof coords === 'string') {
    try {
      return JSON.parse(coords);
    } catch {
      return null;
    }
  }
  
  if (typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
    return coords as { lat: number; lng: number };
  }
  
  return null;
} 