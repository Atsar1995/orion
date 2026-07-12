"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
  }

  return (
    <Card title="Forgot password">
      <div className="space-y-6">
        <SectionHeader
          as="div"
          title="Reset your password"
          subtitle="Enter the email associated with your account and we will send recovery instructions."
        />

        {isSubmitted ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-orion-md border border-orion-success/20 bg-orion-success/5 px-4 py-3"
          >
            <p className="text-sm font-medium text-orion-success">
              Recovery instructions sent
            </p>
            <p className="mt-1 text-sm font-light text-white/60">
              If an account exists for that email, you will receive password
              recovery instructions shortly.
            </p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium text-white/70"
              >
                Email
              </label>
              <Input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
              />
            </div>

            <Button type="submit" className="w-full justify-center">
              Send recovery instructions
            </Button>
          </form>
        )}

        <Divider />

        <p className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-orion-gold transition-colors duration-[var(--orion-duration-normal)] hover:text-orion-gold-light focus-visible:rounded-orion-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold/50"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </Card>
  );
}
