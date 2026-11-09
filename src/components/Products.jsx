import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OCCASIONS, PRODUCTS, SIZES } from '../data.js';
import { img, kes, round50 } from '../lib.js';
import { useShop } from '../shop.jsx';

function Product({ p }) {
  const { addProduct, wish, toggleWish } = useShop();
  const [size, setSize] = useState('M');
  const price = kes(round50(p.price * SIZES.find(s => s[0] === size)[1]));
  const saved = wish.has(p.id);
  return (
    <motion.article layout className="prod" id={'p-' + p.id}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}>
      <div className="ph">
        <motion.img src={img(p.img)} alt={`${p.name}: ${p.desc}`} loading="lazy" whileHover={{ scale: 1.04 }} transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }} />
        {p.tag && <span className="tag">{p.tag}</span>}
      </div>
      <div className="meta">
        <h3>{p.name}</h3>
        <span className="p">{price}</span>
      </div>
      <p className="d">{p.desc}</p>
      <div className="row">
        <div className="sizes" role="group" aria-label={`${p.name} size`}>
          {SIZES.map(([s]) => <button key={s} aria-pressed={s === size} onClick={() => setSize(s)}>{s}</button>)}
        </div>
        <button className="save" aria-pressed={saved} onClick={() => toggleWish(p)}>{saved ? 'Saved' : 'Save'}</button>
      </div>
      <button className="btn line sm block" onClick={() => addProduct(p.id, size)}>Add to bag</button>
    </motion.article>
  );
}

export default function Products() {
  const { wish, open } = useShop();
  const [occ, setOcc] = useState('all');
  const list = PRODUCTS.filter(p => occ === 'all' || p.occ.includes(occ));
  return (
    <section id="shop">
      <div className="wrap">
        <div className="sh">
          <h2>Bouquets</h2>
          <p>Made to order the morning they go out. Sizes S to XL change the stem count, not the style.</p>
        </div>
        <div className="filters" role="group" aria-label="Filter by occasion">
          {OCCASIONS.map(([id, l]) => (
            <button key={id} aria-pressed={id === occ} onClick={() => setOcc(id)}>
              {id === occ && <motion.i className="pill" layoutId="occPill" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
              <span>{l}</span>
            </button>
          ))}
          <span className="count">{list.length} bouquets{wish.size > 0 && <> · <button className="link" onClick={() => open('wish')}>Saved ({wish.size})</button></>}</span>
        </div>
        <motion.div layout className="grid">
          <AnimatePresence mode="popLayout">
            {list.map(p => <Product key={p.id} p={p} />)}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
