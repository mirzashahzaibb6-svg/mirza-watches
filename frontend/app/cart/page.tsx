'use client';
import Link from 'next/link';
import { useCart } from '@/lib/api';
export default function Cart() {
  const { items, setQty, remove } = useCart();
  const sub = items.reduce((a, b) => a + b.price * b.qty, 0);
  return (
    <main className="pt-28 px-6 lg:px-12 max-w-3xl mx-auto pb-16">
      <h1 className="font-serif text-3xl mb-6">Your Cart</h1>
      {!items.length && <p className="text-muted">Cart is empty. <Link href="/watches" className="text-gold">Browse watches</Link></p>}
      {items.map((i) => (
        <div key={i.id} className="glass p-3 mb-3 flex items-center gap-4">
          <img src={i.image} className="w-16 h-16 rounded-xl object-cover" alt="" /><div className="flex-1">{i.name}<p className="text-lgold">${i.price}</p></div>
          <button onClick={() => setQty(i.id, i.qty - 1)}>−</button>{i.qty}<button onClick={() => setQty(i.id, i.qty + 1)}>+</button>
          <button className="text-xs text-muted" onClick={() => remove(i.id)}>remove</button>
        </div>))}
      {!!items.length && <div className="flex justify-between items-center mt-6"><p className="text-xl">Subtotal: <span className="text-lgold">${sub}</span></p><Link href="/checkout" className="btn-gold">Checkout →</Link></div>}
    </main>
  );
}
