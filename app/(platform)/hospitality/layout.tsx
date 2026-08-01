import type { ReactNode } from "react";
import { HospitalitySubNav } from "@/components/hospitality/HospitalitySubNav";
import { WORKSPACE_PAGE_CLASS } from "@/lib/constants";

export default function HospitalityLayout({ children }: { children: ReactNode }) {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <HospitalitySubNav />
      {children}
    </div>
  );
}
