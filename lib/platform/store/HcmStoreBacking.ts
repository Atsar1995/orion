/**
 * HCM store backing contract — PlatformStore domain accessor (Mission P-015.4).
 *
 * Today implemented by InMemoryHcmStore. P-015.5 introduces PostgreSQL-backed implementation
 * without changing repository constructor signatures.
 */

export type { InMemoryHcmStore as HcmStoreBacking } from "@/lib/hcm/data/InMemoryHcmStore";
