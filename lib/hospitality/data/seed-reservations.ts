import { DEFAULT_PROPERTY_ID } from "@/lib/hospitality/constants";
import { SECOND_PROPERTY_ID } from "@/lib/hospitality/data/seed-inventory";
import { SEED_RESERVATIONS } from "@/lib/hospitality/data/seed-hospitality";
import type {
  Allocation,
  BookingSource,
  ReservationLifecycleStatus,
  ReservationRecord,
} from "@/types/hospitality-reservation";
import type { Reservation, ReservationChannel } from "@/types/hospitality";

const ORG_ID = "org-orania";
const NOW = "2026-07-30T09:00:00.000Z";

const ROOM_TO_INVENTORY: Record<string, string> = {
  "room-101": "inv-room-101",
  "room-112": "inv-room-112",
  "room-118": "inv-room-118",
  "room-204": "inv-room-204",
  "room-207": "inv-room-207",
  "room-305": "inv-room-305",
  "room-401": "inv-room-401",
  "room-v01": "inv-villa-v01",
};

const ROOM_TYPE_TO_ACCOMMODATION: Record<string, string> = {
  "rt-standard": "acc-rt-standard",
  "rt-deluxe": "acc-rt-deluxe",
  "rt-suite": "acc-rt-suite",
  "rt-villa": "acc-rt-villa",
};

function mapChannel(channel: ReservationChannel): BookingSource {
  const map: Record<ReservationChannel, BookingSource> = {
    direct: "direct_website",
    website: "direct_website",
    ota: "ota",
    corporate: "corporate",
    group: "group",
    walk_in: "walk_in",
    travel_agent: "travel_agent",
  };
  return map[channel];
}

function mapStatus(status: Reservation["status"]): ReservationLifecycleStatus {
  const map: Record<Reservation["status"], ReservationLifecycleStatus> = {
    confirmed: "confirmed",
    checked_in: "checked_in",
    checked_out: "checked_out",
    cancelled: "cancelled",
    waitlisted: "provisional",
    no_show: "no_show",
  };
  return map[status];
}

function nightsBetween(arrival: string, departure: string): number {
  const start = new Date(arrival.slice(0, 10));
  const end = new Date(departure.slice(0, 10));
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
}

function toReservationRecord(reservation: Reservation, index: number): ReservationRecord {
  const arrival = reservation.checkIn.slice(0, 10);
  const departure = reservation.checkOut.slice(0, 10);
  const accommodationTypeId = ROOM_TYPE_TO_ACCOMMODATION[reservation.roomTypeId] ?? reservation.roomTypeId;
  const inventoryItemId = reservation.roomId ? ROOM_TO_INVENTORY[reservation.roomId] : undefined;

  const allocation: Allocation = {
    id: `alloc-${reservation.id}`,
    reservationId: reservation.id,
    inventoryItemId,
    accommodationTypeId,
    arrival,
    departure,
    status:
      reservation.status === "checked_in"
        ? "checked_in"
        : reservation.status === "checked_out"
          ? "checked_out"
          : inventoryItemId
            ? "assigned"
            : "pending",
  };

  return {
    id: reservation.id,
    reservationNumber: `ORH-2026-${String(index + 1).padStart(4, "0")}`,
    organizationId: reservation.organizationId,
    propertyId: reservation.propertyId,
    guestId: reservation.guestId,
    inventoryItemId,
    accommodationTypeId,
    source: mapChannel(reservation.channel),
    status: mapStatus(reservation.status),
    arrival,
    departure,
    lengthOfStay: nightsBetween(arrival, departure),
    guestCount: { adults: reservation.adults, children: reservation.children, infants: 0 },
    ratePlan: {
      id: `rp-${accommodationTypeId}`,
      name: "Best Available Rate",
      baseRate: reservation.rate,
    },
    marketSegment: reservation.corporateAccount ? "corporate" : reservation.groupName ? "group" : "leisure",
    paymentStatus: reservation.status === "checked_out" ? "paid" : "deposit_paid",
    rate: reservation.rate,
    groupName: reservation.groupName,
    corporateAccount: reservation.corporateAccount,
    agentName: reservation.channel === "travel_agent" ? "Global Travel Partners" : undefined,
    isVip: reservation.isVip,
    specialRequests: [],
    notes: reservation.notes,
    internalComments: reservation.id === "res-003" ? "AC maintenance — room move may be required" : undefined,
    allocations: [allocation],
    createdAt: reservation.createdAt,
    updatedAt: reservation.createdAt,
  };
}

export const SEED_RESERVATION_RECORDS: ReservationRecord[] = SEED_RESERVATIONS.map(toReservationRecord);

/** Additional engine seed reservations for calendar diversity. */
export const SEED_EXTRA_RESERVATIONS: ReservationRecord[] = [
  {
    id: "res-008",
    reservationNumber: "ORH-2026-0008",
    organizationId: ORG_ID,
    propertyId: SECOND_PROPERTY_ID,
    guestId: "guest-sharma",
    inventoryItemId: "inv-hs-01",
    accommodationTypeId: "acc-homestay-room",
    source: "ota",
    status: "confirmed",
    arrival: "2026-07-31",
    departure: "2026-08-02",
    lengthOfStay: 2,
    guestCount: { adults: 2, children: 0, infants: 0 },
    ratePlan: { id: "rp-acc-homestay-room", name: "OTA Flexible", baseRate: 2800 },
    marketSegment: "leisure",
    paymentStatus: "paid",
    rate: 2800,
    isVip: false,
    specialRequests: ["Late arrival"],
    allocations: [
      {
        id: "alloc-res-008",
        reservationId: "res-008",
        inventoryItemId: "inv-hs-01",
        accommodationTypeId: "acc-homestay-room",
        arrival: "2026-07-31",
        departure: "2026-08-02",
        status: "assigned",
      },
    ],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "res-009",
    reservationNumber: "ORH-2026-0009",
    organizationId: ORG_ID,
    propertyId: DEFAULT_PROPERTY_ID,
    guestId: "guest-wilson",
    accommodationTypeId: "acc-rt-suite",
    source: "telephone",
    status: "quote",
    arrival: "2026-08-10",
    departure: "2026-08-14",
    lengthOfStay: 4,
    guestCount: { adults: 2, children: 1, infants: 0 },
    ratePlan: { id: "rp-acc-rt-suite", name: "Suite Package", baseRate: 11500 },
    packageName: "Heritage Experience",
    marketSegment: "leisure",
    paymentStatus: "pending",
    rate: 11500,
    isVip: true,
    specialRequests: ["Airport transfer"],
    notes: "Quote sent — awaiting deposit",
    allocations: [
      {
        id: "alloc-res-009",
        reservationId: "res-009",
        accommodationTypeId: "acc-rt-suite",
        arrival: "2026-08-10",
        departure: "2026-08-14",
        status: "pending",
      },
    ],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function buildReservationSeed(): ReservationRecord[] {
  return [...SEED_RESERVATION_RECORDS, ...SEED_EXTRA_RESERVATIONS];
}

export { ROOM_TO_INVENTORY, ROOM_TYPE_TO_ACCOMMODATION };
