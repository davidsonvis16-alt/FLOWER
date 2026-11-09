import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CONFIG, PRODUCTS, ZONES } from '../data.js';
import {
  STEPS, TEST, beforeCutoff, cardAuthorise, cardBrand, cardConfirm, digits, expiryOk, fmtCard, fmtDate, fmtExpiry, img, isoDay, kes,
  luhn, minDeliveryDate, mpesaCharge, nbo, normPhone, orderStep, requestMpesaPayment, validEmail, waLink,
} from '../lib.js';
import { DEMO, useShop } from '../shop.jsx';
import { LogoSlot } from './icons.jsx';

export function Scrim() {
  const { overlay, close } = useShop();
  return <div className={'scrim' + (overlay && overlay !== 'menu' ? ' on' : '')} onClick={close} />;
}

export function Toast() {
  const { toastMsg, toastOn } = useShop();
  return <div className={'toast' + (toastOn ? ' on' : '')} role="status" aria-live="polite">{toastMsg}</div>;
}

const DemoNote = ({ children }) => CONFIG.demo ? <p className="demo">Demo · {children}</p> : null;

/* ---------------- Bag ---------------- */
export function Drawer() {
  const { overlay, open, close, cart, count, subtotal, zone, feeFor, setQty, remove } = useShop();
  const on = overlay === 'drawer';
  const left = Math.max(0, CONFIG.freeDeliveryOver - subtotal);
  const fee = feeFor(zone);
  return (
    <aside className={'panel' + (on ? ' open' : '')} aria-label="Your bag" aria-hidden={!on} inert={!on}>
      <div className="hd"><h3>Bag {count ? `(${count})` : ''}</h3><button className="tl" onClick={close}>Close</button></div>
      <div className="body">
        {!cart.length ? (
          <div className="emptyc">
            <p>Your bag is empty.</p>
            <a className="btn dark sm" href="#shop" onClick={close}>See bouquets</a>
          </div>
        ) : (
          <>
            <p className="free">{left ? <>Add {kes(left)} more for free delivery.</> : <>Delivery is free on this order.</>}</p>
            {cart.map(c => (
              <div className="line" key={c.key}>
                <div className="th"><img src={img(c.img)} alt="" /></div>
                <div className="inf"><b>{c.name}</b><small>{c.meta}</small>
                  <div className="q"><button onClick={() => setQty(c.key, -1)} aria-label="One fewer">−</button>{c.qty}<button onClick={() => setQty(c.key, 1)} aria-label="One more">+</button>
                    <button className="link" onClick={() => remove(c.key)}>Remove</button></div>
                </div>
                <b className="rt">{kes(c.price * c.qty)}</b>
              </div>
            ))}
          </>
        )}
      </div>
      {cart.length > 0 && (
        <div className="ft">
          <div className="sum"><span>Subtotal</span><b>{kes(subtotal)}</b></div>
          <div className="sum"><span>Delivery{zone ? ` · ${zone}` : ''}</span><b>{fee === 0 ? 'Free' : fee == null ? 'from KES 300' : kes(fee)}</b></div>
          <button className="btn dark block" onClick={() => open('checkout')}>Checkout · {kes(subtotal + (fee || 0))}</button>
        </div>
      )}
    </aside>
  );
}

/* ---------------- Checkout ---------------- */
const EMPTY = { name: '', phone: '', email: '', recipient: '', rphone: '', zone: '', date: '', window: '', address: '', note: '' };
const EMPTY_CARD = { number: '', exp: '', cvc: '', holder: '' };
const newRef = () => 'PT-' + Math.floor(1000 + Math.random() * 9000);

function windowsFor(zoneName, date) {
  const z = ZONES.find(x => x.name === zoneName);
  const today = isoDay(nbo());
  if (z && date === today && beforeCutoff() && z.win !== 'next') return [z.win];
  return ['9am–1pm', '2–6pm'];
}

