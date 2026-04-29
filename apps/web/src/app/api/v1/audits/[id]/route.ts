import { json } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const audit = await prisma.auditEvent.findUnique({ where: { id } });
  if (!audit) return json({ error: "audit_not_found", id }, 404);
  return json(audit);
}
