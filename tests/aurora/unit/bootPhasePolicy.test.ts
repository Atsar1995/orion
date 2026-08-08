import { CRITICAL_BOOT_PHASES, isCriticalBootPhase } from "@/lib/aurora/runtime/bootPhasePolicy";
import { describe, expect, it } from "vitest";

describe("bootPhasePolicy", () => {
  it("marks specification-critical phases", () => {
    expect(CRITICAL_BOOT_PHASES.has(0)).toBe(true);
    expect(CRITICAL_BOOT_PHASES.has(1)).toBe(true);
    expect(CRITICAL_BOOT_PHASES.has(3)).toBe(true);
    expect(CRITICAL_BOOT_PHASES.has(5)).toBe(true);
    expect(CRITICAL_BOOT_PHASES.has(6)).toBe(true);
    expect(CRITICAL_BOOT_PHASES.has(9)).toBe(true);
    expect(isCriticalBootPhase(2)).toBe(false);
  });
});
