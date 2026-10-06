import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_300Light, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { COLORS, FONTS } from './src/theme';
import { StoreProvider, useStore } from './src/store';
import Sidebar from './src/components/Sidebar';
import HomeScreen from './src/screens/HomeScreen';
import { BrowseScreen, FavoritesScreen, OrdersScreen, RewardsScreen, ScheduleScreen, SettingsScreen } from './src/screens/Screens';
import StatisticsScreen from './src/screens/StatisticsScreen';
import { DishModal, CheckoutModal, NotificationsModal } from './src/components/Modals';

SplashScreen.preventAutoHideAsync().catch(() => {});

const MAIN_TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'browse', label: 'Menu', icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  { key: 'favorites', label: 'Favorites', icon: 'heart-outline', activeIcon: 'heart' },
  { key: 'orders', label: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt' },
];

const MORE_ITEMS = [
  { key: 'statistics', label: 'Statistics', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  { key: 'offers', label: 'Offers', icon: 'pricetag-outline', activeIcon: 'pricetag' },
  { key: 'schedule', label: 'Scheduled Meals', icon: 'calendar-outline', activeIcon: 'calendar' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
];

const MORE_KEYS = MORE_ITEMS.map((m) => m.key);

function MobileTopBar({ cartCount, onCart }) {
  return (
    <View style={styles.topBar}>
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.topLogo}>
        <View style={styles.topLogoHole} />
      </LinearGradient>
      <Text style={styles.topName}>FoodDash</Text>
      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={onCart}>
        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.topCart}>
          <Ionicons name="bag-handle-outline" size={17} color="#fff" />
          {cartCount > 0 && (
            <View style={styles.topBadge}><Text style={styles.topBadgeT}>{cartCount}</Text></View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function BottomBar({ active, onNavigate, cartCount, onMore, moreLabel, moreActive }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {MAIN_TABS.map((it) => {
        const isActive = active === it.key;
        return (
          <TouchableOpacity key={it.key} onPress={() => onNavigate(it.key)} style={styles.tab}>
            <View style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              <Ionicons name={isActive ? it.activeIcon : it.icon} size={24} color={isActive ? COLORS.primary : '#8A8A8A'} />
              {it.key === 'browse' && cartCount > 0 && (
                <View style={styles.tabBadge}><Text style={styles.tabBadgeT}>{cartCount}</Text></View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity onPress={onMore} style={styles.tab}>
        <View style={[styles.tabIcon, moreActive && styles.tabIconActive]}>
          <Ionicons name={moreActive ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline'} size={24} color={moreActive ? COLORS.primary : '#8A8A8A'} />
        </View>
        <Text style={[styles.tabLabel, moreActive && styles.tabLabelActive]} numberOfLines={1}>{moreLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function MoreSheet({ visible, onClose, active, onNavigate, onLogout }) {
  const [confirmOut, setConfirmOut] = useState(false);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />
          <View style={styles.moreGrid}>
            {MORE_ITEMS.map((it) => {
              const isActive = active === it.key;
              return (
                <TouchableOpacity
                  key={it.key}
                  style={[styles.moreItem, isActive && styles.moreItemActive]}
                  onPress={() => { onNavigate(it.key); onClose(); }}
                >
                  <Ionicons name={isActive ? it.activeIcon : it.icon} size={24} color={isActive ? COLORS.primary : '#8A8A8A'} />
                  <Text style={[styles.moreLabel, isActive && styles.moreLabelActive]}>{it.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {!confirmOut ? (
            <TouchableOpacity style={styles.logoutRow} onPress={() => setConfirmOut(true)}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.secondaryText} />
              <Text style={styles.logoutT}>Logout</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.confirmRow}>
              <Text style={styles.confirmT}>Log out?</Text>
              <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirmOut(false)}>
                <Text style={styles.confirmNoT}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmYes} onPress={() => { setConfirmOut(false); onClose(); onLogout(); }}>
                <Text style={styles.confirmYesT}>Log out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Shell() {
  const [route, setRoute] = useState('home');
  const [query, setQuery] = useState('');
  const [dish, setDish] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [notifs, setNotifs] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { count, notifRead } = useStore();
  const { width } = useWindowDimensions();
  const mobile = width < 700;

  const navigate = (r) => setRoute(r === 'logout' ? 'home' : r);
  const moreActive = MORE_KEYS.includes(route);
  const moreItem = MORE_ITEMS.find((m) => m.key === route);
  const moreLabel = moreActive ? moreItem.label : 'More';

  const screens = (
    <>
      {route === 'home' && (
        <HomeScreen query={query} setQuery={setQuery} onBell={() => setNotifs(true)} unread={!notifRead}
          onBrowse={() => setRoute('browse')} onOpenDish={setDish}
          onCheckout={() => setCheckout(true)} onCoupon={() => setRoute('rewards')} />
      )}
      {route === 'browse' && <BrowseScreen onOpenDish={setDish} onCheckout={() => setCheckout(true)} />}
      {route === 'favorites' && <FavoritesScreen onOpenDish={setDish} onBrowse={() => setRoute('browse')} />}
      {route === 'orders' && <OrdersScreen goBrowse={() => setRoute('browse')} />}
      {route === 'statistics' && <StatisticsScreen />}
      {route === 'offers' && <RewardsScreen onBrowse={() => setRoute('browse')} />}
      {route === 'schedule' && <ScheduleScreen onBrowse={() => setRoute('browse')} />}
      {route === 'settings' && <SettingsScreen />}
    </>
  );

  if (mobile) {
    return (
      <View style={styles.colRoot}>
        <StatusBar style="dark" />
        <MobileTopBar cartCount={count} onCart={() => setRoute('browse')} />
        <View style={styles.main}>{screens}</View>
        <BottomBar active={route} onNavigate={navigate} cartCount={count} onMore={() => setMoreOpen(true)} moreLabel={moreLabel} moreActive={moreActive} />
        <MoreSheet visible={moreOpen} onClose={() => setMoreOpen(false)} active={route} onNavigate={navigate} onLogout={() => navigate('logout')} />
        <DishModal dish={dish} onClose={() => setDish(null)} />
        <CheckoutModal visible={checkout} onClose={() => setCheckout(false)} />
        <NotificationsModal visible={notifs} onClose={() => setNotifs(false)} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Sidebar active={route} onNavigate={navigate} cartCount={count} />
      <View style={styles.main}>{screens}</View>
      <DishModal dish={dish} onClose={() => setDish(null)} />
      <CheckoutModal visible={checkout} onClose={() => setCheckout(false)} />
      <NotificationsModal visible={notifs} onClose={() => setNotifs(false)} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Poppins_300Light, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
    const t = setTimeout(() => setFallback(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const onReady = useCallback(async () => {
    if (fontsLoaded || fallback) await SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fallback]);

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View style={styles.root} onLayout={onReady}>
          <Shell />
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.background },
  colRoot: { flex: 1, flexDirection: 'column', backgroundColor: COLORS.background },
  main: { flex: 1, minWidth: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  topLogo: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  topLogoHole: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff' },
  topName: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.text },
  topCart: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9 },
  topBadge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  topBadgeT: { color: COLORS.primary, fontSize: 10.5, fontFamily: FONTS.bold },
  bar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0E6DF', paddingTop: 8, paddingHorizontal: 4, shadowColor: '#1F1F1F', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -3 }, elevation: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4, minHeight: 44 },
  tabIcon: { width: 56, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: COLORS.lightOrange },
  tabLabel: { fontFamily: FONTS.medium, fontSize: 11, color: '#8A8A8A' },
  tabLabelActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  tabBadge: { position: 'absolute', top: 0, right: 8, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeT: { color: '#fff', fontSize: 10, fontFamily: FONTS.bold },
  sheetOverlay: { flex: 1, backgroundColor: '#1F1F1F66', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, paddingBottom: 28 },
  dragHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 14 },
  moreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moreItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: COLORS.background, borderRadius: 14, padding: 14 },
  moreItemActive: { backgroundColor: COLORS.lightOrange },
  moreLabel: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.text },
  moreLabelActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  logoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  logoutT: { fontFamily: FONTS.semiBold, fontSize: 13.5, color: COLORS.secondaryText },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  confirmT: { fontFamily: FONTS.bold, fontSize: 13.5, color: COLORS.text, flex: 1 },
  confirmNo: { borderWidth: 1.2, borderColor: COLORS.border, borderRadius: 11, paddingHorizontal: 16, paddingVertical: 9 },
  confirmNoT: { fontFamily: FONTS.bold, fontSize: 12.5, color: COLORS.text },
  confirmYes: { backgroundColor: COLORS.text, borderRadius: 11, paddingHorizontal: 16, paddingVertical: 9 },
  confirmYesT: { fontFamily: FONTS.bold, fontSize: 12.5, color: '#fff' },
});
