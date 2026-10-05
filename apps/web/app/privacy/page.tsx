import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | DineFlow Hospitality OS",
  description: "Privacy Policy and data processing terms for DineFlow Multi-Tenant Restaurant & Hospitality OS.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <Shield className="h-3.5 w-3.5" /> Effective Date: October 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            DineFlow Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            This Privacy Policy explains how DineFlow (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and safeguards information when restaurants, guests, and staff interact with our platform and WhatsApp integration.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
            <p>
              When using DineFlow, we may process:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact Information:</strong> Phone numbers (for WhatsApp ordering and staff communications), employee names, and email addresses.</li>
              <li><strong>Order & Dining Data:</strong> Table numbers, order history, billing preferences, and special dietary requests.</li>
              <li><strong>Workforce & Attendance Data:</strong> Clock-in timestamps, GPS geofence proximity verification records (within 100m of the registered venue), and leave request entries.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Meta WhatsApp Business API Integration</h2>
            <p>
              DineFlow integrates with Meta&apos;s Official WhatsApp Cloud API to facilitate automated customer service, digital menu delivery, order updates, and staff workforce coordination.
            </p>
            <p>
              We process incoming messages strictly to route inquiries to the appropriate restaurant or automated service bot. We never sell phone numbers or message content to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Data Retention & Deletion</h2>
            <p>
              You may request deletion of your contact information or account data at any time by contacting your venue manager or submitting a request via our{" "}
              <Link href="/data-deletion" className="text-emerald-600 dark:text-emerald-400 underline">
                Data Deletion Instructions
              </Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Contact & Support</h2>
            <p>
              For privacy inquiries, please contact our Data Protection Officer at:
              <br />
              <strong>Email:</strong> support@dine.rovixatech.com
              <br />
              <strong>Address:</strong> Rovixa Technologies, DineFlow Enterprise Hospitality Suite
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
