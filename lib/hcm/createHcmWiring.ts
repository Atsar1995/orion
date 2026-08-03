import { seedDefaultDocumentRequirements } from "@/lib/hcm/data/InMemoryHcmStore";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";
import { getDefaultPlatformStore } from "@/lib/platform/store/PlatformStoreFactory";
import { createFoundationRepositories } from "@/lib/hcm/data/createFoundationRepositories";
import { seedHcmPayrollData } from "@/lib/hcm/data/seed-hcm-payroll";
import { HCM_SEED_ORG_ID, seedHcmTimeData } from "@/lib/hcm/data/seed-hcm-time";
import { seedHcmTalentData } from "@/lib/hcm/data/seed-hcm-talent";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import { registerHcmSubscribers } from "@/lib/hcm/events/register-hcm-subscribers";
import { HcmFoundationFacade } from "@/lib/hcm/HcmFoundationFacade";
import {
  InMemoryPayrollComponentRepository,
  InMemoryPayrollRepository,
  InMemoryPayrollRunRepository,
} from "@/lib/hcm/payroll/repositories/InMemoryPayrollRepository";
import { PayrollAdjustmentService } from "@/lib/hcm/payroll/services/PayrollAdjustmentService";
import { PayrollCalculationService } from "@/lib/hcm/payroll/services/PayrollCalculationService";
import { PayrollPeriodService } from "@/lib/hcm/payroll/services/PayrollPeriodService";
import { InMemoryExpenseRepository } from "@/lib/hcm/expense/repositories/InMemoryExpenseRepository";
import { ExpenseApprovalService } from "@/lib/hcm/expense/services/ExpenseApprovalService";
import { PayrollService } from "@/lib/hcm/payroll/services/PayrollService";
import { PayrollValidationService } from "@/lib/hcm/payroll/services/PayrollValidationService";
import {
  InMemoryAttendanceRepository,
  InMemoryCalendarRepository,
  InMemoryLeaveRepository,
  InMemoryRosterRepository,
  InMemoryShiftRepository,
} from "@/lib/hcm/time/repositories/InMemoryTimeRepository";
import { AttendanceService } from "@/lib/hcm/time/services/AttendanceService";
import { CalendarService } from "@/lib/hcm/time/services/CalendarService";
import { LeaveService } from "@/lib/hcm/time/services/LeaveService";
import { OvertimeService } from "@/lib/hcm/time/services/OvertimeService";
import { RosterService } from "@/lib/hcm/time/services/RosterService";
import { ShiftService } from "@/lib/hcm/time/services/ShiftService";
import {
  InMemoryCertificationRepository,
  InMemoryCompetencyRepository,
  InMemoryLearningRepository,
  InMemoryPerformanceRepository,
  InMemoryTalentRepository,
} from "@/lib/hcm/talent/repositories/InMemoryTalentRepository";
import { CertificationService } from "@/lib/hcm/talent/services/CertificationService";
import { CompetencyService } from "@/lib/hcm/talent/services/CompetencyService";
import { LearningService } from "@/lib/hcm/talent/services/LearningService";
import { PerformanceService } from "@/lib/hcm/talent/services/PerformanceService";
import { TalentService } from "@/lib/hcm/talent/services/TalentService";

function bootstrapStore(platformStore: PlatformStore) {
  const hcmStore = platformStore.getHcmBacking();
  seedHcmTimeData(hcmStore);
  seedHcmPayrollData(hcmStore);
  seedHcmTalentData(hcmStore);
  seedDefaultDocumentRequirements(hcmStore, HCM_SEED_ORG_ID);
}

/** Centralized HCM dependency wiring — internal to the domain module. */
export function createHcmWiring(platformStore: PlatformStore = getDefaultPlatformStore()) {
  bootstrapStore(platformStore);

  const hcmStore = platformStore.getHcmBacking();
  const foundationRepositories = createFoundationRepositories(hcmStore);
  const employeeRepository = foundationRepositories.employee;

  const attendanceRepository = new InMemoryAttendanceRepository(hcmStore);
  const leaveRepository = new InMemoryLeaveRepository(hcmStore);
  const rosterRepository = new InMemoryRosterRepository(hcmStore);
  const shiftRepository = new InMemoryShiftRepository(hcmStore);
  const calendarRepository = new InMemoryCalendarRepository(hcmStore);
  const payrollRepository = new InMemoryPayrollRepository(hcmStore);
  const payrollRunRepository = new InMemoryPayrollRunRepository(hcmStore);
  const payrollComponentRepository = new InMemoryPayrollComponentRepository(hcmStore);
  const performanceRepository = new InMemoryPerformanceRepository(hcmStore);
  const learningRepository = new InMemoryLearningRepository(hcmStore);
  const certificationRepository = new InMemoryCertificationRepository(hcmStore);
  const competencyRepository = new InMemoryCompetencyRepository(hcmStore);
  const talentRepository = new InMemoryTalentRepository(hcmStore);

  const foundation = new HcmFoundationFacade(foundationRepositories);

  const attendance = new AttendanceService(attendanceRepository, employeeRepository);
  const leave = new LeaveService(leaveRepository, employeeRepository);
  const roster = new RosterService(rosterRepository, shiftRepository);
  const calendar = new CalendarService(calendarRepository);
  const shifts = new ShiftService(shiftRepository);
  const overtime = new OvertimeService(calendarRepository, employeeRepository);

  const expenseRepository = new InMemoryExpenseRepository(hcmStore);
  const payroll = new PayrollService(payrollRepository, payrollRunRepository);
  const expenseApproval = new ExpenseApprovalService(expenseRepository);
  const payrollPeriods = new PayrollPeriodService(payrollRepository);
  const payrollCalculation = new PayrollCalculationService(
    payrollRepository,
    payrollRunRepository,
    payrollComponentRepository,
    attendanceRepository,
    leaveRepository,
    foundationRepositories.employment,
  );
  const payrollAdjustments = new PayrollAdjustmentService(
    payrollRepository,
    payrollRunRepository,
    payrollComponentRepository,
  );
  const payrollValidation = new PayrollValidationService(
    payrollRepository,
    payrollRunRepository,
    foundationRepositories.employment,
  );

  const competency = new CompetencyService(competencyRepository);
  const performance = new PerformanceService(performanceRepository, employeeRepository, competency);
  const learning = new LearningService(learningRepository, employeeRepository);
  const certification = new CertificationService(certificationRepository, employeeRepository);
  const talent = new TalentService(talentRepository);

  const intelligence = getIntelligenceIntegrationService();
  registerHcmSubscribers(intelligence);

  return {
    platformStore,
    foundation,
    intelligence,
    attendance,
    leave,
    roster,
    calendar,
    shifts,
    overtime,
    payroll,
    expenseApproval,
    payrollPeriods,
    payrollCalculation,
    payrollAdjustments,
    payrollValidation,
    performance,
    learning,
    certification,
    talent,
  };
}

export type HcmWiring = ReturnType<typeof createHcmWiring>;
