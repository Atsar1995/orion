import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common/Button";
import { BellIcon } from "@/components/common/icons";
import { CommandPaletteTrigger } from "@/components/search/CommandPaletteTrigger";
import { USER } from "@/lib/constants";

/** Compact platform utility bar — workspace pages provide their own executive greeting. */
export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-orion-navy/80 px-6 py-3 backdrop-blur-xl md:px-8">
      <div className="flex items-center justify-between gap-4">
        <CommandPaletteTrigger className="hidden min-w-[240px] flex-1 md:flex lg:min-w-[320px]" />

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
