import { DEFAULT_PROPERTY_ID } from "@/lib/hospitality/constants";
import { HospitalityAnalyticsFacade } from "@/lib/hospitality/analytics";
import { HospitalityBillingFacade } from "@/lib/hospitality/billing";
import { HospitalityFrontOfficeFacade } from "@/lib/hospitality/front-office";
import { HospitalityHousekeepingFacade } from "@/lib/hospitality/housekeeping";
import { HospitalityGuestFacade } from "@/lib/hospitality/guests";
import { HospitalityReservationFacade } from "@/lib/hospitality/reservations";
import { buildStayFromReservation } from "@/lib/hospitality/data/seed-front-office";
import { ROOM_TYPE_TO_ACCOMMODATION } from "@/lib/hospitality/data/seed-reservations";
import type { BillingRepository } from "@/lib/hospitality/repositories/BillingRepository";
import { defaultInventoryRepository } from "@/lib/hospitality/repositories/InMemoryInventoryRepository";
import { mapHospitalityDashboard } from "@/lib/hospitality/mappers/dashboard";
import { mapHospitalityBriefContribution, mapHospitalityIntelligence } from "@/lib/hospitality/mappers/intelligence";
import type {
  BillingListItem,
  GuestListItem,
  HospitalityBriefContribution,
  HospitalityDashboardView,
  HospitalityIntelligenceResult,
  HousekeepingBoardItem,
  ReservationListItem,
  RoomListItem,
} from "@/lib/hospitality/models/dashboard";
import type { BookingSource, CreateReservationInput } from "@/types/hospitality-reservation";
import type { Reservation, ReservationChannel } from "@/types/hospitality";
import type { ServiceContext } from "@/types/services";

export type HospitalityServiceContext = ServiceContext;

function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

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

/** Hospitality workspace facade — delegates to reservation, guest, and front office engines. */
export class HospitalityService {
  private readonly reservationEngine: HospitalityReservationFacade;
  private readonly guestEngine: HospitalityGuestFacade;
  private readonly frontOfficeEngine: HospitalityFrontOfficeFacade;
  private readonly housekeepingEngine: HospitalityHousekeepingFacade;
  private readonly billingEngine: HospitalityBillingFacade;
  private readonly analyticsEngine: HospitalityAnalyticsFacade;

  constructor(private readonly repository: BillingRepository = defaultInventoryRepository) {
    this.reservationEngine = new HospitalityReservationFacade(repository);
    this.guestEngine = new HospitalityGuestFacade(repository);
    this.frontOfficeEngine = new HospitalityFrontOfficeFacade(repository);
    this.housekeepingEngine = new HospitalityHousekeepingFacade(repository);
    this.billingEngine = new HospitalityBillingFacade(repository);
    this.analyticsEngine = new HospitalityAnalyticsFacade(repository);
  }

  getDashboard(context: HospitalityServiceContext): HospitalityDashboardView {
    return mapHospitalityDashboard(this.repository, context.organizationId, DEFAULT_PROPERTY_ID);
  }

  getIntelligence(context: HospitalityServiceContext): HospitalityIntelligenceResult {
    return mapHospitalityIntelligence(this.repository, context.organizationId, DEFAULT_PROPERTY_ID);
  }

  getBriefContribution(context?: HospitalityServiceContext): HospitalityBriefContribution {
    const orgId = context?.organizationId ?? "org-orania";
    return mapHospitalityBriefContribution(this.repository, orgId, DEFAULT_PROPERTY_ID);
  }

  listReservations(context: HospitalityServiceContext): ReservationListItem[] {
    return this.reservationEngine.reservations.list(context).map((item) => ({
      id: item.id,
      guestName: item.guestName,
      roomNumber: item.inventoryLabel,
      roomType: item.accommodationType,
      channel: item.source,
      status: item.status,
      checkIn: item.arrival,
      checkOut: item.departure,
      rate: item.rate,
      isVip: item.isVip,
    }));
  }

