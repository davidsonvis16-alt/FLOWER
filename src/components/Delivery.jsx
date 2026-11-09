import { useEffect, useState } from 'react';
import { ZONES } from '../data.js';
import { STEPS, beforeCutoff, fmtDate, kes, orderStep, waLink } from '../lib.js';
import { useShop } from '../shop.jsx';

function ZoneChecker() {
  const { zone, setZone } = useShop();
  const [q, setQ] = useState(zone || '');
  const [res, setRes] = useState(zone ? { z: ZONES.find(z => z.name === zone) } : null);

  const check = (value = q) => {
    const v = value.trim().toLowerCase(); if (!v) return;
    const z = ZONES.find(z => z.name.toLowerCase() === v) || (v.length > 2 && ZONES.find(z => z.name.toLowerCase().startsWith(v)));
    if (!z) { setRes({ miss: value }); return; }
    setQ(z.name); setZone(z.name); setRes({ z });
  };
  const z = res?.z, today = z && beforeCutoff() && z.win !== 'next';

  return (
    <div className="checker">
      <form autoComplete="off" onSubmit={e => { e.preventDefault(); check(); }}>
        <label htmlFor="zoneInput">Your area</label>
        <div className="inp">
          <input id="zoneInput" list="zoneList" placeholder="e.g. Kilimani" value={q} onChange={e => setQ(e.target.value)} />
          <datalist id="zoneList">{ZONES.map(z => <option key={z.name} value={z.name} />)}</datalist>
          <button type="submit" className="btn dark sm">Check</button>
        </div>
      </form>
      {z && (
        <p className="answer">
          <b>{z.name}:</b> {kes(z.fee)} delivery.{' '}
          {today ? `Order now and it arrives today, ${z.win}.` : z.win === 'next' ? 'We deliver here next-day, 9am–1pm.' : 'Order now for tomorrow, 9am–1pm.'}
        </p>
      )}
      {res?.miss !== undefined && (
        <p className="answer">We don't list “{res.miss}” yet. <a href={waLink(`Hi Petal, do you deliver to ${res.miss}?`)} target="_blank" rel="noopener">Ask us on WhatsApp</a>. We often can.</p>
      )}
      <table className="zones">
        <thead><tr><th>Area</th><th>Fee</th><th>Same-day window</th></tr></thead>
        <tbody>
          {ZONES.map(x => (
            <tr key={x.name} className={z?.name === x.name ? 'on' : ''}>
              <td>{x.name}</td><td>{kes(x.fee)}</td><td>{x.win === 'next' ? 'Next day only' : x.win}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tracker() {
  const { orders, trackRef } = useShop();
  const [q, setQ] = useState(trackRef);
  const [ref, setRef] = useState(trackRef);
  const [, tick] = useState(0);
  useEffect(() => { if (trackRef) { setQ(trackRef); setRef(trackRef); } }, [trackRef]);
  useEffect(() => { const t = setInterval(() => tick(n => n + 1), 20000); return () => clearInterval(t); }, []);

  const o = ref && orders.find(x => x.ref.toLowerCase() === ref.trim().toLowerCase());
  const step = o ? orderStep(o) : 0;
  return (
    <div className="tracker" id="track">
      <h3>Track an order</h3>
      <form onSubmit={e => { e.preventDefault(); setRef(q); }}>
        <label className="sr" htmlFor="trackInput">Order reference</label>
        <div className="inp">
          <input id="trackInput" placeholder="Reference, e.g. PT-4821" value={q} onChange={e => setQ(e.target.value)} />
          <button type="submit" className="btn line sm">Track</button>
        </div>
      </form>
      {ref && !o && <p className="answer">We can't find {ref.trim()} on this device. <a href={waLink(`Hi Petal, where is my order ${ref.trim()}?`)} target="_blank" rel="noopener">Ask us on WhatsApp</a>.</p>}
      {o && (
        <div className="trk">
          <p className="answer"><b>{o.ref}</b> · {o.items.map(i => i.name).join(', ')} for {o.recipient}, {o.zone} · {fmtDate(o.date)}, {o.window}</p>
          <ol className="steps-l">
            {STEPS.map((t, i) => <li key={t} className={i < step ? 'd' : i === step ? 'n' : ''}>{t}{i === 3 && step === 3 ? ' · photo sent on WhatsApp' : ''}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function Delivery() {
  return (
    <section id="delivery">
      <div className="wrap">
        <div className="sh">
          <h2>Delivery</h2>
          <p>Our own riders, 20 neighbourhoods. Order before 2pm for the same day. Every delivery gets a photo at the door.</p>
        </div>
        <div className="dgrid">
          <ZoneChecker />
          <Tracker />
        </div>
      </div>
    </section>
  );
}
