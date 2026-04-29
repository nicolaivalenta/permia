import { withPermiaToolGuard } from "@permia/sdk";

type Tool<Input, Output> = {
  id: string;
  description: string;
  execute(input: Input): Promise<Output> | Output;
};

const deployTool: Tool<{ target: string }, { deployed: boolean }> = {
  id: "vercel.deployments.promote",
  description: "Promote a deployment to production.",
  execute(input) {
    return { deployed: input.target === "production" };
  },
};

const guardedDeploy = withPermiaToolGuard(deployTool, {
  policyProfile: "production",
  intent: "Deploy the latest build to production and notify customers.",
});

async function main() {
  try {
    await guardedDeploy.execute({ target: "production" });
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
  }
}

main();
