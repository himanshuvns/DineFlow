"use client";

import * as React from "react";
import { CustomerReviewHub } from "@/components/customer/customer-review-hub";

export default function GuestReviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      }
    >
      <CustomerReviewHub />
    </React.Suspense>
  );
}
