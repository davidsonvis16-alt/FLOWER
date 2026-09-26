import { useEffect, useRef, useState } from 'react';
import { CONFIG, PRODUCTS, ZONES } from '../data.js';
import { img, kes, minDeliveryDate, requestMpesaPayment, waLink } from '../lib.js';
import { useShop } from '../shop.jsx';
import { LogoSlot } from './icons.jsx';

export function Scrim() {
  const { overlay, close } = useShop();
  return <div className={'scrim' + (overlay && overlay !== 'menu' ? ' on' : '')} onClick={close} />;
}

export function Toast() {
  const { toastMsg, toastOn } = useShop();
  return <div className={'toast' + (toastOn ? ' on' : '')} role="status" aria-live="polite"><i>✓</i><span>{toastMsg}</span></div>;
}

export function Drawer() {
  const { overlay, open, close, cart, count, subtotal, zone, feeFor, setQty, remove } = useShop();
  const on = overlay === 'drawer';
  const left = Math.max(0, CONFIG.freeDeliveryOver - subtotal);
  const fee = feeFor(zone);
  return (
    <aside className={'drawer' + (on ? ' open' : '')} aria-label="Your bag" aria-hidden={!on} inert={!on}>
      <div className="hd"><h3>Your bag <span className="muted" style={{ fontSize: 16, fontWeight: 500 }}>{count ? `(${count})` : ''}</span></h3><button className="ic" onClick={close} aria-label="Close bag">✕</button></div>
      <div className="body">
        {!cart.length ? (
          <div className="emptyc">
            <div className="hand">Your bag is empty.</div>
            <p className="muted" style={{ margin: '10px 0 22px' }}>Nothing says “I forgot” like an empty bag.</p>
            <a className="btn dark" href="#shop" onClick={close}>Find something lovely</a>
          </div>
        ) : (
          <>
            <div className="free">
              {left ? <>You're <b>{kes(left)}</b> away from free delivery</> : <><b>You've unlocked free delivery</b> 🎉</>}
              <div className="bar"><i style={{ width: Math.min(100, subtotal / CONFIG.freeDeliveryOver * 100) + '%' }} /></div>
            </div>
            {cart.map(c => (
              <div className="line" key={c.key}>
                <div className="th"><img src={img(c.img)} alt="" /></div>
                <div className="inf"><b>{c.name}</b><small>{c.meta}</small>
                  <div className="q"><button onClick={() => setQty(c.key, -1)} aria-label="Decrease">−</button>{c.qty}<button onClick={() => setQty(c.key, 1)} aria-label="Increase">+</button></div>
                </div>
                <div className="rt"><b>{kes(c.price * c.qty)}</b><button className="rm" onClick={() => remove(c.key)}>Remove</button></div>
              </div>
            ))}
          </>
        )}
      </div>
      {cart.length > 0 && (
        <div className="ft">
          <div className="sum"><span>Subtotal</span><b>{kes(subtotal)}</b></div>
          <div className="sum"><span>Delivery <span className="muted">{zone ? `· ${zone}` : ''}</span></span><b>{fee === 0 ? 'Free' : fee == null ? 'from KES 300' : kes(fee)}</b></div>
          <div className="sum t"><span>Total</span><span>{kes(subtotal + (fee || 0))}</span></div>
          <button className="btn lime block" onClick={() => open('checkout')}>Checkout</button>
        </div>
      )}
    </aside>
  );
}

const EMPTY = { name: '', phone: '', recipient: '', rphone: '', zone: '', date: '', address: '' };
const newRef = () => 'PT-' + Math.floor(1000 + Math.random() * 9000);

