import { randomUUID } from "crypto";
import type {
  CreateMemoryInput,
  MemoryEntry,
  MemoryRelationship,
  MemorySearchFilter,
} from "@/types/executive/memory";
import type { ServiceContext } from "@/types/services";

/** Knowledge repository contract (Mission P-004). */
export interface KnowledgeRepository {
  readonly entityName: "MemoryEntry";

  create(entry: MemoryEntry): MemoryEntry;
  update(entry: MemoryEntry): MemoryEntry;
  findById(id: string, context: ServiceContext): MemoryEntry | null;
  findByDecisionId(decisionId: string, context: ServiceContext): MemoryEntry[];
  search(filter: MemorySearchFilter, context: ServiceContext): MemoryEntry[];
  listAll(context: ServiceContext): MemoryEntry[];
  addRelationship(relationship: MemoryRelationship): MemoryRelationship;
  getRelationships(memoryId: string, context: ServiceContext): MemoryRelationship[];
  listRelationships(context: ServiceContext): MemoryRelationship[];
}

export function createMemoryId(): string {
  return randomUUID();
}

export function createRelationshipId(): string {
  return randomUUID();
}

export type { CreateMemoryInput, MemoryEntry, MemoryRelationship, MemorySearchFilter };
