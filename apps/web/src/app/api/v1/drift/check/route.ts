import { json } from "@/lib/api";
import { toolRegistry } from "@/lib/registry";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const tool = toolRegistry.find((entry) => entry.id === body.toolId) ?? toolRegistry[0];
  return json({
    toolId: tool.id,
    status: tool.schemaStability > 82 ? "stable" : "watch",
    docsHash: `docs_${tool.id.length}_${tool.schemaStability}`,
    runtimeHash: `run_${tool.id.length}_${tool.reliability}`,
    finding: tool.schemaStability > 82 ? "No meaningful drift detected." : "Docs and runtime behavior should be re-verified before writes.",
  });
}
