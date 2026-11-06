'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, useCart } from '@/lib/api';
export default function Wishlist() {
  const r = useRouter(), add = useCart((s) => s.add), [items, setItems] = useState<any[] | null>(null);
  const load = () => api('/wishlist').then(setItems).catch(() => r.replace('/login?next=/wishlist'));
  useEffect(() => { load(); }, []);
  if (!items) return <main className="pt-32 text-center text-muted">Loading…</main>;
  return (
    <main className="pt-28 px-6 lg:px-12 pb-16"><h1 className="font-serif text-3xl mb-6">My <span className="text-gold">Wishlist</span></h1>
      {!items.length && <p className="text-muted">Nothing saved yet. <Link href="/watches" className="text-gold">Browse watches</Link></p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{items.map(({ product: p }) => (
        <div key={p.id} className="glass p-4"><Link href={`/product/${p.slug}`}><img src={p.images[0]} className="h-44 w-full object-cover rounded-xl" alt={p.name} /><h3 className="mt-2">{p.name}</h3></Link>
          <p className="text-lgold">${p.salePrice ?? p.price}</p>
          <button className="btn-gold w-full mt-2 !py-2 text-sm" onClick={() => { add({ id: p.id, name: p.name, price: Number(p.salePrice ?? p.price), image: p.images[0] }); api('/wishlist/' + p.id, { method: 'DELETE' }).then(load); }}>Move to Cart</button>
          <button className="text-xs text-muted mt-2" onClick={() => api('/wishlist/' + p.id, { method: 'DELETE' }).then(load)}>Remove</button></div>))}</div></main>
  );
}
