import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CONFIG, PRODUCTS, SIZES, ZONES } from './data.js';
import { hashPw, isoDay, nbo, round50, store } from './lib.js';

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

export const DEMO = { email: 'demo@petal.co.ke', password: 'petal123', name: 'Amani Wanjiku', phone: '0712345678' };

const loadUser = () => {
  const email = store.get('petal_session', null), users = store.get('petal_users', {});
  return email && users[email] ? { email, ...users[email] } : null;
};
const saveUser = ({ email, ...rest }) => { const users = store.get('petal_users', {}); users[email] = rest; store.set('petal_users', users); };

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => store.get('petal_cart', []));
  const [zone, setZoneState] = useState(() => store.get('petal_zone', null));
  const [wish, setWish] = useState(() => new Set(store.get('petal_wish', [])));
  const [user, setUser] = useState(loadUser);
  const [orders, setOrders] = useState(() => store.get('petal_orders', []));
  const [overlay, setOverlay] = useState(null);   // 'drawer' | 'checkout' | 'search' | 'wish' | 'menu' | 'auth' | 'account' | null
  const [trackRef, setTrackRef] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const toastT = useRef();
  const afterAuth = useRef(null);

  useEffect(() => store.set('petal_cart', cart), [cart]);
  useEffect(() => store.set('petal_wish', [...wish]), [wish]);
  useEffect(() => store.set('petal_orders', orders), [orders]);
  useEffect(() => { document.body.classList.toggle('lock', !!overlay); }, [overlay]);
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setOverlay(null);
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); setOverlay('search'); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const toast = useCallback(msg => {
    setToastMsg(msg); setToastOn(true);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastOn(false), 2600);
  }, []);

  const addToCart = useCallback(item => {
    setCart(c => {
      const found = c.find(x => x.key === item.key);
      return found ? c.map(x => x === found ? { ...x, qty: x.qty + (item.qty || 1) } : x) : [...c, { qty: 1, ...item }];
    });
    toast(`${item.name} is in your bag`);
  }, [toast]);

  const addProduct = useCallback((id, size = 'M') => {
    const p = PRODUCTS.find(x => x.id === id); if (!p) return;
    const mult = SIZES.find(s => s[0] === size)[1];
    addToCart({ key: p.id + '-' + size, id: p.id, name: p.name, img: p.img, meta: `Size ${size} · ${p.desc}`, price: round50(p.price * mult) });
  }, [addToCart]);

  const setQty = (key, d) => setCart(c => c.map(x => x.key === key ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0));
  const remove = key => setCart(c => c.filter(x => x.key !== key));
  const clearCart = () => setCart([]);
  const setZone = z => { setZoneState(z); store.set('petal_zone', z); };

  const toggleWish = p => {
    const on = !wish.has(p.id);
    setWish(w => { const n = new Set(w); on ? n.add(p.id) : n.delete(p.id); return n; });
    toast(on ? `Saved ${p.name}` : `Removed ${p.name}`);
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const feeFor = zoneName => {
    if (!cart.length || subtotal >= CONFIG.freeDeliveryOver) return 0;
    const z = ZONES.find(z => z.name === zoneName);
    return z ? z.fee : null;
  };

  /* ----- accounts (demo, stored in this browser) ----- */
  const finishAuth = u => {
    store.set('petal_session', u.email); setUser(u);
    const next = afterAuth.current; afterAuth.current = null;
    setOverlay(next);
    toast(`Welcome${next ? ' back' : ''}, ${u.name.split(' ')[0]}`);
  };
  const ensureDemo = async () => {
    const users = store.get('petal_users', {});
    if (users[DEMO.email]) return;
    saveUser({ email: DEMO.email, name: DEMO.name, phone: DEMO.phone, pass: await hashPw(DEMO.password), address: { zone: 'Kilimani', line: 'Argwings Kodhek Rd, Apt 6C' }, created: Date.now() });
    const past = new Date(nbo()); past.setUTCDate(past.getUTCDate() - 12);
    setOrders(o => o.some(x => x.ref === 'PT-1187') ? o : [...o, {
      ref: 'PT-1187', email: DEMO.email, placed: past.getTime(), date: isoDay(past), window: '3–5pm', zone: 'Kilimani',
      address: 'Argwings Kodhek Rd, Apt 6C', recipient: 'Mum', items: [{ name: 'The Sunrise', qty: 1, price: 3800, meta: 'Size M' }],
      subtotal: 3800, fee: 350, total: 4150, method: 'M-Pesa',
    }]);
  };
  const signIn = async (email, password) => {
    email = email.trim().toLowerCase();
    if (email === DEMO.email) await ensureDemo();
    const u = store.get('petal_users', {})[email];
    if (!u || u.pass !== await hashPw(password)) throw new Error("That email and password don't match an account.");
    finishAuth({ email, ...u });
  };
  const signUp = async ({ name, email, phone, password }) => {
    email = email.trim().toLowerCase();
    if (store.get('petal_users', {})[email]) throw new Error('There is already an account with that email. Sign in instead.');
    const u = { email, name: name.trim(), phone, pass: await hashPw(password), address: null, created: Date.now() };
    saveUser(u); finishAuth(u);
  };
  const signOut = () => { store.set('petal_session', null); setUser(null); setOverlay(null); toast('Signed out'); };
  const updateUser = patch => setUser(u => { const n = { ...u, ...patch }; saveUser(n); return n; });
  const requireAuth = next => { afterAuth.current = next; setOverlay('auth'); };

  const addOrder = o => setOrders(list => [...list, o]);
  const track = ref => { setTrackRef(ref); setOverlay(null); setTimeout(() => document.getElementById('track')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); };

  const value = useMemo(() => ({
    cart, count, subtotal, zone, setZone, feeFor, addToCart, addProduct, setQty, remove, clearCart,
    wish, toggleWish, overlay, open: setOverlay, close: () => setOverlay(null),
    user, signIn, signUp, signOut, updateUser, requireAuth, orders, addOrder, trackRef, track,
    toast, toastMsg, toastOn,
  }), [cart, zone, wish, overlay, user, orders, trackRef, toastMsg, toastOn]); // eslint-disable-line react-hooks/exhaustive-deps

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
