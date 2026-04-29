import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const phases = [
  {
    title: "0. Publish the OSS artifact",
    timeline: "Now to 48 hours",
    cost: "$0",
    items: [
      "Create a public GitHub repository after a final secret scan and user approval.",
      "Push Apache-2.0 monorepo with README, examples, CI, replay lab, SDK, core engine, and launch docs.",
      "Open issues labeled good-first-policy, adapter-request, manifest-request, and design-partner.",
      "Pin the dangerous-agent replay demo as the first proof that Permia stops risky agent actions locally.",
    ],
  },
  {
    title: "1. Earn developer trust",
    timeline: "Week 1 to 3",
    cost: "$0 to $20",
    items: [
      "Post the repo on Twitter/X, Hacker News, relevant Discords, agent-builder communities, and security/devtools communities.",
      "Ship copy-paste integrations for OpenAI-style tools, MCP proxy mode, local scripts, and one real framework adapter.",
      "Ask every technical reader one question: would you put this before an agent tool call?",
      "Measure GitHub stars, forks, issues, external example usage, and conversations with agent teams.",
    ],
  },
  {
    title: "2. Prove the pain",
    timeline: "Week 2 to 6",
    cost: "$0 to $100",
    items: [
      "Interview 25 to 50 builders running agents near email, production deploys, customer support, finance, browser actions, or internal tools.",
      "Collect concrete stories where an agent could send, delete, deploy, leak, spend, or modify something incorrectly.",
      "Turn the strongest stories into public fixtures and policy packs.",
      "Target 3 design partners willing to run Permia locally before dangerous tool calls.",
    ],
  },
  {
    title: "3. Build the paid wedge only after pull",
    timeline: "Month 2 to 3",
    cost: "$0 to $200 before revenue",
    items: [
      "Keep the core open. Charge only for operational burden: hosted approvals, retained audits, team policy history, private registries, and compliance exports.",
      "Start with a hosted audit/approval inbox only if local users ask for team workflows.",
      "Do not build billing, SSO, VPC, or enterprise dashboards before real pull.",
      "Use manual onboarding for the first 3 to 5 teams instead of expensive infrastructure.",
    ],
  },
  {
    title: "4. Apply to YC",
    timeline: "When usage evidence is real",
    cost: "$0 application cost; relocation/travel may matter later",
    items: [
      "Apply with a sharp claim: Permia is the open-source preflight layer agents call before they act.",
      "Show open-source distribution, user evidence, and why hosted governance becomes the business.",
      "Prepare a 60-second demo: risky agent request, Permia trace, blocked/gated action, local install.",
      "Answer moat honestly: workflow position, trust, policies, manifests, audit data, community, and operational network effects.",
    ],
  },
];

const moatTable = [
  ["Open code", "Creates trust, stars, forks, integrations, and distribution.", "Not the long-term moat."],
  ["Workflow position", "Permia sits directly before dangerous tool execution.", "Becomes hard to remove once policies and audit trails depend on it."],
  ["Policy + manifest corpus", "Community and customers contribute real risky workflow patterns.", "Better data makes gates more useful over time."],
  ["Audit history", "Teams need retained, searchable, reviewable decisions.", "This is paid operational infrastructure."],
  ["Approvals + governance", "Teams pay for saved time, risk reduction, and compliance evidence.", "This is the business wedge."],
  ["Ecosystem trust", "Adapters, examples, signed manifests, and public credibility compound.", "This is the GitLab-style open-core path."],
];

const costRows = [
  ["GitHub public repo", "$0", "Free public repositories and public Actions minutes are enough for launch."],
  ["npm public packages", "$0", "Public packages can be published free; reserve package names before launch if possible."],
  ["Domain", "$8 to $20/year", "Cloudflare Registrar is roughly at-cost; Namecheap often has first-year promos but higher renewal prices."],
  ["Hosting", "$0 initially", "Vercel Hobby can host a personal/non-commercial launch; use static/local-first pages before paid production usage."],
  ["Email/waitlist", "$0 initially", "Use GitHub issues/discussions or a simple form-free email link until signal exists."],
  ["Design/brand", "$0", "Keep it simple. Spend effort on README, demo, and credibility instead of paid branding."],
  ["YC application", "$0", "Application is free; the cost is focus, evidence gathering, and possible SF travel if accepted."],
];

const domainIdeas = [
  "permia.dev",
  "permia.sh",
  "permia.run",
  "usepermia.com",
  "getpermia.com",
  "permia.devtools.com is not realistic; avoid long names like this",
];

