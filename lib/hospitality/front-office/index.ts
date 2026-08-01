import { randomUUID } from "crypto";
import { publishFrontOfficeEvent } from "@/lib/hospitality/front-office/front-office-events";
import { HospitalityInventoryFacade } from "@/lib/hospitality/inventory";
import { HospitalityBillingFacade } from "@/lib/hospitality/billing";
import { HospitalityHousekeepingFacade } from "@/lib/hospitality/housekeeping";
import type { BillingRepository } from "@/lib/hospitality/repositories/BillingRepository";
import type { HousekeepingRepository } from "@/lib/hospitality/repositories/HousekeepingRepository";
import { HospitalityReservationFacade } from "@/lib/hospitality/reservations";
import type { FrontOfficeRepository } from "@/lib/hospitality/repositories/FrontOfficeRepository";
import type {
  AssignRoomInput,
  CheckInInput,
  CheckOutInput,
  FrontOfficeBriefSignals,
  GuestMovement,
  RegistrationRecord,
  StayMovementInput,
  StayRecord,
} from "@/types/hospitality-front-office";
import type {
  FrontOfficeDashboardView,
  FrontOfficeQueueItem,
  OccupancyBoardItem,
} from "@/lib/hospitality/models/front-office";
import type { ServiceContext } from "@/types/services";
import type { RoomStatus } from "@/types/hospitality";

type FrontOfficeContext = ServiceContext;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isRoomReady(status: RoomStatus): boolean {
  return status === "available" || status === "clean";
}

/** Front office validation rules. */
export class FrontOfficeRulesEngine {
  validateCheckIn(stay: StayRecord | null, organizationId: string): void {
    if (!stay || stay.organizationId !== organizationId) throw new Error("STAY_NOT_FOUND");
    if (stay.status !== "expected") throw new Error("INVALID_STAY_STATUS");
  }

  validateCheckOut(stay: StayRecord | null, organizationId: string): void {
    if (!stay || stay.organizationId !== organizationId) throw new Error("STAY_NOT_FOUND");
    if (stay.status !== "checked_in") throw new Error("INVALID_STAY_STATUS");
  }

  validateAssignment(stay: StayRecord | null, organizationId: string): void {
    if (!stay || stay.organizationId !== organizationId) throw new Error("STAY_NOT_FOUND");
    if (stay.status === "checked_out" || stay.status === "cancelled") throw new Error("INVALID_STAY_STATUS");
  }
}

/** Operational dashboard and queue service. */
export class OperationalDashboardService {
  constructor(
    private readonly repository: FrontOfficeRepository,
    private readonly reservationEngine: HospitalityReservationFacade,
  ) {}

  getDashboard(context: FrontOfficeContext, propertyId?: string, anchorDate = todayIso()): FrontOfficeDashboardView {
    const stays = this.repository.listStayRecords(context.organizationId, propertyId);
    const items = stays.map((stay) => this.toQueueItem(stay, context));

    const arrivals = items.filter((item) => item.arrival === anchorDate && item.status === "expected");
    const inHouse = items.filter((item) => item.status === "checked_in");
    const departures = items.filter((item) => item.departure === anchorDate && item.status === "checked_in");
    const unassigned = items.filter((item) => !item.roomAssigned && item.arrival === anchorDate && item.status === "expected");

    const inventoryItems = propertyId
      ? this.repository.listInventoryItems(propertyId)
      : this.repository.listProperties(context.organizationId).flatMap((property) =>
          this.repository.listInventoryItems(property.id),
        );

    const roomUnits = inventoryItems.filter((item) => item.kind === "room" || item.kind === "suite" || item.kind === "villa");
    const occupied = roomUnits.filter((item) => item.status === "occupied").length;
    const vacantClean = roomUnits.filter((item) => item.status === "clean" || item.status === "available").length;
    const vacantDirty = roomUnits.filter((item) => item.status === "dirty").length;
    const outOfOrder = roomUnits.filter((item) => item.status === "maintenance").length;
    const outOfService = roomUnits.filter((item) => item.status === "out_of_service").length;
    const totalRooms = roomUnits.length;

    const stayovers = inHouse.filter((item) => item.departure !== anchorDate).length;
    const walkIns = stays.filter((stay) => stay.reservationNumber.includes("WALK")).length;
    const noShows = stays.filter((stay) => stay.status === "no_show").length;

    const ops = propertyId
      ? this.repository.getOperationsSnapshot(propertyId)
      : this.repository.getOperationsSnapshot(this.repository.listProperties(context.organizationId)[0]?.id ?? "");

    return {
      occupancy: {
        percent: totalRooms ? Math.round((occupied / totalRooms) * 100) : ops.occupancyPercent,
        inHouse: inHouse.length,
        totalRooms,
        vacantClean,
        vacantDirty,
        outOfOrder,
        outOfService,
      },
      today: {
        arrivals: arrivals.length,
        departures: departures.length,
        stayovers,
        walkIns,
        noShows,
        vipArrivals: arrivals.filter((item) => item.isVip).length,
        groupArrivals: arrivals.filter((item) => item.isGroup).length,
      },
      queues: { arrivals, inHouse, departures, unassigned },
    };
  }

