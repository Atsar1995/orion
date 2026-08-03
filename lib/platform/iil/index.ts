export type {
  DurableTransportAdapter,
  IILTransportAdapter,
  DeliveryRecord,
  DeliveryProcessor,
  PublishReceipt,
  ReplayCriteria,
  TransportHealth,
} from "@/lib/platform/iil/DurableTransportAdapter";

export { RetryPolicy, defaultRetryPolicy } from "@/lib/platform/iil/RetryPolicy";
export { TransportMetrics, type TransportMetricsSnapshot } from "@/lib/platform/iil/TransportMetrics";
export { IILDeadLetterQueue } from "@/lib/platform/iil/DeadLetterQueue";
export { ReplayService, replayService } from "@/lib/platform/iil/ReplayService";
export {
  InMemoryDurableTransport,
  InMemoryDurableTransportBacking,
} from "@/lib/platform/iil/InMemoryDurableTransport";
export { PostgresDurableTransport } from "@/lib/platform/iil/PostgresDurableTransport";
export {
  getDefaultIILTransport,
  resetDefaultIILTransportForTests,
  getDefaultIILBackingForTests,
} from "@/lib/platform/iil/defaultTransport";
export {
  IILTransportProvider,
  loadIILConfiguration,
  DEFAULT_IIL_CONFIGURATION,
  type IILConfiguration,
} from "@/lib/platform/iil/IILConfiguration";
export {
  buildPartitionKey,
  buildIdempotencyKey,
  enrichDurableEnvelope,
  resolveSourceDomain,
  IIL_IDEMPOTENCY_WINDOW_MS,
} from "@/lib/platform/iil/envelope";
export {
  IILEntityPersister,
  IIL_COLLECTION_EVENT,
  IIL_COLLECTION_DELIVERY,
  IIL_COLLECTION_DEAD_LETTER,
  IIL_COLLECTION_IDEMPOTENCY,
} from "@/lib/platform/iil/persistence/IILEntityPersister";
