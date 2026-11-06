'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import AuthShell from '../auth-shell';

function Form() {
  const r = useRouter(), next = useSearchParams().get('next') || '/';
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '', terms: false });
  const [err, setErr] = useState('');
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (f.password !== f.confirm) return setErr('Passwords do not match');
    if (!f.terms) return setErr('Please accept the Terms and Conditions');
    try { await api('/auth/register', { method: 'POST', body: JSON.stringify({ name: f.name, email: f.email, phone: f.phone, password: f.password }) }); r.push(next); }
    catch (x: any) { setErr(x.message); }
  };
  return (
    <AuthShell title={<>BECOME A<br />PART OF<br /><span className="text-gold">LUXURY.</span></>} lines="Create your account and unlock exclusive benefits, special offers and a premium shopping experience.">
      <h2 className="font-serif text-3xl text-center mb-6">Create Account</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="inp" placeholder="Full Name" required onChange={set('name')} />
        <input className="inp" type="email" placeholder="Email Address" required onChange={set('email')} />
        <input className="inp" placeholder="Phone Number (+923001234567)" required onChange={set('phone')} />
        <input className="inp" type="password" placeholder="Password" required onChange={set('password')} />
        <input className="inp" type="password" placeholder="Confirm Password" required onChange={set('confirm')} />
        <label className="text-xs text-muted flex gap-2"><input type="checkbox" onChange={set('terms')} /> I agree to the Terms and Conditions and Privacy Policy</label>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="btn-gold w-full">Create Account</button>
      </form>
      <p className="text-center text-sm mt-5 text-muted">Already have an account? <Link className="text-lgold" href={`/login?next=${encodeURIComponent(next)}`}>Sign In</Link></p>
    </AuthShell>
  );
}
export default function Signup() { return <Suspense><Form /></Suspense>; }
