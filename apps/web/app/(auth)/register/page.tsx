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
  validateEmail,
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
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Touch states for inline validation on blur / first interaction
  const [emailTouched, setEmailTouched] = React.useState(false);
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

  const isFormValid =
    businessName.trim().length >= 2 &&
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    emailValidation.isValid &&
    (!isPhoneProvided || phoneValidation.isValid) &&
    passwordValidation.isValid &&
    confirmPasswordValidation.isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailTouched(true);
    setPhoneTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);
    setBusinessNameTouched(true);
    setFirstNameTouched(true);
    setLastNameTouched(true);

    if (!isFormValid) {
      if (!emailValidation.isValid) {
        addToast("error", "Invalid Email Address", emailValidation.error || "Please enter a valid work email address.");
      } else if (isPhoneProvided && !phoneValidation.isValid) {
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
        `We've sent a 6-digit code to ${emailValidation.normalized}.`
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
      {/* WIDE-CANVAS REGISTRATION CARD (Eliminates side whitespace) */}
      {/* ======================================================== */}
      <div className="w-full max-w-3xl xl:max-w-4xl relative rounded-[28px] sm:rounded-[36px] bg-white/95 dark:bg-[#0F172A]/85 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 p-5 sm:p-8 lg:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.65)] text-slate-900 dark:text-[#F8FAFC] transition-colors duration-200">
        {/* Subtle glossy top reflection */}
        <div className="absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 dark:via-[#14F1C7]/40 to-transparent pointer-events-none rounded-t-[36px]" />

        {/* Card Header */}
        <div className="text-center pb-4 sm:pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-[#14F1C7] text-xs font-semibold mb-2.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>14-Day Free Growth Trial • No Credit Card Required</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create your DineFlow Workspace
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-body text-slate-600 dark:text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
            Get started with contactless QR menus, live KDS, guest feedback, and automated WhatsApp marketing.
          </p>
        </div>

        {/* Form Body: 2-Column Responsive Grid */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* 1. Business Category Selector (Full Width) */}
          <div className="w-full">
            <BusinessCategorySelector
              value={businessType}
              onChange={setBusinessType}
            />
          </div>

          {/* 2. Business Name with inline QR Slug Preview (Full Width) */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                Business Name
              </label>
              {slug && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-[#14F1C7] font-medium truncate max-w-full">
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

          {/* 3. First Name & Last Name (2 Equal Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

          {/* 4. Work Email & Mobile Number (2 Equal Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Work Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                  Work Email Address
                </label>
                <span className="text-[10.5px] font-medium text-emerald-600 dark:text-[#14F1C7]">
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
                error={
                  emailTouched && !emailValidation.isValid
                    ? emailValidation.error
                    : undefined
                }
                isSuccess={emailTouched && emailValidation.isValid}
                required
                leftIcon={<Mail className="h-4 w-4" />}
              />
            </div>

            {/* Mobile Number (Optional) */}
            <div className="w-full space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                  Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <span className="text-[10.5px] text-slate-500 dark:text-[#94A3B8]">
                  WhatsApp alerts
                </span>
              </div>
              <div
                className={`group relative flex items-center rounded-2xl border transition-all duration-200 bg-slate-100/90 dark:bg-[#0F172A]/70 backdrop-blur-md ${
                  isPhoneProvided && phoneTouched && !phoneValidation.isValid
                    ? "border-rose-500/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
                    : isPhoneProvided && phoneValidation.isValid
                    ? "border-emerald-500/60 dark:border-emerald-500/60 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-emerald-500 dark:focus-within:border-[#14F1C7] focus-within:ring-2 focus-within:ring-emerald-500/20 dark:focus-within:ring-[#14F1C7]/40"
                }`}
              >
                {/* Country Code Pill */}
                <div className="flex items-center gap-1 pl-3.5 pr-2.5 py-2.5 border-r border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium text-[13.5px] select-none shrink-0">
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
                    setPhone(digits ? "+91" + digits : "");
                    setPhoneTouched(true);
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  maxLength={11}
                  aria-invalid={isPhoneProvided && phoneTouched && !phoneValidation.isValid}
                  aria-describedby="register-phone-feedback"
                  className="w-full bg-transparent text-base sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none px-3 py-2.5"
                />

                {isPhoneProvided && phoneValidation.isValid && (
                  <div className="pr-3 flex items-center text-emerald-500 dark:text-[#14F1C7] pointer-events-none shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Inline Error or Helper */}
              {isPhoneProvided && phoneTouched && !phoneValidation.isValid ? (
                <p id="register-phone-feedback" role="alert" className="text-xs text-rose-500 pl-1 font-medium">
                  {phoneValidation.error}
                </p>
              ) : (
                <p id="register-phone-feedback" className="text-[10.5px] text-slate-500 dark:text-[#94A3B8] pl-1">
                  Optional: for WhatsApp orders & manager notifications
                </p>
              )}
            </div>
          </div>

          {/* 5. Password & Confirm Password (2 Equal Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              helperText={
                confirmPasswordTouched && confirmPasswordValidation.status === "match"
                  ? "✅ Passwords match"
                  : !confirmPasswordTouched || confirmPassword.length === 0
                  ? "Re-enter password to confirm"
                  : undefined
              }
            />
          </div>

          {/* 6. Real-Time Password Strength Meter & Criteria Checklist */}
          <div className="w-full">
            <PasswordStrengthMeter
              validation={passwordValidation}
              hasTyped={password.length > 0}
            />
          </div>

          {/* 7. Emerald Gradient CTA Button */}
          <div className="pt-2">
            <CTAButton
              isLoading={isLoading}
              disabled={!isFormValid || isLoading}
            >
              Create Workspace & Verify Email →
            </CTAButton>
          </div>
        </form>

        {/* Footer: Already have an account */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-600 dark:text-[#14F1C7] hover:text-emerald-700 dark:hover:text-[#00E5B8] font-semibold transition-colors hover:underline"
            >
              Sign in to workspace
            </Link>
          </p>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM TRUST SECTION                                     */}
        {/* ======================================================== */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 xs:grid-cols-3 gap-2.5 text-center select-none">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">256-bit Encrypted</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <Headphones className="h-4 w-4 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">24/7 Priority Support</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#14F1C7] shrink-0" />
            <span className="truncate">No Setup Fees</span>
          </div>
        </div>
      </div>
    </>
  );
}
