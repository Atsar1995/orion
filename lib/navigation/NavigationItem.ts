/** Icon identifiers for executive platform navigation entries. */
export type NavigationIcon =
  | "advisor"
  | "command-center"
  | "mission-control"
  | "engineering"
  | "configuration"
  | "intelligence"
  | "tasks"
  | "calendar"
  | "messages"
  | "hospitality"
  | "commerce"
  | "marketing"
  | "crm"
  | "finance"
  | "knowledge"
  | "integrations"
  | "settings";

/** Single navigation entry in the executive platform shell. */
export type NavigationItem = {
  readonly label: string;
  readonly href: string;
  readonly icon: NavigationIcon;
  readonly availability?: "available" | "coming-soon";
};

/** @deprecated Use NavigationItem */
export type NavItem = NavigationItem;

/** @deprecated Use NavigationIcon */
export type NavIcon = NavigationIcon;

/** Breadcrumb segment for executive header navigation. */
export type BreadcrumbItem = {
  readonly label: string;
  readonly href: string;
};
