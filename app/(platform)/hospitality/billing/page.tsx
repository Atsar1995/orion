import { BillingDashboard } from "@/components/hospitality/BillingDashboard";
import { FolioDirectory } from "@/components/hospitality/FolioDirectory";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { RevenuePanel } from "@/components/hospitality/RevenuePanel";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { DEFAULT_PROPERTY_ID, hospitalityBillingService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Billing, folio & revenue operations platform (Mission P-007.6). */
export default async function HospitalityBillingPage() {
  const { context } = await getDecisionServiceContext();
  const dashboard = hospitalityBillingService.dashboard.getDashboard(context, DEFAULT_PROPERTY_ID);
  const revenue = hospitalityBillingService.revenue.getDashboard(context, DEFAULT_PROPERTY_ID);

  return (
    <>
      <HospitalitySectionHeader
        title="Billing & Revenue"
        subtitle="Guest folios, charges, payments, invoices, and revenue analytics — operational financial events for Finance Workspace."
      />
      <section aria-label="Hospitality Billing" className={`${WORKSPACE_SECTION_CLASS} space-y-6`}>
        <BillingDashboard dashboard={dashboard} />
        <FolioDirectory folios={dashboard.folios} />
        <RevenuePanel revenue={revenue} />
      </section>
    </>
  );
}
