import { describe, expect, it } from "vitest";
import { DefaultCircuitBreakerRegistry } from "@/lib/aurora/infrastructure/CircuitBreakerRegistry";
import { AURORA_ERR_5030, AuroraError } from "@/lib/aurora/errors/AuroraError";

describe("CircuitBreakerRegistry", () => {
  it("opens after repeated failures", async () => {
    const registry = new DefaultCircuitBreakerRegistry();
    const breaker = registry.get("redis");

    for (let index = 0; index < 3; index += 1) {
      await expect(
        breaker.execute(async () => {
          throw new Error("fail");
        }),
      ).rejects.toThrow();
    }

    await expect(
      breaker.execute(async () => "ok"),
    ).rejects.toMatchObject({ code: AURORA_ERR_5030 } satisfies Partial<AuroraError>);
  });
});
