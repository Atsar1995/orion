import { WorkspaceSubNav } from "@/components/workspace/WorkspaceSubNav";
import { CRM_BASE_PATH, CRM_NAV } from "@/lib/crm";

/** Horizontal sub-navigation for Customer Intelligence workspace sections. */
export function CrmSubNav() {
  return (
    <WorkspaceSubNav
      items={CRM_NAV}
      basePath={CRM_BASE_PATH}
      ariaLabel="Customer Intelligence sections"
    />
  );
}
