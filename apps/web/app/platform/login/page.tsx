"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Terminal,
  Activity,
  Cpu,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isPlatformRole, getRoleLabel } from "@/lib/rbac/roles";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";
import { validateEmail } from "@/lib/validation";

export default function PlatformLoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [welcomeName, setWelcomeName] = React.useState("");
  const [error, setError] = React.useState("");
  const [clientDetected, setClientDetected] = React.useState<{
    email: string;
    role: string;
  } | null>(null);

  // Validation
  const [emailTouched, setEmailTouched] = React.useState(false);
  const emailValidation = React.useMemo(() => validateEmail(email), [email]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expired") === "true") {
        setError("Your elevated platform session has expired. Please sign in again.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setClientDetected(null);
    setEmailTouched(true);

    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Please enter a valid operator email address");
      return;
    }

    if (!password) {
      setError("Please enter your elevated security password");
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

        // Strict Mutual Exclusion Check: Verify the account has an elevated platform role
        const hasElevatedAccess = isPlatformRole(user?.role);

        if (!hasElevatedAccess) {
          // Immediately purge any tokens issued
          clearAuth();
          setIsLoading(false);
          setClientDetected({
            email: user?.email || emailValidation.normalized,
            role: user?.role || "tenant_user",
          });
          setError(
            "Access Denied: This portal is strictly restricted to platform operators. Your account belongs to a client workspace."
          );
          addToast(
            "error",
            "Platform Access Restricted",
            "This account is not authorized for the Platform Control Plane."
          );
          return;
        }

        // Legitimate Platform Operator
        setAuth(user, tenant, accessToken, refreshToken, isFirstLogin);
        const name = user.name || user.firstName || "Platform Operator";
        setWelcomeName(name);
        setIsRedirecting(true);

        addToast(
          "success",
          `Welcome, ${name}`,
          "Authenticated to DineFlow Platform Control Plane"
        );

        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const fromParam = params?.get("from");
        const destination =
          fromParam && fromParam.startsWith("/platform") && fromParam !== "/platform/login"
            ? fromParam
            : "/platform/dashboard";

        setTimeout(() => {
          router.push(destination);
        }, 1800);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Invalid administrator credentials. Access attempt has been recorded.";
      setError(msg);
      addToast("error", "Platform Authentication Failed", msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#070B14] text-slate-100 selection:bg-rose-500/30 selection:text-rose-200 relative overflow-hidden font-sans">
      {isRedirecting && (
        <HospitalityLoader
          fullscreen
          variant="platform"
          colorTheme="rose"
          title={`Welcome, ${welcomeName || "Platform Super Admin"}!`}
          messages={[
            "Cryptographic signature verified…",
            "Mounting multi-tenant control plane & telemetry ledgers…",
            "Synchronizing live client cluster metrics…",
            "Access granted — entering Platform Control Plane…",
          ]}
          subtitle="Connecting multi-tenant control plane & infrastructure monitors"
        />
      )}

      {/* Ambient background glows */}
      <div className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-slate-900/40 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-rose-950/40">
            DF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                DineFlow
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-400">
                Core Ops
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Multi-Tenant Cluster Control Plane
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Restaurant Workspace Login</span>
        </Link>
      </header>

      {/* Central Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Card Container */}
          <div className="relative rounded-3xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-[0_24px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-6 sm:p-8">
            {/* Top Gloss Highlight */}
            <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="text-center pb-6 border-b border-slate-800/80">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-mono font-semibold tracking-wider uppercase mb-3">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Isolated Control Plane</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Platform Operator Sign-In
              </h1>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Strictly restricted to authorized platform administrators, system architects, and finance operators.
              </p>
            </div>

            {/* Client Account Detected Warning Modal / Banner */}
            {clientDetected && (
              <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Client Workspace Account Detected</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  The account <strong className="font-mono text-amber-100">{clientDetected.email}</strong> is registered as a <span className="font-semibold underline capitalize">{getRoleLabel(clientDetected.role)}</span> for a restaurant workspace, not a platform administrator.
                </p>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                >
                  <span>Sign In via Restaurant Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Error Message */}
            {error && !clientDetected && (
              <div className="mt-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 font-medium flex items-start gap-2 animate-in fade-in duration-200">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Operator Work Email</span>
                  <span className="text-[10px] font-mono text-slate-500">SECURE ID</span>
                </label>
                <div className="relative flex items-center rounded-2xl border border-slate-800 bg-slate-900/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                  <div className="pl-3.5 text-slate-400 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailTouched(true);
                      if (error) setError("");
                    }}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="operator@dineflow.io"
                    required
                    autoComplete="email"
                    className="w-full bg-transparent px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                  {emailTouched && emailValidation.isValid && (
                    <div className="pr-3 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
                {emailTouched && !emailValidation.isValid && (
                  <p className="text-[11px] text-rose-400 pl-1">{emailValidation.error}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Elevated Password</span>
                  <span className="text-[10px] font-mono text-slate-500">ENCRYPTED</span>
                </label>
                <div className="relative flex items-center rounded-2xl border border-slate-800 bg-slate-900/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                  <div className="pl-3.5 text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full bg-transparent px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-3 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500/30"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  TLS 1.3 / AES-256
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Platform Credentials…</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Platform Session</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Audit Log Guarantee */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500">
                <Terminal className="h-3 w-3 text-rose-500" />
                <span>Audit logged • Non-repudiation enforced</span>
              </div>
            </div>
          </div>

          {/* Footer Backlinks */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Are you a restaurant client? </span>
            <Link
              href="/login"
              className="text-slate-300 hover:text-white underline font-semibold transition-colors"
            >
              Access your dining room workspace →
            </Link>
          </div>
        </div>
      </main>

      {/* Global Telemetry Status Bar */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-900 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Cluster Online</span>
          </span>
          <span className="hidden sm:inline text-slate-800">•</span>
          <span className="hidden sm:flex items-center gap-1">
            <Cpu className="h-3 w-3 text-slate-600" />
            <span>Asia-South (Mumbai VPS)</span>
          </span>
        </div>
        <div>
          <span>DineFlow OS Platform v2.4 • Confidential & Proprietary</span>
        </div>
      </footer>
    </div>
  );
}
