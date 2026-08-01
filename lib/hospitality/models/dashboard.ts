import type { HealthStatus } from "@/lib/command-center-data";

export type HospitalityDashboardView = {
  readonly summary: string;
  readonly executiveBriefing: string;
  readonly hotelHealth: { score: string; status: HealthStatus; property: string };
  readonly kpis: readonly { label: string; value: string }[];
  readonly todayOperations: readonly { label: string; value: string }[];
  readonly occupancyRevenue: readonly { label: string; value: string }[];
  readonly bookingPerformance: readonly { label: string; value: string }[];
  readonly arrivalsDepartures: readonly {
    guest: string;
    room: string;
    time: string;
    type: "arrival" | "departure";
  }[];
  readonly guestExperience: {
    positiveReviews: number;
    complaints: number;
    pendingRequests: number;
    satisfactionTrend: string;
    highlights: readonly string[];
  };
  readonly bookingChannels: readonly {
    channel: string;
    share: string;
    bookings: number;
    status: HealthStatus;
    summary: string;
  }[];
  readonly revenueOpportunities: readonly string[];
  readonly orionInsights: readonly {
    category: "Revenue Insight" | "Guest Insight" | "Operations Insight";
    insight: string;
  }[];
  readonly criticalIssues: readonly { status: HealthStatus; message: string }[];
  readonly recommendedActions: readonly {
    priority: number;
    title: string;
    description: string;
  }[];
  readonly recentActivity: readonly { time: string; description: string }[];
  readonly operationsDetail: {
    roomsOutOfService: number;
    staffOnDuty: number;
    maintenanceRequests: number;
    repeatGuests: number;
    earlyArrivals: number;
    lateCheckouts: number;
  };
  readonly quickActions: readonly { label: string; href: string }[];
};

export type ReservationListItem = {
  readonly id: string;
  readonly guestName: string;
  readonly roomNumber?: string;
  readonly roomType: string;
  readonly channel: string;
  readonly status: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly rate: string;
  readonly isVip: boolean;
};

export type GuestListItem = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly loyaltyTier: string;
  readonly stayCount: number;
  readonly totalSpend: string;
  readonly isVip: boolean;
};

export type RoomListItem = {
  readonly id: string;
  readonly number: string;
  readonly roomType: string;
  readonly status: string;
  readonly floor: string;
  readonly isVip: boolean;
};

export type HousekeepingBoardItem = {
  readonly roomNumber: string;
  readonly status: string;
  readonly taskStatus?: string;
  readonly assignedTo?: string;
  readonly priority: string;
};

export type BillingListItem = {
  readonly folioId: string;
  readonly guestName: string;
  readonly reservationId: string;
  readonly status: string;
  readonly balance: string;
  readonly charges: number;
};

export type HospitalityBriefContribution = {
  readonly workspaceId: string;
  readonly workspaceLabel: string;
  readonly briefingLine: string;
  readonly occupancyToday: string;
  readonly revenueToday: string;
  readonly vipArrivals: number;
  readonly criticalIssues: readonly string[];
  readonly operationalRisks: readonly string[];
  readonly healthScore: number;
  readonly totalProperties?: number;
  readonly inventoryHealthScore?: number;
  readonly unavailableInventory?: number;
  readonly totalCapacity?: number;
  readonly inventoryAlerts?: readonly string[];
  readonly todaysArrivals?: number;
  readonly todaysDepartures?: number;
  readonly bookingPace?: string;
  readonly criticalOverbookings?: readonly string[];
  readonly repeatGuests?: number;
  readonly highValueGuests?: number;
  readonly guestSatisfactionTrend?: string;
  readonly serviceRecoveryAlerts?: readonly string[];
  readonly frontOfficeOccupancy?: number;
  readonly vipInHouse?: number;
  readonly operationalDelays?: readonly string[];
  readonly readyRooms?: number;
  readonly awaitingCleaning?: number;
  readonly criticalMaintenance?: number;
  readonly assetHealthScore?: number;
  readonly outstandingBalances?: number;
  readonly pendingPayments?: number;
  readonly openFolioCount?: number;
  readonly averageDailyRate?: number;
  readonly revpar?: number;
  readonly operationalHealth?: number;
  readonly revenueHealth?: number;
  readonly guestExperienceHealth?: number;
  readonly forecastOccupancy?: number;
  readonly forecastRevenue?: number;
};

export type HospitalityIntelligenceResult = {
  readonly operations: {
    occupancyPercent: number;
    adr: number;
    revpar: number;
    dailyRevenue: number;
  };
  readonly recommendations: readonly {
    priority: number;
    title: string;
    description: string;
    category: string;
  }[];
  readonly alerts: readonly { severity: "critical" | "attention"; message: string }[];
  readonly patterns: readonly { title: string; description: string }[];
};
