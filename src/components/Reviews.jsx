import { useEffect, useRef, useState } from 'react';
import { REVIEWS } from '../data.js';
import { img, nbo, store, waLink } from '../lib.js';
import { useShop } from '../shop.jsx';

function Quote() {
  const [i, setI] = useState(0);
  const [fade, setFade] = useState(false);
  const t = useRef(), cur = useRef(0);
  const show = n => {
    cur.current = (n + REVIEWS.length) % REVIEWS.length;
    setFade(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => { setI(cur.current); setFade(false); }, 300);
  };
  useEffect(() => {
    const auto = setInterval(() => { if (!document.hidden) show(cur.current + 1); }, 9000);
    return () => { clearInterval(auto); clearTimeout(t.current); };
  }, []);
  const r = REVIEWS[i];
  return (
    <div className="quote rv">
      <div>
        <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote className={fade ? 'fade' : ''}>{r.t}</blockquote>
      </div>
      <div className="who">
        <div className="av"><img src={img(r.img)} alt="" /></div>
        <div><b>{r.n}</b><div style={{ fontSize: 14, opacity: 0.7 }}>{r.m}</div></div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="ic" onClick={() => show(i - 1)} aria-label="Previous review">←</button>
          <button className="ic" onClick={() => show(i + 1)} aria-label="Next review">→</button>
        </div>
      </div>
    </div>
  );
}

const daysUntil = iso => {
  const [, m, d] = iso.split('-').map(Number), n = nbo();
  const today = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
  let next = Date.UTC(n.getUTCFullYear(), m - 1, d);
  if (next < today) next = Date.UTC(n.getUTCFullYear() + 1, m - 1, d);
  return Math.round((next - today) / 864e5);
};
const fmt = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function Reminders() {
  const { toast } = useShop();
  const [list, setList] = useState(() => store.get('petal_rem', []));
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => store.set('petal_rem', list), [list]);

  const sorted = [...list].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
  const waText = 'Hi Petal! Please remind me before these dates:\n' + (sorted.length ? sorted.map(r => `• ${r.name} — ${fmt(r.date)}`).join('\n') : '(I will add my dates)');

  const submit = e => {
    e.preventDefault();
    if (!name.trim() || !date) { toast('Add an occasion and a date'); return; }
    setList(l => [...l, { id: Date.now(), name: name.trim(), date }]);
    toast(`Saved — we'll remind you ${daysUntil(date) > 3 ? '3 days ' : ''}before ${name.trim()}`);
    setName(''); setDate('');
  };

  return (
    <form className="box remind rv" onSubmit={submit}>
      <div className="eyebrow">Never forget again</div>
      <p className="big">We'll remind you<br /><span className="serif">before it's too late.</span></p>
      <div className="fields">
        <div className="fl"><label className="sr" htmlFor="remName">Occasion</label><input id="remName" placeholder="Mum's birthday" required maxLength="40" value={name} onChange={e => setName(e.target.value)} /><small>Occasion</small></div>
        <div className="fl"><label className="sr" htmlFor="remDate">Date</label><input id="remDate" type="date" required value={date} onChange={e => setDate(e.target.value)} /><small>Date</small></div>
      </div>
      <div className="dates">
        {sorted.length ? sorted.map(r => {
          const d = daysUntil(r.date);
          return (
            <div className="date" key={r.id}>
              <b>{r.name} · {fmt(r.date)}</b>{d === 0 ? 'today! 🎉' : d === 1 ? 'tomorrow' : `in ${d} days`}
              <button type="button" onClick={() => setList(l => l.filter(x => x.id !== r.id))} aria-label="Delete reminder">✕</button>
            </div>
          );
        }) : (
          <div className="date" style={{ background: 'none', boxShadow: 'inset 0 0 0 1px var(--line)', padding: 14 }}>
            <span className="muted">Your saved dates show here — we'll nudge you a few days before.</span>
          </div>
        )}
      </div>
      <button className="btn dark block" type="submit" style={{ marginTop: 16 }}>Save reminder</button>
      <a className="btn block" href={waLink(waText)} target="_blank" rel="noopener" style={{ marginTop: 10 }}>Get reminders on WhatsApp</a>
    </form>
  );
}

export default function ReviewsAndReminders() {
  return (
    <section id="reminders" style={{ paddingTop: 0 }}>
      <div className="wrap"><div className="rgrid"><Quote /><Reminders /></div></div>
    </section>
  );
}
