import { evaluateToolCall } from "@permia/core";

const request = {
  toolId: "postgres.export.csv",
  intent: "Export churned customers and email them to an external agency",
  policyProfile: "enterprise" as const,
};

const decision = evaluateToolCall(request);

console.log(JSON.stringify(decision, null, 2));
