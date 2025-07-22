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

  // Enhanced spiral pattern for better separation
  const angle = (index * 2 * Math.PI) / clusterSize;

  // Increased radius values for better separation when zoomed out
  let radius: number;
  if (clusterSize === 2) {
    return { x: (index === 0 ? -0.08 : 0.08), y: 0 };
  } else if (clusterSize === 3) {
    radius = 0.08;
  } else if (clusterSize === 4) {
    radius = 0.1;
  } else if (clusterSize === 5) {
    radius = 0.12;
  } else {
    radius = 0.08 + (index * 0.03);
  }

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

/**
 * Apply zoom-based scaling to cluster offsets
 * This creates the illusion of displacement that changes with zoom level
 * When zoomed in enough, colors appear at their real positions
 * Maintains minimal clustering to distinguish very close colors
 */
export function applyZoomScaling(
  clusteredMarkers: ClusteredMarker[],
  zoom: number
): ClusteredMarker[] {
  return clusteredMarkers.map(marker => {
    if (!marker.isClustered || !marker.baseOffset) {
      return marker;
    }

    // Enhanced zoom-based scaling for better separation when zoomed out
    let zoomFactor: number;
    
    if (zoom >= 12) {
      // Show with minimal offset when very zoomed in
      zoomFactor = 0.1; // 10% of original offset for minimal clustering
    } else if (zoom >= 10) {
      // Show with small offset when zoomed in to distinguish very close colors
      zoomFactor = 0.2; // 20% of original offset
    } else if (zoom >= 8) {
      // Reduce offset at medium zoom
      zoomFactor = Math.max(0.4, 1.2 - (zoom - 8) * 0.4); // 0.4 to 1.2 range
    } else if (zoom >= 6) {
      // Medium-low zoom: increase clustering
      zoomFactor = Math.max(0.8, 2.5 - (zoom - 6) * 0.35); // 0.8 to 2.5 range
    } else if (zoom >= 4) {
      // Low zoom: much more aggressive clustering
      zoomFactor = Math.max(1.5, 4.5 - (zoom - 4) * 0.75); // 1.5 to 3.0 range
    } else if (zoom >= 2) {
      // Very low zoom: maximum clustering
      zoomFactor = Math.max(3.0, 8 - (zoom - 2) * 1.25); // 3.0 to 6.0 range
    } else {
      // Extremely low zoom: extreme clustering
      zoomFactor = Math.max(6.0, 12 - zoom); // 6.0 to 10.0+ range
    }

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
      const parsed = JSON.parse(coords);
      if (parsed && typeof parsed === 'object' && 'lat' in parsed && 'lng' in parsed) {
        return { lat: Number(parsed.lat), lng: Number(parsed.lng) };
      }
      return null;
    } catch {
      return null;
    }
  }
  
  if (typeof coords === 'object' && coords !== null && 'lat' in coords && 'lng' in coords) {
    return { lat: Number((coords as any).lat), lng: Number((coords as any).lng) };
  }
  
  return null;
} 