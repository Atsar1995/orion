import { cn } from "@/lib/utils";

type AvatarProps = {
  initials: string;
  label: string;
  className?: string;
};

export function Avatar({ initials, label, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl border border-orion-gold/25 bg-orion-gold/10 text-sm font-medium text-orion-gold",
        className,
      )}
      aria-label={`Profile: ${label}`}
      role="img"
    >
      {initials}
    </div>
  );
}
