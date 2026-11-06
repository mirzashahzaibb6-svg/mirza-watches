'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import AuthShell from '../auth-shell';

function Form() {
  const r = useRouter(), next = useSearchParams().get('next') || '/';
  const [f, setF] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api('/auth/login', { method: 'POST', body: JSON.stringify(f) }); r.push(next); }
    catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <AuthShell title={<>TIME IS YOUR<br /><span className="text-gold">GREATEST<br />LUXURY.</span></>} lines="Experience timeless elegance with our exclusive collection of luxury watches.">
      <h2 className="font-serif text-3xl text-center">Welcome Back</h2>
      <p className="text-center text-sm text-white/80 mb-6">Sign in to continue your luxury journey</p>
      {next.includes('checkout') && <p className="text-lgold text-sm text-center mb-4">Please sign in to complete your purchase.</p>}
      <form onSubmit={submit} className="space-y-4">
        <div className="relative"><Mail size={18} className="absolute left-4 top-4 text-muted" /><input className="inp !pl-12" type="email" placeholder="Email Address" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div className="relative"><Lock size={18} className="absolute left-4 top-4 text-muted" /><input className="inp !pl-12" type={show ? 'text' : 'password'} placeholder="Password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          <button type="button" aria-label="Toggle password" onClick={() => setShow(!show)} className="absolute right-4 top-4 text-muted">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
        <div className="flex justify-between text-sm"><label className="flex gap-2 items-center"><input type="checkbox" /> Remember Me</label><a className="text-lgold" href="#">Forgot Password?</a></div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button disabled={busy} className="btn-gold w-full">{busy ? 'Signing in…' : 'Sign In →'}</button>
      </form>
      <div className="flex items-center gap-3 my-4 text-xs text-muted"><i className="flex-1 h-px bg-line" />OR<i className="flex-1 h-px bg-line" /></div>
      <button type="button" className="btn-ghost w-full !border-line mb-3 text-sm">Continue with Google</button>
      <button type="button" className="btn-ghost w-full !border-line text-sm"> Continue with Apple</button>
      <p className="text-center text-sm mt-5 text-white/80">Don't have an account? <Link className="text-lgold" href={`/signup?next=${encodeURIComponent(next)}`}>Sign Up →</Link></p>
    </AuthShell>
  );
}
export default function Login() { return <Suspense><Form /></Suspense>; }
