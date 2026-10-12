"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function TenantMenuLandingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tenantSlug = (params?.tenantSlug as string) || "the-grand-bistro";

  React.useEffect(() => {
    const qs = searchParams?.toString();
    const target = `/m/${tenantSlug}/t-01${qs ? `?${qs}` : ""}`;
    router.replace(target);
  }, [tenantSlug, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Opening restaurant menu & offers...</p>
      </div>
    </div>
  );
}
