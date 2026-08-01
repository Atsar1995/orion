/** Global executive keyboard shortcut definitions (Mission 19C). */

export type ExecutiveShortcut = {
  id: string;
  label: string;
  keys: readonly string[];
  href?: string;
  action?: "open-palette" | "toggle-sidebar";
};

export const GLOBAL_EXECUTIVE_SHORTCUTS: readonly ExecutiveShortcut[] = [
  {
    id: "open-palette",
    label: "Open command palette",
    keys: ["Meta+K", "Ctrl+K"],
    action: "open-palette",
  },
  {
    id: "morning-brief",
    label: "Morning Brief",
    keys: ["Meta+Shift+B", "Ctrl+Shift+B"],
    href: "/brief",
  },
  {
    id: "command-center",
    label: "Command Center",
    keys: ["Meta+Shift+C", "Ctrl+Shift+C"],
    href: "/command-center",
  },
];

export const BRIEF_SECTION_SHORTCUTS = [
  { key: "1", sectionId: "brief-snapshot", label: "Snapshot" },
  { key: "2", sectionId: "brief-attention", label: "Attention" },
  { key: "3", sectionId: "brief-actions", label: "Actions" },
  { key: "4", sectionId: "brief-context", label: "Context" },
] as const;

/** Returns true when the event matches a shortcut chord (meta/ctrl + key). */
export function matchesShortcutChord(
  event: KeyboardEvent,
  keys: readonly string[],
): boolean {
  const eventKey = event.key.length === 1 ? event.key.toUpperCase() : event.key;

  return keys.some((shortcut) => {
    const parts = shortcut.split("+").map((part) => part.trim().toLowerCase());
    const shortcutKey = parts[parts.length - 1]?.toUpperCase() ?? "";

    if (eventKey.toUpperCase() !== shortcutKey) {
      return false;
    }

    const needsShift = parts.includes("shift");
    const needsMeta = parts.includes("meta");
    const needsCtrl = parts.includes("ctrl");

    if (needsShift !== event.shiftKey) {
      return false;
    }

    if (needsMeta || needsCtrl) {
      return event.metaKey || event.ctrlKey;
    }

    return !event.metaKey && !event.ctrlKey && !event.altKey;
  });
}

/** True when focus is in an editable field — skip single-key shortcuts. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName.toLowerCase();

  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}
