import { PageShell } from "@/components/PageShell";

const example = `{
  "intent": "Check Stripe refund status and draft a Gmail reply to the customer",
  "policyProfile": "finance",
  "constraints": {
    "mutationAllowance": "draft_only",
    "approvalPolicy": "risky",
    "contextBudget": 1200,
    "authMode": "scoped_wallet"
  }
}`;

export default function PlaygroundPage() {
  return (
    <PageShell title="API playground" summary="Editable examples for agents and developers. The command center is the live UI; this page makes the wire shape obvious.">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-xl font-semibold text-white">Request</h2>
          <pre className="mt-4 overflow-auto bg-black/40 p-4 mono text-sm leading-7 text-slate-300">{example}</pre>
        </div>
        <div className="panel p-5">
          <h2 className="text-xl font-semibold text-white">Try it</h2>
          <pre className="mt-4 overflow-auto bg-black/40 p-4 mono text-sm leading-7 text-slate-300">{`curl -X POST http://localhost:3000/api/v1/intent \\
  -H 'content-type: application/json' \\
  -d '${example.replace(/\n\s*/g, "")}'`}</pre>
        </div>
      </div>
    </PageShell>
  );
}
