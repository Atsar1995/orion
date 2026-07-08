import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-orion-gold/20 bg-orion-gold/5 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-orion-gold uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
