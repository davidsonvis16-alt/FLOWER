import { useEffect, useRef, useState } from 'react';
import { ZONES } from '../data.js';
import { beforeCutoff, img, kes, waLink } from '../lib.js';
import { useShop } from '../shop.jsx';

const SUGGEST = ['Westlands', 'Karen', 'Lavington', 'Kileleshwa', 'Runda', 'CBD'];

function ZoneChecker() {
  const { zone, setZone } = useShop();
  const [q, setQ] = useState(zone || 'Kilimani');
  const [res, setRes] = useState(null);

  const check = (value = q) => {
    const v = value.trim().toLowerCase();
    const z = ZONES.find(z => z.name.toLowerCase() === v) || (v.length > 2 && ZONES.find(z => z.name.toLowerCase().startsWith(v)));
    if (!z) { setRes({ miss: value }); return; }
    setQ(z.name); setZone(z.name);
    const today = beforeCutoff() && z.win !== 'next';
    setRes({ z, today });
  };
  useEffect(() => { check(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const z = res?.z;
  return (
    <form className="box rv" autoComplete="off" onSubmit={e => { e.preventDefault(); check(); }}>
      <div className="eyebrow">Delivery checker</div>
      <p className="ttl">Check your area</p>
      <div className="inp">
        <label className="sr" htmlFor="zoneInput">Your area</label>
        <input id="zoneInput" list="zoneList" placeholder="e.g. Kilimani" value={q} onChange={e => setQ(e.target.value)} />
        <datalist id="zoneList">{ZONES.map(z => <option key={z.name} value={z.name} />)}</datalist>
        <button type="submit">Check</button>
      </div>
      <div className="sugg">{SUGGEST.map(n => <button type="button" key={n} onClick={() => { setQ(n); check(n); }}>{n}</button>)}</div>
      <div className="res">
        <div><small>Delivery</small><b>{z ? kes(z.fee) : '—'}</b></div>
        <div><small>Arrives</small><b>{z ? (res.today ? 'Today' : 'Tomorrow') : '—'}</b></div>
        <div><small>Window</small><b>{z ? (res.today ? z.win : '9am–1pm') : '—'}</b></div>
      </div>
      {res?.miss !== undefined
        ? <p className="ok no">We don't list that area yet — <a href={waLink(`Hi Petal, do you deliver to ${res.miss}?`)} target="_blank" rel="noopener" style={{ textDecoration: 'underline' }}>ask us on WhatsApp</a>, we often can.</p>
        : z && <p className="ok">{res.today ? `✓ We deliver to ${z.name} same-day` : z.win === 'next' ? `✓ We deliver to ${z.name} next-day` : `✓ Order now for ${z.name} tomorrow morning`}</p>}
    </form>
  );
}

// Animated example of the rider tracker. Wire it to real order data later.
function Tracker() {
  const box = useRef(), path = useRef(), rider = useRef();
  const [k, setK] = useState(0.45);
  useEffect(() => {
    const L = path.current.getTotalLength();
    const place = v => { const p = path.current.getPointAtLength(Math.min(1, v) * L); rider.current.setAttribute('transform', `translate(${p.x} ${p.y})`); };
    place(0.45);
    let raf, t0;
    const frame = t => {
      let v = (t - t0) / 18000;
      if (v > 1.25) { t0 = t; v = 0; }
      place(v); setK(v);
      raf = requestAnimationFrame(frame);
    };
    // only animate while visible
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) { t0 = performance.now(); raf = requestAnimationFrame(frame); }
    });
    io.observe(box.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const done = k >= 1, step = done ? 4 : 2;
  const cls = i => i < step ? 'd' : i === step ? 'n' : 'w';
  const steps = [['Arranged by Faith', '11:40'], ['Picked up at studio', '12:25'], ['On the way · Ngong Rd', 'now'], ['Delivered with photo proof', '~13:20']];
  return (
    <div className="track rv" ref={box}>
      <div className="hd">
        <div><small>Order #PT-2841 · live example</small><div>{done ? 'Delivered — photo sent 📸' : `Kevin is ${Math.max(1, Math.ceil(12 * (1 - k)))} min away`}</div></div>
        <span className="plus" style={{ width: 44, height: 44 }} aria-hidden="true">🛵</span>
      </div>
      <div className="map">
        <svg viewBox="0 0 400 170" preserveAspectRatio="none" aria-hidden="true">
          <g stroke="#264634" strokeWidth="10" fill="none"><path d="M0 40h400M0 120h400M80 0v170M230 0v170M330 0v170" /></g>
          <path ref={path} d="M40 150 C120 150 90 60 180 70 S300 30 360 30" stroke="#d4f04a" strokeWidth="4" fill="none" strokeDasharray="8 7" />
          <circle cx="360" cy="30" r="9" fill="#f3c9cf" />
          <circle cx="40" cy="150" r="6" fill="#f4efe6" />
          <g ref={rider}><circle r="22" fill="#d4f04a" opacity=".2" /><circle r="11" fill="#d4f04a" /></g>
        </svg>
      </div>
      <ol className="tl">
        {steps.map(([t, time], i) => <li key={t} className={cls(i)}><i />{t}<small>{time}</small></li>)}
      </ol>
    </div>
  );
}

export default function Delivery() {
  return (
    <section id="delivery">
      <div className="wrap">
        <div className="sh rv"><h2>Where's it <span className="serif">going?</span></h2><p>Real riders, real-time tracking. Order before 2pm for today.</p></div>
        <div className="dgrid">
          <ZoneChecker />
          <div className="photo rv"><img src={img('delivery.jpg')} alt="A Petal scooter parked on the street with a crate of fresh flowers on the back" loading="lazy" style={{ objectPosition: '50% 30%' }} /><div className="hand">our riders,<br />not a courier</div></div>
          <Tracker />
        </div>
      </div>
    </section>
  );
}
