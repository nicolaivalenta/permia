import { evaluateToolCall } from "@/lib/engine";
import { json } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return json(evaluateToolCall(body));
}
