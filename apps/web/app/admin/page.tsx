"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegacyAdminRedirect() {
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/platform/dashboard");
    }, 800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center dark:bg-neutral-950">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-xl dark:bg-neutral-100 dark:text-neutral-900 mb-4">
        <ShieldCheck className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-2xl">
        Redirecting to Enterprise Platform Console...
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
        The Platform Super Admin portal has moved to an isolated console at{" "}
        <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-mono dark:bg-neutral-800">
          /platform
        </code>.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link href="/platform/dashboard">
          <Button className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
            Open Platform Console Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Redirecting automatically...</span>
      </div>
    </div>
  );
}
