export {
  ExplainabilityEngine,
  defaultExplainabilityEngine,
} from "@/lib/explainability/ExplainabilityEngine";
export {
  ExplainabilityPipeline,
  toConfidenceContext,
  type ExplainabilityContext,
  type ExplainabilityPipelineInput,
} from "@/lib/explainability/ExplainabilityPipeline";
export {
  createExplainabilityConfig,
  DEFAULT_EXPLAINABILITY_CONFIG,
  type ExplainabilityConfig,
} from "@/lib/explainability/ExplainabilityConfig";
export {
  isExplainabilitySuccess,
  type ExplainabilityEngineResult,
  type ExplainabilityError,
  type ExplainabilityErrorCode,
  type ExplainabilitySnapshot,
} from "@/lib/explainability/ExplainabilityResult";

export type { Confidence } from "@/lib/explainability/models/Confidence";
export type {
  ConfidenceFactor,
  ConfidenceFactorType,
  ConfidenceLevel,
} from "@/lib/explainability/models/ConfidenceFactor";
export type { ExecutiveNarrative } from "@/lib/explainability/models/ExecutiveNarrative";
export type { Explanation } from "@/lib/explainability/models/Explanation";
export type {
  ExplanationImportance,
  ExplanationItem,
  SupportingKPIReference,
} from "@/lib/explainability/models/ExplanationItem";
export type {
  RecommendationContext,
  RecommendationContextType,
} from "@/lib/explainability/models/RecommendationContext";

export {
  ConfidenceEngine,
  type ConfidenceAssessmentContext,
} from "@/lib/explainability/engine/ConfidenceEngine";
export {
  calculateConfidence,
  clampConfidenceScore,
  resolveConfidenceLevel,
  type ConfidenceAssessmentInput,
} from "@/lib/explainability/engine/ConfidenceCalculator";
export {
  DEFAULT_CONFIDENCE_RULES,
  type ConfidenceDeductionRules,
  type ConfidenceLevelThresholds,
  type ConfidenceRules,
} from "@/lib/explainability/engine/ConfidenceRules";

export {
  ExplanationBuilder,
  type ExplanationBuildInput,
} from "@/lib/explainability/builder/ExplanationBuilder";
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
export {
  NarrativeComposer,
  type NarrativeComposeInput,
} from "@/lib/explainability/builder/NarrativeComposer";

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
