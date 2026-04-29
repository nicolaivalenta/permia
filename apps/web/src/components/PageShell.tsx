import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function PageShell({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#040406] pt-24 text-white">
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="hero-grid overflow-hidden border border-white/12 px-6 py-12 text-white md:px-10 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 inline-flex border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/86">
                Permia agent tool preflight
              </p>
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/78">{summary}</p>
            </div>
            <Link href="/replay" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#040406] transition hover:-translate-y-0.5">
              Open replay lab <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="py-8">{children}</div>
      </section>
    </main>
  );
}
