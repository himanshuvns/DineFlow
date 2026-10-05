import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | DineFlow Hospitality OS",
  description: "Terms and conditions of service for DineFlow Restaurant OS and WhatsApp messaging.",
};

export default function TermsOfServicePage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
            <FileText className="h-3.5 w-3.5" /> Effective Date: October 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            DineFlow Terms of Service
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Welcome to DineFlow. By using our multi-tenant restaurant management software, digital QR menus, or WhatsApp bot, you agree to these terms.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Use of Services</h2>
            <p>
              DineFlow provides cloud software for food and beverage venues, including table management, kitchen display systems (KDS), payroll, attendance, and automated WhatsApp communication.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. WhatsApp Messaging Rules</h2>
            <p>
              Customers and staff interacting via WhatsApp agree to receive transactional alerts, order confirmation notifications, and workforce verification messages in accordance with Meta&apos;s WhatsApp Business Messaging policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Tenant Responsibilities</h2>
            <p>
              Restaurant operators are responsible for maintaining accurate menu pricing, fulfilling orders, and adhering to local labor guidelines when utilizing DineFlow&apos;s attendance and shift scheduling features.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Modifications & Inquiries</h2>
            <p>
              We reserve the right to revise these terms to reflect feature updates. Questions can be directed to support@dine.rovixatech.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
