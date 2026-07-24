import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS } from "@/lib/constants";
import { FINANCE_REPORTS } from "@/lib/finance-data";

/** Finance reports list placeholder. */
export function FinanceReportsSection() {
  return (
    <Card title="Available Reports">
      <ul className={WORKSPACE_FIELD_LIST_CLASS}>
        {FINANCE_REPORTS.map((report) => (
          <li
            key={report.name}
            className="border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0"
          >
            <p className="text-sm font-medium text-white/85">{report.name}</p>
            <p className="mt-1 text-sm font-light text-white/50">
              {report.description}
            </p>
            <p className="mt-1 text-xs font-light text-white/35">{report.period}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
