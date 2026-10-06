import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './OrderMap.web.css';
import { osrmUrl } from '../data/mapRoute';

const routeCache = new Map();

function bearing(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLng = toRad(b[1] - a[1]);
  const y = Math.sin(dLng) * Math.cos(toRad(b[0]));
  const x = Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) - Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function pinIcon(bg, glyph, glyphColor) {
  return L.divIcon({
    className: 'om-divicon',
    html: `<div class="om-pin" style="background:${bg}"><span style="color:${glyphColor}">${glyph}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 30],
  });
}

function riderIcon(angle) {
  return L.divIcon({
    className: 'om-divicon',
    html: `<div class="om-halo"></div><div class="om-rider"><span class="om-scooter" style="transform:rotate(${angle}deg)">🛵</span></div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function FitAll({ points, resetKey }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.fitBounds(points, { padding: [40, 40] });
    const t = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(points, { padding: [40, 40] });
    }, 450);
    return () => clearTimeout(t);
  }, [map, points, resetKey]);
  return null;
}

function WheelUnlock() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const onClick = () => map.scrollWheelZoom.enable();
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [map]);
  return null;
}

function Controls({ points, onRecenter }) {
  const map = useMap();
  return (
    <>
      <div className="om-zoom">
        <button type="button" aria-label="Zoom in" onClick={() => map.zoomIn()}>+</button>
        <button type="button" aria-label="Zoom out" onClick={() => map.zoomOut()}>−</button>
      </div>
      <button type="button" aria-label="Recenter" className="om-recenter" onClick={() => { map.fitBounds(points, { padding: [40, 40] }); onRecenter && onRecenter(); }}>⌖</button>
    </>
  );
}

function OrderMap({ restaurant, destination, rider, etaMinutes, distanceKm }) {
  const [route, setRoute] = useState(null);
  const [failed, setFailed] = useState(false);
  const [idx, setIdx] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const key = useMemo(() => `${restaurant.lat},${restaurant.lng}-${destination.lat},${destination.lng}`, [restaurant, destination]);

  useEffect(() => {
    let alive = true;
    if (routeCache.has(key)) {
      setRoute(routeCache.get(key));
      return undefined;
    }
    fetch(osrmUrl(restaurant, destination))
      .then((r) => r.json())
      .then((j) => {
        const coords = j && j.routes && j.routes[0] && j.routes[0].geometry && j.routes[0].geometry.coordinates;
        const pts = coords && coords.map(([lng, lat]) => [lat, lng]);
        if (!alive) return;
        if (pts && pts.length > 1) {
          routeCache.set(key, pts);
          setRoute(pts);
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [key, restaurant, destination]);

  useEffect(() => {
    if (!route || route.length < 2) return undefined;
    const id = setInterval(() => setIdx((i) => (i + 1) % route.length), 1500);
    return () => clearInterval(id);
  }, [route]);

  const restLL = [restaurant.lat, restaurant.lng];
  const destLL = [destination.lat, destination.lng];
  const straight = [restLL, destLL];

  const pts = route || straight;
  const at = Math.min(idx, pts.length - 1);
  const riderPos = route ? pts[at] : [rider.lat, rider.lng];
  const next = pts[Math.min(at + 1, pts.length - 1)];
  const angle = Math.round(bearing(riderPos, next) / 15) * 15;
  const traveled = pts.slice(0, Math.max(at + 1, 2));
  const remaining = pts.slice(at);

  const restIcon = useMemo(() => pinIcon('#F26B1D', '🍴', '#fff'), []);
  const destIcon = useMemo(() => pinIcon('#1F1F1F', '⌂', '#fff'), []);
  const rIcon = useMemo(() => riderIcon(angle), [angle]);
  const bounds = useMemo(() => [restLL, destLL, [rider.lat, rider.lng]], [restaurant, destination, rider]);
  const center = useMemo(() => [(restaurant.lat + destination.lat) / 2, (restaurant.lng + destination.lng) / 2], [restaurant, destination]);

  return (
    <div style={{ height: 220, borderRadius: 16, overflow: 'hidden', border: '1px solid #EAECEF', position: 'relative' }}>
      <MapContainer center={center} zoom={14} scrollWheelZoom={false} zoomControl={false} attributionControl={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <FitAll points={bounds} resetKey={resetKey} />
        <WheelUnlock />
        <Controls points={bounds} onRecenter={() => setResetKey((k) => k + 1)} />
        {failed || !route ? (
          <Polyline positions={straight} pathOptions={{ color: '#F26B1D', weight: 5, lineCap: 'round', dashArray: '7 7' }} />
        ) : (
          <>
            <Polyline positions={traveled} pathOptions={{ color: '#D8DCE1', weight: 5, lineCap: 'round' }} />
            <Polyline positions={remaining} pathOptions={{ color: '#F26B1D', weight: 5, lineCap: 'round' }} />
          </>
        )}
        <Marker position={restLL} icon={restIcon} />
        <Marker position={destLL} icon={destIcon} />
        <Marker position={riderPos} icon={rIcon} zIndexOffset={500} />
      </MapContainer>
      <div className="om-chip">🛵&nbsp;&nbsp;{etaMinutes} min • {distanceKm} km</div>
      <div className="om-attr">© OpenStreetMap contributors</div>
    </div>
  );
}

export default React.memo(OrderMap);
