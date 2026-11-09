import { useState } from 'react';
import { CLUB } from '../data.js';
import { kes, round50 } from '../lib.js';
import { useShop } from '../shop.jsx';

export default function Club() {
  const { addToCart } = useShop();
  const [freq, setFreq] = useState('biweekly');
  const fl = CLUB.freq.find(f => f[0] === freq)[1];

  const join = p => {
    const first = round50(p.p[freq] * 0.8);
    addToCart({ key: `club-${p.id}-${freq}`, id: 'club', name: `Subscription · ${p.name}`, img: 'subscription.jpg', meta: `${fl} · first delivery 20% off, then ${kes(p.p[freq])}`, price: first });
  };

  return (
    <section id="club" className="club">
      <div className="wrap">
        <div className="sh">
          <h2>Flowers on a schedule</h2>
          <p>The florist chooses what's best that week. Skip, pause or send a week to someone else from WhatsApp. First delivery is 20% off.</p>
        </div>
        <div className="toggle" role="group" aria-label="How often">
          {CLUB.freq.map(([id, l]) => <button key={id} aria-pressed={id === freq} onClick={() => setFreq(id)}>{l}</button>)}
        </div>
        <div className="plans">
          {CLUB.plans.map(p => (
            <div key={p.id} className="plan">
              <h3>{p.name}</h3>
              <p className="pr">{kes(p.p[freq])}<small> per delivery</small></p>
              <ul>{p.feat.map(f => <li key={f}>{f}</li>)}</ul>
              <button className={'btn sm block ' + (p.pop ? 'dark' : 'line')} onClick={() => join(p)}>Start · first one {kes(round50(p.p[freq] * 0.8))}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
