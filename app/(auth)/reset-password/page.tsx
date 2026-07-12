"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
  }

  return (
    <Card title="Reset password">
      <div className="space-y-6">
        <SectionHeader
          as="div"
          title="Create a new password"
          subtitle="Choose a strong password to secure your ORION account."
        />

        {isSubmitted ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-orion-md border border-orion-success/20 bg-orion-success/5 px-4 py-3"
          >
            <p className="text-sm font-medium text-orion-success">
              Password updated successfully
            </p>
            <p className="mt-1 text-sm font-light text-white/60">
              Your password has been reset. You can now sign in with your new
              credentials.
            </p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-white/70"
              >
                New password
              </label>
              <div className="relative">
                <Input
                  id="new-password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((current) => !current)}
                  className={cn(
                    "absolute top-1/2 right-3 -translate-y-1/2 rounded-orion-sm px-2 py-1 text-xs font-medium text-white/45 transition-colors duration-[var(--orion-duration-normal)] hover:text-orion-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold/50",
                  )}
                  aria-label={
                    showNewPassword ? "Hide new password" : "Show new password"
                  }
                  aria-pressed={showNewPassword}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-white/70"
              >
                Confirm password
              </label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  className={cn(
                    "absolute top-1/2 right-3 -translate-y-1/2 rounded-orion-sm px-2 py-1 text-xs font-medium text-white/45 transition-colors duration-[var(--orion-duration-normal)] hover:text-orion-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold/50",
                  )}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full justify-center">
              Reset password
            </Button>
          </form>
        )}

        <Divider />

        <p className="text-center text-sm font-light text-white/40">
          Passwords must be kept confidential and never shared.
        </p>
      </div>
    </Card>
  );
}
