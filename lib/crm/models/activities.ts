/** CRM activity domain models (Mission 16A.5). */

export type CrmActivityType =
  | "Phone Call"
  | "Meeting"
  | "Email"
  | "Note"
  | "Task"
  | "Opportunity Update";

export type CrmActivityStatus =
  | "Scheduled"
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Overdue"
  | "Sent"
  | "Draft";

export type CrmActivityPriority = "Low" | "Medium" | "High" | "Critical";

export type ActivityDateRangeFilter = "all" | "today" | "this_week" | "this_month";

export type ActivityListSortField =
  | "type"
  | "customer"
  | "owner"
  | "date"
  | "status"
  | "relatedOpportunity";

export type ActivityListSortDirection = "asc" | "desc";

export type ActivityListFilters = {
  type?: CrmActivityType | "all";
  owner?: string;
  status?: CrmActivityStatus | "all";
  priority?: CrmActivityPriority | "all";
  dateRange?: ActivityDateRangeFilter;
};

export type ActivityListQuery = {
  search?: string;
  filters?: ActivityListFilters;
  sortField?: ActivityListSortField;
  sortDirection?: ActivityListSortDirection;
  page?: number;
  pageSize?: number;
};

export type CrmActivityRecord = {
  id: string;
  type: CrmActivityType;
  customer: string;
  customerId: string;
  date: string;
  time: string;
  dateTimeSort: string;
  owner: string;
  status: CrmActivityStatus;
  priority: CrmActivityPriority;
  description: string;
  relatedOpportunity?: string;
  relatedOpportunityId?: string;
  duration?: string;
  outcome?: string;
  followUpRequired?: boolean;
  subject?: string;
  participants?: string[];
};

export type CrmActivityListItem = {
  id: string;
  type: CrmActivityType;
  customer: string;
  owner: string;
  date: string;
  status: CrmActivityStatus;
  relatedOpportunity?: string;
  priority: CrmActivityPriority;
};

export type CrmActivityListResult = {
  items: CrmActivityListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filterOptions: {
    types: CrmActivityType[];
    statuses: CrmActivityStatus[];
    priorities: CrmActivityPriority[];
    owners: string[];
    dateRanges: ActivityDateRangeFilter[];
  };
};

export type CrmActivityDashboardMetrics = {
  callsToday: number;
  meetingsScheduled: number;
  emailsPending: number;
  tasksDue: number;
  overdueActivities: number;
};

export type CrmActivityWorkspaceView = {
  metrics: CrmActivityDashboardMetrics;
  records: CrmActivityRecord[];
};

export type CrmActivityTimelineItem = {
  id: string;
  type: CrmActivityType;
  customer: string;
  date: string;
  time: string;
  owner: string;
  status: CrmActivityStatus;
  description: string;
};

export type CrmActivityTaskItem = {
  id: string;
  customer: string;
  description: string;
  owner: string;
  date: string;
  status: CrmActivityStatus;
  priority: CrmActivityPriority;
};

export type CrmActivityMeetingItem = {
  id: string;
  customer: string;
  date: string;
  time: string;
  participants: string[];
  status: CrmActivityStatus;
};

export type CrmActivityCallItem = {
  id: string;
  customer: string;
  date: string;
  duration: string;
  outcome: string;
  followUpRequired: boolean;
};

export type CrmActivityEmailItem = {
  id: string;
  subject: string;
  customer: string;
  date: string;
  status: CrmActivityStatus;
};
