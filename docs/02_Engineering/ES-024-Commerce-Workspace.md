# ES-024 — Commerce Workspace

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** 20A (Construction Phase)

**Author:** Founder & Chief Architect

---

# Purpose

The Commerce Workspace provides a unified operational and executive view of trading, retail, wholesale, manufacturing, and export businesses.

It combines customers, products, inventory, orders, procurement, suppliers, logistics, finance, and executive intelligence into a single workspace.

The objective is to allow executives to understand the commercial health of the business while enabling operational teams to execute efficiently.

**Current state:** Commerce is registered in platform navigation (`/commerce`) and workspace constants but has no implemented workspace routes. This specification defines the full Business Workspace per [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) and [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md). Primary business context includes **Atsar Exports** (see [FA-001](../01_Product/FA-001-Project-Sunrise.md) observation categories).

---

# Objectives

The Commerce Workspace shall:

- Manage products.
- Manage inventory.
- Track customer orders.
- Monitor exports.
- Track suppliers.
- Monitor profitability.
- Detect inventory risks.
- Generate recommendations.
- Provide executive intelligence.

---

# Primary Users

Founder · Managing Director · Sales Manager · Export Manager · Operations Manager · Warehouse Manager · Procurement Manager · Finance Manager · Customer Service

---

# Executive Questions

The workspace shall answer:

- What orders require attention today?
- Which customers are awaiting delivery?
- Which products are selling best?
- Which inventory is running low?
- Which inventory is not moving?
- Which suppliers require follow-up?
- Which shipments are delayed?
- Which customers have outstanding payments?
- What is today's sales performance?
- What commercial risks exist?

**Behavioural input:** [FA-001 Project Sunrise](../01_Product/FA-001-Project-Sunrise.md) (Atsar Exports categories) · [FA-002 Project Compass](../01_Product/FA-002-Project-Compass.md)

---

# Workspace Sections

1. Executive Summary
2. Orders
3. Customers
4. Products
5. Inventory
6. Procurement
7. Suppliers
8. Shipments
9. Revenue
10. Alerts
11. Recommendations

---

# Executive Summary

**Displays:** Sales Today · Orders Today · Revenue · Gross Profit · Inventory Value · Outstanding Receivables · Pending Shipments · Business Health

**Platform:** Executive Summary pattern · health score with drivers · [Executive Dashboard](./ES-022-Executive-Dashboard.md) workspace card

---

# Orders

**Displays:** New · Processing · Packed · Shipped · Delivered · Returned · Cancelled

**Actions:** View · Edit · Invoice · Dispatch

---

# Customers

**Displays:** Customer Name · Order Value · Lifetime Value · Outstanding Balance · Last Order · Country · Relationship Status · Preferred Customer

---

# Products

**Displays:** SKU · Category · Current Stock · Reserved Stock · Available Stock · Selling Price · Cost · Profit Margin · Status

---

# Inventory

**Displays:** Stock Level · Min/Max Level · Reorder Point · Warehouse Location · Inventory Value · Inventory Age · Turnover Rate

---

# Procurement

**Displays:** Purchase Orders · Supplier · Expected Delivery · Order Status · Pending Approval · Budget

---

# Suppliers

**Displays:** Supplier Name · Performance Rating · Lead Time · Open Purchase Orders · Outstanding Payments · Contact Details

---

# Shipments

**Displays:** Shipment Number · Carrier · Destination · Dispatch Date · Expected Delivery · Tracking Status · Customs Status

---

# Revenue

**Displays:** Daily/Weekly/Monthly Revenue · Gross Profit · Net Profit · Top Products · Top Customers

---

# Alerts

**Examples:** Low Stock · Delayed Shipment · Outstanding Payment · Supplier Delay · Negative Margin · Inventory Overstock · Large Order · Contract Expiry

---

# Recommendations

**Examples:** Reorder Product A · Contact Customer XYZ · Increase Stock of Fast Seller · Discount Slow Moving Inventory · Follow Up Supplier · Prioritise High Value Order

