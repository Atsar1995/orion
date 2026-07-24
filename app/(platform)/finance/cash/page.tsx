import { FinanceCashSection } from "@/components/finance/FinanceCashSection";
import { FinanceSectionHeader } from "@/components/finance/FinanceSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function FinanceCashPage() {
  return (
    <>
      <FinanceSectionHeader
        title="Cash"
        subtitle="Operating balances, accounts, and recent cash flow."
      />
      <section aria-label="Finance Cash" className={WORKSPACE_SECTION_CLASS}>
        <FinanceCashSection />
      </section>
    </>
  );
}
