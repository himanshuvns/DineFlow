"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast("error", "Password Mismatch", "Passwords do not match. Please verify.");
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
          Your new password must be at least 8 characters long.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            leftIcon={<Lock className="h-4 w-4" />}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            leftIcon={<Lock className="h-4 w-4" />}
          />

          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
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
