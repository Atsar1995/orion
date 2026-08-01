/**
 * ORION Hospitality — Reservation Management Engine types (Mission P-007.2).
 * Canonical booking model for all hospitality deployments.
 */

export type ReservationLifecycleStatus =
  | "inquiry"
  | "quote"
  | "provisional"
  | "confirmed"
  | "modified"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show"
  | "archived";

export type BookingSource =
  | "direct_website"
  | "walk_in"
  | "telephone"
  | "email"
  | "travel_agent"
  | "corporate"
  | "ota"
  | "channel_manager"
  | "group";

export type MarketSegment =
  | "leisure"
  | "business"
  | "group"
  | "corporate"
  | "government"
  | "wholesale";

export type PaymentStatus = "pending" | "deposit_paid" | "partial" | "paid" | "refunded";

export type AllocationStatus = "pending" | "assigned" | "checked_in" | "checked_out" | "released";

export type CalendarViewMode = "daily" | "weekly" | "monthly" | "timeline";

export type GuestCount = {
  readonly adults: number;
  readonly children: number;
  readonly infants: number;
};

export type RatePlanReference = {
  readonly id: string;
  readonly name: string;
  readonly baseRate: number;
  readonly currency?: string;
};

export type CancellationPolicy = {
  readonly id: string;
  readonly name: string;
  readonly hoursBeforeArrival: number;
  readonly penaltyPercent: number;
};

export type DepositPolicy = {
  readonly id: string;
  readonly name: string;
  readonly depositPercent: number;
  readonly dueAtBooking: boolean;
};

export type Allocation = {
  readonly id: string;
  readonly reservationId: string;
  readonly inventoryItemId?: string;
  readonly accommodationTypeId: string;
  readonly arrival: string;
  readonly departure: string;
  readonly status: AllocationStatus;
};

export type Stay = {
  readonly reservationId: string;
  readonly arrival: string;
  readonly departure: string;
  readonly nights: number;
};

/** Canonical reservation record — consumed by billing, CRM, and channel modules. */
export type ReservationRecord = {
  readonly id: string;
  readonly reservationNumber: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly guestId: string;
  readonly inventoryItemId?: string;
  readonly accommodationTypeId: string;
  readonly source: BookingSource;
  readonly status: ReservationLifecycleStatus;
  readonly arrival: string;
  readonly departure: string;
  readonly lengthOfStay: number;
  readonly guestCount: GuestCount;
  readonly ratePlan?: RatePlanReference;
  readonly packageName?: string;
  readonly marketSegment?: MarketSegment;
  readonly paymentStatus: PaymentStatus;
  readonly rate: number;
  readonly groupName?: string;
  readonly corporateAccount?: string;
  readonly agentName?: string;
  readonly companyName?: string;
  readonly isVip: boolean;
  readonly specialRequests: readonly string[];
  readonly notes?: string;
  readonly internalComments?: string;
  readonly allocations: readonly Allocation[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ReservationSearchFilter = {
  readonly propertyId?: string;
  readonly query?: string;
  readonly reservationNumber?: string;
  readonly guestId?: string;
  readonly status?: ReservationLifecycleStatus;
  readonly source?: BookingSource;
  readonly arrivalFrom?: string;
  readonly arrivalTo?: string;
  readonly accommodationTypeId?: string;
  readonly inventoryItemId?: string;
  readonly agentName?: string;
  readonly companyName?: string;
};

export type CreateReservationInput = {
  readonly propertyId: string;
  readonly guestId: string;
  readonly accommodationTypeId: string;
  readonly inventoryItemId?: string;
  readonly source: BookingSource;
  readonly arrival: string;
  readonly departure: string;
  readonly guestCount: GuestCount;
  readonly rate: number;
  readonly ratePlan?: RatePlanReference;
  readonly packageName?: string;
  readonly marketSegment?: MarketSegment;
  readonly paymentStatus?: PaymentStatus;
  readonly groupName?: string;
  readonly corporateAccount?: string;
  readonly agentName?: string;
  readonly companyName?: string;
  readonly isVip?: boolean;
  readonly specialRequests?: readonly string[];
  readonly notes?: string;
  readonly internalComments?: string;
  readonly status?: ReservationLifecycleStatus;
};

export type ModifyReservationInput = {
  readonly arrival?: string;
  readonly departure?: string;
  readonly inventoryItemId?: string;
  readonly accommodationTypeId?: string;
  readonly guestCount?: GuestCount;
  readonly rate?: number;
  readonly status?: ReservationLifecycleStatus;
  readonly paymentStatus?: PaymentStatus;
  readonly notes?: string;
  readonly internalComments?: string;
  readonly specialRequests?: readonly string[];
};

export type AvailabilityQuery = {
  readonly propertyId: string;
  readonly arrival: string;
  readonly departure: string;
  readonly accommodationTypeId?: string;
  readonly guestCount?: GuestCount;
};

export type AvailabilityResult = {
  readonly propertyId: string;
  readonly arrival: string;
  readonly departure: string;
  readonly availableUnits: readonly {
    inventoryItemId: string;
    label: string;
    accommodationTypeId: string;
    accommodationTypeName: string;
    rate: number;
  }[];
  readonly unavailableCount: number;
};

export type ConflictResult = {
  readonly hasConflict: boolean;
  readonly conflicts: readonly {
    reservationId: string;
    reservationNumber: string;
    inventoryItemId?: string;
    arrival: string;
    departure: string;
    severity: "blocking" | "overbooking";
  }[];
};

export type CalendarEntry = {
  readonly reservationId: string;
  readonly reservationNumber: string;
  readonly guestName: string;
  readonly propertyId: string;
  readonly propertyName: string;
  readonly inventoryLabel?: string;
  readonly accommodationType: string;
  readonly arrival: string;
  readonly departure: string;
  readonly status: ReservationLifecycleStatus;
  readonly source: BookingSource;
  readonly isVip: boolean;
};

export type ReservationCalendarView = {
  readonly mode: CalendarViewMode;
  readonly startDate: string;
  readonly endDate: string;
  readonly entries: readonly CalendarEntry[];
  readonly summary: {
    readonly arrivals: number;
    readonly departures: number;
    readonly inHouse: number;
    readonly vipArrivals: number;
  };
};

export type ReservationBriefSignals = {
  readonly todaysArrivals: number;
  readonly todaysDepartures: number;
  readonly occupancyForecast: string;
  readonly bookingPace: string;
  readonly vipArrivals: number;
  readonly criticalOverbookings: readonly string[];
  readonly reservationTrend: string;
};

export type ReservationAction =
  | "check_in"
  | "check_out"
  | "cancel"
  | "reinstate"
  | "extend"
  | "shorten"
  | "upgrade"
  | "downgrade"
  | "transfer"
  | "archive";

export type PublishReservationEngineEventInput = {
  readonly eventType: "ReservationCreated" | "ReservationModified" | "ReservationCancelled" | "ReservationCheckedIn";
  readonly reservationId: string;
  readonly actorId: string;
  readonly actorName?: string;
  readonly payload?: Record<string, unknown>;
};
