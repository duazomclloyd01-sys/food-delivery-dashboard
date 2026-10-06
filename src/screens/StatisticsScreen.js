import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, useWindowDimensions, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SHADOW, peso } from '../theme';
import FoodImage from '../components/FoodImage';
import { dishes } from '../data/mock';

const PERIODS = ['Week', 'Month', 'Year'];

const SPENDING = {
  Week: { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], datasets: [{ data: [320, 450, 380, 520, 680, 890, 740] }] },
  Month: { labels: ['W1', 'W2', 'W3', 'W4'], datasets: [{ data: [5200, 6100, 5800, 7480] }] },
  Year: { labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S'], datasets: [{ data: [18200, 21400, 19800, 22600, 24500, 23100, 25600, 24900, 26400] }] },
};

const STATS = [
  { label: 'Total Orders', value: '128', change: '+12.4%', up: true, icon: 'receipt-outline' },
  { label: 'Total Spent', value: '₱24,580', change: '+8.2%', up: true, icon: 'wallet-outline' },
  { label: 'Avg. Order Value', value: '₱192', change: '-2.1%', up: false, icon: 'card-outline' },
  { label: 'Saved with Offers', value: '₱1,860', change: '+18.9%', up: true, icon: 'ticket-outline' },
];

const CATEGORIES = [
  { name: 'Filipino', pct: 42, color: '#F26B1D' },
  { name: 'Fast Food', pct: 24, color: '#FF8A3D' },
  { name: 'Healthy', pct: 14, color: '#FFB27A' },
  { name: 'Drinks', pct: 12, color: '#E8541A' },
  { name: 'Desserts', pct: 8, color: '#D5D8DD' },
];

const FAVORITES = [
  { id: 'd2', count: 28 },
  { id: 'd6', count: 24 },
  { id: 'd7', count: 21 },
];

const RECENT = [
  { date: 'Sep 28', restaurant: 'Kusina ni Juan', total: 457, status: 'Delivered' },
  { date: 'Sep 26', restaurant: 'Sisig House QC', total: 308, status: 'Delivered' },
  { date: 'Sep 21', restaurant: 'Inasal Express', total: 199, status: 'Cancelled' },
];

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (o = 1) => `rgba(242,107,29,${o})`,
  labelColor: (o = 1) => `rgba(138,143,152,${o})`,
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#E8541A', fill: '#F26B1D' },
  fillShadowGradientFrom: '#F26B1D',
  fillShadowGradientTo: '#FFB27A',
  fillShadowGradientFromOpacity: 0.3,
  fillShadowGradientToOpacity: 0.05,
};

function Donut() {
  const size = 168, stroke = 24, r = (size - stroke) / 2, c = size / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={COLORS.border} strokeWidth={stroke} fill="none" />
        {CATEGORIES.map((s) => {
          const frac = s.pct / 100;
          const rot = -90 + acc * 360;
          acc += frac;
          return (
            <Circle key={s.name} cx={c} cy={c} r={r} stroke={s.color} strokeWidth={stroke} fill="none"
              strokeDasharray={`${frac * circ} ${circ}`} rotation={rot} origin={`${c}, ${c}`} strokeLinecap="butt" />
          );
        })}
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={styles.donutNum}>128</Text>
        <Text style={styles.donutSub}>orders</Text>
      </View>
    </View>
  );
}

