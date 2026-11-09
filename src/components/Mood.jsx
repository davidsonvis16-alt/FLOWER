import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MOODS, PRODUCTS } from '../data.js';
import { beforeCutoff, img, kes } from '../lib.js';
import { useShop } from '../shop.jsx';

// how the florist writes the card; `cls` picks the font in styles.css
const SCRIPTS = [
  { id: 'hand', label: 'Handwritten', cls: 'w-hand' },
  { id: 'script', label: 'Script', cls: 'w-script' },
  { id: 'classic', label: 'Classic', cls: 'w-classic' },
  { id: 'typed', label: 'Typewriter', cls: 'w-typed' },
];

export default function Mood() {
  const { addToCart } = useShop();
  const [id, setId] = useState('love');
  const [editing, setEditing] = useState(false);
  const [script, setScript] = useState(SCRIPTS[0]);
  const msgRef = useRef();
  const m = MOODS.find(x => x.id === id);
  const p = PRODUCTS.find(x => x.id === m.product);

  // the card text is contentEditable, so it is written directly rather than rendered
  useEffect(() => { msgRef.current.textContent = m.msg; setEditing(false); }, [m]);

  const toggleEdit = () => {
    const on = !editing; setEditing(on);
    if (on) setTimeout(() => { const el = msgRef.current; el.focus(); getSelection().selectAllChildren(el); getSelection().collapseToEnd(); });
  };

  const send = () => {
    const text = msgRef.current.textContent.trim();
    addToCart({ key: `${p.id}-M-${m.id}-${Date.now()}`, id: p.id, name: p.name, img: p.img, price: p.price,
      meta: `Size M · ${script.label} card: “${text.slice(0, 60)}${text.length > 60 ? '…' : ''}”` });
  };

  return (
    <section id="occasions" className="occ">
      <div className="wrap">
        <div className="sh">
          <h2>What should the card say?</h2>
          <p>Pick the occasion and we'll suggest a bouquet and a first draft. Change any word, then choose how the florist writes it.</p>
        </div>
        <div className="occ-tabs" role="tablist" aria-label="Occasion">
          {MOODS.map(x => (
            <button key={x.id} role="tab" aria-selected={x.id === id} onClick={() => setId(x.id)}>
              {x.label}
              {x.id === id && <motion.i className="uline" layoutId="occLine" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
            </button>
          ))}
        </div>
        <div className="occ-body">
          <div className={'note ' + script.cls}>
            <div className="note-hd">
              <span>Card · {m.title.replace('.', '')}</span>
              <button className="link" onClick={toggleEdit}>{editing ? 'Done' : 'Edit the words'}</button>
            </div>
            <div className={'msg' + (editing ? ' editing' : '')} ref={msgRef} contentEditable={editing} suppressContentEditableWarning spellCheck={false} aria-label="Card message" />
            <div className="sig">{m.sig}</div>
            <div className="scripts" role="radiogroup" aria-label="Writing style">
              {SCRIPTS.map(s => (
                <button key={s.id} className={s.cls} role="radio" aria-checked={s.id === script.id} onClick={() => setScript(s)}>{s.label}</button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
          <motion.div className="pick" key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
            <div className="th"><img src={img(p.img)} alt={`${p.name}: ${p.desc}`} /></div>
            <small>Goes with</small>
            <b>{p.name}</b>
            <p>{m.desc}</p>
            <p className="pm">{kes(p.price)} · {beforeCutoff() ? 'can arrive today' : 'arrives tomorrow'}</p>
            <button className="btn dark sm block" onClick={send}>Add with this card</button>
          </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
