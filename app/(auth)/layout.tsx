import type { ReactNode } from "react";
import { OrionLogo } from "@/components/common/OrionLogo";
import { APP_TAGLINE } from "@/lib/constants";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
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

      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6">
        <header className="mb-8 flex max-w-md flex-col items-center text-center">
          <OrionLogo size="md" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            ORION
          </h1>
          <p className="mt-1 text-sm font-light text-white/45">
            AI Business Operating System
          </p>
          <p className="mt-4 text-sm leading-relaxed font-light text-white/50">
            Welcome back. Sign in to access your intelligent business workspace.
          </p>
          <p className="sr-only">{APP_TAGLINE}</p>
        </header>

        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
