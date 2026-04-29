import { json } from "@/lib/api";
import { simulatePlan } from "@/lib/engine";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return json(simulatePlan(body));
}
