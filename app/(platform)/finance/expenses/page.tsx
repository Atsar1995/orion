import { FinanceExpensesSection } from "@/components/finance/FinanceExpensesSection";
import { FinanceSectionHeader } from "@/components/finance/FinanceSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function FinanceExpensesPage() {
  return (
    <>
      <FinanceSectionHeader
        title="Expenses"
        subtitle="Operating spend by category and budget comparison."
      />
      <section aria-label="Finance Expenses" className={WORKSPACE_SECTION_CLASS}>
        <FinanceExpensesSection />
      </section>
    </>
  );
}
