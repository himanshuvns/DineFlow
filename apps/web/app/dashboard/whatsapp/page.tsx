"use client";

import * as React from "react";
import {
  MessageSquareShare,
  CheckCircle2,
  Zap,
  Send,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  RefreshCw,
  Sliders,
  User,
  BrainCircuit,
  Bot,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface MessageLogItem {
  id: string;
  phone: string;
  customerName: string;
  template: string;
  status: "delivered" | "read" | "queued" | "failed";
  time: string;
  location: string;
}

const INITIAL_LOGS: MessageLogItem[] = [
  {
    id: "wam-101",
    phone: "+91 98201 44820",
    customerName: "Aarav Sharma",
    template: "Order Confirmed",
    status: "read",
    time: "4 mins ago",
    location: "Table 14",
  },
  {
    id: "wam-100",
    phone: "+91 98450 11923",
    customerName: "Dr. Rohini Mehta",
    template: "Kitchen Ready (Room Service)",
    status: "delivered",
    time: "18 mins ago",
    location: "Suite 302",
  },
  {
    id: "wam-099",
    phone: "+91 99100 88219",
    customerName: "Vikram Kapoor",
    template: "Tax Invoice PDF Receipt",
    status: "read",
    time: "45 mins ago",
    location: "Table 8",
  },
  {
    id: "wam-098",
    phone: "+91 97200 44102",
    customerName: "Priya Nair",
    template: "1-5 Star Feedback Review",
    status: "delivered",
    time: "1h ago",
    location: "Table 3",
  },
];

export default function WhatsAppPage() {
  const { addToast } = useToast();
  const [phoneNumber, setPhoneNumber] = React.useState("+91 98765 43210");
  const [testNumber, setTestNumber] = React.useState("+91 98000 12345");
  const [testGuestName, setTestGuestName] = React.useState("Alex Rivera");
  const [logs, setLogs] = React.useState<MessageLogItem[]>(INITIAL_LOGS);

  // Simulation chat messages
  const [chatMessages, setChatMessages] = React.useState<Array<{ sender: "bot" | "user"; text: string; time: string }>>([
    {
      sender: "bot",
      text: "Hello Alex! ✨ Your order #ORD-2091 at The Grand Bistro (Table 14) is confirmed and being prepared in our kitchen.\n\n📋 2 Course(s) | Total: ₹1,942.50\n📍 Track: https://dineflow.app/m/the-grand-bistro/order/ORD-2091\n\nReply STOP to unsubscribe.",
      time: "14:32",
    },
  ]);
  const [simulatedInput, setSimulatedInput] = React.useState("");
  const [chatbotEnabled, setChatbotEnabled] = React.useState(true);
  const [chatbotInput, setChatbotInput] = React.useState("");
  const [chatbotMessages, setChatbotMessages] = React.useState<Array<{ role: "bot" | "user"; text: string; time: string }>>([
    {
      role: "bot",
      text: "👋 Hi! I'm DineBot, your ordering assistant. You can:\n• Reorder your last meal\n• Track your current order\n• Browse today's specials\n\nHow can I help?",
      time: "Now",
    },
  ]);

  const handleChatbotReply = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user" as const, text, time: now };

    let botReply = "";
    const lower = text.toLowerCase();
    if (lower.includes("reorder") || lower.includes("same again") || lower.includes("last meal")) {
      botReply = "Found your last order! 🍽️\n\n• Truffle Mushroom Risotto × 1 — ₹850\n• Cold Brew Tonic & Citrus × 2 — ₹640\n\nTotal: ₹1,490 + 5% GST\n\nShall I place this order for Table 14?";
    } else if (lower.includes("where") || lower.includes("track") || lower.includes("status")) {
      botReply = "Your order #ORD-2091 is 🔥 Being Prepared in the kitchen right now!\n\nEstimated ready in: ~12 minutes\n📍 Delivery to Table 14\n\nWe'll notify you when it's on its way!";
    } else if (lower.includes("special") || lower.includes("menu") || lower.includes("today")) {
      botReply = "Today's Chef's Specials 👨‍🍳\n\n🍄 Truffle Mushroom Risotto — ₹850\n🐟 Pan-Seared Atlantic Salmon — ₹1,200\n🥗 Smoked Burrata & Heirloom — ₹620\n🍷 Vintage Reserve Merlot — ₹3,800\n\nReply with a dish name to order!";
    } else if (lower === "stop" || lower === "unsubscribe") {
      botReply = "You've been unsubscribed from DineFlow notifications for The Grand Bistro. ✅\n\nReply START anytime to re-enable updates.";
    } else if (lower === "yes" || lower.includes("confirm") || lower.includes("place")) {
      botReply = "✅ Order placed successfully!\n\nOrder #ORD-2097 confirmed.\nEstimated time: 20 minutes\n💳 Charged to your registered UPI/Card\n\nBon appétit! 🍽️";
    } else {
      botReply = "Thank you for your message! 😊 Our front-desk team at The Grand Bistro has been notified.\n\nQuick options:\n• Reply REORDER to reorder your last meal\n• Reply STATUS to track your order\n• Reply MENU for today's specials";
    }

    setTimeout(() => {
      setChatbotMessages((prev) => [...prev, userMsg, { role: "bot" as const, text: botReply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 600);
    setChatbotMessages((prev) => [...prev, userMsg]);
    setChatbotInput("");
  };


  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNumber) return;

    const newLog: MessageLogItem = {
      id: `wam-${Date.now().toString().slice(-4)}`,
      phone: testNumber,
      customerName: testGuestName,
      template: "Order Confirmed (Manual Test)",
      status: "delivered",
      time: "Just now",
      location: "Table 14",
    };

    setLogs([newLog, ...logs]);

    setChatMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `Hello ${testGuestName}! ✨ Test notification dispatched via Meta Cloud API. Tracking link: https://dineflow.app/m/the-grand-bistro/order/${newLog.id}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    addToast("success", "WhatsApp Alert Dispatched", `Sent digital notification to ${testNumber}`);
  };

  const handleSimulateReply = (preset?: string) => {
    const textToSend = preset || simulatedInput;
    if (!textToSend) return;

    const userMsg = {
      sender: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    let botReplyText = "";
    if (textToSend.toUpperCase() === "STOP" || textToSend.toUpperCase() === "UNSUBSCRIBE") {
      botReplyText = "You have successfully unsubscribed from DineFlow notifications for The Grand Bistro. Send START to re-enable.";
    } else if (["1", "2", "3", "4", "5"].includes(textToSend.trim())) {
      botReplyText = `Thank you for rating us ${textToSend} ⭐! Our executive culinary team appreciates your feedback.`;
    } else {
      botReplyText = "Thank you for reaching out! Our front-desk steward has received your message at Table 14.";
    }

    const botMsg = {
      sender: "bot" as const,
      text: botReplyText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg, botMsg]);
    setSimulatedInput("");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Meta Cloud API (WABA) Integration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            WhatsApp Marketing & Invoicing
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Automatically dispatch digital order receipts, live kitchen alerts, tax invoices, and post-dining review loops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md" dot>
            Meta Cloud API Connected
          </Badge>
          <Badge variant="glow" size="sm">
            Tier 2 (10k/day)
          </Badge>
        </div>
      </div>

      {/* Account Status Card */}
      <Card variant="glass" className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{phoneNumber}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">• Official Business Account (Green Tick)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                WABA ID: <code className="text-slate-800 dark:text-slate-300 font-mono font-medium">waba_act_891823091</code> • Messaging Quality: <strong className="text-emerald-700 dark:text-emerald-400">High</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => addToast("info", "Webhook Health Check", "Meta Cloud Webhook ping returned 200 OK.")}>
              Ping Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Automation Rules & Test Sender (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Automated Rule Triggers */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Automated Notification Rules
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Triggered automatically upon POS, KDS, or customer events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Instant Order Confirmation", desc: "Sends itemized bill & live kitchen tracker link within 2s of order placement", active: true, tag: "Essential" },
                { title: "Kitchen Ready & Delivery Notification", desc: "Alerts diners or hotel guests when hot courses or cocktails leave the kitchen", active: true, tag: "KDS Triggered" },
                { title: "Digital GST Tax Invoice PDF", desc: "Delivers branded receipt with 1-tap UPI payment QR when order is marked served", active: true, tag: "Tax Compliant" },
                { title: "Post-Dining 1-5 Star Review Loop", desc: "Sends review prompt 20 minutes after bill settlement with opt-out option", active: true, tag: "NPS Loop" },
                { title: "Repeat Guest Loyalty Perk", desc: "Sends 10% privilege discount 7 days after visit to encourage return bookings", active: false, tag: "Growth Plan" },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-0.5 pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{feat.title}</h4>
                      <Badge variant="neutral" size="sm">{feat.tag}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{feat.desc}</p>
                  </div>
                  <Badge variant={feat.active ? "success" : "neutral"} size="sm">
                    {feat.active ? "Active" : "Paused"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Test Sender Form */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Send Live Test Notification
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                Dispatch an immediate test receipt to your personal WhatsApp number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendTest} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Recipient WhatsApp Number"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    placeholder="+91 98000 00000"
                    required
                  />
                  <Input
                    label="Customer / Guest Name"
                    value={testGuestName}
                    onChange={(e) => setTestGuestName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="glow" size="sm" type="submit" rightIcon={<Send className="h-3.5 w-3.5" />}>
                    Dispatch Live WhatsApp Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Two-Way Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="glow" className="border-emerald-500/30">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquareShare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Interactive Chat Simulator
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                  Simulate guest replies & bot automation
                </CardDescription>
              </div>
              <Badge variant="success" size="sm">Verified WABA</Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* WhatsApp Chat Thread */}
              <div className="h-80 overflow-y-auto p-4 rounded-2xl bg-emerald-50/40 dark:bg-[#091b15] border border-emerald-200/80 dark:border-emerald-500/20 text-xs space-y-3 shadow-inner">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 shadow-sm whitespace-pre-line text-xs ${
                        msg.sender === "user"
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-white dark:bg-[#142c23] text-slate-800 dark:text-slate-100 rounded-bl-none border border-emerald-200/60 dark:border-emerald-500/20"
                      }`}
                    >
                      {msg.sender === "bot" && (
                        <div className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px] mb-1 flex items-center gap-1">
                          <span>The Grand Bistro</span>
                          <CheckCircle2 className="h-3 w-3 inline" />
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.text}</p>
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          msg.sender === "user" ? "text-emerald-100" : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {msg.time} {msg.sender === "user" ? "✓✓" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulation Quick Action Chips */}
              <div className="space-y-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block">Simulate Guest Inbound Reply:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSimulateReply("5")}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-amber-700 dark:text-amber-300 hover:border-amber-400 transition-colors cursor-pointer shadow-2xs"
                  >
                    Rate &quot;5 ⭐&quot;
                  </button>
                  <button
                    onClick={() => handleSimulateReply("STOP")}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-rose-700 dark:text-rose-300 hover:border-rose-400 transition-colors cursor-pointer shadow-2xs"
                  >
                    Opt-out &quot;STOP&quot;
                  </button>
                  <button
                    onClick={() => handleSimulateReply("Can we get extra ice please?")}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:border-slate-400 transition-colors cursor-pointer shadow-2xs"
                  >
                    &quot;Extra ice please&quot;
                  </button>
                </div>
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type simulated reply..."
                  value={simulatedInput}
                  onChange={(e) => setSimulatedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSimulateReply()}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Button variant="secondary" size="sm" onClick={() => handleSimulateReply()}>
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message Dispatch History Log */}
      <Card variant="glass">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Live WhatsApp Dispatch Log
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
              Audit log of all system-initiated notifications and diner receipts.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold bg-slate-50/70 dark:bg-slate-950/40">
                  <th className="p-3">Guest Name</th>
                  <th className="p-3">Recipient Phone</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Template Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{log.customerName}</td>
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{log.phone}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{log.location}</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">{log.template}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          log.status === "read"
                            ? "glow"
                            : log.status === "delivered"
                            ? "success"
                            : "info"
                        }
                        size="sm"
                      >
                        {log.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-right text-slate-500 font-medium">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── 6.4 WhatsApp Reorder Chatbot ─────────────────────────────────────── */}
      <Card variant="glass" className="border-violet-500/20">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-[11px] font-semibold mb-1.5">
              <BrainCircuit className="h-3 w-3" /> Feature 6.4 — AI Chatbot
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Reorder Chatbot</CardTitle>
            <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
              Guests reply to WhatsApp notifications to reorder, track orders, or browse specials.
            </CardDescription>
          </div>
          <button
            onClick={() => {
              addToast("info", "Chatbot Toggle", chatbotEnabled ? "Reorder chatbot paused." : "Reorder chatbot activated.");
              setChatbotEnabled(!chatbotEnabled);
            }}
            className="flex items-center gap-2 text-xs font-semibold transition-colors"
          >
            {chatbotEnabled ? (
              <><ToggleRight className="h-7 w-7 text-violet-400" /><span className="text-violet-400">Active</span></>
            ) : (
              <><ToggleLeft className="h-7 w-7 text-slate-500" /><span className="text-slate-500">Paused</span></>
            )}
          </button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chatbot info */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-2.5">
                {[
                  { intent: "Reorder", desc: "Guest texts \"same again\" or \"reorder\" — bot confirms last order", icon: RefreshCw, color: "text-emerald-400" },
                  { intent: "Track Order", desc: "\"Where is my food?\" — bot replies with live kitchen status", icon: Clock, color: "text-blue-400" },
                  { intent: "Browse Menu", desc: "\"What are today's specials?\" — bot lists chef's picks", icon: FileText, color: "text-amber-400" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.intent} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs">
                      <Icon className={`h-4 w-4 ${item.color} shrink-0 mt-0.5`} />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.intent}</p>
                        <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs">
                <p className="text-violet-700 dark:text-violet-300 font-semibold mb-1">Powered by Gemini AI</p>
                <p className="text-slate-600 dark:text-slate-400">Contextual replies based on order history, menu data, and kitchen status — not just keyword matching.</p>
              </div>
            </div>

            {/* Chat Simulator */}
            <div className="lg:col-span-8">
              <div className="bg-slate-50 dark:bg-[#0a0d14] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                {/* Chat header */}
                <div className="flex items-center gap-3 p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">DineBot — The Grand Bistro</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">● Online</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant={chatbotEnabled ? "success" : "info"} size="sm">
                      {chatbotEnabled ? "Active" : "Paused"}
                    </Badge>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-72 overflow-y-auto p-4 space-y-3 bg-slate-100/50 dark:bg-transparent">
                  {chatbotMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "bot" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${
                        msg.role === "bot"
                          ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-sm"
                          : "bg-violet-600 text-white rounded-tr-sm"
                      }`}>
                        {msg.text}
                        <div className={`text-[10px] mt-1 ${ msg.role === "bot" ? "text-slate-400 dark:text-slate-500" : "text-violet-200/80" }`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick replies */}
                <div className="px-4 pb-2 pt-2 flex flex-wrap gap-1.5 bg-white dark:bg-transparent">
                  {["Reorder my last meal", "Where's my order?", "Show today's specials", "STOP"].map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleChatbotReply(reply)}
                      className="text-[11px] px-3 py-1 rounded-full border border-violet-500/30 text-violet-700 dark:text-violet-300 bg-violet-50/50 dark:bg-transparent hover:bg-violet-100 dark:hover:bg-violet-500/10 transition-colors font-medium shadow-2xs"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => { e.preventDefault(); if (chatbotInput.trim()) { handleChatbotReply(chatbotInput); } }}
                  className="flex items-center gap-2 p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent"
                >
                  <input
                    value={chatbotInput}
                    onChange={(e) => setChatbotInput(e.target.value)}
                    placeholder="Type as a guest…"
                    className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-violet-500/50"
                  />
                  <button type="submit" className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors cursor-pointer">
                    <Send className="h-3.5 w-3.5 text-white" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
