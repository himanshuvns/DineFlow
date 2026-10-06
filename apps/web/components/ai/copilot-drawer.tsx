"use client";

import * as React from "react";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/ui-store";
import { useTenantDataStore } from "@/lib/stores/tenant-data-store";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  content: string;
  timestamp: string;
  actionLinks?: Array<{ label: string; href: string }>;
}

const PRESET_QUERIES = [
  "Top 5 sellers this week",
  "Slow-moving dishes",
  "Customer feedback summary",
  "Weekend sales comparison",
  "Kitchen bottleneck analysis",
  "Staff shift coverage check",
];

const MOCK_AI_RESPONSES: Record<string, string> = {
  "top 5 sellers this week": `### 🏆 Top 5 Revenue Drivers (Last 7 Days)

| Rank | Dish Name | Units Sold | Total Revenue | Gross Margin |
| :--- | :--- | :---: | :---: | :---: |
| **#1** | **Truffle Mushroom Risotto** | 184 | ₹1,56,400 | **74%** |
| **#2** | **Wood-Fired Margherita** | 142 | ₹1,06,500 | **78%** |
| **#3** | **Pan-Seared Atlantic Salmon** | 88 | ₹1,05,600 | **66%** |
| **#4** | **Smoked Burrata Salad** | 116 | ₹71,920 | **81%** |
| **#5** | **Cold Brew Citrus Tonic** | 198 | ₹63,360 | **89%** |

> 💡 **Strategic Co-pilot Recommendation:**
> Bundle the **Cold Brew Citrus Tonic** (89% margin) with the **Wood-Fired Margherita** as a "Lunch Express Duo" to lift Average Order Value by an estimated **₹110 per ticket**.`,

  "slow-moving dishes": `### ⚠️ Low-Velocity Menu Items (Requires Attention)

Our AI scan detected 3 items with under 10 weekly orders and sub-optimal margins:

- **1. Lobster Thermidor (₹2,800)**
  - *Velocity:* 4 orders / week
  - *Diagnosis:* High price hurdle for casual dine-in.
  - *Recommendation:* Run as a Friday/Saturday weekend special with paired mocktail.

- **2. Roasted Beet Carpaccio (₹490)**
  - *Velocity:* 7 orders / week
  - *Diagnosis:* Appetizer description lacks sensory flavor appeal.
  - *Recommendation:* Rewrite description via **AI Menu Writer** emphasizing goat cheese crumble & candied walnut crunch.

- **3. Traditional Minestrone (₹380)**
  - *Velocity:* 9 orders / week
  - *Recommendation:* Replace with a seasonal roasted pumpkin bisque for Autumn.`,

  "customer feedback summary": `### 🛡️ Guest Sentiment & Shield Report (Live)

**Overall Customer Score:** **4.88 / 5.0 ★** *(320 interactions)*

- **Public Google 5-Star Conversions:** **164 reviews posted**
- **Private Complaints Shielded:** **19 issues caught & resolved**

#### Key Themes Identified:
- **Praised:** Truffle Risotto flavor balance, friendly floor host, aesthetic interior lighting.
- **Flagged to Kitchen:** 2 notes regarding risotto delivery delays during Friday 8:30 PM rush (prep station 2).
- **Resolution Rate:** 15 of 19 complaints marked **Resolved** with guest follow-up.`,

  "weekend sales comparison": `### 📊 Weekend Performance (Friday – Sunday)

- **Gross Revenue:** **₹3,18,450** (+18.4% vs previous weekend)
- **Table Covers:** **614 guests**
- **Average Ticket Size:** **₹1,420** (+8.2% uplift via AI Upsell suggestions)
- **Peak Hour:** Saturday 8:15 PM – 9:45 PM (Full occupancy + 18 min waitlist)

> 💡 **Staffing Tip for Upcoming Weekend:**
> Schedule 1 additional floor runner between 7:30 PM and 10:00 PM on Saturday to reduce table turnover time by ~6 minutes.`,

  default: `### 🤖 DineFlow Hospitality Co-pilot

I have analyzed your operational telemetry. Here is a live summary:
- **Kitchen Speed:** Average prep time is **16.4 mins** (optimal).
- **Occupancy:** 14 of 24 dining tables active.
- **High-Margin Special:** Chef's Special Burrata running at 81% gross margin.

Would you like me to forecast dinner covers, generate a promotional WhatsApp announcement, or review table turn speed?`,
};

