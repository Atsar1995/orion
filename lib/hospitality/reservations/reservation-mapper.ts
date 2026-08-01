import type { Reservation, ReservationChannel, ReservationStatus } from "@/types/hospitality";
import type { BookingSource, ReservationLifecycleStatus, ReservationRecord } from "@/types/hospitality-reservation";

const INVENTORY_TO_ROOM: Record<string, string> = {
  "inv-room-101": "room-101",
  "inv-room-112": "room-112",
  "inv-room-118": "room-118",
  "inv-room-204": "room-204",
  "inv-room-207": "room-207",
  "inv-room-305": "room-305",
  "inv-room-401": "room-401",
  "inv-villa-v01": "room-v01",
};

const ACCOMMODATION_TO_ROOM_TYPE: Record<string, string> = {
  "acc-rt-standard": "rt-standard",
  "acc-rt-deluxe": "rt-deluxe",
  "acc-rt-suite": "rt-suite",
  "acc-rt-villa": "rt-villa",
  "acc-homestay-room": "rt-standard",
  "acc-houseboat": "rt-deluxe",
};

function mapSourceToChannel(source: BookingSource): ReservationChannel {
  const map: Partial<Record<BookingSource, ReservationChannel>> = {
    direct_website: "website",
    walk_in: "walk_in",
    telephone: "direct",
    email: "direct",
    travel_agent: "travel_agent",
    corporate: "corporate",
    ota: "ota",
    channel_manager: "ota",
    group: "group",
  };
  return map[source] ?? "direct";
}

function mapLifecycleToLegacy(status: ReservationLifecycleStatus): ReservationStatus {
  const map: Partial<Record<ReservationLifecycleStatus, ReservationStatus>> = {
    inquiry: "confirmed",
    quote: "confirmed",
    provisional: "waitlisted",
    confirmed: "confirmed",
    modified: "confirmed",
    checked_in: "checked_in",
    checked_out: "checked_out",
    cancelled: "cancelled",
    no_show: "no_show",
    archived: "checked_out",
  };
  return map[status] ?? "confirmed";
}

/** Maps canonical ReservationRecord to legacy Reservation for backward compatibility. */
export function toLegacyReservation(record: ReservationRecord): Reservation {
  return {
    id: record.id,
    organizationId: record.organizationId,
    propertyId: record.propertyId,
    guestId: record.guestId,
    roomId: record.inventoryItemId ? INVENTORY_TO_ROOM[record.inventoryItemId] : undefined,
    roomTypeId: ACCOMMODATION_TO_ROOM_TYPE[record.accommodationTypeId] ?? record.accommodationTypeId,
    channel: mapSourceToChannel(record.source),
    status: mapLifecycleToLegacy(record.status),
    checkIn: record.arrival,
    checkOut: record.departure,
    adults: record.guestCount.adults,
    children: record.guestCount.children,
    rate: record.rate,
    groupName: record.groupName,
    corporateAccount: record.corporateAccount,
    isVip: record.isVip,
    notes: record.notes,
    createdAt: record.createdAt,
  };
}

export function inventoryToLegacyRoomId(inventoryItemId?: string): string | undefined {
  return inventoryItemId ? INVENTORY_TO_ROOM[inventoryItemId] : undefined;
}

export function accommodationToLegacyRoomTypeId(accommodationTypeId: string): string {
  return ACCOMMODATION_TO_ROOM_TYPE[accommodationTypeId] ?? accommodationTypeId;
}
