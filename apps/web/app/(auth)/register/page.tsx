"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  User,
  Phone,
  ChevronDown,
  ShieldCheck,
  Headphones,
  CheckCircle2,
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
import {
  validateIndianPhone,
  formatIndianPhoneInput,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [businessName, setBusinessName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [businessType, setBusinessType] = React.useState("restaurant");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("+91");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Touch states for inline validation on blur / first interaction
  const [phoneTouched, setPhoneTouched] = React.useState(false);
  const [passwordTouched, setPasswordTouched] = React.useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = React.useState(false);
  const [businessNameTouched, setBusinessNameTouched] = React.useState(false);
  const [firstNameTouched, setFirstNameTouched] = React.useState(false);
  const [lastNameTouched, setLastNameTouched] = React.useState(false);

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
  const phoneValidation = React.useMemo(() => validateIndianPhone(phone), [phone]);
  const passwordValidation = React.useMemo(() => validatePassword(password), [password]);
  const confirmPasswordValidation = React.useMemo(
    () => validateConfirmPassword(password, confirmPassword),
    [password, confirmPassword]
  );

  const isFormValid =
    businessName.trim().length >= 2 &&
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    phoneValidation.isValid &&
    passwordValidation.isValid &&
    confirmPasswordValidation.isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setPhoneTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);
    setBusinessNameTouched(true);
    setFirstNameTouched(true);
    setLastNameTouched(true);

    if (!isFormValid) {
      if (!phoneValidation.isValid) {
        addToast("error", "Invalid Mobile Number", phoneValidation.error || "Please enter a valid 10-digit Indian mobile number.");
      } else if (!passwordValidation.isValid) {
        addToast("error", "Weak Password", passwordValidation.error || "Please satisfy all password complexity criteria.");
      } else if (!confirmPasswordValidation.isValid) {
        addToast("error", "Password Mismatch", "Passwords do not match. Please verify.");
      } else {
        addToast("warning", "Required Fields", "Please complete all required fields.");
      }
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.post("/auth/register", {
        businessName: businessName.trim(),
        slug,
        businessType,
        name: `${firstName} ${lastName}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phoneValidation.normalized,
        password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        country: "IN",
      });

      const devOtp = res.data?.data?.devOtp;
      setIsRedirecting(true);
      if (devOtp) {
        addToast("success", "Account Created!", `Verification code: ${devOtp}`);
        setTimeout(() => {
          router.push(`/verify?phone=${encodeURIComponent(phoneValidation.normalized)}&devOtp=${encodeURIComponent(devOtp)}`);
        }, 2200);
      } else {
        addToast(
          "success",
          "Registration submitted!",
          "Please check your mobile for the 6-digit verification code."
        );
        setTimeout(() => {
          router.push(`/verify?phone=${encodeURIComponent(phoneValidation.normalized)}`);
        }, 2200);
      }
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
          title={`Registering ${businessName || "Your Restaurant"}…`}
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
      {/* FLOATING REGISTRATION CARD                               */}
      {/* ======================================================== */}
      <div className="relative rounded-[28px] sm:rounded-[32px] bg-white/85 dark:bg-[#0F172A]/70 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 p-4 sm:p-5 lg:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-slate-900 dark:text-[#F8FAFC] transition-colors duration-200">
        {/* Subtle glossy top reflection */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 dark:via-[#14F1C7]/30 to-transparent pointer-events-none rounded-t-[32px]" />

        {/* Card Header */}
        <div className="text-center pb-2 sm:pb-2.5">
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create your DineFlow Workspace
          </h2>
          <p className="mt-0.5 text-xs font-body text-slate-600 dark:text-[#94A3B8] max-w-sm mx-auto leading-tight">
            Get started with contactless QR menus, live KDS, and WhatsApp marketing.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
          {/* 1. Business Category Selector */}
          <BusinessCategorySelector
            value={businessType}
            onChange={setBusinessType}
          />

          {/* 2. Business Name with inline QR Slug Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                Business Name
              </label>
              {slug && (
                <span className="text-[10.5px] font-mono text-emerald-600 dark:text-[#14F1C7] font-medium truncate max-w-[180px]">
                  dineflow.app/m/{slug}
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

          {/* 3. First Name & Last Name (Responsive Columns) */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
            <FormInput
              label="First Name"
              placeholder="First name"
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
              placeholder="Last name"
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

          {/* 4. Mobile Number with +91 segmented pill and real-time formatting */}
          <div className="w-full space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                Mobile Number
              </label>
              <span className="text-[10.5px] text-slate-500 dark:text-[#94A3B8]">
                10-digit Indian Mobile
              </span>
            </div>
            <div
              className={`group relative flex items-center rounded-2xl border transition-all duration-200 bg-slate-100/90 dark:bg-[#0F172A]/70 backdrop-blur-md ${
                phoneTouched && !phoneValidation.isValid
                  ? "border-rose-500/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
                  : phoneValidation.isValid
                  ? "border-emerald-500/60 dark:border-emerald-500/60 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
                  : "border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-emerald-500 dark:focus-within:border-[#14F1C7] focus-within:ring-2 focus-within:ring-emerald-500/20 dark:focus-within:ring-[#14F1C7]/40"
              }`}
            >
              {/* Country Code Pill */}
              <div className="flex items-center gap-1 pl-3.5 pr-2.5 py-2 border-r border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium text-[13.5px] select-none shrink-0">
                <Phone className="h-4 w-4 text-slate-400 mr-1" />
                <span>+91</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </div>

              {/* Number Input with live formatting */}
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
                }}
                onBlur={() => setPhoneTouched(true)}
                required
                maxLength={11}
                aria-invalid={phoneTouched && !phoneValidation.isValid}
                aria-describedby="register-phone-feedback"
                className="w-full bg-transparent text-base sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none px-3 py-2"
              />

              {phoneValidation.isValid && (
                <div className="pr-3 flex items-center text-emerald-500 dark:text-[#14F1C7] pointer-events-none shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Inline Error or Helper */}
            {phoneTouched && !phoneValidation.isValid ? (
              <p id="register-phone-feedback" role="alert" className="text-xs text-rose-500 pl-1 font-medium">
                {phoneValidation.error}
              </p>
            ) : (
              <p id="register-phone-feedback" className="text-[11px] text-slate-500 dark:text-[#94A3B8] pl-1">
                Enter your 10-digit mobile number starting with 6, 7, 8, or 9
              </p>
            )}
          </div>

          {/* 5. Password Field with Live Criteria Checklist & Strength Meter */}
          <div>
            <PasswordField
              label="Password"
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

            {/* Real-Time Password Strength Meter & 5-Criteria Checklist */}
            <PasswordStrengthMeter
              validation={passwordValidation}
              hasTyped={password.length > 0}
            />
          </div>

          {/* 6. Confirm Password with Live Matching Validation */}
          <div>
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
              helperText={
                confirmPasswordTouched && confirmPasswordValidation.status === "match"
                  ? "✅ Passwords match"
                  : !confirmPasswordTouched || confirmPassword.length === 0
                  ? "Re-enter your password to confirm"
                  : undefined
              }
            />
          </div>

          {/* 7. Emerald Gradient CTA Button */}
          <div className="pt-2">
            <CTAButton
              isLoading={isLoading}
              disabled={!isFormValid || isLoading}
            >
              Create Workspace & Verify Mobile
            </CTAButton>
          </div>
        </form>

        {/* Footer: Already have an account */}
        <div className="mt-2.5 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-600 dark:text-[#14F1C7] hover:text-emerald-700 dark:hover:text-[#00E5B8] font-semibold transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM TRUST SECTION                                     */}
        {/* ======================================================== */}
        <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 xs:grid-cols-3 gap-2 text-center select-none">
          <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">Secure & Encrypted</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-400 font-medium">
            <Headphones className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">24/7 Support</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">No Setup Fees</span>
          </div>
        </div>
      </div>
    </>
  );
}
