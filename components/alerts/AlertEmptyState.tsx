/** Empty state for the executive alert center. */
export function AlertEmptyState() {
  return (
    <div
      className="rounded-orion-lg border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center"
      role="status"
    >
      <p className="text-sm font-medium text-white/80">No alerts match your filters</p>
      <p className="mt-2 text-sm font-light text-white/45">
        Adjust severity, category, status, or search to view executive notifications.
      </p>
    </div>
  );
}
