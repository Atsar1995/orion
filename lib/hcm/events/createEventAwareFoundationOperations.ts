import type { HcmFoundationFacade } from "@/lib/hcm/HcmFoundationFacade";
import { createFoundationOperations } from "@/lib/hcm/HcmFoundationOperations";
import type { HcmEventPublisher } from "@/lib/hcm/events/HcmEventPublisher";

/** Wraps foundation operations with IIL event publication (S-002.6). */
export function createEventAwareFoundationOperations(
  foundation: HcmFoundationFacade,
  publisher: HcmEventPublisher,
) {
  const base = createFoundationOperations(foundation);

  return {
    createOrgUnit(...args: Parameters<typeof base.createOrgUnit>) {
      const result = base.createOrgUnit(...args);
      publisher.organizationCreated(result, args[1]);
      return result;
    },

    updateOrgUnit(...args: Parameters<typeof base.updateOrgUnit>) {
      const result = base.updateOrgUnit(...args);
      publisher.organizationUpdated(result, args[2]);
      return result;
    },

    deactivateOrgUnit(...args: Parameters<typeof base.deactivateOrgUnit>) {
      const result = base.deactivateOrgUnit(...args);
      publisher.orgUnitDeactivated(result, args[1]);
      return result;
    },

    createPosition(...args: Parameters<typeof base.createPosition>) {
      const result = base.createPosition(...args);
      publisher.positionCreated(result, args[1]);
      return result;
    },

    updatePosition(...args: Parameters<typeof base.updatePosition>) {
      const result = base.updatePosition(...args);
      publisher.positionUpdated(result, args[2]);
      return result;
    },

    validateHierarchy: base.validateHierarchy,

    createReportingRelationship(...args: Parameters<typeof base.createReportingRelationship>) {
      const result = base.createReportingRelationship(...args);
      publisher.reportingRelationshipChanged(result, args[1]);
      return result;
    },

    createEmployee(...args: Parameters<typeof base.createEmployee>) {
      const result = base.createEmployee(...args);
      publisher.employeeCreated(result, args[1]);
      return result;
    },

    updateEmployee(...args: Parameters<typeof base.updateEmployee>) {
      const result = base.updateEmployee(...args);
      publisher.employeeUpdated(result, args[1]);
      return result;
    },

    activateEmployee(...args: Parameters<typeof base.activateEmployee>) {
      const result = base.activateEmployee(...args);
      publisher.employeeActivated(result, args[1]);
      return result;
    },

    suspendEmployee(...args: Parameters<typeof base.suspendEmployee>) {
      const result = base.suspendEmployee(...args);
      publisher.employeeSuspended(result, args[1]);
      return result;
    },

    createEmployment(...args: Parameters<typeof base.createEmployment>) {
      const result = base.createEmployment(...args);
      publisher.employmentCreated(result, args[1]);
      return result;
    },

    transferEmployee(...args: Parameters<typeof base.transferEmployee>) {
      const result = base.transferEmployee(...args);
      publisher.employmentTransferred(result, args[1]);
      return result;
    },

    promoteEmployee(...args: Parameters<typeof base.promoteEmployee>) {
      const result = base.promoteEmployee(...args);
      publisher.promotionCompleted(result, args[1]);
      return result;
    },

    terminateEmployment(...args: Parameters<typeof base.terminateEmployment>) {
      const result = base.terminateEmployment(...args);
      publisher.employmentTerminated(result, args[1]);
      return result;
    },

    rehireEmployee(...args: Parameters<typeof base.rehireEmployee>) {
      const result = base.rehireEmployee(...args);
      publisher.employeeRehired(result, args[1]);
      return result;
    },

    createCandidate(...args: Parameters<typeof base.createCandidate>) {
      const result = base.createCandidate(...args);
      publisher.candidateCreated(result, args[1]);
      return result;
    },

    submitApplication(...args: Parameters<typeof base.submitApplication>) {
      const result = base.submitApplication(...args);
      publisher.applicationSubmitted(result, args[1]);
      return result;
    },

    createApplication: base.createApplication,

    advanceApplication(...args: Parameters<typeof base.advanceApplication>) {
      return base.advanceApplication(...args);
    },

    scheduleInterview(...args: Parameters<typeof base.scheduleInterview>) {
      const result = base.scheduleInterview(...args);
      publisher.interviewScheduled(result, args[1]);
      return result;
    },

    createOffer(...args: Parameters<typeof base.createOffer>) {
      const result = base.createOffer(...args);
      publisher.offerCreated(result, args[1]);
      return result;
    },

    hireCandidate(...args: Parameters<typeof base.hireCandidate>) {
      const result = base.hireCandidate(...args);
      publisher.offerAccepted(result, args[1]);
      publisher.candidateHired(result, args[1]);
      return result;
    },

    startOnboarding(...args: Parameters<typeof base.startOnboarding>) {
      const result = base.startOnboarding(...args);
      publisher.onboardingStarted(result, args[1]);
      return result;
    },

    uploadDocument(...args: Parameters<typeof base.uploadDocument>) {
      const result = base.uploadDocument(...args);
      publisher.documentUploaded(result, args[1]);
      return result;
    },

    verifyDocument(...args: Parameters<typeof base.verifyDocument>) {
      const result = base.verifyDocument(...args);
      if (result.status === "verified") {
        publisher.documentVerified(result, args[1]);
      }
      return result;
    },

    completeTask: base.completeTask,

    completeProvisioning(...args: Parameters<typeof base.completeProvisioning>) {
      const result = base.completeProvisioning(...args);
      publisher.provisioningCompleted(result, args[2]);
      return result;
    },

    determineActivationReadiness: base.determineActivationReadiness,

    listOrgUnits: base.listOrgUnits,
    listPositions: base.listPositions,
    searchEmployees: base.searchEmployees,
    countEmployees: base.countEmployees,
    getEmployee: base.getEmployee,
    searchEmployment: base.searchEmployment,
    countEmployment: base.countEmployment,
    getEmployment: base.getEmployment,
    getCandidate: base.getCandidate,
    getApplication: base.getApplication,
    searchOnboarding: base.searchOnboarding,
  };
}
