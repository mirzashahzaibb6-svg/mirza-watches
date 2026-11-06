'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api, useCart } from '@/lib/api';

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const add = useCart((s) => s.add);
  const [mail, setMail] = useState(''), [nm, setNm] = useState('');

  useEffect(() => {
    api('/collections').then(setCols).catch(() => {});
    api('/products?featured=true&limit=8').then((d) => setProducts(d.items)).catch(() => {});
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduce) return;
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.h-word', { yPercent: 110, opacity: 0, stagger: 0.12, duration: 0.9 })
        .from('.h-watch', { scale: 0.8, opacity: 0, duration: 1.4 }, 0.2)
        .from('.h-glow', { opacity: 0, scale: 0.6, duration: 1.6 }, 0.3)
        .from('.h-cta', { y: 30, opacity: 0, stagger: 0.15 }, '-=0.6');
      gsap.to('.h-watch', { y: -14, repeat: -1, yoyo: true, duration: 3, ease: 'sine.inOut' });
      gsap.to('.h-bg', { yPercent: 15, scrollTrigger: { trigger: '.hero', scrub: true, start: 'top top', end: 'bottom top' } });
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) =>
        gsap.from(el, { y: 50, opacity: 0, duration: 0.9, scrollTrigger: { trigger: el, start: 'top 85%', once: true } }));
    }, root);
    return () => ctx.revert();
  }, [cols.length, products.length]);

  return (
    <div ref={root}>
      <section className="hero relative min-h-screen overflow-hidden flex items-center px-6 lg:px-12">
        <div className="h-bg absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,#6b4513_0%,#050505_60%)]" />
        <div className="relative z-10 grid lg:grid-cols-2 gap-6 items-center w-full pt-24">
          <div>
            <p className="text-gold tracking-[.3em] text-xs mb-5">PREMIUM LUXURY WATCHES ——</p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05]">
              {['TIME IS YOUR'].map((l) => <span key={l} className="block overflow-hidden"><span className="h-word block">{l}</span></span>)}
              <span className="block overflow-hidden"><span className="h-word block text-gold">GREATEST LUXURY.</span></span>
            </h1>
            <p className="h-cta mt-6 max-w-md text-white/80">Experience timeless elegance with our exclusive collection of luxury watches crafted for true connoisseurs.</p>
            <div className="mt-8 flex gap-4 flex-wrap"><a href="/watches" className="h-cta btn-gold">Explore Collection →</a><a href="#story" className="h-cta btn-ghost">Discover More ▶</a></div>
            <p className="h-cta mt-8 text-xs text-muted">Trusted by 50K+ Happy Customers</p>
          </div>
          <div className="relative grid place-items-center">
            <div className="h-glow absolute w-[80%] aspect-square rounded-full border border-lgold/40 shadow-[0_0_120px_#C99A4566]" />
            <img src="/images/hero-home.jpg" alt="MIRZA luxury gold watch" className="h-watch relative w-full max-w-xl rounded-3xl [mask-image:radial-gradient(circle,#000_55%,transparent_75%)]" />
          </div>
        </div>
      </section>

      <section className="reveal border-y border-line py-5 px-6 flex flex-wrap justify-around gap-4 text-sm text-lgold">
        {['Premium Quality Guaranteed', 'Worldwide Shipping', 'Secure Payments', '24/7 Support', 'Luxury Packaging'].map((t) => <span key={t}>◆ {t}</span>)}
      </section>

      <section id="collections" className="px-6 lg:px-12 py-20">
        <h2 className="reveal font-serif text-3xl text-center mb-10">Explore Our <span className="text-gold">Exclusive Collections</span></h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cols.map((c, i) => (
            <Link key={c.id} href={`/watches?collection=${c.slug}`} className="reveal glass p-6 flex items-center justify-between hover:border-gold transition">
              <div><h3 className="font-serif text-xl">{c.name}</h3><p className="text-muted text-sm my-2">{c.blurb}</p><span className="text-gold text-sm">Explore Collection →</span></div>
              <img src={`/images/col-${(i % 4) + 1}.jpg`} alt={c.name} className="w-28 h-28 object-cover rounded-2xl" />
            </Link>))}
        </div>
      </section>

      <section className="px-6 lg:px-12 pb-20">
        <h2 className="reveal font-serif text-3xl mb-8">Our Best <span className="text-gold">Luxury Watches</span></h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <div key={p.id} className="reveal glass p-4">
              <Link href={`/product/${p.slug}`}><img src={p.images[0]} alt={p.name} className="h-48 w-full object-cover rounded-xl" /></Link>
              <Link href={`/product/${p.slug}`}><h3 className="mt-3 font-medium hover:text-lgold">{p.name}</h3></Link>
              <p className="text-xs text-muted">★ {p.rating} ({p.reviewCount})</p>
              <p className="text-lgold text-lg">${p.salePrice ?? p.price} <s className="text-xs text-muted">${p.price}</s></p>
              <button className="btn-gold w-full mt-3 !py-2 text-sm" onClick={() => add({ id: p.id, name: p.name, price: Number(p.salePrice ?? p.price), image: p.images[0] })}>Add to Cart</button>
            </div>))}
        </div>
      </section>

      <section id="story" className="reveal px-6 lg:px-12 py-24 text-center border-t border-line"><img src="/images/story.jpg" alt="Watch movement craftsmanship" className="mx-auto mb-8 w-full max-w-xl rounded-3xl" />
        <h2 className="font-serif text-4xl">THE ART OF <span className="text-gold">TIMELESS CRAFTSMANSHIP</span></h2>
        <p className="max-w-2xl mx-auto mt-5 text-white/70">MIRZA stands for precision, innovation and uncompromising quality. Every analog timepiece is built to transcend time.</p>
      </section>
      <section className="reveal px-6 py-14 text-center border-t border-line"><h2 className="font-serif text-2xl mb-4">Join the <span className="text-gold">MIRZA</span> Circle</h2>
        <form className="flex gap-2 justify-center flex-wrap" onSubmit={(e) => { e.preventDefault(); api('/newsletter', { method: 'POST', body: JSON.stringify({ email: mail }) }).then(() => setNm('Subscribed ✓')).catch(() => setNm('Invalid email')); }}>
          <input className="inp max-w-xs" type="email" required placeholder="Your email" value={mail} onChange={(e) => setMail(e.target.value)} /><button className="btn-gold">Subscribe</button></form><p className="text-xs text-lgold mt-2">{nm}</p></section>
      <footer className="border-t border-line py-8 text-center text-xs text-muted">© MIRZA Watches. TIMELESS ELEGANCE. EXTRAORDINARY PRECISION.</footer>
    </div>
  );
}
