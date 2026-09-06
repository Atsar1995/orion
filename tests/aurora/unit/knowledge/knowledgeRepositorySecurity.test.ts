import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(__dirname, "../../../..");
const PRODUCTION_REPOSITORIES_INDEX = join(
  REPO_ROOT,
  "lib/aurora/knowledge/repositories/index.ts",
);
const UNSAFE_SYMBOL = "PostgresKnowledgeRepositoryUnsafe";

function collectFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function findUnsafeReferencesUnderLib(): string[] {
  const libRoot = join(REPO_ROOT, "lib");
  const matches: string[] = [];

  for (const filePath of collectFiles(libRoot)) {
    if (!statSync(filePath).isFile()) {
      continue;
    }
    const source = readFileSync(filePath, "utf8");
    if (source.includes(UNSAFE_SYMBOL)) {
      matches.push(filePath.replace(/\\/g, "/"));
    }
  }

  return matches;
}

describe("knowledge repository production security", () => {
  it("does not export PostgresKnowledgeRepositoryUnsafe from production repositories", () => {
    const indexSource = readFileSync(PRODUCTION_REPOSITORIES_INDEX, "utf8");
    expect(indexSource).not.toContain(UNSAFE_SYMBOL);
  });

  it("has no PostgresKnowledgeRepositoryUnsafe references under lib/", () => {
    expect(findUnsafeReferencesUnderLib()).toEqual([]);
  });
});
