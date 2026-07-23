/** Search category identifiers for grouped results. */
export type SearchCategoryId = "navigation" | "commands" | "reports" | "settings";

export type SearchItem = {
  id: string;
  label: string;
  category: SearchCategoryId;
  description?: string;
  href?: string;
  keywords?: readonly string[];
  favorite?: boolean;
  recent?: boolean;
};

export type RankedSearchItem = {
  item: SearchItem;
  score: number;
};

/** Future extension points — not implemented in Mission 14C. */
export type SearchExtensionHooks = {
  naturalLanguageSearch?: never;
  aiCommands?: never;
  pinnedSearches?: never;
  workspaceSearch?: never;
  recentHistory?: never;
  voiceCommands?: never;
  permissionFilter?: never;
};
