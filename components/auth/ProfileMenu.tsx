"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/common/Avatar";
import { useSession } from "@/hooks/useSession";
import { getRoleLabel } from "@/lib/auth/roles";
import { getDisplayInitials } from "@/lib/identity/user-display";
import { ORION_FOCUS_RING_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ProfileMenuProps = {
  className?: string;
};

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Authenticated user profile menu for the executive header (Mission S1A). */
export function ProfileMenu({ className }: ProfileMenuProps) {
  const router = useRouter();
  const { session, profile, logout } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = session?.user.name ?? "User";
  const email = session?.user.email ?? "";
  const roleLabel = session ? getRoleLabel(session.user.role) : "";
  const organizationName = profile?.organization.branding.displayName ?? profile?.organization.name;
  const initials = getDisplayInitials(name);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSignOut() {
    setOpen(false);
    await logout();
    router.replace("/login");
  }

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-2 rounded-orion-md border border-transparent px-1 py-1 transition-colors hover:border-orion-border hover:bg-orion-surface/40",
          ORION_FOCUS_RING_CLASS,
        )}
      >
        <Avatar initials={initials} label={name} />
        <span className="hidden max-w-[140px] truncate text-sm font-medium text-orion-text/85 lg:inline">
          {name}
        </span>
        <ChevronIcon className="hidden h-4 w-4 text-orion-muted lg:block" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 z-[var(--orion-z-header)] mt-2 w-64 rounded-orion-lg border border-orion-border bg-orion-navy/95 p-2 shadow-orion-lg backdrop-blur-xl"
        >
          <div className="border-b border-orion-border px-3 py-3">
            <p className="truncate text-sm font-medium text-orion-text">{name}</p>
            <p className="truncate text-xs text-orion-muted">{email}</p>
            <p className="mt-1 text-xs text-orion-gold/80">
              {roleLabel}
              {organizationName ? ` · ${organizationName}` : ""}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-orion-md px-3 py-2 text-sm text-orion-text/85 transition-colors hover:bg-orion-surface/60",
                ORION_FOCUS_RING_CLASS,
              )}
            >
              My Profile
            </Link>
            <Link
              href="/profile/preferences"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-orion-md px-3 py-2 text-sm text-orion-text/85 transition-colors hover:bg-orion-surface/60",
                ORION_FOCUS_RING_CLASS,
              )}
            >
              Preferences
            </Link>
            <Link
              href="/profile/security"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-orion-md px-3 py-2 text-sm text-orion-text/85 transition-colors hover:bg-orion-surface/60",
                ORION_FOCUS_RING_CLASS,
              )}
            >
              Security
            </Link>
          </div>

          <div className="border-t border-orion-border pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignOut()}
              className={cn(
                "block w-full rounded-orion-md px-3 py-2 text-left text-sm text-orion-danger/90 transition-colors hover:bg-orion-surface/60",
                ORION_FOCUS_RING_CLASS,
              )}
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
