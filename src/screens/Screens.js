import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Animated, Easing, useWindowDimensions, Modal, Platform, PanResponder, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LayoutGrid, Soup, Flame, UtensilsCrossed, Drumstick, IceCreamBowl, CupSoda, Cookie } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SHADOW, peso } from '../theme';
import OrderMap from '../components/OrderMap';
import { MAP_POINTS } from '../data/mapRoute';
import { categories, promos, notifications, user, dishes } from '../data/mock';
import { useStore } from '../store';
import { QtyStepper } from '../components/Cards';
import FoodImage from '../components/FoodImage';

// ---- BROWSE / EXPLORE MENU ----
const BROWSE_META = {
  d1: { restaurant: 'Kusina ni Juan', distance: '1.2 km', badge: 'Best seller' },
  d2: { restaurant: 'Sisig House QC', distance: '2.1 km', badge: 'Best seller' },
  d3: { restaurant: 'Palabok House', distance: '0.8 km' },
  d4: { restaurant: 'Kusina ni Juan', distance: '1.2 km' },
  d5: { restaurant: 'Kusina ni Juan', distance: '1.2 km', badge: 'New' },
  d6: { restaurant: 'Inasal Express', distance: '1.7 km', badge: 'Spicy' },
  d7: { restaurant: 'Halo-Halo Station', distance: '1.5 km', badge: 'Best seller' },
  d8: { restaurant: 'Crispy Pata Co.', distance: '2.8 km' },
  d9: { restaurant: 'Buko Fresh', distance: '0.6 km' },
  d10: { restaurant: 'Lechon Republic', distance: '2.4 km', badge: 'New' },
  d11: { restaurant: 'Halo-Halo Station', distance: '1.5 km' },
  d12: { restaurant: 'lumpiang House', distance: '1.9 km', badge: 'Spicy' },
};
const CAT_ICONS = { All: LayoutGrid, 'Rice Meals': Soup, Sizzling: Flame, Noodles: UtensilsCrossed, Grill: Drumstick, Desserts: IceCreamBowl, Drinks: CupSoda, Merienda: Cookie };
const SORTS_B = ['Recommended', 'Rating', 'Price low to high', 'Price high to low', 'Fastest delivery'];
const ADDONS = [
  { name: 'Extra rice', price: 25 },
  { name: 'Extra egg', price: 20 },
  { name: 'Extra sauce', price: 15 },
];
const minsOf = (d) => parseInt(d.time, 10) || 99;

function BrowseCard({ d, meta, index, cardStyle, onSheet }) {
  const { cart, favorites, toggleFav, add } = useStore();
  const a = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);
  const [ticked, setTicked] = useState(false);
  const timer = useRef(null);
  const fav = favorites.includes(d.id);
  const qty = cart[d.id] || 0;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 420, delay: Math.min(index, 8) * 60, useNativeDriver: false }).start();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [a, index]);
  const pressHeart = () => {
    Animated.sequence([
      Animated.timing(pop, { toValue: 0.7, duration: 110, useNativeDriver: false }),
      Animated.timing(pop, { toValue: 1, duration: 160, useNativeDriver: false }),
    ]).start(() => toggleFav(d.id));
  };
  const quickAdd = () => {
    add(d.id, 1);
    setTicked(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTicked(false), 1000);
  };
  return (
    <Animated.View style={[styles.bCard, cardStyle, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }, { scale: hovered ? 1.03 : 1 }] }]}>
      <TouchableOpacity activeOpacity={0.92} onPress={() => onSheet(d)} onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}>
        <View style={styles.bImg}>
          <FoodImage dish={d.id} size="card" shade style={StyleSheet.absoluteFill} />
          {meta.badge && (
            <View style={[styles.bBadge, { backgroundColor: meta.badge === 'New' ? '#1F1F1F' : COLORS.primary }]}>
              <Text style={styles.bBadgeT}>{meta.badge}</Text>
            </View>
          )}
          <View style={styles.rateChip}>
            <Ionicons name="star" size={10} color={COLORS.warning} />
            <Text style={styles.bRateT}>{d.rating}</Text>
          </View>
          <View pointerEvents="box-none" style={styles.favHeartLayer}>
            <Animated.View style={{ transform: [{ scale: pop }] }}>
              <TouchableOpacity style={styles.bHeartBtn} onPress={pressHeart}>
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={16} color={fav ? COLORS.primary : COLORS.secondaryText} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
        <View style={styles.favBody}>
          <Text style={styles.favName} numberOfLines={1}>{d.name}</Text>
          <Text style={styles.favRest} numberOfLines={1}>{meta.restaurant}</Text>
          <View style={styles.bInfo} numberOfLines={1}>
            <View style={styles.freeChip}><Text style={styles.freeChipT} numberOfLines={1}>Free delivery</Text></View>
            <Ionicons name="time-outline" size={12} color={COLORS.secondaryText} />
            <Text style={styles.favMeta} numberOfLines={1}>{d.time.replace('–', '-').replace(' mins', ' min')}</Text>
            <Text style={styles.favMeta}>•</Text>
            <Text style={styles.favMeta} numberOfLines={1}>{meta.distance}</Text>
          </View>
          <View style={styles.favTags}>
            {d.tags.slice(0, 3).map((t) => <View key={t} style={styles.favTag}><Text style={styles.favTagT}>{t}</Text></View>)}
          </View>
          <View style={styles.favFoot}>
            <Text style={styles.favPrice}>{peso(d.price)}</Text>
            {qty > 0 ? <QtyStepper id={d.id} /> : (
              <TouchableOpacity onPress={quickAdd}>
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.favAdd}>
                  <Ionicons name={ticked ? 'checkmark' : 'add'} size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function PriceSlider({ value, min, max, onChange }) {
  const [tw, setTw] = useState(0);
  const setFromX = (x) => {
    const ratio = Math.max(0, Math.min(1, x / (tw || 1)));
    onChange(Math.round((min + ratio * (max - min)) / 10) * 10);
  };
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <View style={styles.sliderRow}>
      <Text style={styles.sliderEnd}>{peso(min)}</Text>
      <View
        style={styles.sliderTrack}
        onLayout={(e) => setTw(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(e) => setFromX(e.nativeEvent.locationX)}
        onResponderMove={(e) => setFromX(e.nativeEvent.locationX)}
      >
        <View style={styles.sliderTrackBg} />
        <View style={[styles.sliderFill, { width: `${pct}%` }]} />
        <View style={[styles.sliderThumb, { left: `${pct}%` }]} />
      </View>
      <Text style={styles.sliderEnd}>{peso(max)}</Text>
    </View>
  );
}

function SkeletonCard({ cardStyle }) {
  const p = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 700, useNativeDriver: false }),
      Animated.timing(p, { toValue: 0.45, duration: 700, useNativeDriver: false }),
    ])).start();
  }, [p]);
  return (
    <Animated.View style={[styles.bCard, cardStyle, { opacity: p }]}>
      <View style={styles.skelImg} />
      <View style={styles.skelLine} />
      <View style={[styles.skelLine, { width: '60%' }]} />
      <View style={[styles.skelLine, { width: '40%' }]} />
    </Animated.View>
  );
}

