"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Sparkles,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { PasswordField, CTAButton } from "@/components/auth";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { apiClient } from "@/lib/api";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";
import { validateIndianPhone, formatIndianPhoneInput } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [isFirstLoginUser, setIsFirstLoginUser] = React.useState(false);
  const [isPlatformAdminUser, setIsPlatformAdminUser] = React.useState(false);
  const [welcomeName, setWelcomeName] = React.useState("");
  const [error, setError] = React.useState("");

  // Validation touch state
  const [phoneTouched, setPhoneTouched] = React.useState(false);

  const phoneValidation = React.useMemo(() => validateIndianPhone(phone), [phone]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expired") === "true") {
        setError("Your session has expired. Please sign in again to continue.");
        addToast("warning", "Session Expired", "Your session has expired. Please sign in again.");
      }
    }
  }, [addToast]);

  const handleFillDemo = () => {
    setPhone("+91 98765 43210");
    setPassword("DineFlow@2026");
    setError("");
    setPhoneTouched(false);
    setIsPlatformAdminUser(false);
  };

  const handleFillSuperAdmin = () => {
    setPhone("+91 98888 88888");
    setPassword("SuperAdmin@2026");
    setError("");
    setPhoneTouched(false);
    setIsPlatformAdminUser(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setPhoneTouched(true);

    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || "Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.post("/auth/login", {
        phone: phoneValidation.normalized,
        password,
      });

      if (res.data?.success) {
        const { user, tenant, accessToken, isFirstLogin } = res.data.data;
        const storageKey = user?.id ? `dineflow_has_logged_in_${user.id}` : "dineflow_has_logged_in";
        const hasLoggedInBefore = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
        const isFirst = isFirstLogin === true || user?.isFirstLogin === true || !hasLoggedInBefore;
        const isPlatform =
          user?.role === "super_admin" ||
          user?.role === "platform_admin" ||
          phoneValidation.normalized === "+919888888888" ||
          user?.email === "superadmin@dineflow.io";
        setIsPlatformAdminUser(isPlatform);
        setIsFirstLoginUser(isFirst);
        setAuth(user, tenant, accessToken, isFirst);
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
      <div className="relative rounded-[28px] sm:rounded-[32px] bg-white/85 dark:bg-[#0F172A]/70 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 p-4 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-slate-900 dark:text-[#F8FAFC] transition-colors duration-200">
        {/* Subtle glossy top reflection */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 dark:via-[#14F1C7]/30 to-transparent pointer-events-none rounded-t-[32px]" />

        {/* Card Header */}
        <div className="text-center pb-2.5 sm:pb-3">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign in to DineFlow
          </h2>
          <p className="mt-1 text-xs sm:text-[13px] font-body text-slate-600 dark:text-[#94A3B8] max-w-sm mx-auto leading-normal">
            Enter your credentials to access your restaurant workspace
          </p>
        </div>

        {/* Quick Demo Pill */}
        <div className="mb-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-[#14F1C7] font-medium">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span>Quick test credentials</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleFillDemo}
              className="font-semibold text-emerald-600 dark:text-[#14F1C7] hover:underline cursor-pointer transition-colors"
            >
              Demo Client
            </button>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <button
              type="button"
              onClick={handleFillSuperAdmin}
              className="font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer transition-colors"
            >
              Super Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Mobile Number with Real-time Formatting & Validation */}
          <div className="w-full space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block select-none">
              Mobile Number
            </label>
            <div
              className={`group relative flex items-center rounded-2xl border transition-all duration-200 bg-slate-100/90 dark:bg-[#0F172A]/70 backdrop-blur-md ${
                phoneTouched && !phoneValidation.isValid
                  ? "border-rose-500/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
                  : phoneValidation.isValid
                  ? "border-emerald-500/60 dark:border-emerald-500/60 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
                  : "border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-emerald-500 dark:focus-within:border-[#14F1C7] focus-within:ring-2 focus-within:ring-emerald-500/20 dark:focus-within:ring-[#14F1C7]/40"
              }`}
            >
              <div className="flex items-center gap-1 pl-3.5 pr-2.5 py-2 border-r border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium text-[13.5px] select-none shrink-0">
                <Phone className="h-4 w-4 text-slate-400 mr-1" />
                <span>+91</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </div>
              <input
                type="tel"
                placeholder="98765 43210"
                value={
                  phone.startsWith("+91")
                    ? formatIndianPhoneInput(phone).replace(/^\+91\s*/, "")
                    : formatIndianPhoneInput(phone)
                }
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                  setPhone("+91" + digits);
                  setPhoneTouched(true);
                  if (error) setError("");
                }}
                onBlur={() => setPhoneTouched(true)}
                required
                maxLength={11}
                aria-invalid={phoneTouched && !phoneValidation.isValid}
                aria-describedby={phoneTouched && !phoneValidation.isValid ? "login-phone-error" : undefined}
                className="w-full bg-transparent text-base sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none px-3 py-2"
              />

              {phoneValidation.isValid && (
                <div className="pr-3 flex items-center text-emerald-500 dark:text-[#14F1C7] pointer-events-none shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>

            {phoneTouched && !phoneValidation.isValid && (
              <p id="login-phone-error" role="alert" className="text-xs text-rose-500 pl-1 font-medium">
                {phoneValidation.error}
              </p>
            )}
          </div>

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
            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-emerald-500/30"
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
            <p role="alert" className="text-xs text-rose-500 font-medium pl-1">
              {error}
            </p>
          )}

          <div className="pt-1">
            <CTAButton isLoading={isLoading}>
              Sign In to Workspace
            </CTAButton>
          </div>
        </form>

        <div className="mt-3 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
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
        <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 xs:grid-cols-3 gap-2 text-center select-none">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">Secure & Encrypted</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <Headphones className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">24/7 Support</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">No Setup Fees</span>
          </div>
        </div>
      </div>
    </>
  );
}
