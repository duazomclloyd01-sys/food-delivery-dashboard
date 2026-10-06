import React, { createContext, useContext, useMemo, useState } from 'react';
import { dishes as seedDishes } from './data/mock';

const Store = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState({ d2: 1, d6: 1, d9: 1 }); // mirrors prototype: 3 items
  const [favorites, setFavorites] = useState(['d1', 'd3', 'd7', 'd5', 'd2', 'd6', 'd10', 'dx-buko']);
  const [coupon, setCoupon] = useState(null);
  const [history, setHistory] = useState([
    { id: '#ORD-8421', items: ['Chicken Adobo Meal x2', 'Buko Juice x1'], total: 457, status: 'Delivered', date: 'Today, 12:40 PM' },
    { id: '#ORD-8417', items: ['Halo-Halo Special x1', 'lumpiang Shanghai x1'], total: 308, status: 'Delivered', date: 'Yesterday, 7:15 PM' },
  ]);
  const [scheduled, setScheduled] = useState(() => {
    const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const shiftDay = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return isoDay(d); };
    const fridayISO = () => { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); return isoDay(d); };
    return [
      { id: 's1', dishId: 'd10', date: shiftDay(1), time: '12:30 PM', qty: 1, note: '', repeat: false, status: 'Scheduled' },
      { id: 's2', dishId: 'd7', date: fridayISO(), time: '3:00 PM', qty: 2, note: 'Extra ube please', repeat: true, status: 'Scheduled' },
      { id: 's3', dishId: 'd6', date: shiftDay(2), time: '6:30 PM', qty: 1, note: '', repeat: false, status: 'Scheduled' },
      { id: 's4', dishId: 'd5', date: shiftDay(-1), time: '6:30 PM', qty: 1, note: '', repeat: false, status: 'Delivered' },
      { id: 's5', dishId: 'dx-buko', date: shiftDay(3), time: '3:00 PM', qty: 1, note: '', repeat: false, status: 'Skipped' },
    ];
  });
  const [notifRead, setNotifRead] = useState(false);

  const add = (id, qty = 1) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + qty }));
  const dec = (id) => setCart((c) => {
    const n = (c[id] || 0) - 1;
    const next = { ...c };
    if (n <= 0) delete next[id]; else next[id] = n;
    return next;
  });
  const clearCart = () => { setCart({}); setCoupon(null); };
  const toggleFav = (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const cancelScheduled = (id) => setScheduled((s) => s.filter((x) => x.id !== id));

  const count = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

  const value = { cart, add, dec, clearCart, count, favorites, toggleFav, coupon, setCoupon, history, setHistory, scheduled, setScheduled, cancelScheduled, notifRead, setNotifRead, dishes: seedDishes };
  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export const useStore = () => useContext(Store);
