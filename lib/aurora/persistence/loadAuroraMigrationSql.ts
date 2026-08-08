import { readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(process.cwd(), "lib/aurora/persistence/migrations");

/** Loads Aurora SQL migration files from the persistence migrations directory. */
export function loadAuroraMigrationSql(filename: string): string {
  return readFileSync(join(MIGRATIONS_DIR, filename), "utf8");
}
