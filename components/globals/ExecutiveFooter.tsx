import { APP_RELEASE_NAME, APP_TAGLINE, APP_VERSION } from "@/lib/constants";

/** Platform footer — understated closure for executive surfaces. */
export function ExecutiveFooter() {
  return (
    <footer className="border-t border-orion-border px-6 py-6 md:px-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-orion-muted">ORION Executive Operating System</p>
          <p className="mt-1 text-xs font-light text-orion-muted/70">
            Version v{APP_VERSION} · {APP_RELEASE_NAME}
          </p>
        </div>
        <p className="text-xs font-light text-orion-muted/60">© Atsar Technologies</p>
      </div>
      <p className="sr-only">{APP_TAGLINE}</p>
    </footer>
  );
}
