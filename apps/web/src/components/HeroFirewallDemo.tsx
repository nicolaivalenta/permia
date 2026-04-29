"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Play, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "./Badge";
import type { ExecutionPlan } from "@/lib/types";

const scenarios = [
  {
    label: "Refund email",
    intent: "Check Stripe refund status, draft a Gmail reply, and send it to the customer",
    profile: "finance",
    expected: "Allows Stripe read and Gmail draft. Gates the send step.",
  },
  {
    label: "Deploy",
    intent: "Deploy the latest successful build to production and notify customers",
    profile: "production",
    expected: "Requires approval before deploy and customer notification.",
  },
  {
    label: "Export",
    intent: "Export customers who churned last month and email the list to an agency",
    profile: "enterprise",
    expected: "Blocks private data export plus external sharing.",
  },
] as const;

const fallback = [
  {
    decision: "approval_required",
    score: 76,
    savings: 86,
    steps: 3,
    allowed: ["Stripe refunds.retrieve: Check refund status", "Gmail drafts.create: Draft customer reply"],
    gated: ["Gmail messages.send: Human approval required before sending"],
    findings: [
      {
        title: "External email send requires approval",
        mitigation: "Keep the response as a draft until the user approves the exact recipient and body.",
      },
    ],
    summary: "Read-only refund lookup and draft creation are safe. Sending the email stays gated.",
  },
  {
    decision: "approval_required",
    score: 61,
    savings: 82,
    steps: 4,
    allowed: ["GitHub Actions: Read latest successful build", "Status page: Prepare customer notice"],
    gated: ["Vercel deploy: Production mutation", "Customer email: External notification"],
    findings: [
      {
        title: "Production deploy requires approval",
        mitigation: "Create a preflight contract with rollback expectation before deployment.",
      },
    ],
    summary: "The plan separates read-only CI checks from production mutation and customer messaging.",
  },
  {
    decision: "block",
    score: 38,
    savings: 89,
    steps: 3,
    allowed: ["Analytics warehouse: Aggregate churn count"],
    gated: ["CRM export: Private customer list", "Gmail send: External agency recipient"],
    findings: [
      {
        title: "Private data export plus external sharing",
        mitigation: "Block the export and suggest an aggregate churn report without customer identifiers.",
      },
    ],
    summary: "The combined tool chain would leak private customer data, so the plan is blocked.",
  },
] as const;

