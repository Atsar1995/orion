import { describe, expect, it } from "vitest";
import {
  AURORA_ERR_0501,
  AuroraError,
  isAuroraError,
} from "@/lib/aurora/errors/AuroraError";

describe("AuroraError", () => {
  it("captures code and status", () => {
    const error = new AuroraError(AURORA_ERR_0501, "Not implemented", 501);
    expect(error.code).toBe(AURORA_ERR_0501);
    expect(error.statusCode).toBe(501);
    expect(isAuroraError(error)).toBe(true);
  });
});
