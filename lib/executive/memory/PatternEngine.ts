import type { KnowledgeRepository } from "@/lib/executive/memory/repository/KnowledgeRepository";
import type { MemoryEntry, MemoryPattern } from "@/types/executive/memory";
import type { ExecutiveDecision, ExecutiveLearningSnapshot } from "@/types/decisions";
import type { ServiceContext } from "@/types/services";

function countByTag(entries: MemoryEntry[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    for (const tag of entry.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return counts;
}

/** Identifies recurring organizational patterns (Mission P-004). */
export class PatternEngine {
  constructor(private readonly repository: KnowledgeRepository) {}

  analyze(
    context: ServiceContext,
    decisions: ExecutiveDecision[] = [],
    learning?: ExecutiveLearningSnapshot,
  ): MemoryPattern[] {
    const entries = this.repository.listAll(context);
    const patterns: MemoryPattern[] = [];
    const tagCounts = countByTag(entries);

    for (const [tag, count] of tagCounts.entries()) {
      if (count >= 2) {
        patterns.push({
          id: `pattern-tag-${tag}`,
          patternType: tag.includes("risk") ? "recurring_issue" : "business_pattern",
          title: `Recurring theme: ${tag}`,
          description: `${count} memory entries share the "${tag}" tag.`,
          confidence: Math.min(95, 60 + count * 8),
          occurrenceCount: count,
          relatedMemoryIds: entries.filter((entry) => entry.tags.includes(tag)).map((entry) => entry.id),
        });
      }
    }

    const completed = decisions.filter((decision) => decision.status === "completed");
    if (completed.length >= 2) {
      patterns.push({
        id: "pattern-completion",
        patternType: "successful_strategy",
        title: "Strong decision follow-through",
        description: `${completed.length} executive decisions completed with recorded outcomes.`,
        confidence: 82,
        occurrenceCount: completed.length,
        relatedMemoryIds: entries
          .filter((entry) => entry.category === "executive_decision")
          .map((entry) => entry.id),
      });
    }

    const delegated = decisions.filter((decision) => decision.status === "delegated");
    if (delegated.length >= 2) {
      patterns.push({
        id: "pattern-delegation",
        patternType: "executive_behaviour",
        title: "Delegation pattern detected",
        description: "Executive consistently delegates operational decisions to domain leads.",
        confidence: 78,
        occurrenceCount: delegated.length,
        relatedMemoryIds: [],
      });
    }

    for (const insight of learning?.insights.slice(0, 3) ?? []) {
      patterns.push({
        id: `pattern-insight-${insight.id}`,
        patternType:
          insight.category === "behavior"
            ? "executive_behaviour"
            : insight.category === "outcome"
              ? "successful_strategy"
              : "business_pattern",
        title: insight.headline,
        description: insight.detail,
        confidence: 85,
        occurrenceCount: 1,
        relatedMemoryIds: [],
      });
    }

    if (entries.filter((entry) => entry.category === "lesson_learned").length >= 2) {
      patterns.push({
        id: "pattern-learning",
        patternType: "operational_trend",
        title: "Organizational learning accelerating",
        description: "Lessons learned are being captured and linked to decisions.",
        confidence: 88,
        occurrenceCount: entries.filter((entry) => entry.category === "lesson_learned").length,
        relatedMemoryIds: entries
          .filter((entry) => entry.category === "lesson_learned")
          .map((entry) => entry.id),
      });
    }

    return patterns.sort((left, right) => right.confidence - left.confidence);
  }
}

export const createPatternEngine = (repository: KnowledgeRepository) =>
  new PatternEngine(repository);
