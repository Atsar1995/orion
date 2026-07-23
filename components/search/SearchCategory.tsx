import type { ReactNode } from "react";

type SearchCategoryProps = {
  label: string;
  children: ReactNode;
};

export function SearchCategory({ label, children }: SearchCategoryProps) {
  return (
    <section aria-label={label} className="space-y-1">
      <h3 className="px-3 py-1.5 text-[11px] font-medium tracking-[0.08em] text-white/35 uppercase">
        {label}
      </h3>
      <div role="group" aria-label={label}>
        {children}
      </div>
    </section>
  );
}
