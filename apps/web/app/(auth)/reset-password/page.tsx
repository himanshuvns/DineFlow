"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { PasswordStrengthMeter } from "@/components/auth";
import { validatePassword, validateConfirmPassword } from "@/lib/validation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [passwordTouched, setPasswordTouched] = React.useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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

    if (!isFormValid) {
      if (!passwordValidation.isValid) {
        addToast("error", "Weak Password", passwordValidation.error || "Please satisfy all password complexity criteria.");
      } else if (!confirmPasswordValidation.isValid) {
        addToast("error", "Password Mismatch", "Passwords do not match. Please verify.");
      }
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast("success", "Password Updated!", "Your new password is set. Please sign in.");
      router.push("/login");
    }, 1000);
  };

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
              }}
              onFocus={() => window.dispatchEvent(new Event("password-field-focus"))}
              onBlur={() => {
                setPasswordTouched(true);
                window.dispatchEvent(new Event("password-field-blur"));
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
              }}
              onFocus={() => window.dispatchEvent(new Event("password-field-focus"))}
              onBlur={() => {
                setConfirmPasswordTouched(true);
                window.dispatchEvent(new Event("password-field-blur"));
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
