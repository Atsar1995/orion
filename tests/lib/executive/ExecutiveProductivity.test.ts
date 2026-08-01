import { describe, expect, it } from "vitest";
import { searchExecutiveEntities } from "@/lib/search/entity-search";
import { searchCommandPalette } from "@/lib/search/search-index";

describe("entity search", () => {
  it("finds customers by name", () => {
    const results = searchExecutiveEntities("oran");

    expect(results.some((item) => item.label.includes("OranIA"))).toBe(true);
    expect(results[0]?.href).toMatch(/^\/crm\/customers\//);
    expect(results[0]?.category).toBe("entities");
  });

  it("finds finance routes by label", () => {
    const results = searchExecutiveEntities("cash");

    expect(results.some((item) => item.href === "/finance/cash")).toBe(true);
  });

  it("merges entity results in command palette search", () => {
    const results = searchCommandPalette("oran");

    expect(results.some((item) => item.category === "entities")).toBe(true);
    expect(results.some((item) => item.href === "/brief")).toBe(false);
  });
});

describe("keyboard shortcuts", () => {
  it("matches meta shift chord", async () => {
    const { matchesShortcutChord } = await import("@/lib/executive/keyboard-shortcuts");

    const event = {
      key: "B",
      metaKey: true,
      ctrlKey: false,
      shiftKey: true,
      altKey: false,
    } as KeyboardEvent;

    expect(matchesShortcutChord(event, ["Meta+Shift+B"])).toBe(true);
  });
});
