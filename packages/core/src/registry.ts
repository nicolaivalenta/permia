import { ToolManifest } from "./types.js";

const vendors = [
  {
    vendor: "GitHub",
    category: "code",
    tools: [
      ["github.repos.get", "Read repository metadata", ["repo.read", "code.inspect"], "read"],
      ["github.issues.create", "Open an issue", ["issue.create", "external.post"], "write"],
      ["github.pulls.merge", "Merge a pull request", ["code.merge", "production.change"], "destructive"],
      ["github.actions.rerun", "Rerun a failed workflow", ["ci.rerun", "code.inspect"], "write"],
      ["github.secrets.list", "List repository secret names", ["secret.inspect"], "read"],
    ],
  },
  {
    vendor: "Stripe",
    category: "payments",
    tools: [
      ["stripe.refunds.retrieve", "Read refund status", ["payment.read", "refund.inspect"], "read"],
      ["stripe.refunds.create", "Create a refund", ["payment.move", "refund.create"], "destructive"],
      ["stripe.customers.search", "Find a customer", ["customer.read", "pii.read"], "read"],
      ["stripe.invoices.send", "Send an invoice", ["payment.request", "external.email"], "write"],
      ["stripe.disputes.update", "Update dispute evidence", ["legal.write", "payment.write"], "write"],
    ],
  },
  {
    vendor: "Gmail",
    category: "messaging",
    tools: [
      ["gmail.messages.search", "Search messages", ["email.read", "pii.read"], "read"],
      ["gmail.drafts.create", "Create a draft email", ["email.draft"], "draft"],
      ["gmail.messages.send", "Send an email", ["email.send", "external.email"], "write"],
      ["gmail.attachments.read", "Read attachments", ["file.read", "pii.read"], "read"],
      ["gmail.labels.modify", "Modify labels", ["email.organize"], "write"],
    ],
  },
  {
    vendor: "Slack",
    category: "messaging",
    tools: [
      ["slack.channels.history", "Read channel history", ["chat.read", "internal.read"], "read"],
      ["slack.chat.postMessage", "Post a message", ["chat.write", "external.post"], "write"],
      ["slack.files.upload", "Upload a file", ["file.write", "external.post"], "write"],
      ["slack.users.lookup", "Look up users", ["identity.read"], "read"],
      ["slack.admin.invite", "Invite a user", ["identity.write", "org.change"], "destructive"],
    ],
  },
  {
    vendor: "Linear",
    category: "work",
    tools: [
      ["linear.issues.search", "Search issues", ["issue.read"], "read"],
      ["linear.issues.create", "Create issues", ["issue.create"], "write"],
      ["linear.comments.create", "Comment on work", ["comment.write"], "write"],
      ["linear.projects.update", "Update project state", ["project.write"], "write"],
      ["linear.teams.archive", "Archive a team", ["org.change"], "destructive"],
    ],
  },
  {
    vendor: "Notion",
    category: "knowledge",
    tools: [
      ["notion.search", "Search workspace", ["doc.read", "internal.read"], "read"],
      ["notion.pages.create", "Create pages", ["doc.write"], "write"],
      ["notion.blocks.update", "Update content", ["doc.write"], "write"],
      ["notion.databases.query", "Query databases", ["database.read"], "read"],
      ["notion.pages.archive", "Archive pages", ["doc.delete"], "destructive"],
    ],
  },
  {
    vendor: "Vercel",
    category: "deployment",
    tools: [
      ["vercel.deployments.list", "List deployments", ["deploy.read"], "read"],
      ["vercel.deployments.promote", "Promote deployment", ["deploy.production", "production.change"], "destructive"],
      ["vercel.logs.read", "Read build logs", ["log.read"], "read"],
      ["vercel.env.create", "Create environment variable", ["secret.write", "production.change"], "destructive"],
      ["vercel.domains.verify", "Verify domain", ["dns.read"], "read"],
    ],
  },
  {
    vendor: "Postgres",
    category: "database",
    tools: [
      ["postgres.query.read", "Run read query", ["database.read"], "read"],
      ["postgres.query.write", "Run write query", ["database.write"], "write"],
      ["postgres.schema.migrate", "Run migration", ["database.migrate", "production.change"], "destructive"],
      ["postgres.export.csv", "Export query result", ["data.export", "pii.read"], "write"],
      ["postgres.backup.create", "Create backup", ["database.backup"], "write"],
    ],
  },
  {
    vendor: "Browser",
    category: "browser",
    tools: [
      ["browser.page.read", "Read current page", ["web.read"], "read"],
      ["browser.form.fill", "Fill a form", ["web.write"], "write"],
      ["browser.click", "Click an element", ["web.action"], "write"],
      ["browser.download", "Download file", ["file.read", "web.read"], "read"],
      ["browser.credentials.submit", "Submit credentials", ["secret.use", "web.write"], "destructive"],
    ],
  },
  {
    vendor: "Filesystem",
    category: "local",
    tools: [
      ["fs.read", "Read local file", ["file.read"], "read"],
      ["fs.write", "Write local file", ["file.write"], "write"],
      ["fs.delete", "Delete local file", ["file.delete"], "destructive"],
      ["fs.search", "Search files", ["file.read"], "read"],
      ["fs.archive", "Create archive", ["file.write", "data.export"], "write"],
    ],
  },
  {
    vendor: "Calendar",
    category: "calendar",
    tools: [
      ["calendar.events.list", "List events", ["calendar.read"], "read"],
      ["calendar.events.create", "Create event", ["calendar.write", "external.invite"], "write"],
      ["calendar.events.delete", "Delete event", ["calendar.delete"], "destructive"],
      ["calendar.availability", "Check availability", ["calendar.read"], "read"],
      ["calendar.invites.send", "Send invite", ["external.email", "calendar.write"], "write"],
    ],
  },
  {
    vendor: "Cloudflare",
    category: "cloud",
    tools: [
      ["cloudflare.dns.read", "Read DNS records", ["dns.read"], "read"],
      ["cloudflare.dns.write", "Modify DNS records", ["dns.write", "production.change"], "destructive"],
      ["cloudflare.workers.deploy", "Deploy Worker", ["deploy.production", "production.change"], "destructive"],
      ["cloudflare.logs.read", "Read request logs", ["log.read"], "read"],
      ["cloudflare.waf.update", "Update WAF rule", ["security.write", "production.change"], "destructive"],
    ],
  },
] as const;

