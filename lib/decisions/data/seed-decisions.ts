import {
  createActionId,
  createDecisionId,
  createTimelineId,
} from "@/lib/decisions/repository/DecisionRepository";
import { InMemoryDecisionRepository } from "@/lib/decisions/repository/InMemoryDecisionRepository";
import type { ExecutiveDecision } from "@/types/decisions";

const ORG_ID = "org-orania";
const WORKSPACE_ID = "workspace-orania";
const EXECUTIVE_ID = "user-executive";
const EXECUTIVE_NAME = "Mohammad Shafi";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function buildSeedDecision(input: {
  id: string;
  title: string;
  status: ExecutiveDecision["status"];
  type: ExecutiveDecision["recommendation"]["recommendationType"];
  value: number;
  daysAgo: number;
  action?: ExecutiveDecision["actions"][number]["action"];
  confidenceScore?: number;
  delegateName?: string;
  relatedDecisionIds?: readonly string[];
}): ExecutiveDecision {
  const createdAt = daysAgo(input.daysAgo);
  const updatedAt = daysAgo(Math.max(0, input.daysAgo - 1));

  const action = input.action
    ? {
        id: createActionId(),
        action: input.action,
        executiveId: EXECUTIVE_ID,
        executiveName: EXECUTIVE_NAME,
        timestamp: updatedAt,
        delegateName: input.delegateName,
      }
    : null;

  return {
    id: input.id,
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    workspace: input.type === "follow-up" ? "crm" : input.type === "risk" ? "finance" : "executive",
    title: input.title,
    description: `${input.title} — seeded executive decision for analytics.`,
    urgency: input.value >= 20000 ? "high" : "medium",
    recommendation: {
      recommendationId: `seed-rec-${input.id}`,
      title: input.title,
      text: `${input.title} — seeded executive decision for analytics.`,
      evidence: [
        {
          id: `ev-${input.id}`,
          type: "metric",
          source: "ORION Intelligence",
          label: input.title,
        },
      ],
      confidenceScore: input.confidenceScore ?? 86,
      confidenceLabel: (input.confidenceScore ?? 86) >= 75 ? "high" : "medium",
      businessImpact: `Estimated impact ${input.value} USD`,
      trigger: "Daily intelligence scan",
      sourceServices: ["CRM", "Finance"],
      priority: 1,
      riskLevel: "medium",
      estimatedValue: input.value,
      recommendationType: input.type,
    },
    status: input.status,
    ownerId: EXECUTIVE_ID,
    ownerName: EXECUTIVE_NAME,
    delegatedToName: input.delegateName,
    createdAt,
    updatedAt,
    decisionDate: action ? updatedAt : undefined,
    completionDate: input.status === "completed" ? updatedAt : undefined,
    actions: action ? [action] : [],
    outcomes:
      input.status === "completed"
        ? [
            {
              id: `outcome-${input.id}`,
              workspace: "crm",
              metricType: "opportunity_won",
              label: "Value captured",
              value: input.value,
              unit: " USD",
              recordedAt: updatedAt,
            },
          ]
        : [],
    lessonsLearned: [],
    relatedDecisionIds: input.relatedDecisionIds ?? [],
    attachments: [],
    auditHistory: [
      {
        id: createTimelineId(),
        timestamp: createdAt,
        actorId: EXECUTIVE_ID,
        actorName: EXECUTIVE_NAME,
        action: "created",
        detail: input.title,
      },
    ],
    timeline: [
      {
        id: createTimelineId(),
        timestamp: createdAt,
        type: "created",
        title: "Decision generated",
        description: input.title,
      },
      ...(action
        ? [
            {
              id: createTimelineId(),
              timestamp: updatedAt,
              type: "action" as const,
              title: `Action: ${action.action}`,
              description: input.title,
              actorId: EXECUTIVE_ID,
              actorName: EXECUTIVE_NAME,
            },
          ]
        : []),
    ],
    deferredUntil:
      input.status === "deferred" || input.status === "snoozed"
        ? daysAgo(Math.max(0, input.daysAgo - 2))
        : undefined,
  };
}

/** Seed decisions for EDI analytics and brief intelligence (Mission S1B+ / P-003). */
export function buildSeedDecisions(): ExecutiveDecision[] {
  const completedId = createDecisionId();
  const delegatedId = createDecisionId();

  return [
    buildSeedDecision({
      id: completedId,
      title: "Renew enterprise contract — Apex Retail",
      status: "completed",
      type: "executive",
      value: 18400,
      daysAgo: 1,
      action: "completed",
    }),
    buildSeedDecision({
      id: delegatedId,
      title: "Escalate pipeline risk — Q3 forecast",
      status: "delegated",
      type: "risk",
      value: 9200,
      daysAgo: 1,
      action: "delegated",
      relatedDecisionIds: [completedId],
    }),
    buildSeedDecision({
      id: createDecisionId(),
      title: "Approve marketing budget reallocation",
      status: "accepted",
      type: "growth",
      value: 42000,
      daysAgo: 1,
      action: "accepted",
    }),
    buildSeedDecision({
      id: createDecisionId(),
      title: "Dismiss duplicate supplier alert",
      status: "rejected",
      type: "follow-up",
      value: 0,
      daysAgo: 1,
      action: "rejected",
    }),
    buildSeedDecision({
      id: createDecisionId(),
      title: "Supplier contract renegotiation",
      status: "recommended",
      type: "executive",
      value: 42000,
      daysAgo: 0,
    }),
    buildSeedDecision({
      id: createDecisionId(),
      title: "Review guest satisfaction recovery plan",
      status: "deferred",
      type: "risk",
      value: 6800,
      daysAgo: 2,
      action: "deferred",
    }),
    buildSeedDecision({
      id: createDecisionId(),
      title: "Reopen pricing strategy review",
      status: "reopened",
      type: "growth",
      value: 15000,
      daysAgo: 3,
      action: "reopened",
    }),
    buildSeedDecision({
      id: createDecisionId(),
      title: "Pilot loyalty program for repeat guests",
      status: "completed",
      type: "operational",
      value: 5600,
      daysAgo: 4,
      action: "completed",
      confidenceScore: 58,
    }),
    buildSeedDecision({
      id: createDecisionId(),
      title: "Accelerate enterprise upsell — Meridian Group",
      status: "rejected",
      type: "executive",
      value: 28000,
      daysAgo: 2,
      action: "rejected",
      confidenceScore: 92,
    }),
    buildSeedDecision({
      id: createDecisionId(),
      title: "Delegate vendor audit to operations lead",
      status: "delegated",
      type: "operational",
      value: 11000,
      daysAgo: 3,
      action: "delegated",
      delegateName: "Operations Lead",
    }),
  ];
}

let seeded = false;

export function ensureDecisionSeedData(repository: InMemoryDecisionRepository): void {
  if (seeded) {
    return;
  }

  for (const decision of buildSeedDecisions()) {
    repository.create(decision);
  }

  seeded = true;
}

export const seededDecisionRepository = new InMemoryDecisionRepository(buildSeedDecisions());
