import type { HealthStatus } from "@/lib/command-center-data";
import type {
  CustomerProfileDetail,
  RelationshipAction,
} from "@/lib/crm-relationships-opportunities";
import type { FollowUpPriorityItem, FollowUpPriorityResult } from "@/lib/crm/models/intelligence";

function urgencyFromFollowUp(nextFollowUp: string): FollowUpPriorityItem["urgency"] {
  const lower = nextFollowUp.toLowerCase();

  if (lower.includes("today") || lower.includes("immediate")) {
    return "immediate";
  }

  if (lower.includes("week") || lower.includes("wednesday") || lower.includes("friday")) {
    return "this-week";
  }

  return "scheduled";
}

function statusFromProfile(profile: CustomerProfileDetail): HealthStatus {
  return profile.healthStatus;
}

function rankFollowUp(
  profile: CustomerProfileDetail,
  action?: RelationshipAction,
): FollowUpPriorityItem {
  const urgency = urgencyFromFollowUp(profile.nextFollowUp);

  return {
    rank: 0,
    customer: profile.name,
    action: action?.action ?? "Follow up",
    description: action?.description ?? profile.executiveNotes,
    urgency,
    status: statusFromProfile(profile),
  };
}

/** Ranks follow-up priorities from customer profiles and relationship action rules. */
export function computeFollowUpPriority(
  profiles: CustomerProfileDetail[],
  actions: RelationshipAction[],
): FollowUpPriorityResult {
  const actionByCustomer = new Map(actions.map((action) => [action.customer, action]));

  const items = profiles
    .map((profile) => rankFollowUp(profile, actionByCustomer.get(profile.name)))
    .sort((left, right) => {
      const urgencyOrder = { immediate: 0, "this-week": 1, scheduled: 2 };
      return urgencyOrder[left.urgency] - urgencyOrder[right.urgency];
    })
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const dueCount = items.filter((item) => item.urgency !== "scheduled").length;

  return {
    dueCount,
    summary:
      dueCount > 0
        ? `${dueCount} follow-up${dueCount === 1 ? "" : "s"} due this week — immediate actions ranked by relationship risk.`
        : "No urgent follow-ups detected for the current period.",
    items,
  };
}
