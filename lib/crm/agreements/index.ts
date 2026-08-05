import { randomUUID } from "crypto";
import { publishAgreementsEngineEvent } from "@/lib/crm/agreements-events";
import {
  CrmCanonicalEventPublisher,
} from "@/lib/crm/events";
import { SalesOrderService } from "@/lib/crm/services/SalesOrderService";
import { formatCommercialCurrency } from "@/lib/crm/data/seed-commercial";
import type {
  AgreementsBriefSignals,
  AgreementsRegistryView,
  ContractListItem,
  ProposalListItem,
  RateAgreementListItem,
  RenewalDashboardView,
} from "@/lib/crm/models/agreements";
import type { AgreementsRepository } from "@/lib/crm/repositories/AgreementsRepository";
import type {
  AgreementLifecycleStatus,
  AgreementSearchFilter,
  AgreementVersion,
  ApprovalRecord,
  ContractRecord,
  CreateContractInput,
  CreateProposalInput,
  CreateQuotationInput,
  CreateRateAgreementInput,
  DecideApprovalInput,
  PricingSchedule,
  ProposalRecord,
  QuotationRecord,
  RateAgreementRecord,
  RenewContractInput,
  RequestApprovalInput,
} from "@/types/crm-agreements";
import type { ServiceContext } from "@/types/services";

function todayIso(): string {
  return new Date().toISOString();
}

