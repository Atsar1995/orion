import { ExecutiveLayout } from "@/components/globals";

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ExecutiveLayout>{children}</ExecutiveLayout>;
}
