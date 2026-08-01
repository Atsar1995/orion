import { ReleaseReadinessDashboard } from "@/components/engineering/ReleaseReadinessDashboard";

export const dynamic = "force-dynamic";

/** Mission S1D — internal production readiness dashboard (Super Admin). */
export default function EngineeringReadinessPage() {
  return <ReleaseReadinessDashboard />;
}
