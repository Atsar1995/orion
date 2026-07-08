import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { APP_TAGLINE, APP_VERSION } from "@/lib/constants";

type DashboardLayoutProps = {
  children: ReactNode;
};

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-6 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.2em] text-white/30 uppercase">
            Version {APP_VERSION}
          </p>
          <p className="mt-2 text-sm font-medium text-white/70">ORION Platform</p>
        </div>
        <p className="max-w-xs text-right text-sm leading-relaxed font-light text-white/40">
          One AI.
          <br />
          One Workspace.
          <br />
          Complete Business Control.
        </p>
      </div>
      <p className="sr-only">{APP_TAGLINE}</p>
    </footer>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen bg-orion-navy font-sans text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(212,175,55,0.06),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(255,255,255,0.02),transparent_60%)]"
      />

      <Sidebar />

      <div className="relative flex min-h-screen flex-col pl-64">
        <Header />
        <main className="flex-1 px-6 py-6 md:px-8 md:py-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
