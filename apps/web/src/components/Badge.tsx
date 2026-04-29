import { clsx } from "clsx";

const tones = {
  allow: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  approval_required: "border-amber-300 bg-amber-50 text-amber-800",
  block: "border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border-[#d8d0c2] bg-[#f7f3eb] text-[#31363d]",
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return (
    <span className={clsx("inline-flex items-center border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]", tones[tone])}>
      {children}
    </span>
  );
}
