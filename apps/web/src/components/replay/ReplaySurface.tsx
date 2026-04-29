import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Code2,
  FileJson2,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import type { DangerousWorkflowFixture, Gate, ReplayResult } from "@permia/core";

const gateLabels: Record<Gate, string> = {
  allow: "Allowed",
  warn: "Warning",
  approval_required: "Approval required",
  block: "Blocked",
};

const gateStyles: Record<Gate, string> = {
  allow: "border-emerald-300/35 bg-emerald-950/28 text-emerald-100",
  warn: "border-amber-300/35 bg-amber-950/28 text-amber-100",
  approval_required: "border-sky-300/35 bg-sky-950/28 text-sky-100",
  block: "border-rose-300/35 bg-rose-950/28 text-rose-100",
};

function gateClassName(gate: Gate) {
  return `inline-flex min-h-11 items-center justify-center border px-3 text-xs font-bold uppercase tracking-[0.14em] ${gateStyles[gate]}`;
}

function statusCopy(replay: ReplayResult) {
  if (replay.matchedExpectedGate) {
    return {
      label: "Success",
      title: `${gateLabels[replay.decision.status]} matched the expected gate.`,
      description: replay.fixture.preventedSideEffect,
      icon: CheckCircle2,
    };
  }

  return {
    label: "Partial",
    title: `${gateLabels[replay.decision.status]} did not match the expected ${gateLabels[replay.fixture.expectedGate].toLowerCase()} gate.`,
    description: "The replay completed, but the expected policy outcome and returned decision diverged.",
    icon: AlertTriangle,
  };
}

