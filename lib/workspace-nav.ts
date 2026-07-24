export type WorkspaceNavItem = {
  label: string;
  href: string;
};

/** Returns true when a workspace sub-nav item is active for the current path. */
export function isWorkspaceNavActive(
  pathname: string,
  href: string,
  basePath: string,
): boolean {
  if (href === basePath) {
    return pathname === basePath;
  }

  return pathname.startsWith(href);
}
