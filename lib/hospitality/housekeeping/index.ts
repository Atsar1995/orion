import { randomUUID } from "crypto";
import { publishHousekeepingEvent } from "@/lib/hospitality/housekeeping/housekeeping-events";
import { HospitalityInventoryFacade } from "@/lib/hospitality/inventory";
import type { HousekeepingRepository } from "@/lib/hospitality/repositories/HousekeepingRepository";
import type {
  AssignTaskInput,
  CreateHousekeepingTaskInput,
  CreateMaintenanceInput,
  ExtendedRoomStatus,
  HousekeepingBriefSignals,
  HousekeepingTaskRecord,
  InspectionRecord,
  MaintenanceWorkOrderRecord,
} from "@/types/hospitality-housekeeping";
import type {
  HousekeepingDashboardView,
  MaintenanceDashboardView,
} from "@/lib/hospitality/models/housekeeping";
import type { ServiceContext } from "@/types/services";
import type { RoomStatus } from "@/types/hospitality";

type HousekeepingContext = ServiceContext;

function mapExtendedStatus(
  inventoryStatus: RoomStatus,
  task?: HousekeepingTaskRecord | null,
  hasOpenMaintenance?: boolean,
): ExtendedRoomStatus {
  if (hasOpenMaintenance || inventoryStatus === "maintenance") return "under_maintenance";
  if (inventoryStatus === "out_of_service") return "out_of_service";
  if (task?.status === "inspected") return "inspected";
  if (inventoryStatus === "dirty") return "vacant_dirty";
  if (inventoryStatus === "occupied") return task?.status === "completed" ? "occupied_clean" : "occupied_dirty";
  if (inventoryStatus === "clean" || inventoryStatus === "available") {
    return task?.status === "pending" || task?.status === "in_progress" ? "vacant_dirty" : "vacant_clean";
  }
  if (inventoryStatus === "inspecting") return "inspected";
  return "vacant_clean";
}

/** Housekeeping validation rules. */
export class HousekeepingRulesEngine {
  canAssign(task: HousekeepingTaskRecord | null): boolean {
    return task?.status === "pending" || task?.status === "assigned";
  }

  canComplete(task: HousekeepingTaskRecord | null): boolean {
    return task?.status === "assigned" || task?.status === "in_progress";
  }

  canInspect(task: HousekeepingTaskRecord | null): boolean {
    return task?.status === "completed";
  }

  canResolveWorkOrder(order: MaintenanceWorkOrderRecord | null): boolean {
    return order?.status === "open" || order?.status === "assigned" || order?.status === "in_progress";
  }
}

/** Room status synchronization with inventory. */
export class RoomStatusService {
  constructor(
    private readonly repository: HousekeepingRepository,
    private readonly inventoryEngine: HospitalityInventoryFacade,
  ) {}

  updateInventoryStatus(inventoryItemId: string, status: RoomStatus, context: HousekeepingContext) {
    return this.inventoryEngine.status.updateStatus(inventoryItemId, status, context);
  }

  blockForMaintenance(inventoryItemId: string, context: HousekeepingContext) {
    return this.inventoryEngine.status.updateMaintenanceStatus(inventoryItemId, "in_progress", context);
  }

  unblockAfterMaintenance(inventoryItemId: string, context: HousekeepingContext) {
    return this.inventoryEngine.status.updateMaintenanceStatus(inventoryItemId, "none", context);
  }
}

/** Housekeeping board and cleaning queue. */
export class HousekeepingBoardService {
  constructor(private readonly repository: HousekeepingRepository) {}

