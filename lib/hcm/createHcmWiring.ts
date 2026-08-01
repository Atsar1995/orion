import { defaultHcmStore, seedDefaultDocumentRequirements } from "@/lib/hcm/data/InMemoryHcmStore";
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

function bootstrapStore() {
  seedHcmTimeData(defaultHcmStore);
  seedHcmPayrollData(defaultHcmStore);
  seedHcmTalentData(defaultHcmStore);
  seedDefaultDocumentRequirements(defaultHcmStore, HCM_SEED_ORG_ID);
}

/** Centralized HCM dependency wiring — internal to the domain module. */
export function createHcmWiring() {
  bootstrapStore();

  const foundationRepositories = createFoundationRepositories(defaultHcmStore);
  const employeeRepository = foundationRepositories.employee;

  const attendanceRepository = new InMemoryAttendanceRepository(defaultHcmStore);
  const leaveRepository = new InMemoryLeaveRepository(defaultHcmStore);
  const rosterRepository = new InMemoryRosterRepository(defaultHcmStore);
  const shiftRepository = new InMemoryShiftRepository(defaultHcmStore);
  const calendarRepository = new InMemoryCalendarRepository(defaultHcmStore);
  const payrollRepository = new InMemoryPayrollRepository(defaultHcmStore);
  const payrollRunRepository = new InMemoryPayrollRunRepository(defaultHcmStore);
  const payrollComponentRepository = new InMemoryPayrollComponentRepository(defaultHcmStore);
  const performanceRepository = new InMemoryPerformanceRepository(defaultHcmStore);
  const learningRepository = new InMemoryLearningRepository(defaultHcmStore);
  const certificationRepository = new InMemoryCertificationRepository(defaultHcmStore);
  const competencyRepository = new InMemoryCompetencyRepository(defaultHcmStore);
  const talentRepository = new InMemoryTalentRepository(defaultHcmStore);

  const foundation = new HcmFoundationFacade(foundationRepositories);

  const attendance = new AttendanceService(attendanceRepository, employeeRepository);
  const leave = new LeaveService(leaveRepository, employeeRepository);
  const roster = new RosterService(rosterRepository, shiftRepository);
  const calendar = new CalendarService(calendarRepository);
  const shifts = new ShiftService(shiftRepository);
  const overtime = new OvertimeService(calendarRepository, employeeRepository);

  const payroll = new PayrollService(payrollRepository, payrollRunRepository);
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
    foundation,
    intelligence,
    attendance,
    leave,
    roster,
    calendar,
    shifts,
    overtime,
    payroll,
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
