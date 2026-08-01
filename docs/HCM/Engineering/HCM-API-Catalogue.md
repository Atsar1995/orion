# Enterprise HCM API Catalogue

**Document ID:** HCM-API-001  
**Parent:** [ES-HCM-001](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)  
**Version:** 1.0 — Enterprise HCM v1.0

---

## Public Facade

```typescript
import { hcmFacade } from "@/lib/hcm";
```

All operations require `ServiceContext` as the final argument unless noted.

---

## Facade Metadata

| Method | Returns | Purpose |
|--------|---------|---------|
| `getDomainStatus()` | `HcmDomainStatus` | Mission implementation flags |
| `getWorkspaceBootstrap(context)` | Bootstrap object | Workspace capabilities and missions |

---

## Foundation Operations (P-012.1 – P-012.5)

### Organization (P-012.1)

| Operation | Input | Returns | Exceptions |
|-----------|-------|---------|------------|
| `createOrgUnit` | `CreateOrgUnitInput` | `OrgUnitRecord` | `DUPLICATE_ORG_CODE`, `CIRCULAR_HIERARCHY`, `INVALID_*` |
| `updateOrgUnit` | `unitId`, `Partial<CreateOrgUnitInput>` | `OrgUnitRecord` | `ORG_UNIT_NOT_FOUND` |
| `deactivateOrgUnit` | `unitId` | `OrgUnitRecord` | `ORG_UNIT_NOT_FOUND`, `ACTIVE_CHILDREN_EXIST` |
| `createPosition` | `CreatePositionInput` | `PositionRecord` | `ORG_UNIT_NOT_FOUND`, `DUPLICATE_*` |
| `updatePosition` | `positionId`, partial input | `PositionRecord` | `POSITION_NOT_FOUND` |
| `validateHierarchy` | — | `ReportingRelationshipRecord[]` | — |
| `createReportingRelationship` | `CreateReportingRelationshipInput` | `ReportingRelationshipRecord` | `POSITION_NOT_FOUND`, `CIRCULAR_REPORTING` |
| `listOrgUnits` | `OrgUnitInquiryQuery?` | `OrgUnitRecord[]` | — |
| `listPositions` | `PositionInquiryQuery?` | `PositionRecord[]` | — |

### Employee (P-012.2)

| Operation | Input | Returns | Exceptions |
|-----------|-------|---------|------------|
| `createEmployee` | `CreateEmployeeInput` | `EmployeeRecord` | `DUPLICATE_EMPLOYEE_NUMBER`, `DUPLICATE_EMPLOYEE_IDENTITY` |
| `updateEmployee` | `UpdateEmployeeInput` | `EmployeeRecord` | `EMPLOYEE_NOT_FOUND` |
| `activateEmployee` | `employeeId` | `EmployeeRecord` | `EMPLOYEE_NOT_FOUND`, `INVALID_EMPLOYEE_STATUS_TRANSITION` |
| `suspendEmployee` | `employeeId` | `EmployeeRecord` | `EMPLOYEE_NOT_FOUND`, `INVALID_EMPLOYEE_STATUS_TRANSITION` |
| `searchEmployees` | `EmployeeSearchQuery?` | `EmployeeRecord[]` | — |
| `countEmployees` | `EmployeeSearchQuery?` | `number` | — |
| `getEmployee` | `employeeId` | `EmployeeRecord \| null` | — |

### Employment (P-012.3)

| Operation | Input | Returns | Exceptions |
|-----------|-------|---------|------------|
| `createEmployment` | `CreateEmploymentInput` | `EmploymentRecord` | `EMPLOYEE_NOT_FOUND`, `DUPLICATE_EMPLOYMENT_NUMBER` |
| `transferEmployee` | `TransferInput` | `EmploymentRecord` | `EMPLOYMENT_NOT_FOUND` |
| `promoteEmployee` | `PromotionInput` | `EmploymentRecord` | `EMPLOYMENT_NOT_FOUND` |
| `terminateEmployment` | `TerminationInput` | `EmploymentRecord` | `EMPLOYMENT_NOT_FOUND` |
| `rehireEmployee` | `RehireInput` | `EmploymentRecord` | `EMPLOYEE_NOT_FOUND` |
| `searchEmployment` | `EmploymentSearchQuery?` | `EmploymentRecord[]` | — |
| `countEmployment` | `EmploymentSearchQuery?` | `number` | — |
| `getEmployment` | `employmentId` | `EmploymentRecord \| null` | — |

