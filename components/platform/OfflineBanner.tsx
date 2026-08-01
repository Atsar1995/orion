"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Detects offline state and surfaces a calm platform banner (Mission S1D). */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 top-0 z-[calc(var(--orion-z-header)+1)] border-b border-amber-400/25",
        "bg-amber-950/90 px-4 py-2 text-center text-sm font-light text-amber-100 backdrop-blur-md",
      )}
    >
      You are offline. ORION will show cached content where available.
    </div>
  );
}
