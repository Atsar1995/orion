import { WorkspaceSubNav } from "@/components/workspace/WorkspaceSubNav";
import { FINANCE_NAV } from "@/lib/finance-nav";

const FINANCE_BASE_PATH = "/finance";

/** Horizontal sub-navigation for Finance workspace sections. */
export function FinanceSubNav() {
  return (
    <WorkspaceSubNav
      items={FINANCE_NAV}
      basePath={FINANCE_BASE_PATH}
      ariaLabel="Finance sections"
      primaryItemCount={2}
      preferenceKey="financeNavExpanded"
    />
  );
}
