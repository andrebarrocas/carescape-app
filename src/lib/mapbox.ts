import mapboxgl from 'mapbox-gl';

if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Missing Mapbox token');
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export const createMap = (container: HTMLElement) => {
  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-74.5, 40],
    zoom: 9,
  });
};

export const addMarker = (
  map: mapboxgl.Map,
  lngLat: [number, number],
  color?: string
) => {
  const marker = new mapboxgl.Marker({
    color: color || '#FF0000',
  })
    .setLngLat(lngLat)
    .addTo(map);
  return marker;
};

export const reverseGeocode = async (lngLat: [number, number]) => {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat[0]},${lngLat[1]}.json?access_token=${mapboxgl.accessToken}`
  );
  const data = await response.json();
  return data.features[0]?.place_name;
}; 