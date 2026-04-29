import { spawn } from "node:child_process";

const requiredAbsentEnv = ["PERMIA_TOKEN", "PERMIA_API_KEY", "STRIPE_SECRET_KEY", "OPENAI_API_KEY"];

const steps = [
  ["npm", ["run", "build"]],
  ["npm", ["test"]],
  ["npm", ["run", "test:smoke"]],
  ["npx", ["tsx", "examples/dangerous-agent/index.ts", "--all"]],
] as const;

function run(command: string, args: readonly string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, [...args], {
      stdio: "inherit",
      env: Object.fromEntries(Object.entries(process.env).filter(([key]) => !requiredAbsentEnv.includes(key))),
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  const present = requiredAbsentEnv.filter((key) => process.env[key]);
  if (present.length > 0) {
    console.log(`Ignoring cloud/API environment variables for local verification: ${present.join(", ")}`);
  }

  for (const [command, args] of steps) {
    console.log(`\n==> ${command} ${args.join(" ")}`);
    await run(command, args);
  }

  console.log("\nFresh local verification passed without cloud credentials.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
