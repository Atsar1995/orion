import { randomUUID } from "crypto";
import { CoaRulesEngine } from "@/lib/finance/chart-of-accounts/CoaRulesEngine";
import type {
  ChartOfAccountDetailView,
  ChartOfAccountHierarchyNode,
  ChartOfAccountListItem,
  ChartOfAccountListView,
} from "@/lib/finance/models/chart-of-accounts";
import type { ChartOfAccountsRepository } from "@/lib/finance/repositories/ChartOfAccountsRepository";
import type {
  ChartOfAccountRecord,
  ChartOfAccountListQuery,
  CreateChartOfAccountInput,
  ModifyChartOfAccountInput,
} from "@/types/finance-chart-of-accounts";
import type { ServiceContext } from "@/types/services";

function todayIso(): string {
  return new Date().toISOString();
}

function mapListItem(
  record: ChartOfAccountRecord,
  repository: ChartOfAccountsRepository,
  organizationId: string,
): ChartOfAccountListItem {
  const depth = computeDepth(record, repository, organizationId);
  const childCount = repository.listChildren(organizationId, record.id).length;

  return {
    id: record.id,
    code: record.code,
    name: record.name,
    accountType: record.accountType,
    category: record.category,
    parentAccountId: record.parentAccountId,
    postingAllowed: record.postingAllowed,
    isControlAccount: record.isControlAccount,
    status: record.status,
    depth,
    childCount,
  };
}

function computeDepth(
  record: ChartOfAccountRecord,
  repository: ChartOfAccountsRepository,
  organizationId: string,
): number {
  let depth = 0;
  let current = record.parentAccountId;

  while (current) {
    depth += 1;
    const parent = repository.findById(organizationId, current);
    current = parent?.parentAccountId;
  }

  return depth;
}

function buildHierarchyPath(
  record: ChartOfAccountRecord,
  repository: ChartOfAccountsRepository,
  organizationId: string,
): string[] {
  const path: string[] = [record.code];
  let current = record.parentAccountId;

  while (current) {
    const parent = repository.findById(organizationId, current);
    if (!parent) break;
    path.unshift(parent.code);
    current = parent.parentAccountId;
  }

  return path;
}

/** Chart of Accounts service (Mission P-009.2). */
export class ChartOfAccountsService {
  readonly rules: CoaRulesEngine;

  constructor(private readonly repository: ChartOfAccountsRepository) {
    this.rules = new CoaRulesEngine(repository);
  }

  list(query: ChartOfAccountListQuery, context: ServiceContext): ChartOfAccountListView {
    const records = this.repository.list(context.organizationId, query);
    const items = records.map((record) => mapListItem(record, this.repository, context.organizationId));

    const byType = items.reduce(
      (acc, item) => {
        acc[item.accountType] = (acc[item.accountType] ?? 0) + 1;
        return acc;
      },
      {} as Record<ChartOfAccountRecord["accountType"], number>,
    );

    return { total: items.length, items, byType };
  }

  getDetail(accountId: string, context: ServiceContext): ChartOfAccountDetailView | null {
    const record = this.repository.findById(context.organizationId, accountId);
    if (!record) return null;

    const parent = record.parentAccountId
      ? this.repository.findById(context.organizationId, record.parentAccountId)
      : null;

    const children = this.repository.listChildren(context.organizationId, record.id);

    return {
      ...record,
      parentCode: parent?.code,
      parentName: parent?.name,
      childAccountIds: children.map((child) => child.id),
      hierarchyPath: buildHierarchyPath(record, this.repository, context.organizationId),
    };
  }

  getByCode(code: string, context: ServiceContext): ChartOfAccountDetailView | null {
    const record = this.repository.findByCode(context.organizationId, code);
    if (!record) return null;
    return this.getDetail(record.id, context);
  }

  getHierarchy(context: ServiceContext): readonly ChartOfAccountHierarchyNode[] {
    const records = this.repository.list(context.organizationId, { status: "active" });
    const roots = records.filter((record) => !record.parentAccountId);

    const buildNode = (record: ChartOfAccountRecord): ChartOfAccountHierarchyNode => ({
      account: mapListItem(record, this.repository, context.organizationId),
      children: this.repository
        .listChildren(context.organizationId, record.id)
        .map((child) => buildNode(child)),
    });

    return roots.map((root) => buildNode(root));
  }

  create(input: CreateChartOfAccountInput, context: ServiceContext): ChartOfAccountRecord {
    const issues = this.rules.validateCreate(input, context.organizationId);
    if (issues.length > 0) {
      throw new Error(issues[0]?.code ?? "COA_VALIDATION_FAILED");
    }

    const now = todayIso();
    const record: ChartOfAccountRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      code: input.code.trim(),
      name: input.name.trim(),
      description: input.description?.trim(),
      accountType: input.accountType,
      category: input.category.trim(),
      parentAccountId: input.parentAccountId,
      postingAllowed: input.postingAllowed ?? true,
      isControlAccount: input.isControlAccount ?? false,
      currencyRule: input.currencyRule ?? "functional_only",
      taxApplicable: input.taxApplicable ?? false,
      costCentreRequired: input.costCentreRequired ?? false,
      profitCentreRequired: input.profitCentreRequired ?? false,
      status: input.status ?? "active",
      effectiveFrom: input.effectiveFrom ?? now.slice(0, 10),
      effectiveTo: input.effectiveTo,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(record);
  }

  update(
    accountId: string,
    input: ModifyChartOfAccountInput,
    context: ServiceContext,
  ): ChartOfAccountRecord {
    const existing = this.repository.findById(context.organizationId, accountId);
    if (!existing) throw new Error("ACCOUNT_NOT_FOUND");

    const issues = this.rules.validateUpdate(existing, input, context.organizationId);
    if (issues.length > 0) {
      throw new Error(issues[0]?.code ?? "COA_VALIDATION_FAILED");
    }

    const updated: ChartOfAccountRecord = {
      ...existing,
      name: input.name?.trim() ?? existing.name,
      description: input.description !== undefined ? input.description.trim() : existing.description,
      category: input.category?.trim() ?? existing.category,
      parentAccountId:
        input.parentAccountId === null
          ? undefined
          : input.parentAccountId ?? existing.parentAccountId,
      postingAllowed: input.postingAllowed ?? existing.postingAllowed,
      isControlAccount: input.isControlAccount ?? existing.isControlAccount,
      currencyRule: input.currencyRule ?? existing.currencyRule,
      taxApplicable: input.taxApplicable ?? existing.taxApplicable,
      costCentreRequired: input.costCentreRequired ?? existing.costCentreRequired,
      profitCentreRequired: input.profitCentreRequired ?? existing.profitCentreRequired,
      status: input.status ?? existing.status,
      effectiveFrom: input.effectiveFrom ?? existing.effectiveFrom,
      effectiveTo:
        input.effectiveTo === null ? undefined : input.effectiveTo ?? existing.effectiveTo,
      updatedAt: todayIso(),
    };

    return this.repository.update(updated);
  }

  validateHierarchy(context: ServiceContext) {
    const issues = this.rules.validateHierarchyIntegrity(context.organizationId);
    return { passed: issues.length === 0, issues };
  }
}
