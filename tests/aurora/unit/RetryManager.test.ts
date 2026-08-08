import { describe, expect, it } from "vitest";
import { DefaultRetryManager } from "@/lib/aurora/infrastructure/RetryManager";

describe("RetryManager", () => {
  it("retries transient failures", async () => {
    const manager = new DefaultRetryManager();
    let attempts = 0;

    const result = await manager.execute("platform.default", async () => {
      attempts += 1;
      if (attempts < 2) {
        throw new Error("temporary");
      }
      return "ok";
    });

    expect(result).toBe("ok");
    expect(attempts).toBe(2);
  });
});
