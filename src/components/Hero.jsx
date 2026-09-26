import { useEffect, useState } from 'react';
import { LIVE, PRODUCTS } from '../data.js';
import { img, kes } from '../lib.js';
import { useShop } from '../shop.jsx';
import { Arrow } from './icons.jsx';

function LiveOrders() {
  const [i, setI] = useState(0);
  const [mins, setMins] = useState(null);
  const [out, setOut] = useState(false);
  useEffect(() => {
    let swap;
    const t = setInterval(() => {
      setOut(true);
      swap = setTimeout(() => { setI(n => (n + 1) % LIVE.length); setMins(Math.floor(Math.random() * 9) + 1); setOut(false); }, 400);
    }, 5000);
    return () => { clearInterval(t); clearTimeout(swap); };
  }, []);
  const [who, what, to, where, pic] = LIVE[i];
  return (
    <div className={'live' + (out ? ' out' : '')} aria-live="polite">
      <div className="th"><img src={img(pic)} alt="" /></div>
      <div>
        <small><span className="pulse" />{mins ? `${mins} min ago` : 'Just now'} · {where}</small>
        <strong>{who} sent <u>{what}</u> to {to}</strong>
      </div>
    </div>
  );
}

export default function Hero() {
  const { addProduct } = useShop();
  const wild = PRODUCTS.find(p => p.id === 'wild');
  return (
    <section className="hero">
      <div className="wrap">
        <div className="rv">
          <div className="eyebrow kicker">Florist · Westlands, Nairobi</div>
          <h1>More than<br />just <span className="serif">flowers.</span></h1>
          <p className="lead">Hand-tied every morning from Limuru-grown stems, delivered by our own riders — so what you meant to say actually arrives.</p>
          <div className="cta">
            <a className="btn lime" href="#shop">Shop bouquets <Arrow /></a>
            <a className="btn" href="#build">Build your own</a>
          </div>
          <div className="chips">
            <span className="chip"><b>★ 4.9</b> · 2,300+ Nairobi orders</span>
            <span className="chip">🛵 Delivered in ~3 hrs</span>
            <span className="chip">Pay via <b>M-Pesa</b></span>
          </div>
        </div>
        <div className="stage rv">
          <div className="main"><img src={img('hero.jpg')} alt="A florist carrying an armful of dahlias, rudbeckia and zinnias" fetchPriority="high" style={{ objectPosition: '38% 50%' }} /></div>
          <div className="spin" aria-hidden="true">
            <svg viewBox="0 0 140 140"><defs><path id="circ" d="M70 70m-54 0a54 54 0 1 1 108 0a54 54 0 1 1-108 0" /></defs><text fontFamily="Bricolage" fontSize="11.5" fontWeight="700" letterSpacing="3.2" fill="#10261b"><textPath href="#circ">SAME DAY · NAIROBI · SAME DAY · NAIROBI ·</textPath></text></svg>
            <b>fresh<br />today</b>
          </div>
          <LiveOrders />
          <div className="polaroid">
            <div className="tape" />
            <div className="ph"><img src={img('workshop.jpg')} alt="Florist scissors, a notebook and zinnias on the studio table" loading="lazy" /></div>
            <span>tied by hand, 7am</span>
          </div>
          <div className="price-tag">
            <small style={{ opacity: 0.6, fontSize: 12 }}>In this photo</small>
            <div className="row">
              <div><b style={{ fontSize: 18 }}>{wild.name}</b><div style={{ opacity: 0.7, fontSize: 14 }}>{kes(wild.price)}</div></div>
              <button className="plus" onClick={() => addProduct('wild')} aria-label={`Add ${wild.name} to bag`}>+</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Marquee() {
  const run = <span>ROSES <em>&amp;</em> SUNFLOWERS <em>✺</em> LILIES <em>&amp;</em> PROTEAS <em>✺</em> SAME-DAY NAIROBI <em>✺</em> HAND-WRITTEN CARDS <em>&amp;</em> VASES <em>✺</em></span>;
  return <div className="marq" aria-hidden="true"><div className="mtrack">{run}{run}</div></div>;
}
