export {
  ExecutiveNarrativeEngine,
  type ExecutiveNarrativeInput,
} from "@/lib/explainability/narrative/ExecutiveNarrativeEngine";
export {
  ExecutiveSummaryBuilder,
  type ExecutiveSummary,
  type ExecutiveSummaryInput,
} from "@/lib/explainability/narrative/ExecutiveSummaryBuilder";
export {
  StrengthExtractor,
  selectTopStrength,
  type NarrativeContributor,
} from "@/lib/explainability/narrative/StrengthExtractor";
export {
  ConcernExtractor,
  selectTopConcern,
  type ConcernExtraction,
  type NarrativeConcern,
} from "@/lib/explainability/narrative/ConcernExtractor";
export {
  InterpretationBuilder,
  type ExecutiveInterpretation,
  type InterpretationBuildInput,
} from "@/lib/explainability/narrative/InterpretationBuilder";
export {
  DEFAULT_EXECUTIVE_SUMMARY_WORD_LIMIT,
  EXECUTIVE_NARRATIVE_TEMPLATES,
  countExecutiveWords,
  enforceExecutiveSummaryWordLimit,
  renderNarrativeTemplate,
  type ExecutiveNarrativeTemplateId,
  type NarrativeTemplate,
  type NarrativeTemplateVariables,
} from "@/lib/explainability/narrative/NarrativeTemplates";
