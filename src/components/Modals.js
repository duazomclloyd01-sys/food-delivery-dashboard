import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOW, peso, SERVICE_FEE } from '../theme';
import { useStore } from '../store';
import FoodImage from './FoodImage';
import { user } from '../data/mock';
import { QtyStepper } from './Cards';
import { NotificationsPanel } from '../screens/Screens';

function Sheet({ visible, onClose, children, wide }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismiss} onPress={onClose} activeOpacity={1} />
        <View style={[styles.sheet, wide && { width: 560 }]}>{children}</View>
      </View>
    </Modal>
  );
}

export function DishModal({ dish, onClose }) {
  const { add, cart, favorites, toggleFav } = useStore();
  const fav = dish ? favorites.includes(dish.id) : false;
  return (
    <Sheet visible={!!dish} onClose={onClose}>
      {dish && (
        <View>
          <View style={styles.dishHero}>
            <FoodImage dish={dish.id} size="hero" shade style={StyleSheet.absoluteFill} />
            <TouchableOpacity style={styles.x} onPress={onClose}><Ionicons name="close" size={17} color={COLORS.text} /></TouchableOpacity>
            <TouchableOpacity style={[styles.x, { right: 52 }]} onPress={() => toggleFav(dish.id)}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={17} color={fav ? COLORS.primary : COLORS.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.dishBody}>
            <View style={styles.dishRow}>
              <View style={{ flex: 1 }}><Text style={styles.dishName}>{dish.name}</Text><Text style={styles.dishMeta}>⭐ {dish.rating} • {dish.time} • {dish.calories} cal</Text></View>
              <Text style={styles.dishPrice}>{peso(dish.price)}</Text>
            </View>
            <Text style={styles.dishDesc}>{dish.desc}</Text>
            <View style={styles.tagRow}>{dish.tags.map((t) => <View key={t} style={styles.tag}><Text style={styles.tagT}>{t}</Text></View>)}</View>
            <View style={styles.dishFoot}>
              <QtyStepper id={dish.id} />
              <Text style={styles.inCart}>{cart[dish.id] || 0} in cart</Text>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => { add(dish.id); }}>
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.addBtn}><Text style={styles.addT}>Add to cart • {peso(dish.price * ((cart[dish.id] || 0) + 1))}</Text></LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Sheet>
  );
}

export function CheckoutModal({ visible, onClose, startOnCoupon }) {
  const { cart, dishes, coupon, setCoupon, clearCart, setHistory } = useStore();
  const [code, setCode] = useState('');
  const [pay, setPay] = useState('balance');
  const [done, setDone] = useState(false);
  const items = Object.entries(cart).map(([id, qty]) => ({ ...dishes.find((d) => d.id === id), qty })).filter((x) => x.id);
  const sub = items.reduce((a, x) => a + x.price * x.qty, 0);
  const discount = coupon ? sub * (coupon.pct / 100) : 0;
  const total = sub - discount + SERVICE_FEE;

  const apply = () => {
    const codes = { PINOY20: 20, LUNCH15: 15, FREEDEL: 0 };
    const c = code.trim().toUpperCase();
    if (codes[c] != null) setCoupon({ code: c, title: c, pct: codes[c] });
    setCode('');
  };

  const place = () => {
    setHistory((h) => [{ id: `#ORD-${8400 + h.length + 20}`, items: items.map((x) => `${x.name} x${x.qty}`), total, status: 'Preparing', date: 'Just now' }, ...h]);
    setDone(true);
  };
  const close = () => { if (done) clearCart(); setDone(false); onClose(); };

  return (
    <Sheet visible={visible} onClose={close} wide>
      {!done ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.coHead}><Text style={styles.coTitle}>Checkout</Text><TouchableOpacity onPress={close}><Ionicons name="close" size={20} color={COLORS.text} /></TouchableOpacity></View>
          {items.map((x) => <View key={x.id} style={styles.coRow}><FoodImage dish={x.id} size="thumb" style={styles.coThumb} /><Text style={[styles.coItem, { flex: 1 }]}>{x.name} x{x.qty}</Text><Text style={styles.coPrice}>{peso(x.price * x.qty)}</Text></View>)}
          <View style={styles.couponRow}>
            <TextInput value={code} onChangeText={setCode} placeholder="Coupon code (try PINOY20)" placeholderTextColor={COLORS.muted} style={styles.couponInput} autoCapitalize="characters" />
            <TouchableOpacity style={styles.applyBtn} onPress={apply}><Text style={styles.applyT}>Apply</Text></TouchableOpacity>
          </View>
          {coupon && <View style={styles.applied}><Ionicons name="ticket" size={14} color={COLORS.success} /><Text style={styles.appliedT}>{coupon.code} — {coupon.pct}% off applied</Text><TouchableOpacity onPress={() => setCoupon(null)}><Ionicons name="close-circle" size={15} color={COLORS.muted} /></TouchableOpacity></View>}
          <Text style={styles.payLabel}>Payment</Text>
          {[['balance', 'Wallet balance', `${peso(user.balance)} available`, 'wallet-outline'], ['card', 'Card •••• 5812', 'Expires 08/24', 'card-outline'], ['gcash', 'GCash 0917-***-5812', 'Linked e-wallet', 'phone-portrait-outline'], ['cash', 'Cash on delivery', 'Pay the rider', 'cash-outline']].map(([k, t, s, icon]) => (
            <TouchableOpacity key={k} style={[styles.payRow, pay === k && styles.paySel]} onPress={() => setPay(k)}>
              <Ionicons name={icon} size={18} color={pay === k ? COLORS.primary : COLORS.secondaryText} />
              <View style={{ flex: 1 }}><Text style={styles.payT}>{t}</Text><Text style={styles.payS}>{s}</Text></View>
              {pay === k && <Ionicons name="checkmark-circle" size={19} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
          <View style={styles.coRow}><Text style={styles.coItem}>Subtotal</Text><Text style={styles.coPrice}>{peso(sub)}</Text></View>
          {discount > 0 && <View style={styles.coRow}><Text style={styles.disc}>Discount</Text><Text style={styles.disc}>−{peso(discount)}</Text></View>}
          <View style={styles.coRow}><Text style={styles.coItem}>Service</Text><Text style={styles.coPrice}>{peso(SERVICE_FEE)}</Text></View>
          <View style={styles.coTotal}><Text style={styles.coTotalK}>Total</Text><Text style={styles.coTotalV}>{peso(total)}</Text></View>
          <TouchableOpacity onPress={place}>
            <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.place}><Text style={styles.placeT}>Place order • {peso(total)}</Text></LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.success}>
          <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.check}><Ionicons name="checkmark" size={34} color="#fff" /></LinearGradient>
          <Text style={styles.succT}>Order placed! 🎉</Text>
          <Text style={styles.succS}>The kitchen is preparing your food. Track it live under My Orders.</Text>
          <TouchableOpacity style={styles.place} onPress={close}><Text style={styles.placeT}>Back to home</Text></TouchableOpacity>
        </View>
      )}
    </Sheet>
  );
}

