/**
 * Creates PostgreSQL-backed HCM store compatible with existing repositories (Mission P-015.5).
 */

import {
  InMemoryHcmStore,
  type InMemoryHcmStoreOptions,
} from "@/lib/hcm/data/InMemoryHcmStore";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import {
  HCM_PERSISTENT_COLLECTIONS,
  HcmEntityPersister,
  PersistingArray,
  PersistingMap,
} from "@/lib/platform/persistence/hcm/HcmEntityPersister";

function createPersistingMaps(persister: HcmEntityPersister): InMemoryHcmStoreOptions {
  return {
    orgUnits: new PersistingMap("orgUnits", persister),
    positions: new PersistingMap("positions", persister),
    reporting: new PersistingMap("reporting", persister),
    employees: new PersistingMap("employees", persister),
    employeeFingerprints: new PersistingMap("employeeFingerprints", persister),
    employments: new PersistingMap("employments", persister),
    employmentHistory: new PersistingArray("employmentHistory", persister),
    assignments: new PersistingMap("assignments", persister),
    candidates: new PersistingMap("candidates", persister),
    applications: new PersistingMap("applications", persister),
    offers: new PersistingMap("offers", persister),
    onboardingProcesses: new PersistingMap("onboardingProcesses", persister),
    onboardingTasks: new PersistingMap("onboardingTasks", persister),
    documentRequirements: new PersistingMap("documentRequirements", persister),
    documents: new PersistingMap("documents", persister),
    verifications: new PersistingMap("verifications", persister),
    provisioningTasks: new PersistingMap("provisioningTasks", persister),
    attendance: new PersistingMap("attendance", persister),
    attendanceExceptions: new PersistingMap("attendanceExceptions", persister),
    shifts: new PersistingMap("shifts", persister),
    rosters: new PersistingMap("rosters", persister),
    leaveRequests: new PersistingMap("leaveRequests", persister),
    leaveBalances: new PersistingMap("leaveBalances", persister),
    leavePolicies: new PersistingMap("leavePolicies", persister),
    holidayCalendars: new PersistingMap("holidayCalendars", persister),
    workCalendars: new PersistingMap("workCalendars", persister),
    overtime: new PersistingMap("overtime", persister),
    payrollCalendars: new PersistingMap("payrollCalendars", persister),
    payrollPeriods: new PersistingMap("payrollPeriods", persister),
    payrollRuns: new PersistingMap("payrollRuns", persister),
    payrollEntries: new PersistingMap("payrollEntries", persister),
    payrollComponents: new PersistingMap("payrollComponents", persister),
    payrollAdjustments: new PersistingMap("payrollAdjustments", persister),
    payrollResults: new PersistingMap("payrollResults", persister),
    goals: new PersistingMap("goals", persister),
    objectives: new PersistingMap("objectives", persister),
    performanceReviews: new PersistingMap("performanceReviews", persister),
    competencies: new PersistingMap("competencies", persister),
    competencyAssessments: new PersistingMap("competencyAssessments", persister),
    developmentPlans: new PersistingMap("developmentPlans", persister),
    trainingCourses: new PersistingMap("trainingCourses", persister),
    learningPrograms: new PersistingMap("learningPrograms", persister),
    enrollments: new PersistingMap("enrollments", persister),
    certifications: new PersistingMap("certifications", persister),
    careerPaths: new PersistingMap("careerPaths", persister),
    successionPlans: new PersistingMap("successionPlans", persister),
    talentProfiles: new PersistingMap("talentProfiles", persister),
  };
}

/** Hydrates and returns an HCM store backed by PostgreSQL entity tables. */
export async function createPostgresHcmStore(
  connection: DatabaseConnection,
): Promise<{ store: InMemoryHcmStore; persister: HcmEntityPersister }> {
  const persister = new HcmEntityPersister(connection);
  const store = new InMemoryHcmStore(createPersistingMaps(persister));

  for (const collection of HCM_PERSISTENT_COLLECTIONS) {
    const loaded = await persister.loadCollection(collection);
    const map = store[collection] as Map<string, unknown>;
    for (const [key, value] of loaded.entries()) {
      Map.prototype.set.call(map, key, value);
    }
  }

  const history = await persister.loadArrayCollection("employmentHistory");
  if (history.length > 0) {
    Array.prototype.push.apply(store.employmentHistory, history);
  }

  return { store, persister };
}

export async function flushPostgresHcmStore(persister: HcmEntityPersister): Promise<void> {
  await persister.flushPending();
}
