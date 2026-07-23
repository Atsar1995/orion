import { SearchCategory } from "@/components/search/SearchCategory";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import type { SearchItem } from "@/lib/search/search-types";

type FavoriteItemsProps = {
  items: SearchItem[];
  activeIndex: number;
  startIndex: number;
  onSelect: (item: SearchItem) => void;
  onHover: (index: number) => void;
};

export function FavoriteItems({
  items,
  activeIndex,
  startIndex,
  onSelect,
  onHover,
}: FavoriteItemsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <SearchCategory label="Favorites">
      {items.map((item, index) => {
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
  );
}