  getReservation(id: string, context: HospitalityServiceContext) {
    const detail = this.reservationEngine.reservations.getDetail(id, context);
    if (!detail) return null;
    const { record } = detail;
    const guest = this.repository.getGuest(record.guestId);
    const inventory = record.inventoryItemId
      ? this.repository.getInventoryItem(record.inventoryItemId)
      : null;
    const accommodationType = this.repository.getAccommodationType(record.accommodationTypeId);
    const legacyReservation = this.repository.getReservation(id);
    return {
      reservation: legacyReservation,
      guest,
      room: inventory
        ? {
            id: inventory.id,
            propertyId: inventory.propertyId,
            floorId: inventory.floorId ?? "",
            roomTypeId: record.accommodationTypeId,
            number: inventory.label,
            status: inventory.status,
            isVip: inventory.isVip,
          }
        : null,
      roomType: accommodationType
        ? {
            id: accommodationType.id,
            propertyId: accommodationType.propertyId,
            name: accommodationType.name,
            category:
              accommodationType.category === "unique" || accommodationType.category === "premium"
                ? "suite"
                : accommodationType.category,
            baseRate: accommodationType.baseRate,
            maxOccupancy: accommodationType.maxOccupancy,
            amenities: [],
          }
        : null,
      engine: detail,
    };
  }

  listGuests(context: HospitalityServiceContext): GuestListItem[] {
    return this.guestEngine.guests.list(context).map((guest) => ({
      id: guest.id,
      name: guest.fullName,
      email: guest.email ?? "",
      loyaltyTier: guest.loyaltyTier,
      stayCount: guest.stayCount,
      totalSpend: guest.totalSpend,
      isVip: guest.isVip,
    }));
  }

  getGuest(id: string, context: HospitalityServiceContext) {
    const detail = this.guestEngine.guests.getDetail(id, context);
    if (!detail) return null;
    return {
      guest: this.repository.getGuest(id)!,
      record: detail.record,
      stays: detail.stayHistory.map((stay) => ({
        id: stay.reservationId,
        arrival: stay.arrival,
        departure: stay.departure,
        status: stay.status,
      })),
      timeline: detail.timeline,
      analytics: detail.analytics,
      duplicateCandidates: detail.duplicateCandidates,
    };
  }

  getGuestEngine() {
    return this.guestEngine;
  }

  listRooms(_context: HospitalityServiceContext): RoomListItem[] {
    const roomTypes = this.repository.listRoomTypes(DEFAULT_PROPERTY_ID);
    const buildings = this.repository.listBuildings(DEFAULT_PROPERTY_ID);
    const floorLabel = (floorId: string) => {
      for (const building of buildings) {
        for (const wing of building.wings) {
          const floor = wing.floors.find((entry) => entry.id === floorId);
          if (floor) return `${building.name} · ${floor.label}`;
        }
      }
      return "Unknown";
    };

    return this.repository.listRooms(DEFAULT_PROPERTY_ID).map((room) => ({
      id: room.id,
      number: room.number,
      roomType: roomTypes.find((entry) => entry.id === room.roomTypeId)?.name ?? "Unknown",
      status: room.status.replaceAll("_", " "),
      floor: floorLabel(room.floorId),
      isVip: room.isVip,
    }));
  }

  getPropertyStructure(context: HospitalityServiceContext) {
    const property = this.repository.getProperty(DEFAULT_PROPERTY_ID);
    if (!property || property.organizationId !== context.organizationId) return null;
    return {
      property,
      buildings: this.repository.listBuildings(DEFAULT_PROPERTY_ID),
      roomTypes: this.repository.listRoomTypes(DEFAULT_PROPERTY_ID),
      rooms: this.repository.listRooms(DEFAULT_PROPERTY_ID),
    };
  }

  getHousekeepingBoard(context: HospitalityServiceContext) {
    const dashboard = this.housekeepingEngine.board.getDashboard(context, DEFAULT_PROPERTY_ID);
    return dashboard.board.map((item) => ({
      roomNumber: item.roomNumber,
      status: item.extendedStatus,
      taskStatus: item.taskStatus,
      assignedTo: item.assignedTo,
      priority: item.priority,
    }));
  }

