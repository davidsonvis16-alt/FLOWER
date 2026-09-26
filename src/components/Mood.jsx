import { useEffect, useRef, useState } from 'react';
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
  const [shownImg, setShownImg] = useState(MOODS[0].img);
  const [swapping, setSwapping] = useState(false);
  const [editing, setEditing] = useState(false);
  const [script, setScript] = useState(SCRIPTS[0]);
  const msgRef = useRef();
  const m = MOODS.find(x => x.id === id);
  const p = PRODUCTS.find(x => x.id === m.product);

  // fade the photo out, swap it, fade back in
  useEffect(() => {
    if (m.img === shownImg) return;
    setSwapping(true);
    const t = setTimeout(() => setShownImg(m.img), 250);
    return () => clearTimeout(t);
  }, [m.img]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <section id="occasions">
      <div className="wrap">
        <div className="sh rv"><h2>What are you<br />trying to <span className="serif">say?</span></h2><p>Pick the feeling. We'll pick the flowers — and draft the card for you.</p></div>
        <div className="tabs rv" role="tablist" aria-label="Choose a mood">
          {MOODS.map(x => (
            <button key={x.id} className="tab" role="tab" aria-selected={x.id === id} onClick={() => setId(x.id)}>
              <i className="sw" style={{ background: x.sw }} />{x.label}
            </button>
          ))}
        </div>
        <div className="mood rv">
          <div className="big">
            <img src={img(shownImg)} alt={m.desc} className={swapping ? 'swap' : ''} onLoad={() => setSwapping(false)} />
            <div className="cap"><div className="hand">{m.title}</div><p>{m.desc}</p></div>
          </div>
          <div className="side">
            <div className={'note ' + script.cls}>
              <span className="to">Card message · written by our florist, by hand</span>
              <div className="msg" ref={msgRef} contentEditable={editing} suppressContentEditableWarning spellCheck={false} aria-label="Card message" />
              <div className="sig">{m.sig}</div>
              <div className="note-foot">
                <div className="scripts" role="radiogroup" aria-label="Writing style">
                  {SCRIPTS.map(s => (
                    <button key={s.id} className={'script ' + s.cls} role="radio" aria-checked={s.id === script.id} onClick={() => setScript(s)}>{s.label}</button>
                  ))}
                </div>
                <button className="edit" onClick={toggleEdit}>{editing ? 'Done' : 'Edit message'}</button>
              </div>
            </div>
            <div className="pick">
              <div className="th"><img src={img(p.img)} alt="" /></div>
              <div className="t"><small>We'd send</small><b>{p.name}</b><span>{kes(p.price)} · {beforeCutoff() ? 'arrives today by 6pm' : 'arrives tomorrow morning'}</span></div>
              <button className="btn lime sm" onClick={send}>Send it</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