  getDashboard(context: HousekeepingContext, propertyId: string): HousekeepingDashboardView {
    const items = this.repository.listInventoryItems(propertyId);
    const tasks = this.repository.listHousekeepingTaskRecords(context.organizationId, propertyId);
    const workOrders = this.repository.listWorkOrders(context.organizationId, propertyId);

    const board = items
      .filter((item) => item.kind === "room" || item.kind === "suite" || item.kind === "villa")
      .map((item) => {
        const task = tasks.find(
          (entry) =>
            entry.inventoryItemId === item.id &&
            entry.status !== "inspected" &&
            entry.status !== "cancelled",
        );
        const blocked = workOrders.some(
          (wo) =>
            wo.inventoryItemId === item.id &&
            wo.status !== "resolved" &&
            wo.status !== "cancelled" &&
            (wo.priority === "critical" || wo.priority === "high"),
        );
        const extended = mapExtendedStatus(item.status, task, blocked);

        return {
          taskId: task?.id,
          inventoryItemId: item.id,
          roomNumber: item.label,
          propertyId,
          roomStatus: item.status.replaceAll("_", " "),
          extendedStatus: extended.replaceAll("_", " "),
          taskStatus: task?.status.replaceAll("_", " "),
          cleaningType: task?.cleaningType,
          assignedTo: task?.assignedTo,
          priority: task?.priority ?? "normal",
          isBlocked: blocked,
        };
      });

    const queue = board.filter(
      (item) =>
        item.taskStatus &&
        !["completed", "inspected"].includes(item.taskStatus.replaceAll(" ", "_")),
    );

    return {
      board,
      queue,
      summary: {
        readyRooms: board.filter((item) => item.extendedStatus.includes("vacant clean") || item.extendedStatus === "inspected").length,
        awaitingCleaning: queue.filter((item) => item.taskStatus === "pending").length,
        inProgress: queue.filter((item) => item.taskStatus === "in progress").length,
        underMaintenance: board.filter((item) => item.extendedStatus.includes("maintenance")).length,
        inspectionPending: board.filter((item) => item.taskStatus === "completed").length,
      },
    };
  }
}

/** Cleaning workflow lifecycle. */
export class CleaningWorkflowService {
  constructor(
    private readonly repository: HousekeepingRepository,
    private readonly roomStatus: RoomStatusService,
    private readonly rules: HousekeepingRulesEngine,
  ) {}

  createTask(input: CreateHousekeepingTaskInput, context: HousekeepingContext, actorName: string): HousekeepingTaskRecord {
    const now = new Date().toISOString();
    const record: HousekeepingTaskRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: input.propertyId,
      inventoryItemId: input.inventoryItemId,
      stayId: input.stayId,
      status: "pending",
      cleaningType: input.cleaningType ?? "checkout",
      priority: input.priority ?? "normal",
      notes: input.notes,
      createdAt: now,
    };

