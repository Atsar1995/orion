import {
  WORKSPACE_GREETING_CLASS,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";

type WorkspacePageHeaderProps = {
  greetingPeriod: string;
  executiveName: string;
  title: string;
  dateLabel: string;
  description?: string;
};

/** Shared workspace page header — greeting, title, and date. */
export function WorkspacePageHeader({
  greetingPeriod,
  executiveName,
  title,
  dateLabel,
  description,
}: WorkspacePageHeaderProps) {
  return (
    <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
      <p className={WORKSPACE_GREETING_CLASS}>
        {greetingPeriod}, {executiveName}
      </p>
      <h1 className={WORKSPACE_TITLE_CLASS}>{title}</h1>
      {description ? <p className={WORKSPACE_SUBTITLE_CLASS}>{description}</p> : null}
      <p className={WORKSPACE_SUBTITLE_CLASS}>{dateLabel}</p>
    </header>
  );
}
