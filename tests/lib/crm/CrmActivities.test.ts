import { describe, expect, it } from "vitest";
import { CRM_ACTIVITY_RECORDS } from "@/lib/crm/data/activity-records";
import { InMemoryCrmRepository, CrmService } from "@/lib/crm";
import {
  filterActivitiesByType,
  findActivityRecordById,
  queryActivityRecords,
} from "@/lib/crm/services/activities/activity-query";

describe("queryActivityRecords", () => {
  it("filters, sorts, and paginates activity records", () => {
    const pageOne = queryActivityRecords(CRM_ACTIVITY_RECORDS, {
      page: 1,
      pageSize: 5,
      sortField: "date",
      sortDirection: "desc",
    });

    expect(pageOne.items).toHaveLength(5);
    expect(pageOne.total).toBe(18);
    expect(pageOne.totalPages).toBe(4);

    const filtered = queryActivityRecords(CRM_ACTIVITY_RECORDS, {
      search: "OranIA",
      filters: { type: "Phone Call" },
    });

    expect(filtered.items).toHaveLength(1);
    expect(filtered.items[0]?.customer).toBe("OranIA Hospitality Group");
  });

  it("finds activity by id", () => {
    const activity = findActivityRecordById(CRM_ACTIVITY_RECORDS, "act-commerce-proposal-email");
    expect(activity?.type).toBe("Email");
  });

  it("filters activities by type", () => {
    const tasks = filterActivitiesByType(CRM_ACTIVITY_RECORDS, "Task");
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((record) => record.type === "Task")).toBe(true);
  });

  it("filters by date range", () => {
    const today = queryActivityRecords(CRM_ACTIVITY_RECORDS, {
      filters: { dateRange: "today" },
    });

    expect(today.total).toBeGreaterThan(0);
    expect(today.items.every((item) => item.date === "24 Jul 2026")).toBe(true);
  });
});

describe("CrmService activities", () => {
  it("returns activity workspace metrics", () => {
    const service = new CrmService(new InMemoryCrmRepository());
    const workspace = service.getActivityWorkspace();

    expect(workspace.metrics.callsToday).toBeGreaterThan(0);
    expect(workspace.metrics.meetingsScheduled).toBeGreaterThan(0);
    expect(workspace.records.length).toBe(18);
  });

  it("returns filtered activity list", () => {
    const service = new CrmService(new InMemoryCrmRepository());
    const list = service.listActivities({ filters: { status: "Overdue" } });

    expect(list.items.length).toBeGreaterThan(0);
    expect(list.items.every((item) => item.status === "Overdue")).toBe(true);
  });

  it("returns typed activity sections", () => {
    const service = new CrmService(new InMemoryCrmRepository());

    expect(service.activities.getTasks().length).toBeGreaterThan(0);
    expect(service.activities.getMeetings().length).toBeGreaterThan(0);
    expect(service.activities.getCalls().length).toBeGreaterThan(0);
    expect(service.activities.getEmails().length).toBeGreaterThan(0);
  });
});
