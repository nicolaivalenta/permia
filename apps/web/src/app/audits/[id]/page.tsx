import { PageShell } from "@/components/PageShell";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await prisma.auditEvent.findUnique({ where: { id } });
  return (
    <PageShell title="Audit replay" summary="A replayable Permia decision trace for developers, security reviewers, and future agents.">
      {!audit ? (
        <div className="panel p-8 text-slate-400">Audit not found.</div>
      ) : (
        <div className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">{audit.intent}</h2>
              <p className="mt-1 mono text-xs text-slate-500">{audit.id} · {audit.createdAt.toISOString()}</p>
            </div>
            <div className="mono text-sm text-[#4ef0b8]">{audit.status}</div>
          </div>
          <pre className="mt-5 max-h-[680px] overflow-auto bg-black/40 p-4 mono text-xs leading-6 text-slate-300">
            {JSON.stringify(JSON.parse(audit.payload), null, 2)}
          </pre>
        </div>
      )}
    </PageShell>
  );
}
