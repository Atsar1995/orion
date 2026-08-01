import { randomUUID } from "crypto";
import {
  createMemoryId,
  type KnowledgeRepository,
} from "@/lib/executive/memory/repository/KnowledgeRepository";
import type { ExecutiveDecision, ExecutiveLearningSnapshot } from "@/types/decisions";
import type { MemoryEntry, MemoryCategory } from "@/types/executive/memory";
import type { ServiceContext } from "@/types/services";

function decisionToMemory(decision: ExecutiveDecision): MemoryEntry {
  return {
    id: createMemoryId(),
    organizationId: decision.organizationId,
    workspaceId: decision.workspaceId,
    workspace: decision.workspace,
    category: "executive_decision",
    title: decision.title || decision.recommendation.title,
    summary: decision.description || decision.recommendation.text,
    fullContext: [
      decision.recommendation.businessImpact,
      ...decision.timeline.map((entry) => `${entry.title}: ${entry.description}`),
    ].join(" · "),
    relatedEntities: decision.entityReference
      ? [
          {
            entityType: decision.entityReference.entityType,
            entityId: decision.entityReference.entityId,
            entityLabel: decision.entityReference.entityLabel,
          },
        ]
      : [],
    relatedDecisionIds: [decision.id, ...decision.relatedDecisionIds],
    evidence: decision.recommendation.evidence,
    authorId: decision.ownerId ?? decision.actions[0]?.executiveId ?? "system",
    authorName: decision.ownerName ?? decision.actions[0]?.executiveName ?? "ORION",
    createdAt: decision.createdAt,
    updatedAt: decision.updatedAt,
    confidence: decision.recommendation.confidenceScore,
    importance: Math.max(1, 6 - decision.recommendation.priority),
    tags: [
      decision.workspace,
      decision.recommendation.recommendationType,
      decision.status,
      "executive-decision",
    ],
    attachments: decision.attachments.map((attachment) => ({
      id: attachment.id,
      label: attachment.label,
      url: attachment.url,
      mimeType: attachment.mimeType,
    })),
    auditHistory: decision.auditHistory.map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp,
      actorId: entry.actorId,
      actorName: entry.actorName,
      action: entry.action,
      detail: entry.detail,
    })),
  };
}

function outcomeToMemory(decision: ExecutiveDecision): MemoryEntry[] {
  return decision.outcomes.map((outcome) => ({
    id: createMemoryId(),
    organizationId: decision.organizationId,
    workspaceId: decision.workspaceId,
    workspace: decision.workspace,
    category: "business_outcome" as const,
    title: `${decision.title || decision.recommendation.title} — outcome`,
    summary: `${outcome.label}: ${outcome.value}${outcome.unit}`,
    fullContext: `Outcome recorded for decision ${decision.id}.`,
    relatedEntities: [],
    relatedDecisionIds: [decision.id],
    evidence: [],
    authorId: decision.ownerId ?? "system",
    authorName: decision.ownerName ?? "ORION",
    createdAt: outcome.recordedAt,
    updatedAt: outcome.recordedAt,
    confidence: decision.recommendation.confidenceScore,
    importance: 4,
    tags: [decision.workspace, "outcome", outcome.metricType],
    attachments: [],
    auditHistory: [],
  }));
}

function lessonsToMemories(decision: ExecutiveDecision): MemoryEntry[] {
  return decision.lessonsLearned.map((lesson) => ({
    id: createMemoryId(),
    organizationId: decision.organizationId,
    workspaceId: decision.workspaceId,
    workspace: decision.workspace,
    category: "lesson_learned" as const,
    title: "Lesson learned",
    summary: lesson.text,
    fullContext: `Lesson from decision: ${decision.title || decision.recommendation.title}`,
    relatedEntities: [],
    relatedDecisionIds: [decision.id],
    evidence: [],
    authorId: lesson.recordedBy,
    authorName: lesson.recordedByName,
    createdAt: lesson.recordedAt,
    updatedAt: lesson.recordedAt,
    confidence: 80,
    importance: 5,
    tags: [decision.workspace, "lesson", "learning"],
    attachments: [],
    auditHistory: [],
  }));
}

function insightToMemory(
  insight: ExecutiveLearningSnapshot["insights"][number],
  context: ServiceContext,
): MemoryEntry {
  const now = new Date().toISOString();

  return {
    id: createMemoryId(),
    organizationId: context.organizationId,
    workspaceId: context.workspaceId,
    workspace: "executive",
    category: "historical_context",
    title: insight.headline,
    summary: insight.detail,
    fullContext: insight.detail,
    relatedEntities: [],
    relatedDecisionIds: [],
    evidence: [],
    authorId: context.userId,
    authorName: "ORION Learning",
    createdAt: now,
    updatedAt: now,
    confidence: 85,
    importance: 3,
    tags: ["pattern", insight.category, "learning"],
    attachments: [],
    auditHistory: [],
  };
}

