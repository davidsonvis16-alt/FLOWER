# Petal — React site

The Petal florist site rebuilt in React (JSX) with Vite. It keeps the same design and features as the original `../index.html`.

```bash
npm install
npm run dev       # local dev server
npm run build     # production build in dist/
npm run preview   # serve the build
```

## Where things live
- `src/data.js`: **CONFIG** (WhatsApp number, cutoff hour, free-delivery threshold, M-Pesa endpoint), plus products, moods, builder stems, zones, club plans and reviews
- `src/shop.jsx`: shared state for the bag, wishlist, overlays and toasts (saved to localStorage)
- `src/components/`: one file per section (Header, Hero, Mood, Products, Builder, Delivery, Club, Reviews, Footer, Overlays)
- `src/styles.css`: the original stylesheet, unchanged apart from font paths
- `public/images/`: real photos, all CC0 (free for commercial use, no attribution required). Sources and photographers are in `public/images/CREDITS.json`
- `public/images/logos/`: add the official `mpesa.svg`, `visa.svg`, `mastercard.svg` and `airtel-money.svg` here. Until you do, a text badge shows instead.

## Before going live
1. Set `CONFIG.whatsapp` in `src/data.js`.
2. Replace the placeholder phone number, email, rating, order count and reviews.
3. M-Pesa: set `CONFIG.mpesaEndpoint` to a backend route that calls Safaricom Daraja. Until then, checkout simulates the payment. "Send order on WhatsApp" already works for real.
4. Swap in your own studio photos when you have them, using the same file names.
