import { useEffect, useRef, useState } from 'react';
import { B_SIZES, EXTRAS, FLOWERS, WRAPS } from '../data.js';
import { img, kes } from '../lib.js';
import { useShop } from '../shop.jsx';

const SLOTS = [[215, 150], [120, 215], [310, 215], [215, 262], [130, 110], [305, 105]];
const flower = id => FLOWERS.find(f => f.id === id);

function AnimatedNumber({ value }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current, t0 = performance.now(); let raf;
    const tick = t => {
      const k = Math.min(1, (t - t0) / 450), v = start + (value - start) * (1 - Math.pow(1 - k, 3));
      from.current = v; setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return kes(shown);
}

export default function Builder() {
  const { addToCart, toast } = useShop();
  const [stems, setStems] = useState({ rose: 6, sun: 5, lily: 4 });
  const [size, setSize] = useState('medium');
  const [wrap, setWrap] = useState('blush');
  const [extras, setExtras] = useState(new Set(['card', 'choc']));
  const [msg, setMsg] = useState('Happy 30th, Amani! Go be loud. — us');
  const seen = useRef(new Set(Object.keys(stems)));   // stem types already on the preview (skip the pop-in)

  const count = Object.values(stems).reduce((a, b) => a + b, 0);
  const s = B_SIZES.find(x => x.id === size), w = WRAPS.find(x => x.id === wrap);
  const stemCost = Object.entries(stems).reduce((sum, [id, n]) => sum + flower(id).price * n, 0);
  const total = stemCost ? stemCost + s.fee + [...extras].reduce((sum, id) => sum + EXTRAS.find(x => x.id === id).price, 0) : 0;
  const entries = Object.entries(stems);
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);

  useEffect(() => { seen.current = new Set(Object.keys(stems)); });

  const change = (id, d) => {
    const next = { ...stems, [id]: Math.max(0, Math.min(40, (stems[id] || 0) + d)) };
    if (!next[id]) delete next[id];
    const n = Object.values(next).reduce((a, b) => a + b, 0);
    setStems(next);
    setSize(n <= 12 ? 'petite' : n <= 24 ? 'medium' : 'grand');   // suggest a size from the stem count
  };
  const toggleExtra = id => setExtras(e => { const n = new Set(e); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const add = () => {
    if (!count) { toast('Add a few stems first 🌱'); return; }
    const list = entries.map(([id, n]) => `${n}× ${flower(id).name}`).join(', ');
    const ex = [...extras].map(id => EXTRAS.find(x => x.id === id).name).join(', ');
    const card = msg.trim() && extras.has('card') ? ` · Card: “${msg.trim()}”` : '';
    addToCart({ key: 'custom-' + Date.now(), id: 'custom', name: 'Your custom bouquet', img: flower(entries[0][0]).img,
      meta: `${s.name} · ${w.name} · ${list}${ex ? ' · ' + ex : ''}${card}`, price: total });
  };

  return (
    <div className="builder" id="build">
      <div className="wrap">
        <div className="sh rv" style={{ marginBottom: 0 }}>
          <div><div className="eyebrow" style={{ color: 'var(--lime)' }}>Bouquet builder</div><h2 style={{ marginTop: 16 }}>Make it <span className="serif">yours.</span></h2></div>
          <p>Choose stems, wrap and extras. Watch it come together — and the price update — live.</p>
        </div>
        <div className="bgrid">
          <div className="preview" aria-live="polite">
            <div className="stems">{entries.map(([id, n]) => <span key={id}>{n} × {flower(id).name}</span>)}</div>
            <div className={'cardmini' + (extras.has('card') ? '' : ' off')}>{msg.trim() || 'Your message here…'}</div>
            <div className="wrapcone" style={{ '--wrap': w.c }} />
            <div className="bow">with love</div>
            <div className="bouq">
              {!entries.length ? <div className="empty">add some stems →</div> : sorted.map(([id, n], i) => {
                const [x, y] = SLOTS[i], d = Math.max(84, Math.min(180, 80 + n * 12)), f = flower(id);
                return (
                  <div key={id} className={'b' + (seen.current.has(id) ? '' : ' enter')} style={{ width: d, height: d, left: x - d / 2, top: y - d / 2, zIndex: 10 - i }}>
                    <img src={img(f.img)} alt={f.name} />
                  </div>
                );
              })}
            </div>
            <div className="total">
              <div><small>{count} stems · {s.name} · {w.name.split(' ')[0]} wrap</small><span className="n"><AnimatedNumber value={total} /></span></div>
              <button className="btn dark" onClick={add}>Add to bag →</button>
            </div>
          </div>
          <div className="steps">
            <div className="st"><h3><i>1</i>Choose your stems</h3>
              <div className="flw">
                {FLOWERS.map(f => (
                  <div key={f.id} className={'f' + (stems[f.id] ? ' on' : '')}>
                    <div className="t"><img src={img(f.img)} alt="" /></div><b>{f.name}</b><small>{kes(f.price)} / stem</small>
                    <div className="qty">
                      <button onClick={() => change(f.id, -1)} aria-label={`Remove one ${f.name}`}>−</button>
                      <span className="n">{stems[f.id] || 0}</span>
                      <button onClick={() => change(f.id, 1)} aria-label={`Add one ${f.name}`}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="st"><h3><i>2</i>Size</h3>
              <div className="seg">{B_SIZES.map(x => <button key={x.id} aria-pressed={x.id === size} onClick={() => setSize(x.id)}>{x.name}<small>{x.sub}</small></button>)}</div>
            </div>
            <div className="st"><h3><i>3</i>Wrap</h3>
              <div className="wraps">
                {WRAPS.map(x => <button key={x.id} aria-label={x.name} aria-pressed={x.id === wrap} style={{ background: x.c }} onClick={() => setWrap(x.id)} />)}
                <span className="lbl">{w.name}</span>
              </div>
            </div>
            <div className="st"><h3><i>4</i>Extras</h3>
              <div className="extras">{EXTRAS.map(x => <button key={x.id} aria-pressed={extras.has(x.id)} onClick={() => toggleExtra(x.id)}>{x.name}{x.price ? ' +' + x.price.toLocaleString() : ''}</button>)}</div>
            </div>
            <div className="st"><h3><i>5</i>Your card</h3>
              <label className="sr" htmlFor="bMsg">Card message</label>
              <textarea className="field-d" id="bMsg" rows="3" maxLength="140" placeholder="Write something they'll keep…" value={msg} onChange={e => setMsg(e.target.value)} />
              <div className="counter">{msg.length}/140 · we write it by hand</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
