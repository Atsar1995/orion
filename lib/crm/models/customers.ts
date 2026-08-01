/** CRM customer domain models (Mission 16A.3). */

import type { CrmActivity } from "@/lib/crm/models/domain";

export type CustomerHealthLabel = "Excellent" | "Good" | "Needs Attention" | "At Risk";

export type CustomerListSortField =
  | "name"
  | "company"
  | "industry"
  | "status"
  | "healthScore"
  | "lifetimeValue"
  | "lastContact"
  | "assignedOwner";

export type CustomerListSortDirection = "asc" | "desc";

export type CustomerListFilters = {
  industry?: string;
  status?: string;
  health?: CustomerHealthLabel | "all";
  assignedOwner?: string;
};

export type CustomerListQuery = {
  search?: string;
  filters?: CustomerListFilters;
  sortField?: CustomerListSortField;
  sortDirection?: CustomerListSortDirection;
  page?: number;
  pageSize?: number;
};

export type CrmCustomerRecord = {
  id: string;
  name: string;
  company: string;
  organisationId?: string;
  industry: string;
  status: string;
  healthScore: number;
  healthLabel: CustomerHealthLabel;
  lifetimeValue: string;
  lifetimeValueAmount: number;
  lastContact: string;
  assignedOwner: string;
  email: string;
  phone: string;
  country: string;
  relationshipStatus: string;
  lastInteraction: string;
  nextFollowUp: string;
  openOpportunities: number;
  executiveNotes: string;
};

export type CrmCustomerListItem = {
  id: string;
  name: string;
  company: string;
  industry: string;
  status: string;
  healthScore: number;
  healthLabel: CustomerHealthLabel;
  lifetimeValue: string;
  lastContact: string;
  assignedOwner: string;
};

export type CrmCustomerListResult = {
  items: CrmCustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filterOptions: {
    industries: string[];
    statuses: string[];
    healthLabels: CustomerHealthLabel[];
    assignedOwners: string[];
  };
};

export type CrmCustomerOpportunitySummary = {
  name: string;
  value: string;
  stage: string;
  expectedClose: string;
};

export type CrmCustomerDetailView = {
  customer: CrmCustomerRecord;
  recentActivity: CrmActivity[];
  openOpportunities: CrmCustomerOpportunitySummary[];
};
