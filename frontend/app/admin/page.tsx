'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'];
export default function Admin() {
  const r = useRouter(), [ok, setOk] = useState(false), [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<any>(null), [products, setProducts] = useState<any[]>([]), [orders, setOrders] = useState<any[]>([]), [customers, setCustomers] = useState<any[]>([]), [cols, setCols] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]), [coupons, setCoupons] = useState<any[]>([]), [cf, setCf] = useState<any>({ code: '', type: 'PERCENT', value: '', minOrder: '' });
  const [f, setF] = useState<any>({ name: '', sku: '', price: '', salePrice: '', stock: '', description: '', collectionId: '' }), [msg, setMsg] = useState('');
  const load = () => { api('/admin/stats').then(setStats); api('/admin/products').then(setProducts); api('/admin/orders').then(setOrders); api('/admin/customers').then(setCustomers); api('/collections').then(setCols); api('/admin/reviews').then(setReviews); api('/admin/coupons').then(setCoupons); };
  useEffect(() => { api('/auth/me').then((u) => { if (!['ADMIN', 'SUPER_ADMIN'].includes(u.role)) throw 0; setOk(true); load(); }).catch(() => r.replace('/login?next=/admin')); }, [r]);
  const act = (fn: Promise<any>) => fn.then(load).catch((e) => setMsg(e.message));
  if (!ok) return <main className="pt-32 text-center text-muted">Checking access…</main>;
  const body = (m: string, b: any) => ({ method: m, body: JSON.stringify(b) });
  return (
    <main className="pt-28 px-6 lg:px-12 pb-16">
      <h1 className="font-serif text-3xl mb-5">MIRZA <span className="text-gold">Admin</span></h1>
      <div className="flex gap-2 mb-6 flex-wrap">{['overview', 'products', 'orders', 'customers', 'reviews', 'coupons'].map((t) => <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn-gold !py-1.5' : 'btn-ghost !py-1.5'}>{t}</button>)}</div>
      {msg && <p className="text-red-400 mb-3">{msg}</p>}
      {tab === 'overview' && stats && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[['Revenue (paid)', '$' + stats.revenue], ['Orders', stats.orders], ['Customers', stats.customers], ['Products', stats.products], ['Pending', stats.pending], ['Delivered', stats.delivered], ['Low stock', stats.lowStock]].map(([k, v]) => <div key={k as string} className="glass p-4"><p className="text-muted text-xs">{k}</p><p className="text-2xl text-lgold">{v}</p></div>)}</div>
        <h2 className="font-serif text-xl mt-8 mb-3">Recent orders</h2>{stats.recent.map((o: any) => <p key={o.id} className="text-sm border-b border-line py-2">#{o.id.slice(-8)} · {o.user.name} · ${o.total} · {o.status}</p>)}</>}
      {tab === 'products' && <>
        <form className="grid sm:grid-cols-3 gap-3 mb-8" onSubmit={(e) => { e.preventDefault(); act(api('/admin/products', body('POST', f))); }}>
          {['name', 'sku', 'price', 'salePrice', 'stock', 'description'].map((k) => <input key={k} className="inp" placeholder={k} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}
          <select className="inp" value={f.collectionId} onChange={(e) => setF({ ...f, collectionId: e.target.value })}><option value="">Collection</option>{cols.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <button className="btn-gold">Add Product</button></form>
        {products.map((p) => <div key={p.id} className="glass p-3 mb-2 flex items-center gap-3 flex-wrap text-sm">
          <img src={p.images[0]} className="w-12 h-12 rounded-lg object-cover" alt="" /><span className="flex-1 min-w-[160px]">{p.name}<br /><span className="text-muted">{p.sku} · ${p.price}</span></span>
          <input className="inp !w-20 !py-1" defaultValue={p.stock} onBlur={(e) => act(api('/admin/products/' + p.id, body('PATCH', { stock: e.target.value })))} />
          <button className="btn-ghost !py-1 !px-3" onClick={() => act(api('/admin/products/' + p.id, body('PATCH', { published: !p.published })))}>{p.published ? 'Unpublish' : 'Publish'}</button>
          <button className="btn-ghost !py-1 !px-3" onClick={() => act(api('/admin/products/' + p.id, body('PATCH', { featured: !p.featured })))}>{p.featured ? '★ Featured' : '☆ Feature'}</button>
          <button className="text-red-400" onClick={() => confirm('Delete (hide) product?') && act(api('/admin/products/' + p.id, { method: 'DELETE' }))}>Delete</button></div>)}</>}
      {tab === 'orders' && orders.map((o) => <div key={o.id} className="glass p-4 mb-3 text-sm"><div className="flex justify-between flex-wrap gap-2"><span>#{o.id.slice(-8)} · {o.user.name} ({o.user.email}) · <b className="text-lgold">${o.total}</b></span>
        <span className="flex gap-2"><select className="inp !py-1 !w-auto" value={o.status} onChange={(e) => act(api(`/admin/orders/${o.id}/status`, body('PATCH', { status: e.target.value })))}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <select className="inp !py-1 !w-auto" value={o.payment?.status} onChange={(e) => act(api(`/admin/orders/${o.id}/payment`, body('PATCH', { status: e.target.value })))}>{['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'].map((s) => <option key={s}>{s}</option>)}</select></span></div>
        <p className="text-muted mt-1">{o.items.map((i: any) => `${i.product.name}×${i.quantity}`).join(', ')} · {o.payment?.method}</p></div>)}
      {tab === 'customers' && customers.map((c) => <div key={c.id} className="glass p-3 mb-2 flex justify-between items-center text-sm"><span>{c.name} · {c.email} · {c._count.orders} orders</span>
        <button className="btn-ghost !py-1 !px-3" onClick={() => act(api(`/admin/customers/${c.id}/block`, body('PATCH', { blocked: !c.blocked })))}>{c.blocked ? 'Unblock' : 'Block'}</button></div>)}
      {tab === 'reviews' && reviews.map((x) => <div key={x.id} className="glass p-3 mb-2 text-sm flex justify-between gap-3"><span>{'★'.repeat(x.rating)} <b>{x.title}</b> · {x.product.name} · {x.user.name}<br /><span className="text-muted">{x.body}</span></span>
        <button className="btn-ghost !py-1 !px-3 h-fit" onClick={() => act(api('/admin/reviews/' + x.id, body('PATCH', { approved: !x.approved })))}>{x.approved ? 'Unapprove' : 'Approve'}</button></div>)}
      {tab === 'coupons' && <><form className="grid sm:grid-cols-5 gap-3 mb-6" onSubmit={(e) => { e.preventDefault(); act(api('/admin/coupons', body('POST', cf))); }}>
        <input className="inp" placeholder="CODE" onChange={(e) => setCf({ ...cf, code: e.target.value })} /><select className="inp" onChange={(e) => setCf({ ...cf, type: e.target.value })}><option>PERCENT</option><option>FIXED</option></select>
        <input className="inp" placeholder="value" onChange={(e) => setCf({ ...cf, value: e.target.value })} /><input className="inp" placeholder="min order" onChange={(e) => setCf({ ...cf, minOrder: e.target.value })} /><button className="btn-gold">Add</button></form>
        {coupons.map((c) => <div key={c.id} className="glass p-3 mb-2 flex justify-between text-sm"><span>{c.code} · {c.type} {c.value} · min ${c.minOrder} · used {c.used}</span><button className="btn-ghost !py-1 !px-3" onClick={() => act(api('/admin/coupons/' + c.id, body('PATCH', { active: !c.active })))}>{c.active ? 'Disable' : 'Enable'}</button></div>)}</>}
    </main>
  );
}
