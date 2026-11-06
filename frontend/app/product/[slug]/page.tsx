'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { api, useCart } from '@/lib/api';
export default function Product() {
  const { slug } = useParams<{ slug: string }>(), r = useRouter(), add = useCart((s) => s.add);
  const [p, setP] = useState<any>(null), [rel, setRel] = useState<any[]>([]), [img, setImg] = useState(0), [qty, setQty] = useState(1), [zoom, setZoom] = useState(false), [liked, setLiked] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { api('/products/' + slug).then((x) => { setP(x); if (x.collection) api('/products?collection=' + x.collection.slug + '&limit=5').then((d) => setRel(d.items.filter((i: any) => i.id !== x.id).slice(0, 4))); }).catch(() => setP(false)); }, [slug]);
  useEffect(() => {
    if (!p || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.p-img', { scale: 1.25, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.from('.p-info > *', { y: 30, opacity: 0, stagger: 0.09, delay: 0.3, ease: 'power3.out' });
    }, root);
    return () => ctx.revert();
  }, [p]);
  const [reviews, setReviews] = useState<any[]>([]), [rv, setRv] = useState({ rating: 5, title: '', body: '' }), [rmsg, setRmsg] = useState('');
  useEffect(() => { if (p) api(`/products/${p.id}/reviews`).then(setReviews).catch(() => {}); }, [p]);
  if (p === false) return <main className="pt-32 text-center">Watch not found. <Link className="text-gold" href="/watches">Back</Link></main>;
  if (!p) return <main className="pt-32 text-center text-muted">Loading…</main>;
  const item = { id: p.id, name: p.name, price: Number(p.salePrice ?? p.price), image: p.images[0] };
  return (
    <div ref={root} className="pt-28 px-6 lg:px-12 pb-16 bg-[radial-gradient(circle_at_30%_20%,#2a1a07,#050505_60%)] min-h-screen">
      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <img src={p.images[img]} alt={p.name} onClick={() => setZoom(true)} className="p-img w-full max-h-[560px] object-contain rounded-3xl cursor-zoom-in glass" />
          <div className="flex gap-3 mt-4">{p.images.map((s: string, i: number) => <img key={i} src={s} onClick={() => setImg(i)} className={`w-20 h-20 object-cover rounded-xl cursor-pointer border ${i === img ? 'border-gold' : 'border-line'}`} alt="" />)}</div>
        </div>
        <div className="p-info">
          <p className="text-gold text-xs tracking-[.3em]">{p.collection?.name || 'MIRZA'}</p>
          <h1 className="font-serif text-4xl my-3">{p.name}</h1>
          <p className="text-sm text-muted">★ {p.rating} ({p.reviewCount} reviews) · SKU {p.sku}</p>
          <p className="text-3xl text-lgold my-4">${p.salePrice ?? p.price} {p.salePrice && <s className="text-base text-muted">${p.price}</s>}</p>
          <p className={p.stock > 0 ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>{p.stock > 0 ? `In stock (${p.stock})` : 'Out of stock'}</p>
          <p className="text-white/75 my-5">{p.description}</p>
          <div className="flex items-center gap-4 mb-5"><button className="btn-ghost !px-4 !py-1" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>{qty}<button className="btn-ghost !px-4 !py-1" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button></div>
          <div className="flex gap-3 flex-wrap">
            <button disabled={p.stock < 1} className="btn-gold disabled:opacity-40" onClick={() => { for (let i = 0; i < qty; i++) add(item); }}>Add to Cart</button>
            <button disabled={p.stock < 1} className="btn-ghost" onClick={() => { for (let i = 0; i < qty; i++) add(item); r.push('/checkout'); }}>Buy Now</button>
            <button className="btn-ghost" onClick={() => api('/wishlist/' + p.id, { method: liked ? 'DELETE' : 'POST' }).then(() => setLiked(!liked)).catch(() => r.push('/login?next=/product/' + slug))}>{liked ? '♥' : '♡'} Wishlist</button>
          </div>
          <h3 className="font-serif text-xl mt-10 mb-3">Specifications</h3>
          <table className="w-full text-sm"><tbody>{Object.entries(p.specs as Record<string, string>).map(([k, v]) => <tr key={k} className="border-b border-line"><td className="py-2 text-muted">{k}</td><td>{v}</td></tr>)}</tbody></table>
          <h3 className="font-serif text-xl mt-10 mb-3">Reviews ({reviews.length})</h3>
          {reviews.map((x) => <div key={x.id} className="border-b border-line py-3 text-sm"><b>{'★'.repeat(x.rating)}</b> {x.title} <span className="text-muted">· {x.user.name} · Verified purchase</span><p className="text-white/70">{x.body}</p></div>)}
          <form className="mt-4 space-y-2" onSubmit={(e) => { e.preventDefault(); api(`/products/${p.id}/reviews`, { method: 'POST', body: JSON.stringify(rv) }).then(() => setRmsg('Thanks! Your review awaits approval.')).catch((x) => setRmsg(x.status === 401 ? 'Please sign in to review.' : x.message)); }}>
            <select className="inp" value={rv.rating} onChange={(e) => setRv({ ...rv, rating: +e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select>
            <input className="inp" placeholder="Title" onChange={(e) => setRv({ ...rv, title: e.target.value })} /><textarea className="inp" placeholder="Your review" onChange={(e) => setRv({ ...rv, body: e.target.value })} />
            <button className="btn-ghost !py-1.5">Submit review</button> <span className="text-xs text-lgold">{rmsg}</span></form>
        </div>
      </div>
      {!!rel.length && <><h2 className="font-serif text-2xl mt-16 mb-5">Related <span className="text-gold">Watches</span></h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{rel.map((x) => <Link key={x.id} href={`/product/${x.slug}`} className="glass p-3"><img src={x.images[0]} className="h-36 w-full object-cover rounded-xl" alt="" /><p className="mt-2 text-sm">{x.name}</p><p className="text-lgold">${x.salePrice ?? x.price}</p></Link>)}</div></>}
      {zoom && <div onClick={() => setZoom(false)} className="fixed inset-0 z-[60] bg-black/95 grid place-items-center cursor-zoom-out"><img src={p.images[img]} className="max-h-[90vh] max-w-[92vw]" alt="" /></div>}
    </div>
  );
}
