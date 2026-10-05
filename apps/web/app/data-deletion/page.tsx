import React from "react";
import Link from "next/link";
import { Trash2, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Data Deletion Instructions | DineFlow",
  description: "User Data Deletion Callback and Instructions for DineFlow Hospitality OS and Meta Platform.",
};

export default function DataDeletionPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            <Trash2 className="h-3.5 w-3.5" /> GDPR & Platform Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            User Data Deletion Instructions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            In compliance with Meta Platform rules and General Data Protection Regulations, users have the right to request deletion of their personal information associated with DineFlow.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">How to Request Deletion</h2>
            <p>
              To remove your phone number, order history, or employee profile from DineFlow, follow these steps:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Via WhatsApp:</strong> Reply to our WhatsApp number with the command <strong>STOP</strong> or <strong>DELETE DATA</strong>. Our automated system will unsubscribe you and anonymize your contact logs within 24 hours.
              </li>
              <li>
                <strong>Via Email:</strong> Send an email to <code>support@dine.rovixatech.com</code> with the subject <em>&quot;Data Deletion Request&quot;</em> specifying the phone number or email registered with your account.
              </li>
              <li>
                <strong>Via Restaurant Management:</strong> If you are an employee or dining guest, inform the restaurant floor supervisor or manager to purge your record from the DineFlow Staff &amp; Guest directory.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Confirmation of Deletion</h2>
            <p>
              Once your deletion request has been processed, all personal identifying records will be permanently erased from our primary databases and Redis caches. An email or WhatsApp confirmation receipt will be delivered upon completion.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