export default function StatisticsScreen() {
  const [period, setPeriod] = useState('Month');
  const { width } = useWindowDimensions();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: false }).start();
  }, [anim]);

  const enter = {
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  };

  const chartW = Math.max(260, Math.min(width - 260, 620));
  const maxFav = Math.max(...FAVORITES.map((f) => f.count));

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['#FFF4EC', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.blobTR} />
        <View style={styles.blobBL} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.title}>Statistics</Text>
          <View style={styles.pills}>
            {PERIODS.map((p) => (
              <TouchableOpacity key={p} onPress={() => setPeriod(p)}>
                {period === p ? (
                  <LinearGradient colors={['#FF8A3D', '#E8541A']} style={styles.pillA}>
                    <Text style={styles.pillAT}>{p}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.pill}><Text style={styles.pillT}>{p}</Text></View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <LinearGradient colors={['#FF8A3D', '#E8541A']} style={styles.statIcon}>
                <Ionicons name={s.icon} size={17} color="#fff" />
              </LinearGradient>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <View style={[styles.chip, { backgroundColor: s.up ? '#E8F9EF' : '#FDECEC' }]}>
                <Ionicons name={s.up ? 'trending-up' : 'trending-down'} size={11} color={s.up ? COLORS.success : COLORS.danger} />
                <Text style={[styles.chipT, { color: s.up ? COLORS.success : COLORS.danger }]}>{s.change}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.twoCol}>
          <Animated.View style={[styles.card, styles.chartCard, enter]}>
            <Text style={styles.cardTitle}>Spending Overview</Text>
            <Text style={styles.cardSub}>Spending over this {period.toLowerCase()}</Text>
            <LineChart data={SPENDING[period]} width={chartW} height={200} yAxisLabel="₱" chartConfig={chartConfig} bezier
              style={styles.chart} withInnerLines withOuterLines={false} />
          </Animated.View>
          <Animated.View style={[styles.card, styles.donutCard, enter]}>
            <Text style={styles.cardTitle}>Orders by Category</Text>
            <Text style={styles.cardSub}>Where your orders go</Text>
            <Donut />
            {CATEGORIES.map((s) => (
              <View key={s.name} style={styles.legRow}>
                <View style={[styles.legDot, { backgroundColor: s.color }]} />
                <Text style={styles.legName}>{s.name}</Text>
                <Text style={styles.legPct}>{s.pct}%</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Favorite Dishes</Text>
            <Text style={styles.cardSub}>Your top 3 this month</Text>
            {FAVORITES.map((f, i) => {
              const d = dishes.find((x) => x.id === f.id);
              return (
                <View key={f.id} style={styles.favRow}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <FoodImage dish={d.id} size="thumb" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.favName}>{d.name}</Text>
                    <View style={styles.track}>
                      <Animated.View style={[styles.fill, { width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${(f.count / maxFav) * 100}%`] }) }]} />
                    </View>
                  </View>
                  <Text style={styles.favCount}>{f.count}×</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order History Summary</Text>
            <Text style={styles.cardSub}>3 most recent orders</Text>
            {RECENT.map((o) => (
              <View key={o.date + o.restaurant} style={styles.histRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histR}>{o.restaurant}</Text>
                  <Text style={styles.histD}>{o.date}</Text>
                </View>
                <Text style={styles.histT}>{peso(o.total)}</Text>
                <View style={[styles.status, { backgroundColor: o.status === 'Delivered' ? '#E8F9EF' : '#FDECEC' }]}>
                  <Text style={[styles.statusT, { color: o.status === 'Delivered' ? COLORS.success : COLORS.danger }]}>{o.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  blobTR: { position: 'absolute', top: -90, right: -90, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(242,107,29,0.09)' },
  blobBL: { position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(242,107,29,0.08)' },
  content: { padding: 18, paddingBottom: 28, gap: 14 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text },
  pills: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 4, gap: 2, ...SHADOW.card },
  pill: { paddingHorizontal: 15, paddingVertical: 7, borderRadius: 16 },
  pillT: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.secondaryText },
  pillA: { paddingHorizontal: 15, paddingVertical: 7, borderRadius: 16 },
  pillAT: { fontFamily: FONTS.bold, fontSize: 12, color: '#fff' },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: 150, backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 6, ...SHADOW.card },
  statIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.text },
  statLabel: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  chipT: { fontFamily: FONTS.bold, fontSize: 11 },
  twoCol: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { flex: 1, minWidth: 280, backgroundColor: '#fff', borderRadius: 16, padding: 15, ...SHADOW.card },
  chartCard: { flex: 1.5 },
  donutCard: { alignItems: 'stretch' },
  cardTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text },
  cardSub: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText, marginTop: 2, marginBottom: 8 },
  chart: { borderRadius: 12, marginTop: 4 },
  donutWrap: { alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutNum: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text },
  donutSub: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText },
  legRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  legDot: { width: 9, height: 9, borderRadius: 5 },
  legName: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.secondaryText, flex: 1 },
  legPct: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.text },
  favRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  rank: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary, width: 16 },
  thumb: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  favName: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text },
  track: { height: 7, backgroundColor: COLORS.background, borderRadius: 4, marginTop: 6, overflow: 'hidden' },
  fill: { height: 7, backgroundColor: COLORS.primary, borderRadius: 4 },
  favCount: { fontFamily: FONTS.bold, fontSize: 12.5, color: COLORS.primary },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderTopWidth: 1, borderTopColor: COLORS.border },
  histR: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text },
  histD: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText },
  histT: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text },
  status: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusT: { fontFamily: FONTS.bold, fontSize: 10.5 },
});
