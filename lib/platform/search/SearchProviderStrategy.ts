import type { IndexedEntityRecord, SearchFilter, SearchMatchMode, SearchQuery } from "@/types/search";
import { searchRulesEngine } from "@/lib/platform/search/SearchRulesEngine";

/** Search provider strategy — internal indexing implementation (Strategy pattern). */
export class InMemorySearchProvider {
  search(entities: readonly IndexedEntityRecord[], query: SearchQuery): IndexedEntityRecord[] {
    const matchMode = query.matchMode ?? "keyword";
    let results = entities.filter((entity) => !entity.deleted);

    if (query.domainKey) {
      results = results.filter((entity) => entity.domainKey === query.domainKey);
    }

    if (query.entityType) {
      results = results.filter((entity) => entity.entityType === query.entityType);
    }

    if (query.filters) {
      results = results.filter((entity) =>
        query.filters!.every((filter) => this.applyFilter(entity, filter)),
      );
    }

    if (query.query?.trim()) {
      results = results.filter((entity) => {
        const searchable = `${entity.title} ${entity.content} ${entity.tags.join(" ")} ${Object.values(entity.metadata).join(" ")}`;
        return searchRulesEngine.matchesQuery(searchable, query.query!, matchMode);
      });
    }

    if (query.sort) {
      const { field, direction } = query.sort;
      results = [...results].sort((a, b) => {
        const aVal = this.resolveField(a, field);
        const bVal = this.resolveField(b, field);
        const cmp = aVal.localeCompare(bVal);
        return direction === "desc" ? -cmp : cmp;
      });
    } else if (query.query?.trim()) {
      results = [...results].sort((a, b) => {
        const aScore = searchRulesEngine.computeScore(`${a.title} ${a.content}`, query.query!, matchMode);
        const bScore = searchRulesEngine.computeScore(`${b.title} ${b.content}`, query.query!, matchMode);
        return bScore - aScore;
      });
    }

    return results;
  }

  buildFacets(entities: readonly IndexedEntityRecord[], facetFields: readonly string[]) {
    return facetFields.map((field) => {
      const counts = new Map<string, number>();
      for (const entity of entities) {
        const value = this.resolveField(entity, field);
        if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
      }
      return {
        field,
        values: [...counts.entries()].map(([value, count]) => ({ value, count })),
      };
    });
  }

  private applyFilter(entity: IndexedEntityRecord, filter: SearchFilter): boolean {
    const value = this.resolveField(entity, filter.field);
    const filterValue = filter.value;

    switch (filter.operator) {
      case "eq":
        return value === String(filterValue);
      case "neq":
        return value !== String(filterValue);
      case "contains":
        return value.toLowerCase().includes(String(filterValue).toLowerCase());
      case "gte":
        return value >= String(filterValue);
      case "lte":
        return value <= String(filterValue);
      case "in":
        return Array.isArray(filterValue) && filterValue.includes(value);
      default:
        return true;
    }
  }

  private resolveField(entity: IndexedEntityRecord, field: string): string {
    switch (field) {
      case "title":
        return entity.title;
      case "status":
        return entity.status ?? "";
      case "category":
        return entity.category ?? "";
      case "ownerId":
        return entity.ownerId ?? "";
      case "domainKey":
        return entity.domainKey;
      case "entityType":
        return entity.entityType;
      case "tags":
        return entity.tags.join(",");
      default:
        return entity.metadata[field] ?? "";
    }
  }
}

export const inMemorySearchProvider = new InMemorySearchProvider();
