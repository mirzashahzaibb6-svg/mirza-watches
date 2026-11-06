'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, useCart } from '@/lib/api';

export default function Checkout() {
  const r = useRouter(), { items, remove, clear } = useCart();
  const [ready, setReady] = useState(false), [done, setDone] = useState<any>(null), [err, setErr] = useState('');
  const [code, setCode] = useState(''), [disc, setDisc] = useState(0);
  const [addr, setAddr] = useState({ city: '', area: '', street: '', postal: '', phone: '' });
  useEffect(() => { api('/auth/me').then(() => setReady(true)).catch(() => r.replace('/login?next=/checkout')); }, [r]);
  if (!ready) return <main className="pt-32 text-center text-muted">Checking session…</main>;
  const total = items.reduce((a, b) => a + b.price * b.qty, 0);
  const place = async () => {
    try { setDone(await api('/orders', { method: 'POST', body: JSON.stringify({ items: items.map((i) => ({ productId: i.id, quantity: i.qty })), address: addr, delivery: 'standard', method: 'COD', coupon: disc ? code : undefined }) })); clear(); }
    catch (e: any) { setErr(e.message); }
  };
  if (done) return <main className="pt-32 text-center"><h1 className="font-serif text-3xl text-gold">Order placed ✓</h1><p className="text-muted mt-2">Order #{done.id} · Total ${done.total}</p></main>;
  return (
    <main className="pt-28 px-6 lg:px-12 max-w-3xl mx-auto pb-16">
      <h1 className="font-serif text-3xl mb-6">Checkout</h1>
      {items.map((i) => <div key={i.id} className="glass p-3 mb-3 flex justify-between"><span>{i.name} × {i.qty}</span><span>${i.price * i.qty} <button className="text-xs text-muted ml-3" onClick={() => remove(i.id)}>remove</button></span></div>)}
      <div className="grid grid-cols-2 gap-3 my-6">{Object.keys(addr).map((k) => <input key={k} className="inp" placeholder={k} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} />)}</div>
      <div className="flex gap-2 mb-4"><input className="inp max-w-xs" placeholder="Coupon code (e.g. WELCOME10)" value={code} onChange={(e) => { setCode(e.target.value); setDisc(0); }} /><button className="btn-ghost !py-2" onClick={() => api('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal: total }) }).then((r) => { setDisc(r.discount); setErr(''); }).catch((e) => setErr(e.message))}>Apply</button></div>
      {disc > 0 && <p className="text-lgold text-sm mb-2">Discount: −${disc}</p>}
      <p className="text-muted text-sm mb-4">Payment: Cash on Delivery · Prices are recalculated by the server.</p>
      {err && <p className="text-red-400 mb-3">{err}</p>}
      <button className="btn-gold" disabled={!items.length} onClick={place}>Place Order · ${total - disc}</button>
    </main>
  );
}
