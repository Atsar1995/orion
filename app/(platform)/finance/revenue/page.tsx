import { FinanceRevenueSection } from "@/components/finance/FinanceRevenueSection";
import { FinanceSectionHeader } from "@/components/finance/FinanceSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function FinanceRevenuePage() {
  return (
    <>
      <FinanceSectionHeader
        title="Revenue"
        subtitle="Channel breakdown and revenue performance."
      />
      <section aria-label="Finance Revenue" className={WORKSPACE_SECTION_CLASS}>
        <FinanceRevenueSection />
      </section>
    </>
  );
}
