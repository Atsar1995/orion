import {
  FAVORITE_ITEM_IDS,
  RECENT_ITEM_IDS,
  SEARCH_ITEMS,
} from "@/lib/search/search-data";
import type { SearchItem } from "@/lib/search/search-types";

export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export function getCommandPaletteShortcutLabel(): string {
  return isMacPlatform() ? "⌘ K" : "Ctrl K";
}

export function getSearchItemById(id: string): SearchItem | undefined {
  return SEARCH_ITEMS.find((item) => item.id === id);
}

export function getRecentItems(): SearchItem[] {
  return RECENT_ITEM_IDS.map(getSearchItemById).filter(
    (item): item is SearchItem => item !== undefined,
  );
}

export function getFavoriteItems(): SearchItem[] {
  return FAVORITE_ITEM_IDS.map(getSearchItemById).filter(
    (item): item is SearchItem => item !== undefined,
  );
}

export function clampIndex(index: number, length: number): number {
  if (length === 0) {
    return -1;
  }

  if (index < 0) {
    return length - 1;
  }

  if (index >= length) {
    return 0;
  }

  return index;
}

export function groupItemsByCategory(
  items: SearchItem[],
): Partial<Record<SearchItem["category"], SearchItem[]>> {
  return items.reduce<Partial<Record<SearchItem["category"], SearchItem[]>>>(
    (groups, item) => {
      const existing = groups[item.category] ?? [];
      groups[item.category] = [...existing, item];
      return groups;
    },
    {},
  );
}
