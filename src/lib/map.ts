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
  baseOffset?: { x: number; y: number }; // Store the base offset for zoom scaling
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
      // Mark all markers in the cluster as processed
      cluster.forEach(m => processed.add(m.id));
    }
  });

  // Apply offsets to clustered markers
  const result: ClusteredMarker[] = [];
  
  markers.forEach((marker) => {
    const cluster = clusters.find(c => c.some(m => m.id === marker.id));
    
    if (cluster && cluster.length >= 2) {
      const index = cluster.findIndex(m => m.id === marker.id);
      const baseOffset = calculateClusterOffset(index, cluster.length);
      
      result.push({
        ...marker,
        baseOffset, // Store the base offset
        offset: baseOffset, // Initial offset
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
 * Enhanced to create better visual separation
 */
function calculateClusterOffset(index: number, clusterSize: number): { x: number; y: number } {
  if (clusterSize <= 1) return { x: 0, y: 0 };

  // Extreme spiral pattern for maximum separation
  const angle = (index * 2 * Math.PI) / clusterSize;

  // Extremely large radius for maximum separation
  let radius: number;
  if (clusterSize === 2) {
    return { x: (index === 0 ? -0.025 : 0.025), y: 0 };
  } else if (clusterSize === 3) {
    radius = 0.025;
  } else if (clusterSize === 4) {
    radius = 0.03;
  } else {
    radius = 0.02 + (index * 0.01);
  }

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

/**
 * Apply zoom-based scaling to cluster offsets
 * This creates the illusion of displacement that changes with zoom level
 */
export function applyZoomScaling(
  clusteredMarkers: ClusteredMarker[],
  zoom: number
): ClusteredMarker[] {
  return clusteredMarkers.map(marker => {
    if (!marker.isClustered || !marker.baseOffset) {
      return marker;
    }

    // Allow offset to approach zero at high zoom
    const zoomFactor = Math.max(0.05, Math.min(20, 60 / zoom));

    const scaledOffset = {
      x: marker.baseOffset.x * zoomFactor,
      y: marker.baseOffset.y * zoomFactor,
    };

    return {
      ...marker,
      offset: scaledOffset,
    };
  });
}

/**
 * Parse coordinates from various formats
 */
export function parseCoordinates(coords: unknown): { lat: number; lng: number } | null {
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