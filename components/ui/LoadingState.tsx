import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({
  label = "Loading...",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-8",
        className,
      )}
    >
      <div
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-orion-gold"
      />
      <p className="text-sm font-light text-white/45">{label}</p>
    </div>
  );
}
