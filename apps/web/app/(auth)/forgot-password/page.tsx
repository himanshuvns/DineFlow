"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { CTAButton, PasswordStrengthMeter } from "@/components/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import {
  validateIndianPhone,
  formatIndianPhoneInput,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation";

type Step = "phone" | "otp" | "new_password" | "email";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const initialPhone = searchParams.get("phone") || "+91";
  const initialMode = searchParams.get("mode") === "email" ? "email" : "phone";

  const [step, setStep] = React.useState<Step>(initialMode);
  const [phone, setPhone] = React.useState(initialPhone);
  const [phoneTouched, setPhoneTouched] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [emailSubmitted, setEmailSubmitted] = React.useState(false);

  // OTP state
  const [otp, setOtp] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = React.useState<string>("");
  const [timer, setTimer] = React.useState(120);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Password reset state
  const [resetToken, setResetToken] = React.useState<string>("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordTouched, setPasswordTouched] = React.useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = React.useState(false);

  // Common state
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Validations
  const phoneValidation = React.useMemo(() => validateIndianPhone(phone), [phone]);
  const passwordValidation = React.useMemo(() => validatePassword(password), [password]);
  const confirmPasswordValidation = React.useMemo(
    () => validateConfirmPassword(password, confirmPassword),
    [password, confirmPassword]
  );

  // Timer countdown for OTP
  React.useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // OTP box input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setError("");
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Step 1: Request OTP for phone
  const handleRequestPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    setError("");

    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || "Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post("/auth/forgot-password", {
        phone: phoneValidation.normalized,
      });

      const returnedDevOtp = res.data?.data?.devOtp;
      if (returnedDevOtp) {
        setDevOtp(returnedDevOtp);
        setOtp(returnedDevOtp.split(""));
      }

      setStep("otp");
      setTimer(120);
      addToast(
        "success",
        "Verification Code Sent",
        `We've sent a 6-digit code to ${phoneValidation.formatted}.`
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Could not send verification code. Please check your mobile number.";
      setError(msg);
      addToast("error", "Request Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0) return;
    setError("");
    try {
      const res = await apiClient.post("/auth/resend-otp", {
        phone: phoneValidation.normalized,
      });
      const newDevOtp = res.data?.data?.devOtp;
      if (newDevOtp) {
        setDevOtp(newDevOtp);
        setOtp(newDevOtp.split(""));
        addToast("info", "New OTP Generated", `Your verification code is: ${newDevOtp}`);
      } else {
        addToast("info", "Code Dispatched", "A fresh 6-digit code was sent to your mobile.");
      }
      setTimer(120);
    } catch {
      // Fallback dev mock
      setDevOtp("123456");
      setOtp(["1", "2", "3", "4", "5", "6"]);
      addToast("info", "Test OTP Active", "You can use code 123456 in dev mode.");
      setTimer(120);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    setError("");

    if (code.length < 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post("/auth/verify-reset-otp", {
        phone: phoneValidation.normalized,
        otp: code,
      });

      const token = res.data?.data?.resetToken;
      if (!token) {
        throw new Error("Missing reset token from verification response.");
      }

      setResetToken(token);
      setStep("new_password");
      addToast("success", "Mobile Verified", "Please enter your new password.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired verification code. Please try again.";
      setError(msg);
      addToast("error", "Verification Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);
    setError("");

    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || "Please meet all password requirements.");
      return;
    }

    if (!confirmPasswordValidation.isValid) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", {
        token: resetToken,
        phone: phoneValidation.normalized,
        newPassword: password,
        confirmPassword,
      });

      addToast("success", "Password Reset Successful", "Please sign in with your new password.");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. The link or code may have expired.";
      setError(msg);
      addToast("error", "Reset Failed", msg);
      setIsLoading(false);
    }
  };

  // Email fallback submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/forgot-password", { email });
    } catch {
      // Suppress error to avoid account enumeration
    } finally {
      setIsLoading(false);
      setEmailSubmitted(true);
      addToast("info", "Reset Link Sent", "If an account matches, an email has been sent.");
    }
  };

  return (
    <div className="relative rounded-[28px] sm:rounded-[32px] bg-white/85 dark:bg-[#0F172A]/70 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 p-5 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-slate-900 dark:text-[#F8FAFC] transition-colors duration-200">
      {/* Subtle glossy top highlight */}
      <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 dark:via-[#14F1C7]/30 to-transparent pointer-events-none rounded-t-[32px]" />

      {/* Header with Icon */}
      <div className="text-center pb-4">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-[#14F1C7]">
          {step === "new_password" ? (
            <ShieldCheck className="h-6 w-6" />
          ) : (
            <KeyRound className="h-6 w-6" />
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
          {step === "phone" && "Reset Password"}
          {step === "otp" && "Verify Mobile"}
          {step === "new_password" && "Set New Password"}
          {step === "email" && "Reset via Email"}
        </h2>

        <p className="mt-1 text-xs sm:text-[13px] font-body text-slate-600 dark:text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
          {step === "phone" && "Enter your registered mobile number to receive a 6-digit verification code."}
          {step === "otp" && (
            <>
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {phoneValidation.formatted || phone}
              </span>
            </>
          )}
          {step === "new_password" && "Create a secure new password for your DineFlow account."}
          {step === "email" && (
            emailSubmitted
              ? "Check your inbox for a link to reset your password."
              : "Enter your registered email address to receive password reset instructions."
          )}
        </p>

        {/* Step Progress Indicators (when in mobile flow) */}
        {step !== "email" && (
          <div className="flex items-center justify-center gap-2 mt-3.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === "phone"
                  ? "w-8 bg-emerald-500 dark:bg-[#14F1C7]"
                  : "w-4 bg-emerald-500/40 dark:bg-[#14F1C7]/40"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === "otp"
                  ? "w-8 bg-emerald-500 dark:bg-[#14F1C7]"
                  : step === "new_password"
                  ? "w-4 bg-emerald-500/40 dark:bg-[#14F1C7]/40"
                  : "w-4 bg-slate-300 dark:bg-slate-700"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === "new_password"
                  ? "w-8 bg-emerald-500 dark:bg-[#14F1C7]"
                  : "w-4 bg-slate-300 dark:bg-slate-700"
              }`}
            />
          </div>
        )}
      </div>

      {/* STEP 1: MOBILE NUMBER */}
      {step === "phone" && (
        <form onSubmit={handleRequestPhoneOtp} className="space-y-4">
          <div className="w-full space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block select-none">
              Registered Mobile Number
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
                className="w-full bg-transparent text-base sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none px-3 py-2.5"
              />

              {phoneValidation.isValid && (
                <div className="pr-3 flex items-center text-emerald-500 dark:text-[#14F1C7] pointer-events-none shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>

            {phoneTouched && !phoneValidation.isValid && (
              <p role="alert" className="text-xs text-rose-500 pl-1 font-medium">
                {phoneValidation.error}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs text-rose-500 font-medium pl-1">
              {error}
            </p>
          )}

          <div className="pt-1">
            <CTAButton isLoading={isLoading}>
              Send Verification Code
            </CTAButton>
          </div>

          {/* Quick Demo Fill Helper */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => {
                setPhone("+91 98765 43210");
                setPhoneTouched(true);
                setError("");
              }}
              className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-[#14F1C7] transition-colors"
            >
              <Sparkles className="h-3 w-3 text-emerald-500" /> Use demo number (+91 98765 43210)
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError("");
              }}
              className="hover:underline hover:text-slate-800 dark:hover:text-slate-200"
            >
              Reset via Email
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: OTP VERIFICATION */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
            <span>Enter the 6-digit OTP code</span>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
              className="text-emerald-600 dark:text-[#14F1C7] font-semibold hover:underline"
            >
              Change number
            </button>
          </div>

          {/* 6 Digit Inputs */}
          <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-[#14F1C7] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-[#14F1C7]/20 outline-none transition-all"
              />
            ))}
          </div>

          {/* Dev OTP Auto-Fill Pill */}
          {devOtp && (
            <button
              type="button"
              onClick={() => setOtp(devOtp.split(""))}
              className="w-full p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-[#14F1C7] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-500/15 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Dev Code: <strong>{devOtp}</strong> (Click to auto-fill)</span>
            </button>
          )}

          {error && (
            <p role="alert" className="text-xs text-rose-500 font-medium pl-1">
              {error}
            </p>
          )}

          {/* Timer & Resend */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            {timer > 0 ? (
              <span>Resend code in {formatTimer(timer)}</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="inline-flex items-center gap-1 text-emerald-600 dark:text-[#14F1C7] font-semibold hover:underline"
              >
                <RefreshCw className="h-3 w-3" /> Resend Code
              </button>
            )}
          </div>

          <div className="pt-1">
            <CTAButton isLoading={isLoading}>
              Verify & Proceed
            </CTAButton>
          </div>
        </form>
      )}

      {/* STEP 3: NEW PASSWORD */}
      {step === "new_password" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
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

          <div className="pt-1">
            <CTAButton
              isLoading={isLoading}
              disabled={!passwordValidation.isValid || !confirmPasswordValidation.isValid || isLoading}
            >
              Update Password & Sign In
            </CTAButton>
          </div>
        </form>
      )}

      {/* FALLBACK: EMAIL RESET */}
      {step === "email" && (
        <div className="space-y-4">
          {!emailSubmitted ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                label="Account Email"
                type="email"
                placeholder="chef@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <div className="pt-1">
                <CTAButton isLoading={isLoading}>
                  Send Password Reset Link
                </CTAButton>
              </div>
            </form>
          ) : (
            <div className="text-center py-2 space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                Instructions have been dispatched to your email address if it is registered in DineFlow.
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setEmailSubmitted(false)}
              >
                Try another email
              </Button>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
              className="text-xs text-emerald-600 dark:text-[#14F1C7] font-semibold hover:underline"
            >
              ← Use mobile number verification instead
            </button>
          </div>
        </div>
      )}

      {/* Card Footer: Back to Sign In */}
      <div className="mt-5 pt-4 border-t border-slate-200/90 dark:border-slate-800/80 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading…</div>}>
      <ForgotPasswordContent />
    </React.Suspense>
  );
}