**Platform:** Workspace intelligence pipeline → [Executive Provider](../../lib/intelligence/provider.ts) → Intelligence Platform

---

# Workspace Navigation

**Route:** `/commerce`

| Section | Route (target) |
|---------|----------------|
| Overview | `/commerce` |
| Orders | `/commerce/orders` |
| Customers | `/commerce/customers` |
| Products | `/commerce/products` |
| Inventory | `/commerce/inventory` |
| Procurement | `/commerce/procurement` |
| Suppliers | `/commerce/suppliers` |
| Shipments | `/commerce/shipments` |
| Revenue | `/commerce/revenue` |
| Reports | `/commerce/reports` |
| Settings | `/commerce/settings` |

Follow [Finance](../finance/) and [CRM](../crm/) sub-navigation pattern (`WorkspaceSubNav`).

---

# Search

Supports: Customer Name · Product Name · SKU · Order Number · Invoice · Shipment Number · Supplier · Country

Integrates with [Command Palette / Universal Search](../10_Decisions/ADR-003-Global-Command-Palette.md).

---

# Filters

Date · Customer · Country · Category · Order Status · Payment Status · Supplier · Warehouse

---

# Responsive Behaviour

| Viewport | Layout |
|----------|--------|
| Desktop | Three-column layout |
| Tablet | Two-column layout |
| Mobile | Single-column layout |

---

# Empty States

Display: illustration · helpful explanation · suggested action

---

# Error States

Display: simple message · retry button · technical details hidden

---

# Performance

| Target | Requirement |
|--------|-------------|
| Initial load | < 2 seconds |
| Search | < 300ms |
| Navigation | Instant |

---

# Accessibility

Keyboard navigation · screen reader support · WCAG 2.2 AA

---

# Architecture Requirements

Per [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md):

| Requirement | Implementation |
|-------------|----------------|
| Executive Shell integration | `app/(platform)/commerce/` · `DashboardLayout` |
| Business logic in `lib/` | `lib/commerce/` · `lib/commerce-data.ts` (placeholder) |
| Presentation in components | `components/commerce/` |
| Executive Provider | `lib/intelligence/workspace-providers/commerce-executive-provider.ts` |
| Executive Brief contribution | Intelligence Bus — no direct Advisor imports |
| Intelligence pipeline | `lib/commerce/commerce-intelligence-pipeline.ts` (workspace-specific) |
| Registry registration | `register-executive-providers.ts` |

**Dependency rules:** Workspace modules must not import CRM, Finance, or Hospitality directly. Platform engines remain workspace-agnostic per [ES-021](./ES-021-Executive-Intelligence-Engines.md).

**Note:** Commerce customer and order data may relate to CRM customer intelligence — integration occurs only through Executive Intelligence Platform aggregation, not cross-workspace imports.

---

# Provider Dependencies

| Provider | Responsibility |
|----------|----------------|
| Customer Provider | Profiles, balances, relationship status |
| Order Provider | Order lifecycle, fulfilment status |
| Inventory Provider | Stock levels, reorder, ageing |
| Product Provider | SKU, pricing, margins |
| Supplier Provider | Performance, lead time, POs |
| Shipment Provider | Logistics, customs, tracking |
| Finance Provider | Revenue, receivables, profitability |
| Recommendation Provider | Executive actions ranked by impact |
| Alert Provider | Commercial and inventory-risk alerts |
| Health Provider | Commerce business health score |

All providers implement [ExecutiveProvider](../../lib/intelligence/provider.ts) + ADR-006 aggregation methods.

---

# Platform Dependencies

| Dependency | Status |
|------------|--------|
| Mission 17B — Intelligence Engines | Complete |
| Mission 17A — Provider Framework | Complete |
| Executive Shell | Complete |
| ES-022 — Executive Dashboard | Specified |
| ES-023 — Hospitality Workspace | Specified |
| Commerce Executive Provider | Planned (Mission 20A) |
| ERP / inventory API integration | Out of scope (placeholder data Phase II) |

