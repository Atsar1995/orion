import { describe, expect, it, vi } from "vitest";

describe("createAuroraAppDatabaseConnection", () => {
  it("requires AURORA_APP_DATABASE_URL", async () => {
    vi.stubEnv("AURORA_APP_DATABASE_URL", "");

    const { createAuroraAppDatabaseConnection } = await import(
      "@/lib/aurora/persistence/createAuroraAppDatabaseConnection"
    );

    expect(() => createAuroraAppDatabaseConnection()).toThrow(
      "AURORA_APP_DATABASE_URL is required",
    );

    vi.unstubAllEnvs();
  });

  it("creates a PostgreSQL database connection from AURORA_APP_DATABASE_URL", async () => {
    vi.stubEnv(
      "AURORA_APP_DATABASE_URL",
      "postgresql://aurora_app:test-password@localhost:5432/orion_staging",
    );

    const { createAuroraAppDatabaseConnection } = await import(
      "@/lib/aurora/persistence/createAuroraAppDatabaseConnection"
    );

    const connection = createAuroraAppDatabaseConnection();

    expect(connection).toBeDefined();
    expect(connection.isConnected()).toBe(false);

    await connection.shutdown();
    vi.unstubAllEnvs();
  });
});
