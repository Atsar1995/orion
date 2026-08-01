import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function UnauthorizedPage() {
  return (
    <Card title="Sign in required">
      <div className="space-y-4">
        <p className="text-sm font-light text-white/60">
          You need to sign in to access this part of ORION.
        </p>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-orion-md bg-orion-gold px-5 py-2.5 text-sm font-medium text-orion-navy transition-all duration-[var(--orion-duration-normal)] hover:bg-orion-gold-light"
        >
          Go to sign in
        </Link>
      </div>
    </Card>
  );
}
