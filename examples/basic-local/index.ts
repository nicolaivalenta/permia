import { PermiaClient, withPermiaToolGuard } from "@permia/sdk";

async function main() {
  const permia = new PermiaClient({
    policyProfile: "finance",
    auditSink(event) {
      console.log(`[audit] ${event.kind}: ${event.decision.trace.id}`);
    },
  });

  const refundEmail = await permia.preflight({
    intent: "Check Stripe refund status, draft a Gmail reply, and send it to the customer",
  });

  console.log(refundEmail.status);
  console.log(refundEmail.approvalRequirement);

  const sendEmail = withPermiaToolGuard(
    {
      id: "gmail.messages.send",
      execute(input: { to: string; body: string }) {
        return { sent: true, ...input };
      },
    },
    { policyProfile: "finance" }
  );

  try {
    await sendEmail.execute({ to: "customer@example.com", body: "Your refund is in progress." });
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
  }
}

main();
