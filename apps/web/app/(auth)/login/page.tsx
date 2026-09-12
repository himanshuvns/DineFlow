"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { apiClient } from "@/lib/api";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [welcomeName, setWelcomeName] = React.useState("");
  const [error, setError] = React.useState("");

  const handleFillDemo = () => {
    setPhone("+91 98765 43210");
    setPassword("Password123!");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await apiClient.post("/auth/login", { phone, password });
      if (res.data?.success) {
        const { user, tenant, accessToken } = res.data.data;
        setAuth(user, tenant, accessToken);
        const name = user.name || user.firstName || "Chef";
        setWelcomeName(name);
        setIsRedirecting(true);
        addToast("success", "Welcome back!", `Signed in to ${tenant?.name || "your restaurant"}`);
        // Display hospitality cloche loading animation before routing to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 2400);
        return;
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Invalid mobile number or password. Please try again.";
      setError(msg);
      addToast("error", "Sign in failed", msg);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isRedirecting && (
        <HospitalityLoader
          fullscreen
          variant="cloche"
          title={`Welcome back, ${welcomeName || "Chef"}!`}
          messages={[
            "Verifying reservations & floor logins…",
            "Polishing cutlery & tasting menus…",
            "Warming up live kitchen displays…",
            "Welcome to your dining room!",
          ]}
          subtitle="Connecting live POS, kitchen displays and table QR stands"
        />
      )}
      <Card variant="glass" className="border-slate-200 dark:border-slate-700/60 shadow-2xl relative">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign in to DineFlow
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Enter your credentials to access your restaurant workspace
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Quick Demo Pill */}
        <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Quick test account available</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline cursor-pointer"
          >
            Auto-fill demo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            leftIcon={<Phone className="h-4 w-4" />}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-emerald-500/30"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}

          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Sign In to Workspace
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-200 dark:border-slate-800/80 pt-6">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Don&apos;t have a workspace?{" "}
          <Link
            href="/register"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
          >
            Register your business
          </Link>
        </p>
      </CardFooter>
    </Card>
    </>
  );
}
