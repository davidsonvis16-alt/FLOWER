import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { PRODUCTS, ZONES } from '../data.js';
import { beforeCutoff, img, kes } from '../lib.js';
import { useShop } from '../shop.jsx';

const W = { h: { opacity: 0, y: '0.4em' }, s: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] } } };

// The hero is the order itself: one sentence with the blanks filled in.
export default function Hero() {
  const { addToCart, zone, setZone } = useShop();
  const [pid, setPid] = useState('wild');
  const [to, setTo] = useState('');
  const [area, setArea] = useState(zone || '');
  const [when, setWhen] = useState(beforeCutoff() ? 'today' : 'tomorrow');
  const p = PRODUCTS.find(x => x.id === pid);
  const fig = useRef();
  const { scrollYProgress } = useScroll({ target: fig, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const z = ZONES.find(x => x.name === area);
  const sameDay = beforeCutoff() && (!z || z.win !== 'next');
  const day = when === 'today' && !sameDay ? 'tomorrow' : when;   // e.g. a next-day-only area

  const send = e => {
    e.preventDefault();
    if (area) setZone(area);
    addToCart({
      key: `${p.id}-M-hero-${to.trim().toLowerCase()}`, id: p.id, name: p.name, img: p.img, price: p.price,
      meta: `Size M · ${p.desc}${to.trim() ? ` · for ${to.trim()}` : ''}${area ? ` · ${area}` : ''}, ${day}`,
    });
  };

  return (
    <section className="hero">
      <div className="wrap">
        <p className="kicker">Petal · a small flower studio in Westlands, Nairobi</p>
        <motion.form className="sentence" onSubmit={send} initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.07 } } }}>
          <motion.span variants={W}>Send</motion.span>
          <motion.label variants={W} className="blank sel">
            <span className="sr">Bouquet</span>
            <span className="val" aria-hidden="true">{p.name}</span>
            <select value={pid} onChange={e => setPid(e.target.value)}>
              {PRODUCTS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </motion.label>
          <motion.span variants={W}>to</motion.span>
          <motion.label variants={W} className="blank txt" style={{ '--w': Math.max(5, to.length + 1) + 'ch' }}>
            <span className="sr">Who are they for?</span>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="someone" maxLength="24" />
          </motion.label>
          <motion.span variants={W}>in</motion.span>
          <motion.label variants={W} className="blank sel">
            <span className="sr">Area</span>
            <span className="val" aria-hidden="true">{area || 'Nairobi'}</span>
            <select value={area} onChange={e => setArea(e.target.value)}>
              <option value="">Nairobi</option>
              {ZONES.map(x => <option key={x.name}>{x.name}</option>)}
            </select>
          </motion.label>
          <motion.label variants={W} className="blank sel">
            <span className="sr">When</span>
            <span className="val" aria-hidden="true">{day === 'later' ? 'on a later date.' : day + '.'}</span>
            <select value={day} onChange={e => setWhen(e.target.value)}>
              {sameDay && <option value="today">today.</option>}
              <option value="tomorrow">tomorrow.</option>
              <option value="later">on a later date.</option>
            </select>
          </motion.label>
        </motion.form>

        <motion.div className="hero-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
          <motion.p className="hero-sum" key={pid + area + day} initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <b>{p.name}</b>, {p.desc.toLowerCase()}. {kes(p.price)}
            {z ? <> + {kes(z.fee)} delivery</> : null}.{' '}
            {day === 'today' ? `At the door ${z ? z.win : 'between 2 and 6pm'}.` : day === 'tomorrow' ? 'At the door tomorrow, 9am–1pm.' : 'Choose the date at checkout.'}
          </motion.p>
          <div className="hero-act">
            <button className="btn dark" onClick={send}>Add to bag</button>
            <a className="link" href="#shop">See all bouquets</a>
          </div>
        </motion.div>

        <motion.figure ref={fig} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }} className="hero-ph">
          <motion.div className="hero-scale" style={{ scale }}>
            <AnimatePresence initial={false}>
              <motion.img key={p.img} src={img(p.img)} alt={`${p.name}: ${p.desc}`} fetchPriority="high"
                initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }} />
            </AnimatePresence>
          </motion.div>
        </motion.figure>
      </div>
    </section>
  );
}
