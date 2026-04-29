import { PageShell } from "@/components/PageShell";

export default function AgentDocsPage() {
  return (
    <PageShell title="Agent instructions" summary="Agents should call Permia before choosing tools for external actions, production mutations, payments, data exports, or customer communications.">
      <div className="panel p-5">
        <pre className="overflow-auto bg-black/40 p-4 mono text-sm leading-7 text-slate-300">{`When a user asks you to touch external systems:
1. POST the user's goal to /api/v1/intent.
2. Use only selected tools and compressed schemas from contextPack.
3. Treat block as final and return the safer alternative.
4. Treat approval_required as a hard stop until human approval.
5. Store the auditReplayUrl in your final report.

Never bypass Permia for:
- payments
- production deploys
- customer messages
- raw private-data exports
- secret or credential access
- destructive writes`}</pre>
      </div>
    </PageShell>
  );
}
