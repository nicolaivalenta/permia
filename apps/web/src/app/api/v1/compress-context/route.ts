import { json } from "@/lib/api";
import { compressContext } from "@/lib/engine";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return json(
    compressContext(
      String(body.intent ?? "inspect tool context"),
      Array.isArray(body.toolIds) ? body.toolIds : [],
      Number(body.budget ?? 1200)
    )
  );
}
