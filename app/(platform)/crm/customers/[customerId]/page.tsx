import { notFound } from "next/navigation";
import { CrmCustomerDetailContent } from "@/components/crm/CrmCustomerDetailContent";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmService } from "@/lib/crm";

type CrmCustomerDetailPageProps = {
  params: Promise<{ customerId: string }>;
};

/** CRM Customer detail page (Mission 16A.3). */
export default async function CrmCustomerDetailPage({ params }: CrmCustomerDetailPageProps) {
  const { customerId } = await params;
  const detail = crmService.getCustomerDetail(customerId);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <CrmSectionHeader
        title={detail.customer.name}
        subtitle={`${detail.customer.company} · ${detail.customer.industry}`}
      />
      <section aria-label="CRM Customer Detail" className={WORKSPACE_SECTION_CLASS}>
        <CrmCustomerDetailContent detail={detail} />
      </section>
    </>
  );
}
