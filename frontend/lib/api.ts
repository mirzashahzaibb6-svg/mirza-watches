import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export async function api(path: string, opts: RequestInit = {}) {
  const r = await fetch(API + path, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(Array.isArray(data.message) ? data.message[0] : data.message || 'Error'), { status: r.status });
  return data;
}
type Item = { id: string; name: string; price: number; image: string; qty: number };
export const useCart = create<{ items: Item[]; add: (i: Omit<Item, 'qty'>) => void; remove: (id: string) => void; setQty: (id: string, q: number) => void; clear: () => void }>()(
  persist((set) => ({
    items: [],
    add: (i) => set((s) => ({ items: s.items.some((x) => x.id === i.id) ? s.items.map((x) => (x.id === i.id ? { ...x, qty: x.qty + 1 } : x)) : [...s.items, { ...i, qty: 1 }] })),
    remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
    clear: () => set({ items: [] }),
    setQty: (id, q) => set((s) => ({ items: q < 1 ? s.items.filter((x) => x.id !== id) : s.items.map((x) => (x.id === id ? { ...x, qty: q } : x)) })),
  }), { name: 'mirza-guest-cart', skipHydration: true }) // cart only; auth tokens stay in HttpOnly cookies
);