export function HeroFirewallDemo() {
  const [active, setActive] = useState(0);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const scenario = scenarios[active];
  const snapshot = fallback[active];

  async function run(index = active) {
    const next = scenarios[index];
    setLoading(true);
    const response = await fetch("/api/v1/intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        intent: next.intent,
        policyProfile: next.profile,
        actor: {
          agent: "demo-agent",
          user: "security-reviewer",
          org: "Permia Lab",
          environment: "local",
        },
        constraints: {
          mutationAllowance: "approved_writes",
          approvalPolicy: "risky",
          contextBudget: 1200,
          authMode: "scoped_wallet",
        },
      }),
    });
    const data = await response.json();
    setPlan(data);
    setLoading(false);
  }

  const decision = plan?.status ?? snapshot.decision;
  const allowed = plan
    ? plan.steps.filter((step) => step.gate === "allow" || step.gate === "warn").map((step) => `${step.toolName}: ${step.label}`)
    : [...snapshot.allowed];
  const gated = plan
    ? plan.steps.filter((step) => step.gate === "approval_required" || step.gate === "block").map((step) => `${step.toolName}: ${step.label}`)
    : [...snapshot.gated];
  const savings = plan?.contextPack.savingsPercent ?? snapshot.savings;
  const findings = plan?.riskFindings.map((finding) => ({
    title: finding.title,
    mitigation: finding.mitigation,
    gate: finding.gate,
    id: finding.id,
  })) ?? snapshot.findings.map((finding, index) => ({
    ...finding,
    gate: decision,
    id: `fallback_${index}`,
  }));
  return (
    <div className="min-w-0 overflow-hidden border border-[#2f363f] bg-[#11161c] text-[#f6f1e8] shadow-2xl shadow-black/35">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#171d24] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#df3b45]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#c78618]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2fba78]" />
        </div>
        <div className="mono hidden border border-white/10 bg-black/20 px-3 py-1 text-xs text-[#d8d1c5] sm:block">
          POST /v1/intent
        </div>
        <button
          onClick={() => run()}
          className="hidden items-center gap-2 rounded-md bg-[#f6f1e8] px-4 py-2 text-xs font-bold text-[#121417] transition hover:-translate-y-0.5 sm:inline-flex"
        >
          <Play className="h-3.5 w-3.5" />
          {loading ? "Checking" : "Run"}
        </button>
      </div>

      <div className="grid min-w-0 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="min-w-0 border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
          <p className="mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#a9a296]">Agent intent</p>
          <div className="scrollbar-thin -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
            {scenarios.map((item, index) => (
              <button
                key={item.label}
                onClick={() => {
                  setActive(index);
                  run(index);
                }}
                className={`shrink-0 rounded-md border px-3 py-2 text-sm font-bold transition ${
                  active === index
                    ? "border-[#f0bd4f] bg-[#322716] text-[#ffd579]"
                    : "border-white/10 bg-white/[0.03] text-[#c5beb2] hover:border-white/25"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 min-w-0 border border-white/10 bg-black/18 p-5">
            <p className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">{scenario.intent}</p>
            <p className="mt-4 text-sm leading-6 text-[#b8b1a6]">{scenario.expected}</p>
          </div>

          <div className="mt-5 grid min-w-0 grid-cols-3 gap-3 max-sm:grid-cols-1">
            <MiniStat label="score" value={plan?.score ?? snapshot.score} />
            <MiniStat label="saved" value={`${savings}%`} />
            <MiniStat label="steps" value={plan?.steps.length ?? snapshot.steps} />
          </div>

          <div className="mt-5 hidden min-w-0 border border-white/10 bg-white/[0.03] p-4 sm:block">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-white">Returned to agent</p>
              {plan ? <Badge>{plan.contextPack.estimatedCompressedTokens} tokens</Badge> : <Badge>audit-ready</Badge>}
            </div>
            <p className="mt-3 text-sm leading-6 text-[#cfc7ba]">
              Selected schemas, policy gates, approval requirement, and replay URL.
            </p>
          </div>
        </section>

        <section className="min-w-0 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#a9a296]">Permia decision</p>
              <h3 className="mt-1 text-3xl font-bold tracking-tight text-white">
                {decision === "block" ? "Blocked" : decision === "approval_required" ? "Approval required" : "Allowed with limits"}
              </h3>
            </div>
            <Badge tone={decision}>{decision}</Badge>
          </div>

          <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2">
            <DecisionColumn
              title="Allowed path"
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              empty="No safe action selected yet."
              items={allowed}
            />
            <DecisionColumn
              title="Gated path"
              icon={decision === "block" ? <XCircle className="h-4 w-4 text-rose-600" /> : <ShieldAlert className="h-4 w-4 text-amber-600" />}
              empty="No blocked or approval steps."
              items={gated}
            />
          </div>

          <div className="mt-5 min-w-0 border border-[#f0bd4f]/25 bg-[#211b10] p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="h-4 w-4 text-[#ffd579]" />
              Why this decision
            </div>
            <div className="mt-4 space-y-3">
              {findings.length ? (
                findings.slice(0, 1).map((finding) => (
                  <div key={finding.id} className="border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-bold">{finding.title}</p>
                      <Badge tone={finding.gate}>{finding.gate}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#d9cdbb]">{finding.mitigation}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-[#d9cdbb]">Run a scenario to see policy findings.</p>
              )}
            </div>
          </div>

          <div className="mt-5 min-w-0 border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-white">Audit replay</p>
              {plan ? <a href={plan.auditReplayUrl} className="inline-flex items-center gap-1 text-sm font-bold text-[#78a6ff]">Open <ArrowRight className="h-3.5 w-3.5" /></a> : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-[#c5beb2]">
              {plan?.simulation.summary ?? snapshot.summary}
            </p>
          </div>

        </section>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 border border-white/10 bg-white/[0.03] p-4">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-[#a9a296]">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</div>
    </div>
  );
}

function DecisionColumn({
  title,
  icon,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  empty: string;
}) {
  return (
    <div className="min-w-0 border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-white">{icon}{title}</div>
      <div className="mt-3 space-y-2">
        {items.length ? items.slice(0, 4).map((item) => (
          <div key={item} className="break-words bg-black/20 px-3 py-2 text-sm leading-5 text-[#cfc7ba]">
            {item}
          </div>
        )) : (
          <p className="bg-black/20 px-3 py-3 text-sm text-[#a9a296]">{empty}</p>
        )}
      </div>
    </div>
  );
}