  private toQueueItem(stay: StayRecord, context: FrontOfficeContext): FrontOfficeQueueItem {
    const guest = this.repository.getGuestRecord(stay.guestId);
    const property = this.repository.getProperty(stay.propertyId);
    const type = this.repository.getAccommodationType(stay.accommodationTypeId);
    const inventory = stay.inventoryItemId ? this.repository.getInventoryItem(stay.inventoryItemId) : null;

    return {
      stayId: stay.id,
      reservationId: stay.reservationId,
      reservationNumber: stay.reservationNumber,
      guestId: stay.guestId,
      guestName: guest?.fullName ?? "Unknown",
      propertyId: stay.propertyId,
      propertyName: property?.name ?? "Unknown",
      inventoryLabel: inventory?.label,
      accommodationType: type?.name ?? "Unknown",
      status: stay.status,
      arrival: stay.arrival,
      departure: stay.departure,
      expectedArrivalTime: stay.expectedArrivalTime,
      isVip: stay.isVip,
      isGroup: stay.isGroup,
      groupName: stay.groupName,
      earlyCheckInRequested: stay.earlyCheckInRequested,
      roomAssigned: Boolean(stay.inventoryItemId),
      roomReady: inventory ? isRoomReady(inventory.status) : false,
    };
  }
}

/** Occupancy board service. */
export class OccupancyService {
  constructor(private readonly repository: FrontOfficeRepository) {}

  getOccupancyBoard(context: FrontOfficeContext, propertyId: string): OccupancyBoardItem[] {
    const property = this.repository.getProperty(propertyId);
    if (!property || property.organizationId !== context.organizationId) return [];

    const stays = this.repository
      .listStayRecords(context.organizationId, propertyId)
      .filter((stay) => stay.status === "checked_in");

    return this.repository.listInventoryItems(propertyId).map((item) => {
      const activeStay = stays.find((stay) => stay.inventoryItemId === item.id);
      const guest = activeStay ? this.repository.getGuestRecord(activeStay.guestId) : null;
      const bucket =
        item.status === "occupied"
          ? "occupied"
          : item.status === "dirty"
            ? "vacant_dirty"
            : item.status === "maintenance"
              ? "out_of_order"
              : item.status === "out_of_service"
                ? "out_of_service"
                : item.status === "inspecting"
                  ? "inspecting"
                  : "vacant_clean";

      return {
        inventoryItemId: item.id,
        label: item.label,
        propertyId,
        bucket,
        guestName: guest?.fullName,
        stayId: activeStay?.id,
        departure: activeStay?.departure,
      };
    });
  }
}

/** Accommodation assignment service. */
export class AccommodationAssignmentService {
  constructor(
    private readonly repository: FrontOfficeRepository,
    private readonly reservationEngine: HospitalityReservationFacade,
    private readonly inventoryEngine: HospitalityInventoryFacade,
    private readonly rules: FrontOfficeRulesEngine,
  ) {}

