import type { PermissionMatrixEntry } from "@/types/organization";
import { WORKSPACE_CAPTION_CLASS } from "@/lib/constants";

type PermissionMatrixProps = {
  entries: readonly PermissionMatrixEntry[];
};

/** Role × module permission matrix (Mission P-005). */
export function PermissionMatrix({ entries }: PermissionMatrixProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm font-light text-orion-muted" role="status">
        No roles configured.
      </p>
    );
  }

  const roles = [...new Set(entries.map((entry) => entry.role))];
  const modules = [...new Set(entries.map((entry) => entry.module))];

  return (
    <div className="overflow-x-auto" role="region" aria-label="Permission matrix">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">Role and module permission matrix</caption>
        <thead>
          <tr className="border-b border-orion-border/60">
            <th scope="col" className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>
              Module
            </th>
            {roles.map((role) => {
              const label = entries.find((entry) => entry.role === role)?.roleLabel ?? role;
              return (
                <th key={role} scope="col" className={`px-3 py-2 text-center ${WORKSPACE_CAPTION_CLASS}`}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => (
            <tr key={module} className="border-b border-orion-border/30">
              <th scope="row" className="px-3 py-2 font-medium text-orion-text capitalize">
                {module.replaceAll("-", " ")}
              </th>
              {roles.map((role) => {
                const entry = entries.find(
                  (candidate) => candidate.role === role && candidate.module === module,
                );
                const access = entry?.canWrite ? "RW" : entry?.canRead ? "R" : "—";
                return (
                  <td key={`${module}-${role}`} className="px-3 py-2 text-center text-orion-muted">
                    <span aria-label={`${role} ${module}: ${access}`}>{access}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
