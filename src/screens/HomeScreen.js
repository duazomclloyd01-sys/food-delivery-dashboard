import React, { useEffect, useRef, useState } from 'react';

import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, useWindowDimensions, ActivityIndicator, Animated, Alert, FlatList } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONTS, RADIUS, SHADOW, peso, SERVICE_FEE } from '../theme';

import { user, basedOnIds, trendingIds } from '../data/mock';

import { useStore } from '../store';

import { db, initDatabase } from '../services/db';

import TopBar from '../components/Header';

import FoodImage from '../components/FoodImage';

import { QtyStepper } from '../components/Cards';



const HOME_META = {

  d1: { restaurant: 'Kusina ni Juan', distance: '1.2 km' },

  d2: { restaurant: 'Sisig House QC', distance: '2.1 km' },

  d3: { restaurant: 'Palabok House', distance: '0.8 km' },

  d6: { restaurant: 'Inasal Express', distance: '1.7 km' },

  d7: { restaurant: 'Halo-Halo Station', distance: '1.5 km' },

};

const SERVINGS = { d7: '1 serving', d2: '2 servings', d6: '2 servings' };

const SLIDES = [

  { segs: [{ t: 'Tikman ang lutong ' }, { t: 'Pinoy', c: COLORS.primary }], sub: 'Ulam favorites delivered hot in about 30 minutes', photo: 'd2' },

  { segs: [{ t: 'Free delivery ' }, { t: 'this weekend', c: COLORS.primary }], sub: 'Zero service fee on all orders, Sat to Sun', photo: 'd10' },

  { segs: [{ t: 'Halo-Halo ' }, { t: 'Buy 1 Take 1', c: COLORS.primary }], sub: 'Double the shaved-ice happiness today', photo: 'd7' },

];

const COUPONS = { PINOY20: { pct: 20 }, LUNCH15: { pct: 15 }, FREEDEL: { fee: true } };



function SectionHead({ title, action, count, onAction }) {

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



function Hero({ onBrowse }) {

  const [slide, setSlide] = useState(0);

  const [paused, setPaused] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: false }).start();

  }, [fade]);

  useEffect(() => {

    if (paused) return undefined;

    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);

    return () => clearInterval(id);

  }, [paused]);

  const cur = SLIDES[slide];

  return (

    <Animated.View

      style={[styles.hero, { opacity: fade }]}

      onHoverIn={() => setPaused(true)}

      onHoverOut={() => setPaused(false)}

    >

      <LinearGradient colors={['#FFF4EC', '#FFE3CC']} style={StyleSheet.absoluteFill} />

      <View style={styles.heroLeft}>

        <Text style={styles.deal}>DEAL OF THE WEEKEND</Text>

        <Text style={styles.heroTitle}>

          {cur.segs.map((s, i) => (

            <Text key={i} style={s.c ? { color: s.c } : undefined}>{s.t}</Text>

          ))}

        </Text>

        <Text style={styles.heroSub} numberOfLines={1}>{cur.sub}</Text>

        <TouchableOpacity onPress={onBrowse} style={styles.heroBtnWrap}>

          <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.heroBtn}>

            <Text style={styles.heroBtnT}>Check Menu</Text>

            <View style={styles.heroArrow}><Ionicons name="arrow-forward" size={13} color={COLORS.primary} /></View>

          </LinearGradient>

        </TouchableOpacity>

        <View style={styles.dots}>

          {SLIDES.map((_, i) => (

            <TouchableOpacity key={i} onPress={() => setSlide(i)}>

              <View style={[styles.dot, slide === i && styles.dotA]} />

            </TouchableOpacity>

          ))}

        </View>

      </View>

      <View style={styles.heroPhotoWrap}>

        <FoodImage key={cur.photo} dish={cur.photo} size="hero" style={styles.heroPhoto} />

        <LinearGradient colors={['#FFF1E2', 'rgba(255,241,226,0)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.heroFade} pointerEvents="none" />

      </View>

      <View style={styles.burst}><Text style={styles.burstT}>FREE{'\n'}delivery</Text></View>

    </Animated.View>

  );

}



