/**
 * ORION Shared Data Architecture — public API (Mission S1C).
 * All workspaces consume data through this layer, not mock fixtures.
 */

export type {
  DataEnvelope,
  DataError,
  DataErrorCode,
  DataFreshness,
  DataResult,
  DataStatus,
  ExecutiveInsightRecord,
} from "@/lib/data/types";

export {
  dataNotFoundError,
  dataProviderFailedError,
  dataServiceUnavailableError,
  dataUnknownError,
  dataValidationError,
} from "@/lib/data/errors";

export { TtlCache } from "@/lib/data/cache/TtlCache";
export { platformLogger } from "@/lib/data/logging/PlatformLogger";
export type { LogCategory, LogLevel, PlatformLogEntry } from "@/lib/data/logging/PlatformLogger";

export type {
  ActivityEntity,
  CustomerEntity,
  DecisionEntity,
  NotificationEntity,
  OpportunityEntity,
  OrganizationEntity,
  PlatformEntity,
  TaskEntity,
  UserEntity,
  WorkspaceEntity,
} from "@/lib/data/models/entities";

export type {
  DataReadRepository,
  DataRepository,
  DataWriteRepository,
} from "@/lib/data/repository/DataRepository";

export { mapSnapshotToDashboardState } from "@/lib/data/mappers/map-snapshot-to-dashboard-state";

export {
  ExecutiveIntelligenceEngine,
  executiveIntelligenceEngine,
  getExecutiveDashboardState,
  getExecutiveMorningBrief,
} from "@/lib/data/intelligence/ExecutiveIntelligenceEngine";
export { composeExecutiveDashboard } from "@/lib/data/services/ExecutiveDashboardService";
export type { ExecutiveDashboardComposition } from "@/lib/data/services/ExecutiveDashboardService";
