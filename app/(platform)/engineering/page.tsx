import Link from "next/link";
import { CurrentSpecificationCard } from "@/components/engineering/CurrentSpecificationCard";
import { EngineeringDocumentCard } from "@/components/engineering/EngineeringDocumentCard";
import { EngineeringQuickActionsCard } from "@/components/engineering/EngineeringQuickActionsCard";
import { EngineeringStatusCard } from "@/components/engineering/EngineeringStatusCard";
import { EngineeringWorkspaceHeader } from "@/components/engineering/EngineeringWorkspaceHeader";
import { RecentSpecificationsCard } from "@/components/engineering/RecentSpecificationsCard";
import { ReleaseInformationCard } from "@/components/engineering/ReleaseInformationCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ENGINEERING_DOCUMENTS = [
  {
    title: "START_HERE.md",
    path: "docs/00_BLUEPRINT/START_HERE.md",
  },
  {
    title: "CURRENT_STATE.md",
    path: "docs/00_BLUEPRINT/CURRENT_STATE.md",
  },
  {
    title: "Engineering_Dashboard.md",
    path: "docs/00_BLUEPRINT/Engineering_Dashboard.md",
  },
  {
    title: "Product_Principles.md",
    path: "docs/00_BLUEPRINT/Product_Principles.md",
  },
] as const;

export default function EngineeringWorkspacePage() {
  return (
    <div className="space-y-8">
      <EngineeringWorkspaceHeader />

      <section aria-label="Engineering Workspace" className="space-y-6">
        <div className="rounded-orion-lg border border-orion-border bg-orion-surface/40 p-4">
          <p className="text-sm font-light text-orion-muted">
            Production readiness assessment for platform deployment.
          </p>
          <Link
            href="/engineering/readiness"
            className="mt-2 inline-block text-sm font-medium text-orion-gold hover:text-orion-gold-light"
          >
            Open Release Readiness Dashboard →
          </Link>
        </div>

        <EngineeringStatusCard />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CurrentSpecificationCard />
          <ReleaseInformationCard />
        </div>

        <div className="space-y-4">
          <SectionHeader
            title="Engineering Documents"
            subtitle="Blueprint references for the current development cycle."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ENGINEERING_DOCUMENTS.map((doc) => (
              <EngineeringDocumentCard
                key={doc.title}
                title={doc.title}
                path={doc.path}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RecentSpecificationsCard />
          <EngineeringQuickActionsCard />
        </div>
      </section>
    </div>
  );
}
