import { PropertyDirectory } from "@/components/hospitality/PropertyDirectory";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { hospitalityInventoryService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Hospitality property list (Mission P-007.1). */
export default async function HospitalityPropertiesPage() {
  const { context } = await getDecisionServiceContext();
  const portfolio = hospitalityInventoryService.properties.getPortfolio(context);
  const properties = hospitalityInventoryService.properties.listProperties(context);

  return (
    <>
      <HospitalitySectionHeader
        title="Properties"
        subtitle="Portfolio, property details, and multi-property inventory management."
      />
      <section aria-label="Hospitality Properties" className={WORKSPACE_SECTION_CLASS}>
        <PropertyDirectory portfolio={portfolio} properties={properties} />
      </section>
    </>
  );
}
