import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Database,
  FileCheck2,
  LockKeyhole,
  Play,
  ServerCog,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { AgentSignalField } from "@/components/AgentSignalField";
import { HeroFirewallDemo } from "@/components/HeroFirewallDemo";
import { productStats } from "@/lib/registry";

const scenarios = [
  {
    title: "Refund email",
    intent: "Check Stripe refund status, draft a customer email, then gate the send.",
    result: "approval required",
    detail: "Reads and draft creation continue. External customer messaging waits for a human.",
  },
  {
    title: "Production deploy",
    intent: "Check latest build status, deploy to production, notify customers.",
    result: "approval required",
    detail: "CI inspection is allowed. Production mutation and customer notification are separated.",
  },
  {
    title: "Customer data export",
    intent: "Export private customer records and email them to an outside agency.",
    result: "blocked",
    detail: "Permia catches the combined exfiltration path before the tools run.",
  },
];

const primitives = [
  [Code2, "Intent API", "Agents submit goal, actor, proposed tools, inputs, constraints, and operating context."],
  [LockKeyhole, "Scoped authority", "Permission wallets keep agents away from broad ambient credentials."],
  [Database, "Simulation + evidence", "Tool chains are checked for side effects, private data, drift, rollback, and context gaps."],
  [ServerCog, "Execution brokerage", "Allowed steps can run, risky steps wait, and blocked steps leave a replayable audit trail."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#040406] text-white">
      <section className="relative min-h-[92svh] overflow-hidden border-b border-white/10">
        <AgentSignalField />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,6,0)_24%,rgba(4,4,6,0.18)_54%,#040406_94%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_20%_60%,rgba(52,111,184,0.2),transparent_34rem)]" />

        <div className="relative mx-auto flex min-h-[92svh] w-full max-w-7xl flex-col justify-end px-5 pb-12 pt-32 md:pb-16">
          <div className="grid min-w-0 gap-9 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div className="min-w-0">
              <p className="mono mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#93a4b8]">
                Agent tool preflight
              </p>
              <h1 className="max-w-[22rem] break-words text-4xl font-semibold leading-[1.02] tracking-tight text-[#f7f8fb] sm:max-w-5xl sm:text-7xl sm:leading-[0.94] md:text-8xl">
                Runtime control before agents act.
              </h1>
            </div>
            <div className="w-full min-w-0 max-w-[22rem] sm:max-w-xl lg:justify-self-end">
              <p className="max-w-full text-lg leading-8 text-[#c3cad6] md:text-xl md:leading-9">
                Permia checks agent tool calls before they run. Send intent first; get back allowed, blocked, or approval required before production, money, customer data, or messages are touched.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/playground" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#040406] transition hover:-translate-y-0.5 hover:bg-[#dfe8f7]">
                  <Play className="h-4 w-4" />
                  Run a preflight
                </Link>
                <Link href="/replay" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/22 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/[0.08]">
                  Replay dangerous workflows
                </Link>
                <Link href="/docs/agents" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/22 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/[0.08]">
                  Read agent docs <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 grid border border-white/12 bg-[#080a0d]/82 md:grid-cols-4">
            {[
              ["tools indexed", productStats.tools],
              ["vendors", productStats.vendors],
              ["high-risk tools", productStats.highRisk],
              ["agent endpoints", 12],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-white/12 px-4 py-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-[#768398]">{label}</div>
                <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="border-b border-white/10 px-5 py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.48fr_1fr] lg:items-end">
            <div>
              <p className="mono text-xs font-bold uppercase tracking-[0.22em] text-[#7d8ba0]">Interactive control point</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                The agent asks. Permia decides.
              </h2>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-[#aeb8c7] lg:justify-self-end">
              The demo is intentionally simple: one intent goes in, Permia splits the tool chain into safe reads, gated writes, blocked exports, approval requirements, and audit evidence.
            </p>
          </div>
          <div className="mt-10 border border-white/12 bg-[#090b0f] p-2 shadow-[0_36px_110px_rgba(0,0,0,0.42)]">
            <HeroFirewallDemo />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 md:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.7fr_1fr]">
          <div>
            <p className="mono text-xs font-bold uppercase tracking-[0.22em] text-[#7d8ba0]">Concrete runtime gates</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              Built for agents that can change the world outside chat.
            </h2>
          </div>
          <div className="divide-y divide-white/10 border border-white/12">
            {scenarios.map((scenario) => (
              <article key={scenario.title} className="grid gap-5 bg-[#080a0d] p-5 md:grid-cols-[0.82fr_1fr_auto] md:items-center">
                <div>
                  <h3 className="text-xl font-semibold text-white">{scenario.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#9da8b8]">{scenario.intent}</p>
                </div>
                <p className="text-sm leading-6 text-[#c0cad8]">{scenario.detail}</p>
                <div className={`border px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] ${
                  scenario.result === "blocked"
                    ? "border-rose-400/35 bg-rose-950/30 text-rose-200"
                    : "border-amber-300/35 bg-amber-950/30 text-amber-200"
                }`}>
                  {scenario.result}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <p className="mono text-xs font-bold uppercase tracking-[0.22em] text-[#7d8ba0]">Control plane primitives</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              Policy, simulation, approval, execution, audit.
            </h2>
          </div>
          <div className="mt-10 grid border-l border-t border-white/12 md:grid-cols-2 lg:grid-cols-4">
            {primitives.map(([Icon, title, text]) => (
              <div key={title as string} className="border-b border-r border-white/12 bg-[#080a0d] p-5">
                <Icon className="h-5 w-5 text-[#7fb0ff]" />
                <h3 className="mt-5 text-lg font-semibold text-white">{title as string}</h3>
                <p className="mt-3 text-sm leading-6 text-[#9da8b8]">{text as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16">
        <div className="mx-auto grid w-full max-w-7xl gap-8 border border-white/12 bg-[#080a0d] p-6 md:grid-cols-[0.8fr_1fr_0.65fr] md:items-center md:p-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">Put the preflight call before every dangerous tool.</h2>
            <p className="mt-3 text-base leading-7 text-[#aeb8c7]">Agents can still move fast. They just need a runtime judgment layer before real systems change.</p>
          </div>
          <pre className="scrollbar-thin overflow-auto bg-[#040406] p-5 mono text-xs leading-6 text-[#c3cad6]">{`npm install @permia/sdk
npm run dev

curl http://localhost:3000/api/v1/intent \\
  -H "Content-Type: application/json" \\
  -d '{"intent":"Deploy to production and notify customers","policyProfile":"production"}'`}</pre>
          <div className="grid gap-3 text-sm font-semibold text-[#dce5f2]">
            {["OpenAPI + MCP", "Local-first engine", "Dangerous workflow replay", "Replayable audit"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                {item.includes("Replay") ? <FileCheck2 className="h-4 w-4 text-[#7fb0ff]" /> : item.includes("approval") ? <ShieldAlert className="h-4 w-4 text-[#7fb0ff]" /> : <ShieldCheck className="h-4 w-4 text-[#7fb0ff]" />}
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-9">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-semibold text-white">Permia</div>
            <p className="mt-1 text-sm text-[#8f9caf]">The preflight API for agent tool calls.</p>
          </div>
          <nav className="flex flex-wrap gap-5 text-sm font-bold text-[#9da8b8]">
            <Link href="/docs">Docs</Link>
            <Link href="/security">Security</Link>
            <Link href="/registry">Registry</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/status">Status</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
