import { SEARCH_ITEMS } from "@/lib/search/search-data";
import type { RankedSearchItem, SearchItem } from "@/lib/search/search-types";

const EXACT_MATCH_SCORE = 1000;
const STARTS_WITH_SCORE = 800;
const PARTIAL_MATCH_SCORE = 600;
const KEYWORD_MATCH_SCORE = 400;
const RECENT_BONUS = 50;
const FAVORITE_BONUS = 30;

function scoreItem(item: SearchItem, query: string): number | null {
  const label = item.label.toLowerCase();
  const keywords = (item.keywords ?? []).map((keyword) => keyword.toLowerCase());

  let score: number | null = null;

  if (label === query) {
    score = EXACT_MATCH_SCORE;
  } else if (label.startsWith(query)) {
    score = STARTS_WITH_SCORE;
  } else if (label.includes(query)) {
    score = PARTIAL_MATCH_SCORE;
  } else if (keywords.some((keyword) => keyword.includes(query))) {
    score = KEYWORD_MATCH_SCORE;
  }

  if (score === null) {
    return null;
  }

  if (item.recent) {
    score += RECENT_BONUS;
  }

  if (item.favorite) {
    score += FAVORITE_BONUS;
  }

  return score;
}

/** Rank search items: exact → starts with → partial → recent/favorite bonuses. */
export function rankSearchItems(
  query: string,
  items: SearchItem[] = SEARCH_ITEMS,
): SearchItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const ranked: RankedSearchItem[] = [];

  for (const item of items) {
    const score = scoreItem(item, normalizedQuery);

    if (score !== null) {
      ranked.push({ item, score });
    }
  }

  return ranked
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.item.label.localeCompare(b.item.label);
    })
    .map((entry) => entry.item);
}
