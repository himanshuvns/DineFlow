"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  User,
  Phone,
  Mail,
  ChevronDown,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  Sparkles,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";
import {
  BusinessCategorySelector,
  FormInput,
  PasswordField,
  PasswordStrengthMeter,
  CTAButton,
} from "@/components/auth";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";
import { cn } from "@/lib/utils";
import {
  validateEmail,
  validateIndianPhone,
  formatIndianPhoneInput,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();

  // 2-Step Stepper State: 1 = Restaurant Profile, 2 = Owner Security
  const [step, setStep] = React.useState<1 | 2>(1);

  // Form Fields
  const [businessName, setBusinessName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [businessType, setBusinessType] = React.useState("restaurant");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Touch states
  const [businessNameTouched, setBusinessNameTouched] = React.useState(false);
  const [firstNameTouched, setFirstNameTouched] = React.useState(false);
  const [lastNameTouched, setLastNameTouched] = React.useState(false);
  const [emailTouched, setEmailTouched] = React.useState(false);
  const [phoneTouched, setPhoneTouched] = React.useState(false);
  const [passwordTouched, setPasswordTouched] = React.useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  // Auto-generate slug from business name
  React.useEffect(() => {
    const generated = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  }, [businessName]);

  // Real-time validations
  const emailValidation = React.useMemo(() => validateEmail(email), [email]);
  const isPhoneProvided = Boolean(phone.trim() && phone.trim() !== "+91");
  const phoneValidation = React.useMemo(() => {
    if (!isPhoneProvided) return { isValid: true, normalized: "", formatted: "" };
    return validateIndianPhone(phone);
  }, [phone, isPhoneProvided]);
  const passwordValidation = React.useMemo(() => validatePassword(password), [password]);
  const confirmPasswordValidation = React.useMemo(
    () => validateConfirmPassword(password, confirmPassword),
    [password, confirmPassword]
  );

  const isStep1Valid = businessName.trim().length >= 2 && (!isPhoneProvided || phoneValidation.isValid);
  const isStep2Valid =
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    emailValidation.isValid &&
    passwordValidation.isValid &&
    confirmPasswordValidation.isValid;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setBusinessNameTouched(true);
    setPhoneTouched(true);

    if (!isStep1Valid) {
      if (businessName.trim().length < 2) {
        addToast("warning", "Business Name Required", "Please enter a valid business name (at least 2 characters).");
      } else if (isPhoneProvided && !phoneValidation.isValid) {
        addToast("error", "Invalid Mobile Number", phoneValidation.error || "Please enter a valid 10-digit mobile number.");
      }
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);
    setFirstNameTouched(true);
    setLastNameTouched(true);

    if (!isStep2Valid) {
      if (!firstName.trim() || !lastName.trim()) {
        addToast("warning", "Name Required", "Please enter your first and last name.");
      } else if (!emailValidation.isValid) {
        addToast("error", "Invalid Email Address", emailValidation.error || "Please enter a valid work email address.");
      } else if (!passwordValidation.isValid) {
        addToast("error", "Weak Password", passwordValidation.error || "Please satisfy all password complexity criteria.");
      } else if (!confirmPasswordValidation.isValid) {
        addToast("error", "Password Mismatch", "Passwords do not match. Please verify.");
      }
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post("/auth/register", {
        businessName: businessName.trim(),
        slug,
        businessType,
        name: `${firstName} ${lastName}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailValidation.normalized,
        phone: isPhoneProvided ? phoneValidation.normalized : undefined,
        password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        country: "IN",
      });

      setIsRedirecting(true);
      addToast(
        "success",
        "Verification code sent!",
        `We've dispatched a 6-digit verification code to ${emailValidation.normalized}.`
      );
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(emailValidation.normalized)}`);
      }, 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please check your information.";
      addToast("error", "Registration Failed", msg);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isRedirecting && (
        <HospitalityLoader
          fullscreen
          variant="cloche"
          title={`Registering ${businessName || "Your Workspace"}…`}
          messages={[
            "Creating encrypted workspace & tenant database…",
            "Generating bespoke QR stands & dining zones…",
            "Setting up live kitchen display screen profiles…",
            "Preparing verification portal…",
          ]}
          subtitle="Configuring multi-station POS, table layout and inventory tracking"
        />
      )}

      {/* ======================================================== */}
      {/* LUXURY STEPPED REGISTRATION CARD                         */}
      {/* ======================================================== */}
      <div className="w-full max-w-2xl xl:max-w-3xl relative rounded-[28px] sm:rounded-[36px] bg-white/95 dark:bg-[#0F172A]/85 backdrop-blur-3xl border border-slate-200/90 dark:border-white/10 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.65)] text-slate-900 dark:text-[#F8FAFC] transition-colors duration-200">
        {/* Specular gloss top reflection */}
        <div className="absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 dark:via-[#14F1C7]/40 to-transparent pointer-events-none rounded-t-[36px]" />

        {/* ======================================================== */}
        {/* STEPPER PILL HEADER                                      */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/10 mb-4 select-none">
          {/* Step 1 Tab Button */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className={cn(
              "flex items-center gap-2 py-1 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer",
              step === 1
                ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-[#14F1C7] shadow-sm shadow-emerald-500/10"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span
              className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                step === 1
                  ? "bg-emerald-500 text-white shadow-sm"
                  : isStep1Valid
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-[#14F1C7]"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              {isStep1Valid && step === 2 ? "✓" : "1"}
            </span>
            <span>Restaurant Workspace</span>
          </button>

          {/* Stepper Progress Connector */}
          <div className="flex-1 mx-2 sm:mx-4 h-[1.5px] bg-gradient-to-r from-emerald-500/40 via-slate-200 dark:via-slate-800 to-transparent" />

          {/* Step 2 Tab Button */}
          <button
            type="button"
            onClick={() => {
              if (isStep1Valid) {
                setStep(2);
              } else {
                setBusinessNameTouched(true);
              }
            }}
            className={cn(
              "flex items-center gap-2 py-1 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer",
              step === 2
                ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-[#14F1C7] shadow-sm shadow-emerald-500/10"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <span
              className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                step === 2
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              2
            </span>
            <span>Owner Credentials</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: RESTAURANT WORKSPACE & CONCEPT                   */}
        {/* ======================================================== */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-[#14F1C7] text-[11px] font-semibold mb-1">
                <Sparkles className="h-3 w-3" />
                <span>14-Day Free Starter Trial • No Credit Card Required</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create your Restaurant Workspace
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Choose your hospitality concept and customize your live QR menu slug.
              </p>
            </div>

            {/* 1. Hospitality Vertical Selector */}
            <BusinessCategorySelector
              value={businessType}
              onChange={setBusinessType}
            />

            {/* 2. Business Name & Live QR Preview */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                  Business / Restaurant Name
                </label>
                {slug && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-700 dark:text-[#14F1C7] font-medium truncate max-w-[240px]">
                    <QrCode className="h-3 w-3 shrink-0" />
                    <span>dineflow.app/m/{slug}</span>
                  </span>
                )}
              </div>
              <FormInput
                placeholder="e.g. The Grand Bistro"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  setBusinessNameTouched(true);
                }}
                onBlur={() => setBusinessNameTouched(true)}
                error={
                  businessNameTouched && businessName.trim().length > 0 && businessName.trim().length < 2
                    ? "Business name must be at least 2 characters"
                    : undefined
                }
                isSuccess={businessName.trim().length >= 2}
                required
                leftIcon={<Store className="h-4 w-4" />}
              />
            </div>

            {/* 3. Mobile Number (Optional for WhatsApp) */}
            <div className="w-full space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                  Manager Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <span className="text-[10.5px] text-slate-500 dark:text-[#94A3B8]">
                  For WhatsApp order alerts
                </span>
              </div>
              <div
                className={cn(
                  "group relative flex items-center rounded-2xl border transition-all duration-200 bg-slate-100/90 dark:bg-[#0F172A]/70 backdrop-blur-md",
                  isPhoneProvided && phoneTouched && !phoneValidation.isValid
                    ? "border-rose-500/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
                    : isPhoneProvided && phoneValidation.isValid
                    ? "border-emerald-500/60 dark:border-emerald-500/60 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-emerald-500 dark:focus-within:border-[#14F1C7] focus-within:ring-2 focus-within:ring-emerald-500/20 dark:focus-within:ring-[#14F1C7]/40"
                )}
              >
                <div className="flex items-center gap-1 pl-3.5 pr-2.5 py-2 border-r border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium text-[13px] select-none shrink-0">
                  <Phone className="h-3.5 w-3.5 text-slate-400 mr-1" />
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
                    setPhone(digits ? "+91" + digits : "");
                    setPhoneTouched(true);
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  maxLength={11}
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none px-3 py-2"
                />
                {isPhoneProvided && phoneValidation.isValid && (
                  <div className="pr-3 flex items-center text-emerald-500 dark:text-[#14F1C7] pointer-events-none shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Advance to Step 2 Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isStep1Valid}
                className={cn(
                  "w-full py-3 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer",
                  "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500",
                  "shadow-[0_8px_24px_rgba(16,185,129,0.25)] hover:shadow-[0_12px_28px_rgba(16,185,129,0.35)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0"
                )}
              >
                <span>Continue to Owner Credentials</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* STEP 2: OWNER CREDENTIALS & SECURITY                     */}
        {/* ======================================================== */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-[#14F1C7] text-[11px] font-semibold mb-1">
                <Lock className="h-3 w-3" />
                <span>256-bit Encrypted Credentials</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                Set up Owner Credentials
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#94A3B8]">
                Owner credentials for <span className="font-semibold text-slate-800 dark:text-white">{businessName || "your restaurant"}</span>.
              </p>
            </div>

            {/* 1. First Name & Last Name (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="First Name"
                placeholder="e.g. Alexander"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setFirstNameTouched(true);
                }}
                onBlur={() => setFirstNameTouched(true)}
                isSuccess={firstName.trim().length >= 1}
                required
                leftIcon={<User className="h-4 w-4" />}
              />
              <FormInput
                label="Last Name"
                placeholder="e.g. Wright"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setLastNameTouched(true);
                }}
                onBlur={() => setLastNameTouched(true)}
                isSuccess={lastName.trim().length >= 1}
                required
                leftIcon={<User className="h-4 w-4" />}
              />
            </div>

            {/* 2. Work Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                  Work Email Address
                </label>
                <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-[#14F1C7]">
                  Free Email OTP
                </span>
              </div>
              <FormInput
                type="email"
                placeholder="owner@restaurant.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailTouched(true);
                }}
                onBlur={() => setEmailTouched(true)}
                error={emailTouched && !emailValidation.isValid ? emailValidation.error : undefined}
                isSuccess={emailTouched && emailValidation.isValid}
                required
                leftIcon={<Mail className="h-4 w-4" />}
              />
            </div>

            {/* 3. Password & Confirm Password (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PasswordField
                label="Create Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordTouched(true);
                }}
                onBlur={() => setPasswordTouched(true)}
                required
                isSuccess={passwordValidation.isValid}
                helperText=""
              />
              <PasswordField
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordTouched(true);
                }}
                onBlur={() => setConfirmPasswordTouched(true)}
                required
                isSuccess={confirmPasswordValidation.status === "match"}
                error={
                  confirmPasswordTouched &&
                  confirmPassword.length > 0 &&
                  confirmPasswordValidation.status === "mismatch"
                    ? "Passwords do not match"
                    : undefined
                }
                helperText=""
              />
            </div>

            {/* 4. Ultra-Compact High-Tech Password Security Meter (~32px) */}
            <PasswordStrengthMeter
              validation={passwordValidation}
              hasTyped={password.length > 0}
            />

            {/* 5. Dual Button Bar: Back & Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <div className="flex-1">
                <CTAButton
                  isLoading={isLoading}
                  disabled={!isStep2Valid || isLoading}
                >
                  Create Workspace & Verify Email →
                </CTAButton>
              </div>
            </div>
          </form>
        )}

        {/* Bottom Trust Section */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 xs:grid-cols-3 gap-2 text-center select-none">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">256-bit Encrypted</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <Headphones className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">24/7 Priority Support</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">Zero Setup Fees</span>
          </div>
        </div>
      </div>
    </>
  );
}
