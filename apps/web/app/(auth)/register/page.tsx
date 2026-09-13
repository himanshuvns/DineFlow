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
  CTAButton,
} from "@/components/auth";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiClient.post("/auth/register", {
        businessName,
        slug,
        businessType,
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        phone,
        password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        country: "IN",
      });

      const devOtp = res.data?.data?.devOtp;
      setIsRedirecting(true);
      if (devOtp) {
        addToast("success", "Account Created!", `Verification code: ${devOtp}`);
        setTimeout(() => {
          router.push(`/verify?phone=${encodeURIComponent(phone)}&devOtp=${encodeURIComponent(devOtp)}`);
        }, 2200);
      } else {
        addToast(
          "success",
          "Registration submitted!",
          "Please check your mobile for the 6-digit verification code."
        );
        setTimeout(() => {
          router.push(`/verify?phone=${encodeURIComponent(phone)}`);
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
      <div className="relative rounded-[32px] bg-[#0F172A]/70 backdrop-blur-2xl border border-white/10 p-6 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-[#F8FAFC]">
        {/* Subtle glossy top reflection */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#14F1C7]/30 to-transparent pointer-events-none rounded-t-[32px]" />

        {/* Card Header */}
        <div className="text-center pb-6">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Create your DineFlow Workspace
          </h2>
          <p className="mt-2 text-[14px] font-body text-[#94A3B8] max-w-sm mx-auto leading-normal">
            Get started with contactless QR menus, live KDS, and WhatsApp
            marketing in minutes.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Business Category Selector */}
          <BusinessCategorySelector
            value={businessType}
            onChange={setBusinessType}
          />

          {/* 2. Business Name */}
          <div>
            <FormInput
              label="Business Name"
              placeholder="e.g. The Grand Bistro"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              leftIcon={<Store className="h-4 w-4" />}
            />
            {slug && (
              <p className="text-[11px] text-slate-400 mt-1 pl-1 font-mono">
                Customer QR URL:{" "}
                <span className="text-[#14F1C7] font-semibold">
                  dineflow.app/m/{slug}
                </span>
              </p>
            )}
          </div>

          {/* 3. First Name & Last Name (2 Columns) */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="First Name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              leftIcon={<User className="h-4 w-4" />}
            />
            <FormInput
              label="Last Name"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              leftIcon={<User className="h-4 w-4" />}
            />
          </div>

          {/* 4. Mobile Number with +91 segmented pill */}
          <div className="w-full space-y-1.5">
            <label className="text-[13px] font-medium text-slate-300 block select-none">
              Mobile Number
            </label>
            <div className="group relative flex items-center rounded-2xl border border-slate-700/60 bg-[#0F172A]/70 backdrop-blur-md transition-all duration-200 hover:border-slate-600 focus-within:border-[#14F1C7] focus-within:ring-1 focus-within:ring-[#14F1C7]/40 focus-within:shadow-[0_0_20px_rgba(20,241,199,0.22)]">
              {/* Country Code Pill */}
              <div className="flex items-center gap-1 pl-4 pr-3 py-3.5 border-r border-slate-700/60 text-slate-300 font-medium text-[14px] select-none shrink-0">
                <Phone className="h-4 w-4 text-slate-400 mr-1" />
                <span>+91</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Number Input */}
              <input
                type="tel"
                placeholder="9165437865"
                value={phone.startsWith("+91") ? phone.slice(3).trim() : phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, "");
                  setPhone("+91" + digits);
                }}
                required
                maxLength={10}
                className="w-full bg-transparent text-[14px] text-[#F8FAFC] placeholder:text-slate-500 outline-none px-3.5 py-3.5"
              />
            </div>
            <p className="text-[13px] text-[#94A3B8] pl-1">
              A 6-digit OTP will be sent to this mobile number.
            </p>
          </div>

          {/* 5. Password Field with Mascot Event Trigger */}
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          {/* 6. Emerald Gradient CTA Button */}
          <div className="pt-2">
            <CTAButton isLoading={isLoading}>
              Create Workspace & Verify Mobile
            </CTAButton>
          </div>
        </form>

        {/* Footer: Already have an account */}
        <div className="mt-5 text-center">
          <p className="text-[13px] text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#14F1C7] hover:text-[#00E5B8] font-semibold transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM TRUST SECTION                                     */}
        {/* ======================================================== */}
        <div className="mt-7 pt-5 border-t border-white/10 grid grid-cols-3 gap-2 text-center select-none">
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium">
            <ShieldCheck className="h-4 w-4 text-[#14F1C7] shrink-0" />
            <span className="truncate">Secure & Encrypted</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium">
            <Headphones className="h-4 w-4 text-[#14F1C7] shrink-0" />
            <span className="truncate">24/7 Support</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium">
            <CheckCircle2 className="h-4 w-4 text-[#14F1C7] shrink-0" />
            <span className="truncate">No Setup Fees</span>
          </div>
        </div>
      </div>
    </>
  );
}