export function ReplaySurface({
  fixtures,
  replay,
  selectedId,
}: {
  fixtures: DangerousWorkflowFixture[];
  replay: ReplayResult;
  selectedId: string;
}) {
  const status = statusCopy(replay);
  const StatusIcon = status.icon;
  const apiUrl = `/api/v1/replay?id=${encodeURIComponent(selectedId)}`;

  return (
    <main className="min-h-screen bg-[#040406] pt-24 text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10 md:py-14">
        <header className="grid gap-7 border-b border-white/12 pb-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="min-w-0">
            <p className="mono text-xs font-bold uppercase tracking-[0.22em] text-[#7d8ba0]">
              Server-owned replay
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              Outcome-first replay for dangerous agent workflows.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#aeb8c7]">
              The server replays a fixture, returns the gate, and exposes the evidence chain before any external side effect can run.
            </p>
          </div>

          <div className="border border-white/12 bg-[#080a0d] p-5" role="status" aria-live="polite">
            <div className="flex items-start gap-3">
              <StatusIcon className="mt-1 h-5 w-5 shrink-0 text-[#7fb0ff]" aria-hidden="true" />
              <div>
                <p className="mono text-xs font-bold uppercase tracking-[0.18em] text-[#93a4b8]">
                  {status.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">{status.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#aeb8c7]">{status.description}</p>
              </div>
            </div>
          </div>
        </header>

        <section aria-labelledby="scenario-label" className="grid gap-3 border-b border-white/12 pb-7">
          <h2 id="scenario-label" className="text-base font-semibold text-white">
            Replay scenario
          </h2>
          <ul className="flex flex-wrap gap-3" aria-label="Available dangerous workflow fixtures">
            {fixtures.map((fixture) => {
              const active = fixture.id === selectedId;
              return (
                <li key={fixture.id}>
                  <Link
                    href={`/replay?id=${encodeURIComponent(fixture.id)}`}
                    className={`inline-flex min-h-11 items-center justify-center border px-4 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#7fb0ff] focus:ring-offset-2 focus:ring-offset-[#040406] ${
                      active
                        ? "border-white bg-white text-[#040406]"
                        : "border-white/14 bg-white/[0.04] text-[#dce5f2] hover:border-white/35 hover:bg-white/[0.08]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {fixture.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
          <section aria-labelledby="timeline-title" className="min-w-0 border border-white/12 bg-[#080a0d]">
            <div className="grid gap-4 border-b border-white/12 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <h2 id="timeline-title" className="text-2xl font-semibold text-white">
                  Decision timeline
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#9da8b8]">
                  Primary artifact for the replay. Each step includes text status and gate labels, not color alone.
                </p>
              </div>
              <span className={gateClassName(replay.decision.status)}>
                Final gate: {gateLabels[replay.decision.status]}
              </span>
            </div>

            <ol className="divide-y divide-white/10">
              {replay.timeline.map((event, index) => (
                <li key={event.id} className="grid gap-4 p-5 md:grid-cols-[4.5rem_minmax(0,1fr)_auto]">
                  <div className="mono text-sm font-bold text-[#7d8ba0]">Step {index + 1}</div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white">{event.label}</h3>
                    <p className="mt-2 break-words text-sm leading-6 text-[#c3cad6]">{event.detail}</p>
                  </div>
                  {event.gate ? (
                    <span className={gateClassName(event.gate)}>{gateLabels[event.gate]}</span>
                  ) : (
                    <span className="inline-flex min-h-11 items-center justify-center border border-white/12 bg-white/[0.04] px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#c3cad6]">
                      Observed
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <aside aria-labelledby="evidence-title" className="grid gap-6">
            <section className="border border-white/12 bg-[#080a0d] p-5">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-[#7fb0ff]" aria-hidden="true" />
                <h2 id="evidence-title" className="text-xl font-semibold text-white">
                  Evidence
                </h2>
              </div>
              <dl className="mt-5 grid gap-4 text-sm">
                <div>
                  <dt className="mono text-xs font-bold uppercase tracking-[0.16em] text-[#7d8ba0]">Risk label</dt>
                  <dd className="mt-1 text-[#dce5f2]">{replay.fixture.riskLabel}</dd>
                </div>
                <div>
                  <dt className="mono text-xs font-bold uppercase tracking-[0.16em] text-[#7d8ba0]">Expected outcome</dt>
                  <dd className="mt-1 text-[#dce5f2]">{gateLabels[replay.fixture.expectedGate]}</dd>
                </div>
                <div>
                  <dt className="mono text-xs font-bold uppercase tracking-[0.16em] text-[#7d8ba0]">Policy profile</dt>
                  <dd className="mt-1 text-[#dce5f2]">{replay.fixture.policyProfile}</dd>
                </div>
                <div>
                  <dt className="mono text-xs font-bold uppercase tracking-[0.16em] text-[#7d8ba0]">Prevention</dt>
                  <dd className="mt-1 text-[#dce5f2]">{replay.fixture.preventedSideEffect}</dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="text-base font-semibold text-white">Risk findings</h3>
                {replay.decision.riskFindings.length > 0 ? (
                  <ul className="mt-3 grid gap-3">
                    {replay.decision.riskFindings.map((finding) => (
                      <li key={finding.id} className="border border-white/10 bg-black/20 p-3">
                        <p className="font-semibold text-white">{finding.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[#aeb8c7]">{finding.detail}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[#aeb8c7]">
                    No high-risk chain was found for this replay.
                  </p>
                )}
              </div>
            </section>

            <section aria-labelledby="developer-actions-title" className="border border-white/12 bg-[#080a0d] p-5">
              <div className="flex items-center gap-3">
                <Code2 className="h-5 w-5 text-[#7fb0ff]" aria-hidden="true" />
                <h2 id="developer-actions-title" className="text-xl font-semibold text-white">
                  Developer actions
                </h2>
              </div>
              <div className="mt-5 grid gap-3">
                <Link
                  href={apiUrl}
                  className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/18 bg-white px-4 text-sm font-bold text-[#040406] transition hover:bg-[#dfe8f7] focus:outline-none focus:ring-2 focus:ring-[#7fb0ff] focus:ring-offset-2 focus:ring-offset-[#040406]"
                >
                  <FileJson2 className="h-4 w-4" aria-hidden="true" />
                  Open JSON replay
                </Link>
                <Link
                  href="/playground"
                  className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/18 bg-white/[0.04] px-4 text-sm font-bold text-white transition hover:border-white/35 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#7fb0ff] focus:ring-offset-2 focus:ring-offset-[#040406]"
                >
                  API playground
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Terminal className="h-4 w-4 text-[#7fb0ff]" aria-hidden="true" />
                  CLI fixture replay
                </div>
                <pre className="mt-3 overflow-auto bg-black/40 p-4 mono text-xs leading-6 text-[#c3cad6]">
                  {replay.fixture.cliCommand}
                </pre>
              </div>
            </section>

            <section className="border border-white/12 bg-[#080a0d] p-5" aria-labelledby="simulation-title">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-[#7fb0ff]" aria-hidden="true" />
                <h2 id="simulation-title" className="text-xl font-semibold text-white">
                  Side effects
                </h2>
              </div>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-[#dce5f2]">
                {replay.decision.simulation.blockedActions.map((action) => (
                  <li key={action} className="border-l-2 border-rose-300/70 pl-3">
                    Blocked: {action}
                  </li>
                ))}
                {replay.decision.simulation.allowedActions.map((action) => (
                  <li key={action} className="border-l-2 border-emerald-300/70 pl-3">
                    Allowed: {action}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

export function ReplayEmptyState() {
  return (
    <main className="min-h-screen bg-[#040406] pt-24 text-white">
      <section className="mx-auto w-full max-w-4xl px-5 py-16">
        <div className="border border-white/12 bg-[#080a0d] p-8" role="status">
          <p className="mono text-xs font-bold uppercase tracking-[0.22em] text-[#7d8ba0]">Empty</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">No replay fixtures are available.</h1>
          <p className="mt-4 text-lg leading-8 text-[#aeb8c7]">
            The replay UI is ready, but the server did not expose any dangerous workflow fixtures.
          </p>
        </div>
      </section>
    </main>
  );
}

export function ReplayErrorState({
  title,
  description,
  fixtures,
}: {
  title: string;
  description: string;
  fixtures: DangerousWorkflowFixture[];
}) {
  return (
    <main className="min-h-screen bg-[#040406] pt-24 text-white">
      <section className="mx-auto grid w-full max-w-5xl gap-6 px-5 py-16">
        <div className="border border-rose-300/25 bg-rose-950/20 p-8" role="alert">
          <p className="mono text-xs font-bold uppercase tracking-[0.22em] text-rose-100">Error</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-4 text-lg leading-8 text-[#f1c8cf]">{description}</p>
        </div>
        {fixtures.length > 0 ? (
          <div className="border border-white/12 bg-[#080a0d] p-5">
            <h2 className="text-lg font-semibold text-white">Available replays</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {fixtures.map((fixture) => (
                <Link
                  key={fixture.id}
                  href={`/replay?id=${encodeURIComponent(fixture.id)}`}
                  className="inline-flex min-h-11 items-center justify-center border border-white/14 bg-white/[0.04] px-4 text-sm font-bold text-[#dce5f2] transition hover:border-white/35 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#7fb0ff] focus:ring-offset-2 focus:ring-offset-[#040406]"
                >
                  {fixture.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
