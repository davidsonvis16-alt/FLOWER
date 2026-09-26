/* =========================================================
   Petal — shop data
   Edit CONFIG + the lists below to change prices, products,
   delivery zones and contact details.
   ========================================================= */

export const CONFIG = {
  whatsapp: '254700000000',      // shop WhatsApp number, international format, no +
  cutoffHour: 14,                // same-day order cutoff (Nairobi time, 24h)
  freeDeliveryOver: 6000,        // KES
  utcOffset: 3,                  // Nairobi = UTC+3
  // A real M-Pesa STK push must run on your server (it needs your Daraja keys).
  // Point this at that route; until then checkout runs in preview mode.
  mpesaEndpoint: '',             // e.g. '/api/mpesa/stk'
};

export const PRODUCTS = [
  { id: 'noir',      name: 'The Noir',     desc: '24 red roses, black wrap',     price: 4500, img: 'p-noir.jpg',      tag: 'Bestseller',        k: 'roses red romantic love anniversary valentine' },
  { id: 'sunrise',   name: 'The Sunrise',  desc: 'Gerbera, roses & mums, kraft', price: 3800, img: 'p-sunrise.jpg',   tag: 'Only 6 left today', lime: true, k: 'gerbera orange birthday congrats happy' },
  { id: 'purewhite', name: 'Pure White',   desc: 'Lilies & lisianthus, vase',    price: 4200, img: 'p-purewhite.jpg', tag: 'Sympathy',          k: 'white lilies sympathy funeral condolence' },
  { id: 'blush',     name: 'Blush Dreams', desc: '30 pink roses, hand-tied',     price: 3500, img: 'p-blush.jpg',     tag: 'New',               k: 'pink roses sorry apology' },
  { id: 'wild',      name: 'The Wild One', desc: 'Dahlias, rudbeckia & zinnias', price: 5200, img: 'hero.jpg',        tag: "Florist's pick",    k: 'dahlias rudbeckia zinnias statement big wild' },
  { id: 'golden',    name: 'Golden Hour',  desc: 'Sunflowers in a glass vase',   price: 3200, img: 'p-golden.jpg',    tag: 'Sunny',             k: 'sunflowers yellow happy congrats' },
  { id: 'garden',    name: 'Garden Party', desc: 'Dried & fresh wildflowers',    price: 3900, img: 'p-garden.jpg',    tag: '',                  k: 'wildflowers dried mixed just because colourful' },
];
export const SIZES = [['S', 0.8], ['M', 1], ['L', 1.35], ['XL', 1.7]];

export const MOODS = [
  { id: 'love', label: 'I love you', sw: '#c8323c', title: 'I love you.', img: 'mood-romantic.jpg', product: 'noir',
    desc: 'Deep red roses, black wrap, zero ambiguity. Our most-sent bouquet on Fridays.',
    msg: 'Still the best decision I ever made. Happy Friday, love —', sig: 'M. x' },
  { id: 'congrats', label: 'Congrats!', sw: '#f2b705', title: 'Congrats!', img: 'mood-happy.jpg', product: 'sunrise',
    desc: 'Loud, sunny and impossible to ignore — for promotions, graduations and new keys.',
    msg: 'You did the thing!! So proud of you. Drinks on me this weekend.', sig: '— your biggest fan' },
  { id: 'sorry', label: "I'm sorry", sw: '#e89ab0', title: "I'm sorry.", img: 'mood-apology.jpg', product: 'blush',
    desc: 'Soft pinks that say it better than a long text. Pair it with an actual conversation.',
    msg: 'I was wrong, and you deserved better. Dinner is on me — I will listen this time.', sig: '— J.' },
  { id: 'sympathy', label: 'Thinking of you', sw: '#ffffff', title: 'Thinking of you.', img: 'mood-sympathy.jpg', product: 'purewhite',
    desc: 'Calm whites and greens, delivered quietly in a vase so there is nothing to do.',
    msg: 'Holding you and your family close today. No need to reply — we are here.', sig: 'With love' },
  { id: 'just', label: 'Just because', sw: '#7d5bd0', title: 'Just because.', img: 'mood-justbecause.jpg', product: 'garden',
    desc: 'No occasion needed. A handful of whatever looked best at the market this morning.',
    msg: 'No reason. Saw these and thought of you. That is it, that is the card.', sig: '— A.' },
];

