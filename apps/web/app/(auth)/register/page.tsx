"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Coffee,
  Hotel,
  Soup,
  Palmtree,
  Phone,
  Lock,
  User,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { HospitalityLoader } from "@/components/ui/hospitality-loader";

const BUSINESS_TYPES = [
  { id: "restaurant", label: "Restaurant", icon: Utensils },
  { id: "cafe", label: "Café", icon: Coffee },
  { id: "hotel", label: "Hotel / Rooms", icon: Hotel },
  { id: "cloud_kitchen", label: "Cloud Kitchen", icon: Soup },
  { id: "resort", label: "Resort", icon: Palmtree },
];

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [businessName, setBusinessName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [businessType, setBusinessType] = React.useState("restaurant");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
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
        }, 2400);
      } else {
        addToast("success", "Registration submitted!", "Please check your mobile for the 6-digit verification code.");
        setTimeout(() => {
          router.push(`/verify?phone=${encodeURIComponent(phone)}`);
        }, 2400);
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
      <Card variant="glass" className="border-slate-200 dark:border-slate-700/60 shadow-2xl relative my-8">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create your DineFlow Workspace
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Get started with contactless QR menus, live KDS, and WhatsApp marketing
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Type Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              Business Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUSINESS_TYPES.map((type) => {
                const isSelected = businessType === type.id;
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setBusinessType(type.id)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer",
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs"
                        : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")} />
                    <span className="truncate">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business Name & Slug Preview */}
          <div>
            <Input
              label="Business Name"
              placeholder="e.g. The Grand Bistro"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              leftIcon={<Building2 className="h-4 w-4" />}
            />
            {slug && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pl-1">
                Customer QR URL:{" "}
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                  dineflow.app/m/{slug}
                </span>
              </p>
            )}
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="Jean"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              leftIcon={<User className="h-4 w-4" />}
            />
            <Input
              label="Last Name"
              placeholder="Laurent"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {/* Mobile Number */}
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            leftIcon={<Phone className="h-4 w-4" />}
            helperText="A 6-digit OTP will be sent to this mobile number"
          />

          {/* Password */}
          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            leftIcon={<Lock className="h-4 w-4" />}
          />

          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full mt-3"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Create Workspace & Verify Mobile
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-200 dark:border-slate-800/80 pt-6">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
    </>
  );
}
