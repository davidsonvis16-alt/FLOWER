import { useEffect, useState } from 'react';
import { CONFIG } from '../data.js';
import { nbo, waLink } from '../lib.js';
import { useShop } from '../shop.jsx';
import { Bag, Burger, Heart, Search, User } from './icons.jsx';

const LINKS = [['shop', 'Shop'], ['occasions', 'Occasions'], ['build', 'Build a bouquet'], ['club', 'Petal Club'], ['delivery', 'Delivery']];

function useCountdown() {
  const calc = () => {
    const n = nbo(), cut = new Date(n); cut.setUTCHours(CONFIG.cutoffHour, 0, 0, 0);
    if (n >= cut) return null;
    const s = Math.floor((cut - n) / 1000), p = v => String(v).padStart(2, '0');
    return `${p(Math.floor(s / 3600))}:${p(Math.floor(s % 3600 / 60))}:${p(s % 60)}`;
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => { const t = setInterval(() => setLeft(calc()), 1000); return () => clearInterval(t); }, []);
  return left;
}

export function TopBar() {
  const left = useCountdown();
  return (
    <div className="top" role="region" aria-label="Delivery cutoff">
      <div className="wrap">
        <span>
          <span className="dot" />
          {left
            ? <>Order in <span className="cd">{left}</span> for same-day delivery anywhere in Nairobi</>
            : <>Same-day cutoff has passed — <b>order now for delivery tomorrow from 9am</b></>}
        </span>
        <span className="r">Free delivery over KES {CONFIG.freeDeliveryOver.toLocaleString()} &nbsp;·&nbsp; Pay with M-Pesa at checkout</span>
      </div>
    </div>
  );
}

export function Nav() {
  const { open, count, wish, bump } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('shop');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(scrollY > 10);
      let cur = LINKS[0][0];
      LINKS.forEach(([id]) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 160) cur = id; });
      setActive(cur);
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="wrap">
        <nav className="links" aria-label="Main">
          {LINKS.map(([id, l]) => <a key={id} href={'#' + id} className={active === id ? 'on' : ''}>{l}</a>)}
        </nav>
        <button className="ic burger" onClick={() => open('menu')} aria-label="Open menu"><Burger /></button>
        <a href="#top" className="logo" aria-label="Petal home">Petal<i>.</i></a>
        <div className="nr">
          <button className="search" onClick={() => open('search')} aria-label="Search bouquets"><Search /><span>Search “sunflowers”</span></button>
          <a className="ic acct" href="#reminders" aria-label="Your reminders"><User /></a>
          <button className="ic" onClick={() => open('wish')} aria-label="Wishlist">
            <Heart />{wish.size > 0 && <span className="badge">{wish.size}</span>}
          </button>
          <button className="ic fill" onClick={() => open('drawer')} aria-label="Open bag">
            <Bag /><span key={bump} className={'badge' + (bump ? ' bump' : '')}>{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileMenu() {
  const { overlay, close } = useShop();
  const on = overlay === 'menu';
  return (
    <div className={'mmenu' + (on ? ' open' : '')} aria-hidden={!on} inert={!on}>
      <div className="hd">
        <span className="logo" style={{ color: 'var(--paper)' }}>Petal<i>.</i></span>
        <button className="ic" onClick={close} aria-label="Close menu">✕</button>
      </div>
      <nav aria-label="Mobile">
        {[...LINKS, ['reminders', 'Reminders']].map(([id, l]) => <a key={id} href={'#' + id} onClick={close}>{l}</a>)}
      </nav>
      <a className="wa" href={waLink("Hi Petal! I'd like to order flowers.")} target="_blank" rel="noopener" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Chat on WhatsApp</a>
    </div>
  );
}
