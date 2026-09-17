"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { apiClient } from "@/lib/api";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone") || searchParams.get("email") || "";
  const devOtpParam = searchParams.get("devOtp") || "";
  const { addToast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [otp, setOtp] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [tenantName, setTenantName] = React.useState("");
  const [timer, setTimer] = React.useState(120); // 2 min countdown
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Auto-fill dev OTP if present in query parameters
  React.useEffect(() => {
    if (devOtpParam && devOtpParam.length === 6) {
      setOtp(devOtpParam.split(""));
    }
  }, [devOtpParam]);

  // Timer countdown
  React.useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last char
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      const res = await apiClient.post("/auth/resend-otp", {
        phone: phoneParam,
      });
      const newDevOtp = res.data?.data?.devOtp;
      if (newDevOtp) {
        addToast("info", "New OTP Generated", `Your verification code is: ${newDevOtp}`);
        setOtp(newDevOtp.split(""));
      } else {
        addToast("info", "New OTP Dispatched", "A fresh 6-digit code was sent to your mobile.");
      }
      setTimer(120);
    } catch (err: any) {
      addToast("info", "Test OTP Active", "You can enter code 123456 to verify in dev mode.");
      setTimer(120);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      addToast("error", "Incomplete Code", "Please enter all 6 digits of the OTP code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post("/auth/verify-otp", {
        phone: phoneParam,
        otp: code,
        code: code,
      });

      if (res.data?.success) {
        const { user, tenant, accessToken } = res.data.data;
        setAuth(user, tenant, accessToken, true);
        setTenantName(tenant?.name || "your restaurant");
        setIsRedirecting(true);
        addToast("success", "Mobile Verified!", `Welcome to ${tenant?.name || "your workspace"}!`);
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
        "Invalid or expired verification code. In local dev, you can use code 123456.";
      addToast("error", "Verification Failed", msg);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isRedirecting && (
        <HospitalityLoader
          fullscreen
          variant="cloche"
          title="Workspace Verified & Ready!"
          messages={[
            "Authentication token cryptographically confirmed…",
            "Unlocking floor plans & live kitchen displays…",
            "Syncing real-time table orders & inventory…",
            `Welcome aboard, ${tenantName || "your restaurant"}!`,
          ]}
          subtitle="Initializing multi-station POS, table stands and menus"
        />
      )}
      <Card variant="glass" className="border-slate-200 dark:border-slate-700/60 shadow-2xl relative">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Verify your mobile
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
          We sent a 6-digit verification code to <br />
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{phoneParam}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6 Digit Inputs */}
          <div className="flex justify-center gap-1.5 xs:gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="h-11 w-9 xs:w-10 sm:h-14 sm:w-12 rounded-xl text-center text-lg sm:text-xl font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all shadow-xs shrink-0"
              />
            ))}
          </div>

          {/* Quick Dev Code Indicator */}
          {devOtpParam ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-xs text-slate-700 dark:text-slate-300">Your verification code is: </span>
              <button
                type="button"
                onClick={() => setOtp(devOtpParam.split(""))}
                className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 hover:underline ml-1 cursor-pointer"
              >
                {devOtpParam} (Click to auto-fill)
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-1.5">
              <span className="text-xs text-slate-600 dark:text-slate-400">Testing or demo?</span>
              <button
                type="button"
                onClick={() => setOtp(["1", "2", "3", "4", "5", "6"])}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline cursor-pointer"
              >
                Auto-fill test code (123456)
              </button>
            </div>
          )}

          {/* Resend status */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
            <span>Didn&apos;t receive the code?</span>
            {timer > 0 ? (
              <span className="text-slate-600 dark:text-slate-400 font-mono">
                Resend in <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatTimer(timer)}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Resend Code
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Verify & Enter Workspace
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-200 dark:border-slate-800/80 pt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </CardFooter>
    </Card>
    </>
  );
}

export default function VerifyPage() {
  return (
    <React.Suspense fallback={<HospitalityLoader variant="cloche" />}>
      <VerifyContent />
    </React.Suspense>
  );
}
