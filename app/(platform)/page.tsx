import Link from "next/link";
import { WORKSPACE_PAGE_CLASS, WORKSPACE_SUBTITLE_CLASS, WORKSPACE_TITLE_CLASS } from "@/lib/constants";
import { defaultNavigationRegistry } from "@/lib/navigation";

/** EP-001 executive platform home — navigation hub without business logic. */
export default function PlatformHomePage() {
  const executiveSection = defaultNavigationRegistry
    .getSections()
    .find((section) => section.id === "executive");

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className="space-y-2 border-b border-white/[0.06] pb-5">
        <h1 className={WORKSPACE_TITLE_CLASS}>Executive Platform</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          Foundational shell for ORION executive intelligence modules.
        </p>
      </header>

      <section aria-label="Executive surfaces" className="space-y-4">
        <h2 className="text-sm font-medium tracking-[0.12em] text-white/50 uppercase">
          Executive Surfaces
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(executiveSection?.items ?? []).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-orion-lg border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition hover:border-orion-gold/25 hover:bg-white/[0.05]"
              >
                <p className="text-base font-medium text-white/90">{item.label}</p>
                <p className="mt-1 text-sm font-light text-white/45">{item.href}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
