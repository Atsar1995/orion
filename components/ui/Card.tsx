import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  variant?: "default" | "premium";
};

export function Card({
  title,
  children,
  className,
  action,
  variant = "default",
}: CardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-orion-lg border border-white/[0.07] bg-white/[0.03] p-5 shadow-[var(--orion-shadow-md)] backdrop-blur-md transition-all duration-[var(--orion-duration-slow)] hover:border-orion-gold/20 hover:bg-white/[0.04] md:p-6",
        variant === "premium" &&
          "border-orion-gold/15 bg-gradient-to-br from-orion-gold/[0.08] via-white/[0.03] to-transparent shadow-[var(--orion-shadow-lg)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orion-gold/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-[var(--orion-duration-slow)] group-hover:opacity-100"
      />
      <div className="relative flex h-full flex-col">
        <header className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium tracking-tight text-white/90">
            {title}
          </h3>
          {action}
        </header>
        {children}
      </div>
    </article>
  );
}
