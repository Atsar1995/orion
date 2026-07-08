import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  variant?: "default" | "premium";
};

export function DashboardCard({
  title,
  children,
  className,
  action,
  variant = "default",
}: DashboardCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.24)] backdrop-blur-md transition-all duration-300 hover:border-orion-gold/20 hover:bg-white/[0.04] md:p-6",
        variant === "premium" &&
          "border-orion-gold/15 bg-gradient-to-br from-orion-gold/[0.08] via-white/[0.03] to-transparent shadow-[0_12px_40px_rgba(0,0,0,0.32)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orion-gold/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
