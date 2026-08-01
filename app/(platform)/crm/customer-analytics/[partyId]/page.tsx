import { notFound } from "next/navigation";
import Link from "next/link";
import { CrmCustomerProfileDetail } from "@/components/crm/CrmCustomerProfileDetail";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmCustomerIntelligenceService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

type PageProps = {
  params: Promise<{ partyId: string }>;
};

/** Unified customer profile detail (Mission P-008.6). */
export default async function CrmCustomerProfilePage({ params }: PageProps) {
  const { partyId } = await params;
  const { context } = await getDecisionServiceContext();
  const profile = crmCustomerIntelligenceService.profiles.get(partyId, context);

  if (!profile) {
    notFound();
  }

  return (
    <>
      <CrmSectionHeader
        title={profile.displayName}
        subtitle={`Customer profile · ${profile.segment.replace(/_/g, " ")} · retention ${profile.retentionRisk}`}
      />
      <section aria-label="Customer Profile Detail" className={WORKSPACE_SECTION_CLASS}>
        <Link
          href="/crm/customer-analytics"
          className="mb-4 inline-flex text-sm text-orion-gold/90 hover:text-orion-gold"
        >
          ← Back to Customer Analytics
        </Link>
        <CrmCustomerProfileDetail profile={profile} />
      </section>
    </>
  );
}