const sensitivity = (capabilities: readonly string[]): ToolManifest["sensitivity"] => {
  if (capabilities.some((cap) => cap.includes("secret"))) return "secret";
  if (capabilities.some((cap) => ["pii.read", "payment.read", "data.export", "email.read"].includes(cap))) return "confidential";
  if (capabilities.some((cap) => cap.includes("internal") || cap.includes("database"))) return "internal";
  return "public";
};

const rollback = (mutation: string, capabilities: readonly string[]): ToolManifest["rollback"] => {
  if (mutation === "read") return "native";
  if (capabilities.some((cap) => cap.includes("delete") || cap.includes("payment.move") || cap.includes("deploy.production"))) return "none";
  if (mutation === "destructive") return "none";
  return "compensating";
};

export const toolRegistry: ToolManifest[] = vendors.flatMap((group, groupIndex) =>
  group.tools.map(([id, description, capabilities, mutation], index) => ({
    id,
    vendor: group.vendor,
    version: "2026-04-oss.1",
    name: id.split(".").slice(1).join("."),
    category: group.category,
    description,
    capabilities: [...capabilities],
    authScopes: capabilities.map((cap) => `${group.vendor.toLowerCase()}:${cap}`),
    mutation: mutation as ToolManifest["mutation"],
    sensitivity: sensitivity(capabilities),
    rollback: rollback(mutation, capabilities),
    verified: (groupIndex + index) % 3 !== 0,
    schemaStability: 68 + ((groupIndex * 7 + index * 3) % 29),
    reliability: 72 + ((groupIndex * 5 + index * 9) % 25),
    schema: {
      input: {
        type: "object",
        required: ["actor", "resource", "reason"],
        properties: {
          actor: { type: "string" },
          resource: { type: "string" },
          reason: { type: "string" },
          dry_run: { type: "boolean", default: true },
        },
      },
      output: {
        type: "object",
        required: ["ok", "changed", "audit"],
        properties: {
          ok: { type: "boolean" },
          resource_id: { type: "string" },
          changed: { type: "boolean" },
          audit: { type: "string" },
        },
      },
    },
    source: `seed://${group.vendor.toLowerCase()}/${id}`,
    schemaExcerpt: `tool ${id}({ actor, resource, reason, dry_run=true }) -> { ok, resource_id, changed, audit }`,
    failureModes: [
      "auth_scope_missing",
      "rate_limited",
      "schema_drift",
      mutation === "destructive" ? "irreversible_mutation" : "stale_resource",
    ],
    docsUrl: `https://permia.dev/manifests/${group.vendor.toLowerCase()}/${id}`,
    docs: `${description}. Requires ${capabilities.join(", ")}. Designed for policy-gated agent use.`,
  }))
);

export const productStats = {
  tools: toolRegistry.length,
  capabilities: new Set(toolRegistry.flatMap((tool) => tool.capabilities)).size,
  vendors: new Set(toolRegistry.map((tool) => tool.vendor)).size,
  highRisk: toolRegistry.filter((tool) => tool.mutation === "destructive").length,
};
