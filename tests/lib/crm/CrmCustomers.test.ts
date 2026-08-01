import { describe, expect, it } from "vitest";
import { CRM_CUSTOMER_RECORDS } from "@/lib/crm/data/customer-records";
import { InMemoryCrmRepository, CrmService } from "@/lib/crm";
import {
  findCustomerRecordById,
  queryCustomerRecords,
} from "@/lib/crm/services/customers/customer-query";
import { resolveCustomerHealthLabel } from "@/lib/crm/data/customer-records";

describe("resolveCustomerHealthLabel", () => {
  it("maps score ranges to executive labels", () => {
    expect(resolveCustomerHealthLabel(95)).toBe("Excellent");
    expect(resolveCustomerHealthLabel(80)).toBe("Good");
    expect(resolveCustomerHealthLabel(65)).toBe("Needs Attention");
    expect(resolveCustomerHealthLabel(50)).toBe("At Risk");
  });
});

describe("queryCustomerRecords", () => {
  it("filters, sorts, and paginates customer records", () => {
    const pageOne = queryCustomerRecords(CRM_CUSTOMER_RECORDS, {
      page: 1,
      pageSize: 5,
      sortField: "name",
      sortDirection: "asc",
    });

    expect(pageOne.items).toHaveLength(5);
    expect(pageOne.total).toBe(8);
    expect(pageOne.totalPages).toBe(2);

    const filtered = queryCustomerRecords(CRM_CUSTOMER_RECORDS, {
      search: "ABC",
      filters: { industry: "Manufacturing" },
    });

    expect(filtered.items).toHaveLength(1);
    expect(filtered.items[0]?.name).toBe("ABC Industries");
  });

  it("finds customer by id", () => {
    const customer = findCustomerRecordById(CRM_CUSTOMER_RECORDS, "abc-industries");
    expect(customer?.company).toBe("ABC Industries Pvt Ltd");
  });
});

describe("CrmService customers", () => {
  it("returns customer detail with opportunities", () => {
    const service = new CrmService(new InMemoryCrmRepository());
    const detail = service.getCustomerDetail("orania-hospitality-group");

    expect(detail?.customer.name).toBe("OranIA Hospitality Group");
    expect(detail?.openOpportunities.length).toBeGreaterThan(0);
  });
});
