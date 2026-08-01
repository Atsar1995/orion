export type FolioListItem = {
  readonly folioId: string;
  readonly folioType: string;
  readonly guestName: string;
  readonly reservationId: string;
  readonly status: string;
  readonly balance: string;
  readonly charges: number;
  readonly totalCharges: number;
  readonly totalPaid: number;
  readonly isVip: boolean;
};

export type FolioDetailView = {
  readonly folio: {
    readonly id: string;
    readonly folioType: string;
    readonly status: string;
    readonly guestName: string;
    readonly reservationId: string;
    readonly stayId?: string;
    readonly companyAccountId?: string;
    readonly currency: string;
  };
  readonly charges: readonly {
    readonly id: string;
    readonly description: string;
    readonly category: string;
    readonly amount: number;
    readonly taxAmount: number;
    readonly total: number;
    readonly postedAt: string;
  }[];
  readonly payments: readonly {
    readonly id: string;
    readonly amount: number;
    readonly method: string;
    readonly reference?: string;
    readonly postedAt: string;
  }[];
  readonly deposits: readonly { readonly id: string; readonly amount: number; readonly status: string }[];
  readonly adjustments: readonly { readonly id: string; readonly type: string; readonly amount: number; readonly reason: string }[];
  readonly invoices: readonly { readonly id: string; readonly type: string; readonly invoiceNumber: string; readonly total: number; readonly status: string }[];
  readonly summary: {
    readonly subtotal: number;
    readonly taxTotal: number;
    readonly adjustments: number;
    readonly paid: number;
    readonly balance: number;
  };
};

export type BillingDashboardView = {
  readonly summary: {
    readonly todaysRevenue: number;
    readonly outstandingBalances: number;
    readonly pendingPayments: number;
    readonly openFolios: number;
    readonly settledToday: number;
    readonly averageDailyRate: number;
    readonly revpar: number;
  };
  readonly folios: readonly FolioListItem[];
  readonly recentPayments: readonly { readonly folioId: string; readonly guestName: string; readonly amount: number; readonly method: string }[];
  readonly revenueByCategory: readonly { readonly category: string; readonly amount: number }[];
};

export type RevenueDashboardView = {
  readonly dailyRevenue: number;
  readonly monthlyRevenue: number;
  readonly adr: number;
  readonly revpar: number;
  readonly byProperty: readonly { readonly propertyId: string; readonly propertyName: string; readonly revenue: number }[];
  readonly bySource: readonly { readonly source: string; readonly revenue: number; readonly share: number }[];
  readonly byAccommodationType: readonly { readonly type: string; readonly revenue: number }[];
  readonly byMarketSegment: readonly { readonly segment: string; readonly revenue: number }[];
};

export type BillingBriefContribution = {
  readonly todaysRevenue: number;
  readonly outstandingBalances: number;
  readonly pendingPayments: number;
  readonly averageDailyRate: number;
  readonly revpar: number;
  readonly highValueGuestCount: number;
  readonly openFolioCount: number;
};
