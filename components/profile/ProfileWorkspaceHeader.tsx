import {
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";

type ProfileWorkspaceHeaderProps = {
  title: string;
  subtitle: string;
};

export function ProfileWorkspaceHeader({ title, subtitle }: ProfileWorkspaceHeaderProps) {
  return (
    <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
      <h1 className={WORKSPACE_TITLE_CLASS}>{title}</h1>
      <p className={WORKSPACE_SUBTITLE_CLASS}>{subtitle}</p>
    </header>
  );
}
