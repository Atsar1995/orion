export type GuestListViewItem = {
  readonly id: string;
  readonly fullName: string;
  readonly preferredName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly loyaltyTier: string;
  readonly loyaltyNumber?: string;
  readonly company?: string;
  readonly stayCount: number;
  readonly totalSpend: string;
  readonly isVip: boolean;
  readonly satisfactionScore?: number;
  readonly tags: readonly string[];
};

export type GuestDetailView = {
  readonly record: import("@/types/hospitality-guest").GuestRecord;
  readonly timeline: readonly import("@/types/hospitality-guest").GuestTimelineEntry[];
  readonly stayHistory: readonly {
    readonly reservationId: string;
    readonly reservationNumber: string;
    readonly arrival: string;
    readonly departure: string;
    readonly status: string;
    readonly revenue: number;
  }[];
  readonly duplicateCandidates: readonly { readonly guestId: string; readonly fullName: string; readonly score: number }[];
  readonly analytics: GuestAnalyticsView;
};

export type GuestSearchView = {
  readonly total: number;
  readonly items: readonly GuestListViewItem[];
  readonly filters: readonly { key: string; label: string }[];
};

export type GuestAnalyticsView = {
  readonly lifetimeValue: string;
  readonly averageStayValue: string;
  readonly repeatRate: string;
  readonly cancellationRate: string;
  readonly satisfactionTrend: string;
  readonly loyaltyTier: string;
  readonly revenueRank: number;
};

export type GuestTimelineView = {
  readonly guestId: string;
  readonly fullName: string;
  readonly entries: readonly import("@/types/hospitality-guest").GuestTimelineEntry[];
  readonly total: number;
};

export type GuestBriefContribution = {
  readonly vipArrivals: number;
  readonly repeatGuests: number;
  readonly highValueGuests: number;
  readonly serviceRecoveryAlerts: readonly string[];
  readonly satisfactionTrend: string;
  readonly guestRetentionOpportunity: string;
};
