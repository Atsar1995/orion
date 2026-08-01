/** Executive personalization — local preferences (Mission 19C). */

export type ExecutiveFocus = "general" | "sales" | "finance" | "operations";

export type ExecutivePreferences = {
  focus: ExecutiveFocus;
  briefSecondaryExpanded: boolean;
  financeNavExpanded: boolean;
};

const STORAGE_KEY = "orion-executive-preferences";

const DEFAULT_PREFERENCES: ExecutivePreferences = {
  focus: "general",
  briefSecondaryExpanded: false,
  financeNavExpanded: false,
};

function readStorage(): Partial<ExecutivePreferences> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as Partial<ExecutivePreferences>;
  } catch {
    return null;
  }
}

/** Reads executive preferences from local storage. */
export function getExecutivePreferences(): ExecutivePreferences {
  const stored = readStorage();

  if (!stored) {
    return DEFAULT_PREFERENCES;
  }

  return {
    ...DEFAULT_PREFERENCES,
    ...stored,
  };
}

/** Persists executive preferences. */
export function setExecutivePreferences(
  patch: Partial<ExecutivePreferences>,
): ExecutivePreferences {
  const next = {
    ...getExecutivePreferences(),
    ...patch,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

/** Palette favourite IDs boosted by executive focus. */
export function getFocusBoostedFavoriteIds(focus: ExecutiveFocus): readonly string[] {
  switch (focus) {
    case "sales":
      return ["nav-brief", "nav-crm", "nav-crm-opportunities"];
    case "finance":
      return ["nav-brief", "nav-finance", "nav-finance-cash", "report-revenue"];
    case "operations":
      return ["nav-brief", "nav-hospitality", "nav-command-center"];
    default:
      return ["nav-brief", "report-executive-brief", "report-revenue"];
  }
}
