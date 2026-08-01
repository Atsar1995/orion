import type { OrgHierarchyNode } from "@/types/organization";
import { WORKSPACE_BODY_MUTED_CLASS } from "@/lib/constants";

type OrgHierarchyTreeProps = {
  node: OrgHierarchyNode;
  depth?: number;
};

function HierarchyNode({ node, depth = 0 }: OrgHierarchyTreeProps) {
  const typeLabel = node.type.replaceAll("_", " ");

  return (
    <li className="space-y-2">
      <div
        className="flex items-center gap-2 rounded-orion-md border border-orion-border/50 px-3 py-2"
        style={{ marginLeft: depth * 16 }}
      >
        <span className="text-[10px] font-medium tracking-wide text-orion-gold/70 uppercase">
          {typeLabel}
        </span>
        <span className="text-sm font-medium text-orion-text">{node.label}</span>
        {node.metadata?.role ? (
          <span className={`ml-auto ${WORKSPACE_BODY_MUTED_CLASS}`}>{node.metadata.role}</span>
        ) : null}
      </div>
      {node.children.length > 0 ? (
        <ul className="space-y-2" role="group" aria-label={`${node.label} children`}>
          {node.children.map((child) => (
            <HierarchyNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Accessible organizational hierarchy tree (Mission P-005). */
export function OrgHierarchyTree({ node }: OrgHierarchyTreeProps) {
  if (node.children.length === 0 && node.type === "organization") {
    return (
      <p className={WORKSPACE_BODY_MUTED_CLASS} role="status">
        No organizational structure configured yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2" role="tree" aria-label="Organization hierarchy">
      <HierarchyNode node={node} />
    </ul>
  );
}
