import { CONFIG } from './data.js';

export const img = f => `${import.meta.env.BASE_URL}images/${f}`;
export const kes = n => 'KES ' + Math.round(n).toLocaleString('en-KE');
export const round50 = n => Math.round(n / 50) * 50;
export const waLink = text => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

// "Nairobi clock": a Date whose UTC fields read as Nairobi local time
export const nbo = () => new Date(Date.now() + CONFIG.utcOffset * 3600e3);
export const beforeCutoff = () => nbo().getUTCHours() < CONFIG.cutoffHour;
export const isoDay = d => d.toISOString().slice(0, 10);
export const minDeliveryDate = () => { const n = nbo(); if (!beforeCutoff()) n.setUTCDate(n.getUTCDate() + 1); return isoDay(n); };

/* M-Pesa STK push. Until CONFIG.mpesaEndpoint is set, this simulates a successful payment.
   Your endpoint should call Safaricom Daraja "Lipa na M-Pesa Online" and return { ok:true }
   once the callback confirms. */
export async function requestMpesaPayment(payload) {
  if (!CONFIG.mpesaEndpoint) { await new Promise(r => setTimeout(r, 3200)); return { ok: true, preview: true }; }
  const res = await fetch(CONFIG.mpesaEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.message || 'M-Pesa request failed. Please try again.');
  return data;
}

export const fmtDate = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

// Kenyan mobile number → "07XXXXXXXX", or null if it isn't one
export const normPhone = p => {
  const d = String(p).replace(/[\s-]/g, '');
  return /^(?:\+?254|0)?[17]\d{8}$/.test(d) ? '0' + d.slice(-9) : null;
};
export const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

/* ---------- Demo accounts (browser only) ----------
   Passwords are hashed before they are stored, but this is still a front-end
   demo: replace with a real auth backend before launch. */
export async function hashPw(pw) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('petal:' + pw));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 0; for (const c of 'petal:' + pw) h = (h * 31 + c.charCodeAt(0)) | 0;
    return 'h' + h;
  }
}

/* ---------- Cards ---------- */
export const digits = s => String(s).replace(/\D/g, '');
export const luhn = n => {
  if (n.length < 13 || n.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < n.length; i++) {
    let d = +n[n.length - 1 - i];
    if (i % 2) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
};
export const cardBrand = n => /^4/.test(n) ? 'Visa' : /^(5[1-5]|2[2-7])/.test(n) ? 'Mastercard' : null;
export const fmtCard = s => digits(s).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
export const fmtExpiry = s => { const d = digits(s).slice(0, 4); return d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d; };
export const expiryOk = s => {
  const d = digits(s); if (d.length !== 4) return false;
  const m = +d.slice(0, 2), y = 2000 + +d.slice(2);
  if (m < 1 || m > 12) return false;
  const now = new Date();
  return y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1);
};

/* ---------- Simulated payments ----------
   Test values, shown to the person demoing the site:
   M-Pesa 0700 000 000 → cancelled on the phone; any other number → paid.
   Card 4000 0000 0000 0002 → declined; any other valid card → 3-D Secure, code 123456. */
export const TEST = { mpesaFail: '0700000000', cardDecline: '4000000000000002', otp: '123456' };
const wait = ms => new Promise(r => setTimeout(r, ms));

export async function mpesaCharge({ phone }) {
  await wait(4200);
  if (phone === TEST.mpesaFail) throw new Error('The M-Pesa request was cancelled on the phone. Nothing was charged.');
  return { receipt: 'S' + Math.random().toString(36).slice(2, 11).toUpperCase() };
}
export async function cardAuthorise({ number }) {
  await wait(1400);
  if (number === TEST.cardDecline) throw new Error('Your bank declined this card. Try another card or pay with M-Pesa.');
  return { needsOtp: true };
}
export async function cardConfirm({ otp }) {
  await wait(1100);
  if (otp !== TEST.otp) throw new Error('That code is not right. Check the SMS from your bank and try again.');
  return { receipt: 'C' + Math.random().toString(36).slice(2, 11).toUpperCase() };
}

/* ---------- Order tracking ---------- */
export const STEPS = ['Order received', 'Being arranged', 'Out with our rider', 'Delivered'];
export function orderStep(o, now = Date.now()) {
  const today = isoDay(nbo());
  if (o.date > today) return 0;
  if (o.date < today) return 3;
  const mins = (now - o.placed) / 60000, [a, b, c] = CONFIG.statusMinutes;
  return mins < a ? 0 : mins < b ? 1 : mins < c ? 2 : 3;
}
