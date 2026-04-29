import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type AuditListItem = {
  id: string;
  intent: string;
  actor: string;
  status: string;
};

export default async function AuditsPage() {
  const audits: AuditListItem[] = await prisma.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, intent: true, actor: true, status: true },
    take: 30,
  });
  return (
    <PageShell title="Audit ledger" summary="Every intent plan gets a replayable record: actor, status, gates, simulation, context pack, and policy rationale.">
      <div className="grid gap-3">
        {audits.length === 0 ? (
          <div className="panel p-8 text-center text-slate-400">No audits yet. Run the command center first.</div>
        ) : (
          audits.map((audit) => (
            <Link key={audit.id} href={`/audits/${audit.id}`} className="panel p-4 transition hover:border-[#4ef0b8]/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{audit.intent}</div>
                  <div className="mt-1 mono text-xs text-slate-500">{audit.id} · {audit.actor}</div>
                </div>
                <div className="mono text-sm text-[#4ef0b8]">{audit.status}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </PageShell>
  );
}
