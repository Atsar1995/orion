import type {
  CrmCustomerDetailView,
  CrmCustomerListResult,
  CustomerListQuery,
} from "@/lib/crm/models/customers";
import type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";
import {
  findCustomerRecordById,
  queryCustomerRecords,
} from "@/lib/crm/services/customers/customer-query";

/** CRM customer module service — placeholder data only (Mission 16A.3). */
export class CrmCustomersService {
  constructor(private readonly repository: CrmRepository) {}

  listCustomers(query: CustomerListQuery = {}): CrmCustomerListResult {
    return queryCustomerRecords(this.repository.getCustomerRecords(), query);
  }

  getCustomerDetail(customerId: string): CrmCustomerDetailView | null {
    const customer = findCustomerRecordById(
      this.repository.getCustomerRecords(),
      customerId,
    );

    if (!customer) {
      return null;
    }

    const recentActivity = this.repository
      .getRecentActivity()
      .filter((item) => item.description.includes(customer.name.split(" ")[0] ?? customer.name))
      .slice(0, 5);

    const openOpportunities = this.repository
      .getOpportunityRecords()
      .filter(
        (opportunity) =>
          opportunity.customerId === customer.id &&
          opportunity.stage !== "Won" &&
          opportunity.stage !== "Lost",
      )
      .map((opportunity) => ({
        name: opportunity.name,
        value: opportunity.value,
        stage: opportunity.stage,
        expectedClose: opportunity.expectedClose,
      }));

    return {
      customer,
      recentActivity:
        recentActivity.length > 0
          ? recentActivity
          : [
              {
                time: customer.lastContact,
                type: "Note" as const,
                description: customer.lastInteraction,
              },
            ],
      openOpportunities,
    };
  }

  getCustomerCatalog() {
    return this.repository.getCustomerRecords();
  }
}

export function createCrmCustomersService(repository: CrmRepository): CrmCustomersService {
  return new CrmCustomersService(repository);
}
