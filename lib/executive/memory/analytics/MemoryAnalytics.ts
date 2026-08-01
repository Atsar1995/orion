import type { KnowledgeRepository } from "@/lib/executive/memory/repository/KnowledgeRepository";
import type { MemoryAnalyticsSnapshot, MemoryCategory } from "@/types/executive/memory";
import type { ExecutiveDecision } from "@/types/decisions";
import type { ServiceContext } from "@/types/services";

function groupByDate(entries: { createdAt: string }[]): MemoryAnalyticsSnapshot["knowledgeGrowth"] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const date = entry.createdAt.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([date, count]) => ({ date, count }));
}

/** Memory platform analytics (Mission P-004). */
export class MemoryAnalytics {
  constructor(private readonly repository: KnowledgeRepository) {}

  buildSnapshot(context: ServiceContext, decisions: ExecutiveDecision[] = []): MemoryAnalyticsSnapshot {
    const entries = this.repository.listAll(context);
    const relationships = this.repository.listRelationships(context);
    const total = entries.length || 1;

    const categoryCounts = new Map<MemoryCategory, number>();
    const tagCounts = new Map<string, number>();

    for (const entry of entries) {
      categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1);
      for (const tag of entry.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    const decisionMemories = entries.filter((entry) => entry.category === "executive_decision").length;
    const linkedDecisions = new Set(entries.flatMap((entry) => entry.relatedDecisionIds)).size;
    const lessons = entries.filter((entry) => entry.category === "lesson_learned").length;
    const completedDecisions = decisions.filter((decision) => decision.status === "completed").length;

    const maxPossibleRelationships = Math.max(1, (entries.length * (entries.length - 1)) / 2);
    const relationshipDensity = Math.round((relationships.length / maxPossibleRelationships) * 100);

    return {
      generatedAt: new Date().toISOString(),
      totalMemories: entries.length,
      knowledgeGrowth: groupByDate(entries),
      relationshipDensity,
      knowledgeReuseRate: Math.round((linkedDecisions / total) * 100),
      decisionRecallRate:
        decisionMemories === 0
          ? 0
          : Math.round((decisionMemories / Math.max(decisions.length, 1)) * 100),
      searchEffectiveness: Math.min(95, 70 + Math.round(entries.length / 2)),
      learningRate:
        lessons === 0 ? 0 : Math.round((lessons / Math.max(completedDecisions, 1)) * 100),
      byCategory: [...categoryCounts.entries()]
        .map(([category, count]) => ({ category, count }))
        .sort((left, right) => right.count - left.count),
      topTags: [...tagCounts.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count })),
    };
  }
}

export const createMemoryAnalytics = (repository: KnowledgeRepository) => new MemoryAnalytics(repository);
