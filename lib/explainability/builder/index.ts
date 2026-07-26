export { ExplanationBuilder, type ExplanationBuildInput } from "@/lib/explainability/builder/ExplanationBuilder";
export {
  ContributionAnalyzer,
  DEFAULT_CONTRIBUTION_IMPORTANCE_THRESHOLDS,
  selectTopContributions,
  type ContributionAnalysis,
  type ContributionGroup,
  type ContributionImportanceThresholds,
  type RankedContribution,
} from "@/lib/explainability/builder/ContributionAnalyzer";
export {
  ExplanationFormatter,
  type ExplanationFormatInput,
  type FormattedExplanation,
} from "@/lib/explainability/builder/ExplanationFormatter";
export { NarrativeComposer, type NarrativeComposeInput } from "@/lib/explainability/builder/NarrativeComposer";
export {
  EXPLANATION_ITEM_TEMPLATES,
  FORMATTER_TEMPLATES,
  NARRATIVE_TEMPLATES,
  renderTemplate,
  type MessageTemplate,
  type NarrativeTemplateId,
  type TemplateVariables,
} from "@/lib/explainability/builder/MessageTemplates";