  assignRoom(input: AssignRoomInput, context: FrontOfficeContext, actorName: string): StayRecord {
    const stay = this.repository.getStayRecord(input.stayId);
    this.rules.validateAssignment(stay, context.organizationId);

    const inventory = this.repository.getInventoryItem(input.inventoryItemId);
    if (!inventory) throw new Error("INVENTORY_NOT_FOUND");
    if (!isRoomReady(inventory.status) && stay!.status !== "checked_in") {
      throw new Error("ROOM_NOT_READY");
    }

    this.reservationEngine.reservations.modify(
      stay!.reservationId,
      { inventoryItemId: input.inventoryItemId },
      context,
      actorName,
    );

    const updated = this.repository.updateStayRecord(input.stayId, {
      inventoryItemId: input.inventoryItemId,
      updatedAt: new Date().toISOString(),
    })!;

    publishFrontOfficeEvent(
      {
        eventType: "RoomAssigned",
        stayId: input.stayId,
        reservationId: stay!.reservationId,
        actorId: context.userId,
        actorName,
        payload: { inventoryItemId: input.inventoryItemId },
      },
      context,
    );

    return updated;
  }

  listAvailableRooms(stayId: string, context: FrontOfficeContext) {
    const stay = this.repository.getStayRecord(stayId);
    if (!stay || stay.organizationId !== context.organizationId) throw new Error("STAY_NOT_FOUND");

    return this.repository
      .listInventoryItems(stay.propertyId)
      .filter(
        (item) =>
          item.accommodationTypeId === stay.accommodationTypeId &&
          (isRoomReady(item.status) || item.id === stay.inventoryItemId),
      )
      .map((item) => ({
        id: item.id,
        label: item.label,
        status: item.status,
        ready: isRoomReady(item.status),
      }));
  }
}

/** Check-in orchestration service. */
export class CheckInService {
  constructor(
    private readonly repository: FrontOfficeRepository,
    private readonly reservationEngine: HospitalityReservationFacade,
    private readonly inventoryEngine: HospitalityInventoryFacade,
    private readonly assignment: AccommodationAssignmentService,
    private readonly rules: FrontOfficeRulesEngine,
  ) {}

  execute(input: CheckInInput, context: FrontOfficeContext, actorName: string): StayRecord {
    const stay = this.repository.getStayRecord(input.stayId);
    this.rules.validateCheckIn(stay, context.organizationId);

    if (input.inventoryItemId && input.inventoryItemId !== stay!.inventoryItemId) {
      this.assignment.assignRoom({ stayId: input.stayId, inventoryItemId: input.inventoryItemId }, context, actorName);
    } else if (!stay!.inventoryItemId) {
      throw new Error("ROOM_ASSIGNMENT_REQUIRED");
    }

    const now = new Date().toISOString();
    const registration: RegistrationRecord = {
      id: randomUUID(),
      guestId: stay!.guestId,
      stayId: stay!.id,
      signedAt: now,
      signatureCaptured: input.signatureCaptured ?? true,
      identityVerified: input.identityVerified ?? true,
      welcomeNotes: input.welcomeNotes,
      depositCollected: input.depositCollected ?? false,
      depositAmount: input.depositAmount,
      keyIssued: input.keyIssued ?? true,
    };

    this.reservationEngine.reservations.executeAction(stay!.reservationId, "check_in", context, actorName);

    const inventoryId = input.inventoryItemId ?? stay!.inventoryItemId!;
    this.inventoryEngine.status.updateStatus(inventoryId, "occupied", context);

    this.repository.addGuestTimelineEntry({
      id: randomUUID(),
      guestId: stay!.guestId,
      type: "stay",
      title: `Checked in — ${stay!.reservationNumber}`,
      summary: `Room assignment confirmed · key issued`,
      occurredAt: now,
      relatedEntityId: stay!.reservationId,
    });

    const updated = this.repository.updateStayRecord(input.stayId, {
      status: "checked_in",
      actualCheckInAt: now,
      registration,
      updatedAt: now,
    })!;

    publishFrontOfficeEvent(
      {
        eventType: "StayCheckedIn",
        stayId: input.stayId,
        reservationId: stay!.reservationId,
        actorId: context.userId,
        actorName,
      },
      context,
    );

    return updated;
  }
}

