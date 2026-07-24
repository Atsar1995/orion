import type { HealthStatus } from "@/lib/command-center-data";
import type { FinanceBreakdownItem, FinanceInsight } from "@/lib/finance-insights";

// TD-001: Placeholder receivables and payables data until accounting service integration

export type LedgerAccount = {
  name: string;
  amount: string;
  status: HealthStatus;
  due: string;
  priority: number;
};

export type PriorityObligation = {
  name: string;
  amount: string;
  due: string;
  status: HealthStatus;
  action: string;
};

export const RECEIVABLES_EXECUTIVE_SUMMARY =
  "₹42K outstanding across four customers with ₹12K overdue. Hospitality segment drives collection risk — prioritise OranIA Hospitality Group before week end.";

export const RECEIVABLES_AGING: FinanceBreakdownItem[] = [
  { label: "Current", value: 18, displayValue: "₹18K", share: "43%" },
  { label: "1–30 days overdue", value: 12, displayValue: "₹12K", share: "29%" },
  { label: "31–60 days", value: 8, displayValue: "₹8K", share: "19%" },
  { label: "61+ days", value: 4, displayValue: "₹4K", share: "9%" },
];

export const TOP_OUTSTANDING_CUSTOMERS: LedgerAccount[] = [
  {
    name: "OranIA Hospitality Group",
    amount: "₹18K",
    status: "attention",
    due: "Overdue 5 days",
    priority: 1,
  },
  {
    name: "Commerce Partner Ltd",
    amount: "₹12K",
    status: "attention",
    due: "Due in 3 days",
    priority: 2,
  },
  {
    name: "Consulting Client A",
    amount: "₹8K",
    status: "healthy",
    due: "Due in 12 days",
    priority: 3,
  },
  {
    name: "Retail Channel Co",
    amount: "₹4K",
    status: "healthy",
    due: "Due in 18 days",
    priority: 4,
  },
];

export const COLLECTION_PRIORITY: LedgerAccount[] = [...TOP_OUTSTANDING_CUSTOMERS].sort(
  (left, right) => left.priority - right.priority,
);

export const RECEIVABLES_RECOMMENDED_ACTIONS: FinanceInsight[] = [
  {
    priority: 1,
    title: "Call OranIA Hospitality Group",
    description: "Escalate overdue ₹18K invoice — request payment confirmation by Friday.",
  },
  {
    priority: 2,
    title: "Send Commerce Partner reminder",
    description: "Invoice due in 3 days (₹12K). Send automated reminder with payment link.",
  },
  {
    priority: 3,
    title: "Review credit terms for hospitality segment",
    description: "Two of four overdue accounts are hospitality — tighten payment terms for new bookings.",
  },
];

export const PAYABLES_EXECUTIVE_SUMMARY =
  "₹28K in vendor obligations with ₹9K due this week. All payables are on schedule — no overdue items. Cloud Infrastructure payment on Thursday is the largest near-term cash outflow.";

export const UPCOMING_PAYMENTS: LedgerAccount[] = [
  {
    name: "Cloud Infrastructure Ltd",
    amount: "₹9K",
    status: "healthy",
    due: "Due in 4 days",
    priority: 1,
  },
  {
    name: "Office Lease — HQ",
    amount: "₹7K",
    status: "healthy",
    due: "Due in 9 days",
    priority: 2,
  },
  {
    name: "Marketing Agency",
    amount: "₹6K",
    status: "healthy",
    due: "Due in 14 days",
    priority: 3,
  },
  {
    name: "Software Subscriptions",
    amount: "₹6K",
    status: "healthy",
    due: "Due in 21 days",
    priority: 4,
  },
];

export const VENDOR_PRIORITY: LedgerAccount[] = [...UPCOMING_PAYMENTS].sort(
  (left, right) => left.priority - right.priority,
);

export const PAYABLES_CASH_IMPACT = {
  dueThisWeek: "₹9K",
  dueNext30Days: "₹28K",
  cashAfterPayments: "₹17.5L",
  status: "healthy" as HealthStatus,
  summary:
    "Near-term payables are well within operating cash. No payment deferrals required.",
};

export const PAYABLES_RECOMMENDATIONS: FinanceInsight[] = [
  {
    priority: 1,
    title: "Confirm Cloud Infrastructure payment",
    description: "Schedule ₹9K transfer for Thursday — largest payment this week.",
  },
  {
    priority: 2,
    title: "Batch vendor payments on Fridays",
    description: "Consolidate routine payments to reduce transaction overhead and improve cash visibility.",
  },
  {
    priority: 3,
    title: "Negotiate annual software subscription",
    description: "Software renewals due in 21 days — request annual discount before committing.",
  },
];

export const HIGHEST_PRIORITY_RECEIVABLE: PriorityObligation = {
  name: "OranIA Hospitality Group",
  amount: "₹18K",
  due: "Overdue 5 days",
  status: "attention",
  action: "Escalate collection call before Friday",
};

export const HIGHEST_PRIORITY_PAYABLE: PriorityObligation = {
  name: "Cloud Infrastructure Ltd",
  amount: "₹9K",
  due: "Due in 4 days",
  status: "healthy",
  action: "Schedule payment for Thursday",
};

/** Maps ledger accounts to finance-data ledger item shape for legacy consumers. */
export function toFinanceLedgerItems(accounts: LedgerAccount[]) {
  return accounts.map((account) => ({
    label: account.name,
    amount: account.amount,
    status: account.status,
    due: account.due,
  }));
}
