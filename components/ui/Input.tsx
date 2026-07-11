"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("min-w-0 flex-1", className)}>
      {label ? (
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-light text-white placeholder:text-white/30 transition-colors duration-[var(--orion-duration-normal)] outline-none focus:border-orion-gold/30 focus:bg-white/[0.06]"
        {...props}
      />
    </div>
  );
}
