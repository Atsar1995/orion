import type {
  CurrencyAmount,
  PayrollComponentRecord,
  PayrollEntryLine,
  PayrollIntegrationInputs,
} from "@/types/hcm-payroll";

export type ComponentCalculationContext = PayrollIntegrationInputs & {
  readonly currency: string;
};

/** Metadata-driven payroll calculation engine — no country-specific rules (P-012.7). */
export class PayrollCalculationEngine {
  calculateComponent(
    component: PayrollComponentRecord,
    context: ComponentCalculationContext,
  ): PayrollEntryLine | null {
    if (!component.active) return null;

    const amount = this.resolveAmount(component, context);
    if (amount.value === 0) return null;

    return {
      componentCode: component.code,
      componentType: component.componentType,
      calculationBasis: component.calculationBasis,
      quantity: this.resolveQuantity(component, context),
      rate: component.rate,
      amount,
      metadata: component.metadata,
    };
  }

  calculateEntry(
    components: readonly PayrollComponentRecord[],
    context: ComponentCalculationContext,
  ): {
    lines: PayrollEntryLine[];
    grossPay: CurrencyAmount;
    totalDeductions: CurrencyAmount;
    netPay: CurrencyAmount;
  } {
    const lines: PayrollEntryLine[] = [];

    for (const component of components) {
      const line = this.calculateComponent(component, context);
      if (line) lines.push(line);
    }

    const grossPay = this.sumByTypes(lines, ["earning", "reimbursement"], context.currency);
    const totalDeductions = this.sumByTypes(lines, ["deduction"], context.currency);
    const benefits = this.sumByTypes(lines, ["benefit"], context.currency);
    const netPay: CurrencyAmount = {
      value: Math.round((grossPay.value + benefits.value - totalDeductions.value) * 100) / 100,
      currency: context.currency,
    };

    return { lines, grossPay, totalDeductions, netPay };
  }

  private resolveAmount(
    component: PayrollComponentRecord,
    context: ComponentCalculationContext,
  ): CurrencyAmount {
    const currency = context.currency;

    switch (component.calculationBasis) {
      case "fixed":
        return component.defaultAmount ?? { value: 0, currency };

      case "percentage": {
        const base = context.baseSalary.value;
        const rate = component.rate ?? 0;
        return { value: Math.round(base * (rate / 100) * 100) / 100, currency };
      }

      case "hourly": {
        const hours = context.attendanceDays * 8;
        const rate = component.rate ?? component.defaultAmount?.value ?? 0;
        return { value: Math.round(hours * rate * 100) / 100, currency };
      }

      case "attendance_days": {
        const rate = component.rate ?? component.defaultAmount?.value ?? 0;
        return { value: Math.round(context.attendanceDays * rate * 100) / 100, currency };
      }

      case "leave_days": {
        const rate = component.rate ?? component.defaultAmount?.value ?? 0;
        return { value: Math.round(context.leaveDays * rate * 100) / 100, currency };
      }

      case "overtime_hours": {
        const rate = component.rate ?? component.defaultAmount?.value ?? 0;
        const multiplier = Number(component.metadata?.overtimeMultiplier ?? "1.5");
        return {
          value: Math.round(context.overtimeHours * rate * multiplier * 100) / 100,
          currency,
        };
      }

      case "metadata_formula": {
        const formulaKey = component.metadata?.formulaKey;
        if (formulaKey === "base_salary") {
          return context.baseSalary;
        }
        return component.defaultAmount ?? { value: 0, currency };
      }

      default:
        return { value: 0, currency };
    }
  }

  private resolveQuantity(
    component: PayrollComponentRecord,
    context: ComponentCalculationContext,
  ): number | undefined {
    switch (component.calculationBasis) {
      case "attendance_days":
        return context.attendanceDays;
      case "leave_days":
        return context.leaveDays;
      case "overtime_hours":
        return context.overtimeHours;
      case "hourly":
        return context.attendanceDays * 8;
      default:
        return undefined;
    }
  }

  private sumByTypes(
    lines: readonly PayrollEntryLine[],
    types: readonly PayrollEntryLine["componentType"][],
    currency: string,
  ): CurrencyAmount {
    const value = lines
      .filter((line) => types.includes(line.componentType))
      .reduce((sum, line) => sum + line.amount.value, 0);
    return { value: Math.round(value * 100) / 100, currency };
  }
}
