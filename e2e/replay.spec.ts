import { expect, test } from "@playwright/test";

test("renders the blocked dangerous workflow replay", async ({ page }) => {
  await page.goto("/replay?id=customer-export-external-email");

  await expect(page.getByRole("heading", { name: "Outcome-first replay for dangerous agent workflows." })).toBeVisible();
  await expect(page.getByText("Final gate: Blocked")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Decision timeline" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Side effects" })).toBeVisible();

  const beforeScroll = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 900);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeScroll);
});

test("returns structured replay data and expected API errors", async ({ request }) => {
  const replay = await request.get("/api/v1/replay?id=refund-email-send");
  expect(replay.ok()).toBe(true);

  const replayBody = await replay.json();
  expect(replayBody.ok).toBe(true);
  expect(replayBody.replay.decision.status).toBe("approval_required");
  expect(replayBody.replay.matchedExpectedGate).toBe(true);

  const missing = await request.get("/api/v1/replay?id=missing-fixture");
  expect(missing.status()).toBe(404);

  const missingBody = await missing.json();
  expect(missingBody).toMatchObject({
    ok: false,
    error: {
      code: "fixture_not_found",
    },
  });
  expect(missingBody.error.fixtureIds).toContain("refund-email-send");
});

test("local-first navigation routes render without account requirements", async ({ page }) => {
  for (const path of ["/", "/docs", "/docs/agents", "/yc", "/playground", "/replay", "/registry", "/status", "/security", "/roadmap"]) {
    await page.goto(path);
    await expect.poll(() => page.locator("main").count()).toBeGreaterThan(0);
    await expect(page.getByText("Application error", { exact: false })).toHaveCount(0);
    await expect(page.getByText("Sign in", { exact: false })).toHaveCount(0);
  }
});