function HomeDishCard({ d, meta, index, onOpen }) {

  const { cart, favorites, toggleFav, add } = useStore();

  const a = useRef(new Animated.Value(0)).current;

  const [ticked, setTicked] = useState(false);

  const timer = useRef(null);

  const fav = favorites.includes(d.id);

  useEffect(() => {

    Animated.timing(a, { toValue: 1, duration: 450, delay: 150 + index * 90, useNativeDriver: false }).start();

    return () => { if (timer.current) clearTimeout(timer.current); };

  }, [a, index]);

  const quickAdd = () => {

    add(d.id, 1);

    setTicked(true);

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => setTicked(false), 1000);

  };

  return (

    <Animated.View style={[styles.dCard, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>

      <TouchableOpacity activeOpacity={0.92} onPress={() => onOpen(d)}>

        <View style={styles.dImg}>

          <FoodImage dish={d.id} size="card" shade style={StyleSheet.absoluteFill} />

          <TouchableOpacity style={styles.dHeart} onPress={() => toggleFav(d.id)}>

            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={15} color={fav ? COLORS.primary : COLORS.secondaryText} />

          </TouchableOpacity>

          <View style={styles.dRate}>

            <Ionicons name="star" size={10} color={COLORS.warning} />

            <Text style={styles.dRateT}>{d.rating}</Text>

          </View>

        </View>

        <View style={styles.dBody}>

          <Text style={styles.dName} numberOfLines={1}>{d.name}</Text>

          <Text style={styles.dRest} numberOfLines={1}>{meta.restaurant}</Text>

          <View style={styles.dInfo} numberOfLines={1}>

            <View style={styles.freeChip}><Text style={styles.freeChipT} numberOfLines={1}>Free delivery</Text></View>

            <Ionicons name="time-outline" size={12} color={COLORS.secondaryText} />

            <Text style={styles.dMeta} numberOfLines={1}>{d.time.replace('–', '-').replace(' mins', ' min')}</Text>

            <Text style={styles.dMeta}>•</Text>

            <Text style={styles.dMeta} numberOfLines={1}>{meta.distance}</Text>

          </View>

          <View style={styles.dTags}>

            {d.tags.slice(0, 3).map((t) => <View key={t} style={styles.dTag}><Text style={styles.dTagT}>{t}</Text></View>)}

          </View>

          <View style={styles.dFoot}>

            <Text style={styles.dPrice}>{peso(d.price)}</Text>

            <TouchableOpacity onPress={quickAdd}>

              <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.dAdd}>

                <Ionicons name={ticked ? 'checkmark' : 'add'} size={16} color="#fff" />

              </LinearGradient>

            </TouchableOpacity>

          </View>

        </View>

      </TouchableOpacity>

    </Animated.View>

  );

}



function TrendCard({ d, meta, highlight, onOpen, onAdd }) {

  const body = (

    <>

      <Text style={[styles.trTop, highlight && { color: '#FFE9D6' }]}>TOP OF THE WEEK</Text>

      <Text style={[styles.trName, highlight && { color: '#fff' }]} numberOfLines={2}>{d.name}</Text>

      <Text style={[styles.trCal, highlight && { color: '#FFE9D6' }]}>{d.calories} Calories • {SERVINGS[d.id] || '2 servings'}</Text>

      <View style={styles.trFoot}>

        <Text style={[styles.trPrice, highlight && { color: '#fff' }]}>{peso(d.price)}</Text>

        <TouchableOpacity onPress={() => onAdd(d.id)}>

          <View style={[styles.trAdd, highlight && styles.trAddWhite]}>

            <Ionicons name="add" size={14} color={highlight ? COLORS.primary : '#fff'} />

          </View>

        </TouchableOpacity>

      </View>

    </>

  );

  return (

    <TouchableOpacity style={styles.trCard} onPress={() => onOpen(d)} activeOpacity={0.9}>

      {highlight ? (

        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.trGrad}>

          <View style={styles.trText}>{body}</View>

          <FoodImage dish={d.id} size="card" style={styles.trCircle} />

        </LinearGradient>

      ) : (

        <View style={styles.trPlain}>

          <View style={styles.trText}>{body}</View>

          <FoodImage dish={d.id} size="card" style={styles.trCircle} />

        </View>

      )}

    </TouchableOpacity>

  );

}



