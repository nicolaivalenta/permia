import { PageShell } from "@/components/PageShell";

export default function PoliciesPage() {
  return (
    <PageShell title="Policy language" summary="The enterprise product becomes real when safety rules are legible, testable, and enforceable before tool calls run.">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-xl font-semibold text-white">DSL preview</h2>
          <pre className="mt-4 overflow-auto bg-black/40 p-4 mono text-sm leading-7 text-slate-300">{`policy finance_default {
  allow stripe.refunds.retrieve
  allow gmail.drafts.create
  require_approval stripe.refunds.create when amount > 100
  block gmail.messages.send unless human_approved
  block data.export when recipient.external == true
}`}</pre>
        </div>
        <div className="panel p-5">
          <h2 className="text-xl font-semibold text-white">Approval inbox shape</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="bg-white/[0.04] p-4">Approve, deny, edit plan, or require safer alternative.</div>
            <div className="bg-white/[0.04] p-4">Show affected resources, rollback, spend, evidence, and exact payload.</div>
            <div className="bg-white/[0.04] p-4">Record every human decision into the audit ledger.</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
