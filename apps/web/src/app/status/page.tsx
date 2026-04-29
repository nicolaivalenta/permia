import { Metric } from "@/components/Metric";
import { PageShell } from "@/components/PageShell";
import { productStats } from "@/lib/registry";

export default function StatusPage() {
  return (
    <PageShell title="Local runtime status" summary="This is the working local vertical slice: deterministic engine, seeded registry, APIs, docs, and forward-compatible platform stubs.">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="tools" value={productStats.tools} sub="seeded locally" />
        <Metric label="vendors" value={productStats.vendors} sub="agent surface areas" />
        <Metric label="capabilities" value={productStats.capabilities} sub="normalized" />
        <Metric label="risk gates" value={4} sub="allow warn approve block" />
      </div>
      <div className="panel mt-5 p-5">
        <h2 className="text-xl font-semibold text-white">Implemented platform stubs</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {["preflight contracts", "contract verification", "incident response", "drift checks", "permission grants", "proxy evaluation", "benchmark suite", "agent discovery"].map((item) => (
            <div key={item} className="bg-white/[0.04] px-4 py-3 text-sm text-slate-300">{item}</div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
