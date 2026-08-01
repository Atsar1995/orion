import type {
  CareerPathRecord,
  CompetencyRecord,
  LearningProgramRecord,
  TalentProfileRecord,
  TrainingCourseRecord,
} from "@/types/hcm-talent";
import { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import { HCM_SEED_ORG_ID } from "@/lib/hcm/data/seed-hcm-time";

const NOW = "2026-07-30T09:00:00.000Z";

export const SEED_COMPETENCIES: CompetencyRecord[] = [
  {
    id: "comp-leadership",
    organizationId: HCM_SEED_ORG_ID,
    code: "LEADERSHIP",
    name: "Leadership",
    category: "Management",
    frameworkCode: "ORANIA-CF-2026",
    active: true,
  },
  {
    id: "comp-communication",
    organizationId: HCM_SEED_ORG_ID,
    code: "COMMUNICATION",
    name: "Communication",
    category: "Core",
    frameworkCode: "ORANIA-CF-2026",
    active: true,
  },
  {
    id: "comp-technical",
    organizationId: HCM_SEED_ORG_ID,
    code: "TECHNICAL",
    name: "Technical Excellence",
    category: "Functional",
    frameworkCode: "ORANIA-CF-2026",
    active: true,
  },
];

export const SEED_COURSES: TrainingCourseRecord[] = [
  {
    id: "course-onboarding",
    organizationId: HCM_SEED_ORG_ID,
    code: "ONB-101",
    title: "New Employee Orientation",
    durationHours: 4,
    active: true,
  },
  {
    id: "course-leadership",
    organizationId: HCM_SEED_ORG_ID,
    code: "LEAD-201",
    title: "Leadership Essentials",
    durationHours: 16,
    prerequisiteCourseIds: ["course-onboarding"],
    active: true,
  },
];

export const SEED_PROGRAMS: LearningProgramRecord[] = [
  {
    id: "program-mgmt-track",
    organizationId: HCM_SEED_ORG_ID,
    code: "MGMT-TRACK",
    title: "Management Development Track",
    courseIds: ["course-onboarding", "course-leadership"],
    active: true,
  },
];

export const SEED_CAREER_PATHS: CareerPathRecord[] = [
  {
    id: "cpath-ops-lead",
    organizationId: HCM_SEED_ORG_ID,
    code: "OPS-LEAD",
    title: "Operations Team Lead",
    stage: "lead",
    competencyIds: ["comp-leadership", "comp-communication"],
    active: true,
  },
];

export const SEED_TALENT_PROFILES: TalentProfileRecord[] = [
  {
    id: "talent-001",
    organizationId: HCM_SEED_ORG_ID,
    employeeId: "emp-hcm-001",
    careerStage: "mid",
    talentPoolCodes: ["high-potential"],
    readinessForPromotion: true,
    updatedAt: NOW,
  },
];

export function seedHcmTalentData(store: InMemoryHcmStore, organizationId = HCM_SEED_ORG_ID): void {
  for (const c of SEED_COMPETENCIES) {
    if (c.organizationId === organizationId) store.competencies.set(c.id, c);
  }
  for (const c of SEED_COURSES) {
    if (c.organizationId === organizationId) store.trainingCourses.set(c.id, c);
  }
  for (const p of SEED_PROGRAMS) {
    if (p.organizationId === organizationId) store.learningPrograms.set(p.id, p);
  }
  for (const p of SEED_CAREER_PATHS) {
    if (p.organizationId === organizationId) store.careerPaths.set(p.id, p);
  }
  for (const p of SEED_TALENT_PROFILES) {
    if (p.organizationId === organizationId) store.talentProfiles.set(p.employeeId, p);
  }
}
