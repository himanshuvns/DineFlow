"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.post("/auth/forgot-password", { email });
    } catch {
      // In all cases, show confirmation to avoid account enumeration
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
      addToast("info", "Reset Instructions Sent", "If an account exists, you will receive a reset link shortly.");
    }
  };

  return (
    <Card variant="glass" className="border-slate-200 dark:border-slate-700/60 shadow-2xl relative">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <KeyRound className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset your password
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
          {isSubmitted
            ? "Check your inbox for a link to reset your password. You can close this tab or return to sign in."
            : "Enter your registered email address and we'll send you instructions to reset your password."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              placeholder="chef@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="glow"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Send Password Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center py-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Try another email
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-200 dark:border-slate-800/80 pt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
