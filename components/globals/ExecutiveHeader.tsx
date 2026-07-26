import Link from "next/link";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common/Button";
import { BellIcon } from "@/components/common/icons";
import { CommandPaletteTrigger } from "@/components/search/CommandPaletteTrigger";
import { USER } from "@/lib/constants";
import type { BreadcrumbItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type ExecutiveHeaderProps = {
  breadcrumbs?: readonly BreadcrumbItem[];
  className?: string;
};

/** Executive platform header with optional breadcrumb trail. */
export function ExecutiveHeader({ breadcrumbs = [], className }: ExecutiveHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-white/[0.06] bg-orion-navy/80 px-6 py-3 backdrop-blur-xl md:px-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-6">
          <CommandPaletteTrigger className="hidden min-w-[240px] flex-1 md:flex lg:min-w-[320px]" />

          {breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-white/45">
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <li key={item.href} className="flex items-center gap-2">
                      {index > 0 ? <span aria-hidden="true">/</span> : null}
                      {isLast ? (
                        <span aria-current="page" className="truncate text-white/75">
                          {item.label}
                        </span>
                      ) : (
                        <Link href={item.href} className="truncate hover:text-white/80">
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Button variant="icon" aria-label="Notifications">
            <BellIcon className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orion-gold" />
          </Button>

          <Avatar initials={USER.initials} label={USER.name} />
        </div>
      </div>
    </header>
  );
}