export function CopilotDrawer() {
  const { copilotOpen, setCopilotOpen, toggleCopilot } = useUIStore();
  const { tenantName } = useTenantDataStore();

  const [briefingExpanded, setBriefingExpanded] = React.useState(true);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "copilot",
      content: `### Good morning, ${tenantName || "Team"}! ☕\n\nI am your **Hospitality AI Co-pilot**. Telemetry is fully synced across your Live KDS, table turn times, and customer reviews. Ask me anything about revenue, kitchen speed, or menu performance.`,
      timestamp: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle sending a query
  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response latency
    await new Promise((r) => setTimeout(r, 750));

    const clean = text.toLowerCase();
    let responseText = MOCK_AI_RESPONSES.default;
    for (const key of Object.keys(MOCK_AI_RESPONSES)) {
      if (clean.includes(key)) {
        responseText = MOCK_AI_RESPONSES[key];
        break;
      }
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: "copilot",
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "msg-welcome-reset",
        sender: "copilot",
        content: `### Session Reset ✨\nHow can I assist your operations today? Choose a quick-action chip or type any query.`,
        timestamp: "Just now",
      },
    ]);
  };

  return (
    <>
      {/* Global Floating Trigger (Bottom-Right) */}
      <button
        onClick={toggleCopilot}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
        aria-label="Open AI Co-pilot (⌘J)"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300" />
        </span>
        <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
        <span>AI Co-pilot</span>
        <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono">
          ⌘J
        </span>
      </button>

      {/* Slide-Over Drawer Overlay */}
      {copilotOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setCopilotOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-50 duration-200"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6">
            <div className="w-screen max-w-md sm:max-w-lg md:max-w-xl bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 text-white shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Hospitality AI Co-pilot
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Gemini 2.0 Active
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Executive briefings & real-time operational insights</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearChat}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Clear Conversation"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCopilotOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Close Co-pilot"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Conversation Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Morning Executive Briefing Card */}
                <div className="rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40 dark:from-[#131126] dark:via-[#0f1424] dark:to-[#0c101c] p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      <span className="text-xs font-bold text-violet-900 dark:text-violet-300">
                        Morning Executive Briefing
                      </span>
                    </div>
                    <button
                      onClick={() => setBriefingExpanded(!briefingExpanded)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      {briefingExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {briefingExpanded && (
                    <div className="space-y-3 pt-1 text-xs">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Yesterday Sales</span>
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">₹68,450</span>
                          <span className="text-[9px] text-emerald-500 block font-semibold">+14.2%</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Top Dish</span>
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs truncate block">Truffle Risotto</span>
                          <span className="text-[9px] text-slate-400 block">42 orders</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Table Turn</span>
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">41 mins</span>
                          <span className="text-[9px] text-emerald-500 block font-semibold">3.2 turns</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-violet-500/10 text-violet-800 dark:text-violet-300 text-[11px] leading-relaxed">
                        <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                        <span>
                          <strong>Kitchen Observation:</strong> Friday dinner rush peaked 25 mins earlier than usual. Pre-portioning garlic toast cuts 4 mins off Appetizer prep station tickets.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick-Action Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quick Diagnostics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_QUERIES.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => handleSend(chip)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700/60"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="space-y-4 pt-2">
                  {messages.map((msg) => {
                    const isUser = msg.sender === "user";
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {!isUser && (
                          <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                            <Bot className="h-4 w-4" />
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                            isUser
                              ? "bg-emerald-600 text-white rounded-br-xs shadow-md"
                              : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs"
                          }`}
                        >
                          {/* Formatted content */}
                          <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                          <div
                            className={`text-[10px] mt-1.5 text-right opacity-60 ${
                              isUser ? "text-emerald-100" : "text-slate-400"
                            }`}
                          >
                            {msg.timestamp}
                          </div>
                        </div>

                        {isUser && (
                          <div className="h-7 w-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-1">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div className="flex gap-2.5 items-center text-xs text-slate-400 pl-9">
                      <div className="flex gap-1 items-center bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                        <span className="ml-1 text-[11px]">Analyzing restaurant telemetry...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Co-pilot about sales, slow dishes, staff shifts..."
                    className="flex-1 text-xs sm:text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  />
                  <Button
                    type="submit"
                    variant="glow"
                    size="sm"
                    className="h-11 px-4 rounded-xl"
                    disabled={!inputValue.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Hospitality Co-pilot synthesizes live POS, KDS, inventory, and Google Review data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
