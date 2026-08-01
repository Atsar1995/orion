import {
  WORKSPACE_INPAGE_SECTION_TITLE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
} from "@/lib/constants";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  as?: "header" | "div";
};

/** In-page section header — consistent typography across workspaces. */
export function SectionHeader({
  title,
  subtitle,
  className,
  as: Tag = "header",
}: SectionHeaderProps) {
  return (
    <Tag className={className}>
      <h2 className={WORKSPACE_INPAGE_SECTION_TITLE_CLASS}>{title}</h2>
      {subtitle ? <p className={`mt-1 ${WORKSPACE_SUBTITLE_CLASS}`}>{subtitle}</p> : null}
    </Tag>
  );
}
