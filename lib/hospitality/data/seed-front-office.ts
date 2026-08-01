import { randomUUID } from "crypto";
import type { ReservationRecord } from "@/types/hospitality-reservation";
import type { StayRecord, StayStatus } from "@/types/hospitality-front-office";

const NOW = "2026-07-30T09:00:00.000Z";

function mapReservationStatus(status: ReservationRecord["status"]): StayStatus {
  const map: Partial<Record<ReservationRecord["status"], StayStatus>> = {
    confirmed: "expected",
    modified: "expected",
    provisional: "expected",
    quote: "expected",
    inquiry: "expected",
    checked_in: "checked_in",
    checked_out: "checked_out",
    cancelled: "cancelled",
    no_show: "no_show",
    archived: "checked_out",
  };
  return map[status] ?? "expected";
}

export function buildStayFromReservation(record: ReservationRecord): StayRecord {
  const status = mapReservationStatus(record.status);
  return {
    id: `stay-${record.id}`,
    organizationId: record.organizationId,
    propertyId: record.propertyId,
    reservationId: record.id,
    reservationNumber: record.reservationNumber,
    guestId: record.guestId,
    inventoryItemId: record.inventoryItemId,
    accommodationTypeId: record.accommodationTypeId,
    status,
    arrival: record.arrival,
    departure: record.departure,
    expectedArrivalTime:
      record.isVip ? "14:00" : record.specialRequests.some((entry) => entry.toLowerCase().includes("early")) ? "12:00" : "15:00",
    actualCheckInAt: status === "checked_in" || status === "checked_out" ? record.updatedAt : undefined,
    actualCheckOutAt: status === "checked_out" ? record.updatedAt : undefined,
    isVip: record.isVip,
    isGroup: Boolean(record.groupName),
    groupName: record.groupName,
    earlyCheckInRequested: record.specialRequests.some((entry) => entry.toLowerCase().includes("early")),
    registration:
      status === "checked_in" || status === "checked_out"
        ? {
            id: `reg-${record.id}`,
            guestId: record.guestId,
            stayId: `stay-${record.id}`,
            signedAt: record.updatedAt,
            signatureCaptured: true,
            identityVerified: true,
            depositCollected: record.paymentStatus !== "pending",
            depositAmount: record.paymentStatus === "deposit_paid" ? Math.round(record.rate * 0.3) : undefined,
            keyIssued: true,
          }
        : undefined,
    movements: [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function buildStaySeed(reservations: ReservationRecord[]): StayRecord[] {
  return reservations.map(buildStayFromReservation);
}

/** Walk-in stay seed for demo queue diversity. */
export function buildWalkInStay(organizationId: string, propertyId: string): StayRecord {
  const reservationId = "res-walkin-demo";
  return {
    id: `stay-${reservationId}`,
    organizationId,
    propertyId,
    reservationId,
    reservationNumber: "ORH-2026-WALK",
    guestId: "guest-nair",
    accommodationTypeId: "acc-rt-standard",
    status: "expected",
    arrival: "2026-07-30",
    departure: "2026-07-31",
    expectedArrivalTime: "16:30",
    isVip: false,
    isGroup: false,
    earlyCheckInRequested: false,
    movements: [],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export { randomUUID };
