import type { RecommendationCategory } from "@/types/recommendations";

export const RECOMMENDATION_CATEGORIES: RecommendationCategory[] = [
  "revenue",
  "sales",
  "marketing",
  "finance",
  "operations",
  "customer-experience",
  "hospitality",
  "commerce",
  "productivity",
  "risk",
  "compliance",
  "growth",
];

const CATEGORY_LABELS: Record<RecommendationCategory, string> = {
  revenue: "Revenue",
  sales: "Sales",
  marketing: "Marketing",
  finance: "Finance",
  operations: "Operations",
  "customer-experience": "Customer Experience",
  hospitality: "Hospitality",
  commerce: "Commerce",
  productivity: "Productivity",
  risk: "Risk",
  compliance: "Compliance",
  growth: "Growth",
};

const WORKSPACE_CATEGORY_MAP: Record<string, RecommendationCategory> = {
  Finance: "finance",
  CRM: "customer-experience",
  Marketing: "marketing",
  Hospitality: "hospitality",
  Commerce: "commerce",
};

const LEGACY_CATEGORY_MAP: Record<string, RecommendationCategory> = {
  executive: "operations",
  "follow-up": "productivity",
  growth: "growth",
  risk: "risk",
  priority: "operations",
};

export function getCategoryLabel(category: RecommendationCategory): string {
  return CATEGORY_LABELS[category];
}

export function mapWorkspaceToCategory(workspace?: string): RecommendationCategory {
  if (!workspace) {
    return "operations";
  }

  return WORKSPACE_CATEGORY_MAP[workspace] ?? "operations";
}

export function mapLegacyCategory(
  category?: string,
  workspace?: string,
): RecommendationCategory {
  if (category && category in LEGACY_CATEGORY_MAP) {
    return LEGACY_CATEGORY_MAP[category];
  }

  return mapWorkspaceToCategory(workspace);
}

export function mapProviderIdToCategory(providerId: string): RecommendationCategory {
  const map: Record<string, RecommendationCategory> = {
    crm: "customer-experience",
    finance: "finance",
    marketing: "marketing",
    hospitality: "hospitality",
    commerce: "commerce",
    calendar: "productivity",
    email: "productivity",
  };

  return map[providerId] ?? "operations";
}
