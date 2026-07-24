import { FinanceReportsSection } from "@/components/finance/FinanceReportsSection";
import { FinanceSectionHeader } from "@/components/finance/FinanceSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function FinanceReportsPage() {
  return (
    <>
      <FinanceSectionHeader
        title="Reports"
        subtitle="Financial statements and executive reporting."
      />
      <section aria-label="Finance Reports" className={WORKSPACE_SECTION_CLASS}>
        <FinanceReportsSection />
      </section>
    </>
  );
}