function daysUntil(date: string): number {
  const target = new Date(date).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function assignPricingId(pricing: Omit<PricingSchedule, "id">, prefix: string): PricingSchedule {
  return { ...pricing, id: `${prefix}-pricing-${randomUUID().slice(0, 8)}` };
}

function partyName(repository: AgreementsRepository, partyId: string): string {
  return (
    repository.getOrganisation(partyId)?.displayName ??
    repository.getPerson(partyId)?.displayName ??
    partyId
  );
}

/** Proposal lifecycle with version control. */
export class ProposalService {
  constructor(private readonly repository: AgreementsRepository) {}

  list(context: ServiceContext, filter: AgreementSearchFilter = {}): ProposalListItem[] {
    return this.repository.searchProposals(filter, context.organizationId).map((record) => ({
      id: record.id,
      title: record.title,
      partyName: partyName(this.repository, record.partyId),
      status: record.status,
      version: record.version,
      owner: record.owner,
      total: formatCommercialCurrency(record.pricing.total),
      validUntil: record.validUntil,
      opportunityId: record.opportunityId,
    }));
  }

  get(id: string, context: ServiceContext): ProposalRecord | null {
    const record = this.repository.getProposal(id);
    if (!record || record.organizationId !== context.organizationId) return null;
    return record;
  }

  create(input: CreateProposalInput, context: ServiceContext, actorName?: string): ProposalRecord {
    const now = todayIso();
    const record: ProposalRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      partyId: input.partyId,
      opportunityId: input.opportunityId,
      title: input.title,
      templateId: input.templateId,
      version: 1,
      versions: [{ version: 1, createdAt: now, createdBy: actorName, changeSummary: "Initial draft", snapshotStatus: "draft" }],
      status: "draft",
      owner: input.owner,
      pricing: assignPricingId(input.pricing, "prop"),
      terms: input.terms ?? [],
      validUntil: input.validUntil,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    const created = this.repository.createProposal(record);
    publishAgreementsEngineEvent(
      { eventType: "ProposalCreated", entityId: created.id, actorId: context.userId, actorName },
      context,
    );
    return created;
  }

  createVersion(id: string, changeSummary: string, context: ServiceContext, actorName?: string): ProposalRecord {
    const existing = this.get(id, context);
    if (!existing) throw new Error("PROPOSAL_NOT_FOUND");
    const nextVersion = existing.version + 1;
    const versionEntry: AgreementVersion = {
      version: nextVersion,
      createdAt: todayIso(),
      createdBy: actorName,
      changeSummary,
      snapshotStatus: existing.status,
    };
    return (
      this.repository.updateProposal(id, {
        version: nextVersion,
        versions: [...existing.versions, versionEntry],
        updatedAt: todayIso(),
      }) ?? existing
    );
  }

  transition(id: string, status: AgreementLifecycleStatus, context: ServiceContext, actorName?: string): ProposalRecord {
    const existing = this.get(id, context);
    if (!existing) throw new Error("PROPOSAL_NOT_FOUND");
    const updated = this.repository.updateProposal(id, { status, updatedAt: todayIso() }) ?? existing;
    if (status === "approved") {
      publishAgreementsEngineEvent(
        { eventType: "ProposalApproved", entityId: id, actorId: context.userId, actorName },
        context,
      );
    }
    return updated;
  }
}

/** Quotation management with pricing, discounts, taxes, validity. */
export class QuotationService {
  constructor(
    private readonly repository: AgreementsRepository,
    private readonly canonicalPublisher: CrmCanonicalEventPublisher,
  ) {}

  list(context: ServiceContext): QuotationRecord[] {
    return this.repository.listQuotations(context.organizationId);
  }

  create(input: CreateQuotationInput, context: ServiceContext): QuotationRecord {
    const now = todayIso();
    const record: QuotationRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      partyId: input.partyId,
      proposalId: input.proposalId,
      opportunityId: input.opportunityId,
      reference: `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      version: 1,
      status: "draft",
      owner: input.owner,
      pricing: assignPricingId(input.pricing, "quote"),
      validFrom: input.validFrom,
      validTo: input.validTo,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    const created = this.repository.createQuotation(record);
    this.canonicalPublisher.publishQuoteCreated(
      {
        quoteId: created.id,
        correlationId: created.id,
        opportunityId: created.opportunityId,
      },
      context,
    );
    return created;
  }

  issue(id: string, context: ServiceContext): QuotationRecord {
    const record = this.repository.getQuotation(id);
    if (!record || record.organizationId !== context.organizationId) throw new Error("QUOTATION_NOT_FOUND");
    return this.repository.updateQuotation(id, { status: "issued", updatedAt: todayIso() }) ?? record;
  }
}

/** Contract lifecycle — immutable once signed; changes create new versions. */
export class ContractService {
  constructor(
    private readonly repository: AgreementsRepository,
    private readonly salesOrders: SalesOrderService,
  ) {}

  list(context: ServiceContext, filter: AgreementSearchFilter = {}): ContractListItem[] {
    return this.repository.searchContracts(filter, context.organizationId).map((record) => ({
      id: record.id,
      title: record.title,
      partyName: partyName(this.repository, record.partyId),
      contractType: record.contractType,
      status: record.status,
      owner: record.owner,
      total: formatCommercialCurrency(record.pricing.total),
      effectiveFrom: record.effectiveFrom,
      effectiveTo: record.effectiveTo,
      daysToExpiry: record.status === "active" ? daysUntil(record.effectiveTo) : undefined,
    }));
  }

  get(id: string, context: ServiceContext): ContractRecord | null {
    const record = this.repository.getContract(id);
    if (!record || record.organizationId !== context.organizationId) return null;
    return record;
  }

  create(input: CreateContractInput, context: ServiceContext): ContractRecord {
    const now = todayIso();
    const record: ContractRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      partyId: input.partyId,
      opportunityId: input.opportunityId,
      proposalId: input.proposalId,
      quotationId: input.quotationId,
      title: input.title,
      contractType: input.contractType,
      version: 1,
      versions: [{ version: 1, createdAt: now, changeSummary: "Initial draft", snapshotStatus: "draft" }],
      status: "draft",
      owner: input.owner,
      pricing: assignPricingId(input.pricing, "contract"),
      terms: input.terms ?? [],
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      renewalRule: input.renewalRule,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    return this.repository.createContract(record);
  }

  sign(id: string, context: ServiceContext, actorName?: string): ContractRecord {
    const existing = this.get(id, context);
    if (!existing) throw new Error("CONTRACT_NOT_FOUND");
    if (existing.status === "signed" || existing.status === "active") {
      throw new Error("CONTRACT_ALREADY_EXECUTED");
    }
    const now = todayIso();
    const updated =
      this.repository.updateContract(id, {
        status: "signed",
        signedAt: now,
        updatedAt: now,
        versions: [
          ...existing.versions,
          { version: existing.version + 1, createdAt: now, createdBy: actorName, changeSummary: "Contract executed", snapshotStatus: "signed" },
        ],
        version: existing.version + 1,
      }) ?? existing;

    const activated = this.repository.updateContract(id, { status: "active", updatedAt: now }) ?? updated;
    publishAgreementsEngineEvent(
      { eventType: "ContractSigned", entityId: id, actorId: context.userId, actorName, payload: { partyId: existing.partyId } },
      context,
    );

    this.salesOrders.confirm(
      {
        salesOrderId: activated.id,
        quoteId: existing.quotationId,
        amount: String(existing.pricing.total),
        currencyCode: existing.pricing.currency,
        correlationId: activated.id,
        causationId: id,
        period: activated.effectiveFrom.slice(0, 7),
      },
      context,
    );

    return activated;
  }

  createAmendment(id: string, changeSummary: string, context: ServiceContext, actorName?: string): ContractRecord {
    const existing = this.get(id, context);
    if (!existing) throw new Error("CONTRACT_NOT_FOUND");
    const nextVersion = existing.version + 1;
    return (
      this.repository.updateContract(id, {
        version: nextVersion,
        status: "review",
        versions: [
          ...existing.versions,
          { version: nextVersion, createdAt: todayIso(), createdBy: actorName, changeSummary, snapshotStatus: "review" },
        ],
        updatedAt: todayIso(),
      }) ?? existing
    );
  }

  markExpired(id: string, context: ServiceContext): ContractRecord {
    const existing = this.get(id, context);
    if (!existing) throw new Error("CONTRACT_NOT_FOUND");
    const updated = this.repository.updateContract(id, { status: "expired", updatedAt: todayIso() }) ?? existing;
    publishAgreementsEngineEvent({ eventType: "ContractExpired", entityId: id, actorId: context.userId }, context);
    return updated;
  }
}

/** Rate agreement management. */
export class RateAgreementService {
  constructor(private readonly repository: AgreementsRepository) {}

  list(context: ServiceContext): RateAgreementListItem[] {
    return this.repository.listRateAgreements(context.organizationId).map((record) => ({
      id: record.id,
      name: record.name,
      partyName: partyName(this.repository, record.partyId),
      agreementType: record.agreementType,
      status: record.status,
      validFrom: record.validFrom,
      validTo: record.validTo,
      season: record.season,
    }));
  }

  create(input: CreateRateAgreementInput, context: ServiceContext, actorName?: string): RateAgreementRecord {
    const now = todayIso();
    const record: RateAgreementRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      partyId: input.partyId,
      contractId: input.contractId,
      name: input.name,
      agreementType: input.agreementType,
      version: 1,
      status: "draft",
      owner: input.owner,
      pricing: assignPricingId(input.pricing, "rate"),
      validFrom: input.validFrom,
      validTo: input.validTo,
      season: input.season,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    const created = this.repository.createRateAgreement(record);
    publishAgreementsEngineEvent(
      { eventType: "RateAgreementUpdated", entityId: created.id, actorId: context.userId, actorName, payload: { action: "created" } },
      context,
    );
    return created;
  }

  activate(id: string, context: ServiceContext, actorName?: string): RateAgreementRecord {
    const record = this.repository.getRateAgreement(id);
    if (!record || record.organizationId !== context.organizationId) throw new Error("RATE_AGREEMENT_NOT_FOUND");
    const updated = this.repository.updateRateAgreement(id, { status: "active", updatedAt: todayIso() }) ?? record;
    publishAgreementsEngineEvent(
      { eventType: "RateAgreementUpdated", entityId: id, actorId: context.userId, actorName, payload: { action: "activated" } },
      context,
    );
    return updated;
  }
}

/** Approval workflow for proposals and contracts. */
export class ApprovalWorkflowService {
  constructor(private readonly repository: AgreementsRepository) {}

  listPending(context: ServiceContext): ApprovalRecord[] {
    return this.repository
      .listApprovals(context.organizationId)
      .filter((entry) => entry.status === "pending");
  }

  request(input: RequestApprovalInput, _context: ServiceContext): ApprovalRecord {
    const record: ApprovalRecord = {
      id: randomUUID(),
      entityType: input.entityType,
      entityId: input.entityId,
      status: "pending",
      requestedBy: input.requestedBy,
      requestedAt: todayIso(),
      notes: input.notes,
    };
    const created = this.repository.createApproval(record);
    if (input.entityType === "proposal") {
      this.repository.updateProposal(input.entityId, { status: "review", updatedAt: todayIso() });
    } else if (input.entityType === "contract") {
      this.repository.updateContract(input.entityId, { status: "review", updatedAt: todayIso() });
    }
    return created;
  }

  decide(input: DecideApprovalInput, context: ServiceContext, actorName?: string): ApprovalRecord {
    const approval = this.repository.getApproval(input.approvalId);
    if (!approval) throw new Error("APPROVAL_NOT_FOUND");
    const now = todayIso();
    const updated =
      this.repository.updateApproval(input.approvalId, {
        status: input.approved ? "approved" : "rejected",
        decidedBy: input.decidedBy,
        decidedAt: now,
        notes: input.notes,
      }) ?? approval;

    const newStatus: AgreementLifecycleStatus = input.approved ? "approved" : "rejected";
    if (approval.entityType === "proposal") {
      this.repository.updateProposal(approval.entityId, { status: newStatus, updatedAt: now });
      if (input.approved) {
        publishAgreementsEngineEvent(
          { eventType: "ProposalApproved", entityId: approval.entityId, actorId: context.userId, actorName },
          context,
        );
      }
    } else if (approval.entityType === "contract") {
      this.repository.updateContract(approval.entityId, { status: newStatus, updatedAt: now });
    }
    return updated;
  }
}

/** Contract renewal management. */
export class RenewalService {
  constructor(
    private readonly repository: AgreementsRepository,
    private readonly contracts: ContractService,
  ) {}

  getDashboard(context: ServiceContext): RenewalDashboardView {
    const renewals = this.repository.listRenewals(context.organizationId);
    const contracts = this.contracts.list(context);
    const expiring = contracts.filter(
      (entry) => entry.status === "active" && entry.daysToExpiry !== undefined && entry.daysToExpiry <= 45,
    );

    return {
      upcoming: renewals.map((entry) => ({
        ...entry,
        contractTitle: this.repository.getContract(entry.contractId)?.title ?? entry.contractId,
        partyName: partyName(this.repository, this.repository.getContract(entry.contractId)?.partyId ?? ""),
      })),
      expiring,
      pendingApprovals: this.repository.listApprovals(context.organizationId).filter((entry) => entry.status === "pending"),
    };
  }

  renew(input: RenewContractInput, context: ServiceContext, actorName?: string): ContractRecord {
    const existing = this.contracts.get(input.contractId, context);
    if (!existing) throw new Error("CONTRACT_NOT_FOUND");

    const renewalRecord = {
      id: randomUUID(),
      contractId: input.contractId,
      previousContractId: input.contractId,
      renewalDate: todayIso().slice(0, 10),
      newValidTo: input.newEffectiveTo,
      status: "renewed" as AgreementLifecycleStatus,
      notes: input.notes,
    };
    this.repository.createRenewal(renewalRecord);

    const updated =
      this.repository.updateContract(input.contractId, {
        status: "renewed",
        effectiveTo: input.newEffectiveTo,
        updatedAt: todayIso(),
        versions: [
          ...existing.versions,
          {
            version: existing.version + 1,
            createdAt: todayIso(),
            createdBy: actorName,
            changeSummary: `Renewed to ${input.newEffectiveTo}`,
            snapshotStatus: "renewed",
          },
        ],
        version: existing.version + 1,
      }) ?? existing;

    const activated = this.repository.updateContract(input.contractId, { status: "active", updatedAt: todayIso() }) ?? updated;
    publishAgreementsEngineEvent(
      { eventType: "ContractRenewed", entityId: input.contractId, actorId: context.userId, actorName },
      context,
    );
    return activated;
  }
}

/** Agreement analytics and brief signals. */
export class AgreementAnalyticsService {
  constructor(private readonly repository: AgreementsRepository) {}

  getRegistry(context: ServiceContext): AgreementsRegistryView {
    const proposals = new ProposalService(this.repository).list(context);
    const salesOrders = new SalesOrderService(new CrmCanonicalEventPublisher());
    const contracts = new ContractService(this.repository, salesOrders).list(context);
    const rateAgreements = new RateAgreementService(this.repository).list(context);
    return { proposals, contracts, rateAgreements };
  }

  getBriefSignals(context: ServiceContext): AgreementsBriefSignals {
    const pending = this.repository.listApprovals(context.organizationId).filter((entry) => entry.status === "pending");
    const contracts = this.repository.listContracts(context.organizationId);
    const active = contracts.filter((entry) => entry.status === "active");
    const expiring = active.filter((entry) => daysUntil(entry.effectiveTo) <= 45);
    const renewals = this.repository.listRenewals(context.organizationId);
    const underContract = active.reduce((sum, entry) => sum + entry.pricing.total, 0);

    return {
      pendingApprovals: pending.length,
      expiringContracts: expiring.length,
      upcomingRenewals: renewals.length,
      activeContracts: active.length,
      pipelineUnderContract: formatCommercialCurrency(underContract),
      briefingLine: `${pending.length} agreements awaiting approval, ${expiring.length} expiring within 45 days, ${formatCommercialCurrency(underContract)} under active contract.`,
    };
  }
}

/** CRM Commercial Agreements facade (Mission P-008.3). */
export class CrmAgreementsFacade {
  readonly proposals: ProposalService;
  readonly quotations: QuotationService;
  readonly contracts: ContractService;
  readonly rates: RateAgreementService;
  readonly approvals: ApprovalWorkflowService;
  readonly renewals: RenewalService;
  readonly analytics: AgreementAnalyticsService;

  constructor(
    repository: AgreementsRepository,
    canonicalPublisher: CrmCanonicalEventPublisher,
    salesOrders: SalesOrderService,
  ) {
    this.proposals = new ProposalService(repository);
    this.quotations = new QuotationService(repository, canonicalPublisher);
    this.contracts = new ContractService(repository, salesOrders);
    this.rates = new RateAgreementService(repository);
    this.approvals = new ApprovalWorkflowService(repository);
    this.renewals = new RenewalService(repository, this.contracts);
    this.analytics = new AgreementAnalyticsService(repository);
  }
}

export { formatCommercialCurrency, partyName };
