import { Badge } from "@/components/Badge";
import { PageShell } from "@/components/PageShell";
import { scoreTool } from "@/lib/engine";
import { toolRegistry } from "@/lib/registry";

export default function RegistryPage() {
  return (
    <PageShell title="Capability graph" summary="A normalized seed registry of tools, capabilities, auth scopes, mutation class, rollback posture, and policy risk. This is the substrate the intent compiler routes over.">
      <div className="grid gap-3">
        {toolRegistry.map((tool) => {
          const score = scoreTool(tool).score;
          return (
            <div key={tool.id} className="panel p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_160px_120px] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-white">{tool.vendor} · {tool.name}</h2>
                    <Badge>{tool.category}</Badge>
                    <Badge tone={tool.mutation === "destructive" ? "approval_required" : tool.mutation === "write" ? "warn" : "allow"}>{tool.mutation}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{tool.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tool.capabilities.map((capability) => <Badge key={capability}>{capability}</Badge>)}
                  </div>
                </div>
                <div className="mono text-sm text-slate-400">rollback: {tool.rollback}<br />sensitivity: {tool.sensitivity}</div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-white">{score}</div>
                  <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">trust score</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
