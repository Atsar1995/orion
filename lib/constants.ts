export const APP_VERSION = "1.1.0";

export const APP_RELEASE_NAME = "Executive Experience";

export const APP_TAGLINE = "One AI. One Workspace. Complete Business Control.";

export const QUICK_ACTION_BUTTON_CLASSNAME =
  "border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/85 hover:border-orion-gold/25 hover:bg-white/[0.06] hover:text-white";

/** Shared layout tokens for platform workspaces. */
export const WORKSPACE_PAGE_CLASS = "space-y-6";
export const WORKSPACE_SECTION_CLASS = "space-y-6";
export const WORKSPACE_HEADER_BLOCK_CLASS =
  "space-y-2 border-b border-white/[0.06] pb-5";
export const WORKSPACE_TITLE_CLASS =
  "text-3xl font-semibold tracking-tight text-white md:text-4xl";
export const WORKSPACE_SUBTITLE_CLASS = "text-sm font-light text-white/45";
export const WORKSPACE_GREETING_CLASS =
  "text-base font-medium text-white/85 md:text-lg";
export const WORKSPACE_SECTION_GROUP_CLASS = "space-y-4";
export const WORKSPACE_GRID_2_COL = "grid grid-cols-1 gap-4 lg:grid-cols-2";
export const WORKSPACE_GRID_3_COL = "grid grid-cols-1 gap-4 lg:grid-cols-3";
export const WORKSPACE_GRID_INTEGRATIONS_COL =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3";
export const WORKSPACE_GRID_4_COL =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";
export const WORKSPACE_STAT_GRID_CLASS =
  "grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4";
export const WORKSPACE_LIST_CLASS = "space-y-2.5";
export const WORKSPACE_LIST_ITEM_CLASS =
  "flex items-start gap-2 text-sm font-light leading-relaxed text-white/60";
export const WORKSPACE_FIELD_LIST_CLASS = "space-y-3";
export const WORKSPACE_FIELD_ROW_CLASS =
  "flex items-center justify-between gap-4 border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0";
export const WORKSPACE_PREMIUM_ICON_CLASS =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-orion-md border border-orion-gold/25 bg-orion-gold/10";
export const WORKSPACE_PREMIUM_BODY_CLASS =
  "text-sm font-light leading-relaxed text-white/70";
export const WORKSPACE_SUMMARY_CLASS =
  "text-base font-light leading-relaxed text-white/75";

/** In-page section title (h2) — below workspace page title. */
export const WORKSPACE_INPAGE_SECTION_TITLE_CLASS =
  "text-lg font-medium tracking-tight text-white/90 md:text-xl";

/** Uppercase caption label used in cards, tables, and field groups. */
export const WORKSPACE_CAPTION_CLASS =
  "text-[10px] font-medium tracking-wide text-orion-muted uppercase";

/** Standard muted body copy. */
export const WORKSPACE_BODY_MUTED_CLASS = "text-sm font-light text-orion-muted";

/** Card-equivalent shell when Card title layout is not suitable. */
export const WORKSPACE_PANEL_CLASS =
  "space-y-4 rounded-orion-lg border border-white/[0.07] bg-white/[0.03] p-5 md:p-6";

/** Executive kicker — section labels across Brief and Command Center. */
export const ORION_EXECUTIVE_KICKER_CLASS =
  "text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase";

/** Consistent keyboard focus ring for executive surfaces. */
export const ORION_FOCUS_RING_CLASS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold/50";

/** Calm secondary navigation link. */
export const ORION_SECONDARY_LINK_CLASS =
  "text-xs font-medium text-orion-gold/80 transition-colors hover:text-orion-gold";

export const USER = {
  name: "Mohammad Shafi",
  initials: "MS",
} as const;