  listMaintenance(context: HospitalityServiceContext) {
    return this.housekeepingEngine.maintenance.getDashboard(context, DEFAULT_PROPERTY_ID).workOrders;
  }

  getHousekeepingEngine() {
    return this.housekeepingEngine;
  }

  listBilling(context: HospitalityServiceContext): BillingListItem[] {
    return this.billingEngine.folios.list(context, DEFAULT_PROPERTY_ID).map((item) => ({
      folioId: item.folioId,
      guestName: item.guestName,
      reservationId: item.reservationId,
      status: item.status,
      balance: item.balance,
      charges: item.charges,
    }));
  }

  getBillingEngine() {
    return this.billingEngine;
  }

  getAnalytics(context: HospitalityServiceContext) {
    return this.analyticsEngine.getFullAnalytics(context, DEFAULT_PROPERTY_ID);
  }

  getAnalyticsEngine() {
    return this.analyticsEngine;
  }

  getOperations(_context: HospitalityServiceContext) {
    return this.repository.getOperationsSnapshot(DEFAULT_PROPERTY_ID);
  }

  checkIn(stayId: string, context: HospitalityServiceContext, actorName: string) {
    const stay = this.repository.getStayRecord(stayId) ?? this.repository.getStayByReservationId(stayId);
    if (!stay) throw new Error("STAY_NOT_FOUND");
    return this.frontOfficeEngine.checkIn.execute({ stayId: stay.id }, context, actorName);
  }

  checkOut(stayId: string, context: HospitalityServiceContext, actorName: string) {
    const stay = this.repository.getStayRecord(stayId) ?? this.repository.getStayByReservationId(stayId);
    if (!stay) throw new Error("STAY_NOT_FOUND");
    return this.frontOfficeEngine.checkOut.execute({ stayId: stay.id, expressCheckout: true }, context, actorName);
  }

  assignRoom(stayOrReservationId: string, roomId: string, context: HospitalityServiceContext, actorName: string) {
    const stay =
      this.repository.getStayRecord(stayOrReservationId) ??
      this.repository.getStayByReservationId(stayOrReservationId);
    if (!stay) throw new Error("STAY_NOT_FOUND");
    const legacyRoom = this.repository.getRoom(roomId);
    if (!legacyRoom) throw new Error("INVENTORY_NOT_FOUND");
    const inventoryItem = this.repository
      .listInventoryItems(legacyRoom.propertyId)
      .find((item) => item.label === legacyRoom.number);
    if (!inventoryItem) throw new Error("INVENTORY_NOT_FOUND");
    return this.frontOfficeEngine.assignment.assignRoom(
      { stayId: stay.id, inventoryItemId: inventoryItem.id },
      context,
      actorName,
    );
  }

  getFrontOfficeEngine() {
    return this.frontOfficeEngine;
  }

  createReservation(
    input: Omit<Reservation, "id" | "createdAt" | "organizationId" | "propertyId">,
    context: HospitalityServiceContext,
    actorName: string,
  ) {
    const engineInput: CreateReservationInput = {
      propertyId: DEFAULT_PROPERTY_ID,
      guestId: input.guestId,
      accommodationTypeId: ROOM_TYPE_TO_ACCOMMODATION[input.roomTypeId] ?? input.roomTypeId,
      source: mapChannel(input.channel),
      arrival: input.checkIn.slice(0, 10),
      departure: input.checkOut.slice(0, 10),
      guestCount: { adults: input.adults, children: input.children, infants: 0 },
      rate: input.rate,
      isVip: input.isVip,
      notes: input.notes,
    };
    const created = this.reservationEngine.reservations.create(engineInput, context, actorName);
    this.repository.createStayRecord(buildStayFromReservation(created));
    return this.repository.getReservation(created.id)!;
  }
}

export const hospitalityService = new HospitalityService();
