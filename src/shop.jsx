import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CONFIG, PRODUCTS, SIZES, ZONES } from './data.js';
import { round50, store } from './lib.js';

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => store.get('petal_cart', []));
  const [zone, setZoneState] = useState(() => store.get('petal_zone', null));
  const [wish, setWish] = useState(() => new Set(store.get('petal_wish', [])));
  const [overlay, setOverlay] = useState(null);          // 'drawer' | 'checkout' | 'search' | 'wish' | 'menu' | null
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const [bump, setBump] = useState(0);
  const toastT = useRef();

  useEffect(() => store.set('petal_cart', cart), [cart]);
  useEffect(() => store.set('petal_wish', [...wish]), [wish]);
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
    setBump(b => b + 1);
    toast(`${item.name} added to your bag`);
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
    toast(on ? `Saved ${p.name} ♥` : `Removed ${p.name}`);
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const feeFor = zoneName => {
    if (!cart.length || subtotal >= CONFIG.freeDeliveryOver) return 0;
    const z = ZONES.find(z => z.name === zoneName);
    return z ? z.fee : null;
  };

  const value = useMemo(() => ({
    cart, count, subtotal, zone, setZone, feeFor, addToCart, addProduct, setQty, remove, clearCart,
    wish, toggleWish, overlay, open: setOverlay, close: () => setOverlay(null),
    toast, toastMsg, toastOn, bump,
  }), [cart, zone, wish, overlay, toastMsg, toastOn, bump]); // eslint-disable-line react-hooks/exhaustive-deps

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
