import type { HealthStatus } from "@/lib/command-center-data";

// TD-001: Placeholder finance data until accounting integrations ship

import {
  toFinanceLedgerItems,
  TOP_OUTSTANDING_CUSTOMERS,
  UPCOMING_PAYMENTS,
} from "@/lib/finance-receivables-payables";

export type FinanceActivity = {
  time: string;
  description: string;
};

export type FinanceLedgerItem = {
  label: string;
  amount: string;
  status?: HealthStatus;
  due?: string;
};

export type FinanceReport = {
  name: string;
  description: string;
  period: string;
};

export type FinanceSettingField = {
  label: string;
  value: string;
};

export const FINANCE_EXECUTIVE_SUMMARY =
  "Cash flow remains positive with revenue tracking 8% above plan. Receivables are elevated in the hospitality segment; payables are within normal operating range.";

export const FINANCE_HEALTH = {
  status: "healthy" as HealthStatus,
  cashFlow: "Positive",
  margin: "24.6%",
};

export const FINANCE_KPIS = [
  { label: "Cash Balance", value: "₹18.4L" },
  { label: "Monthly Revenue", value: "₹42.8L" },
  { label: "Monthly Expenses", value: "₹32.3L" },
  { label: "Net Margin", value: "24.6%" },
  { label: "Receivables", value: "₹42K" },
  { label: "Payables", value: "₹28K" },
  { label: "Runway", value: "14 mo" },
  { label: "Health Score", value: "88/100" },
] as const;

export const FINANCE_REVENUE_TREND = {
  period: "Last 6 months",
  change: "+8.2%",
  summary: "Revenue trending upward driven by hospitality and commerce channels.",
};

export const FINANCE_CASH_POSITION = {
  available: "₹18.4L",
  reserved: "₹3.2L",
  projected30Day: "₹16.8L",
  summary: "Operating cash covers current obligations with comfortable buffer.",
};

export const FINANCE_RECEIVABLES_SNAPSHOT = {
  total: "₹42K",
  overdue: "₹12K",
  dueThisWeek: "₹8K",
  topDebtor: "OranIA Hospitality Group",
};

export const FINANCE_PAYABLES_SNAPSHOT = {
  total: "₹28K",
  dueThisWeek: "₹9K",
  overdue: "₹0",
  largestVendor: "Cloud Infrastructure Ltd",
};

export const FINANCE_RECENT_ACTIVITY: FinanceActivity[] = [
  { time: "09:15", description: "Invoice #1042 paid — OranIA Hospitality Group (₹18K)" },
  { time: "08:40", description: "Payroll batch scheduled for Friday (₹4.2L)" },
  { time: "Yesterday", description: "Expense approval — Marketing campaign spend (₹1.2L)" },
  { time: "Yesterday", description: "Receivable reminder sent — Commerce partner (₹12K)" },
  { time: "Mon", description: "Monthly revenue close completed for June" },
];

export const FINANCE_EXECUTIVE_NOTES =
  "Prioritise collecting overdue hospitality receivables before increasing paid marketing spend. Cash position supports current payroll and vendor commitments through Q3.";

export const CASH_ACCOUNTS = [
  { label: "Operating Account", value: "₹14.2L" },
  { label: "Reserve Account", value: "₹3.2L" },
  { label: "Petty Cash", value: "₹1.0L" },
] as const;

export const CASH_FLOW_ITEMS: FinanceLedgerItem[] = [
  { label: "Customer receipts", amount: "+₹8.4L", status: "healthy" },
  { label: "Vendor payments", amount: "-₹5.1L", status: "healthy" },
  { label: "Payroll", amount: "-₹4.2L", status: "attention" },
  { label: "Tax provisions", amount: "-₹1.1L", status: "healthy" },
];

export const REVENUE_BREAKDOWN = [
  { label: "Hospitality", value: "₹18.6L", share: "43%" },
  { label: "Commerce", value: "₹12.4L", share: "29%" },
  { label: "Services", value: "₹8.2L", share: "19%" },
  { label: "Other", value: "₹3.6L", share: "9%" },
] as const;

export const EXPENSE_CATEGORIES = [
  { label: "Payroll", value: "₹14.8L", share: "46%" },
  { label: "Marketing", value: "₹5.6L", share: "17%" },
  { label: "Operations", value: "₹4.9L", share: "15%" },
  { label: "Technology", value: "₹3.4L", share: "11%" },
  { label: "Other", value: "₹3.6L", share: "11%" },
] as const;

export const RECEIVABLES = toFinanceLedgerItems(TOP_OUTSTANDING_CUSTOMERS);

export const PAYABLES = toFinanceLedgerItems(UPCOMING_PAYMENTS);

export const FORECAST_PROJECTIONS = [
  { label: "Projected Revenue (90d)", value: "₹1.32Cr" },
  { label: "Projected Expenses (90d)", value: "₹98.4L" },
  { label: "Projected Net Cash", value: "₹33.6L" },
  { label: "Confidence", value: "Medium" },
] as const;

export const FINANCE_REPORTS: FinanceReport[] = [
  {
    name: "Profit & Loss",
    description: "Monthly revenue, expenses, and net margin summary.",
    period: "June 2026",
  },
  {
    name: "Cash Flow Statement",
    description: "Operating, investing, and financing cash movements.",
    period: "June 2026",
  },
  {
    name: "Accounts Receivable Ageing",
    description: "Outstanding invoices grouped by due date.",
    period: "Current",
  },
  {
    name: "Accounts Payable Summary",
    description: "Vendor obligations and upcoming payment schedule.",
    period: "Current",
  },
];

export const FINANCE_GENERAL_SETTINGS: FinanceSettingField[] = [
  { label: "Base Currency", value: "INR (₹)" },
  { label: "Fiscal Year Start", value: "April" },
  { label: "Default Tax Rate", value: "18% GST" },
];

export const FINANCE_ALERT_SETTINGS: FinanceSettingField[] = [
  { label: "Low Cash Alert", value: "Below ₹5L" },
  { label: "Receivable Overdue Alert", value: "After 7 days" },
  { label: "Payable Reminder", value: "3 days before due" },
];
