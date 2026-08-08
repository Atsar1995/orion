import { AURORA_ERR_0501, AuroraError } from "@/lib/aurora/errors/AuroraError";

/** Prompt registry stub — full implementation A-017. */
export class PromptRegistry {
  get(): never {
    throw new AuroraError(AURORA_ERR_0501, "PromptRegistry not implemented.", 501);
  }
}
