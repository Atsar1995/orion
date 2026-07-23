import { EmptyState as UiEmptyState } from "@/components/ui/EmptyState";

export function NoResults() {
  return (
    <div className="px-4 py-8">
      <UiEmptyState
        title="No matching items found."
        description="Try another search."
        className="items-start text-left sm:items-start sm:text-left"
      />
    </div>
  );
}