export function Checkout() {
  const { overlay, close, cart, subtotal, zone, setZone, feeFor, clearCart } = useShop();
  const on = overlay === 'checkout';
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState('');
  const [stage, setStage] = useState('form');   // 'form' | 'paying' | 'done'
  const [info, setInfo] = useState({});

  // reset the form each time checkout opens
  useEffect(() => {
    if (!on) return;
    const min = minDeliveryDate();
    setF(v => ({ ...v, zone: zone || v.zone, date: !v.date || v.date < min ? min : v.date }));
    setErr(''); setStage('form');
  }, [on]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = k => e => { setF(v => ({ ...v, [k]: e.target.value })); if (k === 'zone' && e.target.value) setZone(e.target.value); };
  const z = ZONES.find(z => z.name === f.zone);
  const fee = feeFor(f.zone);
  const total = subtotal + (fee || 0);
  const totalLabel = kes(total) + (z || fee === 0 ? '' : ' + delivery');

  const validate = () => {
    const phone = f.phone.replace(/\s|-/g, ''), min = minDeliveryDate();
    if (!f.name.trim()) return ['Please add your name.'];
    if (!/^(?:\+?254|0)?[17]\d{8}$/.test(phone)) return ['Enter a valid Safaricom number, e.g. 0712 345 678.'];
    if (!f.recipient.trim()) return ['Who are the flowers for?'];
    if (!f.zone) return ['Choose a delivery area.'];
    if (!f.date || f.date < min) return ['Pick a delivery date from ' + min + '.'];
    if (!f.address.trim()) return ['Add the street / building so our rider can find it.'];
    return [null, { ...f, phone: '254' + phone.slice(-9) }];
  };

  const finish = (ref, how) => { setInfo({ ref, how }); setStage('done'); clearCart(); };

  const pay = async e => {
    e.preventDefault();
    const [msg, d] = validate(); setErr(msg || ''); if (msg) return;
    const ref = newRef();
    setInfo({ phone: d.phone.replace(/^254/, '0'), amount: total }); setStage('paying');
    try {
      await requestMpesaPayment({ phone: d.phone, amount: total, ref, order: d, items: cart });
      finish(ref, `paid ${kes(total)} via M-Pesa`);
    } catch (x) {
      setStage('form'); setErr(x.message || 'Payment did not go through. Try again or send the order on WhatsApp.');
    }
  };

  const sendWhatsApp = () => {
    const [msg, d] = validate(); setErr(msg || ''); if (msg) return;
    const ref = newRef();
    const text = [
      `New Petal order ${ref}`, '',
      ...cart.map(c => `• ${c.qty}× ${c.name} — ${kes(c.price * c.qty)}${c.meta ? `\n   ${c.meta}` : ''}`), '',
      `Total: ${totalLabel}`,
      `From: ${d.name} (${d.phone})`, `To: ${d.recipient}${d.rphone ? ' (' + d.rphone + ')' : ''}`,
      `Where: ${d.address}, ${d.zone}`, `When: ${d.date}`,
    ].join('\n');
    window.open(waLink(text), '_blank', 'noopener');
    finish(ref, "sent to us on WhatsApp — we'll confirm payment there");
  };

  return (
    <div className={'modal' + (on ? ' open' : '')} role="dialog" aria-modal="true" aria-labelledby="coTitle" aria-hidden={!on} inert={!on}>
      <button className="ic x" onClick={close} aria-label="Close">✕</button>
      {stage === 'form' && (
        <div>
          <h3 id="coTitle">Almost <span className="serif">there.</span></h3>
          <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>Total <b style={{ color: 'var(--ink)' }}>{totalLabel}</b></p>
          <form className="frm" noValidate onSubmit={pay}>
            <div className="row2">
              <label>Your name<input value={f.name} onChange={set('name')} required autoComplete="name" /></label>
              <label>M-Pesa number<input value={f.phone} onChange={set('phone')} required inputMode="tel" placeholder="07XX XXX XXX" autoComplete="tel" /></label>
            </div>
            <div className="row2">
              <label>Recipient name<input value={f.recipient} onChange={set('recipient')} required /></label>
              <label>Recipient phone<input value={f.rphone} onChange={set('rphone')} inputMode="tel" placeholder="Optional" /></label>
            </div>
            <div className="row2">
              <label>Area<select value={f.zone} onChange={set('zone')} required><option value="">Choose area</option>{ZONES.map(z => <option key={z.name}>{z.name}</option>)}</select></label>
              <label>Delivery date<input type="date" min={minDeliveryDate()} value={f.date} onChange={set('date')} required /></label>
            </div>
            <label>Street, building &amp; directions<input value={f.address} onChange={set('address')} required placeholder="e.g. Rose Ave, Apt 4B, gate code…" /></label>
            <p className="err" aria-live="assertive">{err}</p>
            <div className="mpesa-box"><LogoSlot file="mpesa.svg" alt="M-Pesa" text="M-PESA" />You'll get a prompt on your phone to enter your M-Pesa PIN.</div>
            <button className="btn lime block" type="submit">Pay with M-Pesa</button>
            <p className="or">or</p>
            <button className="btn block" type="button" onClick={sendWhatsApp}>Send order on WhatsApp</button>
          </form>
        </div>
      )}
      {stage === 'paying' && (
        <div className="stk"><div className="ring" /><h3>Check your <span className="serif">phone.</span></h3>
          <p className="muted" style={{ marginTop: 10 }}>Enter your M-Pesa PIN on <b style={{ color: 'var(--ink)' }}>{info.phone}</b> to pay {kes(info.amount)}.</p></div>
      )}
      {stage === 'done' && (
        <div className="stk"><div className="tick">✓</div><h3>Order <span className="serif">confirmed.</span></h3>
          <p className="muted" style={{ margin: '10px 0 20px' }}>Ref <b style={{ color: 'var(--ink)' }}>{info.ref}</b> · {info.how}. We'll WhatsApp you a photo when it's delivered.</p>
          <button className="btn dark" onClick={close}>Done</button></div>
      )}
    </div>
  );
}

export function SearchOverlay() {
  const { overlay, close, wish, toast } = useShop();
  const on = overlay === 'search' || overlay === 'wish';
  const onlyWish = overlay === 'wish';
  const [q, setQ] = useState('');
  const input = useRef();

  useEffect(() => {
    if (!on) return;
    setQ('');
    if (onlyWish) toast(wish.size ? `${wish.size} saved bouquet${wish.size > 1 ? 's' : ''}` : 'No favourites yet');
    else { const t = setTimeout(() => input.current.focus(), 300); return () => clearTimeout(t); }
  }, [on, onlyWish]); // eslint-disable-line react-hooks/exhaustive-deps

  const term = q.trim().toLowerCase();
  let list = PRODUCTS.filter(p => !term || (p.name + ' ' + p.desc + ' ' + p.k).toLowerCase().includes(term));
  if (onlyWish && !term) list = list.filter(p => wish.has(p.id));

  const go = (e, id) => {
    e.preventDefault(); close();
    const card = document.getElementById('p-' + id);
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      card.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 700, delay: 500 });
    }, 400);
  };

  return (
    <div className={'sover' + (on ? ' open' : '')} aria-hidden={!on} inert={!on}>
      <div className="wrap">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="inp" style={{ flex: 1 }}><label className="sr" htmlFor="sInput">Search</label><input id="sInput" ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search roses, sunflowers, sympathy…" /></div>
          <button className="ic" onClick={close} aria-label="Close search">✕</button>
        </div>
        <div className="sres">
          {list.length ? list.map(p => (
            <a key={p.id} href={'#p-' + p.id} onClick={e => go(e, p.id)}>
              <div className="th"><img src={img(p.img)} alt="" /></div>
              <div><b>{p.name}</b><small>{p.desc} · {kes(p.price)}</small></div>
            </a>
          )) : (
            <p className="muted">{onlyWish && !term ? 'No favourites yet — tap the ♡ on any bouquet.' : <>Nothing matches “{q}”. Try <b>roses</b> or <b>sunflowers</b>, or build your own.</>}</p>
          )}
        </div>
      </div>
    </div>
  );
}
