import {
  InMemoryDurableTransport,
  InMemoryDurableTransportBacking,
} from "@/lib/platform/iil/InMemoryDurableTransport";
import type { DurableTransportAdapter } from "@/lib/platform/iil/DurableTransportAdapter";

let defaultTransport: DurableTransportAdapter | null = null;
let defaultBacking: InMemoryDurableTransportBacking | null = null;

/** Returns the default in-memory durable IIL transport for development. */
export function getDefaultIILTransport(): DurableTransportAdapter {
  if (!defaultTransport) {
    defaultBacking = new InMemoryDurableTransportBacking();
    defaultTransport = new InMemoryDurableTransport({ backing: defaultBacking });
  }
  return defaultTransport;
}

export function resetDefaultIILTransportForTests(): void {
  defaultTransport?.stopDeliveryLoop();
  defaultTransport = null;
  defaultBacking = null;
}

export function getDefaultIILBackingForTests(): InMemoryDurableTransportBacking | null {
  return defaultBacking;
}
