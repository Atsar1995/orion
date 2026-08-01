import type { ReactNode } from "react";
import { ORION_EXECUTIVE_KICKER_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BriefSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  id?: string;
};

/** Reusable EC-001 section wrapper with accessible heading hierarchy. */
export function BriefSection({
  title,
  subtitle,
  children,
  className,
  action,
  id,
}: BriefSectionProps) {
  return (
    <section aria-labelledby={id ?? `${title}-heading`} className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id={id ?? `${title}-heading`}
            className={ORION_EXECUTIVE_KICKER_CLASS}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm font-light text-orion-muted">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
