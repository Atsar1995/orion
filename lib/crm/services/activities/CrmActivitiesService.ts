import type {
  ActivityListQuery,
  CrmActivityCallItem,
  CrmActivityDashboardMetrics,
  CrmActivityEmailItem,
  CrmActivityListResult,
  CrmActivityMeetingItem,
  CrmActivityRecord,
  CrmActivityTaskItem,
  CrmActivityTimelineItem,
  CrmActivityWorkspaceView,
} from "@/lib/crm/models/activities";
import type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";
import {
  filterActivities,
  filterActivitiesByType,
  getTimelineActivities,
  queryActivityRecords,
} from "@/lib/crm/services/activities/activity-query";

function buildDashboardMetrics(records: CrmActivityRecord[]): CrmActivityDashboardMetrics {
  return {
    callsToday: records.filter(
      (record) => record.type === "Phone Call" && record.date === "24 Jul 2026",
    ).length,
    meetingsScheduled: records.filter(
      (record) => record.type === "Meeting" && record.status === "Scheduled",
    ).length,
    emailsPending: records.filter(
      (record) =>
        record.type === "Email" &&
        (record.status === "Pending" || record.status === "Draft"),
    ).length,
    tasksDue: records.filter(
      (record) =>
        record.type === "Task" &&
        (record.status === "Pending" || record.status === "In Progress") &&
        record.date === "24 Jul 2026",
    ).length,
    overdueActivities: records.filter((record) => record.status === "Overdue").length,
  };
}

function toTimelineItem(record: CrmActivityRecord): CrmActivityTimelineItem {
  return {
    id: record.id,
    type: record.type,
    customer: record.customer,
    date: record.date,
    time: record.time,
    owner: record.owner,
    status: record.status,
    description: record.description,
  };
}

function toTaskItem(record: CrmActivityRecord): CrmActivityTaskItem {
  return {
    id: record.id,
    customer: record.customer,
    description: record.description,
    owner: record.owner,
    date: record.date,
    status: record.status,
    priority: record.priority,
  };
}

function toMeetingItem(record: CrmActivityRecord): CrmActivityMeetingItem {
  return {
    id: record.id,
    customer: record.customer,
    date: record.date,
    time: record.time,
    participants: record.participants ?? [],
    status: record.status,
  };
}

function toCallItem(record: CrmActivityRecord): CrmActivityCallItem {
  return {
    id: record.id,
    customer: record.customer,
    date: record.date,
    duration: record.duration ?? "—",
    outcome: record.outcome ?? "—",
    followUpRequired: record.followUpRequired ?? false,
  };
}

function toEmailItem(record: CrmActivityRecord): CrmActivityEmailItem {
  return {
    id: record.id,
    subject: record.subject ?? record.description,
    customer: record.customer,
    date: record.date,
    status: record.status,
  };
}

/** CRM activities module service — placeholder data only (Mission 16A.5). */
export class CrmActivitiesService {
  constructor(private readonly repository: CrmRepository) {}

  listActivities(query: ActivityListQuery = {}): CrmActivityListResult {
    return queryActivityRecords(this.repository.getActivityRecords(), query);
  }

  getWorkspaceView(): CrmActivityWorkspaceView {
    const records = this.repository.getActivityRecords();

    return {
      metrics: buildDashboardMetrics(records),
      records,
    };
  }

  getTimeline(query: ActivityListQuery = {}): CrmActivityTimelineItem[] {
    return filterActivities(this.repository.getActivityRecords(), query).map(toTimelineItem);
  }

  getTasks(query: ActivityListQuery = {}): CrmActivityTaskItem[] {
    return filterActivities(
      filterActivitiesByType(this.repository.getActivityRecords(), "Task"),
      query,
    ).map(toTaskItem);
  }

  getMeetings(query: ActivityListQuery = {}): CrmActivityMeetingItem[] {
    return filterActivities(
      filterActivitiesByType(this.repository.getActivityRecords(), "Meeting"),
      query,
    ).map(toMeetingItem);
  }

  getCalls(query: ActivityListQuery = {}): CrmActivityCallItem[] {
    return filterActivities(
      filterActivitiesByType(this.repository.getActivityRecords(), "Phone Call"),
      query,
    ).map(toCallItem);
  }

  getEmails(query: ActivityListQuery = {}): CrmActivityEmailItem[] {
    return filterActivities(
      filterActivitiesByType(this.repository.getActivityRecords(), "Email"),
      query,
    ).map(toEmailItem);
  }

  getActivityCatalog() {
    return getTimelineActivities(this.repository.getActivityRecords());
  }
}

export function createCrmActivitiesService(repository: CrmRepository): CrmActivitiesService {
  return new CrmActivitiesService(repository);
}
