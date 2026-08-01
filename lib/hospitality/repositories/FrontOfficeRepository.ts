import type { StayRecord } from "@/types/hospitality-front-office";
import type { GuestRepository } from "@/lib/hospitality/repositories/GuestRepository";

/** Front office data access contract (Mission P-007.4). */
export type FrontOfficeRepository = GuestRepository & {
  listStayRecords(organizationId: string, propertyId?: string): StayRecord[];
  getStayRecord(id: string): StayRecord | null;
  getStayByReservationId(reservationId: string): StayRecord | null;
  createStayRecord(record: StayRecord): StayRecord;
  updateStayRecord(id: string, patch: Partial<StayRecord>): StayRecord | null;
};
