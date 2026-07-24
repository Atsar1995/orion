import type { ReactNode } from "react";
import { FinanceSubNav } from "@/components/finance/FinanceSubNav";
import { WORKSPACE_PAGE_CLASS } from "@/lib/constants";

export default function FinanceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <FinanceSubNav />
      {children}
    </div>
  );
}
