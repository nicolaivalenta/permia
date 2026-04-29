import { z } from "zod";
import { ToolManifest } from "./types.js";

const mutationClassSchema = z.enum(["read", "draft", "write", "destructive"]);
const sensitivitySchema = z.enum(["public", "internal", "confidential", "secret"]);
const rollbackSchema = z.enum(["native", "compensating", "none"]);

export const toolManifestSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9.-]*$/),
  vendor: z.string().min(1),
  version: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  capabilities: z.array(z.string().min(1)).min(1),
  authScopes: z.array(z.string().min(1)),
  mutation: mutationClassSchema,
  sensitivity: sensitivitySchema,
  rollback: rollbackSchema,
  verified: z.boolean(),
  schemaStability: z.number().min(0).max(100),
  reliability: z.number().min(0).max(100),
  schema: z.object({
    input: z.record(z.string(), z.unknown()),
    output: z.record(z.string(), z.unknown()),
  }),
  source: z.string().min(1),
  schemaExcerpt: z.string().min(1),
  failureModes: z.array(z.string().min(1)),
  docsUrl: z.string().url(),
  docs: z.string().min(1),
});

export type ManifestValidationIssue = {
  path: string;
  code: string;
  message: string;
};

export class PermiaManifestValidationError extends Error {
  readonly issues: ManifestValidationIssue[];

  constructor(issues: ManifestValidationIssue[]) {
    super(`Invalid tool manifest: ${issues.map((issue) => `${issue.path} ${issue.message}`).join("; ")}`);
    this.name = "PermiaManifestValidationError";
    this.issues = issues;
  }
}

function issuePath(issue: z.core.$ZodIssue) {
  return issue.path.length ? issue.path.join(".") : "manifest";
}

function normalizeIssues(issues: z.core.$ZodIssue[]): ManifestValidationIssue[] {
  return issues.map((issue) => ({
    path: issuePath(issue),
    code: issue.code,
    message: issue.message,
  }));
}

export function validateToolManifest(input: unknown): ToolManifest {
  const parsed = toolManifestSchema.safeParse(input);
  if (!parsed.success) {
    throw new PermiaManifestValidationError(normalizeIssues(parsed.error.issues));
  }
  return parsed.data;
}

export function validateToolManifestResult(input: unknown) {
  const parsed = toolManifestSchema.safeParse(input);
  if (parsed.success) {
    return { ok: true as const, manifest: parsed.data };
  }
  return { ok: false as const, issues: normalizeIssues(parsed.error.issues) };
}
