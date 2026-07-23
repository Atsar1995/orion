import { SearchCategory } from "@/components/search/SearchCategory";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import { SEARCH_CATEGORY_LABELS } from "@/lib/search/search-data";
import type { SearchItem } from "@/lib/search/search-types";
import { groupItemsByCategory } from "@/lib/search/search-utils";

type SearchResultsProps = {
  items: SearchItem[];
  activeIndex: number;
  onSelect: (item: SearchItem) => void;
  onHover: (index: number) => void;
};

const CATEGORY_ORDER: SearchItem["category"][] = [
  "navigation",
  "commands",
  "reports",
  "settings",
];

export function SearchResults({
  items,
  activeIndex,
  onSelect,
  onHover,
}: SearchResultsProps) {
  const grouped = groupItemsByCategory(items);

  const sections = CATEGORY_ORDER.reduce<
    Array<{
      category: SearchItem["category"];
      items: SearchItem[];
      startIndex: number;
    }>
  >((accumulator, category) => {
    const categoryItems = grouped[category];

    if (!categoryItems || categoryItems.length === 0) {
      return accumulator;
    }

    const startIndex =
      accumulator.length === 0
        ? 0
        : accumulator[accumulator.length - 1].startIndex +
          accumulator[accumulator.length - 1].items.length;

    accumulator.push({
      category,
      items: categoryItems,
      startIndex,
    });

    return accumulator;
  }, []);

  return (
    <div className="space-y-3 px-2 py-2">
      {sections.map(({ category, items: categoryItems, startIndex }) => (
        <SearchCategory key={category} label={SEARCH_CATEGORY_LABELS[category]}>
          {categoryItems.map((item, index) => {
            const globalIndex = startIndex + index;

            return (
              <SearchResultItem
                key={item.id}
                id={`command-palette-option-${globalIndex}`}
                item={item}
                isActive={activeIndex === globalIndex}
                onSelect={onSelect}
                onHover={() => onHover(globalIndex)}
              />
            );
          })}
        </SearchCategory>
      ))}
    </div>
  );
}