export const FLOWERS = [
  { id: 'rose', name: 'Red rose',    price: 250, img: 'stem-rose.jpg' },
  { id: 'sun',  name: 'Sunflower',   price: 300, img: 'stem-sun.jpg' },
  { id: 'lily', name: 'White lily',  price: 350, img: 'stem-lily.jpg' },
  { id: 'pink', name: 'Pink spray',  price: 200, img: 'stem-pink.jpg' },
  { id: 'wild', name: 'Wildflowers', price: 180, img: 'stem-wild.jpg' },
  { id: 'euc',  name: 'Eucalyptus',  price: 150, img: 'stem-euc.jpg' },
];
export const B_SIZES = [
  { id: 'petite', name: 'Petite', sub: 'up to 12 stems', fee: 500 },
  { id: 'medium', name: 'Medium', sub: '13–24 stems', fee: 900 },
  { id: 'grand',  name: 'Grand',  sub: '25+ stems', fee: 1500 },
];
export const WRAPS = [
  { id: 'blush',  name: 'Blush paper + satin ribbon', c: '#f3c9cf' },
  { id: 'noir',   name: 'Matte black + gold ribbon',  c: '#141414' },
  { id: 'kraft',  name: 'Kraft paper + twine',        c: '#c9a77c' },
  { id: 'ivory',  name: 'Ivory linen',                c: '#f6f1e7' },
  { id: 'forest', name: 'Forest green',               c: '#2c5a3f' },
];
export const EXTRAS = [
  { id: 'card', name: 'Handwritten card', price: 0 },
  { id: 'vase', name: 'Glass vase', price: 800 },
  { id: 'choc', name: 'Chocolates', price: 650 },
  { id: 'balloon', name: 'Balloon', price: 500 },
  { id: 'candle', name: 'Candle', price: 1200 },
];

export const ZONES = [
  ['Westlands', 300, '2–4pm'], ['Parklands', 300, '2–4pm'], ['CBD', 300, '2–4pm'], ['Kilimani', 350, '3–5pm'], ['Kileleshwa', 350, '3–5pm'],
  ['Lavington', 350, '3–5pm'], ['Upper Hill', 350, '3–5pm'], ['Hurlingham', 350, '3–5pm'], ['Muthaiga', 450, '3–6pm'], ['Gigiri', 500, '3–6pm'],
  ['Runda', 550, '4–6pm'], ['Karen', 600, '4–6pm'], ['Langata', 500, '4–6pm'], ['South B', 450, '4–6pm'], ['South C', 450, '4–6pm'],
  ['Ruaka', 650, '4–7pm'], ['Rongai', 750, '4–7pm'], ['Syokimau', 800, '4–7pm'], ['Kitengela', 900, 'next'], ['Thika Road', 650, '4–7pm'],
].map(([name, fee, win]) => ({ name, fee, win }));

export const LIVE = [
  ['Wanjiru', 'The Sunrise', 'her mum', 'Kilimani', 'p-sunrise.jpg'],
  ['Brian', 'The Noir', 'Faith', 'Westlands', 'p-noir.jpg'],
  ['Akinyi', 'Pure White', 'the Mwangi family', 'Karen', 'p-purewhite.jpg'],
  ['Kevin', 'Blush Dreams', 'his sister', 'Lavington', 'p-blush.jpg'],
  ['Zawadi', 'Golden Hour', 'her team', 'Upper Hill', 'p-golden.jpg'],
];

export const REVIEWS = [
  { t: '“The flowers were even more beautiful in person. They sent a photo at the door — my mum cried, I cried, the rider nearly cried.”', n: 'Njeri M.', m: 'Kileleshwa · Verified order', img: 'g4.jpg' },
  { t: '“Ordered at 1:40pm from the office, flowers were at her door by 4. The handwritten card is what got me.”', n: 'Dennis O.', m: 'Westlands · Verified order', img: 'r2.jpg' },
  { t: '“We use Petal Club for reception every two weeks. Always different, always fresh, and I skip weeks from WhatsApp.”', n: 'Grace W.', m: 'Upper Hill · Petal Club member', img: 'r3.jpg' },
];

export const CLUB = {
  freq: [['weekly', 'Weekly'], ['biweekly', 'Every 2 weeks'], ['monthly', 'Monthly']],
  plans: [
    { id: 'posy', name: 'Posy', feat: ['Seasonal stems', 'Kraft wrap'], p: { weekly: 2600, biweekly: 2900, monthly: 3200 } },
    { id: 'signature', name: 'Signature', pop: true, feat: ['Larger bouquet', 'Free vase, 1st box', 'Care guide'], p: { weekly: 3900, biweekly: 4400, monthly: 4800 } },
    { id: 'office', name: 'Office', feat: ['Reception-size', 'Vase swap'], p: { weekly: 7000, biweekly: 7800, monthly: 8500 } },
  ],
};

export const GALLERY = [
  ['g1.jpg', 'Orange roses, peonies and hydrangea'],
  ['mood-justbecause.jpg', 'Wildflowers held up against a blue sky'],
  ['g3.jpg', 'Dahlias in pink, red and violet'],
  ['g5.jpg', 'Florist scissors and zinnias on the studio table'],
  ['g4.jpg', 'Pink roses and limonium in a straw bag'],
  ['g2.jpg', 'Wrapped roses and tulips at the market'],
];
