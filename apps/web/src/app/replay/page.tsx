import {
  dangerousWorkflowFixtures,
  getDangerousWorkflowFixture,
  replayDangerousWorkflow,
} from "@permia/core";
import { ReplayEmptyState, ReplayErrorState, ReplaySurface } from "@/components/replay/ReplaySurface";

type ReplayPageProps = {
  searchParams: Promise<{ id?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReplayPage({ searchParams }: ReplayPageProps) {
  const fixtures = dangerousWorkflowFixtures;

  if (fixtures.length === 0) {
    return <ReplayEmptyState />;
  }

  const params = await searchParams;
  const selectedId = firstParam(params.id) ?? fixtures[0].id;
  const fixture = getDangerousWorkflowFixture(selectedId);

  if (!fixture) {
    return (
      <ReplayErrorState
        title="Replay fixture not found"
        description={`No dangerous workflow fixture exists for "${selectedId}". Pick one of the server-owned fixtures below.`}
        fixtures={fixtures}
      />
    );
  }

  return <ReplaySurface fixtures={fixtures} replay={replayDangerousWorkflow(fixture)} selectedId={selectedId} />;
}
