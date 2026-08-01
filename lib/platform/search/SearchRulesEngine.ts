import type {
  IndexEntityInput,
  RegisterEntityInput,
  SearchFilter,
  SearchMatchMode,
  SearchQuery,
} from "@/types/search";
import type { ServiceContext } from "@/types/services";

export type SearchValidationError = {
  readonly code: string;
  readonly message: string;
};

/** Domain-agnostic search validation (Mission P-010.5). */
export class SearchRulesEngine {
  validateOrganizationAccess(
    record: { readonly organizationId: string },
    context: ServiceContext,
  ): SearchValidationError | null {
    if (record.organizationId !== context.organizationId && context.role !== "super_admin") {
      return { code: "ORGANIZATION_ISOLATION", message: "Organization access denied." };
    }
    return null;
  }

  validateRegistration(input: RegisterEntityInput): SearchValidationError[] {
    const errors: SearchValidationError[] = [];
    if (!input.domainKey.trim()) errors.push({ code: "INVALID_DOMAIN", message: "Domain key is required." });
    if (!input.label.trim()) errors.push({ code: "INVALID_LABEL", message: "Entity label is required." });
    if (input.searchableFields.length === 0) {
      errors.push({ code: "NO_SEARCHABLE_FIELDS", message: "At least one searchable field is required." });
    }
    return errors;
  }

  validateIndexEntity(input: IndexEntityInput): SearchValidationError[] {
    const errors: SearchValidationError[] = [];
    if (!input.entityId.trim()) errors.push({ code: "INVALID_ENTITY_ID", message: "Entity id is required." });
    if (!input.title.trim()) errors.push({ code: "INVALID_TITLE", message: "Title is required." });
    if (!input.content.trim()) errors.push({ code: "INVALID_CONTENT", message: "Content is required." });
    return errors;
  }

  validateQuery(query: SearchQuery): SearchValidationError[] {
    const errors: SearchValidationError[] = [];
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    if (page < 1) errors.push({ code: "INVALID_PAGE", message: "Page must be >= 1." });
    if (pageSize < 1 || pageSize > 100) {
      errors.push({ code: "INVALID_PAGE_SIZE", message: "Page size must be between 1 and 100." });
    }

    if (query.filters) {
      for (const filter of query.filters) {
        errors.push(...this.validateFilter(filter));
      }
    }

    return errors;
  }

  validateFilter(filter: SearchFilter): SearchValidationError[] {
    const errors: SearchValidationError[] = [];
    if (!filter.field.trim()) errors.push({ code: "INVALID_FILTER_FIELD", message: "Filter field is required." });
    if (filter.value === undefined || filter.value === "") {
      errors.push({ code: "INVALID_FILTER_VALUE", message: "Filter value is required." });
    }
    return errors;
  }

  matchesQuery(text: string, query: string, mode: SearchMatchMode): boolean {
    const haystack = text.toLowerCase();
    const needle = query.toLowerCase().trim();
    if (!needle) return true;

    switch (mode) {
      case "exact":
        return haystack === needle;
      case "partial":
        return haystack.includes(needle);
      case "phrase":
        return haystack.includes(needle);
      case "boolean":
        return this.evaluateBooleanQuery(haystack, needle);
      case "keyword":
      default:
        return needle.split(/\s+/).every((term) => haystack.includes(term));
    }
  }

  evaluateBooleanQuery(haystack: string, expression: string): boolean {
    if (expression.includes(" AND ")) {
      return expression.split(" AND ").every((term) => haystack.includes(term.trim().toLowerCase()));
    }
    if (expression.includes(" OR ")) {
      return expression.split(" OR ").some((term) => haystack.includes(term.trim().toLowerCase()));
    }
    return haystack.includes(expression);
  }

  computeScore(text: string, query: string, mode: SearchMatchMode): number {
    if (!query.trim()) return 1;
    if (!this.matchesQuery(text, query, mode)) return 0;

    const haystack = text.toLowerCase();
    const needle = query.toLowerCase().trim();

    if (haystack.startsWith(needle)) return 1;
    if (haystack.includes(needle)) return 0.8;
    return 0.5;
  }

  buildSnippet(content: string, query: string, maxLength = 120): string {
    if (!query.trim()) return content.slice(0, maxLength);
    const lower = content.toLowerCase();
    const index = lower.indexOf(query.toLowerCase().trim());
    if (index < 0) return content.slice(0, maxLength);
    const start = Math.max(0, index - 30);
    return content.slice(start, start + maxLength);
  }
}

export const searchRulesEngine = new SearchRulesEngine();
