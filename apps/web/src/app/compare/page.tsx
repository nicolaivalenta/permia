import { PageShell } from "@/components/PageShell";

const rows = [
  ["Pipedream / Composio / Nango", "Integrations, OAuth, workflow execution", "Permia decides whether an agent should use those tools at all."],
  ["MCP registries", "Discovery and distribution", "Permia adds runtime policy, simulation, context compression, and audit."],
  ["JFrog-style registries", "Package trust and supply-chain scanning", "Permia evaluates live agent intent and cross-tool consequences."],
  ["Agent marketplaces", "Human or platform-specific shelves", "Permia is agent-callable infrastructure across runtimes."],
];

export default function ComparePage() {
  return (
    <PageShell title="Not another marketplace" summary="Permia wins by sitting above integrations and registries as the runtime judgment layer.">
      <div className="panel overflow-hidden">
        {rows.map(([competitor, theirs, ours]) => (
          <div key={competitor} className="grid gap-4 border-b hairline p-5 last:border-0 md:grid-cols-3">
            <div className="font-semibold text-white">{competitor}</div>
            <div className="text-sm leading-6 text-slate-400">{theirs}</div>
            <div className="text-sm leading-6 text-[#4ef0b8]">{ours}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
