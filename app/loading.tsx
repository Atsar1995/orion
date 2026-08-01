import { LoadingState } from "@/components/ui/LoadingState";

/** Root loading state for initial navigation (Mission S1D). */
export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-orion-navy" aria-busy="true">
      <LoadingState label="Loading ORION..." />
    </div>
  );
}
