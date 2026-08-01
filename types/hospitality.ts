/**
 * ORION Hospitality Workspace — domain types (Mission P-007).
 */

export type HospitalityPropertyType =
  | "hotel"
  | "resort"
  | "guest_house"
  | "homestay"
  | "serviced_apartment"
  | "boutique"
  | "villa";

export type RoomStatus =
  | "available"
  | "occupied"
  | "dirty"
  | "clean"
  | "inspecting"
  | "out_of_service"
  | "maintenance";

export type ReservationStatus =
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "waitlisted"
  | "no_show";

export type ReservationChannel =
  | "direct"
  | "website"
  | "ota"
  | "corporate"
  | "group"
  | "walk_in"
  | "travel_agent";

export type LoyaltyTier = "standard" | "silver" | "gold" | "platinum" | "vip";

export type HousekeepingTaskStatus = "pending" | "in_progress" | "completed" | "inspected";

export type FolioStatus = "open" | "settled" | "refunded";

export type HospitalityProperty = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly slug: string;
  readonly type: HospitalityPropertyType;
  readonly address: string;
  readonly timeZone: string;
  readonly totalRooms: number;
  readonly portfolioId?: string;
  readonly operationalStatus?: "active" | "inactive" | "renovation" | "archived";
  readonly city?: string;
  readonly region?: string;
  readonly country?: string;
};

export type Building = {
  readonly id: string;
  readonly propertyId: string;
  readonly name: string;
  readonly wings: readonly Wing[];
};

export type Wing = {
  readonly id: string;
  readonly buildingId: string;
  readonly name: string;
  readonly floors: readonly Floor[];
};

export type Floor = {
  readonly id: string;
  readonly wingId: string;
  readonly level: number;
  readonly label: string;
};

export type RoomType = {
  readonly id: string;
  readonly propertyId: string;
  readonly name: string;
  readonly category: "standard" | "deluxe" | "suite" | "villa";
  readonly baseRate: number;
  readonly maxOccupancy: number;
  readonly amenities: readonly string[];
};

export type Room = {
  readonly id: string;
  readonly propertyId: string;
  readonly floorId: string;
  readonly roomTypeId: string;
  readonly number: string;
  readonly status: RoomStatus;
  readonly isVip: boolean;
};

export type GuestProfile = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly nationality: string;
  readonly loyaltyTier: LoyaltyTier;
  readonly preferences: readonly string[];
  readonly specialRequests: readonly string[];
  readonly stayCount: number;
  readonly totalSpend: number;
  readonly documents: readonly { type: string; reference: string }[];
};

export type Reservation = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly guestId: string;
  readonly roomId?: string;
  readonly roomTypeId: string;
  readonly channel: ReservationChannel;
  readonly status: ReservationStatus;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly adults: number;
  readonly children: number;
  readonly rate: number;
  readonly groupName?: string;
  readonly corporateAccount?: string;
  readonly isVip: boolean;
  readonly notes?: string;
  readonly createdAt: string;
};

export type HousekeepingTask = {
  readonly id: string;
  readonly propertyId: string;
  readonly roomId: string;
  readonly status: HousekeepingTaskStatus;
  readonly assignedTo?: string;
  readonly priority: "normal" | "high" | "urgent";
  readonly notes?: string;
  readonly createdAt: string;
  readonly completedAt?: string;
};

export type MaintenanceRequest = {
  readonly id: string;
  readonly propertyId: string;
  readonly roomId: string;
  readonly title: string;
  readonly description: string;
  readonly priority: "low" | "medium" | "high" | "critical";
  readonly status: "open" | "in_progress" | "resolved";
  readonly reportedAt: string;
};

export type FolioCharge = {
  readonly id: string;
  readonly folioId: string;
  readonly description: string;
  readonly amount: number;
  readonly taxRate: number;
  readonly category: "room" | "f_and_b" | "spa" | "misc" | "discount" | "refund";
  readonly postedAt: string;
};

export type Folio = {
  readonly id: string;
  readonly reservationId: string;
  readonly guestId: string;
  readonly status: FolioStatus;
  readonly charges: readonly FolioCharge[];
  readonly payments: readonly { id: string; amount: number; method: string; postedAt: string }[];
};

export type OperationsSnapshot = {
  readonly occupancyPercent: number;
  readonly adr: number;
  readonly revpar: number;
  readonly dailyRevenue: number;
  readonly monthlyRevenue: number;
  readonly arrivalsToday: number;
  readonly departuresToday: number;
  readonly inHouseGuests: number;
  readonly vipArrivals: number;
  readonly roomsReady: number;
  readonly roomsCleaning: number;
  readonly maintenanceOpen: number;
};

export type PublishReservationEventInput = {
  readonly reservationId: string;
  readonly eventType: "ReservationCreated" | "DecisionUpdated";
  readonly actorId: string;
  readonly actorName?: string;
};
