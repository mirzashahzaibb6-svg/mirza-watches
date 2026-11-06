'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
function V() {
  const token = useSearchParams().get('token'), [s, setS] = useState('Verifying…');
  useEffect(() => { if (!token) return setS('Missing token'); api('/auth/verify', { method: 'POST', body: JSON.stringify({ token }) }).then(() => setS('Email verified ✓')).catch((e) => setS(e.message)); }, [token]);
  return <main className="pt-36 text-center"><h1 className="font-serif text-3xl text-gold">{s}</h1><Link href="/" className="btn-gold inline-block mt-8">Continue shopping</Link></main>;
}
export default function Page() { return <Suspense><V /></Suspense>; }
