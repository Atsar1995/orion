/** Mock morning brief widget payload. */
export type MockMorningBriefData = {
  readonly headline: string;
  readonly summary: string;
  readonly keyPoints: readonly string[];
  readonly generatedAt: string;
  readonly lifecycle: "fresh" | "updated" | "stale";
};

/** Mock executive narrative widget payload. */
export type MockExecutiveNarrativeData = {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly focusArea: string;
};

export const MOCK_MORNING_BRIEF: MockMorningBriefData = {
  headline: "Thursday opens with stable finance and one hospitality attention item.",
  summary:
    "Revenue is tracking ahead of plan. Occupancy softened overnight in the boutique portfolio. One guest escalation needs a response before noon.",
  keyPoints: [
    "Finance revenue +8.2% week-on-week",
    "Hospitality occupancy 84% with one property below target",
    "One critical guest complaint awaiting response",
  ],
  generatedAt: "2026-07-26T06:00:00.000Z",
  lifecycle: "fresh",
} as const;

export const MOCK_EXECUTIVE_NARRATIVE: MockExecutiveNarrativeData = {
  title: "Executive Narrative",
  focusArea: "Protect guest experience while sustaining revenue momentum.",
  paragraphs: [
    "Finance continues to outperform the weekly plan with stable receivables.",
    "Hospitality attention is concentrated in occupancy variance at the boutique portfolio.",
    "The highest-impact action today is resolving the guest escalation before it affects reviews.",
  ],
} as const;
