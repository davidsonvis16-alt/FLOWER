import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { B_SIZES, EXTRAS, FLOWERS, WRAPS } from '../data.js';
import { img, kes } from '../lib.js';
import { useShop } from '../shop.jsx';

// stem limits per size; nothing is chosen for the customer
const LIMIT = { petite: [1, 12], medium: [13, 24], grand: [25, 40] };
const flower = id => FLOWERS.find(f => f.id === id);
const ease = [0.2, 0.7, 0.2, 1];
const lineAnim = { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.3, ease } };

function Total({ value }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, v => kes(v));
  useEffect(() => { const c = animate(mv, value, { duration: 0.5, ease }); return c.stop; }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <motion.b>{text}</motion.b>;
}

export default function Builder() {
  const { addToCart } = useShop();
  const [size, setSize] = useState(null);
  const [stems, setStems] = useState({});
  const [wrap, setWrap] = useState(null);
  const [extras, setExtras] = useState(new Set());
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const count = Object.values(stems).reduce((a, b) => a + b, 0);
  const s = B_SIZES.find(x => x.id === size), w = WRAPS.find(x => x.id === wrap);
  const [lo, hi] = size ? LIMIT[size] : [0, 0];
  const entries = Object.entries(stems);
  const stemCost = entries.reduce((sum, [id, n]) => sum + flower(id).price * n, 0);
  const extraCost = [...extras].reduce((sum, id) => sum + EXTRAS.find(x => x.id === id).price, 0);
  const total = stemCost + (s ? s.fee : 0) + extraCost;

  const change = (id, d) => {
    setErr('');
    if (d > 0 && count >= hi) { setErr(size ? `${s.name} holds up to ${hi} stems. Choose a bigger size for more.` : 'Choose a size first.'); return; }
    setStems(st => { const n = { ...st, [id]: Math.max(0, (st[id] || 0) + d) }; if (!n[id]) delete n[id]; return n; });
  };
  const pickSize = id => {
    setErr(''); setSize(id);
    const max = LIMIT[id][1];
    if (count > max) setErr(`You have ${count} stems; ${B_SIZES.find(x => x.id === id).name} holds up to ${max}. Remove a few.`);
  };
  const toggleExtra = id => setExtras(e => { const n = new Set(e); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const add = () => {
    const problem = !size ? 'Choose a size.'
      : count < lo ? `${s.name} needs at least ${lo} stems. You have ${count}.`
      : count > hi ? `${s.name} holds up to ${hi} stems. You have ${count}.`
      : !wrap ? 'Choose a wrap.' : '';
    setErr(problem); if (problem) return;
    const list = entries.map(([id, n]) => `${n}× ${flower(id).name}`).join(', ');
    const ex = [...extras].map(id => EXTRAS.find(x => x.id === id).name).join(', ');
    const card = msg.trim() ? ` · Card: “${msg.trim()}”` : '';
    addToCart({ key: 'custom-' + Date.now(), id: 'custom', name: 'Your own bouquet', img: flower(entries[0][0]).img,
      meta: `${s.name} · ${w.name} · ${list}${ex ? ' · ' + ex : ''}${card}`, price: total });
    setStems({}); setSize(null); setWrap(null); setExtras(new Set()); setMsg('');
  };

  return (
    <section className="builder" id="build">
      <div className="wrap">
        <div className="sh">
          <h2>Build your own</h2>
          <p>Pick a size, then the stems you want. Our florist arranges them; you see every price before you add it.</p>
        </div>

        <div className="bgrid">
          <div className="steps">
            <div className="st">
              <h3><i>1</i>Size</h3>
              <div className="seg">
                {B_SIZES.map(x => (
                  <button key={x.id} aria-pressed={x.id === size} onClick={() => pickSize(x.id)}>
                    {x.name}<small>{x.sub} · arranging {kes(x.fee)}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className={'st' + (size ? '' : ' dim')}>
              <h3><i>2</i>Stems <span className="hint">{size ? `${count} of ${lo}–${hi}` : 'choose a size first'}</span></h3>
              <div className="flw">
                {FLOWERS.map(f => (
                  <div key={f.id} className={'f' + (stems[f.id] ? ' on' : '')}>
                    <div className="t"><img src={img(f.img)} alt="" /></div>
                    <div className="fi"><b>{f.name}</b><small>{kes(f.price)} each</small></div>
                    <div className="qty">
                      <button onClick={() => change(f.id, -1)} disabled={!stems[f.id]} aria-label={`One fewer ${f.name}`}>−</button>
                      <span>{stems[f.id] || 0}</span>
                      <button onClick={() => change(f.id, 1)} disabled={!size} aria-label={`One more ${f.name}`}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="st">
              <h3><i>3</i>Wrap</h3>
              <div className="wraps">
                {WRAPS.map(x => (
                  <button key={x.id} aria-pressed={x.id === wrap} onClick={() => setWrap(x.id)}>
                    <i style={{ background: x.c }} />{x.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="st">
              <h3><i>4</i>Extras <span className="hint">optional</span></h3>
              <div className="extras">
                {EXTRAS.map(x => <button key={x.id} aria-pressed={extras.has(x.id)} onClick={() => toggleExtra(x.id)}>{x.name}<small>{x.price ? kes(x.price) : 'free'}</small></button>)}
              </div>
            </div>

            <div className="st">
              <h3><i>5</i>Card <span className="hint">optional, written by hand</span></h3>
              <label className="sr" htmlFor="bMsg">Card message</label>
              <textarea id="bMsg" rows="3" maxLength="140" placeholder="Leave empty for no card" value={msg} onChange={e => setMsg(e.target.value)} />
              <div className="counter">{msg.length}/140</div>
            </div>
          </div>

          <aside className="ticket" aria-live="polite">
            <div className="tk-hd"><span>Your bouquet</span><span>{count} stems</span></div>
            {entries.length > 0 && (
              <div className="tk-strip">
                <AnimatePresence initial={false}>
                  {entries.map(([id]) => <motion.img layout key={id} src={img(flower(id).img)} alt={flower(id).name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.35, ease }} />)}
                </AnimatePresence>
              </div>
            )}
            <ul className="tk-lines">
              {!entries.length && <li className="empty">No stems yet.</li>}
              <AnimatePresence initial={false}>
                {entries.map(([id, n]) => <motion.li key={id} {...lineAnim}><span>{n} × {flower(id).name}</span><span>{kes(flower(id).price * n)}</span></motion.li>)}
              </AnimatePresence>
              <li><span>Arranging{s ? ` · ${s.name}` : ''}</span><span>{s ? kes(s.fee) : '—'}</span></li>
              <li><span>Wrap{w ? ` · ${w.name}` : ''}</span><span>{w ? 'included' : '—'}</span></li>
              <AnimatePresence initial={false}>
                {[...extras].map(id => { const x = EXTRAS.find(e => e.id === id); return <motion.li key={id} {...lineAnim}><span>{x.name}</span><span>{x.price ? kes(x.price) : 'free'}</span></motion.li>; })}
              </AnimatePresence>
            </ul>
            {msg.trim() && <p className="tk-card">“{msg.trim()}”</p>}
            <div className="tk-total"><span>Total</span><Total value={total} /></div>
            {err && <p className="err" role="alert">{err}</p>}
            <button className="btn dark block" onClick={add} disabled={!count}>Add to bag</button>
          </aside>
        </div>
      </div>
    </section>
  );
}
