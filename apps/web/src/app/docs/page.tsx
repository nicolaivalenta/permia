import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const endpoints = [
  ["POST /api/v1/intent", "Compile goal into execution plan."],
  ["POST /api/v1/score-tool", "Score a tool by trust and risk."],
  ["POST /api/v1/compress-context", "Return minimal agent context."],
  ["POST /api/v1/simulate", "Dry-run a plan before action."],
  ["POST /api/v1/tool-call/evaluate", "Gate one outbound tool call."],
  ["POST /api/v1/proxy/evaluate", "Gate outbound tool calls."],
  ["POST /api/v1/audits", "Record a local SDK audit event."],
  ["GET /openapi.json", "Machine-readable API spec."],
  ["GET /llms.txt", "Agent-readable product instructions."],
];

export default function DocsPage() {
  return (
    <PageShell title="Developer docs" summary="Start locally: run the policy engine, replay dangerous workflows, and inspect traces without a cloud account.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="text-xl font-semibold text-white">Five-minute local mode</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["1. Verify", "npm run verify:fresh"],
              ["2. Replay risk", "npx tsx examples/dangerous-agent/index.ts --all"],
              ["3. Open UI", "npm run dev"],
            ].map(([label, command]) => (
              <div key={label} className="border border-white/12 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white">{label}</div>
                <code className="mt-3 block break-words mono text-xs text-[#4ef0b8]">{command}</code>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-xl font-semibold text-white">Endpoints</h2>
          <div className="mt-4 divide-y divide-slate-700/60">
            {endpoints.map(([endpoint, text]) => (
              <div key={endpoint} className="grid gap-3 py-3 md:grid-cols-[220px_1fr]">
                <code className="mono text-sm text-[#4ef0b8]">{endpoint}</code>
                <p className="text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-xl font-semibold text-white">Agent surfaces</h2>
          <div className="mt-4 grid gap-3">
            {["/docs/agents", "/llms.txt", "/.well-known/agent.json", "/openapi.json", "/mcp"].map((href) => (
              <Link key={href} href={href} className="rounded-md border hairline bg-white/[0.035] px-4 py-3 mono text-sm text-slate-300 hover:text-white">
                {href}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
