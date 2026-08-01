import type { SearchItem } from "@/lib/search/search-types";
import { getSearchItemById } from "@/lib/search/search-utils";

const STORAGE_KEY = "orion-palette-recent";
const MAX_RECENT = 6;

/** Records a palette selection for dynamic recents. */
export function recordPaletteSelection(item: SearchItem): void {
  if (typeof window === "undefined" || !item.id) {
    return;
  }

  try {
    const existing = readRecentIds().filter((id) => id !== item.id);
    const next = [item.id, ...existing].slice(0, MAX_RECENT);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures.
  }
}

function readRecentIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

/** Dynamic recent palette items (most recent first). */
export function getDynamicRecentItems(): SearchItem[] {
  return readRecentIds()
    .map(getSearchItemById)
    .filter((item): item is SearchItem => item !== undefined);
}

/** Clears stored palette history (testing). */
export function clearPaletteHistory(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
