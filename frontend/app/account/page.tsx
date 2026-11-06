'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, API } from '@/lib/api';
export default function Account() {
  const r = useRouter(), [me, setMe] = useState<any>(null), [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { api('/auth/me').then((u) => { setMe(u); api('/orders/mine').then(setOrders); }).catch(() => r.replace('/login?next=/account')); }, [r]);
  if (!me) return <main className="pt-32 text-center text-muted">Loading…</main>;
  return (
    <main className="pt-28 px-6 lg:px-12 max-w-3xl mx-auto pb-16">
      <div className="flex justify-between items-center mb-6"><h1 className="font-serif text-3xl">Welcome, <span className="text-gold">{me.name}</span></h1>
        <button className="btn-ghost !py-1" onClick={async () => { await api('/auth/logout', { method: 'POST' }); r.push('/'); }}>Logout</button></div>
      <h2 className="font-serif text-xl mb-3">My Orders</h2>
      {!orders.length && <p className="text-muted">No orders yet.</p>}
      {orders.map((o) => <div key={o.id} className="glass p-4 mb-3"><div className="flex justify-between"><span>#{o.id.slice(-8)} · <a className="text-lgold text-xs" href={`${API}/orders/${o.id}/invoice`}>Invoice PDF</a></span><span className="text-lgold">${o.total}</span></div>
        <p className="text-xs text-muted">{o.status} · Payment {o.payment?.status} ({o.payment?.method}) · {o.items.map((i: any) => `${i.product.name}×${i.quantity}`).join(', ')}</p></div>)}
    </main>
  );
}
