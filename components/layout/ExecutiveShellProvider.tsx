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

type ExecutiveShellContextValue = {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const ExecutiveShellContext = createContext<ExecutiveShellContextValue | null>(null);

export function useExecutiveShell() {
  const context = useContext(ExecutiveShellContext);

  if (!context) {
    throw new Error("useExecutiveShell must be used within ExecutiveShellProvider");
  }

  return context;
}

type ExecutiveShellProviderProps = {
  children: ReactNode;
};

/** Mobile drawer state for the executive platform shell. */
export function ExecutiveShellProvider({ children }: ExecutiveShellProviderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((current) => !current), []);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  const value = useMemo(
    () => ({
      sidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }),
    [closeSidebar, openSidebar, sidebarOpen, toggleSidebar],
  );

  return (
    <ExecutiveShellContext.Provider value={value}>{children}</ExecutiveShellContext.Provider>
  );
}
