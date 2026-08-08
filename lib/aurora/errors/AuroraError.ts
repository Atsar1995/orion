/** Aurora domain errors (ES-AURORA-005 §10.5). */

export const AURORA_ERR_0403 = "AURORA_ERR_0403";
export const AURORA_ERR_0404 = "AURORA_ERR_0404";
export const AURORA_ERR_0429 = "AURORA_ERR_0429";
export const AURORA_ERR_0501 = "AURORA_ERR_0501";
export const AURORA_ERR_0503 = "AURORA_ERR_0503";
export const AURORA_ERR_0509 = "AURORA_ERR_0509";
export const AURORA_ERR_5030 = "AURORA_ERR_5030";

export class AuroraError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode: number = 500,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AuroraError";
  }
}

export function isAuroraError(error: unknown): error is AuroraError {
  return error instanceof AuroraError;
}
