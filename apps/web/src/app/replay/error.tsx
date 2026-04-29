"use client";

import { AlertTriangle } from "lucide-react";

export default function ReplayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#040406] pt-24 text-white">
      <section className="mx-auto w-full max-w-4xl px-5 py-16">
        <div className="border border-rose-300/25 bg-rose-950/20 p-8" role="alert">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-rose-100" aria-hidden="true" />
            <div>
              <p className="mono text-xs font-bold uppercase tracking-[0.22em] text-rose-100">Error</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Replay could not render.</h1>
              <p className="mt-4 text-lg leading-8 text-[#f1c8cf]">
                {error.message || "The server replay failed before the timeline could be built."}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 inline-flex min-h-11 items-center justify-center border border-white/18 bg-white px-4 text-sm font-bold text-[#040406] transition hover:bg-[#dfe8f7] focus:outline-none focus:ring-2 focus:ring-[#7fb0ff] focus:ring-offset-2 focus:ring-offset-[#040406]"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
