import type {
  CreateReservationInput,
  ModifyReservationInput,
  ReservationRecord,
  ReservationSearchFilter,
} from "@/types/hospitality-reservation";
import type { Reservation } from "@/types/hospitality";
import type { InventoryRepository } from "@/lib/hospitality/repositories/InventoryRepository";

/** Reservation engine data access contract (Mission P-007.2). */
export type ReservationRepository = InventoryRepository & {
  listReservationRecords(organizationId: string, propertyId?: string): ReservationRecord[];
  getReservationRecord(id: string): ReservationRecord | null;
  getReservationByNumber(organizationId: string, reservationNumber: string): ReservationRecord | null;
  searchReservationRecords(filter: ReservationSearchFilter, organizationId: string): ReservationRecord[];
  createReservationRecord(record: ReservationRecord): ReservationRecord;
  updateReservationRecord(id: string, patch: Partial<ReservationRecord>): ReservationRecord | null;
  /** Legacy compatibility — maps to/from ReservationRecord internally. */
  listReservations(organizationId: string, propertyId?: string): Reservation[];
  getReservation(id: string): Reservation | null;
  updateReservation(id: string, patch: Partial<Reservation>): Reservation | null;
  createReservation(reservation: Reservation): Reservation;
};
