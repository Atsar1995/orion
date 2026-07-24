import type { ReactNode } from "react";
import { CrmSubNav } from "@/components/crm/CrmSubNav";
import { WORKSPACE_PAGE_CLASS } from "@/lib/constants";

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <CrmSubNav />
      {children}
    </div>
  );
}
