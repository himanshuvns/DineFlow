"use client";

import * as React from "react";
import {
  MessageSquare,
  Sparkles,
  CheckCheck,
  Send,
  Receipt,
  FileText,
  Clock,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MessageItem {
  id: string;
  sender: "bot" | "customer";
  text: string;
  time: string;
  attachment?: {
    type: "bill" | "status" | "menu";
    title: string;
    details: string;
    actionText?: string;
  };
}

const SAMPLE_CHAT: MessageItem[] = [
  {
    id: "1",
    sender: "bot",
    text: "✨ Welcome to The Grand Mirage! Your table 04 order #DF-802 has been received and sent to our kitchen.",
    time: "19:40",
    attachment: {
      type: "status",
      title: "Order Received (#DF-802)",
      details: "1x Truffle Risotto, 1x Orange Spritz • Est. 12 mins",
    },
  },
  {
    id: "2",
    sender: "customer",
    text: "Could we please get some extra Parmesan cheese and ice with the drink?",
    time: "19:42",
  },
  {
    id: "3",
    sender: "bot",
    text: "Noted! Our floor captain has updated your station notes: Extra Parmesan & ice will be served shortly.",
    time: "19:43",
  },
  {
    id: "4",
    sender: "bot",
    text: "🍽️ Your meal is served! Here is your digital tax invoice. Thank you for dining with us.",
    time: "20:15",
    attachment: {
      type: "bill",
      title: "Tax Invoice #INV-2026-088",
      details: "Subtotal: ₹1,190 • GST (5%): ₹59.50 • Total: ₹1,249.50",
      actionText: "Pay via UPI / Card →",
    },
  },
];

export function LandingWhatsappPreview() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: WhatsApp Capabilities */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Automated WhatsApp Communication</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engage Guests on the App They Already Use
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Eliminate bulky thermal paper rolls and app downloads. DineFlow automatically delivers real-time order status, digital GST tax receipts, and direct concierge service over WhatsApp.
          </p>

          <div className="space-y-3.5 pt-2">
            {[
              {
                title: "Instant Digital Receipts & Invoicing",
                desc: "Send itemized GST-compliant bills and instant UPI payment links automatically.",
              },
              {
                title: "Live Order Status Tracking",
                desc: "Guests receive automated notifications when their order is accepted, cooking, or ready.",
              },
              {
                title: "In-Room Hotel Concierge",
                desc: "Guests can request extra amenities, laundry pickup, or late checkout with zero phone hold times.",
              },
              {
                title: "Targeted Marketing Broadcasts",
                desc: "Broadcast weekend brunch menus and special discounts to past guests with high deliverability.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button variant="glow" size="sm" asChild className="h-10 px-5 text-xs sm:text-sm font-bold">
              <Link href="/register">
                Connect WhatsApp to Your Workspace <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Column: Realistic WhatsApp Chat Window */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-slate-800/90 bg-[#ECE5DD] dark:bg-[#0B141A] shadow-2xl overflow-hidden">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] dark:bg-[#1F2C34] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white shadow-xs">
                  DF
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">The Grand Mirage</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                  <span className="text-[11px] text-emerald-200">Official Hospitality Bot</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-200">
                <Phone className="h-4 w-4" />
              </div>
            </div>

            {/* Chat Bubble Thread */}
            <div className="p-4 space-y-3.5 min-h-[380px] max-h-[440px] overflow-y-auto">
              <div className="text-center">
                <span className="text-[10px] bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full shadow-xs">
                  Today • Verified DineFlow Integration
                </span>
              </div>

              {SAMPLE_CHAT.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "customer" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-2 shadow-xs ${
                      msg.sender === "customer"
                        ? "bg-[#E7FFDB] dark:bg-[#005C4B] text-slate-900 dark:text-white rounded-br-none"
                        : "bg-white dark:bg-[#202C33] text-slate-900 dark:text-white rounded-bl-none"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>

                    {/* Attachment card */}
                    {msg.attachment && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                          <Receipt className="h-3.5 w-3.5" />
                          <span>{msg.attachment.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">{msg.attachment.details}</p>
                        {msg.attachment.actionText && (
                          <div className="pt-1">
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 underline cursor-pointer">
                              {msg.attachment.actionText}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end items-center gap-1 text-[9px] text-slate-400 pt-0.5">
                      <span>{msg.time}</span>
                      <CheckCheck className="h-3 w-3 text-emerald-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mock Input Field */}
            <div className="p-2.5 bg-[#F0F2F5] dark:bg-[#202C33] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <div className="flex-1 bg-white dark:bg-[#2A3942] rounded-full px-4 py-2 text-xs text-slate-400">
                Type a message or order inquiry...
              </div>
              <div className="w-8 h-8 rounded-full bg-[#00A884] text-white flex items-center justify-center">
                <Send className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
