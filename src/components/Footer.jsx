import { useState } from 'react';
import { GALLERY } from '../data.js';
import { img, nbo, store, waLink } from '../lib.js';
import { LogoSlot, WhatsApp } from './icons.jsx';

const IG = 'https://instagram.com/petal.flowers';

export function Gallery() {
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sh rv" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 'clamp(38px,4vw,56px)' }}>@petal<span className="serif">.flowers</span></h2>
          <a className="btn" href={IG} target="_blank" rel="noopener">Follow on Instagram</a>
        </div>
        <div className="gal rv">
          {GALLERY.map(([f, alt]) => <a key={f} href={IG} target="_blank" rel="noopener"><img src={img(f)} alt={alt} loading="lazy" /></a>)}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const submit = e => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setMsg({ err: true, t: 'That email looks off — try again?' }); return; }
    const list = store.get('petal_news', []); if (!list.includes(v)) list.push(v); store.set('petal_news', list);
    setMsg({ t: "You're in 🌸 First dibs on drops, no spam." }); setEmail('');
  };
  return (
    <>
      <form className="news" noValidate onSubmit={submit}>
        <label className="sr" htmlFor="newsEmail">Email</label>
        <input id="newsEmail" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} />
        <button type="submit">Join</button>
      </form>
      <p className="news-msg" aria-live="polite" style={msg?.err ? { color: '#ff9aa2' } : undefined}>{msg?.t}</p>
    </>
  );
}

export default function Footer() {
  const wa = t => ({ href: waLink(t), target: '_blank', rel: 'noopener' });
  return (
    <footer>
      <div className="wrap">
        <div className="fg">
          <div>
            <p className="pitch">Get first dibs on<br />Valentine's &amp; seasonal drops.</p>
            <Newsletter />
            <a className="wa" {...wa("Hi Petal! I'd like to order flowers.")}><WhatsApp />Chat on WhatsApp</a>
          </div>
          <div className="col"><h4>Shop</h4><a href="#shop">All bouquets</a><a href="#occasions">Occasions</a><a href="#build">Build your own</a><a href="#club">Petal Club</a></div>
          <div className="col"><h4>Help</h4><a href="#delivery">Delivery areas</a><a href="#delivery">Track order</a><a {...wa('Hi Petal, how do I care for my flowers?')}>Flower care</a><a {...wa('Hi Petal, I have a question:')}>FAQs</a></div>
          <div className="col"><h4>Visit</h4><a href="https://maps.google.com/?q=Westlands,Nairobi" target="_blank" rel="noopener">Studio · Westlands</a><a>Mon–Sat, 7am–7pm</a><a href="tel:+254700000000">+254 700 000 000</a><a href="mailto:hello@petal.co.ke">hello@petal.co.ke</a></div>
        </div>
        <div className="wordmark" aria-hidden="true">Petal<i>.</i></div>
        <div className="fb">
          <span>© {nbo().getUTCFullYear()} Petal Flowers Ltd. · Nairobi, Kenya</span>
          <span className="hand">flowers make life better.</span>
          <div className="pay" aria-label="Payment methods">
            <LogoSlot file="mpesa.svg" alt="M-Pesa" text="M-PESA" style={{ color: '#43b02a' }} />
            <LogoSlot file="visa.svg" alt="Visa" text="VISA" style={{ color: '#1a1f71', fontStyle: 'italic' }} />
            <LogoSlot file="mastercard.svg" alt="Mastercard" text="mastercard" style={{ color: '#eb001b' }} />
            <LogoSlot file="airtel-money.svg" alt="Airtel Money" text="airtel money" style={{ color: '#e4002b' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
