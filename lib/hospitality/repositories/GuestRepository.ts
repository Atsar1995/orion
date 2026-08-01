import type {
  CreateGuestInput,
  GuestRecord,
  GuestSearchFilter,
  GuestTimelineEntry,
  ModifyGuestInput,
} from "@/types/hospitality-guest";
import type { GuestProfile } from "@/types/hospitality";
import type { ReservationRepository } from "@/lib/hospitality/repositories/ReservationRepository";

/** Guest intelligence data access contract (Mission P-007.3). */
export type GuestRepository = ReservationRepository & {
  listGuestRecords(organizationId: string): GuestRecord[];
  getGuestRecord(id: string): GuestRecord | null;
  searchGuestRecords(filter: GuestSearchFilter, organizationId: string): GuestRecord[];
  createGuestRecord(record: GuestRecord): GuestRecord;
  updateGuestRecord(id: string, patch: Partial<GuestRecord>): GuestRecord | null;
  deleteGuestRecord(id: string): boolean;
  listGuestTimeline(guestId: string): GuestTimelineEntry[];
  addGuestTimelineEntry(entry: GuestTimelineEntry): GuestTimelineEntry;
  /** Legacy compatibility — maps to/from GuestRecord internally. */
  listGuests(organizationId: string): GuestProfile[];
  getGuest(id: string): GuestProfile | null;
};

export type { CreateGuestInput, ModifyGuestInput, GuestSearchFilter };
