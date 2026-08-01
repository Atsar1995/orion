import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { PlatformProviders } from "@/components/platform/PlatformProviders";
import { SkipToContent } from "@/components/platform/SkipToContent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ORION — Command Center",
  description:
    "ORION AI Business Operating System. One AI. One Workspace. Complete Business Control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SkipToContent />
        <SessionProvider>
          <PlatformProviders>
            <AuthGuard>{children}</AuthGuard>
          </PlatformProviders>
        </SessionProvider>
      </body>
    </html>
  );
}
