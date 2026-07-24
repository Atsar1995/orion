import type { HealthStatus } from "@/lib/command-center-data";

/** Finance Executive Brief card snapshot shape. */
export type FinanceAdvisorSnapshot = {
  healthScore: number;
  trend: string;
  status: HealthStatus;
  cashBalance: string;
  monthlyRevenue: string;
  netMargin: string;
  topInsight: { priority: number; title: string; description: string };
  topAlert: { severity: HealthStatus; message: string };
  topReceivable: {
    name: string;
    amount: string;
    due: string;
    status: HealthStatus;
    action: string;
  };
  topPayable: {
    name: string;
    amount: string;
    due: string;
    status: HealthStatus;
    action: string;
  };
};
