import { PageShell } from "@/components/PageShell";

const roadmap = [
  "OSS quickstart polish",
  "Runtime adapter examples",
  "Policy DSL",
  "Local approval handoff",
  "Controlled execution broker",
  "Rollback and compensation planner",
  "Enterprise internal tool connector",
  "Vendor verification program",
  "Outcome feedback loop",
  "Settlement and usage rail",
  "Universal runtime adapters",
  "Identity and tool signing",
  "Agent permission wallet",
  "Preflight contracts",
  "Cross-tool causality graph",
  "Incident response center",
  "Continuous drift monitoring",
  "Benchmark suite",
  "Private deployment mode",
  "Network-level agent firewall",
];

export default function RoadmapPage() {
  return (
    <PageShell title="OSS-first roadmap" summary="The next work should make the local repo more useful before any paid cloud operations are built.">
      <div className="grid gap-3 md:grid-cols-2">
        {roadmap.map((item, index) => (
          <div key={item} className="panel p-4">
            <div className="mono text-xs text-slate-500">workstream {index + 1}</div>
            <div className="mt-2 text-lg font-semibold text-white">{item}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
