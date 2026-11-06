'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Heart, User } from 'lucide-react';
import { useCart } from '@/lib/api';
export function Logo({ size = 'text-2xl' }: { size?: string }) {
  return (<Link href="/" className={`font-serif tracking-[.25em] text-gold ${size}`}>
    <span className="block text-center text-lg leading-none">♛</span>MIRZA<span className="block text-[9px] tracking-[.4em] text-center">WATCHES</span></Link>);
}
export default function Nav() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { useCart.persist.rehydrate(); setMounted(true); }, []);
  const n = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  return (
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 bg-gradient-to-b from-black/90 to-transparent">
      <Logo />
      <nav className="hidden lg:flex gap-8 text-sm">
        {['Home', 'Collections', 'Men', 'Women', 'Luxury Watches', 'New Arrivals', 'About'].map((t, i) => (
          <Link key={t} href={['/', '/watches', '/watches?gender=MEN', '/watches?gender=WOMEN', '/watches?sort=price_desc', '/watches', '/#story'][i]} className={`pb-1 hover:text-lgold ${i === 0 ? 'text-gold border-b border-gold' : ''}`}>{t}</Link>))}
      </nav>
      <div className="flex items-center gap-5 text-lgold">
        <Search size={18} /><Link href="/wishlist"><Heart size={18} /></Link>
        <Link href="/cart" className="relative"><ShoppingCart size={18} />
          {mounted && n > 0 && <b className="absolute -top-2 -right-2 text-[10px] bg-gold text-black rounded-full w-4 h-4 grid place-items-center">{n}</b>}</Link>
        <Link href="/account"><User size={18} /></Link>
        <Link href="/login" className="hidden sm:block btn-ghost !py-1.5 !px-4 text-sm">Sign In</Link>
      </div>
    </header>
  );
}
