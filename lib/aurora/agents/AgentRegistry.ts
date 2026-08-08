import { AURORA_ERR_0501, AuroraError } from "@/lib/aurora/errors/AuroraError";

/** Agent registry stub — full implementation A-017. */
export class AgentRegistry {
  list(): readonly string[] {
    return [];
  }

  get(): never {
    throw new AuroraError(AURORA_ERR_0501, "AgentRegistry not implemented.", 501);
  }
}
