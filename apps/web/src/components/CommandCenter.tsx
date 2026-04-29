"use client";

import { useMemo, useState } from "react";
import { Copy, LockKeyhole, Network, Play, ShieldAlert, ShieldCheck, Split, TerminalSquare } from "lucide-react";
import { Badge } from "./Badge";
import type { ExecutionPlan } from "@/lib/types";

const scenarios = [
  "Check Stripe refund status and draft a Gmail reply to the customer",
  "Deploy the latest successful build to production and notify customers",
  "Export customers who churned last month and email the list to an agency",
  "Search the repo, open a Linear issue, and post a Slack summary",
  "Read the current browser page and summarize vendor risk",
];

const initialIntent = scenarios[0];

export function CommandCenter() {
  const [intent, setIntent] = useState(initialIntent);
  const [profile, setProfile] = useState("finance");
  const [allowance, setAllowance] = useState("draft_only");
  const [budget, setBudget] = useState(1200);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function runIntent(nextIntent = intent) {
    setLoading(true);
    const response = await fetch("/api/v1/intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        intent: nextIntent,
        policyProfile: profile,
        actor: { agent: "local-demo-agent", user: "local-user", org: "local-org", environment: "local" },
        constraints: { mutationAllowance: allowance, approvalPolicy: "risky", contextBudget: budget, authMode: "scoped_wallet" },
      }),
    });
    const data = await response.json();
    setPlan(data);
    setLoading(false);
  }

  const graph = useMemo(() => plan?.steps ?? [], [plan]);
  const curl = `curl -X POST http://localhost:3000/api/v1/intent \\
  -H 'content-type: application/json' \\
  -d '${JSON.stringify({ intent, policyProfile: profile, constraints: { mutationAllowance: allowance, contextBudget: budget } })}'`;

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[0.95fr_1.35fr]">
      <section className="panel min-w-0 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Intent preflight</h2>
            <p className="mt-1 text-sm text-slate-400">Ask what the agent wants to do. Permia decides what is safe.</p>
          </div>
          <Badge tone={plan?.status ?? "neutral"}>{plan?.status ?? "ready"}</Badge>
        </div>

        <textarea
          value={intent}
          onChange={(event) => setIntent(event.target.value)}
          className="mt-5 min-h-32 w-full resize-none border hairline bg-black/30 p-4 text-base leading-7 text-white outline-none ring-0 placeholder:text-slate-600 focus:border-[#4ef0b8]/60"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-slate-400">
            Policy profile
            <select value={profile} onChange={(event) => setProfile(event.target.value)} className="mt-2 w-full border hairline bg-black/40 px-3 py-3 text-white">
              <option value="default">default</option>
              <option value="strict">strict</option>
              <option value="enterprise">enterprise</option>
              <option value="finance">finance</option>
              <option value="production">production</option>
            </select>
          </label>
          <label className="text-sm text-slate-400">
            Mutation allowance
            <select value={allowance} onChange={(event) => setAllowance(event.target.value)} className="mt-2 w-full border hairline bg-black/40 px-3 py-3 text-white">
              <option value="read_only">read_only</option>
              <option value="draft_only">draft_only</option>
              <option value="approved_writes">approved_writes</option>
              <option value="all">all</option>
            </select>
          </label>
          <label className="text-sm text-slate-400">
            Context budget
            <input value={budget} onChange={(event) => setBudget(Number(event.target.value))} type="number" className="mt-2 w-full border hairline bg-black/40 px-3 py-3 text-white" />
          </label>
        </div>

        <button
          onClick={() => runIntent()}
          disabled={loading}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#4ef0b8] px-5 py-4 text-sm font-semibold text-[#07100d] transition hover:bg-[#7affcc] disabled:opacity-60"
        >
          <Play className="h-4 w-4" />
          {loading ? "Compiling intent..." : "Run Permia preflight"}
        </button>

        <div className="mt-5 space-y-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario}
              onClick={() => {
                setIntent(scenario);
                runIntent(scenario);
              }}
              className="w-full rounded-md border hairline bg-white/[0.03] px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              {scenario}
            </button>
          ))}
        </div>
      </section>

      <section className="grid min-w-0 gap-5">
        <div className="panel min-w-0 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Execution graph</h2>
              <p className="mt-1 text-sm text-slate-400">Every step gets a tool, a gate, and a reason.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {plan ? <Badge tone={plan.status}>score {plan.score}</Badge> : <Badge>waiting</Badge>}
              {plan ? <Badge>{Math.round(plan.confidence * 100)}% confidence</Badge> : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {graph.length === 0 ? (
              <EmptyState />
            ) : (
              graph.map((step, index) => (
                <div key={step.id} className="grid gap-3 border hairline bg-black/22 p-4 md:grid-cols-[42px_1fr_auto] md:items-center">
                  <div className="flex h-10 w-10 items-center justify-center bg-white/6 mono text-sm text-slate-300">{index + 1}</div>
                  <div>
                    <div className="font-medium text-white">{step.label}</div>
                    <div className="mt-1 mono text-xs text-slate-500">{step.toolId} · {step.capability}</div>
                    <div className="mt-2 text-sm text-slate-400">{step.reason}</div>
                  </div>
                  <Badge tone={step.gate}>{step.gate}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {plan ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="Policy findings" icon={<ShieldAlert className="h-4 w-4 text-amber-200" />}>
              {plan.riskFindings.length ? (
                <div className="space-y-3">
                  {plan.riskFindings.map((finding) => (
                    <div key={finding.id} className="border hairline bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-white">{finding.title}</div>
                        <Badge tone={finding.gate}>{finding.gate}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{finding.detail}</p>
                      <p className="mt-2 text-sm text-[#4ef0b8]">{finding.mitigation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No blocking findings under this policy.</p>
              )}
            </Panel>

            <Panel title="Context compiler" icon={<Split className="h-4 w-4 text-[#4ef0b8]" />}>
              <div className="grid grid-cols-3 gap-3">
                <TinyMetric label="naive" value={plan.contextPack.estimatedNaiveTokens} />
                <TinyMetric label="packed" value={plan.contextPack.estimatedCompressedTokens} />
                <TinyMetric label="saved" value={`${plan.contextPack.savingsPercent}%`} />
              </div>
              <div className="mt-4 space-y-2">
                {plan.contextPack.instructions.map((instruction) => (
                  <div key={instruction} className="bg-white/[0.04] px-3 py-2 text-sm text-slate-300">{instruction}</div>
                ))}
              </div>
            </Panel>

            <Panel title="Simulation transcript" icon={<TerminalSquare className="h-4 w-4 text-sky-200" />}>
              <p className="text-sm text-slate-300">{plan.simulation.summary}</p>
              <div className="mt-3 space-y-2">
                {plan.simulation.transcript.map((line) => (
                  <div key={line} className="mono bg-black/28 px-3 py-2 text-xs text-slate-400">{line}</div>
                ))}
              </div>
            </Panel>

            <Panel title="Preflight contract" icon={<LockKeyhole className="h-4 w-4 text-violet-200" />}>
              <div className="space-y-3 text-sm text-slate-300">
                <div>Allowed: {plan.preflightContract.allowedMutations.join(", ")}</div>
                <div>Max spend: ${plan.preflightContract.maxSpendUsd}</div>
                <div>{plan.preflightContract.rollbackExpectation}</div>
                <div className="text-rose-200">{plan.preflightContract.forbiddenSideEffects.join(" · ")}</div>
              </div>
            </Panel>
          </div>
        ) : null}

        <div className="panel min-w-0 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white"><Network className="h-4 w-4 text-[#4ef0b8]" /> Agent API call</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(curl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              className="inline-flex items-center gap-2 rounded-md border hairline px-3 py-2 text-xs text-slate-300"
            >
              <Copy className="h-3.5 w-3.5" /> {copied ? "copied" : "copy"}
            </button>
          </div>
          <pre className="scrollbar-thin mt-4 overflow-auto bg-black/40 p-4 mono text-xs leading-6 text-slate-300">{curl}</pre>
        </div>
      </section>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="panel min-w-0 p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">{icon}{title}</div>
      {children}
    </div>
  );
}

function TinyMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border hairline bg-white/[0.035] p-3">
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-slate-600/50 bg-black/20 p-10 text-center">
      <ShieldCheck className="mx-auto h-10 w-10 text-[#4ef0b8]" />
      <h3 className="mt-4 text-lg font-semibold text-white">No plan compiled yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        Run a preflight to see tool choice, policy gates, adversarial findings, compressed context, and audit replay.
      </p>
    </div>
  );
}
