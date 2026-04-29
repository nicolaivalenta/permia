export function GET() {
  return Response.json({
    openapi: "3.1.0",
    info: {
      title: "Permia Agent Tool Preflight API",
      version: "0.1.0",
      description: "Preflight API that checks agent tool calls before execution: intent compiler, trust scorer, policy gate, context compiler, simulator, and audit rail.",
    },
    paths: {
      "/api/v1/intent": {
        post: {
          summary: "Compile intent into a policy-aware execution plan.",
          requestBody: { required: true },
          responses: { "200": { description: "Execution plan" }, "400": { description: "Validation error" } },
        },
      },
      "/api/v1/score-tool": { post: { summary: "Score a tool by trust and risk.", responses: { "200": { description: "Tool score" } } } },
      "/api/v1/compress-context": { post: { summary: "Return minimal context pack for an agent task.", responses: { "200": { description: "Context pack" } } } },
      "/api/v1/simulate": { post: { summary: "Dry-run an execution plan.", responses: { "200": { description: "Simulation result" } } } },
      "/api/v1/tool-call/evaluate": { post: { summary: "Evaluate an outbound tool call before execution.", responses: { "200": { description: "Tool call decision" } } } },
      "/api/v1/proxy/evaluate": { post: { summary: "Compatibility alias for evaluating an outbound tool call.", responses: { "200": { description: "Proxy gate" } } } },
      "/api/v1/audits": { post: { summary: "Record a local SDK or runtime audit event.", responses: { "201": { description: "Audit event" } } } },
    },
  });
}