function RightPanel({ onCheckout, inDrawer }) {

  const { cart, dishes, add, dec, coupon, setCoupon } = useStore();

  const [showBal, setShowBal] = useState(true);

  const [topUp, setTopUp] = useState(0);

  const [code, setCode] = useState(coupon ? coupon.code : '');

  const [msg, setMsg] = useState(null);

  const [removed, setRemoved] = useState(null);

  const [placing, setPlacing] = useState(false);

  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.timing(slide, { toValue: 1, duration: 550, useNativeDriver: false }).start();

  }, [slide]);



  const items = Object.entries(cart)

    .map(([id, qty]) => ({ ...(dishes.find((d) => d.id === id) || {}), qty }))

    .filter((x) => x.id);

  const sub = items.reduce((a, x) => a + x.price * x.qty, 0);

  const count = items.reduce((a, x) => a + x.qty, 0);

  const discount = !coupon ? 0 : coupon.fee ? SERVICE_FEE : Math.round((sub * (coupon.pct || 0)) / 100);

  const total = sub + SERVICE_FEE - discount;



  const applyCode = (raw) => {

    const c = (raw || code).trim().toUpperCase();

    const found = COUPONS[c];

    if (found) {

      setCoupon({ code: c, ...(found.pct ? { pct: found.pct } : { fee: true }) });

      setCode(c);

      setMsg({ ok: true, text: `${c} applied!` });

    } else {

      setMsg({ ok: false, text: 'Invalid code. Try PINOY20.' });

    }

  };

  const takeOut = (id) => {

    const q = cart[id] || 0;

    if (q <= 0) return;

    setRemoved({ id, qty: q });

    for (let i = 0; i < q; i++) dec(id);

  };

  const place = () => {

    if (items.length === 0 || placing) return;

    setPlacing(true);

    setTimeout(() => { setPlacing(false); onCheckout(); }, 1000);

  };



  return (

    <Animated.View style={[styles.right, inDrawer && styles.rightDrawer, { opacity: slide, transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>

        <View style={styles.rightHead}>

          <Text style={styles.rightTitle}>Your Balance</Text>

          <Ionicons name="ellipsis-horizontal" size={17} color={COLORS.secondaryText} />

        </View>

        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.balCard}>

          <View style={styles.balCircles} />

          <View style={styles.balTop}>

            <View style={styles.goldChip}>

              <View style={styles.goldLine} />

              <View style={styles.goldLine} />

            </View>

            <TouchableOpacity onPress={() => setShowBal(!showBal)}>

              <Ionicons name={showBal ? 'eye-outline' : 'eye-off-outline'} size={18} color="#fff" />

            </TouchableOpacity>

          </View>

          <Text style={styles.balLabel}>Available balance</Text>

          <Text style={styles.balValue}>{showBal ? peso(user.balance + topUp) : '₱ ••••••'}</Text>

          <View style={styles.balFoot}>

            <Text style={styles.balCard2}>•••• {user.card}</Text>

            <Text style={styles.balCard2}>12/28</Text>

          </View>

          <TouchableOpacity style={styles.topUp} onPress={() => setTopUp((t) => t + 500)}>

            <Text style={styles.topUpT}>Top up</Text>

          </TouchableOpacity>

        </LinearGradient>



        <Text style={styles.rightTitle}>Your Address</Text>

        <View style={styles.addrRow}>

          <View style={styles.pinBox}><Ionicons name="location" size={15} color={COLORS.primary} /></View>

          <Text style={styles.addr} numberOfLines={2}>{user.address}</Text>

          <TouchableOpacity style={styles.change}><Text style={styles.changeT}>Change</Text></TouchableOpacity>

        </View>

        <Text style={styles.addrNote}>Unit 12B, Mabini Residences. Ring the doorbell twice.</Text>

        <View style={styles.addrBtns}>

          <TouchableOpacity style={styles.addrBtn}>

            <Ionicons name="add" size={12} color="#555555" /><Text style={styles.addrBtnT}>Add Details</Text>

          </TouchableOpacity>

          <TouchableOpacity style={styles.addrBtn}>

            <Ionicons name="add" size={12} color="#555555" /><Text style={styles.addrBtnT}>Add Note</Text>

          </TouchableOpacity>

        </View>



        <View style={styles.rightHead}>

          <Text style={styles.rightTitle}>Order Menu</Text>

          <Text style={styles.count}>{count} items</Text>

        </View>

        {items.length === 0 ? (

          <View style={styles.emptyCartBox}>

            <Ionicons name="cart-outline" size={26} color={COLORS.secondaryText} />

            <Text style={styles.emptyCartT}>Your cart is empty</Text>

          </View>

        ) : (

          <ScrollView nestedScrollEnabled style={styles.cartList} showsVerticalScrollIndicator={false}>

            {items.map((it) => (

              <View key={it.id} style={styles.cartRow}>

                <FoodImage dish={it.id} size="thumb" style={styles.cartImg} />

                <View style={{ flex: 1 }}>

                  <Text style={styles.cartName} numberOfLines={1}>{it.name}</Text>

                  <Text style={styles.cartPrice}>{peso(it.price)}</Text>

                </View>

                <TouchableOpacity style={styles.trashBtn} onPress={() => takeOut(it.id)}>

                  <Ionicons name="trash-outline" size={14} color={COLORS.secondaryText} />

                </TouchableOpacity>

                <QtyStepper id={it.id} />

              </View>

            ))}

          </ScrollView>

        )}



        <View style={styles.sumRow}><Text style={styles.sumK}>Subtotal</Text><Text style={styles.sumV}>{peso(sub)}</Text></View>

        <View style={styles.sumRow}><Text style={styles.sumK}>Delivery</Text><Text style={styles.sumFree}>Free</Text></View>

        <View style={styles.sumRow}><Text style={styles.sumK}>Service fee</Text><Text style={styles.sumV}>{peso(SERVICE_FEE)}</Text></View>

        {coupon && <View style={styles.sumRow}><Text style={styles.sumK}>Discount ({coupon.code})</Text><Text style={styles.sumDisc}>−{peso(discount)}</Text></View>}

        <View style={styles.totalRow}><Text style={styles.totalK}>Total</Text><Text style={styles.totalV}>{peso(total)}</Text></View>



        <View style={styles.couponRow}>

          <TextInput value={code} onChangeText={(t) => { setCode(t); setMsg(null); }} placeholder="Have a coupon code?" placeholderTextColor={COLORS.secondaryText} style={styles.couponInput} autoCapitalize="characters" />

          <TouchableOpacity style={styles.couponApply} onPress={() => applyCode()}>

            <Text style={styles.couponApplyT}>Apply</Text>

          </TouchableOpacity>

        </View>

        {!coupon && (

          <TouchableOpacity style={styles.tryChip} onPress={() => applyCode('PINOY20')}>

            <Text style={styles.tryChipT}>Try PINOY20</Text>

          </TouchableOpacity>

        )}

        {msg && <Text style={[styles.couponMsg, { color: msg.ok ? COLORS.success : COLORS.danger }]}>{msg.text}</Text>}

        {removed && (

          <View style={styles.snack}>

            <Text style={styles.snackT} numberOfLines={1}>Removed from cart</Text>

            <TouchableOpacity onPress={() => { add(removed.id, removed.qty); setRemoved(null); }}>

              <Text style={styles.snackUndo}>Undo</Text>

            </TouchableOpacity>

          </View>

        )}

      </ScrollView>

      <TouchableOpacity onPress={place} disabled={items.length === 0} activeOpacity={0.85}>

        <LinearGradient colors={items.length === 0 ? ['#D5D8DD', '#B9BEC6'] : [COLORS.gradientStart, COLORS.gradientEnd]} style={styles.checkout}>

          {placing ? (

            <ActivityIndicator size="small" color="#fff" />

          ) : (

            <>

              <Text style={styles.checkoutT}>Checkout · {peso(total)}</Text>

              <View style={styles.coArrow}><Ionicons name="arrow-forward" size={14} color="#fff" /></View>

            </>

          )}

        </LinearGradient>

      </TouchableOpacity>

    </Animated.View>

  );

}



export default function HomeScreen({ query, setQuery, onBell, unread, onBrowse, onOpenDish, onCheckout, onCoupon }) {

  const { dishes, add, cart } = useStore();

  const { width } = useWindowDimensions();

    const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const loadProducts = (query = '') => {
    if (query.trim() === '') {
      const rows = db.getAllSync('SELECT * FROM products ORDER BY id DESC');
      setProducts(rows);
    } else {
      const filtered = db.getAllSync(
        'SELECT * FROM products WHERE name LIKE ? ORDER BY name ASC',
        [`%${query}%`]
      );
      setProducts(filtered);
    }
  };

  useEffect(() => {
    initDatabase();
    loadProducts();
  }, []);

  const handleAddProduct = () => {
    const cleanName = name.trim();
    const cleanCategory = category.trim() || 'General';
    const parsedPrice = Number.parseFloat(price);
    const parsedStock = Number.parseInt(stock, 10);

    if (!cleanName || !price || !stock) {
      Alert.alert('Validation Error', 'Please fill in all product fields.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return;
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      Alert.alert('Validation Error', 'Please enter a valid stock quantity.');
      return;
    }

    try {
      db.runSync(
        'INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)',
        [cleanName, cleanCategory, parsedPrice, parsedStock]
      );

      setName('');
      setCategory('General');
      setPrice('');
      setStock('');
      setModalVisible(false);
      loadProducts(search);
    } catch (error) {
      Alert.alert('Database Error', 'The product could not be saved.');
      console.error('SQLite INSERT error:', error);
    }
  };

  const handleDeleteProduct = (id, productName) => {
    Alert.alert(
      'Delete Confirmation',
      `Remove ${productName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              db.runSync('DELETE FROM products WHERE id = ?', [id]);
              loadProducts(search);
            } catch (error) {
              Alert.alert('Database Error', 'The product could not be deleted.');
              console.error('SQLite DELETE error:', error);
            }
          },
        },
      ]
    );
  };

  const [drawer, setDrawer] = useState(false);

  const wide = width >= 1100;

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const cartTotal = Object.entries(cart).reduce((a, [id, n]) => {

    const d = dishes.find((x) => x.id === id);

    return a + (d ? d.price * n : 0);

  }, 0);



  const q = (query || '').toLowerCase();

  const based = basedOnIds

    .map((id) => dishes.find((d) => d.id === id))

    .filter((d) => d && d.name.toLowerCase().includes(q))

    .slice(0, 3);

  const trending = trendingIds.map((id) => dishes.find((d) => d.id === id)).filter(Boolean);



  return (

    <View style={styles.wrap}>

      <LinearGradient colors={['#FFF4EC', '#FFFFFF']} style={StyleSheet.absoluteFill} />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>

        <View style={styles.blobTR} />

        <View style={styles.blobBL} />

      </View>

      <View style={styles.feed}>

        <TopBar

          query={query} setQuery={setQuery} onBell={onBell} unread={unread}

          showCart={!wide} cartCount={cartCount} cartTotal={cartTotal + SERVICE_FEE} onCart={() => setDrawer(true)}

        />

        <ScrollView contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>

          <Hero onBrowse={onBrowse} />

          <View style={styles.sqliteSearchBox}>

  <Ionicons

    name="search-outline"

    size={18}

    color={COLORS.secondaryText}

  />



  <TextInput

    value={search}

    onChangeText={(text) => {

      setSearch(text);

      loadProducts(text);

    }}

    placeholder="Search products..."

    placeholderTextColor={COLORS.secondaryText}

    style={styles.sqliteSearchInput}

  />

</View>

<View style={styles.sqliteSection}>
  <View style={styles.sqliteHeaderRow}>
    <Text style={styles.sqliteTitle}>SQLite Inventory</Text>

    <TouchableOpacity
      style={styles.sqliteAddButton}
      onPress={() => setModalVisible(true)}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={16} color="#fff" />
      <Text style={styles.sqliteAddButtonText}>Add Product</Text>
    </TouchableOpacity>
  </View>

  <FlatList
    data={products}
    keyExtractor={(item) => String(item.id)}
    scrollEnabled={false}
    renderItem={({ item }) => (
      <View style={styles.sqliteProductCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sqliteProductName}>{item.name}</Text>
          <Text style={styles.sqliteProductMeta}>
            {item.category} • Stock: {item.stock}
          </Text>
        </View>

        <Text style={styles.sqliteProductPrice}>
          ₱{Number(item.price).toFixed(2)}
        </Text>

        <TouchableOpacity
          style={styles.sqliteDeleteButton}
          onPress={() => handleDeleteProduct(item.id, item.name)}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={17} color="#DC2626" />
        </TouchableOpacity>
      </View>
    )}
    ListEmptyComponent={
      <Text style={styles.sqliteEmpty}>
        No products found in SQLite database.
      </Text>
    }
  />
</View>

<Modal
  visible={modalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.sqliteModalOverlay}>
    <View style={styles.sqliteModalCard}>
      <View style={styles.sqliteModalHeader}>
        <Text style={styles.sqliteModalTitle}>Add Product</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          style={styles.sqliteModalClose}
        >
          <Ionicons name="close" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Product Name"
        placeholderTextColor={COLORS.secondaryText}
        style={styles.sqliteInput}
      />

      <TextInput
        value={category}
        onChangeText={setCategory}
        placeholder="Category"
        placeholderTextColor={COLORS.secondaryText}
        style={styles.sqliteInput}
      />

      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        placeholderTextColor={COLORS.secondaryText}
        keyboardType="decimal-pad"
        style={styles.sqliteInput}
      />

      <TextInput
        value={stock}
        onChangeText={setStock}
        placeholder="Stock"
        placeholderTextColor={COLORS.secondaryText}
        keyboardType="number-pad"
        style={styles.sqliteInput}
      />

      <View style={styles.sqliteModalActions}>
        <TouchableOpacity
          style={styles.sqliteCancelButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.sqliteCancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sqliteSaveButton}
          onPress={handleAddProduct}
          activeOpacity={0.85}
        >
          <Text style={styles.sqliteSaveText}>Save Product</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

          <SectionHead title="Based On The Type Of Food You Like" action="View All" count={12} onAction={onBrowse} />

          <View style={styles.cardRow}>

            {based.map((d, i) => (

              <HomeDishCard key={d.id} d={d} meta={HOME_META[d.id] || { restaurant: 'Local kitchen', distance: '1.0 km' }} index={i} onOpen={onOpenDish} />

            ))}

          </View>

          <View style={{ height: 18 }} />

          <SectionHead title="Trending Orders" action="View All" onAction={onBrowse} />

          <View style={styles.trendRow}>

            {trending.map((d, i) => (

              <TrendCard key={d.id} d={d} meta={HOME_META[d.id]} highlight={i === 1} onOpen={onOpenDish} onAdd={(id) => add(id, 1)} />

            ))}

          </View>

          <View style={{ height: 24 }} />

        </ScrollView>

      </View>

      {wide && <RightPanel onCheckout={onCheckout} onCoupon={onCoupon} />}

      <Modal visible={drawer} transparent animationType="slide" onRequestClose={() => setDrawer(false)}>

        <View style={styles.drawerOverlay}>

          <TouchableOpacity style={{ flex: 1 }} onPress={() => setDrawer(false)} activeOpacity={1} />

          <View style={styles.drawer}>

            <TouchableOpacity style={styles.drawerX} onPress={() => setDrawer(false)}>

              <Ionicons name="close" size={18} color={COLORS.text} />

            </TouchableOpacity>

            <RightPanel onCheckout={() => { setDrawer(false); onCheckout(); }} onCoupon={onCoupon} inDrawer />

          </View>

        </View>

      </Modal>

    </View>

  );

}



const styles = StyleSheet.create({

  wrap: { flex: 1, flexDirection: 'row' },

  blobTR: { position: 'absolute', top: -90, right: -90, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(242,107,29,0.09)' },

  blobBL: { position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(242,107,29,0.08)' },

  feed: { flex: 1, minWidth: 0 },

  feedContent: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 100 },

  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },

  secTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text },

  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  viewAllT: { fontFamily: FONTS.medium, fontSize: 11.5, color: COLORS.secondaryText },

  viewAllArrow: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

  cardRow: { flexDirection: 'row', gap: 12 },

  hero: { borderRadius: 24, overflow: 'hidden', marginBottom: 16, minHeight: 200, flexDirection: 'row' },

  heroLeft: { flex: 1, padding: 20, justifyContent: 'center' },

  deal: { fontFamily: FONTS.medium, fontSize: 11, letterSpacing: 1.5, color: COLORS.secondaryText },

  heroTitle: { fontFamily: FONTS.bold, fontSize: 34, color: COLORS.text, lineHeight: 39, marginTop: 6, maxWidth: 440 },

  heroSub: { fontFamily: FONTS.regular, fontSize: 14, color: '#555555', marginTop: 5 },

  heroBtnWrap: { alignSelf: 'flex-start', marginTop: 12 },

  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingLeft: 16, paddingRight: 6, paddingVertical: 6 },

  heroBtnT: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: '#fff' },

  heroArrow: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  dots: { flexDirection: 'row', gap: 6, marginTop: 12 },

  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D9CFC7' },

  dotA: { width: 20, backgroundColor: COLORS.primary },

  heroPhotoWrap: { width: '45%', position: 'relative' },

  heroPhoto: { flex: 1 },

  heroFade: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 64 },

  burst: { position: 'absolute', top: 12, right: 12, width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '12deg' }] },

  burstT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 11, textAlign: 'center', lineHeight: 13 },

  dCard: { flex: 1, minWidth: 0, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F0E6DF', padding: 12, ...SHADOW.card },

  dImg: { aspectRatio: 4 / 3, borderRadius: 14, overflow: 'hidden' },

  dHeart: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },

  dRate: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4, ...SHADOW.card },

  dRateT: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.text },

  dBody: { paddingTop: 9 },

  dName: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.text },

  dRest: { fontFamily: FONTS.regular, fontSize: 13, color: '#6B6B6B', marginTop: 2 },

  dInfo: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 8 },

  freeChip: { backgroundColor: '#E8F9EF', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },

  freeChipT: { fontFamily: FONTS.bold, fontSize: 11.5, color: COLORS.success },

  dMeta: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.secondaryText },

  dTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },

  dTag: { backgroundColor: '#F1F1F1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },

  dTagT: { fontFamily: FONTS.medium, fontSize: 11, color: '#555555' },

  dFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },

  dPrice: { fontFamily: FONTS.bold, fontSize: 16, color: '#1F1F1F' },

  dAdd: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  trendRow: { flexDirection: 'row', gap: 12 },

  trCard: { flex: 1, minWidth: 0 },

  trGrad: { flex: 1, flexDirection: 'row', borderRadius: 18, padding: 13, overflow: 'hidden', ...SHADOW.card },

  trPlain: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 13, overflow: 'hidden', ...SHADOW.card },

  trText: { flex: 1, minWidth: 0, justifyContent: 'center' },

  trTop: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.secondaryText },

  trName: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text, marginTop: 3 },

  trCal: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.secondaryText, marginTop: 2 },

  trFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9 },

  trPrice: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },

  trAdd: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

  trAddWhite: { backgroundColor: '#fff' },

  trCircle: { width: 92, height: 92, borderRadius: 46, marginRight: -46, borderWidth: 4, borderColor: '#fff', overflow: 'hidden', alignSelf: 'center', ...SHADOW.card },

  right: { width: 320, backgroundColor: '#fff', borderLeftWidth: 1, borderLeftColor: COLORS.border, padding: 16 },

  rightDrawer: { flex: 1, width: '100%', borderLeftWidth: 0 },

  rightHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 6 },

  rightTitle: { fontFamily: FONTS.bold, fontSize: 14.5, color: COLORS.text },

  count: { fontFamily: FONTS.regular, fontSize: 11.5, color: COLORS.secondaryText },

  balCard: { borderRadius: RADIUS.lg, padding: 15, overflow: 'hidden', marginBottom: 14 },

  balCircles: { position: 'absolute', right: -46, top: -46, width: 140, height: 140, borderRadius: 70, backgroundColor: '#ffffff22', borderWidth: 22, borderColor: '#ffffff18' },

  balTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  goldChip: { width: 34, height: 24, borderRadius: 6, backgroundColor: '#FFE1A8', alignItems: 'center', justifyContent: 'center', gap: 3 },

  goldLine: { width: 22, height: 2, borderRadius: 1, backgroundColor: '#C98A2B' },

  balLabel: { fontFamily: FONTS.regular, fontSize: 11, color: '#FFE9D6', marginTop: 8 },

  balValue: { fontFamily: FONTS.bold, fontSize: 23, color: '#fff' },

  balFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },

  balCard2: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#fff' },

  topUp: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 7, alignItems: 'center', marginTop: 10 },

  topUpT: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary },

  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },

  pinBox: { width: 30, height: 30, borderRadius: 10, backgroundColor: COLORS.lightOrange, alignItems: 'center', justifyContent: 'center' },

  addr: { fontFamily: FONTS.semiBold, fontSize: 12.5, color: COLORS.text, flex: 1 },

  change: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5 },

  changeT: { fontFamily: FONTS.semiBold, fontSize: 11, color: COLORS.primary },

  addrNote: { fontFamily: FONTS.regular, fontSize: 11.5, color: COLORS.secondaryText, marginTop: 7, lineHeight: 16 },

  addrBtns: { flexDirection: 'row', gap: 8, marginTop: 9, marginBottom: 12 },

  addrBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#F6F1EC', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },

  addrBtnT: { fontFamily: FONTS.medium, fontSize: 12, color: '#555555' },

  emptyCartBox: { alignItems: 'center', gap: 6, backgroundColor: COLORS.background, borderRadius: 12, padding: 18, marginBottom: 4 },

  emptyCartT: { fontFamily: FONTS.medium, fontSize: 12.5, color: COLORS.secondaryText },

  cartList: { maxHeight: 220, marginBottom: 4 },

  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border },

  cartImg: { width: 48, height: 48, borderRadius: 12, overflow: 'hidden' },

  cartName: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.text },

  cartPrice: { fontFamily: FONTS.medium, fontSize: 11.5, color: COLORS.primary, marginTop: 1 },

  trashBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },

  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },

  sumK: { fontFamily: FONTS.regular, fontSize: 12, color: '#555555' },

  sumV: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.text },

  sumFree: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.success },

  sumDisc: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.success },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },

  totalK: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text },

  totalV: { fontFamily: FONTS.bold, fontSize: 17, color: '#E8541A' },

  couponRow: { flexDirection: 'row', gap: 8, marginTop: 12 },

  couponInput: { flex: 1, borderWidth: 1.2, borderColor: COLORS.border, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9, fontFamily: FONTS.medium, fontSize: 12.5, color: COLORS.text, outlineStyle: 'none' },

  couponApply: { backgroundColor: COLORS.text, borderRadius: 11, paddingHorizontal: 16, justifyContent: 'center' },

  couponApplyT: { color: '#fff', fontFamily: FONTS.bold, fontSize: 12.5 },

  tryChip: { alignSelf: 'flex-start', backgroundColor: COLORS.lightOrange, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 6, marginTop: 8 },

  tryChipT: { fontFamily: FONTS.bold, fontSize: 11.5, color: COLORS.primary },

  couponMsg: { fontFamily: FONTS.semiBold, fontSize: 11.5, marginTop: 7 },

  snack: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.text, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10, marginTop: 10 },

  snackT: { fontFamily: FONTS.medium, fontSize: 12, color: '#fff', flex: 1 },

  snackUndo: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.gradientStart },

  checkout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, height: 52, marginTop: 10, ...SHADOW.button },

  checkoutT: { fontFamily: FONTS.semiBold, fontSize: 14, color: '#fff' },

  coArrow: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#ffffff35', alignItems: 'center', justifyContent: 'center' },

  drawerOverlay: { flex: 1, backgroundColor: '#1F1F1F66', flexDirection: 'row', justifyContent: 'flex-end' },

  drawer: { width: 340, maxWidth: '92%', height: '100%', backgroundColor: '#fff', padding: 14 },

  drawerX: { alignSelf: 'flex-end', width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },

  sqliteSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },

  sqliteSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.text,
    outlineStyle: 'none',
  },

  sqliteSection: {
    marginBottom: 18,
  },

  sqliteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },

  sqliteTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  sqliteAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  sqliteAddButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#fff',
  },

  sqliteProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  sqliteProductName: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  sqliteProductMeta: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 3,
  },

  sqliteProductPrice: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.primary,
    marginLeft: 10,
  },

  sqliteDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginLeft: 8,
  },

  sqliteEmpty: {
    textAlign: 'center',
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.secondaryText,
    paddingVertical: 16,
  },

  sqliteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  sqliteModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    ...SHADOW.card,
  },

  sqliteModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sqliteModalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },

  sqliteModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  sqliteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.text,
  },

  sqliteModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },

  sqliteCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },

  sqliteCancelText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.secondaryText,
  },

  sqliteSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },

  sqliteSaveText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  });