/** Check-out orchestration service. */
export class CheckOutService {
  constructor(
    private readonly repository: FrontOfficeRepository,
    private readonly reservationEngine: HospitalityReservationFacade,
    private readonly inventoryEngine: HospitalityInventoryFacade,
    private readonly rules: FrontOfficeRulesEngine,
    private readonly housekeepingEngine?: HospitalityHousekeepingFacade,
    private readonly billingEngine?: HospitalityBillingFacade,
  ) {}

  execute(input: CheckOutInput, context: FrontOfficeContext, actorName: string): StayRecord {
    const stay = this.repository.getStayRecord(input.stayId);
    this.rules.validateCheckOut(stay, context.organizationId);

    const outstanding = this.billingEngine
      ? this.billingEngine.folios.getOutstandingForStay(input.stayId, context)
      : (() => {
          const folios = this.repository.listFolios(context.organizationId).filter((entry) => entry.reservationId === stay!.reservationId);
          const folio = folios[0];
          const chargeTotal = folio?.charges.reduce((sum, charge) => sum + charge.amount * (1 + charge.taxRate), 0) ?? 0;
          const paidTotal = folio?.payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;
          return chargeTotal - paidTotal;
        })();

    if (outstanding > 0 && !input.expressCheckout) {
      throw new Error("OUTSTANDING_BALANCE");
    }

    const now = new Date().toISOString();
    this.reservationEngine.reservations.executeAction(stay!.reservationId, "check_out", context, actorName);

    if (stay!.inventoryItemId) {
      this.inventoryEngine.status.updateStatus(stay!.inventoryItemId, "dirty", context);
      this.housekeepingEngine?.cleaning.createFromCheckout(
        stay!.inventoryItemId,
        stay!.propertyId,
        stay!.id,
        context,
        actorName,
      );
    }

    this.repository.addGuestTimelineEntry({
      id: randomUUID(),
      guestId: stay!.guestId,
      type: "stay",
      title: `Checked out — ${stay!.reservationNumber}`,
      summary: input.feedbackCollected ? "Feedback collected at departure" : "Standard checkout completed",
      occurredAt: now,
      relatedEntityId: stay!.reservationId,
    });

    const updated = this.repository.updateStayRecord(input.stayId, {
      status: "checked_out",
      actualCheckOutAt: now,
      updatedAt: now,
    })!;

    publishFrontOfficeEvent(
      {
        eventType: "StayCheckedOut",
        stayId: input.stayId,
        reservationId: stay!.reservationId,
        actorId: context.userId,
        actorName,
        payload: { expressCheckout: input.expressCheckout ?? false },
      },
      context,
    );

    return updated;
  }
}

/** Stay management and guest movement service. */
export class StayService {
  constructor(
    private readonly repository: FrontOfficeRepository,
    private readonly reservationEngine: HospitalityReservationFacade,
    private readonly assignment: AccommodationAssignmentService,
    private readonly inventoryEngine: HospitalityInventoryFacade,
  ) {}

  getStay(id: string, context: FrontOfficeContext): StayRecord | null {
    const stay = this.repository.getStayRecord(id);
    if (!stay || stay.organizationId !== context.organizationId) return null;
    return stay;
  }

