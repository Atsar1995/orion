"use client";

import { useMemo, useState, useTransition } from "react";
import { SearchBox } from "@/components/ui/SearchBox";
import type {
  IntegrationCategory as IntegrationCategoryId,
  IntegrationCenterSnapshot,
} from "@/lib/integrations/types";
import {
  INTEGRATION_CATEGORIES,
  INTEGRATION_CATEGORY_LABELS,
} from "@/lib/integrations/types";
import {
  filterIntegrationProviders,
  groupProvidersByCategory,
} from "@/lib/integrations/integration-center";
import { IntegrationCategory } from "@/components/integrations/IntegrationCategory";
import { cn } from "@/lib/utils";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";

type IntegrationFiltersProps = {
  snapshot: IntegrationCenterSnapshot;
};

type StatusFilter = "all" | "connected" | "disconnected" | "error";

/** Client-side filters and grouped provider rendering for the Integration Center. */
export function IntegrationFilters({ snapshot }: IntegrationFiltersProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IntegrationCategoryId | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [, startTransition] = useTransition();

  const filteredProviders = useMemo(
    () =>
      filterIntegrationProviders(snapshot.providers, {
        query,
        category,
        status,
      }),
    [snapshot.providers, query, category, status],
  );

  const grouped = useMemo(
    () => groupProvidersByCategory(filteredProviders),
    [filteredProviders],
  );

  const visibleCategories = INTEGRATION_CATEGORIES.filter(
    (entry) => (grouped[entry.id]?.length ?? 0) > 0,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox
          value={query}
          onChange={(value) => {
            startTransition(() => setQuery(value));
          }}
          placeholder="Search providers..."
          className="max-w-md"
        />

        <div className="flex flex-wrap gap-2">
          {(["all", "connected", "disconnected", "error"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={cn(
                QUICK_ACTION_BUTTON_CLASSNAME,
                "rounded-orion-md px-3 py-1.5 text-xs",
                status === value && "border-orion-gold/30 bg-orion-gold/10 text-orion-gold",
              )}
            >
              {value === "all" ? "All Status" : value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            QUICK_ACTION_BUTTON_CLASSNAME,
            "rounded-orion-md px-3 py-1.5 text-xs",
            category === "all" && "border-orion-gold/30 bg-orion-gold/10 text-orion-gold",
          )}
        >
          All Categories
        </button>
        {INTEGRATION_CATEGORIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setCategory(entry.id)}
            className={cn(
              QUICK_ACTION_BUTTON_CLASSNAME,
              "rounded-orion-md px-3 py-1.5 text-xs",
              category === entry.id && "border-orion-gold/30 bg-orion-gold/10 text-orion-gold",
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {filteredProviders.length === 0 ? (
        <p className="text-sm font-light text-white/45">
          No providers match the current filters.
        </p>
      ) : (
        <div className="space-y-8">
          {visibleCategories.map((entry) => (
            <IntegrationCategory
              key={entry.id}
              category={entry.id}
              label={entry.label}
              description={entry.description}
              providers={grouped[entry.id] ?? []}
              syncHistory={snapshot.syncHistory}
              logs={snapshot.logs}
            />
          ))}
        </div>
      )}

      {category !== "all" && visibleCategories.length === 0 && filteredProviders.length > 0 ? (
        <IntegrationCategory
          category={category}
          label={INTEGRATION_CATEGORY_LABELS[category]}
          description="Filtered provider connections"
          providers={filteredProviders}
          syncHistory={snapshot.syncHistory}
          logs={snapshot.logs}
        />
      ) : null}
    </div>
  );
}
