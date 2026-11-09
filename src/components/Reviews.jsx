import { useEffect, useState } from 'react';
import { REVIEWS } from '../data.js';
import { nbo, store, waLink } from '../lib.js';
import { useShop } from '../shop.jsx';

const daysUntil = iso => {
  const [, m, d] = iso.split('-').map(Number), n = nbo();
  const today = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
  let next = Date.UTC(n.getUTCFullYear(), m - 1, d);
  if (next < today) next = Date.UTC(n.getUTCFullYear() + 1, m - 1, d);
  return Math.round((next - today) / 864e5);
};
const fmt = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export function Reviews() {
  return (
    <section className="reviews" aria-label="Reviews">
      <div className="wrap">
        <div className="qgrid">
          {REVIEWS.map(r => (
            <figure key={r.n}>
              <blockquote>{r.t.replace(/[“”]/g, '')}</blockquote>
              <figcaption><b>{r.n}</b> · {r.m}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// reminders are kept per account when signed in, otherwise in this browser
export function Reminders() {
  const { toast, user, requireAuth } = useShop();
  const key = 'petal_rem' + (user ? ':' + user.email : '');
  const [list, setList] = useState(() => store.get(key, []));
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => setList(store.get(key, [])), [key]);
  const save = l => { setList(l); store.set(key, l); };

  const sorted = [...list].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
  const waText = 'Hi Petal! Please remind me before these dates:\n' + (sorted.length ? sorted.map(r => `• ${r.name}: ${fmt(r.date)}`).join('\n') : '(I will add my dates)');

  const submit = e => {
    e.preventDefault();
    if (!name.trim() || !date) { toast('Add an occasion and a date'); return; }
    save([...list, { id: Date.now(), name: name.trim(), date }]);
    toast(`Saved. We'll remind you before ${name.trim()}`);
    setName(''); setDate('');
  };

  return (
    <section id="reminders" className="remind">
      <div className="wrap">
        <div className="sh">
          <h2>Dates you can't miss</h2>
          <p>Add birthdays and anniversaries. We'll message you three days before{user ? '' : ', and they stay saved in this browser'}.
            {!user && <> <button className="link" onClick={() => requireAuth(null)}>Sign in</button> to keep them on your account.</>}</p>
        </div>
        <form className="rem-form" onSubmit={submit}>
          <label>Occasion<input placeholder="Mum's birthday" maxLength="40" value={name} onChange={e => setName(e.target.value)} /></label>
          <label>Date<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
          <button className="btn dark" type="submit">Save date</button>
        </form>
        {sorted.length > 0 && (
          <ul className="rem-list">
            {sorted.map(r => {
              const d = daysUntil(r.date);
              return (
                <li key={r.id}>
                  <b>{r.name}</b><span>{fmt(r.date)}</span><span className="muted">{d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`}</span>
                  <button className="link" onClick={() => save(list.filter(x => x.id !== r.id))}>Remove</button>
                </li>
              );
            })}
          </ul>
        )}
        <a className="link" href={waLink(waText)} target="_blank" rel="noopener">Send these to us on WhatsApp instead →</a>
      </div>
    </section>
  );
}