  executeMovement(input: StayMovementInput, context: FrontOfficeContext, actorName: string): StayRecord {
    const stay = this.repository.getStayRecord(input.stayId);
    if (!stay || stay.organizationId !== context.organizationId) throw new Error("STAY_NOT_FOUND");

    const now = new Date().toISOString();
    let patch: Partial<StayRecord> = { updatedAt: now };
    const movement: GuestMovement = {
      id: randomUUID(),
      stayId: input.stayId,
      type: input.type,
      fromInventoryItemId: stay.inventoryItemId,
      toInventoryItemId: input.toInventoryItemId,
      reason: input.reason,
      occurredAt: now,
      actorName,
    };

    switch (input.type) {
      case "room_move":
      case "upgrade":
      case "downgrade":
        if (!input.toInventoryItemId) throw new Error("INVENTORY_NOT_FOUND");
        if (stay.inventoryItemId) {
          this.inventoryEngine.status.updateStatus(stay.inventoryItemId, "dirty", context);
        }
        this.assignment.assignRoom({ stayId: input.stayId, inventoryItemId: input.toInventoryItemId }, context, actorName);
        if (stay.status === "checked_in") {
          this.inventoryEngine.status.updateStatus(input.toInventoryItemId, "occupied", context);
        }
        patch = { ...patch, inventoryItemId: input.toInventoryItemId, movements: [...stay.movements, movement] };
        if (input.type === "upgrade") {
          this.reservationEngine.reservations.executeAction(stay.reservationId, "upgrade", context, actorName, {
            inventoryItemId: input.toInventoryItemId,
          });
        }
        if (input.type === "downgrade") {
          this.reservationEngine.reservations.executeAction(stay.reservationId, "downgrade", context, actorName, {
            inventoryItemId: input.toInventoryItemId,
          });
        }
        break;
      case "extension":
      case "shortening":
        if (!input.newDeparture) throw new Error("INVALID_STAY_DATES");
        this.reservationEngine.reservations.modify(
          stay.reservationId,
          { departure: input.newDeparture },
          context,
          actorName,
        );
        patch = { ...patch, departure: input.newDeparture, movements: [...stay.movements, movement] };
        break;
    }

    publishFrontOfficeEvent(
      {
        eventType: "GuestMoved",
        stayId: input.stayId,
        reservationId: stay.reservationId,
        actorId: context.userId,
        actorName,
        payload: { movementType: input.type },
      },
      context,
    );

    return this.repository.updateStayRecord(input.stayId, patch)!;
  }
}

/** Facade for Front Office Operations Platform (Mission P-007.4). */
export class HospitalityFrontOfficeFacade {
  readonly dashboard: OperationalDashboardService;
  readonly occupancy: OccupancyService;
  readonly checkIn: CheckInService;
  readonly checkOut: CheckOutService;
  readonly assignment: AccommodationAssignmentService;
  readonly stays: StayService;
  readonly rules: FrontOfficeRulesEngine;
  readonly repository: FrontOfficeRepository;

  constructor(repository: FrontOfficeRepository) {
    this.repository = repository;
    const reservationEngine = new HospitalityReservationFacade(repository);
    const inventoryEngine = new HospitalityInventoryFacade(repository);
    const housekeepingEngine = new HospitalityHousekeepingFacade(repository as HousekeepingRepository);
    const billingEngine = new HospitalityBillingFacade(repository as BillingRepository);
    this.rules = new FrontOfficeRulesEngine();
    this.dashboard = new OperationalDashboardService(repository, reservationEngine);
    this.occupancy = new OccupancyService(repository);
    this.assignment = new AccommodationAssignmentService(repository, reservationEngine, inventoryEngine, this.rules);
    this.checkIn = new CheckInService(repository, reservationEngine, inventoryEngine, this.assignment, this.rules);
    this.checkOut = new CheckOutService(repository, reservationEngine, inventoryEngine, this.rules, housekeepingEngine, billingEngine);
    this.stays = new StayService(repository, reservationEngine, this.assignment, inventoryEngine);
  }

  getBriefSignals(context: FrontOfficeContext, propertyId?: string): FrontOfficeBriefSignals {
    const dashboard = this.dashboard.getDashboard(context, propertyId);
    const delays: string[] = [];

    for (const item of dashboard.queues.arrivals) {
      if (!item.roomReady && item.roomAssigned) {
        delays.push(`${item.guestName} — room ${item.inventoryLabel} not ready`);
      }
      if (!item.roomAssigned) {
        delays.push(`${item.guestName} — no room assigned (${item.reservationNumber})`);
      }
    }

    for (const item of dashboard.queues.inHouse) {
      if (item.departure === todayIso() && !item.roomReady) {
        delays.push(`Late departure risk — ${item.guestName}`);
      }
    }

    return {
      currentOccupancy: dashboard.occupancy.percent,
      vipInHouse: dashboard.queues.inHouse.filter((item) => item.isVip).length,
      operationalDelays: delays.slice(0, 5),
      earlyArrivals: dashboard.queues.arrivals.filter((item) => item.earlyCheckInRequested).length,
      lateDepartures: dashboard.queues.departures.length,
      unassignedArrivals: dashboard.queues.unassigned.length,
      roomsNotReady: dashboard.queues.arrivals.filter((item) => item.roomAssigned && !item.roomReady).length,
    };
  }
}
