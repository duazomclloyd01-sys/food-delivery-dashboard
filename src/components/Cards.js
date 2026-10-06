import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOW, peso } from '../theme';
import { useStore } from '../store';
import FoodImage from './FoodImage';

export function SectionHead({ title, action, count, onAction }) {
  return (
    <View style={styles.secHead}>
      <Text style={styles.secTitle}>{title}</Text>
      <TouchableOpacity style={styles.viewAll} onPress={onAction}>
        <Text style={styles.viewAllT}>{action}{count != null ? ` ${count}` : ''}</Text>
        <View style={styles.viewAllArrow}><Ionicons name="arrow-forward" size={12} color="#fff" /></View>
      </TouchableOpacity>
    </View>
  );
}

export function FoodCard({ dish, onOpen, wide }) {
  const { favorites, toggleFav, add } = useStore();
  const fav = favorites.includes(dish.id);
  return (
    <TouchableOpacity style={[styles.foodCard, wide && { width: 200 }]} onPress={() => onOpen(dish)} activeOpacity={0.9}>
      <View style={styles.foodImg}>
        <FoodImage dish={dish.id} size="card" shade style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={styles.heart} onPress={() => toggleFav(dish.id)}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={14} color={fav ? COLORS.primary : COLORS.secondaryText} />
        </TouchableOpacity>
        <View style={styles.rate}><Text style={styles.rateT}>{dish.rating}/5</Text></View>
      </View>
      <Text style={styles.foodName} numberOfLines={1}>{dish.name}</Text>
      <View style={styles.foodMeta}>
        <View><Text style={styles.free}>Free</Text><Text style={styles.free}>ship</Text></View>
        <View><Text style={styles.time}>{dish.time.split(' ')[0]}</Text><Text style={styles.time2}>{dish.time.split(' ').slice(1).join(' ')}</Text></View>
        <View style={{ flex: 1 }} />
        <Text style={styles.price}>{peso(dish.price)}</Text>
      </View>
      <View style={styles.tagRow}>
        {dish.tags.map((t) => <View key={t} style={styles.tag}><Text style={styles.tagT}>{t}</Text></View>)}
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => add(dish.id)}>
          <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.miniAdd}>
            <Ionicons name="add" size={13} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export function TrendingCard({ dish, onOpen }) {
  const { add } = useStore();
  return (
    <TouchableOpacity style={styles.trend} onPress={() => onOpen(dish)} activeOpacity={0.9}>
      <Text style={styles.topWeek}>TOP OF THE{'\n'}WEEK</Text>
      <Text style={styles.trendName}>{dish.name}</Text>
      <Text style={styles.trendCal}>{dish.calories} Calories</Text>
      <View style={styles.trendFoot}>
        <Text style={styles.trendPrice}>{peso(dish.price)}</Text>
        <TouchableOpacity onPress={() => add(dish.id)}>
          <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.trendAdd}>
            <Ionicons name="add" size={14} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <FoodImage dish={dish.id} size="card" style={styles.trendCircle} />
    </TouchableOpacity>
  );
}

export function QtyStepper({ id }) {
  const { cart, add, dec } = useStore();
  const q = cart[id] || 0;
  return (
    <View style={styles.step}>
      <TouchableOpacity style={styles.stepBtn} onPress={() => dec(id)}><Ionicons name="remove" size={12} color={COLORS.secondaryText} /></TouchableOpacity>
      <Text style={styles.stepQ}>{q}</Text>
      <TouchableOpacity onPress={() => add(id)}>
        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.stepAdd}>
          <Ionicons name="add" size={12} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  secTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewAllT: { fontFamily: FONTS.medium, fontSize: 11.5, color: COLORS.secondaryText },
  viewAllArrow: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  foodCard: { width: 168, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 9, ...SHADOW.card },
  foodImg: { aspectRatio: 4 / 3, borderRadius: RADIUS.md, overflow: 'hidden' },
  foodEmoji: { fontSize: 52 },
  heart: { position: 'absolute', top: 7, right: 7, width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  rate: { position: 'absolute', bottom: 7, left: 7, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  rateT: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.text },
  foodName: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text, marginTop: 8 },
  foodMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  free: { fontFamily: FONTS.regular, fontSize: 9, color: COLORS.success, lineHeight: 11 },
  time: { fontFamily: FONTS.regular, fontSize: 9, color: COLORS.text, lineHeight: 11 },
  time2: { fontFamily: FONTS.regular, fontSize: 9, color: COLORS.secondaryText, lineHeight: 11 },
  price: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.primary },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
  tag: { backgroundColor: COLORS.background, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  tagT: { fontFamily: FONTS.medium, fontSize: 8, color: COLORS.secondaryText },
  miniAdd: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  trend: { width: 172, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 12, overflow: 'hidden', ...SHADOW.card, minHeight: 168 },
  topWeek: { fontFamily: FONTS.regular, fontSize: 8.5, color: COLORS.secondaryText, letterSpacing: 0.5 },
  trendName: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text, marginTop: 4, maxWidth: 90 },
  trendCal: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.secondaryText, marginTop: 2 },
  trendFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  trendPrice: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
  trendAdd: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  trendCircle: { position: 'absolute', right: -34, top: 22, width: 118, height: 118, borderRadius: 59, borderWidth: 5, borderColor: '#fff', overflow: 'hidden', ...SHADOW.card },
  trendEmoji: { fontSize: 44 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { width: 20, height: 20, borderRadius: 7, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  stepQ: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.text, minWidth: 12, textAlign: 'center' },
  stepAdd: { width: 20, height: 20, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
});
