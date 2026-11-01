"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  ShieldCheck,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { FormInput, PasswordField, CTAButton } from "@/components/auth";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { apiClient } from "@/lib/api";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";
import { validateEmail } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [isFirstLoginUser, setIsFirstLoginUser] = React.useState(false);
  const [isPlatformAdminUser, setIsPlatformAdminUser] = React.useState(false);
  const [welcomeName, setWelcomeName] = React.useState("");
  const [error, setError] = React.useState("");

  // Validation touch state
  const [emailTouched, setEmailTouched] = React.useState(false);

  const emailValidation = React.useMemo(() => validateEmail(email), [email]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expired") === "true") {
        setError("Your session has expired. Please sign in again to continue.");
        addToast("warning", "Session Expired", "Your session has expired. Please sign in again.");
      }
    }
  }, [addToast]);

  const handleFillSuperAdmin = () => {
    setEmail("superadmin@dineflow.io");
    setPassword("SuperAdmin@2026");
    setError("");
    setEmailTouched(false);
    setIsPlatformAdminUser(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setEmailTouched(true);

    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Please enter a valid work email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.post("/auth/login", {
        email: emailValidation.normalized,
        password,
      });

      if (res.data?.success) {
        const { user, tenant, accessToken, refreshToken, isFirstLogin } = res.data.data;
        const storageKey = user?.id ? `dineflow_has_logged_in_${user.id}` : "dineflow_has_logged_in";
        const hasLoggedInBefore = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
        const isFirst = isFirstLogin === true || user?.isFirstLogin === true || !hasLoggedInBefore;
        const isPlatform =
          user?.role === "super_admin" ||
          user?.role === "platform_admin" ||
          emailValidation.normalized === "superadmin@dineflow.io" ||
          user?.email === "superadmin@dineflow.io";
        setIsPlatformAdminUser(isPlatform);
        setIsFirstLoginUser(isFirst);
        setAuth(user, tenant, accessToken, refreshToken, isFirst);
        const name = user.name || user.firstName || (isPlatform ? "Platform Super Admin" : "Chef");
        setWelcomeName(name);
        setIsRedirecting(true);
        addToast(
          "success",
          isFirst ? `Welcome, ${name}!` : `Welcome back, ${name}!`,
          isPlatform ? "Accessing Platform Control Plane" : `Signed in to ${tenant?.name || "your restaurant"}`
        );
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const fromParam = params?.get("from");
        // Platform admins must ALWAYS go to /platform/dashboard — ignore ?from= if it points to a client route
        const platformDest = fromParam && fromParam.startsWith("/platform") ? fromParam : "/platform/dashboard";
        const destination = isPlatform
          ? platformDest
          : (fromParam && !fromParam.startsWith("/platform") ? fromParam : "/dashboard");
        setTimeout(() => {
          router.push(destination);
        }, 2200);
        return;
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Invalid email address or password. Please try again.";
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
          variant={isPlatformAdminUser ? "platform" : "cloche"}
          colorTheme={isPlatformAdminUser ? "rose" : "emerald"}
          title={
            isPlatformAdminUser
              ? `Welcome, ${welcomeName || "Platform Super Admin"}!`
              : isFirstLoginUser
              ? `Welcome, ${welcomeName || "Chef"}!`
              : `Welcome back, ${welcomeName || "Chef"}!`
          }
          messages={
            isPlatformAdminUser
              ? [
                  "Verifying cryptographic security token…",
                  "Initializing multi-tenant control plane…",
                  "Synchronizing cluster telemetry & health ledgers…",
                  "Access granted — entering Super Admin Console…",
                ]
              : [
                  "Verifying reservations & floor logins…",
                  "Polishing cutlery & tasting menus…",
                  "Warming up live kitchen displays…",
                  "Welcome to your dining room!",
                ]
          }
          subtitle={
            isPlatformAdminUser
              ? "Connecting multi-tenant control plane & infrastructure monitors"
              : "Connecting live POS, kitchen displays and table QR stands"
          }
        />
      )}

      {/* ======================================================== */}
      {/* FLOATING LOGIN CARD                                      */}
      {/* ======================================================== */}
      <div className="w-full max-w-xl mx-auto relative rounded-[28px] sm:rounded-[36px] bg-white/95 dark:bg-[#0F172A]/85 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 lg:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.65)] text-slate-900 dark:text-[#F8FAFC] transition-colors duration-200">
        {/* Subtle glossy top reflection */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 dark:via-[#14F1C7]/30 to-transparent pointer-events-none rounded-t-[36px]" />

        {/* Card Header */}
        <div className="text-center pb-4 sm:pb-5">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign in to DineFlow
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm font-body text-slate-600 dark:text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
            Enter your work email and password to access your restaurant workspace
          </p>
        </div>

        {/* Super Admin Test Credentials Pill (Only Super Admin) */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="font-medium">Platform Super Admin</span>
          </div>
          <button
            type="button"
            onClick={handleFillSuperAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-[#14F1C7] text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <span>Auto-fill Super Admin</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Work Email Address with Real-time Validation */}
          <FormInput
            label="Work Email Address"
            type="email"
            placeholder="owner@restaurant.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailTouched(true);
              if (error) setError("");
            }}
            onBlur={() => setEmailTouched(true)}
            required
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={emailTouched && !emailValidation.isValid ? emailValidation.error : undefined}
            isSuccess={emailTouched && emailValidation.isValid}
          />

          {/* Password */}
          <PasswordField
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            required
            helperText=""
          />

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-emerald-500/30"
              />
              <span>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-emerald-600 dark:text-[#14F1C7] hover:underline transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <div className="pt-2">
            <CTAButton isLoading={isLoading}>
              Sign In to Workspace
            </CTAButton>
          </div>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have a workspace?{" "}
            <Link
              href="/register"
              className="text-emerald-600 dark:text-[#14F1C7] hover:text-emerald-700 dark:hover:text-[#00E5B8] font-semibold transition-colors hover:underline"
            >
              Register your business
            </Link>
          </p>
        </div>

        {/* Bottom Trust Section */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 xs:grid-cols-3 gap-2.5 text-center select-none">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">Secure & Encrypted</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <Headphones className="h-4 w-4 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">24/7 Support</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">No Setup Fees</span>
          </div>
        </div>
      </div>
    </>
  );
}