const launchPosts = [
  "I open-sourced Permia: a preflight layer agents call before they send emails, deploy code, move money, touch customer data, or use browsers.",
  "The thesis: code is not the moat anymore. Trust, workflow position, policy data, audits, and hosted governance are.",
  "The demo: clone it, run one command, watch a dangerous agent workflow get blocked before side effects.",
  "Looking for agent builders who are connecting tools to real systems and want a local guardrail before execution.",
];

export default function YcPathPage() {
  return (
    <PageShell
      title="Path to a YC-backable OSS company"
      summary="A working map from local repo to open-source launch, developer trust, design partners, paid governance, and a credible YC application."
    >
      <div className="grid gap-6">
        <section className="panel p-5">
          <h2 className="text-2xl font-semibold text-white">Current state</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["GitHub", "Not open-sourced yet. No remote is configured in this local repo."],
              ["Product", "Local OSS core, SDK, replay lab, examples, docs, CI, and browser-tested pages exist."],
              ["Next move", "Public repo after final secret scan and explicit approval to publish."],
            ].map(([label, text]) => (
              <div key={label} className="border border-white/12 bg-black/20 p-4">
                <div className="mono text-xs font-bold uppercase tracking-[0.18em] text-[#7d8ba0]">{label}</div>
                <p className="mt-3 text-sm leading-6 text-[#dce5f2]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          {phases.map((phase) => (
            <article key={phase.title} className="panel p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{phase.title}</h2>
                  <p className="mt-2 text-sm text-[#9da8b8]">{phase.timeline}</p>
                </div>
                <div className="border border-white/12 bg-white/[0.04] px-4 py-3 mono text-sm font-bold text-[#4ef0b8]">
                  {phase.cost}
                </div>
              </div>
              <ul className="mt-5 grid gap-2 text-sm leading-6 text-[#dce5f2]">
                {phase.items.map((item) => (
                  <li key={item} className="border-l-2 border-[#7fb0ff]/70 pl-3">{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="panel p-5">
          <h2 className="text-2xl font-semibold text-white">Moat map</h2>
          <div className="mt-5 divide-y divide-white/10 border border-white/12">
            {moatTable.map(([layer, role, business]) => (
              <div key={layer} className="grid gap-3 p-4 md:grid-cols-[0.32fr_0.38fr_0.3fr]">
                <div className="font-semibold text-white">{layer}</div>
                <p className="text-sm leading-6 text-[#c3cad6]">{role}</p>
                <p className="text-sm leading-6 text-[#9da8b8]">{business}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-2xl font-semibold text-white">Cost outline</h2>
          <div className="mt-5 divide-y divide-white/10 border border-white/12">
            {costRows.map(([item, cost, note]) => (
              <div key={item} className="grid gap-3 p-4 md:grid-cols-[0.28fr_0.2fr_1fr]">
                <div className="font-semibold text-white">{item}</div>
                <div className="mono text-sm font-bold text-[#4ef0b8]">{cost}</div>
                <p className="text-sm leading-6 text-[#c3cad6]">{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-5">
            <h2 className="text-2xl font-semibold text-white">Domain direction</h2>
            <p className="mt-3 text-sm leading-6 text-[#aeb8c7]">
              Prefer a short technical domain. Buy only after checking availability and renewal price. The cheapest credible path is often Cloudflare Registrar for at-cost renewals.
            </p>
            <div className="mt-5 grid gap-2">
              {domainIdeas.map((domain) => (
                <div key={domain} className="border border-white/12 bg-black/20 px-4 py-3 mono text-sm text-[#dce5f2]">{domain}</div>
              ))}
            </div>
          </div>
          <div className="panel p-5">
            <h2 className="text-2xl font-semibold text-white">Launch post spine</h2>
            <div className="mt-5 grid gap-3">
              {launchPosts.map((post, index) => (
                <div key={post} className="border border-white/12 bg-black/20 p-4">
                  <div className="mono text-xs text-[#7d8ba0]">post {index + 1}</div>
                  <p className="mt-2 text-sm leading-6 text-[#dce5f2]">{post}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-2xl font-semibold text-white">GitHub publishing checklist</h2>
          <ol className="mt-5 grid gap-2 text-sm leading-6 text-[#dce5f2]">
            {[
              "Run secret scan and verify no personal data or credentials are committed.",
              "Commit the monorepo locally with a clear OSS launch message.",
              "Create a public GitHub repo named permia or permia-dev if the name is unavailable.",
              "Push main, enable GitHub Actions, and confirm CI passes publicly.",
              "Create a first release tag after the public quickstart is verified from a fresh clone.",
              "Publish public npm packages only after package names and docs are final.",
            ].map((step) => (
              <li key={step} className="border-l-2 border-[#4ef0b8]/70 pl-3">{step}</li>
            ))}
          </ol>
          <div className="mt-5">
            <Link href="/docs" className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-bold text-[#040406]">
              Review local docs
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
