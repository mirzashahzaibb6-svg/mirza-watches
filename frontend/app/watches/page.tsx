'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, useCart } from '@/lib/api';
function List() {
  const sp = useSearchParams(), add = useCart((s) => s.add);
  const [q, setQ] = useState(''), [sort, setSort] = useState(sp.get('sort') || 'newest'), [data, setData] = useState<any>({ items: [], total: 0 }), [page, setPage] = useState(1);
  useEffect(() => {
    const p = new URLSearchParams({ page: String(page), limit: '12', sort, ...(q ? { search: q } : {}) });
    ['collection', 'gender'].forEach((k) => sp.get(k) && p.set(k, sp.get(k)!));
    api('/products?' + p).then(setData).catch(() => {});
  }, [q, sort, page, sp]);
  return (
    <main className="pt-28 px-6 lg:px-12 pb-16">
      <h1 className="font-serif text-4xl mb-6">Luxury <span className="text-gold">Watches</span></h1>
      <div className="flex gap-3 mb-8 flex-wrap">
        <input className="inp max-w-xs" placeholder="Search name or SKU" onChange={(e) => { setPage(1); setQ(e.target.value); }} />
        <select className="inp max-w-[200px]" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating">Top Rated</option></select>
      </div>
      {!data.items.length && <p className="text-muted">No watches found.</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {data.items.map((p: any) => (
          <div key={p.id} className="glass p-4">
            <Link href={`/product/${p.slug}`}><img src={p.images[0]} alt={p.name} className="h-48 w-full object-cover rounded-xl hover:scale-[1.02] transition" /><h3 className="mt-3 font-medium">{p.name}</h3></Link>
            <p className="text-xs text-muted">★ {p.rating} · {p.stock > 0 ? 'In stock' : 'Out of stock'}</p>
            <p className="text-lgold text-lg">${p.salePrice ?? p.price} {p.salePrice && <s className="text-xs text-muted">${p.price}</s>}</p>
            <button disabled={p.stock < 1} className="btn-gold w-full mt-3 !py-2 text-sm disabled:opacity-40" onClick={() => add({ id: p.id, name: p.name, price: Number(p.salePrice ?? p.price), image: p.images[0] })}>Add to Cart</button>
          </div>))}
      </div>
      <div className="flex gap-3 mt-8 justify-center"><button className="btn-ghost !py-1" disabled={page < 2} onClick={() => setPage(page - 1)}>Prev</button><button className="btn-ghost !py-1" disabled={page * 12 >= data.total} onClick={() => setPage(page + 1)}>Next</button></div>
    </main>
  );
}
export default function Watches() { return <Suspense><List /></Suspense>; }
