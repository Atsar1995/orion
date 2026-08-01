export const HCM_MODULE_KEY = "hcm" as const;
export const HCM_WORKSPACE_ID = "hcm-workspace" as const;
export const HCM_IIL_SERVICE_ID = "hcm-workspace" as const;

export const HCM_MISSION_ORGANIZATION = "P-012.1" as const;
export const HCM_MISSION_EMPLOYEE = "P-012.2" as const;
export const HCM_MISSION_EMPLOYMENT = "P-012.3" as const;
export const HCM_MISSION_RECRUITMENT = "P-012.4" as const;
export const HCM_MISSION_ONBOARDING = "P-012.5" as const;
export const HCM_MISSION_TIME = "P-012.6" as const;
export const HCM_MISSION_PAYROLL = "P-012.7" as const;
export const HCM_MISSION_TALENT = "P-012.8" as const;

export const HCM_ALL_MISSIONS = [
  HCM_MISSION_ORGANIZATION,
  HCM_MISSION_EMPLOYEE,
  HCM_MISSION_EMPLOYMENT,
  HCM_MISSION_RECRUITMENT,
  HCM_MISSION_ONBOARDING,
  HCM_MISSION_TIME,
  HCM_MISSION_PAYROLL,
  HCM_MISSION_TALENT,
] as const;

export const HCM_BASE_PATH = "/hcm" as const;

export const HCM_FOUNDATION_CAPABILITIES = [
  { key: "organization_structure", status: "active" as const, mission: HCM_MISSION_ORGANIZATION },
  { key: "employee_master", status: "active" as const, mission: HCM_MISSION_EMPLOYEE },
  { key: "employment_lifecycle", status: "active" as const, mission: HCM_MISSION_EMPLOYMENT },
  { key: "recruitment", status: "active" as const, mission: HCM_MISSION_RECRUITMENT },
  { key: "onboarding", status: "active" as const, mission: HCM_MISSION_ONBOARDING },
] as const;

export const HCM_WORKFLOW_TEMPLATES = {
  leaveApproval: "hcm.leave.approval",
  attendanceCorrection: "hcm.attendance.correction",
  overtimeApproval: "hcm.overtime.approval",
  shiftChange: "hcm.shift.change",
  goalApproval: "hcm.goal.approval",
  reviewApproval: "hcm.review.approval",
  developmentPlanApproval: "hcm.development.approval",
  trainingApproval: "hcm.training.approval",
  offerApproval: "hcm.offer.approval",
  recruitmentApplication: "hcm.recruitment.application",
  onboardingProcess: "hcm.onboarding.process",
  employmentTransfer: "hcm.employment.transfer",
  employmentTermination: "hcm.employment.termination",
  certificationRenewal: "hcm.certification.renewal",
} as const;

export const HCM_TIME_CAPABILITIES = [
  { key: "attendance_recording", status: "active" as const, mission: HCM_MISSION_TIME },
  { key: "leave_management", status: "active" as const, mission: HCM_MISSION_TIME },
  { key: "roster_planning", status: "active" as const, mission: HCM_MISSION_TIME },
  { key: "shift_scheduling", status: "active" as const, mission: HCM_MISSION_TIME },
  { key: "calendar_management", status: "active" as const, mission: HCM_MISSION_TIME },
  { key: "overtime_tracking", status: "active" as const, mission: HCM_MISSION_TIME },
] as const;

export const HCM_PAYROLL_CAPABILITIES = [
  { key: "payroll_calendar", status: "active" as const, mission: HCM_MISSION_PAYROLL },
  { key: "payroll_calculation", status: "active" as const, mission: HCM_MISSION_PAYROLL },
  { key: "payroll_adjustments", status: "active" as const, mission: HCM_MISSION_PAYROLL },
  { key: "multi_currency", status: "active" as const, mission: HCM_MISSION_PAYROLL },
] as const;

export const HCM_TALENT_CAPABILITIES = [
  { key: "goal_management", status: "active" as const, mission: HCM_MISSION_TALENT },
  { key: "performance_reviews", status: "active" as const, mission: HCM_MISSION_TALENT },
  { key: "competency_framework", status: "active" as const, mission: HCM_MISSION_TALENT },
  { key: "learning_catalog", status: "active" as const, mission: HCM_MISSION_TALENT },
  { key: "certification_management", status: "active" as const, mission: HCM_MISSION_TALENT },
  { key: "succession_planning", status: "active" as const, mission: HCM_MISSION_TALENT },
  { key: "talent_analytics", status: "active" as const, mission: HCM_MISSION_TALENT },
] as const;

export const HCM_ALL_CAPABILITIES = [
  ...HCM_FOUNDATION_CAPABILITIES,
  ...HCM_TIME_CAPABILITIES,
  ...HCM_PAYROLL_CAPABILITIES,
  ...HCM_TALENT_CAPABILITIES,
] as const;
