import { useRef, useState } from 'react';
import { PRODUCTS, SIZES } from '../data.js';
import { img, kes, round50 } from '../lib.js';
import { useShop } from '../shop.jsx';
import { Heart } from './icons.jsx';

function Product({ p }) {
  const { addProduct, wish, toggleWish } = useShop();
  const [size, setSize] = useState('M');
  const price = kes(round50(p.price * SIZES.find(s => s[0] === size)[1]));
  return (
    <article className="prod" id={'p-' + p.id}>
      <div className="ph">
        <img src={img(p.img)} alt={`${p.name} — ${p.desc}`} loading="lazy" />
        {p.tag && <span className={'tag' + (p.lime ? ' l' : '')}>{p.tag}</span>}
        <button className="heart" aria-label={`Save ${p.name}`} aria-pressed={wish.has(p.id)} onClick={() => toggleWish(p)}><Heart /></button>
        <button className="add" onClick={() => addProduct(p.id, size)}>+ Add to bag · {price}</button>
      </div>
      <div className="meta"><div><b>{p.name}</b><small>{p.desc}</small></div><span className="p">{price}</span></div>
      <div className="sizes" role="group" aria-label="Size">
        {SIZES.map(([s]) => <button key={s} aria-pressed={s === size} onClick={() => setSize(s)}>{s}</button>)}
      </div>
    </article>
  );
}

export default function Products() {
  const rail = useRef();
  const step = dir => rail.current.scrollBy({ left: dir * (rail.current.firstElementChild.offsetWidth + 20), behavior: 'smooth' });
  return (
    <section id="shop" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sh rv">
          <h2>Our most <span className="serif">loved.</span></h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="ic" onClick={() => step(-1)} aria-label="Previous">←</button>
            <button className="ic fill" onClick={() => step(1)} aria-label="Next">→</button>
          </div>
        </div>
        <div className="rail rv" ref={rail}>
          {PRODUCTS.map(p => <Product key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}
