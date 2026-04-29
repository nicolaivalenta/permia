import { PageShell } from "@/components/PageShell";

const tiers = [
  ["OSS Core", "$0", "Policy engine, SDK, local server, replay fixtures, and public tool manifests run without a Permia account."],
  ["Hosted Ops", "Future", "Approval inboxes, retained audit ledgers, team policy history, and private registries after the OSS wedge earns demand."],
  ["Enterprise", "Future", "Private deployment, SSO/RBAC, internal connectors, signed manifests, and long-retention compliance exports."],
  ["Vendor Trust", "Future", "Manifest verification and distribution once there is enough developer usage to justify the marketplace layer."],
];

export default function PricingPage() {
  return (
    <PageShell title="Open core first" summary="Permia should earn developer trust before charging. The local engine is free; paid operations wait for real team demand.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tiers.map(([name, price, text]) => (
          <div key={name} className="panel p-5">
            <h2 className="text-xl font-semibold text-white">{name}</h2>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-[#4ef0b8]">{price}</div>
            <p className="mt-4 text-sm leading-6 text-slate-400">{text}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
