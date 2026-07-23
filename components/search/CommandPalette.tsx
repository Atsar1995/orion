"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/search/EmptyState";
import { FavoriteItems } from "@/components/search/FavoriteItems";
import { NoResults } from "@/components/search/NoResults";
import { RecentItems } from "@/components/search/RecentItems";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "@/components/search/SearchResults";
import { rankSearchItems } from "@/lib/search/search-index";
import type { SearchItem } from "@/lib/search/search-types";
import {
  clampIndex,
  getFavoriteItems,
  getRecentItems,
} from "@/lib/search/search-utils";
import { cn } from "@/lib/utils";

type CommandPaletteProps = {
  onClose: () => void;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const recentItems = useMemo(() => getRecentItems(), []);
  const favoriteItems = useMemo(() => getFavoriteItems(), []);
  const searchResults = useMemo(
    () => rankSearchItems(query),
    [query],
  );

  const hasQuery = query.trim().length > 0;

  const selectableItems = useMemo(() => {
    if (hasQuery) {
      return searchResults;
    }

    return [...recentItems, ...favoriteItems];
  }, [favoriteItems, hasQuery, recentItems, searchResults]);

  const safeActiveIndex =
    selectableItems.length === 0
      ? -1
      : Math.min(activeIndex, selectableItems.length - 1);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(0);
  }, []);

  const handleSelect = useCallback(
    (item: SearchItem) => {
      if (item.href) {
        router.push(item.href);
      }

      onClose();
    },
    [onClose, router],
  );

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (selectableItems.length === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => clampIndex(current + 1, selectableItems.length));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => clampIndex(current - 1, selectableItems.length));
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        setActiveIndex(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        setActiveIndex(selectableItems.length - 1);
        return;
      }

      if (event.key === "Enter" && safeActiveIndex >= 0) {
        event.preventDefault();
        const selected = selectableItems[safeActiveIndex];

        if (selected) {
          handleSelect(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSelect, onClose, safeActiveIndex, selectableItems]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(dialog);

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", handleTab);

    return () => dialog.removeEventListener("keydown", handleTab);
  }, []);

  const recentStartIndex = 0;
  const favoriteStartIndex = recentItems.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm transition-opacity duration-[var(--orion-duration-normal)]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={cn(
          "w-full max-w-2xl overflow-hidden rounded-orion-lg border border-white/[0.08] bg-orion-navy shadow-[var(--orion-shadow-lg)] transition-transform duration-[var(--orion-duration-normal)]",
        )}
      >
        <SearchInput
          value={query}
          onChange={handleQueryChange}
          inputRef={inputRef}
        />

        <div
          id="command-palette-results"
          role="listbox"
          aria-label="Search results"
          className="max-h-[min(60vh,480px)] overflow-y-auto overscroll-contain"
        >
          {!hasQuery ? (
            <>
              <EmptyState />
              <div className="space-y-3 border-t border-white/[0.06] px-2 py-3">
                <RecentItems
                  items={recentItems}
                  activeIndex={safeActiveIndex}
                  startIndex={recentStartIndex}
                  onSelect={handleSelect}
                  onHover={setActiveIndex}
                />
                <FavoriteItems
                  items={favoriteItems}
                  activeIndex={safeActiveIndex}
                  startIndex={favoriteStartIndex}
                  onSelect={handleSelect}
                  onHover={setActiveIndex}
                />
              </div>
            </>
          ) : searchResults.length > 0 ? (
            <SearchResults
              items={searchResults}
              activeIndex={safeActiveIndex}
              onSelect={handleSelect}
              onHover={setActiveIndex}
            />
          ) : (
            <NoResults />
          )}
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-white/[0.06] px-4 py-2.5 text-[11px] font-light text-white/35">
          <span>Navigate with ↑ ↓ · Select with Enter</span>
          <span>Esc to close</span>
        </footer>
      </div>
    </div>
  );
}
