import { Logo } from './nav';
const perks = [['◆', 'Premium Quality', 'Guaranteed'], ['🚚', 'Free Worldwide', 'Shipping'], ['🛡', 'Secure Payments', '100% Secure'], ['🎧', '24/7 Customer', 'Support']];
export default function AuthShell({ title, lines, children }: { title: React.ReactNode; lines: string; children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] isolate">
      {/* layered cinematic background: glow -> rocks -> watch (all behind content) */}
      <div style={{ zIndex: -10 }} className="absolute inset-0 bg-[radial-gradient(ellipse_55%_75%_at_42%_45%,#5b3a0f_0%,#2a1a07_40%,#050505_75%)]" />
      <img src="/images/login-rocks.png" alt="" aria-hidden style={{ zIndex: -8 }} className="absolute left-0 bottom-[110px] w-[64%] max-w-[1070px] select-none pointer-events-none" />
      <img src="/images/login-watch.png" alt="MIRZA gold analog watch" style={{ zIndex: -5 }} className="absolute select-none pointer-events-none left-1/2 -translate-x-1/2 top-24 h-[46vh] opacity-40 lg:opacity-100 lg:left-[29.9%] lg:translate-x-0 lg:top-[12.8%] lg:h-[75.5%]" />
      <div className="relative z-10 grid lg:grid-cols-[1fr_minmax(380px,460px)] gap-8 min-h-screen px-6 lg:px-[5.2vw] pt-28 pb-32 items-center">
        <div className="max-w-[480px]">
          <p className="text-gold tracking-[.3em] text-xs mb-4">MIRZA WATCHES ——</p>
          <h1 className="font-serif text-5xl lg:text-[5.2rem] leading-[1.04]">{title}</h1>
          <p className="mt-6 max-w-sm text-white/85 text-lg">{lines}</p>
          <button type="button" className="mt-8 flex items-center gap-3"><span className="w-14 h-14 rounded-full border border-gold grid place-items-center text-gold">▶</span><span className="text-lgold">Watch Video</span></button>
        </div>
        <div className="glass p-8 w-full shadow-[0_0_70px_#C99A4530]"><div className="flex justify-center mb-4"><Logo /></div>{children}</div>
      </div>
      <div className="absolute bottom-0 inset-x-0 z-10 border-t border-line bg-black/60 backdrop-blur grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 lg:px-[5.2vw] py-5 text-sm">
        {perks.map(([i, a, b]) => <div key={a} className="flex items-center gap-3"><span className="text-gold text-xl">{i}</span><span>{a}<br /><span className="text-muted">{b}</span></span></div>)}
      </div>
    </main>
  );
}
