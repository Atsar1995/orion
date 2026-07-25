import type { BriefCategory, BriefTemplate } from "@/types/brief";

const STANDARD_SECTIONS: BriefCategory[] = [
  "executive-summary",
  "key-highlights",
  "critical-issues",
  "opportunities",
  "revenue",
  "customer",
  "marketing",
  "operations",
  "finance",
  "priorities",
  "actions",
];

/** Default ORION daily brief template — all standard sections enabled. */
export const DEFAULT_BRIEF_TEMPLATE: BriefTemplate = {
  id: "orion-default",
  name: "ORION Default Daily Brief",
  sections: STANDARD_SECTIONS,
  enabled: true,
};

/** Hospitality-focused template — emphasizes operations and revenue. */
export const HOSPITALITY_BRIEF_TEMPLATE: BriefTemplate = {
  id: "hospitality-executive",
  name: "Hospitality Executive Brief",
  organizationId: "hospitality",
  sections: [
    "executive-summary",
    "key-highlights",
    "critical-issues",
    "operations",
    "revenue",
    "customer",
    "priorities",
    "actions",
  ],
  enabled: true,
};

const TEMPLATES: BriefTemplate[] = [DEFAULT_BRIEF_TEMPLATE, HOSPITALITY_BRIEF_TEMPLATE];

export function getBriefTemplate(templateId?: string): BriefTemplate {
  if (!templateId) {
    return DEFAULT_BRIEF_TEMPLATE;
  }

  return TEMPLATES.find((template) => template.id === templateId) ?? DEFAULT_BRIEF_TEMPLATE;
}

export function listBriefTemplates(): BriefTemplate[] {
  return TEMPLATES.filter((template) => template.enabled);
}

export function getSectionTitle(category: BriefCategory): string {
  const titles: Record<BriefCategory, string> = {
    "executive-summary": "Executive Summary",
    "key-highlights": "Key Business Highlights",
    "critical-issues": "Critical Issues",
    opportunities: "Opportunities",
    revenue: "Revenue Summary",
    customer: "Customer Summary",
    marketing: "Marketing Summary",
    operations: "Operations Summary",
    finance: "Finance Summary",
    priorities: "Today's Top Priorities",
    actions: "Recommended Executive Actions",
  };

  return titles[category];
}
