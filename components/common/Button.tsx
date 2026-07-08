import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "icon";
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        variant === "primary" &&
          "inline-flex w-fit items-center gap-2 rounded-xl bg-orion-gold px-5 py-2.5 text-sm font-medium text-orion-navy transition-all duration-200 hover:bg-orion-gold-light hover:shadow-[0_8px_24px_rgba(212,175,55,0.25)]",
        variant === "icon" &&
          "relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/60 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
