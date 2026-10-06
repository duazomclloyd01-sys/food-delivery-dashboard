import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOW, peso } from '../theme';
import { user } from '../data/mock';

export default function TopBar({ query, setQuery, onBell, unread, showCart, cartCount, cartTotal, onCart }) {
  const { width } = useWindowDimensions();
  const hideName = width < 560;
  return (
    <View style={styles.wrap}>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={17} color={COLORS.secondaryText} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search dishes or restaurants" placeholderTextColor={COLORS.secondaryText} style={styles.input} />
        <View style={styles.kbd}><Text style={styles.kbdT}>⌘K</Text></View>
      </View>
      <View style={styles.profile}>
        <LinearGradient colors={['#FF8A3D', '#E8541A']} style={styles.avatar}><Text style={styles.avT}>J</Text></LinearGradient>
        {!hideName && <Text style={styles.name} numberOfLines={1}>{user.name}</Text>}
        <Ionicons name="chevron-forward" size={14} color={COLORS.secondaryText} />
      </View>
      {showCart && (
        <TouchableOpacity onPress={onCart}>
          <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.cartBtn}>
            <Ionicons name="bag-handle-outline" size={17} color="#fff" />
            <Text style={styles.cartTotal}>{peso(cartTotal || 0)}</Text>
            {cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeT}>{cartCount}</Text></View>}
          </LinearGradient>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.bell} onPress={onBell}>
        <Ionicons name="notifications-outline" size={19} color={COLORS.text} />
        {unread && <View style={styles.dot}><Text style={styles.dotT}>2</Text></View>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.msg}>
        <Ionicons name="chatbox-ellipses-outline" size={19} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
  search: { flex: 1, minWidth: 220, flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, ...SHADOW.card },
  input: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, color: COLORS.text, outlineStyle: 'none' },
  kbd: { backgroundColor: '#F6F1EC', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  kbdT: { fontSize: 11, color: COLORS.secondaryText, fontFamily: FONTS.medium },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1, backgroundColor: '#fff', borderRadius: RADIUS.md, paddingVertical: 6, paddingHorizontal: 10, ...SHADOW.card },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 13 },
  name: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text, flexShrink: 1 },
  cartBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 10 },
  cartTotal: { color: '#fff', fontFamily: FONTS.semiBold, fontSize: 12.5 },
  cartBadge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeT: { color: COLORS.primary, fontSize: 10.5, fontFamily: FONTS.bold },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  dot: { position: 'absolute', top: 7, right: 8, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  dotT: { color: '#fff', fontSize: 9, fontFamily: FONTS.bold },
  msg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
});
