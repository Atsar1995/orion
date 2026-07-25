import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type ExecutiveCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  variant?: "default" | "premium";
};

/** Executive dashboard shell — wraps the ORION design system Card. */
export function ExecutiveCard({
  title,
  children,
  className,
  action,
  variant = "default",
}: ExecutiveCardProps) {
  return (
    <Card title={title} className={className} action={action} variant={variant}>
      {children}
    </Card>
  );
}
