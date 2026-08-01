import type {
  Building,
  Folio,
  GuestProfile,
  HousekeepingTask,
  MaintenanceRequest,
  OperationsSnapshot,
  Reservation,
  Room,
  RoomType,
  HospitalityProperty,
} from "@/types/hospitality";

/** Hospitality data access contract (Mission P-007). */
export type HospitalityRepository = {
  getProperty(propertyId: string): HospitalityProperty | null;
  listProperties(organizationId: string): HospitalityProperty[];
  listBuildings(propertyId: string): Building[];
  listRoomTypes(propertyId: string): RoomType[];
  listRooms(propertyId: string): Room[];
  getRoom(id: string): Room | null;
  listGuests(organizationId: string): GuestProfile[];
  getGuest(id: string): GuestProfile | null;
  listReservations(organizationId: string, propertyId?: string): Reservation[];
  getReservation(id: string): Reservation | null;
  updateReservation(id: string, patch: Partial<Reservation>): Reservation | null;
  createReservation(reservation: Reservation): Reservation;
  listHousekeepingTasks(propertyId: string): HousekeepingTask[];
  listMaintenanceRequests(propertyId: string): MaintenanceRequest[];
  listFolios(organizationId: string): Folio[];
  getFolio(id: string): Folio | null;
  getOperationsSnapshot(propertyId: string): OperationsSnapshot;
};
