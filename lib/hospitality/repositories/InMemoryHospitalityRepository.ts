/** Backward-compatible re-exports — use InMemoryInventoryRepository (Mission P-007.1). */
export {
  InMemoryInventoryRepository as InMemoryHospitalityRepository,
  defaultInventoryRepository as defaultHospitalityRepository,
} from "@/lib/hospitality/repositories/InMemoryInventoryRepository";