---

# Business Rules

- Inventory cannot become negative.
- Orders require valid customer records.
- Shipments require approved dispatch.
- Outstanding balances generate alerts.
- Recommendations ranked by business impact.
- Historical order data remains immutable.

---

# Acceptance Criteria

The workspace shall:

- [ ] Manage customers with valid records
- [ ] Manage products and SKU catalogue
- [ ] Track inventory with non-negative stock enforcement
- [ ] Track orders through full lifecycle
- [ ] Track shipments including export/customs status
- [ ] Track suppliers and procurement
- [ ] Present recommendations via Executive Provider
- [ ] Generate commercial and inventory alerts
- [ ] Support responsive layouts (375px, 768px, 1280px)
- [ ] Meet WCAG 2.2 AA accessibility standards
- [ ] Pass [Business Workspace Compliance](../09_Standards/Engineering_Standards.md#business-workspace-compliance)
- [ ] Pass Verification Hierarchy
- [ ] Satisfy [Non-Negotiables](../00_BLUEPRINT/ORION_Non_Negotiables.md) Decision Filter

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Order Created | Appears in orders and executive summary |
| Order Updated | Status reflected across fulfilment views |
| Inventory Reduced | Stock decrements; cannot go negative |
| Inventory Replenished | Stock and reorder alerts update |
| Shipment Created | Tracking visible; customs status when export |
| Shipment Delivered | Order complete; revenue recognised |
| Supplier Delayed | Alert and recommendation generated |
| Outstanding Payment | Alert surfaced; customer balance visible |
| Low Stock Alert | Critical alert; reorder recommendation |
| Provider Failure | Widget error state; workspace remains usable |
| Mobile Layout | Sections stack; navigation usable |

---

# Out of Scope

- Marketplace Integration
- EDI Integration
- Barcode Scanning
- RFID Tracking
- Warehouse Robotics
- AI Demand Forecasting

These features belong to future releases.

---

# Future Enhancements

- Demand Forecasting · Purchase Optimization · Dynamic Pricing
- Supplier Intelligence · Profit Prediction · Inventory Forecasting
- AI Sales Assistant · Cross-Business Analytics · Executive Forecasting

---

# Definition of Done

The Commerce Workspace is complete when:

- Orders function correctly
- Customer management is operational
- Inventory management is operational
- Shipments are tracked
- Procurement functions correctly
- Recommendations function correctly via Executive Provider
- Alerts operate correctly
- Executive Brief receives commerce contribution
- Accessibility requirements are met
- Performance targets are achieved
- Release Record (RR) published
- Founder approval is received

---

# References

| Document | Location |
|----------|----------|
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-023 Hospitality Workspace | [ES-023-Hospitality-Workspace.md](./ES-023-Hospitality-Workspace.md) |
| ES-021 Intelligence Engines | [ES-021-Executive-Intelligence-Engines.md](./ES-021-Executive-Intelligence-Engines.md) |
| ADR-005 Business Workspace | [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) |
| ADR-006 Provider Framework | [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) |
| Business Workspace Pattern | [BUSINESS_WORKSPACE_PATTERN.md](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md) |
| Product Constitution | [ORION_Product_Constitution.md](../01_Product/ORION_Product_Constitution.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Product Bible | [ORION_Product_Bible.md](../00_BLUEPRINT/ORION_Product_Bible.md) |
| Project Charter | [ORION_Project_Charter.md](../00_BLUEPRINT/ORION_Project_Charter.md) |

---

# Closing Statement

The Commerce Workspace is the commercial intelligence centre of ORION.

It should enable executives to understand the complete commercial lifecycle—from customer enquiry to final delivery—through a single, coherent workspace that supports confident decision-making and operational excellence.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Record** | Pending (Mission 20A) |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**
