export function GET() {
  return Response.json({
    name: "Permia",
    description: "Agent tool preflight API for policy gates, tool trust scoring, simulation, context compression, and audit replay.",
    version: "0.1.0",
    endpoints: {
      intent: "/api/v1/intent",
      scoreTool: "/api/v1/score-tool",
      compressContext: "/api/v1/compress-context",
      simulate: "/api/v1/simulate",
      proxyEvaluate: "/api/v1/proxy/evaluate",
      openapi: "/openapi.json",
      mcp: "/mcp",
      llms: "/llms.txt",
    },
    safety: {
      default: "simulate and gate before mutation",
      blocks: ["secret exfiltration", "raw private-data export", "out-of-contract mutation"],
      approvals: ["money movement", "production deploy", "external send", "irreversible write"],
    },
  });
}
