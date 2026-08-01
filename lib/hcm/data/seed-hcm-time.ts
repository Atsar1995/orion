import type { EmployeeRecord } from "@/types/hcm-employee";
import type { EmploymentRecord } from "@/types/hcm-employment";
import type {
  HolidayCalendarRecord,
  LeaveBalanceRecord,
  LeavePolicyRecord,
  WorkCalendarRecord,
  WorkShiftRecord,
} from "@/types/hcm-time";
import { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import { indexEmployeeFingerprints } from "@/lib/hcm/data/InMemoryEmployeeRepository";

export const HCM_SEED_ORG_ID = "org-orania";
const NOW = "2026-07-30T09:00:00.000Z";

export const SEED_EMPLOYEES: EmployeeRecord[] = [
  {
    id: "emp-hcm-001",
    organizationId: HCM_SEED_ORG_ID,
    employeeNumber: "E-1001",
    identity: {
      legalName: { givenName: "Priya", familyName: "Sharma" },
      governmentIdentifiers: [],
    },
    profile: { preferredName: "Priya" },
    contacts: [],
    emergencyContacts: [],
    status: "active",
    statusEffectiveFrom: NOW,
    departmentId: "dept-operations",
    effectiveFrom: "2024-01-01",
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "emp-hcm-002",
    organizationId: HCM_SEED_ORG_ID,
    employeeNumber: "E-1002",
    identity: {
      legalName: { givenName: "Arjun", familyName: "Mehta" },
      governmentIdentifiers: [],
    },
    profile: {},
    contacts: [],
    emergencyContacts: [],
    status: "active",
    statusEffectiveFrom: NOW,
    departmentId: "dept-operations",
    effectiveFrom: "2024-03-15",
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "emp-hcm-mgr",
    organizationId: HCM_SEED_ORG_ID,
    employeeNumber: "E-1000",
    identity: {
      legalName: { givenName: "Neha", familyName: "Kapoor" },
      governmentIdentifiers: [],
    },
    profile: {},
    contacts: [],
    emergencyContacts: [],
    status: "active",
    statusEffectiveFrom: NOW,
    departmentId: "dept-operations",
    effectiveFrom: "2023-06-01",
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: "system",
    updatedBy: "system",
  },
];

export const SEED_EMPLOYMENTS: EmploymentRecord[] = [
  {
    id: "empl-hcm-001",
    organizationId: HCM_SEED_ORG_ID,
    employmentNumber: "EMP-1001",
    employeeId: "emp-hcm-001",
    legalEntityId: "le-orania",
    departmentId: "dept-operations",
    employmentType: "permanent",
    contractType: "full_time",
    status: "active",
    isPrimary: true,
    contract: { startDate: "2024-01-01" },
    workingPattern: "standard",
    effectiveFrom: "2024-01-01",
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "empl-hcm-002",
    organizationId: HCM_SEED_ORG_ID,
    employmentNumber: "EMP-1002",
    employeeId: "emp-hcm-002",
    legalEntityId: "le-orania",
    departmentId: "dept-operations",
    employmentType: "permanent",
    contractType: "full_time",
    status: "active",
    isPrimary: true,
    contract: { startDate: "2024-03-15" },
    workingPattern: "standard",
    effectiveFrom: "2024-03-15",
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: "system",
    updatedBy: "system",
  },
];

export const SEED_SHIFTS: WorkShiftRecord[] = [
  {
    id: "shift-day",
    organizationId: HCM_SEED_ORG_ID,
    code: "DAY",
    name: "Day Shift",
    pattern: { code: "DAY", startTime: "09:00", endTime: "18:00", breakMinutes: 60 },
    departmentId: "dept-operations",
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "shift-evening",
    organizationId: HCM_SEED_ORG_ID,
    code: "EVE",
    name: "Evening Shift",
    pattern: { code: "EVE", startTime: "14:00", endTime: "22:00", breakMinutes: 30 },
    departmentId: "dept-operations",
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SEED_LEAVE_POLICIES: LeavePolicyRecord[] = [
  {
    id: "lpol-annual-orania",
    organizationId: HCM_SEED_ORG_ID,
    leaveType: "annual",
    accrualRatePerMonth: 1.75,
    maxCarryForward: 10,
    requiresApproval: true,
    allowPartialDay: true,
    active: true,
  },
  {
    id: "lpol-sick-orania",
    organizationId: HCM_SEED_ORG_ID,
    leaveType: "sick",
    accrualRatePerMonth: 0.75,
    maxCarryForward: 0,
    requiresApproval: false,
    allowPartialDay: true,
    active: true,
  },
  {
    id: "lpol-comp-orania",
    organizationId: HCM_SEED_ORG_ID,
    leaveType: "compensatory",
    accrualRatePerMonth: 0,
    maxCarryForward: 5,
    requiresApproval: true,
    allowPartialDay: true,
    active: true,
  },
];

export const SEED_LEAVE_BALANCES: LeaveBalanceRecord[] = [
  {
    id: "bal-annual-001",
    organizationId: HCM_SEED_ORG_ID,
    employeeId: "emp-hcm-001",
    leaveType: "annual",
    accrued: 21,
    used: 3,
    carriedForward: 2,
    unit: "days",
    asOfDate: "2026-07-30",
    updatedAt: NOW,
  },
  {
    id: "bal-sick-001",
    organizationId: HCM_SEED_ORG_ID,
    employeeId: "emp-hcm-001",
    leaveType: "sick",
    accrued: 9,
    used: 1,
    carriedForward: 0,
    unit: "days",
    asOfDate: "2026-07-30",
    updatedAt: NOW,
  },
];

export const SEED_HOLIDAY_CALENDAR: HolidayCalendarRecord = {
  id: "hcal-orania-2026",
  organizationId: HCM_SEED_ORG_ID,
  code: "IN-2026",
  name: "India Public Holidays 2026",
  year: 2026,
  holidays: [
    { date: "2026-01-26", name: "Republic Day" },
    { date: "2026-08-15", name: "Independence Day" },
    { date: "2026-10-02", name: "Gandhi Jayanti" },
  ],
  active: true,
};

export const SEED_WORK_CALENDAR: WorkCalendarRecord = {
  id: "wcal-orania-standard",
  organizationId: HCM_SEED_ORG_ID,
  code: "STD-5D",
  name: "Standard 5-Day Week",
  workingHours: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8 },
  weekStartsOn: "monday",
  active: true,
};

export function seedHcmTimeData(store: InMemoryHcmStore, organizationId = HCM_SEED_ORG_ID): void {
  for (const employee of SEED_EMPLOYEES) {
    if (employee.organizationId === organizationId) {
      store.employees.set(employee.id, employee);
    }
  }
  for (const employment of SEED_EMPLOYMENTS) {
    if (employment.organizationId === organizationId) {
      store.employments.set(employment.id, employment);
    }
  }
  for (const shift of SEED_SHIFTS) {
    if (shift.organizationId === organizationId) {
      store.shifts.set(shift.id, shift);
    }
  }
  for (const policy of SEED_LEAVE_POLICIES) {
    if (policy.organizationId === organizationId) {
      store.leavePolicies.set(policy.id, policy);
    }
  }
  for (const balance of SEED_LEAVE_BALANCES) {
    if (balance.organizationId === organizationId) {
      store.leaveBalances.set(balance.id, balance);
    }
  }
  if (SEED_HOLIDAY_CALENDAR.organizationId === organizationId) {
    store.holidayCalendars.set(SEED_HOLIDAY_CALENDAR.id, SEED_HOLIDAY_CALENDAR);
  }
  if (SEED_WORK_CALENDAR.organizationId === organizationId) {
    store.workCalendars.set(SEED_WORK_CALENDAR.id, SEED_WORK_CALENDAR);
  }
  indexEmployeeFingerprints(store);
}
