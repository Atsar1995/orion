import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common/Button";
import { BellIcon } from "@/components/common/icons";
import { SearchBar } from "@/components/common/SearchBar";
import { USER } from "@/lib/constants";
import { formatHeaderDate, getGreeting } from "@/lib/utils";

export function Header() {
  const now = new Date();

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-orion-navy/80 px-6 py-4 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-white md:text-xl">
            {getGreeting(now)}, {USER.name}
          </h1>
          <p className="mt-0.5 text-sm font-light text-white/45">
            {formatHeaderDate(now)}
          </p>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <SearchBar className="hidden min-w-[240px] flex-1 md:block lg:min-w-[280px]" />

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
