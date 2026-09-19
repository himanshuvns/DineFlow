"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { PasswordStrengthMeter, CTAButton } from "@/components/auth";
import { validatePassword, validateConfirmPassword } from "@/lib/validation";
import { apiClient } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { addToast } = useToast();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [passwordTouched, setPasswordTouched] = React.useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const passwordValidation = React.useMemo(() => validatePassword(password), [password]);
  const confirmPasswordValidation = React.useMemo(
    () => validateConfirmPassword(password, confirmPassword),
    [password, confirmPassword]
  );

  const isFormValid = passwordValidation.isValid && confirmPasswordValidation.isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);
    setError("");

    if (!token) {
      setError("Reset token is missing. Please request a new password reset verification code.");
      return;
    }

    if (!isFormValid) {
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error || "Please satisfy all password complexity criteria.");
      } else if (!confirmPasswordValidation.isValid) {
        setError("Passwords do not match. Please verify.");
      }
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", {
        token,
        newPassword: password,
        confirmPassword,
      });

      addToast("success", "Password Updated!", "Your new password is set. Please sign in.");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "This password reset link is invalid or has expired.";
      setError(msg);
      addToast("error", "Reset Failed", msg);
      setIsLoading(false);
    }
  };

  // If no token is provided in the URL
  if (!token) {
    return (
      <Card variant="glass" className="border-slate-200 dark:border-slate-700/60 shadow-2xl relative">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Missing Reset Token
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
            No valid password reset token was detected in the URL. Please verify your mobile number or request a new reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <Link href="/forgot-password" className="block w-full">
            <CTAButton>
              Request Password Reset
            </CTAButton>
          </Link>
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

  return (
    <Card variant="glass" className="border-slate-200 dark:border-slate-700/60 shadow-2xl relative">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create new password
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
          Your new password must satisfy all enterprise security requirements.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordTouched(true);
                if (error) setError("");
              }}
              required
              isSuccess={passwordValidation.isValid}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {/* Real-time Password Strength Meter */}
            <PasswordStrengthMeter
              validation={passwordValidation}
              hasTyped={password.length > 0}
            />
          </div>

          <div>
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordTouched(true);
                if (error) setError("");
              }}
              required
              isSuccess={confirmPasswordValidation.status === "match"}
              error={
                confirmPasswordTouched &&
                confirmPassword.length > 0 &&
                confirmPasswordValidation.status === "mismatch"
                  ? "Passwords do not match"
                  : undefined
              }
              helperText={
                confirmPasswordTouched && confirmPasswordValidation.status === "match"
                  ? "✅ Passwords match"
                  : !confirmPasswordTouched || confirmPassword.length === 0
                  ? "Re-enter your password to confirm."
                  : undefined
              }
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-rose-500 font-medium pl-1">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            disabled={!isFormValid || isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Update Password & Sign In
          </Button>
        </form>
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

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading…</div>}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}
