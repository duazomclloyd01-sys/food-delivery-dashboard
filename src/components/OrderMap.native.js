import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';
import { osrmUrl } from '../data/mapRoute';

const routeCache = new Map();

function bearing(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLng = toRad(b.longitude - a.longitude);
  const y = Math.sin(dLng) * Math.cos(toRad(b.latitude));
  const x =
    Math.cos(toRad(a.latitude)) * Math.sin(toRad(b.latitude)) -
    Math.sin(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.cos(dLng);
  return ((toDeg(Math.atan2(y, x)) + 360) % 360);
}

function tileXY(lat, lng, z) {
  const n = Math.pow(2, z);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latR = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n);
  return { x, y };
}

function StaticRoute({ restaurant, destination, etaMinutes, distanceKm }) {
  return (
    <View style={styles.staticMap}>
      <View style={[styles.block, { left: 18, top: 16, width: 100, height: 44 }]} />
      <View style={[styles.block, { right: 20, top: 20, width: 70, height: 38 }]} />
      <View style={[styles.block, { left: 60, bottom: 18, width: 120, height: 40 }]} />
      <View style={styles.streetH} />
      <View style={styles.streetV} />
      <View style={styles.routeLine} />
      <View style={[styles.pin, styles.restPin, { left: 26, top: 96 }]}>
        <Ionicons name="restaurant" size={14} color="#fff" />
      </View>
      <View style={[styles.pin, styles.homePin, { right: 30, top: 34 }]}>
        <Ionicons name="home" size={14} color="#fff" />
      </View>
      <View style={[styles.pin, styles.riderPin, { left: '52%', top: '42%' }]}>
        <Ionicons name="bicycle" size={15} color={COLORS.primary} />
      </View>
      <View style={styles.chip}>
        <Ionicons name="bicycle" size={12} color={COLORS.primary} />
        <Text style={styles.chipT}>{etaMinutes} min • {distanceKm} km</Text>
      </View>
    </View>
  );
}

