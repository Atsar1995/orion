"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";

const CommandPalette = dynamic(
  () =>
    import("@/components/search/CommandPalette").then((module) => ({
      default: module.CommandPalette,
    })),
  { ssr: false },
);

type CommandPaletteContextValue = {
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);

  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }

  return context;
}

type CommandPaletteProviderProps = {
  children: ReactNode;
};

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((current) => !current), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return;
      }

      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      open,
      openPalette,
      closePalette,
      togglePalette,
    }),
    [closePalette, open, openPalette, togglePalette],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {open ? <CommandPalette onClose={closePalette} /> : null}
    </CommandPaletteContext.Provider>
  );
}