export function BrowseScreen({ onOpenDish, onCheckout }) {
  const { dishes, cart, add } = useStore();
  const { width } = useWindowDimensions();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState(SORTS_B[0]);
  const [sortOpen, setSortOpen] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [under200, setUnder200] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [maxPrice, setMaxPrice] = useState(600);
  const [sheetDish, setSheetDish] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('Regular');
  const [picked, setPicked] = useState([]);
  const [sheetQty, setSheetQty] = useState(1);
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((a, [id, n]) => {
    const d = dishes.find((x) => x.id === id);
    return a + (d ? d.price * n : 0);
  }, 0);
  useEffect(() => {
    Animated.timing(barAnim, { toValue: cartCount > 0 ? 1 : 0, duration: 280, useNativeDriver: false }).start();
  }, [cartCount, barAnim]);

  const filtered = dishes.filter((d) => {
    if (cat !== 'All' && !d.tags.join(' ').toLowerCase().includes(cat.toLowerCase())) return false;
    if (!d.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
    if (freeOnly && d.ship !== 'Free ship') return false;
    if (under200 && d.price >= 200) return false;
    if (topRated && d.rating < 4.8) return false;
    if (d.price > maxPrice) return false;
    return true;
  });
  const list = [...filtered].sort((a, b) => {
    if (sort === 'Rating') return b.rating - a.rating;
    if (sort === 'Price low to high') return a.price - b.price;
    if (sort === 'Price high to low') return b.price - a.price;
    if (sort === 'Fastest delivery') return minsOf(a) - minsOf(b);
    return 0;
  });

  const cols = width >= 1180 ? 3 : width >= 760 ? 2 : 1;
  const cardStyle = cols === 3 ? { width: '31.8%' } : cols === 2 ? { width: '48.4%' } : { width: '100%' };
  const clearAll = () => { setQ(''); setCat('All'); setSort(SORTS_B[0]); setFreeOnly(false); setUnder200(false); setTopRated(false); setMaxPrice(600); };
  const openSheet = (d) => { setSheetDish(d); setSize('Regular'); setPicked([]); setSheetQty(1); };
  const sheetTotal = sheetDish ? (sheetDish.price + (size === 'Large' ? 60 : 0) + picked.reduce((a, n) => a + (ADDONS.find((x) => x.name === n) || { price: 0 }).price, 0)) * sheetQty : 0;

  const toggles = [
    { label: 'Free delivery', on: freeOnly, set: setFreeOnly },
    { label: 'Under ₱200', on: under200, set: setUnder200 },
    { label: 'Top rated 4.8+', on: topRated, set: setTopRated },
  ];

  return (
    <View style={styles.bWrap}>
      <LinearGradient colors={['#FFF4EC', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.blobTR} />
        <View style={styles.blobBL} />
      </View>
      <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
        <View style={styles.bSticky}>
          <View style={[styles.pageHead, { paddingBottom: 16 }]}>
            <View>
              <Text style={styles.pageTitle}>Explore Menu</Text>
              <Text style={styles.pageSub}>{list.length} dishes near {user.address}</Text>
            </View>
            <View style={styles.bSearchRow}>
              <View style={styles.search}>
                <Ionicons name="search-outline" size={16} color={COLORS.secondaryText} />
                <TextInput value={q} onChangeText={setQ} placeholder="Search dishes..." placeholderTextColor={COLORS.muted} style={styles.input} />
                {q.length > 0 && (
                  <TouchableOpacity onPress={() => setQ('')}><Ionicons name="close-circle" size={16} color={COLORS.muted} /></TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
                <Ionicons name="options-outline" size={17} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chipZone}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsB}>
              {categories.map((c) => {
                const CatIcon = CAT_ICONS[c] || LayoutGrid;
                const sel = cat === c;
                const tint = sel ? '#fff' : '#555';
                return (
                  <TouchableOpacity key={c} onPress={() => setCat(c)} style={styles.chipWrap}>
                    {sel ? (
                      <LinearGradient colors={['#FF8A3D', '#E8541A']} style={[styles.chipA, styles.chipRow]}>
                        <CatIcon size={16} color={tint} />
                        <Text style={styles.chipAT}>{c}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.chipB, styles.chipRow]}><CatIcon size={16} color={tint} /><Text style={styles.chipBT}>{c}</Text></View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <LinearGradient colors={['rgba(255,244,236,0)', 'rgba(255,244,236,0.95)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipFade} pointerEvents="none" />
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.resultCount}>{list.length} dishes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.toggleRow2}>
            {toggles.map((t) => (
              <TouchableOpacity key={t.label} onPress={() => t.set(!t.on)} style={styles.chipWrap}>
                <View style={[styles.toggle, t.on && styles.toggleOn]}>
                  {t.on && <Ionicons name="checkmark" size={12} color={COLORS.primary} />}
                  <Text style={[styles.toggleT, t.on && styles.toggleTOn]}>{t.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View>
            <TouchableOpacity style={styles.sortBtn} onPress={() => setSortOpen(!sortOpen)}>
              <Ionicons name="swap-vertical-outline" size={13} color={COLORS.primary} />
              <Text style={styles.sortT} numberOfLines={1}>{sort}</Text>
              <Ionicons name={sortOpen ? 'chevron-up' : 'chevron-down'} size={13} color={COLORS.secondaryText} />
            </TouchableOpacity>
            {sortOpen && (
              <View style={styles.sortMenu}>
                {SORTS_B.map((s) => (
                  <TouchableOpacity key={s} style={styles.sortOpt} onPress={() => { setSort(s); setSortOpen(false); }}>
                    <Text style={[styles.sortOptT, sort === s && { color: COLORS.primary, fontFamily: FONTS.bold }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.bGrid}>{[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} cardStyle={cardStyle} />)}</View>
        ) : list.length > 0 ? (
          <View style={styles.bGrid}>
            {list.map((d, i) => (
              <BrowseCard key={d.id} d={d} meta={BROWSE_META[d.id] || { restaurant: 'Local kitchen', distance: '1.0 km' }} index={i} cardStyle={cardStyle} onSheet={openSheet} />
            ))}
          </View>
        ) : (
          <View style={styles.favEmpty}>
            <View style={styles.favEmptyIcon}><Ionicons name="search-outline" size={32} color={COLORS.primary} /></View>
            <Text style={styles.favEmptyT}>No dishes found</Text>
            <Text style={styles.favEmptyS}>Try a different search or adjust your filters.</Text>
            <TouchableOpacity onPress={clearAll}>
              <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.browseBtn}>
                <Text style={styles.browseBtnT}>Clear filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Animated.View style={[styles.cartBar, { transform: [{ translateY: barAnim.interpolate({ inputRange: [0, 1], outputRange: [90, 0] }) }] }]} pointerEvents={cartCount > 0 ? 'auto' : 'none'}>
        <TouchableOpacity style={styles.cartBarBtn} onPress={onCheckout}>
          <Text style={styles.cartBarT}>{cartCount} items • {peso(cartTotal)}</Text>
          <Text style={styles.cartBarT}>View cart  →</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={!!sheetDish} transparent animationType="slide" onRequestClose={() => setSheetDish(null)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSheetDish(null)} activeOpacity={1} />
          {sheetDish && (
            <SafeAreaView style={styles.mealSheet} edges={['top', 'bottom']}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
                <View style={styles.sheetHero}>
                  <FoodImage dish={sheetDish.id} size="hero" shade style={StyleSheet.absoluteFill} />
                  <TouchableOpacity style={styles.sheetX} onPress={() => setSheetDish(null)}><Ionicons name="close" size={17} color={COLORS.text} /></TouchableOpacity>
                </View>
                <Text style={styles.sheetName}>{sheetDish.name}</Text>
                <Text style={styles.sheetMeta}>⭐ {sheetDish.rating} • {sheetDish.time} • {sheetDish.calories} cal</Text>
                <Text style={styles.sheetDesc}>{sheetDish.desc}</Text>
                <Text style={styles.sheetSec}>Size</Text>
                <View style={styles.sizeRow}>
                  {['Regular', 'Large +₱60'].map((s) => {
                    const base = s.split(' ')[0];
                    const sel = size === base;
                    return (
                      <TouchableOpacity key={s} style={[styles.sizeOpt, sel && styles.sizeSel]} onPress={() => setSize(base)}>
                        <Text style={[styles.sizeT, sel && styles.sizeTSel]}>{s}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.sheetSec}>Add-ons</Text>
                {ADDONS.map((ad) => {
                  const on = picked.includes(ad.name);
                  return (
                    <TouchableOpacity key={ad.name} style={styles.addonRow} onPress={() => setPicked(on ? picked.filter((x) => x !== ad.name) : [...picked, ad.name])}>
                      <View style={[styles.checkbox, on && styles.checkboxOn]}>
                        {on && <Ionicons name="checkmark" size={13} color="#fff" />}
                      </View>
                      <Text style={styles.addonN}>{ad.name}</Text>
                      <Text style={styles.addonP}>+{peso(ad.price)}</Text>
                    </TouchableOpacity>
                  );
                })}
                <View style={styles.sheetFoot}>
                  <Text style={styles.sheetQtyLabel}>Quantity</Text>
                  <View style={styles.stepBtns}>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setSheetQty(Math.max(1, sheetQty - 1))}><Ionicons name="remove" size={15} color={COLORS.text} /></TouchableOpacity>
                    <Text style={styles.stepQ}>{sheetQty}</Text>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setSheetQty(sheetQty + 1)}><Ionicons name="add" size={15} color={COLORS.text} /></TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
              <View style={styles.sheetFootPinned}>
                <TouchableOpacity onPress={() => { add(sheetDish.id, sheetQty); setSheetDish(null); }}>
                  <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.sheetAddPinned}>
                    <Text style={styles.sheetAddT}>Add to cart {peso(sheetTotal)}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          )}
        </View>
      </Modal>

      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <View style={Platform.OS === 'web' ? styles.popOverlay : styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setFilterOpen(false)} activeOpacity={1} />
          <View style={Platform.OS === 'web' ? styles.popover : styles.sheet}>
            <View style={styles.filterHead}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={() => { clearAll(); }}><Text style={styles.clearAll}>Clear all</Text></TouchableOpacity>
              <TouchableOpacity style={styles.backX} onPress={() => setFilterOpen(false)}>
                <Ionicons name="close" size={16} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.maxLabel}>Max price: {peso(maxPrice)}</Text>
            <PriceSlider value={maxPrice} min={100} max={600} onChange={setMaxPrice} />
            {toggles.map((t) => (
              <TouchableOpacity key={t.label} style={styles.filterToggle} onPress={() => t.set(!t.on)}>
                <Text style={styles.filterToggleT}>{t.label}</Text>
                <View style={[styles.switch, t.on && styles.switchOn]}>
                  <View style={[styles.knob, t.on && styles.knobOn]} />
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setFilterOpen(false)}>
              <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.sheetAdd}>
                <Text style={styles.sheetAddT}>Show {list.length} dishes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---- FAVORITES ----
const BUKO_PANDAN = { id: 'dx-buko', name: 'Buko Pandan', price: 119, rating: 4.7, time: '10–15 mins', ship: 'Free ship', tags: ['DESSERTS', 'DRINKS'], emoji: '🥥', tint: '#E6F7E9', calories: 260, desc: 'Creamy coconut salad with pandan jelly and sago pearls.' };
const FAV_META = {
  d1: { restaurant: 'Kusina ni Juan', distance: '1.2 km' },
  d3: { restaurant: 'Palabok House', distance: '0.8 km' },
  d7: { restaurant: 'Halo-Halo Station', distance: '1.5 km' },
  d5: { restaurant: 'Kusina ni Juan', distance: '1.2 km' },
  d2: { restaurant: 'Sisig House QC', distance: '2.1 km' },
  d6: { restaurant: 'Inasal Express', distance: '1.7 km' },
  d10: { restaurant: 'Lechon Republic', distance: '2.4 km' },
  'dx-buko': { restaurant: 'Halo-Halo Station', distance: '1.5 km' },
};
const FAV_CATS = ['All', 'Rice Meals', 'Noodles', 'Desserts', 'Drinks'];
const SORTS = ['Recently added', 'Price low to high', 'Top rated'];
const RECO_IDS = ['d4', 'd8', 'd11', 'd12', 'd9'];

function FavCard({ d, meta, index, cardStyle, onOpen, onRemoved }) {
  const { add } = useStore();
  const a = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);
  const [ticked, setTicked] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 450, delay: Math.min(index, 8) * 70, useNativeDriver: false }).start();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [a, index]);
  const remove = () => {
    Animated.sequence([
      Animated.timing(pop, { toValue: 0.7, duration: 110, useNativeDriver: false }),
      Animated.timing(pop, { toValue: 1, duration: 160, useNativeDriver: false }),
    ]).start(() => onRemoved(d));
  };
  const quickAdd = () => {
    add(d.id, 1);
    setTicked(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTicked(false), 1200);
  };
  return (
    <Animated.View style={[styles.favCard, cardStyle, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }, { scale: hovered ? 1.03 : 1 }] }]}>
      <TouchableOpacity activeOpacity={0.92} onPress={() => onOpen(d)} onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}>
        <View style={[styles.favImg, { overflow: 'hidden' }]}>
          <FoodImage dish={d.id} size="card" shade style={StyleSheet.absoluteFill} />
          <View style={styles.rateChip}>
            <Ionicons name="star" size={10} color={COLORS.warning} />
            <Text style={styles.rateChipT}>{d.rating}</Text>
          </View>
          <View pointerEvents="box-none" style={styles.favHeartLayer}>
            <Animated.View style={{ transform: [{ scale: pop }] }}>
              <TouchableOpacity style={styles.favHeartBtn} onPress={remove}>
                <Ionicons name="heart" size={15} color={COLORS.primary} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
        <View style={styles.favBody}>
          <Text style={styles.favName} numberOfLines={1}>{d.name}</Text>
          <Text style={styles.favRest} numberOfLines={1}>{meta.restaurant}</Text>
          <View style={styles.favInfo}>
            <View style={styles.freeChip}><Text style={styles.freeChipT}>Free delivery</Text></View>
            <Ionicons name="time-outline" size={12} color={COLORS.secondaryText} />
            <Text style={styles.favMeta}>{d.time}</Text>
          </View>
          <Text style={styles.favDist}>{meta.distance} away</Text>
          <View style={styles.favTags}>
            {d.tags.slice(0, 3).map((t) => <View key={t} style={styles.favTag}><Text style={styles.favTagT}>{t}</Text></View>)}
          </View>
          <View style={styles.favFoot}>
            <Text style={styles.favPrice}>{peso(d.price)}</Text>
            <TouchableOpacity onPress={quickAdd}>
              <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.favAdd}>
                <Ionicons name={ticked ? 'checkmark' : 'add'} size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function RecCard({ d, onOpen }) {
  const { favorites, toggleFav, add } = useStore();
  const fav = favorites.includes(d.id);
  return (
    <View style={styles.recCard}>
      <TouchableOpacity onPress={() => onOpen(d)}>
        <FoodImage dish={d.id} size="card" style={styles.recImg} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.recHeart} onPress={() => toggleFav(d.id)}>
        <Ionicons name={fav ? 'heart' : 'heart-outline'} size={14} color={fav ? COLORS.primary : COLORS.secondaryText} />
      </TouchableOpacity>
      <Text style={styles.recName} numberOfLines={1}>{d.name}</Text>
      <View style={styles.recFoot}>
        <Text style={styles.recPrice}>{peso(d.price)}</Text>
        <TouchableOpacity onPress={() => add(d.id, 1)}>
          <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.recAdd}>
            <Ionicons name="add" size={13} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function FavoritesScreen({ onOpenDish, onBrowse }) {
  const { favorites, toggleFav, add } = useStore();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState(SORTS[0]);
  const [sortOpen, setSortOpen] = useState(false);
  const [snack, setSnack] = useState(null);

  useEffect(() => {
    if (!snack) return undefined;
    const t = setTimeout(() => setSnack(null), 3200);
    return () => clearTimeout(t);
  }, [snack]);

  const all = favorites
    .map((id) => (id === BUKO_PANDAN.id ? BUKO_PANDAN : dishes.find((d) => d.id === id)))
    .filter(Boolean);
  const orderOf = (id) => favorites.indexOf(id);
  const filtered = all.filter((d) => {
    const hay = `${d.name} ${(FAV_META[d.id] || {}).restaurant || ''}`.toLowerCase();
    const okQ = hay.includes(q.trim().toLowerCase());
    const okC = cat === 'All' || d.tags.join(' ').toLowerCase().includes(cat.toLowerCase());
    return okQ && okC;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Price low to high') return a.price - b.price;
    if (sort === 'Top rated') return b.rating - a.rating;
    return orderOf(b.id) - orderOf(a.id);
  });

  const cols = width >= 1180 ? 3 : width >= 760 ? 2 : 1;
  const cardStyle = cols === 3 ? { width: '31.8%' } : cols === 2 ? { width: '48.4%' } : { width: '100%' };
  const reco = RECO_IDS.map((id) => dishes.find((d) => d.id === id)).filter((d) => d && !favorites.includes(d.id)).slice(0, 5);

  const removeWithUndo = (d) => {
    toggleFav(d.id);
    setSnack(d);
  };
  const undo = () => {
    if (snack) toggleFav(snack.id);
    setSnack(null);
  };
  const reorderAll = () => all.forEach((d) => add(d.id, 1));
  const emptySearch = all.length > 0 && sorted.length === 0;

  return (
    <View style={styles.favWrap}>
      <LinearGradient colors={['#FFF4EC', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.blobTR} />
        <View style={styles.blobBL} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.favContent} showsVerticalScrollIndicator={false}>
        <View style={styles.favHead}>
          <View>
            <Text style={styles.pageTitle}>Favorites</Text>
            <Text style={styles.pageSub}>{all.length} saved {all.length === 1 ? 'dish' : 'dishes'}</Text>
          </View>
          <View style={styles.favSearch}>
            <Ionicons name="search-outline" size={15} color={COLORS.secondaryText} />
            <TextInput value={q} onChangeText={setQ} placeholder="Search your favorites" placeholderTextColor={COLORS.muted} style={styles.input} />
          </View>
        </View>

        <View style={styles.favBar}>
          <View style={{ flex: 1, position: 'relative' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 2 }}>
              {FAV_CATS.map((c) => {
                const FIcon = CAT_ICONS[c] || LayoutGrid;
                const sel = cat === c;
                const tint = sel ? '#fff' : '#555';
                return (
                  <TouchableOpacity key={c} onPress={() => setCat(c)} style={styles.chipWrap}>
                    {sel ? (
                      <LinearGradient colors={['#FF8A3D', '#E8541A']} style={[styles.chipA, styles.chipRow]}>
                        <FIcon size={16} color={tint} />
                        <Text style={styles.chipAT}>{c}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.chipB, styles.chipRow]}><FIcon size={16} color={tint} /><Text style={styles.chipBT}>{c}</Text></View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <LinearGradient colors={['rgba(255,244,236,0)', 'rgba(255,244,236,0.95)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chipFade} pointerEvents="none" />
          </View>
          <View>
            <TouchableOpacity style={styles.sortBtn} onPress={() => setSortOpen(!sortOpen)}>
              <Ionicons name="funnel-outline" size={13} color={COLORS.primary} />
              <Text style={styles.sortT} numberOfLines={1}>{sort}</Text>
              <Ionicons name={sortOpen ? 'chevron-up' : 'chevron-down'} size={13} color={COLORS.secondaryText} />
            </TouchableOpacity>
            {sortOpen && (
              <View style={styles.sortMenu}>
                {SORTS.map((s) => (
                  <TouchableOpacity key={s} style={styles.sortOpt} onPress={() => { setSort(s); setSortOpen(false); }}>
                    <Text style={[styles.sortOptT, sort === s && { color: COLORS.primary, fontFamily: FONTS.bold }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {sorted.length > 0 && (
          <View style={styles.gridHead}>
            <Text style={styles.gridTitle}>Saved dishes</Text>
            <TouchableOpacity style={styles.reorderAll} onPress={reorderAll}>
              <Ionicons name="refresh-outline" size={13} color={COLORS.primary} />
              <Text style={styles.reorderAllT}>Reorder all available</Text>
            </TouchableOpacity>
          </View>
        )}

        {sorted.length > 0 ? (
          <View style={styles.favGrid}>
            {sorted.map((d, i) => (
              <FavCard key={d.id} d={d} meta={FAV_META[d.id] || { restaurant: 'Local kitchen', distance: '1.0 km' }} index={i} cardStyle={cardStyle} onOpen={onOpenDish} onRemoved={removeWithUndo} />
            ))}
          </View>
        ) : (
          <View style={styles.favEmpty}>
            <View style={styles.favEmptyIcon}><Ionicons name="heart-outline" size={34} color={COLORS.primary} /></View>
            <Text style={styles.favEmptyT}>{emptySearch ? 'No matches found' : 'No favorites yet'}</Text>
            <Text style={styles.favEmptyS}>{emptySearch ? 'Try a different search or category.' : 'Tap the heart on any dish to save it here.'}</Text>
            {!emptySearch && (
              <TouchableOpacity onPress={onBrowse}>
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.browseBtn}>
                  <Text style={styles.browseBtnT}>Browse menu</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        {reco.length > 0 && (
          <View style={styles.recoWrap}>
            <Text style={styles.gridTitle}>Recommended for you</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
              {reco.map((d) => <RecCard key={d.id} d={d} onOpen={onOpenDish} />)}
            </ScrollView>
          </View>
        )}
      </ScrollView>
      {snack && (
        <View style={styles.snack}>
          <Text style={styles.snackT} numberOfLines={1}>Removed {snack.name}</Text>
          <TouchableOpacity onPress={undo}><Text style={styles.snackUndo}>Undo</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ---- MY ORDERS + LIVE TRACKING ----
const PAST_ORDERS = [
  { id: '#ORD-8417', date: 'Yesterday, 7:15 PM', items: ['Halo-Halo Special x1', 'lumpiang Shanghai x1'], total: 308, status: 'Delivered' },
  { id: '#ORD-8409', date: 'Sep 26, 6:42 PM', items: ['Sinigang na Baboy x1', 'Buko Juice x2'], total: 447, status: 'Delivered' },
  { id: '#ORD-8398', date: 'Sep 23, 12:15 PM', items: ['Crispy Sisig x1', 'Leche Flan x1'], total: 358, status: 'Delivered' },
  { id: '#ORD-8385', date: 'Sep 20, 7:30 PM', items: ['Chicken Inasal x2', 'Buko Juice x1'], total: 497, status: 'Delivered' },
  { id: '#ORD-8371', date: 'Sep 17, 1:05 PM', items: ['Halo-Halo Special x2'], total: 298, status: 'Delivered' },
];

const STEPS = [
  { label: 'Order placed', time: '12:40', state: 'done' },
  { label: 'Preparing', time: '12:44', state: 'done' },
  { label: 'Rider picked up', time: '12:52', state: 'current' },
  { label: 'Delivered', time: 'ETA 12:58', state: 'next' },
];

const DETAIL_ITEMS = ['Chicken Adobo Meal x2', 'Buko Juice x1'];

function thumbFor(items, dishes) {
  const raw = (items[0] || '').split(' x')[0];
  return dishes.find((d) => d.name === raw) || dishes[0];
}

function parseLine(raw, dishes) {
  const m = (raw || '').match(/^(.*) x(\d+)$/);
  const d = m ? dishes.find((x) => x.name === m[1]) : null;
  return { name: m ? m[1] : raw, qty: m ? parseInt(m[2], 10) || 1 : 1, price: d ? d.price : 0 };
}

function Stepper() {
  const fill = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fill, { toValue: 1, duration: 1400, useNativeDriver: false }).start();
    Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: false })).start();
  }, [fill, pulse]);
  return (
    <View style={styles.stepList}>
      {STEPS.map((s, i) => {
        const last = i === STEPS.length - 1;
        const nextUp = !last && STEPS[i + 1].state === 'next';
        return (
          <View key={s.label} style={styles.stepRow}>
            <View style={styles.stepRail}>
              {s.state === 'done' && <View style={styles.dotDone}><Ionicons name="checkmark" size={12} color="#fff" /></View>}
              {s.state === 'current' && (
                <View style={styles.dotCurWrap}>
                  <Animated.View style={[styles.pulseRing, {
                    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
                    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                  }]} />
                  <View style={styles.dotCur} />
                </View>
              )}
              {s.state === 'next' && <View style={styles.dotNext} />}
              {!last && (nextUp
                ? <View style={styles.linkDashed} />
                : <View style={styles.linkTrack}>
                    <Animated.View style={[styles.linkFill, { height: fill.interpolate({ inputRange: [0, 1], outputRange: [0, 30] }) }]} />
                  </View>)}
            </View>
            <View style={styles.stepText}>
              <Text style={[styles.stepLabel, s.state === 'next' && { color: COLORS.text }]}>{s.label}</Text>
              <Text style={styles.stepTime}>{s.time}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function HistoryCard({ h, index, onReorder }) {
  const { dishes } = useStore();
  const [rated, setRated] = useState(false);
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 450, delay: index * 90, useNativeDriver: false }).start();
  }, [a, index]);
  const d = thumbFor(h.items, dishes);
  const delivered = h.status === 'Delivered';
  return (
    <Animated.View style={[styles.hCard, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
      <View style={styles.hTop}>
        <FoodImage dish={d.id} size="thumb" />
        <View style={{ flex: 1 }}>
          <Text style={styles.hId}>{h.id}</Text>
          <Text style={styles.hDate}>{h.date}</Text>
        </View>
        <Text style={styles.hTotal}>{peso(h.total)}</Text>
      </View>
      <Text style={styles.hItems} numberOfLines={2}>{h.items.join('  •  ')}</Text>
      <View style={styles.hFoot}>
        <View style={[styles.status, { backgroundColor: delivered ? '#E8F9EF' : '#F0F1F3' }]}>
          <Text style={[styles.statusT, { color: delivered ? COLORS.success : COLORS.secondaryText }]}>{h.status}</Text>
        </View>
        <View style={{ flex: 1 }} />
        {delivered && (
          <TouchableOpacity style={styles.rateBtn} onPress={() => setRated(!rated)}>
            <Ionicons name={rated ? 'star' : 'star-outline'} size={14} color={rated ? COLORS.warning : COLORS.secondaryText} />
            <Text style={styles.rateT}>{rated ? 'Rated' : 'Rate'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.reorderPill} onPress={() => onReorder(h)}>
          <Text style={styles.reorderPillT}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export function OrdersScreen({ goBrowse }) {
  const { history, add, dishes } = useStore();
  const [tab, setTab] = useState('Active');
  const [expanded, setExpanded] = useState(false);
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 500, useNativeDriver: false }).start();
  }, [enter]);

  const reorder = (h) => {
    h.items.forEach((raw) => {
      const p = parseLine(raw, dishes);
      const d = dishes.find((x) => x.name === p.name);
      if (d) add(d.id, p.qty);
    });
    goBrowse();
  };

  const extra = history.filter((h) => h.id !== '#ORD-8421' && h.id !== '#ORD-8417');
  const activeOnes = extra.filter((h) => h.status !== 'Delivered' && h.status !== 'Cancelled');
  const delivered = [...extra.filter((h) => h.status === 'Delivered'), ...PAST_ORDERS];
  const cancelled = extra.filter((h) => h.status === 'Cancelled');
  const shown = tab === 'Active' ? activeOnes : tab === 'Completed' ? delivered : cancelled;
  const detailLines = DETAIL_ITEMS.map((raw) => parseLine(raw, dishes));
  const detailSub = detailLines.reduce((a, x) => a + x.price * x.qty, 0);

  return (
    <View style={styles.orderWrap}>
      <LinearGradient colors={['#FFF4EC', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.blobTR} />
        <View style={styles.blobBL} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.orderContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>My Orders</Text>
        <Text style={styles.pageSub}>Live tracking + history</Text>
        <View style={styles.tabs}>
          {['Active', 'Completed', 'Cancelled'].map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}>
              {tab === t ? (
                <LinearGradient colors={['#FF8A3D', '#E8541A']} style={styles.tabA}><Text style={styles.tabAT}>{t}</Text></LinearGradient>
              ) : (
                <View style={styles.tab}><Text style={styles.tabT}>{t}</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View style={[styles.trackCard2, { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
          <View style={styles.trackHead}>
            <View style={{ flex: 1 }}>
              <Text style={styles.trackId}>#ORD-8421 • On the way 🛵</Text>
              <Text style={styles.trackSub}>Kuya Marco • 6 min away • 2.3 km</Text>
            </View>
            <LinearGradient colors={['#FF8A3D', '#E8541A']} style={styles.eta}>
              <Text style={styles.etaNum}>12:58</Text>
              <Text style={styles.etaSmall}>ETA</Text>
            </LinearGradient>
          </View>
          <View style={styles.riderRow}>
            <View style={styles.riderAv}><Text style={styles.riderAvT}>KM</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.riderName}>Kuya Marco</Text>
              <Text style={styles.riderSub}>Your rider • 4.9 ★</Text>
            </View>
            <TouchableOpacity style={styles.contactBtn}><Ionicons name="call-outline" size={17} color={COLORS.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn}><Ionicons name="chatbubble-ellipses-outline" size={17} color={COLORS.primary} /></TouchableOpacity>
          </View>
          <OrderMap
            restaurant={MAP_POINTS.restaurant}
            destination={MAP_POINTS.destination}
            rider={MAP_POINTS.riderStart}
            etaMinutes={6}
            distanceKm={2.3}
          />
          <Stepper />
          <TouchableOpacity style={styles.detailsRow} onPress={() => setExpanded(!expanded)}>
            <Ionicons name="receipt-outline" size={15} color={COLORS.primary} />
            <Text style={styles.detailsT}>Order details</Text>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.secondaryText} />
          </TouchableOpacity>
          {expanded && (
            <View style={styles.detailsBox}>
              {detailLines.map((x) => {
                const dd = dishes.find((y) => y.name === x.name);
                return (
                  <View key={x.name} style={styles.detailLineImg}>
                    <FoodImage dish={dd ? dd.id : undefined} size="thumb" style={styles.detailThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailK}>{x.name} x{x.qty}</Text>
                    </View>
                    <Text style={styles.detailV}>{peso(x.price * x.qty)}</Text>
                  </View>
                );
              })}
              <View style={styles.detailLine}><Text style={styles.detailK}>Subtotal</Text><Text style={styles.detailV}>{peso(detailSub)}</Text></View>
              <View style={styles.detailLine}><Text style={styles.detailK}>Delivery fee</Text><Text style={styles.discFree}>FREE</Text></View>
              <View style={styles.detailTotal}><Text style={styles.detailTotalK}>Total</Text><Text style={styles.detailTotalV}>{peso(detailSub)}</Text></View>
            </View>
          )}
        </Animated.View>

        <Text style={styles.secTitle}>{tab === 'Active' ? 'Active orders' : tab === 'Completed' ? 'History' : 'Cancelled orders'}</Text>
        {tab === 'Active' && activeOnes.length === 0 && (
          <Text style={styles.activeNote}>Only #ORD-8421 is on the way — you're all caught up.</Text>
        )}
        {tab === 'Cancelled' && cancelled.length === 0 && (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}><Ionicons name="ban-outline" size={30} color={COLORS.primary} /></View>
            <Text style={styles.emptyT}>No cancelled orders</Text>
            <Text style={styles.emptyS}>Cancelled orders will show up here.</Text>
          </View>
        )}
        {shown.map((h, i) => <HistoryCard key={h.id} h={h} index={i} onReorder={reorder} />)}
      </ScrollView>
    </View>
  );
}

// ---- OFFERS & REWARDS ----
const OFFER_TABS = ['All', 'Discounts', 'Free Delivery', 'Lunch', 'Expiring Soon'];
const OFFERS = [
  { code: 'PINOY20', title: '20% off your order', desc: 'First checkout with a minimum order of ₱500.', expiry: 'Expires in 30 hours', expiresH: 30, minOrder: 500, pct: 20, cat: 'Discounts', icon: 'pricetag-outline', tint: '#FFE9D6', terms: 'Valid for first-time checkout only. Minimum order ₱500. Cannot be combined with other coupons.' },
  { code: 'FREEDEL', title: 'Free delivery weekend', desc: 'Zero service fee on all orders this weekend.', expiry: 'Expires in 2 days', expiresH: 50, minOrder: 0, pct: 0, cat: 'Free Delivery', icon: 'bicycle-outline', tint: '#E6F7E9', terms: 'Covers the standard delivery fee up to ₱49. Valid Saturday to Sunday.' },
  { code: 'LUNCH15', title: '15% off lunch 11am–2pm', desc: 'Weekday lunch orders with a minimum of ₱300.', expiry: 'Expires in 26 hours', expiresH: 26, minOrder: 300, pct: 15, cat: 'Lunch', icon: 'time-outline', tint: '#FFF3D6', terms: 'Valid Monday to Friday, 11:00 AM to 2:00 PM. Minimum order ₱300.' },
  { code: 'BUY1TAKE1', title: 'Buy 1 Take 1 on Halo-Halo', desc: 'Two Halo-Halo Specials for the price of one.', expiry: 'Expires in 3 days', expiresH: 72, minOrder: 0, pct: 0, cat: 'Discounts', icon: 'pricetag-outline', tint: '#F3E8FF', terms: 'Applies to Halo-Halo Special only. The lower-priced item is free.' },
  { code: 'SISIG50', title: '₱50 off Sisig', desc: 'Crispy Sisig cravings with a minimum order of ₱400.', expiry: 'Expires in 20 hours', expiresH: 20, minOrder: 400, flat: 50, cat: 'Discounts', icon: 'pricetag-outline', tint: '#FFE9D6', terms: '₱50 off when your cart includes Crispy Sisig. Minimum order ₱400.' },
  { code: 'NEWUSER100', title: '₱100 off for first order', desc: 'Welcome treat for new accounts, min. order ₱600.', expiry: 'Expires in 4 days', expiresH: 96, minOrder: 600, flat: 100, cat: 'Discounts', icon: 'gift-outline', tint: '#E8F6FF', terms: 'New accounts only. Minimum order ₱600. One use per account.' },
];
const POINTS_ROWS = [
  { date: 'Sep 28', order: '#ORD-8421', pts: 120 },
  { date: 'Sep 26', order: '#ORD-8417', pts: 95 },
  { date: 'Sep 23', order: '#ORD-8398', pts: 80 },
];

function OfferCard({ o, index, subtotal, applied, onUse, onCopy, copied, expanded, onTerms }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 420, delay: Math.min(index, 6) * 80, useNativeDriver: false }).start();
  }, [a, index]);
  const usable = o.expiresH > 0 && subtotal >= o.minOrder;
  const urgent = o.expiresH < 48;
  return (
    <Animated.View style={[styles.ticket, !usable && { opacity: 0.6 }, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
      <View style={styles.notchL} />
      <View style={styles.notchR} />
      <View style={styles.ticketLeft}>
        <View style={[styles.ticketIcon, { backgroundColor: o.tint }]}>
          <Ionicons name={o.icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.codeChip}><Text style={styles.codeChipT}>{o.code}</Text></View>
      </View>
      <View style={styles.ticketDiv} />
      <View style={styles.ticketMid}>
        <Text style={styles.ticketTitle}>{o.title}</Text>
        <Text style={styles.ticketDesc}>{o.desc}</Text>
        <View style={styles.expiryRow}>
          <Ionicons name="time-outline" size={11} color={urgent ? COLORS.primary : COLORS.secondaryText} />
          <Text style={[styles.expiryT, urgent && { color: COLORS.primary, fontFamily: FONTS.bold }]}>{o.expiry}</Text>
        </View>
        {!usable && (
          <Text style={styles.unusableT}>{o.expiresH <= 0 ? 'Expired' : `Add ${peso(o.minOrder - subtotal)} more to use`}</Text>
        )}
        <TouchableOpacity onPress={onTerms}><Text style={styles.termsLink}>{expanded ? 'Hide terms' : 'Terms'}</Text></TouchableOpacity>
        {expanded && <Text style={styles.termsT}>{o.terms}</Text>}
      </View>
      <View style={styles.ticketRight}>
        {applied ? (
          <View style={styles.appliedBtn}><Text style={styles.appliedBtnT}>Applied ✓</Text></View>
        ) : (
          <TouchableOpacity onPress={onUse} disabled={!usable}>
            <LinearGradient colors={usable ? ['#FF8A3D', '#E8541A'] : ['#D5D8DD', '#B9BEC6']} style={styles.useBtn2}>
              <Text style={styles.useBtn2T}>Use</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.copyBtn} onPress={onCopy}>
          <Ionicons name="copy-outline" size={14} color={copied ? COLORS.success : COLORS.secondaryText} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export function RewardsScreen({ onBrowse }) {
  const { cart, setCoupon } = useStore();
  const [tab, setTab] = useState('All');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [applied, setApplied] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied] = useState(null);
  const [toast, setToast] = useState(null);
  const [pts, setPts] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / 1200);
      setPts(Math.round(1240 * p));
      if (p >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!toast && !copied) return undefined;
    const t = setTimeout(() => { setToast(null); setCopied(null); }, 2200);
    return () => clearTimeout(t);
  }, [toast, copied]);

  const subtotal = Object.entries(cart).reduce((a, [id, n]) => {
    const d = dishes.find((x) => x.id === id);
    return a + (d ? d.price * n : 0);
  }, 0);

  const applyCode = () => {
    const c = code.trim().toUpperCase();
    const found = OFFERS.find((o) => o.code === c);
    if (found) {
      setCoupon({ code: found.code, title: found.title, pct: found.pct || 0 });
      setApplied(found.code);
      setMsg({ ok: true, text: found.code + ' applied!' });
    } else {
      setMsg({ ok: false, text: 'Invalid code. Try PINOY20.' });
    }
  };

  const copyCode = (c) => {
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : null;
      if (nav && nav.clipboard && nav.clipboard.writeText) nav.clipboard.writeText(c).catch(() => {});
    } catch (e) {}
    setCopied(c);
    setToast('Code ' + c + ' copied!');
  };

  const list = OFFERS.filter((o) => {
    if (tab === 'All') return true;
    if (tab === 'Expiring Soon') return o.expiresH < 48;
    return o.cat === tab;
  });

  return (
    <View style={styles.rewardsWrap}>
      <LinearGradient colors={['#FFF4EC', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.blobTR} />
        <View style={styles.blobBL} />
      </View>
      <ScrollView style={styles.rewardsScroll} stickyHeaderIndices={[0]} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        <View style={styles.ofSticky}>
          <Text style={styles.pageTitle}>Offers & Rewards</Text>
          <Text style={styles.pageSub}>Save more on every order</Text>
          <View style={styles.promoRow}>
            <View style={styles.promoInput}>
              <Ionicons name="ticket-outline" size={15} color={COLORS.secondaryText} />
              <TextInput value={code} onChangeText={(t) => { setCode(t); setMsg(null); }} placeholder="Promo code" placeholderTextColor={COLORS.muted} style={styles.input} autoCapitalize="characters" />
            </View>
            <TouchableOpacity onPress={applyCode}>
              <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.applyBtn}>
                <Text style={styles.applyBtnT}>Apply</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {msg && <Text style={[styles.promoMsg, { color: msg.ok ? COLORS.success : COLORS.danger }]}>{msg.text}</Text>}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ofTabs}>
            {OFFER_TABS.map((t) => (
              <TouchableOpacity key={t} onPress={() => setTab(t)}>
                {tab === t ? (
                  <LinearGradient colors={['#FF8A3D', '#E8541A']} style={styles.chipA}><Text style={styles.chipAT}>{t}</Text></LinearGradient>
                ) : (
                  <View style={styles.chipB}><Text style={styles.chipBT}>{t}</Text></View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.ofBody}>
          <LinearGradient colors={['#FF8A3D', '#E8541A']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.points}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointsK}>Loyalty points</Text>
              <Text style={styles.pointsV}>{pts.toLocaleString('en-PH')} pts</Text>
              <Text style={styles.pointsS}>₱124 off your next order unlocked</Text>
              <View style={styles.tierTrack}>
                <View style={[styles.tierFill, { width: `${(1240 / 1500) * 100}%` }]} />
              </View>
              <Text style={styles.tierT}>260 pts to Gold</Text>
            </View>
            <View style={styles.pointsRight}>
              <Ionicons name="gift-outline" size={40} color="#ffffffaa" />
              <TouchableOpacity style={styles.redeemBtn} onPress={() => setToast('Reward claimed — ₱124 off your next order')}>
                <Text style={styles.redeemT}>Redeem</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
          <View style={styles.bannerCard}>
            <Text style={styles.bannerArt}>🍨</Text>
            <LinearGradient colors={['rgba(31,31,31,0.05)', 'rgba(31,31,31,0.72)']} style={StyleSheet.absoluteFill} />
            <View style={styles.bannerText}>
              <Text style={styles.bannerK}>WEEKEND SPECIAL</Text>
              <Text style={styles.bannerT}>Free delivery on all orders</Text>
              <TouchableOpacity style={styles.bannerBtn} onPress={onBrowse}>
                <Text style={styles.bannerBtnT}>Order now</Text>
              </TouchableOpacity>
            </View>
          </View>
          {list.length > 0 ? list.map((o, i) => (
            <OfferCard
              key={o.code} o={o} index={i} subtotal={subtotal}
              applied={applied === o.code}
              onUse={() => { setCoupon({ code: o.code, title: o.title, pct: o.pct || 0 }); setApplied(o.code); }}
              onCopy={() => copyCode(o.code)} copied={copied === o.code}
              expanded={expanded === o.code} onTerms={() => setExpanded(expanded === o.code ? null : o.code)}
            />
          )) : (
            <View style={styles.favEmpty}>
              <View style={styles.favEmptyIcon}><Ionicons name="pricetag-outline" size={32} color={COLORS.primary} /></View>
              <Text style={styles.favEmptyT}>No offers here yet</Text>
              <Text style={styles.favEmptyS}>Check back soon for fresh deals.</Text>
              <TouchableOpacity onPress={onBrowse}>
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.browseBtn}>
                  <Text style={styles.browseBtnT}>Browse menu</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          <Text style={[styles.gridTitle, { marginTop: 16 }]}>How you earned points</Text>
          {POINTS_ROWS.map((r) => (
            <View key={r.order} style={styles.ptsRow}>
              <View style={styles.ptsIcon}><Ionicons name="star" size={15} color={COLORS.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ptsOrder}>{r.order}</Text>
                <Text style={styles.ptsDate}>{r.date}</Text>
              </View>
              <Text style={styles.ptsVal}>+{r.pts} pts</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      {(toast || (copied && !toast)) && (
        <View style={styles.toast}><Text style={styles.toastT}>{toast || 'Code copied!'}</Text></View>
      )}

    </View>
  );
}

// ---- SCHEDULED MEALS (calendar icon) ----
const MEAL_TIMES = ['8:00 AM', '12:00 PM', '3:00 PM', '6:30 PM'];

const schISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const schMonday = (weekOffset) => {
  const n = new Date();
  n.setDate(n.getDate() - ((n.getDay() + 6) % 7) + weekOffset * 7);
  n.setHours(0, 0, 0, 0);
  return n;
};
const schWeek = (weekOffset) => [...Array(7)].map((_, i) => {
  const d = schMonday(weekOffset);
  d.setDate(d.getDate() + i);
  return d;
});
const schNum = (d) => d.getDate();
const schDow = (d) => 'MTWTFSS'[(d.getDay() + 6) % 7];
const schLabel = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const schWeekLabel = (offset) => {
  const days = schWeek(offset);
  const a = days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const b = days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${a} - ${b}`;
};
const schTodayISO = () => schISO(new Date());
const schRel = (iso) => {
  const t = schTodayISO();
  if (iso === t) return 'Today';
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (iso === schISO(d)) return 'Tomorrow';
  return null;
};
const schMins = (time) => {
  const m = (time || '').match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2], 10);
};
const schDateTime = (m) => {
  const [y, mo, da] = m.date.split('-').map(Number);
  const mins = schMins(m.time);
  return new Date(y, mo - 1, da, Math.floor(mins / 60), mins % 60);
};
const schPeriod = (m) => {
  const h = schMins(m.time) / 60;
  if (h < 11) return 'Breakfast';
  if (h < 14) return 'Lunch';
  if (h < 17) return 'Merienda';
  return 'Dinner';
};
const schCountdown = (m) => {
  const ms = schDateTime(m).getTime() - Date.now();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const min = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `Auto-orders in ${h}h ${min}m` : `Auto-orders in ${min}m`;
};
const schRest = (id) => (BROWSE_META[id] || FAV_META[id] || {}).restaurant || 'Local kitchen';

function SwipeRow({ onDelete, children }) {
  const x = useRef(new Animated.Value(0)).current;
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
    onPanResponderMove: (_, g) => { if (g.dx < 0) x.setValue(Math.max(g.dx, -84)); },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -60) Animated.timing(x, { toValue: -76, duration: 160, useNativeDriver: false }).start();
      else Animated.spring(x, { toValue: 0, friction: 7, useNativeDriver: false }).start();
    },
  })).current;
  return (
    <View style={styles.swWrap}>
      <TouchableOpacity style={styles.swDel} onPress={onDelete}>
        <Ionicons name="trash-outline" size={18} color="#fff" />
      </TouchableOpacity>
      <Animated.View style={{ transform: [{ translateX: x }] }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

function MealCard({ m, dish, index, fresh, onEdit, onDelete, onRepeat }) {
  const a = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(fresh ? 0 : 1)).current;
  const [hovDel, setHovDel] = useState(false);
  const [pressedDel, setPressedDel] = useState(false);
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 420, delay: Math.min(index, 6) * 80, useNativeDriver: false }).start();
    if (fresh) Animated.timing(flash, { toValue: 1, duration: 1200, useNativeDriver: false }).start();
  }, [a, flash, fresh, index]);
  const rel = schRel(m.date);
  const soon = m.status === 'Scheduled' ? schCountdown(m) : null;
  const chipStyle =
    m.status === 'Delivered' ? { backgroundColor: '#E8F9EF' } :
    m.status === 'Skipped' ? { backgroundColor: '#F0F1F3' } : { backgroundColor: COLORS.lightOrange };
  const chipText =
    m.status === 'Delivered' ? { color: COLORS.success } :
    m.status === 'Skipped' ? { color: COLORS.secondaryText } : { color: COLORS.primary };
  return (
    <SwipeRow onDelete={() => onDelete(m)}>
      <Animated.View style={[styles.mealCard, fresh && { borderColor: COLORS.primary }, {
        opacity: a,
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        backgroundColor: flash.interpolate({ inputRange: [0, 1], outputRange: ['#FFF3E8', '#FFFFFF'] }),
      }]}>
        <FoodImage dish={m.dishId} size="thumb" style={styles.mealPhoto} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.mealTop}>
            <Text style={styles.mealName} numberOfLines={1}>{dish.name}</Text>
            <View style={[styles.status, chipStyle]}><Text style={[styles.statusT, chipText]}>{m.status}</Text></View>
          </View>
          <View style={styles.mealTimeRow}>
            <View style={styles.timeChip}>
              <Ionicons name="time-outline" size={11} color={COLORS.primary} />
              <Text style={styles.timeChipT}>{m.time}</Text>
            </View>
            {rel && <View style={styles.relChip}><Text style={styles.relChipT}>{rel}</Text></View>}
          </View>
          <Text style={styles.mealRest} numberOfLines={1}>{schRest(m.dishId)}</Text>
          <Text style={styles.mealPQ}>{m.qty}x - {peso(dish.price * m.qty)}</Text>
          <View style={styles.repeatRow}>
            <TouchableOpacity style={styles.repeatToggle} onPress={() => onRepeat(m)}>
              <Ionicons name="repeat-outline" size={12} color={m.repeat ? COLORS.primary : COLORS.secondaryText} />
              <Text style={[styles.repeatT, m.repeat && { color: COLORS.primary }]}>Repeat weekly</Text>
            </TouchableOpacity>
            <View style={[styles.switchSm, m.repeat && styles.switchSmOn]}>
              <View style={[styles.knobSm, m.repeat && styles.knobSmOn]} />
            </View>
          </View>
          {soon && <Text style={styles.soonT}>{soon}</Text>}
        </View>
        <View style={styles.mealActs}>
          <TouchableOpacity onPress={() => onEdit(m)}>
            <Ionicons name="pencil-outline" size={17} color="#8A8A8A" />
          </TouchableOpacity>
          <TouchableOpacity
            onHoverIn={() => setHovDel(true)} onHoverOut={() => setHovDel(false)}
            onPressIn={() => setPressedDel(true)} onPressOut={() => setPressedDel(false)}
            onPress={() => onDelete(m)}
          >
            <Ionicons name="trash-outline" size={17} color={hovDel || pressedDel ? COLORS.danger : '#8A8A8A'} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SwipeRow>
  );
}

function SchedModal({ visible, onClose, initial, weekOffset, favorites, onSave }) {
  const allDishes = useMemo(() => {
    const base = [...dishes, BUKO_PANDAN];
    return base.sort((a, b) => (favorites.includes(b.id) ? 1 : 0) - (favorites.includes(a.id) ? 1 : 0));
  }, [dishes, favorites]);
  const [dishId, setDishId] = useState(null);
  const [dq, setDq] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [repeat, setRepeat] = useState(false);
  const [err, setErr] = useState(null);
  useEffect(() => {
    if (!visible) return;
    setDishId(initial ? initial.dishId : null);
    setDq('');
    setDate(initial ? initial.date : null);
    setTime(initial ? initial.time : null);
    setQty(initial ? initial.qty : 1);
    setNote(initial ? initial.note || '' : '');
    setRepeat(initial ? !!initial.repeat : false);
    setErr(null);
  }, [visible, initial]);
  const shown = allDishes.filter((d) => d.name.toLowerCase().includes(dq.trim().toLowerCase()));
  const days = schWeek(weekOffset);
  const save = () => {
    if (!dishId) { setErr('Choose a dish first.'); return; }
    if (!time) { setErr('Pick a time for your meal.'); return; }
    if (date === schTodayISO()) {
      const now = new Date();
      if (schMins(time) <= now.getHours() * 60 + now.getMinutes()) {
        setErr('That time has passed today — pick a later time.');
        return;
      }
    }
    if (!date) { setErr('Pick a date for your meal.'); return; }
    onSave({ dishId, date, time, qty, note: note.trim(), repeat });
  };
  const timeOpts = MEAL_TIMES.includes(time) || !time ? MEAL_TIMES : [...MEAL_TIMES, time];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={Platform.OS === 'web' ? styles.popOverlay : styles.sheetOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={Platform.OS === 'web' ? styles.popoverWide : styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filterHead}>
              <Text style={styles.filterTitle}>{initial ? 'Edit meal' : 'Schedule a meal'}</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={COLORS.text} /></TouchableOpacity>
            </View>
            <Text style={styles.sheetSec}>Dish</Text>
            <View style={styles.promoInput}>
              <Ionicons name="search-outline" size={15} color={COLORS.secondaryText} />
              <TextInput value={dq} onChangeText={setDq} placeholder="Search dishes..." placeholderTextColor={COLORS.muted} style={styles.input} />
            </View>
            <ScrollView style={{ maxHeight: 190 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {shown.map((d) => (
                <TouchableOpacity key={d.id} style={[styles.pickRow, dishId === d.id && styles.pickSel]} onPress={() => setDishId(d.id)}>
                  <FoodImage dish={d.id} size="thumb" style={styles.pickImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickN} numberOfLines={1}>{d.name}</Text>
                    <Text style={styles.pickP}>{peso(d.price)} • ⭐ {d.rating}</Text>
                  </View>
                  {dishId === d.id && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.sheetSec}>Date</Text>
            <View style={styles.miniDays}>
              {days.map((d) => {
                const iso = schISO(d);
                const sel = date === iso;
                return (
                  <TouchableOpacity key={iso} style={[styles.miniDay, sel && styles.miniDaySel]} onPress={() => setDate(iso)}>
                    <Text style={[styles.miniDayT, sel && { color: '#fff' }]}>{schDow(d)}</Text>
                    <Text style={[styles.miniDayN, sel && { color: '#fff' }]}>{schNum(d)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.sheetSec}>Time</Text>
            <View style={styles.timeChips}>
              {timeOpts.map((t) => (
                <TouchableOpacity key={t} style={[styles.timeChipOpt, time === t && styles.timeChipSel]} onPress={() => setTime(t)}>
                  <Text style={[styles.timeChipOptT, time === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sheetSec}>Quantity</Text>
            <View style={styles.stepBtns}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setQty(Math.max(1, qty - 1))}><Ionicons name="remove" size={15} color={COLORS.text} /></TouchableOpacity>
              <Text style={styles.stepQ}>{qty}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setQty(qty + 1)}><Ionicons name="add" size={15} color={COLORS.text} /></TouchableOpacity>
            </View>
            <Text style={styles.sheetSec}>Delivery note (optional)</Text>
            <TextInput value={note} onChangeText={setNote} placeholder="e.g. Leave at the guard house" placeholderTextColor={COLORS.muted} style={styles.noteInput} />
            <TouchableOpacity style={styles.repeatBig} onPress={() => setRepeat(!repeat)}>
              <Ionicons name="repeat-outline" size={16} color={repeat ? COLORS.primary : COLORS.secondaryText} />
              <Text style={[styles.repeatBigT, repeat && { color: COLORS.primary }]}>Repeat weekly</Text>
              <View style={{ flex: 1 }} />
              <View style={[styles.switch, repeat && styles.switchOn]}><View style={[styles.knob, repeat && styles.knobOn]} /></View>
            </TouchableOpacity>
            {err && <Text style={styles.errT}>{err}</Text>}
            <TouchableOpacity onPress={save}>
              <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.schedSave}>
                <Text style={styles.schedSaveT}>Save meal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function ScheduleScreen({ onBrowse }) {
  const { scheduled, setScheduled, dishes, favorites } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState(schTodayISO());
  const [modal, setModal] = useState(null);
  const [snack, setSnack] = useState(null);
  const [freshId, setFreshId] = useState(null);
  const snackTimer = useRef(null);
  useEffect(() => () => { if (snackTimer.current) clearTimeout(snackTimer.current); }, []);

  const days = useMemo(() => schWeek(weekOffset), [weekOffset]);
  const counts = useMemo(() => {
    const m = {};
    scheduled.forEach((s) => { m[s.date] = (m[s.date] || 0) + 1; });
    return m;
  }, [scheduled]);
  const dayMeals = useMemo(() => scheduled
    .filter((s) => s.date === selected)
    .sort((a, b) => schMins(a.time) - schMins(b.time)), [scheduled, selected]);
  const weekMeals = useMemo(() => {
    const set = new Set(days.map(schISO));
    return scheduled.filter((s) => set.has(s.date));
  }, [scheduled, days]);
  const dishOf = (id) => [...dishes, BUKO_PANDAN].find((d) => d.id === id) || dishes[0];
  const weekTotal = weekMeals.reduce((a, s) => a + dishOf(s.dishId).price * s.qty, 0);
  const nextMeal = useMemo(() => {
    const fut = scheduled
      .filter((s) => s.status === 'Scheduled' && schDateTime(s).getTime() > Date.now())
      .sort((a, b) => schDateTime(a) - schDateTime(b));
    return fut[0] || null;
  }, [scheduled]);
  const nextIn = nextMeal ? (() => {
    const ms = schDateTime(nextMeal).getTime() - Date.now();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
  })() : '—';

  const groups = useMemo(() => {
    const g = {};
    dayMeals.forEach((m) => {
      const p = schPeriod(m);
      g[p] = g[p] || [];
      g[p].push(m);
    });
    return ['Breakfast', 'Lunch', 'Merienda', 'Dinner'].filter((p) => g[p]).map((p) => ({ period: p, items: g[p] }));
  }, [dayMeals]);

  const removeMeal = (m) => {
    setScheduled((s) => s.filter((x) => x.id !== m.id));
    setSnack(m);
    if (snackTimer.current) clearTimeout(snackTimer.current);
    snackTimer.current = setTimeout(() => setSnack(null), 5000);
  };
  const undoRemove = () => {
    if (snack) setScheduled((s) => [...s, snack]);
    setSnack(null);
  };
  const saveMeal = (data) => {
    if (modal && modal.editing) {
      setScheduled((s) => s.map((x) => (x.id === modal.editing.id ? { ...x, ...data } : x)));
      setFreshId(modal.editing.id);
    } else {
      const id = `s${Date.now()}`;
      setScheduled((s) => [...s, { id, status: 'Scheduled', ...data }]);
      setFreshId(id);
    }
    setSelected(data.date);
    setModal(null);
    setTimeout(() => setFreshId(null), 2600);
  };

  const todayISO = schTodayISO();
  const selDate = days.find((d) => schISO(d) === selected) || new Date();
  const favDishes = favorites
    .map((id) => [...dishes, BUKO_PANDAN].find((d) => d.id === id))
    .filter(Boolean)
    .slice(0, 8);

  return (
    <View style={styles.schWrap}>
      <LinearGradient colors={['#FFF4EC', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.blobTR} />
        <View style={styles.blobBL} />
      </View>
      <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
        <View style={styles.schSticky}>
          <View style={styles.schHead}>
            <View>
              <Text style={styles.pageTitle}>Scheduled Meals</Text>
              <Text style={styles.schSub}>{weekMeals.length} meals planned this week</Text>
            </View>
            <TouchableOpacity style={styles.todayPill} onPress={() => { setWeekOffset(0); setSelected(schTodayISO()); }}>
              <Text style={styles.todayPillT}>Today</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.weekNav}>
            <TouchableOpacity style={styles.weekArrow} onPress={() => setWeekOffset((w) => w - 1)}>
              <Ionicons name="chevron-back" size={17} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.weekLabel}>{schWeekLabel(weekOffset)}</Text>
            <TouchableOpacity style={styles.weekArrow} onPress={() => setWeekOffset((w) => w + 1)}>
              <Ionicons name="chevron-forward" size={17} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStrip}>
            {days.map((d) => {
              const iso = schISO(d);
              const sel = selected === iso;
              const isToday = iso === todayISO;
              return (
                <TouchableOpacity key={iso} onPress={() => setSelected(iso)}>
                  {sel ? (
                    <LinearGradient colors={['#FF8A3D', '#E8541A']} style={[styles.dayCard, isToday && styles.dayToday]}>
                      <Text style={styles.dayLettA}>{schDow(d)}</Text>
                      <Text style={styles.dayNumA}>{schNum(d)}</Text>
                      <View style={[styles.dayDot, { backgroundColor: counts[iso] ? '#fff' : 'transparent' }]} />
                    </LinearGradient>
                  ) : (
                    <View style={[styles.dayCard, styles.dayPlain, isToday && styles.dayToday]}>
                      <Text style={styles.dayLett}>{schDow(d)}</Text>
                      <Text style={styles.dayNum}>{schNum(d)}</Text>
                      <View style={[styles.dayDot, { backgroundColor: counts[iso] ? COLORS.primary : 'transparent' }]} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.schBody}>
          <View style={styles.glance}>
            <View style={styles.glanceCol}>
              <Text style={styles.glanceV}>{weekMeals.length}</Text>
              <Text style={styles.glanceK}>meals planned</Text>
            </View>
            <View style={styles.glanceDiv} />
            <View style={styles.glanceCol}>
              <Text style={styles.glanceV}>{peso(weekTotal)}</Text>
              <Text style={styles.glanceK}>estimated total</Text>
            </View>
            <View style={styles.glanceDiv} />
            <View style={styles.glanceCol}>
              <Text style={styles.glanceV}>{nextIn}</Text>
              <Text style={styles.glanceK}>next meal</Text>
            </View>
          </View>

          <Text style={styles.gridTitle}>Quick schedule</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
            {favDishes.map((d) => (
              <View key={d.id} style={styles.quickCard}>
                <FoodImage dish={d.id} size="card" style={styles.quickImg} />
                <Text style={styles.quickN} numberOfLines={1}>{d.name}</Text>
                <TouchableOpacity onPress={() => setModal({ prefill: { dishId: d.id, date: selected } })}>
                  <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.quickAdd}>
                    <Ionicons name="add" size={14} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <Text style={[styles.gridTitle, { marginTop: 16 }]}>{schLabel(selDate)}</Text>
          {groups.length > 0 ? groups.map((g) => (
            <View key={g.period}>
              <Text style={styles.periodHead}>{g.period}</Text>
              {g.items.map((m, i) => (
                <MealCard
                  key={m.id} m={m} dish={dishOf(m.dishId)} index={i} fresh={freshId === m.id}
                  onEdit={(mm) => setModal({ editing: mm })}
                  onDelete={removeMeal}
                  onRepeat={(mm) => setScheduled((s) => s.map((x) => (x.id === mm.id ? { ...x, repeat: !x.repeat } : x)))}
                />
              ))}
            </View>
          )) : (
            <View style={styles.favEmpty}>
              <View style={styles.favEmptyIcon}><Ionicons name="calendar-outline" size={32} color={COLORS.primary} /></View>
              <Text style={styles.favEmptyT}>Nothing planned for this day</Text>
              <Text style={styles.favEmptyS}>Schedule a meal and it will auto-order on time.</Text>
              <TouchableOpacity onPress={() => setModal({ prefill: { date: selected } })}>
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.browseBtn}>
                  <Text style={styles.browseBtnT}>Schedule a meal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {groups.length > 0 && (
            <TouchableOpacity onPress={() => setModal({ prefill: { date: selected } })}>
              <LinearGradient colors={['#FF8A3D', '#E8541A']} style={styles.schedSave}>
                <Text style={styles.schedSaveT}>+ Schedule a meal</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      {snack && (
        <View style={styles.snack}>
          <Text style={styles.snackT} numberOfLines={1}>Meal deleted</Text>
          <TouchableOpacity onPress={undoRemove}><Text style={styles.snackUndo}>Undo</Text></TouchableOpacity>
        </View>
      )}
      <SchedModal
        visible={!!modal} onClose={() => setModal(null)}
        initial={modal ? (modal.editing || { dishId: (modal.prefill || {}).dishId || null, date: (modal.prefill || {}).date || selected }) : null}
        weekOffset={weekOffset} favorites={favorites} onSave={saveMeal}
      />
    </View>
  );
}

// ---- SETTINGS ----
const FAQS = [
  { q: 'How do I track my order?', a: 'Open My Orders to see live rider tracking, ETAs, and status updates in real time.' },
  { q: 'How do refunds work?', a: 'Cancelled orders are refunded to your wallet within 24 hours, and to cards within 5 days.' },
  { q: 'How do I use a promo code?', a: 'Enter it at checkout or on the Offers screen. Only one code applies per order.' },
];

function SetSection({ title, children }) {
  return (
    <View style={styles.setSection}>
      <Text style={styles.setSectionT}>{title}</Text>
      {children}
    </View>
  );
}

export function SettingsScreen() {
  const [profile, setProfile] = useState({ name: user.name, phone: '+63 917 123 4567', email: 'juan.delacruz@mail.ph' });
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [notifs, setNotifs] = useState({ orders: true, promos: true, sounds: false });
  const [addresses, setAddresses] = useState([
    { id: 'a1', label: 'Home', detail: '45 Mabini St., Quezon City', isDefault: true },
    { id: 'a2', label: 'Work', detail: '12 Ortigas Ave., Pasig City', isDefault: false },
  ]);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrDraft, setAddrDraft] = useState({ label: '', detail: '' });
  const [methods, setMethods] = useState([
    { id: 'm1', label: 'GCash', detail: `•••• ${user.card}`, isDefault: true },
    { id: 'm2', label: 'Cash on delivery', detail: 'Pay the rider', isDefault: false },
  ]);
  const [cardOpen, setCardOpen] = useState(false);
  const [cardDraft, setCardDraft] = useState({ num: '', exp: '' });
  const [lang, setLang] = useState('English');
  const [langOpen, setLangOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [logoutAsk, setLogoutAsk] = useState(false);
  const [chatSent, setChatSent] = useState(false);

  const saveProfile = () => {
    if (!draft.name.trim()) return;
    setProfile({ ...draft, name: draft.name.trim() });
    setEditOpen(false);
  };
  const addAddress = () => {
    if (!addrDraft.detail.trim()) return;
    setAddresses((a) => [...a, { id: `a${Date.now()}`, label: addrDraft.label.trim() || 'Other', detail: addrDraft.detail.trim(), isDefault: false }]);
    setAddrDraft({ label: '', detail: '' });
    setAddrOpen(false);
  };
  const addCard = () => {
    const digits = cardDraft.num.replace(/\D/g, '');
    if (digits.length < 4) return;
    setMethods((m) => [...m, { id: `m${Date.now()}`, label: 'Card', detail: `•••• ${digits.slice(-4)}`, isDefault: false }]);
    setCardDraft({ num: '', exp: '' });
    setCardOpen(false);
  };
  const toggleNotif = (k) => setNotifs((n) => ({ ...n, [k]: !n[k] }));

  return (
    <View style={styles.setWrap}>
      <LinearGradient colors={['#FFF4EC', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.blobTR} />
        <View style={styles.blobBL} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.setContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSub}>Profile, addresses, payments and more</Text>

        <View style={styles.profCard}>
          <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.profAv}>
            <Text style={styles.profAvT}>{(profile.name.trim()[0] || 'J').toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.profN}>{profile.name}</Text>
            <Text style={styles.profS}>{profile.email}</Text>
            <View style={styles.goldPill}><Text style={styles.goldPillT}>GOLD MEMBER</Text></View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => { setDraft(profile); setEditOpen(true); }}>
            <Text style={styles.editT}>Edit</Text>
          </TouchableOpacity>
        </View>

        <SetSection title="Notifications">
          {[
            ['orders', 'Order updates', 'Live status, rider and ETA alerts'],
            ['promos', 'Promos & deals', 'New offers and weekend specials'],
            ['sounds', 'Sounds', 'Play a tone on order updates'],
          ].map(([k, t, s]) => (
            <View key={k} style={styles.setRow}>
              <View style={styles.setIcon}><Ionicons name={k === 'sounds' ? 'volume-high-outline' : 'notifications-outline'} size={17} color={COLORS.primary} /></View>
              <View style={{ flex: 1 }}><Text style={styles.setT}>{t}</Text><Text style={styles.setS}>{s}</Text></View>
              <Switch value={notifs[k]} onValueChange={() => toggleNotif(k)} trackColor={{ true: COLORS.primary, false: COLORS.border }} thumbColor="#fff" />
            </View>
          ))}
        </SetSection>

        <SetSection title={`Addresses (${addresses.length})`}>
          {addresses.map((a) => (
            <TouchableOpacity key={a.id} style={styles.setRow} onPress={() => setAddresses((list) => list.map((x) => ({ ...x, isDefault: x.id === a.id })))}>
              <View style={styles.setIcon}><Ionicons name="location-outline" size={17} color={COLORS.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.setT}>{a.label} {a.isDefault && <Text style={styles.defTag}>• Default</Text>}</Text>
                <Text style={styles.setS}>{a.detail}</Text>
              </View>
              <Ionicons name={a.isDefault ? 'checkmark-circle' : 'chevron-forward'} size={17} color={a.isDefault ? COLORS.success : COLORS.muted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addLine} onPress={() => setAddrOpen(true)}>
            <Ionicons name="add" size={15} color={COLORS.primary} /><Text style={styles.addLineT}>Add new address</Text>
          </TouchableOpacity>
        </SetSection>

        <SetSection title="Payments">
          <View style={styles.setRow}>
            <View style={styles.setIcon}><Ionicons name="wallet-outline" size={17} color={COLORS.primary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.setT}>Wallet balance</Text><Text style={styles.setS}>{peso(user.balance)} available</Text></View>
          </View>
          {methods.map((m) => (
            <TouchableOpacity key={m.id} style={styles.setRow} onPress={() => setMethods((list) => list.map((x) => ({ ...x, isDefault: x.id === m.id })))}>
              <View style={styles.setIcon}><Ionicons name="card-outline" size={17} color={COLORS.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.setT}>{m.label} {m.isDefault && <Text style={styles.defTag}>• Default</Text>}</Text>
                <Text style={styles.setS}>{m.detail}</Text>
              </View>
              <Ionicons name={m.isDefault ? 'checkmark-circle' : 'chevron-forward'} size={17} color={m.isDefault ? COLORS.success : COLORS.muted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addLine} onPress={() => setCardOpen(true)}>
            <Ionicons name="add" size={15} color={COLORS.primary} /><Text style={styles.addLineT}>Add card</Text>
          </TouchableOpacity>
        </SetSection>

        <SetSection title="Preferences">
          <TouchableOpacity style={styles.setRow} onPress={() => setLangOpen(!langOpen)}>
            <View style={styles.setIcon}><Ionicons name="globe-outline" size={17} color={COLORS.primary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.setT}>Language</Text><Text style={styles.setS}>{lang}</Text></View>
            <Ionicons name={langOpen ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.muted} />
          </TouchableOpacity>
          {langOpen && ['English', 'Filipino'].map((l) => (
            <TouchableOpacity key={l} style={styles.langOpt} onPress={() => { setLang(l); setLangOpen(false); }}>
              <Text style={[styles.langOptT, lang === l && { color: COLORS.primary, fontFamily: FONTS.bold }]}>{l}</Text>
              {lang === l && <Ionicons name="checkmark" size={15} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
          <View style={styles.setRow}>
            <View style={styles.setIcon}><Ionicons name="cash-outline" size={17} color={COLORS.primary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.setT}>Currency</Text><Text style={styles.setS}>Philippine Peso (₱)</Text></View>
          </View>
        </SetSection>

        <SetSection title="Help & Support">
          {FAQS.map((f, i) => (
            <View key={f.q}>
              <TouchableOpacity style={styles.setRow} onPress={() => setFaqOpen(faqOpen === i ? null : i)}>
                <View style={{ flex: 1 }}><Text style={styles.setT}>{f.q}</Text></View>
                <Ionicons name={faqOpen === i ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.muted} />
              </TouchableOpacity>
              {faqOpen === i && <Text style={styles.faqA}>{f.a}</Text>}
            </View>
          ))}
          <TouchableOpacity style={styles.setRow} onPress={() => setChatSent(true)}>
            <View style={styles.setIcon}><Ionicons name="chatbubble-ellipses-outline" size={17} color={COLORS.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.setT}>Chat with us</Text>
              <Text style={styles.setS}>{chatSent ? 'Message sent — we reply within minutes.' : 'Typically replies within minutes'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        </SetSection>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutAsk(true)}>
          <Ionicons name="log-out-outline" size={17} color={COLORS.text} />
          <Text style={styles.logoutT}>Log out</Text>
        </TouchableOpacity>
        <Text style={styles.versionT}>FoodDash v1.0.0 • Made in the Philippines</Text>
      </ScrollView>

      <Modal visible={editOpen} transparent animationType="slide" onRequestClose={() => setEditOpen(false)}>
        <View style={Platform.OS === 'web' ? styles.popOverlay : styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setEditOpen(false)} activeOpacity={1} />
          <View style={Platform.OS === 'web' ? styles.popover : styles.sheet}>
            <View style={styles.modalHead}>
              <Text style={styles.filterTitle}>Edit profile</Text>
              <TouchableOpacity style={styles.backX} onPress={() => setEditOpen(false)}>
                <Ionicons name="close" size={16} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput value={draft.name} onChangeText={(t) => setDraft({ ...draft, name: t })} style={styles.fieldInput} placeholderTextColor={COLORS.muted} />
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput value={draft.phone} onChangeText={(t) => setDraft({ ...draft, phone: t })} style={styles.fieldInput} keyboardType="phone-pad" placeholderTextColor={COLORS.muted} />
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput value={draft.email} onChangeText={(t) => setDraft({ ...draft, email: t })} style={styles.fieldInput} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.muted} />
            <TouchableOpacity onPress={saveProfile}>
              <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.sheetAdd}>
                <Text style={styles.sheetAddT}>Save changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={addrOpen} transparent animationType="slide" onRequestClose={() => setAddrOpen(false)}>
        <View style={Platform.OS === 'web' ? styles.popOverlay : styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setAddrOpen(false)} activeOpacity={1} />
          <View style={Platform.OS === 'web' ? styles.popover : styles.sheet}>
            <View style={styles.modalHead}>
              <Text style={styles.filterTitle}>Add address</Text>
              <TouchableOpacity style={styles.backX} onPress={() => setAddrOpen(false)}>
                <Ionicons name="close" size={16} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>Label (Home, Work...)</Text>
            <TextInput value={addrDraft.label} onChangeText={(t) => setAddrDraft({ ...addrDraft, label: t })} style={styles.fieldInput} placeholderTextColor={COLORS.muted} />
            <Text style={styles.fieldLabel}>Address</Text>
            <TextInput value={addrDraft.detail} onChangeText={(t) => setAddrDraft({ ...addrDraft, detail: t })} style={styles.fieldInput} placeholderTextColor={COLORS.muted} />
            <TouchableOpacity onPress={addAddress}>
              <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.sheetAdd}>
                <Text style={styles.sheetAddT}>Save address</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={cardOpen} transparent animationType="slide" onRequestClose={() => setCardOpen(false)}>
        <View style={Platform.OS === 'web' ? styles.popOverlay : styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setCardOpen(false)} activeOpacity={1} />
          <View style={Platform.OS === 'web' ? styles.popover : styles.sheet}>
            <View style={styles.modalHead}>
              <Text style={styles.filterTitle}>Add card</Text>
              <TouchableOpacity style={styles.backX} onPress={() => setCardOpen(false)}>
                <Ionicons name="close" size={16} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>Card number</Text>
            <TextInput value={cardDraft.num} onChangeText={(t) => setCardDraft({ ...cardDraft, num: t })} style={styles.fieldInput} keyboardType="number-pad" placeholder="1234 5678 9012 3456" placeholderTextColor={COLORS.muted} />
            <Text style={styles.fieldLabel}>Expiry (MM/YY)</Text>
            <TextInput value={cardDraft.exp} onChangeText={(t) => setCardDraft({ ...cardDraft, exp: t })} style={styles.fieldInput} placeholder="12/28" placeholderTextColor={COLORS.muted} />
            <TouchableOpacity onPress={addCard}>
              <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.sheetAdd}>
                <Text style={styles.sheetAddT}>Save card</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={logoutAsk} transparent animationType="fade" onRequestClose={() => setLogoutAsk(false)}>
        <View style={styles.popOverlay}>
          <View style={styles.popover}>
            <Text style={styles.filterTitle}>Log out?</Text>
            <Text style={styles.setS}>You can log back in anytime. Your cart and favorites stay saved on this device.</Text>
            <View style={styles.logoutRow}>
              <TouchableOpacity style={styles.logoutCancel} onPress={() => setLogoutAsk(false)}>
                <Text style={styles.logoutCancelT}>Stay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutGo} onPress={() => setLogoutAsk(false)}>
                <Text style={styles.logoutGoT}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---- NOTIFICATIONS (modal content) ----
export function NotificationsPanel({ onClose }) {
  return (
    <View>
      {notifications.map((n) => (
        <View key={n.id} style={styles.notif}>
          <View style={styles.setIcon}><Ionicons name="notifications" size={16} color={COLORS.primary} /></View>
          <View style={{ flex: 1 }}><Text style={styles.setT}>{n.title}</Text><Text style={styles.setS}>{n.body}</Text></View>
          <Text style={styles.notifTime}>{n.time}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.schedAdd} onPress={onClose}><Text style={styles.schedAddT}>Mark all read</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background, padding: 18 },
  backX: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  rewardsWrap: { flex: 1 },
  rewardsScroll: { flex: 1, padding: 18 },
  blobTR: { position: 'absolute', top: -90, right: -90, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(242,107,29,0.09)' },
  blobBL: { position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(242,107,29,0.08)' },
  pageHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pageTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.text },
  pageSub: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.secondaryText, marginTop: 2, marginBottom: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 9, width: 260, ...SHADOW.card },
  input: { flex: 1, fontFamily: FONTS.regular, fontSize: 12.5, outlineStyle: 'none' },
  chips: { gap: 8, paddingBottom: 12 },
  chip: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, ...SHADOW.card },
  chipT: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.secondaryText },
  chipA: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  chipAT: { fontFamily: FONTS.bold, fontSize: 12, color: '#fff' },
  bWrap: { flex: 1 },
  bSticky: { paddingTop: 18, paddingHorizontal: 18, backgroundColor: '#FFF4EC', borderBottomWidth: 1, borderBottomColor: '#F7E8D8' },
  bSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  chipZone: { position: 'relative', marginTop: 2, marginHorizontal: -18 },
  chipsB: { paddingHorizontal: 18, paddingVertical: 8 },
  chipWrap: { marginRight: 12, height: 38, justifyContent: 'center' },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 10 },
  toggleRow2: { alignItems: 'center', paddingRight: 4 },
  chipB: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 15, paddingVertical: 9, borderRadius: 20, ...SHADOW.card },
  chipBT: { fontFamily: FONTS.medium, fontSize: 12, color: '#555555' },
  chipFade: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 40 },
  filterBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  resultCount: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.secondaryText },
  toggleRow: { gap: 8, paddingVertical: 10 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20 },
  toggleOn: { backgroundColor: COLORS.lightOrange, borderColor: COLORS.primary },
  toggleT: { fontFamily: FONTS.medium, fontSize: 11.5, color: COLORS.secondaryText },
  toggleTOn: { fontFamily: FONTS.bold, fontSize: 11.5, color: COLORS.primary },
  bGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, paddingHorizontal: 18, paddingTop: 4, paddingBottom: 100 },
  bCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#F0E6DF', padding: 12, ...SHADOW.card },
  bImg: { aspectRatio: 4 / 3, borderRadius: 14, overflow: 'hidden' },
  bEmoji: { fontSize: 60 },
  bBadge: { position: 'absolute', top: 8, left: 8, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  bBadgeT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 11 },
  bHeartBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  bRateT: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.text },
  bInfo: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  cartBar: { position: 'absolute', left: 18, right: 18, bottom: 14 },
  cartBarBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.text, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, ...SHADOW.card },
  cartBarT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 13.5 },
  skelImg: { height: 150, borderRadius: 14, backgroundColor: COLORS.border },
  skelLine: { height: 12, borderRadius: 6, backgroundColor: COLORS.border, marginTop: 10, marginHorizontal: 4 },
  sheetOverlay: { flex: 1, backgroundColor: '#1F1F1F66', justifyContent: 'flex-end' },
  popOverlay: { flex: 1, backgroundColor: '#1F1F1F66', justifyContent: 'center', alignItems: 'center', padding: 24 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, maxHeight: '88%' },
  popover: { backgroundColor: '#fff', borderRadius: 20, padding: 18, width: 340, maxWidth: '100%' },
  popoverWide: { backgroundColor: '#fff', borderRadius: 20, padding: 18, width: 460, maxWidth: '94%' },
  sheetImgWrap: { height: 190, borderRadius: 16, overflow: 'hidden' },
  sheetX: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  sheetName: { fontFamily: FONTS.bold, fontSize: 19, color: COLORS.text, marginTop: 13 },
  sheetMeta: { fontFamily: FONTS.regular, fontSize: 14, color: '#555555', marginTop: 4 },
  sheetDesc: { fontFamily: FONTS.regular, fontSize: 14, color: '#555555', lineHeight: 21, marginTop: 8 },
  mealSheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '90%', overflow: 'hidden' },
  sheetHero: { aspectRatio: 4 / 3, borderRadius: 20, overflow: 'hidden' },
  sheetFootPinned: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 14, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff' },
  sheetAddPinned: { borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  sheetSec: { fontFamily: FONTS.bold, fontSize: 13.5, color: COLORS.text, marginTop: 14, marginBottom: 8 },
  sizeRow: { flexDirection: 'row', gap: 8 },
  sizeOpt: { flex: 1, borderWidth: 1.2, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  sizeSel: { borderColor: COLORS.primary, backgroundColor: '#FFF7F0' },
  sizeT: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.secondaryText },
  sizeTSel: { color: COLORS.primary, fontFamily: FONTS.bold },
  addonRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  checkbox: { width: 22, height: 22, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  addonN: { fontFamily: FONTS.medium, fontSize: 12.5, color: COLORS.text, flex: 1 },
  addonP: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.primary },
  sheetFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  sheetQtyLabel: { fontFamily: FONTS.bold, fontSize: 13.5, color: COLORS.text },
  stepBtns: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 30, height: 30, borderRadius: 10, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  stepQ: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text, minWidth: 18, textAlign: 'center' },
  sheetAdd: { borderRadius: 13, paddingVertical: 14, alignItems: 'center', marginTop: 12, marginBottom: 6 },
  sheetAddT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 14 },
  filterHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterTitle: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.text },
  clearAll: { fontFamily: FONTS.bold, fontSize: 12.5, color: COLORS.primary },
  maxLabel: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.text, marginTop: 10 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 6 },
  sliderEnd: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.secondaryText },
  sliderTrack: { flex: 1, height: 28, justifyContent: 'center' },
  sliderFill: { position: 'absolute', left: 0, height: 7, backgroundColor: COLORS.primary, borderRadius: 4 },
  sliderThumb: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 2.5, borderColor: COLORS.primary, marginLeft: -11, ...SHADOW.card },
  filterToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterToggleT: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.text },
  switch: { width: 44, height: 25, borderRadius: 13, backgroundColor: COLORS.border, justifyContent: 'center', paddingHorizontal: 3 },
  switchOn: { backgroundColor: COLORS.primary, alignItems: 'flex-end' },
  knob: { width: 19, height: 19, borderRadius: 10, backgroundColor: '#fff' },
  knobOn: {},
  sliderTrackBg: { position: 'absolute', left: 0, right: 0, height: 7, backgroundColor: COLORS.border, borderRadius: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 20 },
  favWrap: { flex: 1 },
  favContent: { padding: 18, paddingBottom: 90 },
  favHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  favSearch: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fff', borderRadius: RADIUS.md, paddingHorizontal: 11, paddingVertical: 9, width: 230, ...SHADOW.card },
  favBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, maxWidth: 190, ...SHADOW.card },
  sortT: { fontFamily: FONTS.semiBold, fontSize: 11.5, color: COLORS.text, flexShrink: 1 },
  sortMenu: { position: 'absolute', top: 40, right: 0, width: 180, backgroundColor: '#fff', borderRadius: 12, padding: 6, zIndex: 50, ...SHADOW.card },
  sortOpt: { paddingHorizontal: 10, paddingVertical: 9, borderRadius: 8 },
  sortOptT: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.text },
  gridHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 2 },
  gridTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text },
  reorderAll: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#fff' },
  reorderAllT: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary },
  favGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  favCard: { backgroundColor: '#fff', borderRadius: 20, padding: 10, ...SHADOW.card },
  favImg: { height: 150, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dishShadow: { position: 'absolute', bottom: 22, width: 76, height: 12, borderRadius: 6, backgroundColor: 'rgba(31,31,31,0.10)' },
  favEmoji: { fontSize: 62 },
  favHeart: { position: 'absolute', top: 7, right: 7, width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  favHeartLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'flex-end', paddingTop: 7, paddingRight: 7 },
  favHeartBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  rateChip: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4, ...SHADOW.card },
  rateChipT: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.text },
  favBody: { paddingHorizontal: 4, paddingTop: 9, paddingBottom: 2 },
  favName: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.text },
  favRest: { fontFamily: FONTS.regular, fontSize: 12, color: '#6B6B6B', marginTop: 2 },
  favInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  freeChip: { backgroundColor: '#E8F9EF', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  freeChipT: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.success },
  favMeta: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.secondaryText },
  favDist: { fontFamily: FONTS.regular, fontSize: 11.5, color: COLORS.secondaryText, marginTop: 3 },
  favTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  favTag: { backgroundColor: '#F1F1F1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  favTagT: { fontFamily: FONTS.medium, fontSize: 10, color: '#555555' },
  favFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  favPrice: { fontFamily: FONTS.bold, fontSize: 16, color: '#1F1F1F' },
  favAdd: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  recoWrap: { marginTop: 18 },
  recCard: { width: 152, backgroundColor: '#fff', borderRadius: 16, padding: 9, ...SHADOW.card },
  recImg: { height: 96, borderRadius: 12, overflow: 'hidden' },
  recHeart: { position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  recName: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text, marginTop: 8 },
  recFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 },
  recPrice: { fontFamily: FONTS.bold, fontSize: 13, color: '#1F1F1F' },
  recAdd: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  favEmpty: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 34, marginTop: 12, ...SHADOW.card },
  favEmptyIcon: { width: 76, height: 76, borderRadius: 26, backgroundColor: COLORS.lightOrange, alignItems: 'center', justifyContent: 'center' },
  favEmptyT: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.text, marginTop: 14 },
  favEmptyS: { fontFamily: FONTS.regular, fontSize: 12.5, color: COLORS.secondaryText, marginTop: 6, textAlign: 'center' },
  browseBtn: { borderRadius: 12, paddingHorizontal: 22, paddingVertical: 11, marginTop: 14 },
  browseBtnT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 13 },
  snack: { position: 'absolute', left: 18, right: 18, bottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.text, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 12, ...SHADOW.card },
  snackT: { fontFamily: FONTS.medium, fontSize: 12.5, color: '#fff', flex: 1 },
  snackUndo: { fontFamily: FONTS.bold, fontSize: 12.5, color: COLORS.gradientStart },
  empty: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.secondaryText, marginTop: 16 },
  trackCard: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 15, ...SHADOW.card },
  trackHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackId: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text },
  trackSub: { fontFamily: FONTS.regular, fontSize: 11.5, color: COLORS.secondaryText, marginTop: 2 },
  eta: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  etaT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 12, textAlign: 'center' },
  orderWrap: { flex: 1 },
  orderContent: { padding: 18, paddingBottom: 26, gap: 4 },
  tabs: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 4 },
  tab: { backgroundColor: '#ECEEF1', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  tabT: { fontFamily: FONTS.medium, fontSize: 12.5, color: COLORS.secondaryText },
  tabA: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  tabAT: { fontFamily: FONTS.bold, fontSize: 12.5, color: '#fff' },
  trackCard2: { backgroundColor: '#fff', borderRadius: 16, padding: 15, marginTop: 10, ...SHADOW.card },
  etaNum: { color: '#fff', fontFamily: FONTS.bold, fontSize: 15, textAlign: 'center' },
  etaSmall: { color: '#FFE9D6', fontFamily: FONTS.medium, fontSize: 9, textAlign: 'center', letterSpacing: 1 },
  riderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  riderAv: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.lightOrange, alignItems: 'center', justifyContent: 'center' },
  riderAvT: { color: COLORS.primary, fontFamily: FONTS.bold, fontSize: 15 },
  riderName: { fontFamily: FONTS.bold, fontSize: 13.5, color: COLORS.text },
  riderSub: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText, marginTop: 1 },
  contactBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  liveMap: { height: 172, borderRadius: 14, overflow: 'hidden', marginTop: 12 },
  mapPin: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.text, alignItems: 'center', justifyContent: 'center' },
  mapPinHome: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  riderBubble: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginLeft: -16, marginTop: -16, ...SHADOW.card },
  mapChip: { position: 'absolute', top: 10, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, ...SHADOW.card },
  mapChipT: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.text },
  stepList: { marginTop: 14 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepRail: { alignItems: 'center', width: 24 },
  dotDone: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  dotCurWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  dotCur: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.primary },
  pulseRing: { position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: COLORS.primary },
  dotNext: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 2, borderColor: '#C9CDD3' },
  linkTrack: { width: 2.5, height: 30, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden', marginVertical: 3 },
  linkFill: { width: 2.5, backgroundColor: COLORS.primary },
  linkDashed: { width: 0, height: 30, borderLeftWidth: 2.5, borderColor: '#C9CDD3', borderStyle: 'dashed', marginVertical: 3 },
  stepText: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 30 },
  stepLabel: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.text },
  stepTime: { fontFamily: FONTS.medium, fontSize: 11.5, color: COLORS.secondaryText },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.background, borderRadius: 12, padding: 12, marginTop: 4 },
  detailsT: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.text, flex: 1 },
  detailsBox: { marginTop: 10, gap: 2 },
  detailLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  detailLineImg: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  detailThumb: { width: 48, height: 48, borderRadius: 12 },
  detailK: { fontFamily: FONTS.regular, fontSize: 12.5, color: COLORS.text },
  detailV: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text },
  discFree: { fontFamily: FONTS.bold, fontSize: 12.5, color: COLORS.success },
  detailTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  detailTotalK: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text },
  detailTotalV: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.primary },
  secTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text, marginTop: 16, marginBottom: 2 },
  activeNote: { fontFamily: FONTS.regular, fontSize: 12.5, color: COLORS.secondaryText, marginTop: 8 },
  hCard: { backgroundColor: '#fff', borderRadius: 16, padding: 13, marginTop: 10, ...SHADOW.card },
  hTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hThumb: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  hId: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text },
  hDate: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText, marginTop: 1 },
  hTotal: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text },
  hItems: { fontFamily: FONTS.regular, fontSize: 12, color: '#555555', marginTop: 9, lineHeight: 17 },
  hFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  status: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
  statusT: { fontFamily: FONTS.bold, fontSize: 11 },
  rateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6 },
  rateT: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.secondaryText },
  reorderPill: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7, backgroundColor: '#fff' },
  reorderPillT: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary },
  emptyBox: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 28, marginTop: 10, ...SHADOW.card },
  emptyIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: COLORS.lightOrange, alignItems: 'center', justifyContent: 'center' },
  emptyT: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text, marginTop: 12 },
  emptyS: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.secondaryText, marginTop: 4 },
  mapMock: { height: 130, backgroundColor: '#E9EDF1', borderRadius: RADIUS.md, marginTop: 12, overflow: 'hidden' },
  route: { position: 'absolute', left: 50, top: 30, width: 240, height: 70, borderWidth: 3, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: 30, transform: [{ rotate: '-8deg' }] },
  pin: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.text, alignItems: 'center', justifyContent: 'center' },
  pin2: { position: 'absolute', width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  tl: { marginTop: 12, gap: 2 },
  tlRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 4 },
  tlDot: { width: 10, height: 10, borderRadius: 5 },
  tlT: { fontFamily: FONTS.medium, fontSize: 12 },
  histCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 12, marginTop: 10, ...SHADOW.card },
  histId: { fontFamily: FONTS.bold, fontSize: 12.5, color: COLORS.text },
  histItems: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText, marginTop: 2 },
  histTotal: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text },
  reorder: { backgroundColor: COLORS.lightOrange, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  reorderT: { fontFamily: FONTS.bold, fontSize: 11.5, color: COLORS.primary },
  points: { borderRadius: RADIUS.lg, padding: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  ofSticky: { paddingTop: 18, paddingHorizontal: 18, paddingBottom: 10, backgroundColor: '#FFF4EC' },
  promoRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  promoInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, ...SHADOW.card },
  applyBtn: { borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11 },
  applyBtnT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 13 },
  promoMsg: { fontFamily: FONTS.semiBold, fontSize: 12, marginTop: 7 },
  ofTabs: { gap: 8, paddingVertical: 12 },
  ofBody: { paddingHorizontal: 18, gap: 0 },
  pointsRight: { alignItems: 'center', gap: 10 },
  redeemBtn: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  redeemT: { color: COLORS.primary, fontFamily: FONTS.bold, fontSize: 12.5 },
  tierTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  tierFill: { height: 8, backgroundColor: '#fff', borderRadius: 4 },
  tierT: { fontFamily: FONTS.semiBold, fontSize: 11, color: '#fff', marginTop: 6 },
  bannerCard: { height: 150, borderRadius: 18, overflow: 'hidden', backgroundColor: '#FFE9D6', marginBottom: 14, ...SHADOW.card },
  bannerArt: { position: 'absolute', right: 6, top: -6, fontSize: 120 },
  bannerText: { position: 'absolute', left: 16, bottom: 14, right: 120 },
  bannerK: { fontFamily: FONTS.medium, fontSize: 10, letterSpacing: 1.5, color: '#FFE9D6' },
  bannerT: { fontFamily: FONTS.bold, fontSize: 17, color: '#fff', lineHeight: 22, marginTop: 3 },
  bannerBtn: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', marginTop: 9 },
  bannerBtnT: { color: COLORS.primary, fontFamily: FONTS.bold, fontSize: 12.5 },
  ticket: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 13, marginBottom: 11, ...SHADOW.card },
  notchL: { position: 'absolute', left: -11, top: '50%', marginTop: -11, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFF3EA' },
  notchR: { position: 'absolute', right: -11, top: '50%', marginTop: -11, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFF3EA' },
  ticketLeft: { alignItems: 'center', gap: 8, paddingRight: 4 },
  ticketIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  codeChip: { backgroundColor: COLORS.lightOrange, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed' },
  codeChipT: { fontFamily: FONTS.bold, fontSize: 10.5, color: COLORS.primary },
  ticketDiv: { width: 0, borderLeftWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', marginHorizontal: 10 },
  ticketMid: { flex: 1 },
  ticketTitle: { fontFamily: FONTS.bold, fontSize: 13.5, color: '#1F1F1F' },
  ticketDesc: { fontFamily: FONTS.regular, fontSize: 13, color: '#555555', marginTop: 3, lineHeight: 17 },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  expiryT: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText },
  unusableT: { fontFamily: FONTS.semiBold, fontSize: 11.5, color: COLORS.primary, marginTop: 5 },
  termsLink: { fontFamily: FONTS.semiBold, fontSize: 11.5, color: COLORS.secondaryText, marginTop: 6, textDecorationLine: 'underline' },
  termsT: { fontFamily: FONTS.regular, fontSize: 11.5, color: '#555555', marginTop: 5, lineHeight: 16 },
  ticketRight: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingLeft: 2 },
  useBtn2: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  useBtn2T: { color: '#fff', fontFamily: FONTS.bold, fontSize: 12.5 },
  appliedBtn: { backgroundColor: '#E8F9EF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  appliedBtnT: { color: COLORS.success, fontFamily: FONTS.bold, fontSize: 11.5 },
  copyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  ptsRow: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#fff', borderRadius: 14, padding: 13, marginTop: 9, ...SHADOW.card },
  ptsIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.lightOrange, alignItems: 'center', justifyContent: 'center' },
  ptsOrder: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.text },
  ptsDate: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText },
  ptsVal: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.success },
  toast: { position: 'absolute', left: 18, right: 18, bottom: 16, backgroundColor: COLORS.text, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 12, alignItems: 'center', ...SHADOW.card },
  toastT: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: '#fff' },
  pointsK: { fontFamily: FONTS.regular, fontSize: 11, color: '#FFE9D6' },
  pointsV: { fontFamily: FONTS.bold, fontSize: 26, color: '#fff' },
  pointsS: { fontFamily: FONTS.regular, fontSize: 11, color: '#FFE9D6' },
  promoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 13, marginBottom: 10, ...SHADOW.card },
  codeBox: { backgroundColor: COLORS.lightOrange, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed' },
  code: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary },
  promoT: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text },
  promoS: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText },
  useBtn: { backgroundColor: COLORS.text, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 8 },
  usedBtn: { backgroundColor: '#E8F9EF' },
  useT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 12 },
  week: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  day: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  dayA: { backgroundColor: COLORS.primary },
  dayT: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text },
  schedCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 12, marginBottom: 10, ...SHADOW.card },
  schedE: { fontSize: 30 },
  schWrap: { flex: 1 },
  schSticky: { paddingTop: 18, paddingHorizontal: 18, paddingBottom: 10, backgroundColor: '#FFF4EC' },
  schHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  schSub: { fontFamily: FONTS.regular, fontSize: 14, color: '#6B6B6B', marginTop: 2 },
  todayPill: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, ...SHADOW.card },
  todayPillT: { fontFamily: FONTS.bold, fontSize: 12.5, color: COLORS.primary },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  weekArrow: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  weekLabel: { fontFamily: FONTS.bold, fontSize: 13.5, color: COLORS.text },
  dayStrip: { gap: 8, paddingVertical: 12 },
  dayCard: { width: 52, borderRadius: 16, paddingVertical: 9, alignItems: 'center', gap: 2 },
  dayPlain: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  dayToday: { borderWidth: 1.5, borderColor: COLORS.primary },
  dayLett: { fontFamily: FONTS.medium, fontSize: 11, color: '#555555' },
  dayLettA: { fontFamily: FONTS.bold, fontSize: 11, color: '#fff' },
  dayNum: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text },
  dayNumA: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff' },
  dayDot: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },
  schBody: { paddingHorizontal: 18, paddingBottom: 100 },
  glance: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 15, marginTop: 14, ...SHADOW.card },
  glanceCol: { flex: 1, alignItems: 'center', gap: 3 },
  glanceV: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.text },
  glanceK: { fontFamily: FONTS.regular, fontSize: 11, color: '#6B6B6B' },
  glanceDiv: { width: 1, backgroundColor: COLORS.border },
  quickCard: { width: 132, backgroundColor: '#fff', borderRadius: 14, padding: 8, ...SHADOW.card },
  quickImg: { height: 84, borderRadius: 10, overflow: 'hidden' },
  quickN: { fontFamily: FONTS.semiBold, fontSize: 11.5, color: COLORS.text, marginTop: 7 },
  quickAdd: { position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  periodHead: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text, marginTop: 14, marginBottom: 2 },
  swWrap: { position: 'relative', marginTop: 10 },
  swDel: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 76, backgroundColor: COLORS.text, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  mealCard: { flexDirection: 'row', gap: 11, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#F0E6DF', padding: 12, ...SHADOW.card },
  mealPhoto: { width: 72, height: 72, borderRadius: 14 },
  mealTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mealName: { fontFamily: FONTS.bold, fontSize: 16, color: '#1F1F1F', flex: 1 },
  mealTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.lightOrange, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  timeChipT: { fontFamily: FONTS.bold, fontSize: 11.5, color: COLORS.primary },
  relChip: { backgroundColor: COLORS.background, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  relChipT: { fontFamily: FONTS.semiBold, fontSize: 11, color: COLORS.secondaryText },
  mealRest: { fontFamily: FONTS.regular, fontSize: 12, color: '#6B6B6B', marginTop: 5 },
  mealPQ: { fontFamily: FONTS.medium, fontSize: 12.5, color: '#555555', marginTop: 3 },
  repeatRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 },
  repeatToggle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  repeatT: { fontFamily: FONTS.medium, fontSize: 11.5, color: COLORS.secondaryText },
  switchSm: { width: 38, height: 22, borderRadius: 11, backgroundColor: COLORS.border, justifyContent: 'center', paddingHorizontal: 2 },
  switchSmOn: { backgroundColor: COLORS.primary, alignItems: 'flex-end' },
  knobSm: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff' },
  knobSmOn: {},
  soonT: { fontFamily: FONTS.semiBold, fontSize: 11.5, color: COLORS.primary, marginTop: 6 },
  mealActs: { alignItems: 'center', gap: 12, paddingTop: 2 },
  miniDays: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 },
  miniDay: { width: 44, borderRadius: 12, backgroundColor: COLORS.background, paddingVertical: 7, alignItems: 'center' },
  miniDaySel: { backgroundColor: COLORS.primary },
  miniDayT: { fontFamily: FONTS.medium, fontSize: 10.5, color: COLORS.secondaryText },
  miniDayN: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text },
  timeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  timeChipOpt: { borderWidth: 1.2, borderColor: COLORS.border, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 9 },
  timeChipSel: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeChipOptT: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.text },
  noteInput: { borderWidth: 1.2, borderColor: COLORS.border, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10, fontFamily: FONTS.regular, fontSize: 12.5, color: COLORS.text, outlineStyle: 'none' },
  repeatBig: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14 },
  repeatBigT: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.text },
  errT: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.danger, marginTop: 10 },
  schedSave: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 14, marginBottom: 6 },
  schedSaveT: { color: '#fff', fontFamily: FONTS.semiBold, fontSize: 15 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickSel: { backgroundColor: '#FFF7F0', borderRadius: 10 },
  pickImg: { width: 44, height: 44, borderRadius: 12 },
  pickN: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text },
  pickP: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText, marginTop: 1 },
  schedD: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text },
  schedW: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText },
  schedAdd: { backgroundColor: COLORS.text, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  schedAddT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 13 },
  profCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 14, marginBottom: 12, ...SHADOW.card },
  profAv: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  profAvT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 20 },
  profN: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text },
  profS: { fontFamily: FONTS.regular, fontSize: 11.5, color: COLORS.secondaryText },
  editBtn: { backgroundColor: COLORS.background, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 7 },
  editT: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.text },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 13, marginBottom: 9, ...SHADOW.card },
  setWrap: { flex: 1 },
  setContent: { padding: 18, paddingBottom: 40 },
  setSection: { marginTop: 16 },
  setSectionT: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text, marginBottom: 9, paddingHorizontal: 2 },
  goldPill: { alignSelf: 'flex-start', backgroundColor: COLORS.lightOrange, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3, marginTop: 5 },
  goldPillT: { fontFamily: FONTS.bold, fontSize: 10, letterSpacing: 1, color: COLORS.primary },
  defTag: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.success },
  addLine: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
  addLineT: { fontFamily: FONTS.bold, fontSize: 12.5, color: COLORS.primary },
  langOpt: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.md, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 8, ...SHADOW.card },
  langOptT: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.text },
  faqA: { fontFamily: FONTS.regular, fontSize: 12.5, color: '#555555', lineHeight: 18, backgroundColor: '#fff', borderRadius: RADIUS.md, paddingHorizontal: 15, paddingBottom: 13, marginTop: -5, marginBottom: 9 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1.2, borderColor: COLORS.border, borderRadius: 14, paddingVertical: 13, marginTop: 20, ...SHADOW.card },
  logoutT: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text },
  versionT: { fontFamily: FONTS.regular, fontSize: 11.5, color: COLORS.secondaryText, textAlign: 'center', marginTop: 14 },
  fieldLabel: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text, marginTop: 12, marginBottom: 6 },
  fieldInput: { borderWidth: 1.2, borderColor: COLORS.border, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10, fontFamily: FONTS.regular, fontSize: 13, color: COLORS.text, outlineStyle: 'none' },
  logoutRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  logoutCancel: { flex: 1, borderWidth: 1.2, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  logoutCancelT: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text },
  logoutGo: { flex: 1, backgroundColor: COLORS.text, borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  logoutGoT: { fontFamily: FONTS.bold, fontSize: 13, color: '#fff' },
  setIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.lightOrange, alignItems: 'center', justifyContent: 'center' },
  setT: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.text },
  setS: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText, marginTop: 1 },
  notif: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.background, borderRadius: 12, padding: 11, marginBottom: 9 },
  notifTime: { fontFamily: FONTS.regular, fontSize: 10.5, color: COLORS.muted },
});
