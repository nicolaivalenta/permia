import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

type PackageJson = {
  name?: string;
  main?: string;
  exports?: unknown;
};

type SmokeTarget = {
  name: string;
  dir: string;
  main: string;
  requiredExports: string[];
};

const root = process.cwd();
const packagesDir = path.join(root, "packages");

async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readPackageJson(dir: string): Promise<PackageJson> {
  const raw = await readFile(path.join(dir, "package.json"), "utf8");
  return JSON.parse(raw) as PackageJson;
}

function isAdapterPackage(name: string, dirName: string) {
  return name.includes("adapter") || dirName.includes("adapter");
}

async function discoverTargets(): Promise<SmokeTarget[]> {
  const entries = await readdir(packagesDir, { withFileTypes: true }).catch(() => []);
  const targets: SmokeTarget[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dir = path.join(packagesDir, entry.name);
    const packageJsonPath = path.join(dir, "package.json");
    if (!(await pathExists(packageJsonPath))) continue;

    const pkg = await readPackageJson(dir);
    const name = pkg.name ?? entry.name;
    const shouldSmoke =
      name === "@permia/core" ||
      name === "@permia/sdk" ||
      isAdapterPackage(name, entry.name);

    if (!shouldSmoke) continue;

    targets.push({
      name,
      dir,
      main: pkg.main ?? "./dist/index.js",
      requiredExports:
        name === "@permia/core"
          ? ["evaluateIntent", "dangerousWorkflowFixtures", "replayDangerousWorkflow"]
          : name === "@permia/sdk"
            ? ["PermiaClient", "withPermiaToolGuard"]
            : [],
    });
  }

  return targets.sort((a, b) => a.name.localeCompare(b.name));
}

async function smokeTarget(target: SmokeTarget) {
  const mainPath = path.resolve(target.dir, target.main);
  const typesPath = path.join(target.dir, "dist", "index.d.ts");

  if (!(await pathExists(mainPath))) {
    throw new Error(`${target.name} is missing build output: ${path.relative(root, mainPath)}`);
  }

  if (!(await pathExists(typesPath))) {
    throw new Error(`${target.name} is missing type output: ${path.relative(root, typesPath)}`);
  }
}

async function importTarget(target: SmokeTarget) {
  const mainPath = path.resolve(target.dir, target.main);
  const imported = await import(pathToFileURL(mainPath).href);
  for (const exportName of target.requiredExports) {
    if (!(exportName in imported)) {
      throw new Error(`${target.name} dist artifact is missing export: ${exportName}`);
    }
  }

  console.log(`ok ${target.name} -> ${path.relative(root, mainPath)}`);
}

async function main() {
  const targets = await discoverTargets();
  const names = targets.map((target) => target.name);

  for (const required of ["@permia/core", "@permia/sdk"]) {
    if (!names.includes(required)) {
      throw new Error(`Required package not found under packages/: ${required}`);
    }
  }

  console.log(`Package smoke targets: ${names.join(", ")}`);
  for (const target of targets) {
    await smokeTarget(target);
  }
  for (const target of targets) {
    await importTarget(target);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
