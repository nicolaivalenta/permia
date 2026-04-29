import { json } from "@/lib/api";
import { scoreTool } from "@/lib/engine";
import { toolRegistry } from "@/lib/registry";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const tool = toolRegistry.find((entry) => entry.id === body.toolId) ?? toolRegistry[0];
  return json({ tool, ...scoreTool(tool) });
}