### Recruitment (P-012.4)

| Operation | Input | Returns | Exceptions |
|-----------|-------|---------|------------|
| `createCandidate` | `RegisterCandidateInput` | `CandidateRecord` | `DUPLICATE_CANDIDATE_NUMBER`, `INVALID_*` |
| `createApplication` | `CreateApplicationInput` | `ApplicationRecord` | `CANDIDATE_NOT_FOUND` |
| `submitApplication` | `applicationId` | `ApplicationRecord` | `APPLICATION_NOT_FOUND` |
| `advanceApplication` | `applicationId` | `ApplicationRecord` | Status transition errors |
| `scheduleInterview` | `applicationId` | `ApplicationRecord` | `APPLICATION_NOT_FOUND` |
| `createOffer` | `CreateOfferInput` | `OfferRecord` | Validation errors |
| `hireCandidate` | `offerId` | `OfferRecord` | `OFFER_NOT_FOUND` |
| `getCandidate` | `candidateId` | `CandidateRecord \| null` | — |
| `getApplication` | `applicationId` | `ApplicationRecord \| null` | — |

### Onboarding (P-012.5)

| Operation | Input | Returns | Exceptions |
|-----------|-------|---------|------------|
| `startOnboarding` | `StartOnboardingInput` | `OnboardingProcessRecord` | Offer/candidate validation |
| `uploadDocument` | `UploadDocumentInput` | `EmployeeDocumentRecord` | Process not found |
| `verifyDocument` | `VerifyDocumentInput` | `EmployeeDocumentRecord` | `DOCUMENT_NOT_FOUND` |
| `completeTask` | `processId`, `taskCode` | `OnboardingTaskRecord` | Task not found |
| `completeProvisioning` | `processId`, `provisioningType` | `ProvisioningTaskRecord` | Process not found |
| `determineActivationReadiness` | `processId` | `boolean` | — |
| `searchOnboarding` | `OnboardingSearchQuery?` | `OnboardingProcessRecord[]` | — |

---

## Operational Services

### Time — `hcmFacade.attendance` (P-012.6)

| Method | Purpose |
|--------|---------|
| `record(input, context)` | Record attendance |
| `correct(input, context)` | Submit correction |
| `search(query, context)` | Search records |
| `count(query, context)` | Count for pagination |

### Time — `hcmFacade.leave`

| Method | Purpose |
|--------|---------|
| `createRequest(input, context)` | Create leave request |
| `approve(requestId, context, approverId?)` | Approve leave |
| `reject(requestId, context, approverId?)` | Reject leave |
| `cancel(requestId, context)` | Cancel leave |
| `searchRequests(query, context)` | Search requests |
| `getBalance(employeeId, leaveType, context)` | Leave balance |
| `listPolicies(context)` | Active leave policies |

### Time — `hcmFacade.roster`, `calendar`, `shifts`, `overtime`

See module guides: [P-012.6-Attendance-Guide](./P-012.6-Attendance-Guide.md), [P-012.6-Leave-Management-Guide](./P-012.6-Leave-Management-Guide.md), [P-012.6-Roster-Guide](./P-012.6-Roster-Guide.md).

### Payroll — `hcmFacade.payroll*` (P-012.7)

| Service | Key Methods |
|---------|-------------|
| `payroll` | `startRun`, `review`, `approve`, `finalize`, `reverse`, `getRun`, `listRuns` |
| `payrollPeriods` | `createCalendar`, `openPeriod`, `getPeriod`, `listPeriods`, `listCalendars` |
| `payrollCalculation` | `calculate` |
| `payrollAdjustments` | `create`, `apply`, `list`, `registerComponent` |
| `payrollValidation` | `validateRun`, `assertReadyForApproval` |

No REST routes yet — facade-only.

### Talent — `hcmFacade.performance`, `learning`, `certification`, `talent` (P-012.8)

| Service | Key Methods |
|---------|-------------|
| `performance` | `startReview`, `completeReview`, `createGoal`, `createDevelopmentPlan`, `searchReviews` |
| `learning` | `registerCourse`, `assignTraining`, `completeTraining`, `listCourses` |
| `certification` | `issue`, `checkExpiry`, `search` |
| `talent` | `upsertTalentProfile`, `updateSuccessionPlan`, `searchProfiles` |

No REST routes yet — facade-only.

---

## REST Endpoints

### Response Envelope

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "ERROR_CODE" }
```

Paginated GET responses:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": { "page": 1, "pageSize": 50, "total": 0 }
  }
}
```

