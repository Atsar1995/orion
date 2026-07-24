import {
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";

type WorkspaceSectionHeaderProps = {
  title: string;
  subtitle?: string;
};

/** Shared section header for Business Workspace sub-pages. */
export function WorkspaceSectionHeader({
  title,
  subtitle,
}: WorkspaceSectionHeaderProps) {
  return (
    <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
      <h1 className={WORKSPACE_TITLE_CLASS}>{title}</h1>
      {subtitle ? (
        <p className={WORKSPACE_SUBTITLE_CLASS}>{subtitle}</p>
      ) : null}
    </header>
  );
}
