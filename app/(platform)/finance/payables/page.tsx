import { FinancePayablesManagement } from "@/components/finance/FinancePayablesManagement";
import { FinanceSectionHeader } from "@/components/finance/FinanceSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function FinancePayablesPage() {
  return (
    <>
      <FinanceSectionHeader
        title="Payables"
        subtitle="Vendor obligations, payment schedule, and cash impact analysis."
      />
      <section aria-label="Finance Payables" className={WORKSPACE_SECTION_CLASS}>
        <FinancePayablesManagement />
      </section>
    </>
  );
}
