import {
  dangerousWorkflowFixtures,
  getDangerousWorkflowFixture,
  replayDangerousWorkflow,
  type DangerousWorkflowFixture,
} from "@permia/core";

function printUsage() {
  console.log("Usage: tsx examples/dangerous-agent/index.ts [fixture-id|--all|--list]");
  console.log("");
  console.log("Fixtures:");
  for (const fixture of dangerousWorkflowFixtures) {
    console.log(`  ${fixture.id} - ${fixture.title}`);
  }
}

function printReplay(fixture: DangerousWorkflowFixture) {
  const replay = replayDangerousWorkflow(fixture);
  const { decision } = replay;

  console.log(`\n${fixture.title}`);
  console.log(`fixture: ${fixture.id}`);
  console.log(`gate: ${decision.status}`);
  console.log(`reason: ${decision.approvalRequirement}`);
  console.log(`trace_id: ${decision.trace.id}`);
  console.log(`expected_gate: ${fixture.expectedGate}`);
  console.log(`matched_expected_gate: ${replay.matchedExpectedGate ? "yes" : "no"}`);
  console.log("timeline:");

  for (const item of replay.timeline) {
    const gate = item.gate ? ` [${item.gate}]` : "";
    console.log(`  - ${item.label}${gate}: ${item.detail}`);
  }

  if (decision.riskFindings.length > 0) {
    console.log("findings:");
    for (const finding of decision.riskFindings) {
      console.log(`  - ${finding.title}: ${finding.detail}`);
    }
  }

  return replay.matchedExpectedGate;
}

function main() {
  const arg = process.argv[2] ?? "--all";

  if (arg === "--help" || arg === "-h") {
    printUsage();
    return;
  }

  if (arg === "--list") {
    for (const fixture of dangerousWorkflowFixtures) {
      console.log(fixture.id);
    }
    return;
  }

  const fixtures =
    arg === "--all"
      ? dangerousWorkflowFixtures
      : [getDangerousWorkflowFixture(arg)].filter(Boolean);

  if (fixtures.length === 0) {
    console.error(`Unknown dangerous workflow fixture: ${arg}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  console.log("Permia dangerous-agent demo");
  console.log("mode: local only; no cloud credentials required");

  const allMatched = fixtures.every((fixture) => printReplay(fixture));
  if (!allMatched) {
    process.exitCode = 1;
  }
}

main();
