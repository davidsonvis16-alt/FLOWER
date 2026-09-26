import { useState } from 'react';
import { CLUB } from '../data.js';
import { img, kes, round50 } from '../lib.js';
import { useShop } from '../shop.jsx';

export default function Club() {
  const { addToCart } = useShop();
  const [freq, setFreq] = useState('biweekly');
  const [plan, setPlan] = useState('signature');
  const p = CLUB.plans.find(x => x.id === plan);
  const first = round50(p.p[freq] * 0.8);

  const join = () => {
    const fl = CLUB.freq.find(f => f[0] === freq)[1];
    addToCart({ key: `club-${plan}-${freq}`, id: 'club', name: `Petal Club · ${p.name}`, img: 'subscription.jpg', meta: `${fl} · first box 20% off, then ${kes(p.p[freq])}`, price: first });
  };

  return (
    <section id="club" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="club">
          <div className="ph rv"><img src={img('subscription.jpg')} alt="Dahlias, chrysanthemums and waxflower arranged at the Petal market stall" loading="lazy" /><div className="stick">first box<br />20% off</div></div>
          <div className="copy rv">
            <div className="eyebrow">Petal Club</div>
            <h2 style={{ marginTop: 16 }}>Fresh blooms,<br /><span className="serif">on repeat.</span></h2>
            <p className="muted" style={{ fontSize: 17, marginTop: 18, maxWidth: 460 }}>A florist's-choice bouquet at your door or desk. Skip, pause or gift a week anytime — straight from WhatsApp.</p>
            <div className="toggle" role="group" aria-label="Delivery frequency">
              {CLUB.freq.map(([id, l]) => <button key={id} aria-pressed={id === freq} onClick={() => setFreq(id)}>{l}</button>)}
            </div>
            <div className="plans">
              {CLUB.plans.map(x => (
                <button key={x.id} className="plan" aria-pressed={x.id === plan} onClick={() => setPlan(x.id)}>
                  <b>{x.name}{x.pop && <span className="pop">Popular</span>}</b>
                  <div className="pr">{x.p[freq].toLocaleString()}</div>
                  <small>KES / delivery</small>
                  <ul>{x.feat.map(f => <li key={f}>{f}</li>)}</ul>
                </button>
              ))}
            </div>
            <button className="btn dark" onClick={join} style={{ marginTop: 20 }}>Start {p.name} · first box {kes(first)}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
