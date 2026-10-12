"use client";

import * as React from "react";
import {
  BellRing,
  Wifi,
  MessageCircle,
  Copy,
  Check,
  GlassWater,
  Utensils,
  Sparkles,
  Receipt,
  HelpCircle,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface CustomerServiceHubProps {
  tableName: string;
  restaurantName: string;
  onCallWaiter: (reason?: string) => void;
  onOpenWhatsApp: () => void;
}

export function CustomerServiceHub({
  tableName,
  restaurantName,
  onCallWaiter,
  onOpenWhatsApp,
}: CustomerServiceHubProps) {
  const { addToast } = useToast();
  const [copiedWifi, setCopiedWifi] = React.useState(false);
  const [activeRequest, setActiveRequest] = React.useState<string | null>(null);

  const handleCopyWifi = () => {
    navigator.clipboard?.writeText("dineinluxury");
    setCopiedWifi(true);
    addToast("info", "Wi-Fi Password Copied", "Password 'dineinluxury' copied to clipboard!");
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleServiceClick = (title: string, detail: string) => {
    setActiveRequest(title);
    onCallWaiter(title);
    setTimeout(() => setActiveRequest(null), 3000);
  };

  const quickServices = [
    {
      id: "water",
      title: "Fresh Drinking Water",
      desc: "Water carafe or fresh glasses",
      icon: GlassWater,
      color: "from-sky-500 to-blue-600",
    },
    {
      id: "cutlery",
      title: "Cutlery & Extra Napkins",
      desc: "Forks, spoons, tissue napkins",
      icon: Utensils,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "clean",
      title: "Table Clearing & Clean",
      desc: "Crumb wipe or plate clearing",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: "bill",
      title: "Bring Final Bill",
      desc: "Ready to settle payment at table",
      icon: Receipt,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-4 pt-4 animate-in fade-in duration-200">
      {/* Service Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Hospitality Concierge
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
              Table Services & Help
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Direct steward paging & dining assistance for <strong>{tableName}</strong> at {restaurantName}.
            </p>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <BellRing className="h-6 w-6 animate-pulse" />
          </div>
        </div>

        {/* Primary Call Waiter Action */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <Button
            type="button"
            onClick={() => handleServiceClick("General Waiter Assistance", "Assistance requested")}
            variant="glow"
            className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2"
          >
            <BellRing className="h-4 w-4" />
            <span>Alert Steward for {tableName}</span>
          </Button>
        </div>
      </div>

      {/* 1-Tap Quick Paging Grid */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white px-1">
          Instant Steward Paging (1-Tap)
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {quickServices.map((svc) => {
            const Icon = svc.icon;
            const isSent = activeRequest === svc.title;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => handleServiceClick(svc.title, svc.desc)}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between ${
                  isSent
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${svc.color} text-white flex items-center justify-center shadow-xs`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSent && (
                    <Badge variant="glow" size="sm" className="text-[9px]">
                      Alerted ✓
                    </Badge>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {svc.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {svc.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guest Wi-Fi Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Wifi className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">High-Speed Guest Wi-Fi</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Complimentary 5G network</p>
            </div>
          </div>
          <Badge variant="outline" size="sm" className="text-[10px] text-sky-600 border-sky-500/30">
            Connected
          </Badge>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Network: GrandBistro_Guest
            </span>
            <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
              Password: dineinluxury
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopyWifi}
            className="h-7 px-2.5 text-xs font-bold rounded-lg"
          >
            {copiedWifi ? (
              <>
                <Check className="h-3 w-3 text-emerald-500 mr-1" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Direct WhatsApp Concierge Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Concierge</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Chat directly with manager & chef
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenWhatsApp}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Chat</span>
        </button>
      </div>
    </div>
  );
}
