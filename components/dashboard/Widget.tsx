import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WidgetProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "premium";
};

/** Foundational dashboard widget container. */
export function Widget({ children, className, variant = "default" }: WidgetProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-orion-lg border border-white/[0.07] bg-white/[0.03] shadow-[var(--orion-shadow-md)] backdrop-blur-md transition-all duration-[var(--orion-duration-slow)] hover:border-orion-gold/20 hover:bg-white/[0.04]",
        variant === "premium" &&
          "border-orion-gold/15 bg-gradient-to-br from-orion-gold/[0.08] via-white/[0.03] to-transparent shadow-[var(--orion-shadow-lg)]",
        className,
      )}
    >
      {children}
    </article>
  );
}
