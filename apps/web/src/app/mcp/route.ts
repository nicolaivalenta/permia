export function GET() {
  return Response.json({
    protocol: "mcp-like",
    name: "permia",
    tools: [
      {
        name: "resolve_intent",
        description: "Compile an agent goal into a policy-aware execution plan.",
        inputSchema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            policyProfile: { enum: ["default", "strict", "enterprise", "finance", "production"] },
          },
          required: ["intent"],
        },
      },
      {
        name: "evaluate_outbound_call",
        description: "Gate an outbound tool call before execution.",
        inputSchema: { type: "object", properties: { toolId: { type: "string" }, mutation: { type: "string" } } },
      },
      {
        name: "record_audit",
        description: "Record an SDK or runtime audit event.",
        inputSchema: { type: "object", properties: { decision: { type: "object" } } },
      },
    ],
  });
}
