import {
  dangerousWorkflowFixtures,
  getDangerousWorkflowFixture,
  replayDangerousWorkflow,
} from "@permia/core";
import { json } from "@/lib/api";

type ReplayApiErrorCode = "invalid_json" | "invalid_fixture" | "fixture_not_found";

type ReplayApiError = {
  ok: false;
  error: {
    code: ReplayApiErrorCode;
    message: string;
    fixtureIds?: string[];
  };
};

function replayError(error: ReplayApiError["error"], status: number) {
  return json({ ok: false, error } satisfies ReplayApiError, status);
}

function fixtureIds() {
  return dangerousWorkflowFixtures.map((fixture) => fixture.id);
}

function replayFixture(id: string) {
  const fixture = getDangerousWorkflowFixture(id);

  if (!fixture) {
    return replayError(
      {
        code: "fixture_not_found",
        message: `No dangerous workflow fixture exists for "${id}".`,
        fixtureIds: fixtureIds(),
      },
      404
    );
  }

  return json({
    ok: true,
    replay: replayDangerousWorkflow(fixture),
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    return replayFixture(id);
  }

  return json({
    ok: true,
    fixtures: dangerousWorkflowFixtures,
    replays: dangerousWorkflowFixtures.map((fixture) => replayDangerousWorkflow(fixture)),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return replayError(
      {
        code: "invalid_json",
        message: "Replay requests must be JSON objects with a fixture id.",
        fixtureIds: fixtureIds(),
      },
      400
    );
  }

  const id = "id" in body ? body.id : undefined;

  if (typeof id !== "string" || id.trim().length === 0) {
    return replayError(
      {
        code: "invalid_fixture",
        message: "Replay requests must include a non-empty string id.",
        fixtureIds: fixtureIds(),
      },
      400
    );
  }

  return replayFixture(id);
}