export function Checkout() {
  const { overlay, close, cart, subtotal, zone, setZone, feeFor, clearCart, user, updateUser, requireAuth, addOrder, track } = useShop();
  const on = overlay === 'checkout';
  const [f, setF] = useState(EMPTY);
  const [method, setMethod] = useState('mpesa');
  const [mp, setMp] = useState('');
  const [card, setCard] = useState(EMPTY_CARD);
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('form');   // form | stk | otp | done
  const [done, setDone] = useState(null);
  const pending = useRef(null);

  useEffect(() => {
    if (!on) return;
    if (stage === 'done') { setStage('form'); setDone(null); }
    const min = minDeliveryDate();
    setF(v => ({
      ...v,
      name: v.name || user?.name || '', phone: v.phone || user?.phone || '', email: v.email || user?.email || '',
      zone: v.zone || zone || user?.address?.zone || '', address: v.address || user?.address?.line || '',
      date: !v.date || v.date < min ? min : v.date,
    }));
    setMp(m => m || user?.phone || '');
    setErr(''); setBusy(false);
  }, [on, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const wins = windowsFor(f.zone, f.date);
  useEffect(() => { if (!wins.includes(f.window)) setF(v => ({ ...v, window: wins[0] })); }, [wins.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = k => e => { const val = e.target.value; setF(v => ({ ...v, [k]: val })); if (k === 'zone' && val) setZone(val); };
  const fee = feeFor(f.zone);
  const total = subtotal + (fee || 0);
  const num = digits(card.number), brand = cardBrand(num);

  const validate = () => {
    if (!f.recipient.trim()) return 'Who are the flowers for?';
    if (!f.zone) return 'Choose the delivery area.';
    if (!f.date || f.date < minDeliveryDate()) return 'Choose a delivery date from ' + fmtDate(minDeliveryDate()) + '.';
    if (!f.address.trim()) return 'Add the street and building so the rider can find it.';
    if (f.rphone && !normPhone(f.rphone)) return "The recipient's phone number doesn't look right.";
    if (!f.name.trim()) return 'Add your name.';
    if (!normPhone(f.phone)) return 'Add your phone number, e.g. 0712 345 678.';
    if (f.email && !validEmail(f.email)) return 'That email address looks wrong.';
    if (method === 'mpesa' && !normPhone(mp)) return 'Enter the M-Pesa number to charge, e.g. 0712 345 678.';
    if (method === 'card') {
      if (!luhn(num)) return 'That card number is not valid. Check the digits.';
      if (!brand) return 'We accept Visa and Mastercard.';
      if (!expiryOk(card.exp)) return 'Check the expiry date (MM / YY).';
      if (!/^\d{3,4}$/.test(card.cvc)) return 'The security code is the 3 digits on the back.';
      if (!card.holder.trim()) return 'Add the name on the card.';
    }
    return '';
  };

  const place = (how, receipt) => {
    const ref = newRef();
    const order = {
      ref, receipt, email: user?.email || null, placed: Date.now(), date: f.date, window: f.window, zone: f.zone,
      address: f.address.trim(), recipient: f.recipient.trim(), rphone: f.rphone, note: f.note.trim(), from: f.name.trim(), phone: normPhone(f.phone),
      items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price, meta: c.meta })), subtotal, fee: fee || 0, total, method: how,
    };
    addOrder(order);
    if (user) updateUser({ address: { zone: f.zone, line: f.address.trim() }, phone: user.phone || normPhone(f.phone) });
    clearCart(); setCard(EMPTY_CARD); setOtp('');
    setF(v => ({ ...EMPTY, name: v.name, phone: v.phone, email: v.email }));
    setDone(order); setStage('done');
  };

  const pay = async e => {
    e.preventDefault();
    const msg = validate(); setErr(msg); if (msg) return;
    if (method === 'mpesa') {
      setStage('stk');
      try {
        const phone = normPhone(mp);
        const r = CONFIG.mpesaEndpoint
          ? await requestMpesaPayment({ phone: '254' + phone.slice(1), amount: total, items: cart })
          : await mpesaCharge({ phone, amount: total });
        place('M-Pesa', r.receipt);
      } catch (x) { setStage('form'); setErr(x.message); }
    } else {
      setBusy(true);
      try {
        await cardAuthorise({ number: num, amount: total });
        pending.current = { brand, last4: num.slice(-4) };
        setStage('otp');
      } catch (x) { setErr(x.message); }
      setBusy(false);
    }
  };

  const confirmOtp = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await cardConfirm({ otp: otp.trim() });
      place(`${pending.current.brand} ·· ${pending.current.last4}`, r.receipt);
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };

  const sendWhatsApp = () => {
    const msg = validate(); if (msg && !/M-Pesa|card|expiry|security|name on/.test(msg)) { setErr(msg); return; }
    const ref = newRef();
    const text = [
      `New Petal order ${ref}`, '',
      ...cart.map(c => `• ${c.qty}× ${c.name}: ${kes(c.price * c.qty)}${c.meta ? `\n   ${c.meta}` : ''}`), '',
      `Total: ${kes(total)}`,
      `From: ${f.name} (${f.phone})`, `To: ${f.recipient}${f.rphone ? ' (' + f.rphone + ')' : ''}`,
      `Where: ${f.address}, ${f.zone}`, `When: ${f.date}, ${f.window}`, f.note ? `Note: ${f.note}` : '',
    ].filter(Boolean).join('\n');
    window.open(waLink(text), '_blank', 'noopener');
  };

  return (
    <div className={'modal wide' + (on ? ' open' : '')} role="dialog" aria-modal="true" aria-labelledby="coTitle" aria-hidden={!on} inert={!on}>
      <button className="tl x" onClick={close}>Close</button>

      {stage === 'form' && (
        <form className="co" noValidate onSubmit={pay}>
          <div className="co-main">
            <h3 id="coTitle">Checkout</h3>
            {!user && <p className="muted small">Ordered before? <button type="button" className="link" onClick={() => requireAuth('checkout')}>Sign in</button> and we'll fill this in. Or carry on as a guest.</p>}

            <fieldset>
              <legend>Delivery</legend>
              <div className="row2">
                <label>Recipient's name<input value={f.recipient} onChange={set('recipient')} /></label>
                <label>Recipient's phone <span className="opt">optional</span><input value={f.rphone} onChange={set('rphone')} inputMode="tel" placeholder="So the rider can call" /></label>
              </div>
              <div className="row3">
                <label>Area<select value={f.zone} onChange={set('zone')}><option value="">Choose</option>{ZONES.map(z => <option key={z.name}>{z.name}</option>)}</select></label>
                <label>Date<input type="date" min={minDeliveryDate()} value={f.date} onChange={set('date')} /></label>
                <label>Time<select value={f.window} onChange={set('window')}>{wins.map(w => <option key={w}>{w}</option>)}</select></label>
              </div>
              <label>Street, building and directions<input value={f.address} onChange={set('address')} placeholder="e.g. Rose Ave, Apt 4B, blue gate" /></label>
              <label>Note for the florist <span className="opt">optional</span><input value={f.note} onChange={set('note')} placeholder="e.g. no lilies, she has cats" maxLength="120" /></label>
            </fieldset>

            <fieldset>
              <legend>You</legend>
              <div className="row3">
                <label>Name<input value={f.name} onChange={set('name')} autoComplete="name" /></label>
                <label>Phone<input value={f.phone} onChange={set('phone')} inputMode="tel" placeholder="07XX XXX XXX" autoComplete="tel" /></label>
                <label>Email <span className="opt">for the receipt</span><input value={f.email} onChange={set('email')} type="email" autoComplete="email" /></label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Payment</legend>
              <div className="methods" role="radiogroup" aria-label="Payment method">
                <button type="button" role="radio" aria-checked={method === 'mpesa'} onClick={() => setMethod('mpesa')}><LogoSlot file="mpesa.svg" alt="" text="M-PESA" />M-Pesa</button>
                <button type="button" role="radio" aria-checked={method === 'card'} onClick={() => setMethod('card')}>
                  <span className="logos"><LogoSlot file="visa.svg" alt="" text="VISA" /><LogoSlot file="mastercard.svg" alt="" text="MC" /></span>Card</button>
              </div>
              {method === 'mpesa' ? (
                <>
                  <label>M-Pesa number<input value={mp} onChange={e => setMp(e.target.value)} inputMode="tel" placeholder="07XX XXX XXX" /></label>
                  <p className="muted small">You'll get a prompt on this phone. Enter your M-Pesa PIN to pay {kes(total)}.</p>
                  <DemoNote>No money moves. Any number pays; {TEST.mpesaFail.replace(/(\d{4})(\d{3})/, '$1 $2 ')} shows a cancelled payment.</DemoNote>
                </>
              ) : (
                <>
                  <label>Card number
                    <span className="cardnum">
                      <input value={card.number} onChange={e => setCard(c => ({ ...c, number: fmtCard(e.target.value) }))} inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" />
                      {brand && <span className="brand">{brand}</span>}
                    </span>
                  </label>
                  <div className="row3">
                    <label>Expiry<input value={card.exp} onChange={e => setCard(c => ({ ...c, exp: fmtExpiry(e.target.value) }))} inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" /></label>
                    <label>Security code<input value={card.cvc} onChange={e => setCard(c => ({ ...c, cvc: digits(e.target.value).slice(0, 4) }))} inputMode="numeric" autoComplete="cc-csc" placeholder="123" /></label>
                    <label>Name on card<input value={card.holder} onChange={e => setCard(c => ({ ...c, holder: e.target.value }))} autoComplete="cc-name" /></label>
                  </div>
                  <DemoNote>No money moves. Use 4242 4242 4242 4242, any future date and any 3 digits. 4000 0000 0000 0002 is declined.</DemoNote>
                </>
              )}
            </fieldset>
            <p className="err" aria-live="assertive">{err}</p>
            <button className="btn dark block" type="submit" disabled={busy}>{busy ? 'Contacting your bank…' : `Pay ${kes(total)}`}</button>
            <button className="link wa-alt" type="button" onClick={sendWhatsApp}>Rather pay on WhatsApp? Send us this order instead.</button>
          </div>

          <aside className="co-sum">
            <h4>Order</h4>
            {cart.map(c => (
              <div className="sline" key={c.key}>
                <div className="th"><img src={img(c.img)} alt="" /></div>
                <div><b>{c.qty} × {c.name}</b><small>{c.meta}</small></div>
                <span>{kes(c.price * c.qty)}</span>
              </div>
            ))}
            <div className="sum"><span>Subtotal</span><span>{kes(subtotal)}</span></div>
            <div className="sum"><span>Delivery{f.zone ? ` · ${f.zone}` : ''}</span><span>{fee === 0 ? 'Free' : fee == null ? 'choose area' : kes(fee)}</span></div>
            <div className="sum t"><span>Total</span><span>{kes(total)}</span></div>
          </aside>
        </form>
      )}

      {stage === 'stk' && (
        <motion.div className="stk" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}>
          <h3>Check your phone</h3>
          <p>We sent an M-Pesa request for <b>{kes(total)}</b> to <b>{normPhone(mp)}</b>. Enter your PIN on the phone to finish.</p>
          <div className="bar" aria-hidden="true"><i /></div>
          <p className="muted small">This page updates by itself once the payment goes through.</p>
        </motion.div>
      )}

      {stage === 'otp' && (
        <motion.form className="stk" onSubmit={confirmOtp} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}>
          <h3>Confirm with your bank</h3>
          <p>Your bank sent a code by SMS to confirm {kes(total)} on {pending.current?.brand} ending {pending.current?.last4}.</p>
          <label className="otp">One-time code<input value={otp} onChange={e => setOtp(digits(e.target.value).slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus /></label>
          <DemoNote>The code is {TEST.otp}.</DemoNote>
          <p className="err" aria-live="assertive">{err}</p>
          <button className="btn dark block" type="submit" disabled={busy || otp.length < 6}>{busy ? 'Checking…' : 'Confirm payment'}</button>
          <button className="link" type="button" onClick={() => { setStage('form'); setErr(''); }}>Use a different card</button>
        </motion.form>
      )}

      {stage === 'done' && done && (
        <motion.div className="stk" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}>
          <motion.svg className="tick" viewBox="0 0 52 52" aria-hidden="true"><motion.circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} /><motion.path d="M16 27l7 7 14-15" fill="none" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.45, duration: 0.4 }} /></motion.svg>
          <h3>Thank you, {done.from.split(' ')[0]}</h3>
          <p>Order <b>{done.ref}</b> is paid ({done.method}, receipt {done.receipt}). {done.recipient} gets it {fmtDate(done.date)}, {done.window}. We'll WhatsApp you a photo at the door.</p>
          <div className="done-act">
            <button className="btn dark" onClick={() => track(done.ref)}>Track this order</button>
            <button className="btn line" onClick={close}>Keep shopping</button>
          </div>
          {!user && <p className="muted small">Want this in an order history? <button className="link" onClick={() => requireAuth('account')}>Create an account</button>. Future orders will be saved there.</p>}
        </motion.div>
      )}
    </div>
  );
}

