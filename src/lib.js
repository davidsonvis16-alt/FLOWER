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
