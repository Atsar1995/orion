import { Badge } from "@/components/common/Badge";
import { cn } from "@/lib/utils";

type PermissionViewerProps = {
  permissions: string[];
  className?: string;
};

/** Read-only permission scope viewer for provider connections. */
export function PermissionViewer({ permissions, className }: PermissionViewerProps) {
  if (permissions.length === 0) {
    return (
      <p className={cn("text-sm font-light text-white/45", className)}>
        No permissions declared.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[11px] font-medium tracking-wide text-white/35 uppercase">
        Permissions
      </p>
      <div className="flex flex-wrap gap-2">
        {permissions.map((permission) => (
          <Badge
            key={permission}
            className="normal-case tracking-normal border-white/10 bg-white/[0.03] text-white/60"
          >
            {permission}
          </Badge>
        ))}
      </div>
    </div>
  );
}
