import { LatLngExpression } from 'leaflet';

export const DEFAULT_CENTER: LatLngExpression = [40, -74.5];
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