function OrderMap({ restaurant, destination, rider, etaMinutes, distanceKm }) {
  const mapRef = useRef(null);
  const readyTimer = useRef(null);
  const [route, setRoute] = useState(null);
  const [failed, setFailed] = useState(false);
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const key = `${restaurant.lat},${restaurant.lng}-${destination.lat},${destination.lng}`;

  const restC = useMemo(() => ({ latitude: restaurant.lat, longitude: restaurant.lng }), [restaurant]);
  const destC = useMemo(() => ({ latitude: destination.lat, longitude: destination.lng }), [destination]);
  const region = useMemo(() => {
    const midLat = (restaurant.lat + destination.lat) / 2;
    const midLng = (restaurant.lng + destination.lng) / 2;
    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.abs(restaurant.lat - destination.lat) * 2.4 + 0.006,
      longitudeDelta: Math.abs(restaurant.lng - destination.lng) * 2.4 + 0.006,
    };
  }, [restaurant, destination]);

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
        const pts = coords && coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
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
    Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: false })).start();
  }, [pulse]);

  useEffect(() => {
    if (!route || route.length < 2) return undefined;
    const id = setInterval(() => setIdx((i) => (i + 1) % route.length), 1500);
    return () => clearInterval(id);
  }, [route]);

  useEffect(() => {
    readyTimer.current = setTimeout(() => {
      setReady((wasReady) => {
        if (!wasReady) setFallback(true);
        return wasReady;
      });
    }, 5000);
    const { x, y } = tileXY(restaurant.lat, restaurant.lng, 15);
    const probe = `https://a.basemaps.cartocdn.com/light_all/15/${x}/${y}.png`;
    fetch(probe, { method: 'HEAD' }).catch(() => setFallback(true));
    return () => {
      if (readyTimer.current) clearTimeout(readyTimer.current);
    };
  }, [restaurant]);

  useEffect(() => () => {
    if (readyTimer.current) clearTimeout(readyTimer.current);
  }, []);

  const pts = route || [restC, destC];
  const at = Math.min(idx, pts.length - 1);
  const riderC = route ? pts[at] : { latitude: rider.lat, longitude: rider.lng };
  const nextC = pts[Math.min(at + 1, pts.length - 1)];
  const angle = Math.round(bearing(riderC, nextC));
  const traveled = pts.slice(0, Math.max(at + 1, 2));
  const remaining = pts.slice(at);

  const fit = () => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates([restC, riderC, destC], {
        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
        animated: true,
      });
    }
  };

  if (fallback) {
    return (
      <View style={styles.wrap}>
        <StaticRoute restaurant={restaurant} destination={destination} etaMinutes={etaMinutes} distanceKm={distanceKm} />
        <Text style={styles.attr}>© OpenStreetMap contributors © CARTO</Text>
        <TouchableOpacity style={styles.recenter} onPress={() => setFallback(false)}>
          <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="none"
        initialRegion={region}
        onMapReady={() => {
          setReady(true);
          if (readyTimer.current) clearTimeout(readyTimer.current);
          setTimeout(fit, 300);
        }}
        showsCompass={false}
        showsPointsOfInterest={false}
        showsTraffic={false}
        toolbarEnabled={false}
        scrollEnabled={interacting}
        zoomEnabled={interacting}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />
        {failed || !route ? (
          <Polyline coordinates={[restC, destC]} strokeColor={COLORS.primary} strokeWidth={5} lineCap="round" lineDashPattern={[7, 7]} />
        ) : (
          <>
            <Polyline coordinates={traveled} strokeColor="#D8DCE1" strokeWidth={5} lineCap="round" />
            <Polyline coordinates={remaining} strokeColor={COLORS.primary} strokeWidth={5} lineCap="round" />
          </>
        )}
        <Marker coordinate={restC} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
          <View style={[styles.pin, { backgroundColor: COLORS.primary }]}><Ionicons name="restaurant" size={14} color="#fff" /></View>
        </Marker>
        <Marker coordinate={destC} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
          <View style={[styles.pin, { backgroundColor: '#1F1F1F' }]}><Ionicons name="home" size={14} color="#fff" /></View>
        </Marker>
        <Marker coordinate={riderC} anchor={{ x: 0.5, y: 0.5 }} rotation={angle} tracksViewChanges={false}>
          <View style={styles.riderWrap}>
            <Animated.View style={[styles.halo, {
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            }]} />
            <View style={styles.rider}><Ionicons name="bicycle" size={16} color={COLORS.primary} /></View>
          </View>
        </Marker>
      </MapView>
      {!interacting && (
        <TouchableOpacity style={styles.tapLayer} activeOpacity={1} onPress={() => setInteracting(true)}>
          <View style={styles.tapPill}>
            <Ionicons name="hand-left-outline" size={13} color={COLORS.primary} />
            <Text style={styles.tapPillT}>Tap to interact</Text>
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.chip} pointerEvents="none">
        <Ionicons name="bicycle" size={12} color={COLORS.primary} />
        <Text style={styles.chipT}>{etaMinutes} min • {distanceKm} km</Text>
      </View>
      <Text style={styles.attr} pointerEvents="none">© OpenStreetMap contributors © CARTO</Text>
      <TouchableOpacity style={styles.recenter} onPress={fit}>
        <Ionicons name="locate-outline" size={18} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 220, width: '100%', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EAECEF', marginTop: 12 },
  map: { flex: 1 },
  pin: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  riderWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 2.5, borderColor: COLORS.primary },
  rider: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', borderWidth: 2.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  chip: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipT: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.text },
  attr: { position: 'absolute', left: 8, bottom: 6, fontSize: 9, color: 'rgba(90,90,90,0.9)', backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 5, borderRadius: 4 },
  recenter: { position: 'absolute', right: 10, bottom: 24, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  tapLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 34 },
  tapPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7 },
  tapPillT: { fontFamily: FONTS.bold, fontSize: 11.5, color: COLORS.primary },
  staticMap: { flex: 1, backgroundColor: '#F6EFE3', position: 'relative', overflow: 'hidden' },
  block: { position: 'absolute', backgroundColor: '#ECE0C9', borderRadius: 9 },
  streetH: { position: 'absolute', left: 0, right: 0, top: 84, height: 13, backgroundColor: '#FFFFFF' },
  streetV: { position: 'absolute', left: 150, top: 0, bottom: 0, width: 13, backgroundColor: '#FFFFFF' },
  routeLine: { position: 'absolute', left: 34, right: 40, top: 60, height: 0, borderTopWidth: 3.5, borderColor: '#F26B1D', borderStyle: 'dashed', borderRadius: 2, transform: [{ rotate: '-9deg' }] },
  restPin: { backgroundColor: '#F26B1D' },
  homePin: { backgroundColor: '#1F1F1F' },
  riderPin: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#F26B1D', left: '52%', top: '42%', marginLeft: -17, marginTop: -17 },
});

export default React.memo(OrderMap);
