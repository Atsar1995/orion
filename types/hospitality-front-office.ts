/**
 * ORION Hospitality — Front Office Operations Platform (Mission P-007.4).
 * Stay is the primary operational entity — reservations create stays; front office manages stays.
 */

export type StayStatus = "expected" | "checked_in" | "checked_out" | "no_show" | "cancelled";

export type OccupancyBucket =
  | "vacant_clean"
  | "vacant_dirty"
  | "occupied"
  | "out_of_order"
  | "out_of_service"
  | "inspecting";

export type GuestMovementType = "room_move" | "upgrade" | "downgrade" | "extension" | "shortening";

export type RegistrationRecord = {
  readonly id: string;
  readonly guestId: string;
  readonly stayId: string;
  readonly signedAt?: string;
  readonly signatureCaptured: boolean;
  readonly identityVerified: boolean;
  readonly welcomeNotes?: string;
  readonly depositCollected: boolean;
  readonly depositAmount?: number;
  readonly keyIssued: boolean;
};

export type GuestMovement = {
  readonly id: string;
  readonly stayId: string;
  readonly type: GuestMovementType;
  readonly fromInventoryItemId?: string;
  readonly toInventoryItemId?: string;
  readonly reason?: string;
  readonly occurredAt: string;
  readonly actorName?: string;
};

export type ArrivalEvent = {
  readonly stayId: string;
  readonly reservationId: string;
  readonly guestId: string;
  readonly expectedArrivalTime?: string;
  readonly actualArrivalTime?: string;
  readonly isVip: boolean;
  readonly isGroup: boolean;
  readonly earlyCheckInRequested: boolean;
};

export type DepartureEvent = {
  readonly stayId: string;
  readonly reservationId: string;
  readonly guestId: string;
  readonly scheduledDeparture: string;
  readonly actualDepartureTime?: string;
  readonly expressCheckout: boolean;
  readonly outstandingBalance: number;
};

/** Primary operational entity for hospitality. */
export type StayRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly reservationId: string;
  readonly reservationNumber: string;
  readonly guestId: string;
  readonly inventoryItemId?: string;
  readonly accommodationTypeId: string;
  readonly status: StayStatus;
  readonly arrival: string;
  readonly departure: string;
  readonly expectedArrivalTime?: string;
  readonly actualCheckInAt?: string;
  readonly actualCheckOutAt?: string;
  readonly isVip: boolean;
  readonly isGroup: boolean;
  readonly groupName?: string;
  readonly earlyCheckInRequested: boolean;
  readonly registration?: RegistrationRecord;
  readonly movements: readonly GuestMovement[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CheckInInput = {
  readonly stayId: string;
  readonly inventoryItemId?: string;
  readonly identityVerified?: boolean;
  readonly signatureCaptured?: boolean;
  readonly welcomeNotes?: string;
  readonly depositCollected?: boolean;
  readonly depositAmount?: number;
  readonly keyIssued?: boolean;
};

export type CheckOutInput = {
  readonly stayId: string;
  readonly expressCheckout?: boolean;
  readonly feedbackCollected?: boolean;
  readonly keyReturned?: boolean;
};

export type AssignRoomInput = {
  readonly stayId: string;
  readonly inventoryItemId: string;
};

export type StayMovementInput = {
  readonly stayId: string;
  readonly type: GuestMovementType;
  readonly toInventoryItemId?: string;
  readonly newDeparture?: string;
  readonly reason?: string;
};

export type FrontOfficeBriefSignals = {
  readonly currentOccupancy: number;
  readonly vipInHouse: number;
  readonly operationalDelays: readonly string[];
  readonly earlyArrivals: number;
  readonly lateDepartures: number;
  readonly unassignedArrivals: number;
  readonly roomsNotReady: number;
};

export type PublishFrontOfficeEventInput = {
  readonly eventType:
    | "StayCheckedIn"
    | "StayCheckedOut"
    | "RoomAssigned"
    | "GuestMoved"
    | "LateDeparture"
    | "EarlyArrival";
  readonly stayId: string;
  readonly reservationId: string;
  readonly actorId: string;
  readonly actorName?: string;
  readonly payload?: Record<string, unknown>;
};
