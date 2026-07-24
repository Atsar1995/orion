import { FinanceReceivablesManagement } from "@/components/finance/FinanceReceivablesManagement";
import { FinanceSectionHeader } from "@/components/finance/FinanceSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function FinanceReceivablesPage() {
  return (
    <>
      <FinanceSectionHeader
        title="Receivables"
        subtitle="Outstanding customer invoices, aging analysis, and collection priorities."
      />
      <section
        aria-label="Finance Receivables"
        className={WORKSPACE_SECTION_CLASS}
      >
        <FinanceReceivablesManagement />
      </section>
    </>
  );
}
