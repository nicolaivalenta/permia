export function Metric({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-white/12 bg-[#080a0d] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-[#768398]">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</div>
      {sub ? <div className="mt-1 text-sm text-[#9da8b8]">{sub}</div> : null}
    </div>
  );
}
