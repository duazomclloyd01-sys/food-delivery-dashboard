import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

const ITEMS = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'browse', label: 'Menu', icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  { key: 'favorites', label: 'Favorites', icon: 'heart-outline', activeIcon: 'heart' },
  { key: 'orders', label: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt' },
  { key: 'statistics', label: 'Statistics', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  { key: 'offers', label: 'Offers', icon: 'pricetag-outline', activeIcon: 'pricetag' },
  { key: 'schedule', label: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar' },
];

const BOTTOM = [
  { key: 'settings', label: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
  { key: 'logout', label: 'Logout', icon: 'log-out-outline', activeIcon: 'log-out-outline' },
];

function TipBtn({ label, onPress, active, children }) {
  const [tip, setTip] = useState(false);
  return (
    <View onHoverIn={() => setTip(true)} onHoverOut={() => setTip(false)}>
      <TouchableOpacity accessibilityLabel={label} onPress={onPress} style={[styles.btn, active && styles.btnActive]}>
        {children}
      </TouchableOpacity>
      {tip && (
        <View style={styles.tip} pointerEvents="none">
          <Text style={styles.tipT}>{label}</Text>
        </View>
      )}
    </View>
  );
}

function CartBadge({ count }) {
  const s = useRef(new Animated.Value(1)).current;
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) {
      Animated.sequence([
        Animated.timing(s, { toValue: 1.55, duration: 120, useNativeDriver: false }),
        Animated.spring(s, { toValue: 1, friction: 4, useNativeDriver: false }),
      ]).start();
    }
    prev.current = count;
  }, [count, s]);
  if (!count) return null;
  return (
    <Animated.View style={[styles.badge, { transform: [{ scale: s }] }]}>
      <Text style={styles.badgeT}>{count}</Text>
    </Animated.View>
  );
}

export default function Sidebar({ active, onNavigate, cartCount }) {
  const { height } = useWindowDimensions();
  const compact = height < 600;
  const btn = (it) => {
    const isActive = active === it.key;
    return (
      <TipBtn key={it.key} label={it.label} active={isActive} onPress={() => onNavigate(it.key)}>
        <Ionicons name={isActive ? it.activeIcon : it.icon} size={20} color={isActive ? COLORS.primary : '#8A8A8A'} />
        {it.key === 'browse' && <CartBadge count={cartCount} />}
      </TipBtn>
    );
  };
  return (
    <View style={[styles.wrap, compact && { paddingVertical: 10 }]}>
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={[styles.logo, compact && { marginBottom: 8 }]}>
        <View style={styles.logoHole} />
      </LinearGradient>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, compact && { gap: 2 }]} showsVerticalScrollIndicator={false}>
        {ITEMS.map(btn)}
      </ScrollView>
      <View style={[styles.bottom, compact && { paddingTop: 6, gap: 2 }]}>
        {BOTTOM.map(btn)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 76, backgroundColor: '#fff', alignItems: 'center', paddingVertical: 16, borderRightWidth: 1, borderRightColor: COLORS.border },
  logo: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  logoHole: { width: 15, height: 15, borderRadius: 8, backgroundColor: '#fff' },
  group: { gap: 6, alignItems: 'center' },
  spacer: { flex: 1 },
  bottom: { gap: 6, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, width: '100%' },
  scroll: { flex: 1, width: '100%' },
  scrollContent: { alignItems: 'center', gap: 6, paddingVertical: 4 },
  btn: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  btnActive: { backgroundColor: COLORS.lightOrange },
  badge: { position: 'absolute', top: 4, right: 4, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeT: { color: '#fff', fontSize: 10, fontFamily: 'Poppins_700Bold' },
  tip: { position: 'absolute', left: 54, top: 8, backgroundColor: '#1F1F1F', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, zIndex: 20 },
  tipT: { color: '#fff', fontSize: 11, fontFamily: 'Poppins_500Medium' },
});