    const created = this.repository.createHousekeepingTaskRecord(record);
    publishHousekeepingEvent(
      {
        eventType: "HousekeepingTaskCreated",
        taskId: created.id,
        inventoryItemId: created.inventoryItemId,
        actorId: context.userId,
        actorName,
      },
      context,
    );
    return created;
  }

  createFromCheckout(
    inventoryItemId: string,
    propertyId: string,
    stayId: string,
    context: HousekeepingContext,
    actorName: string,
  ): HousekeepingTaskRecord {
    const existing = this.repository.getActiveTaskForInventory(inventoryItemId);
    if (existing) return existing;

    return this.createTask(
      {
        propertyId,
        inventoryItemId,
        stayId,
        cleaningType: "checkout",
        priority: "high",
        notes: "Auto-created on guest checkout",
      },
      context,
      actorName,
    );
  }

  assign(input: AssignTaskInput, context: HousekeepingContext, actorName: string): HousekeepingTaskRecord {
    const task = this.repository.getHousekeepingTaskRecord(input.taskId);
    if (!task || task.organizationId !== context.organizationId) throw new Error("TASK_NOT_FOUND");
    if (!this.rules.canAssign(task)) throw new Error("INVALID_TASK_STATUS");

    return this.repository.updateHousekeepingTaskRecord(input.taskId, {
      status: "assigned",
      assignedTo: input.assignedTo,
    })!;
  }

  start(taskId: string, context: HousekeepingContext): HousekeepingTaskRecord {
    const task = this.repository.getHousekeepingTaskRecord(taskId);
    if (!task || task.organizationId !== context.organizationId) throw new Error("TASK_NOT_FOUND");

    return this.repository.updateHousekeepingTaskRecord(taskId, {
      status: "in_progress",
      startedAt: new Date().toISOString(),
    })!;
  }

  complete(taskId: string, context: HousekeepingContext, actorName: string): HousekeepingTaskRecord {
    const task = this.repository.getHousekeepingTaskRecord(taskId);
    if (!task || task.organizationId !== context.organizationId) throw new Error("TASK_NOT_FOUND");
    if (!this.rules.canComplete(task)) throw new Error("INVALID_TASK_STATUS");

    this.roomStatus.updateInventoryStatus(task.inventoryItemId, "inspecting", context);

    const updated = this.repository.updateHousekeepingTaskRecord(taskId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    })!;

    publishHousekeepingEvent(
      {
        eventType: "HousekeepingCompleted",
        taskId,
        inventoryItemId: task.inventoryItemId,
        actorId: context.userId,
        actorName,
      },
      context,
    );
    return updated;
  }

  inspect(taskId: string, context: HousekeepingContext, actorName: string, passed = true): HousekeepingTaskRecord {
    const task = this.repository.getHousekeepingTaskRecord(taskId);
    if (!task || task.organizationId !== context.organizationId) throw new Error("TASK_NOT_FOUND");
    if (!this.rules.canInspect(task)) throw new Error("INVALID_TASK_STATUS");

    const now = new Date().toISOString();
    const inspection: InspectionRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: task.propertyId,
      inventoryItemId: task.inventoryItemId,
      taskId,
      type: "housekeeping",
      result: passed ? "pass" : "fail",
      score: passed ? 95 : 55,
      inspectedBy: actorName,
      inspectedAt: now,
    };
    this.repository.createInspection(inspection);

    if (passed) {
      this.roomStatus.updateInventoryStatus(task.inventoryItemId, "clean", context);
    } else {
      this.roomStatus.updateInventoryStatus(task.inventoryItemId, "dirty", context);
      publishHousekeepingEvent(
        {
          eventType: "InspectionFailed",
          taskId,
          inventoryItemId: task.inventoryItemId,
          actorId: context.userId,
          actorName,
        },
        context,
      );
    }

    publishHousekeepingEvent(
      {
        eventType: "RoomInspected",
        taskId,
        inventoryItemId: task.inventoryItemId,
        actorId: context.userId,
        actorName,
        payload: { passed },
      },
      context,
    );

    return this.repository.updateHousekeepingTaskRecord(taskId, {
      status: "inspected",
      inspectedAt: now,
      inspectedBy: actorName,
    })!;
  }
}

/** Maintenance work order service. */
export class MaintenanceWorkOrderService {
  constructor(
    private readonly repository: HousekeepingRepository,
    private readonly roomStatus: RoomStatusService,
    private readonly rules: HousekeepingRulesEngine,
  ) {}

  getDashboard(context: HousekeepingContext, propertyId: string): MaintenanceDashboardView {
    const orders = this.repository.listWorkOrders(context.organizationId, propertyId);
    const schedules = this.repository.listMaintenanceSchedules(context.organizationId, propertyId);
    const now = new Date().toISOString();

    const workOrders = orders.map((order) => {
      const inventory = order.inventoryItemId ? this.repository.getInventoryItem(order.inventoryItemId) : null;
      return {
        id: order.id,
        title: order.title,
        description: order.description,
        priority: order.priority,
        status: order.status.replaceAll("_", " "),
        type: order.type.replaceAll("_", " "),
        roomLabel: inventory?.label,
        assignedTo: order.assignedTo,
        vendorName: order.vendorName,
        reportedAt: order.reportedAt,
      };
    });

    return {
      workOrders,
      backlog: orders.filter((entry) => entry.status !== "resolved" && entry.status !== "cancelled").length,
      critical: orders.filter((entry) => entry.priority === "critical" && entry.status !== "resolved").length,
      preventiveDue: schedules.filter((entry) => entry.nextDueAt <= now).length,
    };
  }

  create(input: CreateMaintenanceInput, context: HousekeepingContext, actorName: string): MaintenanceWorkOrderRecord {
    const now = new Date().toISOString();
    const record: MaintenanceWorkOrderRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: input.propertyId,
      inventoryItemId: input.inventoryItemId,
      assetId: input.assetId,
      title: input.title,
      description: input.description,
      type: input.type ?? "corrective",
      priority: input.priority,
      status: input.assignedTo ? "assigned" : "open",
      assignedTo: input.assignedTo,
      vendorName: input.vendorName,
      reportedAt: now,
      scheduledAt: input.scheduledAt,
    };

