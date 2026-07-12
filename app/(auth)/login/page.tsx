"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showValidationPlaceholder, setShowValidationPlaceholder] =
    useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidationPlaceholder(true);
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }

  return (
    <Card title="Sign in">
      <form
        className="space-y-5"
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="login-heading"
      >
        <p id="login-heading" className="sr-only">
          Sign in to ORION
        </p>

        {isLoading ? (
          <LoadingState label="Signing in..." />
        ) : (
          <>
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-white/70"
              >
                Email
              </label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                aria-describedby={
                  showValidationPlaceholder ? "login-email-error" : undefined
                }
              />
              {showValidationPlaceholder ? (
                <p
                  id="login-email-error"
                  role="alert"
                  className="text-sm font-light text-orion-danger"
                >
                  Please enter a valid email address.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-white/70"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  className="pr-12"
                  aria-describedby={
                    showValidationPlaceholder ? "login-password-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className={cn(
                    "absolute top-1/2 right-3 -translate-y-1/2 rounded-orion-sm px-2 py-1 text-xs font-medium text-white/45 transition-colors duration-[var(--orion-duration-normal)] hover:text-orion-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold/50",
                  )}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {showValidationPlaceholder ? (
                <p
                  id="login-password-error"
                  role="alert"
                  className="text-sm font-light text-orion-danger"
                >
                  Password is required.
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/[0.04] text-orion-gold focus:ring-orion-gold/30 focus:ring-offset-0"
                />
                <span className="text-sm font-light text-white/60">
                  Remember me
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-medium text-orion-gold transition-colors duration-[var(--orion-duration-normal)] hover:text-orion-gold-light focus-visible:rounded-orion-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold/50"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full justify-center">
              Sign in
            </Button>
          </>
        )}

        <Divider />

        <p className="text-center text-sm font-light text-white/40">
          One AI. One Workspace. Complete Business Control.
        </p>
      </form>
    </Card>
  );
}
