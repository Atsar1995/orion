import { FinanceForecastSection } from "@/components/finance/FinanceForecastSection";
import { FinanceSectionHeader } from "@/components/finance/FinanceSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function FinanceForecastPage() {
  return (
    <>
      <FinanceSectionHeader
        title="Forecast"
        subtitle="Projected revenue, expenses, and cash over the next 90 days."
      />
      <section aria-label="Finance Forecast" className={WORKSPACE_SECTION_CLASS}>
        <FinanceForecastSection />
      </section>
    </>
  );
}
