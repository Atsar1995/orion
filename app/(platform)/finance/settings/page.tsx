import { FinanceSettingsSection } from "@/components/finance/FinanceSettingsSection";
import { FinanceSectionHeader } from "@/components/finance/FinanceSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function FinanceSettingsPage() {
  return (
    <>
      <FinanceSectionHeader
        title="Settings"
        subtitle="Finance workspace preferences and alert thresholds."
      />
      <section aria-label="Finance Settings" className={WORKSPACE_SECTION_CLASS}>
        <FinanceSettingsSection />
      </section>
    </>
  );
}
