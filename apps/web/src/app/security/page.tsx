import { Badge } from "@/components/Badge";
import { PageShell } from "@/components/PageShell";

const threats = [
  ["Prompt injection", "Tool descriptions or user intents that try to override policy.", "block"],
  ["Tool poisoning", "Lookalike tools with broad scopes or malicious descriptions.", "block"],
  ["Cross-tool exfiltration", "Safe individual calls combine into private-data leakage.", "block"],
  ["Production mutation", "Deploy, DNS, WAF, migration, or secret write without preflight.", "approval_required"],
  ["External communication", "Email, Slack, invite, or public post leaves the org.", "approval_required"],
  ["Schema drift", "Docs and runtime response shape diverge after an agent learned the tool.", "warn"],
] as const;

export default function SecurityPage() {
  return (
    <PageShell title="Agent security model" summary="Permia treats agent tool use as a security boundary. The product blocks unsafe chains, gates risky mutations, and records why every action was allowed or refused.">
      <div className="grid gap-4 md:grid-cols-2">
        {threats.map(([title, text, gate]) => (
          <div key={title} className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <Badge tone={gate}>{gate}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
          </div>
        ))}
      </div>
      <div className="panel mt-5 p-5">
        <h2 className="text-xl font-semibold text-white">Causality graph principle</h2>
        <pre className="mt-4 overflow-auto bg-black/40 p-4 mono text-sm leading-7 text-slate-300">{`read CRM export
 create Gmail draft
 attach CSV
 external recipient
= private-data exfiltration chain -> block`}</pre>
      </div>
    </PageShell>
  );
}