/* ---------------- Sign in / create account ---------------- */
export function Auth() {
  const { overlay, close, signIn, signUp } = useShop();
  const on = overlay === 'auth';
  const [mode, setMode] = useState('in');   // in | up | reset
  const [v, setV] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (on) { setErr(''); setNote(''); setBusy(false); } }, [on]);
  const set = k => e => setV(x => ({ ...x, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setErr(''); setNote('');
    if (!validEmail(v.email)) { setErr('Enter a valid email address.'); return; }
    if (mode === 'reset') { setNote(`If there's an account for ${v.email.trim()}, a reset link is on its way.`); return; }
    if (mode === 'up') {
      if (!v.name.trim()) { setErr('Add your name.'); return; }
      if (!normPhone(v.phone)) { setErr('Add a Kenyan mobile number, e.g. 0712 345 678.'); return; }
      if (v.password.length < 8) { setErr('Use at least 8 characters for the password.'); return; }
    } else if (!v.password) { setErr('Enter your password.'); return; }
    setBusy(true);
    await new Promise(r => setTimeout(r, 500));
    try {
      if (mode === 'up') await signUp({ ...v, phone: normPhone(v.phone) });
      else await signIn(v.email, v.password);
      setV({ name: '', email: '', phone: '', password: '' });
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };

  return (
    <div className={'modal' + (on ? ' open' : '')} role="dialog" aria-modal="true" aria-labelledby="authTitle" aria-hidden={!on} inert={!on}>
      <button className="tl x" onClick={close}>Close</button>
      <h3 id="authTitle">{mode === 'up' ? 'Create an account' : mode === 'reset' ? 'Reset your password' : 'Sign in'}</h3>
      <p className="muted small">{mode === 'reset' ? "We'll email you a link." : 'Faster checkout, your order history and saved dates.'}</p>
      <form className="frm" noValidate onSubmit={submit}>
        {mode === 'up' && <label>Name<input value={v.name} onChange={set('name')} autoComplete="name" /></label>}
        <label>Email<input type="email" value={v.email} onChange={set('email')} autoComplete="email" /></label>
        {mode === 'up' && <label>Phone<input value={v.phone} onChange={set('phone')} inputMode="tel" placeholder="07XX XXX XXX" autoComplete="tel" /></label>}
        {mode !== 'reset' && <label>Password<input type="password" value={v.password} onChange={set('password')} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} /></label>}
        <p className="err" aria-live="assertive">{err}</p>
        {note && <p className="ok">{note}</p>}
        <button className="btn dark block" disabled={busy}>{busy ? 'One moment…' : mode === 'up' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</button>
      </form>
      <div className="auth-alt">
        {mode === 'in' && <><button className="link" onClick={() => setMode('up')}>New here? Create an account</button><button className="link" onClick={() => setMode('reset')}>Forgot password?</button></>}
        {mode !== 'in' && <button className="link" onClick={() => setMode('in')}>Back to sign in</button>}
      </div>
      {CONFIG.demo && mode === 'in' && (
        <p className="demo">Demo · accounts are stored in this browser only.{' '}
          <button className="link" onClick={() => { setV(x => ({ ...x, email: DEMO.email, password: DEMO.password })); setErr(''); }}>Fill in the demo account</button></p>
      )}
    </div>
  );
}

/* ---------------- Account ---------------- */
export function Account() {
  const { overlay, close, user, orders, signOut, track, updateUser, toast } = useShop();
  const on = overlay === 'account' && !!user;
  const [edit, setEdit] = useState(false);
  const [p, setP] = useState({ name: '', phone: '' });
  useEffect(() => { if (on) { setEdit(false); setP({ name: user.name, phone: user.phone || '' }); } }, [on]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!user) return null;
  const mine = orders.filter(o => o.email === user.email).sort((a, b) => b.placed - a.placed);

  const save = e => {
    e.preventDefault();
    if (!p.name.trim() || !normPhone(p.phone)) { toast('Add a name and a valid phone number'); return; }
    updateUser({ name: p.name.trim(), phone: normPhone(p.phone) }); setEdit(false); toast('Details saved');
  };

  return (
    <aside className={'panel' + (on ? ' open' : '')} aria-label="Your account" aria-hidden={!on} inert={!on}>
      <div className="hd"><h3>{user.name}</h3><button className="tl" onClick={close}>Close</button></div>
      <div className="body">
        <div className="acc-block">
          {edit ? (
            <form className="frm" onSubmit={save}>
              <label>Name<input value={p.name} onChange={e => setP(x => ({ ...x, name: e.target.value }))} /></label>
              <label>Phone<input value={p.phone} onChange={e => setP(x => ({ ...x, phone: e.target.value }))} inputMode="tel" /></label>
              <div className="done-act"><button className="btn dark sm">Save</button><button type="button" className="link" onClick={() => setEdit(false)}>Cancel</button></div>
            </form>
          ) : (
            <>
              <p>{user.email}<br />{user.phone || 'No phone yet'}</p>
              {user.address && <p className="muted small">Last delivered to {user.address.line}, {user.address.zone}</p>}
              <button className="link" onClick={() => setEdit(true)}>Edit details</button>
            </>
          )}
        </div>

        <h4 className="acc-h">Orders</h4>
        {!mine.length && <p className="muted small">No orders yet. They'll appear here after checkout.</p>}
        {mine.map(o => {
          const step = orderStep(o);
          return (
            <div className="acc-order" key={o.ref}>
              <div className="ao-top"><b>{o.ref}</b><span className={'st-pill s' + step}>{STEPS[step]}</span></div>
              <p>{o.items.map(i => `${i.qty} × ${i.name}`).join(', ')}</p>
              <p className="muted small">For {o.recipient} · {o.zone} · {fmtDate(o.date)}, {o.window} · {kes(o.total)} by {o.method}</p>
              {step < 3 && <button className="link" onClick={() => track(o.ref)}>Track</button>}
            </div>
          );
        })}
      </div>
      <div className="ft"><button className="btn line block" onClick={signOut}>Sign out</button></div>
    </aside>
  );
}

/* ---------------- Search & saved ---------------- */
export function SearchOverlay() {
  const { overlay, close, wish } = useShop();
  const on = overlay === 'search' || overlay === 'wish';
  const onlyWish = overlay === 'wish';
  const [q, setQ] = useState('');
  const input = useRef();

  useEffect(() => {
    if (!on) return;
    setQ('');
    if (!onlyWish) { const t = setTimeout(() => input.current.focus(), 200); return () => clearTimeout(t); }
  }, [on, onlyWish]);

  const term = q.trim().toLowerCase();
  let list = PRODUCTS.filter(p => !term || (p.name + ' ' + p.desc + ' ' + p.k).toLowerCase().includes(term));
  if (onlyWish && !term) list = list.filter(p => wish.has(p.id));

  const go = (e, id) => {
    e.preventDefault(); close();
    setTimeout(() => document.getElementById('p-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  return (
    <div className={'sover' + (on ? ' open' : '')} aria-hidden={!on} inert={!on}>
      <div className="wrap">
        <div className="s-row">
          <label className="sr" htmlFor="sInput">Search</label>
          <input id="sInput" ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Roses, sunflowers, sympathy…" />
          <button className="tl" onClick={close}>Close</button>
        </div>
        <div className="sres">
          {list.length ? list.map(p => (
            <a key={p.id} href={'#p-' + p.id} onClick={e => go(e, p.id)}>
              <div className="th"><img src={img(p.img)} alt="" /></div>
              <div><b>{p.name}</b><small>{p.desc} · {kes(p.price)}</small></div>
            </a>
          )) : <p className="muted">Nothing matches “{q}”. Try roses or sunflowers, or build your own.</p>}
        </div>
      </div>
    </div>
  );
}
