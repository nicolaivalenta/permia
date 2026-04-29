export function GET() {
  return new Response(
    `# Permia

Permia is an agent tool preflight API. Agents call it before using external tools, sending emails, moving money, deploying code, exporting data, or accessing secrets.

Primary endpoint:
POST /api/v1/intent

Use it before external tool calls, production mutations, payments, emails, data exports, secret access, or multi-tool plans.

Core behavior:
- compile natural-language intent into required capabilities
- rank tools by trust and policy fit
- compress tool context for agent use
- simulate before execution
- block or gate unsafe actions
- return an audit replay URL

Example:
curl -X POST http://localhost:3000/api/v1/intent \\
  -H 'content-type: application/json' \\
  -d '{"intent":"Check Stripe refund status and draft a Gmail reply to the customer","policyProfile":"finance","constraints":{"mutationAllowance":"draft_only","contextBudget":1200}}'
`,
    { headers: { "content-type": "text/plain; charset=utf-8" } }
  );
}
