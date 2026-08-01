import type {
  AssetRecord,
  CreateHousekeepingTaskInput,
  CreateMaintenanceInput,
  HousekeepingTaskRecord,
  InspectionRecord,
  LinenItemRecord,
  LostAndFoundRecord,
  MaintenanceScheduleRecord,
  MaintenanceWorkOrderRecord,
} from "@/types/hospitality-housekeeping";
import type { HousekeepingTask, MaintenanceRequest } from "@/types/hospitality";
import type { FrontOfficeRepository } from "@/lib/hospitality/repositories/FrontOfficeRepository";

/** Housekeeping & maintenance data access contract (Mission P-007.5). */
export type HousekeepingRepository = FrontOfficeRepository & {
  listHousekeepingTaskRecords(organizationId: string, propertyId?: string): HousekeepingTaskRecord[];
  getHousekeepingTaskRecord(id: string): HousekeepingTaskRecord | null;
  getActiveTaskForInventory(inventoryItemId: string): HousekeepingTaskRecord | null;
  createHousekeepingTaskRecord(record: HousekeepingTaskRecord): HousekeepingTaskRecord;
  updateHousekeepingTaskRecord(id: string, patch: Partial<HousekeepingTaskRecord>): HousekeepingTaskRecord | null;
  listWorkOrders(organizationId: string, propertyId?: string): MaintenanceWorkOrderRecord[];
  getWorkOrder(id: string): MaintenanceWorkOrderRecord | null;
  createWorkOrder(record: MaintenanceWorkOrderRecord): MaintenanceWorkOrderRecord;
  updateWorkOrder(id: string, patch: Partial<MaintenanceWorkOrderRecord>): MaintenanceWorkOrderRecord | null;
  listInspections(organizationId: string, propertyId?: string): InspectionRecord[];
  createInspection(record: InspectionRecord): InspectionRecord;
  listAssets(organizationId: string, propertyId?: string): AssetRecord[];
  listMaintenanceSchedules(organizationId: string, propertyId?: string): MaintenanceScheduleRecord[];
  listLinenItems(organizationId: string, propertyId?: string): LinenItemRecord[];
  listLostAndFound(organizationId: string, propertyId?: string): LostAndFoundRecord[];
  /** Legacy compatibility */
  listHousekeepingTasks(propertyId: string): HousekeepingTask[];
  listMaintenanceRequests(propertyId: string): MaintenanceRequest[];
};

export type { CreateHousekeepingTaskInput, CreateMaintenanceInput };