    if (input.inventoryItemId && (input.priority === "critical" || input.priority === "high")) {
      this.roomStatus.blockForMaintenance(input.inventoryItemId, context);
    }

    const created = this.repository.createWorkOrder(record);
    publishHousekeepingEvent(
      {
        eventType: "MaintenanceRequested",
        workOrderId: created.id,
        inventoryItemId: created.inventoryItemId,
        actorId: context.userId,
        actorName,
      },
      context,
    );
    return created;
  }

  resolve(workOrderId: string, context: HousekeepingContext, actorName: string): MaintenanceWorkOrderRecord {
    const order = this.repository.getWorkOrder(workOrderId);
    if (!order || order.organizationId !== context.organizationId) throw new Error("WORK_ORDER_NOT_FOUND");
    if (!this.rules.canResolveWorkOrder(order)) throw new Error("INVALID_WORK_ORDER_STATUS");

    if (order.inventoryItemId) {
      this.roomStatus.unblockAfterMaintenance(order.inventoryItemId, context);
      this.roomStatus.updateInventoryStatus(order.inventoryItemId, "dirty", context);
    }

    const updated = this.repository.updateWorkOrder(workOrderId, {
      status: "resolved",
      resolvedAt: new Date().toISOString(),
    })!;

    publishHousekeepingEvent(
      {
        eventType: "MaintenanceResolved",
        workOrderId,
        inventoryItemId: order.inventoryItemId,
        actorId: context.userId,
        actorName,
      },
      context,
    );
    return updated;
  }

  listAssets(context: HousekeepingContext, propertyId: string) {
    return this.repository.listAssets(context.organizationId, propertyId);
  }

  listSchedules(context: HousekeepingContext, propertyId: string) {
    return this.repository.listMaintenanceSchedules(context.organizationId, propertyId);
  }
}

/** Facade for Housekeeping & Maintenance Operations (Mission P-007.5). */
export class HospitalityHousekeepingFacade {
  readonly board: HousekeepingBoardService;
  readonly cleaning: CleaningWorkflowService;
  readonly maintenance: MaintenanceWorkOrderService;
  readonly roomStatus: RoomStatusService;
  readonly rules: HousekeepingRulesEngine;
  readonly repository: HousekeepingRepository;

  constructor(repository: HousekeepingRepository) {
    this.repository = repository;
    const inventoryEngine = new HospitalityInventoryFacade(repository);
    this.rules = new HousekeepingRulesEngine();
    this.roomStatus = new RoomStatusService(repository, inventoryEngine);
    this.board = new HousekeepingBoardService(repository);
    this.cleaning = new CleaningWorkflowService(repository, this.roomStatus, this.rules);
    this.maintenance = new MaintenanceWorkOrderService(repository, this.roomStatus, this.rules);
  }

  getBriefSignals(context: HousekeepingContext, propertyId: string): HousekeepingBriefSignals {
    const dashboard = this.board.getDashboard(context, propertyId);
    const maintenance = this.maintenance.getDashboard(context, propertyId);
    const inspections = this.repository.listInspections(context.organizationId, propertyId);
    const assets = this.repository.listAssets(context.organizationId, propertyId);

    const totalTasks = this.repository.listHousekeepingTaskRecords(context.organizationId, propertyId);
    const completed = totalTasks.filter((entry) => entry.status === "completed" || entry.status === "inspected").length;
    const operationalAssets = assets.filter((entry) => entry.status === "operational").length;

    return {
      readyRooms: dashboard.summary.readyRooms,
      awaitingCleaning: dashboard.summary.awaitingCleaning,
      criticalMaintenance: maintenance.critical,
      inspectionFailures: inspections.filter((entry) => entry.result === "fail").length,
      assetHealthScore: assets.length ? Math.round((operationalAssets / assets.length) * 100) : 100,
      cleaningProgressPercent: totalTasks.length ? Math.round((completed / totalTasks.length) * 100) : 100,
    };
  }

  listLinen(context: HousekeepingContext, propertyId: string) {
    return this.repository.listLinenItems(context.organizationId, propertyId);
  }

  listLostAndFound(context: HousekeepingContext, propertyId: string) {
    return this.repository.listLostAndFound(context.organizationId, propertyId);
  }
}