/** Ingests decisions and learning into organizational memory (Mission P-004). */
export function ingestDecisionsIntoMemory(
  repository: KnowledgeRepository,
  decisions: ExecutiveDecision[],
  context: ServiceContext,
  learning?: ExecutiveLearningSnapshot,
): MemoryEntry[] {
  const ingested: MemoryEntry[] = [];

  for (const decision of decisions) {
    const existingForDecision = repository.findByDecisionId(decision.id, context);

    if (!existingForDecision.some((entry) => entry.category === "executive_decision")) {
      ingested.push(repository.create(decisionToMemory(decision)));
    }

    for (const outcomeMemory of outcomeToMemory(decision)) {
      const duplicate = existingForDecision.some(
        (entry) =>
          entry.category === "business_outcome" && entry.summary === outcomeMemory.summary,
      );
      if (!duplicate) {
        ingested.push(repository.create(outcomeMemory));
      }
    }

    for (const lessonMemory of lessonsToMemories(decision)) {
      const duplicate = existingForDecision.some(
        (entry) => entry.category === "lesson_learned" && entry.summary === lessonMemory.summary,
      );
      if (!duplicate) {
        ingested.push(repository.create(lessonMemory));
      }
    }
  }

  for (const insight of learning?.insights.slice(0, 5) ?? []) {
    const duplicate = repository
      .listAll(context)
      .some((entry) => entry.title === insight.headline && entry.category === "historical_context");
    if (!duplicate) {
      ingested.push(repository.create(insightToMemory(insight, context)));
    }
  }

  return ingested;
}

export function buildSeedMemoryEntries(context: ServiceContext): MemoryEntry[] {
  const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  const seed = (
    category: MemoryCategory,
    title: string,
    summary: string,
    workspace: string,
    tags: string[],
    entities: MemoryEntry["relatedEntities"] = [],
    importance = 4,
  ): MemoryEntry => ({
    id: createMemoryId(),
    organizationId: context.organizationId,
    workspaceId: context.workspaceId,
    workspace,
    category,
    title,
    summary,
    fullContext: summary,
    relatedEntities: entities,
    relatedDecisionIds: [],
    evidence: [],
    authorId: context.userId,
    authorName: "ORION Intelligence",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    confidence: 86,
    importance,
    tags,
    attachments: [],
    auditHistory: [
      {
        id: randomUUID(),
        timestamp: daysAgo(3),
        actorId: context.userId,
        actorName: "ORION Intelligence",
        action: "created",
        detail: title,
      },
    ],
  });

  return [
    seed(
      "customer",
      "Apex Retail — enterprise account",
      "High-value repeat guest with active renewal cycle.",
      "crm",
      ["customer", "enterprise", "crm"],
      [{ entityType: "customer", entityId: "cust-apex-retail", entityLabel: "Apex Retail" }],
      5,
    ),
    seed(
      "reservation",
      "VIP arrival — Room 305",
      "Premium suite reservation with service recovery requirement.",
      "hospitality",
      ["reservation", "vip", "hospitality"],
      [
        { entityType: "customer", entityId: "cust-orania-group", entityLabel: "ORANIA Group" },
        { entityType: "reservation", entityId: "res-305", entityLabel: "Room 305" },
      ],
      5,
    ),
    seed(
      "financial_event",
      "Supplier payment — ₹1.2L overdue",
      "Kitchen supplies invoice due today; impacts weekend operations.",
      "finance",
      ["finance", "payables", "risk"],
      [{ entityType: "supplier", entityId: "sup-kitchen", entityLabel: "Kitchen Supplies Co." }],
      5,
    ),
    seed(
      "meeting",
      "Q3 pipeline review",
      "Executive review of CRM forecast and enterprise upsell opportunities.",
      "crm",
      ["meeting", "pipeline", "crm"],
      [],
      3,
    ),
    seed(
      "project",
      "Weekend rate optimization",
      "Hospitality pricing project for peak occupancy weekend.",
      "hospitality",
      ["project", "pricing", "hospitality"],
      [{ entityType: "project", entityId: "proj-rate-opt", entityLabel: "Rate Optimization" }],
      4,
    ),
    seed(
      "recommendation",
      "Supplier contract renegotiation",
      "High-confidence savings opportunity from finance intelligence.",
      "finance",
      ["recommendation", "savings", "finance"],
      [],
      5,
    ),
    seed(
      "operational_event",
      "Guest satisfaction recovery initiated",
      "Operations team engaged after negative sentiment signal.",
      "hospitality",
      ["operations", "guest-experience"],
      [{ entityType: "reservation", entityId: "res-305", entityLabel: "Room 305" }],
      4,
    ),
    seed(
      "policy",
      "Executive escalation policy",
      "Critical guest issues must be resolved within 4 hours.",
      "executive",
      ["policy", "escalation"],
      [],
      3,
    ),
  ];
}
