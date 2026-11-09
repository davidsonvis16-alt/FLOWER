import { useEffect, useState } from 'react';
import { CONFIG } from '../data.js';
import { nbo, waLink } from '../lib.js';
import { useShop } from '../shop.jsx';

const LINKS = [['shop', 'Bouquets'], ['occasions', 'Occasions'], ['build', 'Build your own'], ['club', 'Subscriptions'], ['delivery', 'Delivery']];

// minutes left before the same-day cutoff; updates once a minute
function useCutoff() {
  const calc = () => {
    const n = nbo(), cut = new Date(n); cut.setUTCHours(CONFIG.cutoffHour, 0, 0, 0);
    return n >= cut ? null : Math.ceil((cut - n) / 60000);
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => { const t = setInterval(() => setLeft(calc()), 30000); return () => clearInterval(t); }, []);
  return left;
}

export function TopBar() {
  const left = useCutoff();
  const h = left && Math.floor(left / 60), m = left && left % 60;
  return (
    <div className="top">
      <div className="wrap">
        <span>{left
          ? <>Same-day delivery for orders in the next <b>{h ? `${h} h ` : ''}{m} min</b></>
          : <>Orders placed now arrive tomorrow from 9am</>}</span>
        <span className="r">Free delivery over KES {CONFIG.freeDeliveryOver.toLocaleString()}</span>
      </div>
    </div>
  );
}

export function Nav() {
  const { open, count, user } = useShop();
  return (
    <header className="nav">
      <div className="wrap">
        <a href="#top" className="logo" aria-label="Petal, home">Petal</a>
        <nav className="links" aria-label="Main">
          {LINKS.map(([id, l]) => <a key={id} href={'#' + id}>{l}</a>)}
        </nav>
        <div className="nr">
          <button className="tl" onClick={() => open('search')}>Search</button>
          <button className="tl" onClick={() => open(user ? 'account' : 'auth')}>{user ? user.name.split(' ')[0] : 'Sign in'}</button>
          <button className="tl bag" onClick={() => open('drawer')}>Bag <span className="n">{count}</span></button>
          <button className="tl burger" onClick={() => open('menu')} aria-label="Open menu">Menu</button>
        </div>
      </div>
    </header>
  );
}

export function MobileMenu() {
  const { overlay, close, open, user } = useShop();
  const on = overlay === 'menu';
  return (
    <div className={'mmenu' + (on ? ' open' : '')} aria-hidden={!on} inert={!on}>
      <div className="hd">
        <span className="logo">Petal</span>
        <button className="tl" onClick={close}>Close</button>
      </div>
      <nav aria-label="Mobile">
        {[...LINKS, ['track', 'Track an order'], ['reminders', 'Reminders']].map(([id, l]) => <a key={id} href={'#' + id} onClick={close}>{l}</a>)}
        <button onClick={() => open(user ? 'account' : 'auth')}>{user ? 'Your account' : 'Sign in'}</button>
      </nav>
      <a className="btn line" href={waLink("Hi Petal! I'd like to order flowers.")} target="_blank" rel="noopener">WhatsApp us</a>
    </div>
  );
}
