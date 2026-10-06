// Sample Metro Manila points for the live-tracking map. Replace with live data later.
export const MAP_POINTS = {
  restaurant: { lat: 14.5547, lng: 121.0244, name: 'Kusina ni Juan' },
  destination: { lat: 14.565, lng: 121.03, label: 'Home' },
  riderStart: { lat: 14.5555, lng: 121.0252 },
};

export const osrmUrl = (a, b) =>
  `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