export function NotificationsModal({ visible, onClose }) {
  const { setNotifRead } = useStore();
  return (
    <Sheet visible={visible} onClose={() => { setNotifRead(true); onClose(); }}>
      <View style={styles.coHead}><Text style={styles.coTitle}>Notifications</Text><TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={COLORS.text} /></TouchableOpacity></View>
      <NotificationsPanel onClose={() => { setNotifRead(true); onClose(); }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#1F1F1F66', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  dismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: { width: 440, maxHeight: '88%', backgroundColor: '#fff', borderRadius: 22, padding: 18, ...SHADOW.card },
  x: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dishHero: { height: 190, borderRadius: 16, overflow: 'hidden' },
  dishEmoji: { fontSize: 92 },
  dishBody: { paddingTop: 13 },
  dishRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dishName: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.text },
  dishMeta: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.secondaryText, marginTop: 3 },
  dishPrice: { fontFamily: FONTS.bold, fontSize: 19, color: COLORS.primary },
  dishDesc: { fontFamily: FONTS.regular, fontSize: 12.5, color: COLORS.text, lineHeight: 19, marginTop: 9 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  tag: { backgroundColor: COLORS.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagT: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.secondaryText },
  dishFoot: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 15 },
  inCart: { fontFamily: FONTS.medium, fontSize: 11.5, color: COLORS.secondaryText },
  addBtn: { borderRadius: 13, paddingVertical: 13, alignItems: 'center' },
  addT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 13 },
  coHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  coTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.text },
  coRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  coThumb: { width: 40, height: 40, borderRadius: 10 },
  coItem: { fontFamily: FONTS.regular, fontSize: 12.5, color: COLORS.text },
  coPrice: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text },
  disc: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.success },
  couponRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  couponInput: { flex: 1, borderWidth: 1.2, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9, fontFamily: FONTS.medium, fontSize: 12.5, outlineStyle: 'none' },
  applyBtn: { backgroundColor: COLORS.text, borderRadius: 11, paddingHorizontal: 16, justifyContent: 'center' },
  applyT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 12.5 },
  applied: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#E8F9EF', borderRadius: 10, padding: 9, marginTop: 9 },
  appliedT: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.success, flex: 1 },
  payLabel: { fontFamily: FONTS.bold, fontSize: 13.5, color: COLORS.text, marginTop: 14, marginBottom: 8 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1.2, borderColor: COLORS.border, borderRadius: 12, padding: 11, marginBottom: 8 },
  paySel: { borderColor: COLORS.primary, backgroundColor: '#FFF7F0' },
  payT: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text },
  payS: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText },
  coTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  coTotalK: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text },
  coTotalV: { fontFamily: FONTS.bold, fontSize: 19, color: COLORS.primary },
  place: { backgroundColor: COLORS.text, borderRadius: 13, paddingVertical: 13, alignItems: 'center', marginTop: 12 },
  placeT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 14 },
  success: { alignItems: 'center', paddingVertical: 16 },
  check: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  succT: { fontFamily: FONTS.bold, fontSize: 19, color: COLORS.text, marginTop: 14 },
  succS: { fontFamily: FONTS.regular, fontSize: 12.5, color: COLORS.secondaryText, textAlign: 'center', marginTop: 7, maxWidth: 300, lineHeight: 18 },
});
