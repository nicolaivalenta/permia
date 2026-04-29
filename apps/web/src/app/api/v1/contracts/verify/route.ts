import { json } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mutation = String(body.mutation ?? "read");
  const allowed = Array.isArray(body.allowedMutations) ? body.allowedMutations : ["read"];
  const ok = allowed.includes(mutation);
  return json({
    ok,
    gate: ok ? "allow" : "block",
    reason: ok ? "Runtime call is inside the preflight contract." : "Runtime call attempts an out-of-contract mutation.",
  });
}