### Foundation Routes (37)

| Method | Path | Facade Operation |
|--------|------|------------------|
| GET | `/api/hcm/organization/units` | `listOrgUnits` |
| POST | `/api/hcm/organization/units` | `createOrgUnit` |
| PATCH | `/api/hcm/organization/units/[id]` | `updateOrgUnit` |
| POST | `/api/hcm/organization/units/[id]/deactivate` | `deactivateOrgUnit` |
| GET | `/api/hcm/organization/positions` | `listPositions` |
| POST | `/api/hcm/organization/positions` | `createPosition` |
| PATCH | `/api/hcm/organization/positions/[id]` | `updatePosition` |
| GET | `/api/hcm/organization/hierarchy` | `validateHierarchy` |
| POST | `/api/hcm/organization/hierarchy` | `createReportingRelationship` |
| GET | `/api/hcm/employees` | `searchEmployees` + `countEmployees` |
| POST | `/api/hcm/employees` | `createEmployee` |
| GET | `/api/hcm/employees/[id]` | `getEmployee` |
| PATCH | `/api/hcm/employees/[id]` | `updateEmployee` |
| POST | `/api/hcm/employees/[id]/activate` | `activateEmployee` |
| POST | `/api/hcm/employees/[id]/suspend` | `suspendEmployee` |
| GET | `/api/hcm/employment` | `searchEmployment` + `countEmployment` |
| POST | `/api/hcm/employment` | `createEmployment` |
| GET | `/api/hcm/employment/[id]` | `getEmployment` |
| POST | `/api/hcm/employment/transfer` | `transferEmployee` |
| POST | `/api/hcm/employment/promote` | `promoteEmployee` |
| POST | `/api/hcm/employment/terminate` | `terminateEmployment` |
| POST | `/api/hcm/employment/rehire` | `rehireEmployee` |
| POST | `/api/hcm/recruitment/candidates` | `createCandidate` |
| GET | `/api/hcm/recruitment/candidates/[id]` | `getCandidate` |
| POST | `/api/hcm/recruitment/applications` | `createApplication` |
| POST | `/api/hcm/recruitment/applications/[id]/submit` | `submitApplication` |
| POST | `/api/hcm/recruitment/applications/[id]/advance` | `advanceApplication` |
| POST | `/api/hcm/recruitment/applications/[id]/interview` | `scheduleInterview` |
| POST | `/api/hcm/recruitment/offers` | `createOffer` |
| POST | `/api/hcm/recruitment/offers/[id]/hire` | `hireCandidate` |
| GET | `/api/hcm/onboarding` | `searchOnboarding` |
| POST | `/api/hcm/onboarding` | `startOnboarding` |
| GET | `/api/hcm/onboarding/[id]/readiness` | `determineActivationReadiness` |
| POST | `/api/hcm/onboarding/documents` | `uploadDocument` |
| POST | `/api/hcm/onboarding/documents/verify` | `verifyDocument` |
| POST | `/api/hcm/onboarding/tasks` | `completeTask` |
| POST | `/api/hcm/onboarding/provisioning` | `completeProvisioning` |

### Time Routes (11)

| Method | Path | Facade |
|--------|------|--------|
| GET | `/api/hcm/attendance` | `attendance.search` + `count` |
| POST | `/api/hcm/attendance` | `attendance.record` |
| POST | `/api/hcm/attendance/correct` | `attendance.correct` |
| GET | `/api/hcm/leave` | `leave.searchRequests` |
| POST | `/api/hcm/leave` | `leave.createRequest` |
| POST | `/api/hcm/leave/actions` | `leave.approve/reject/cancel` |
| GET | `/api/hcm/leave/balance` | `leave.getBalance` + `listPolicies` |
| GET | `/api/hcm/roster` | `roster.list` |
| POST | `/api/hcm/roster` | `roster.create` |
| POST | `/api/hcm/roster/publish` | `roster.publish` |
| GET | `/api/hcm/calendars` | `calendar.*` |

---

## Query Parameters (Common)

| Param | Used On | Description |
|-------|---------|-------------|
| `page`, `pageSize` | List endpoints | Pagination |
| `status` | Employee, employment, leave, onboarding | Filter by status |
| `employeeId` | Attendance, leave, employment | Filter by employee |
| `dateFrom`, `dateTo` | Time searches | Date range |

---

*Supersedes [P-012.6-API-Catalogue.md](./P-012.6-API-Catalogue.md) for authoritative reference.*
