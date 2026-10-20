"use client";

import * as React from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  Hotel,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useInventoryStore, InventorySettings } from "@/lib/stores/inventory-store";
import { cn } from "@/lib/utils";

export default function InventorySettingsPage() {
  const { toast } = useToast();
  const settings = useInventoryStore((s) => s.settings);
  const updateSettings = useInventoryStore((s) => s.updateSettings);

  const [formState, setFormState] = React.useState<InventorySettings>(settings);

  const handleSave = async () => {
    await updateSettings(formState);
    toast({
      title: "Settings Saved",
      description: "Inventory policies and deduction triggers have been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              Inventory Policies & Automation Rules
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Configure recipe BOM deduction triggers, negative stock blocking, and hotel department policies
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          <span>Save Policy Settings</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Deduction Triggers & Negative Stock */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Recipe Stock Deduction Policy
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Choose the exact lifecycle event when raw ingredients are deducted from inventory.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setFormState({ ...formState, deductionTrigger: "on_order_preparing" })}
                className={cn(
                  "p-3.5 rounded-xl border cursor-pointer transition-all",
                  formState.deductionTrigger === "on_order_preparing"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-white shadow-2xs"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                )}
              >
                <strong className="block text-xs">On Order Preparing</strong>
                <p className="text-[11px] text-slate-500 mt-1">
                  Deducts stock immediately when KDS chef starts preparing the ticket.
                </p>
              </div>

              <div
                onClick={() => setFormState({ ...formState, deductionTrigger: "on_order_paid" })}
                className={cn(
                  "p-3.5 rounded-xl border cursor-pointer transition-all",
                  formState.deductionTrigger === "on_order_paid"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-white shadow-2xs"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                )}
              >
                <strong className="block text-xs">On Order Paid / Settled</strong>
                <p className="text-[11px] text-slate-500 mt-1">
                  Deducts stock only when guest bill is finalized and paid.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Strict Recipe BOM Enforcement
                </span>
                <span className="text-[11px] text-slate-500">
                  Block ordering dishes if ingredient BOM is not configured
                </span>
              </div>
              <Switch
                checked={formState.strictStockEnforcement}
                onCheckedChange={(checked) => setFormState({ ...formState, strictStockEnforcement: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Block Orders on 0 Stock (Prevent Negative Inventory)
                </span>
                <span className="text-[11px] text-slate-500">
                  Strictly marks menu dishes sold-out when raw materials reach 0
                </span>
              </div>
              <Switch
                checked={formState.negativeStockPolicy === "strictly_block"}
                onCheckedChange={(checked) =>
                  setFormState({
                    ...formState,
                    negativeStockPolicy: checked ? "strictly_block" : "allow_with_warning",
                  })
                }
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Thresholds & Hotel Amenities */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Automated Alert Windows
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure proactive warning thresholds for stockout prevention.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Low Stock Warning Window (Days)"
                type="number"
                value={formState.lowStockAlertThresholdDays}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    lowStockAlertThresholdDays: parseInt(e.target.value) || 1,
                  })
                }
              />
              <Input
                label="Expiry Radar Alert (Days in Advance)"
                type="number"
                value={formState.expiryAlertDays}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    expiryAlertDays: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Hotel className="h-4 w-4 text-cyan-500" />
              Hotel & Resort Department Stock Segregation
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Enable Hotel Department Billing
                </span>
                <span className="text-[11px] text-slate-500">
                  Segregate Mini-Bar, Housekeeping Linen & Banquet stock
                </span>
              </div>
              <Switch
                checked={formState.enableHotelDepartmentBilling}
                onCheckedChange={(checked) =>
                  setFormState({ ...formState, enableHotelDepartmentBilling: checked })
                }
              />
            </div>

            <Input
              label="Default Intake Location for GRN"
              value={formState.defaultStorageLocation}
              onChange={(e) => setFormState({ ...formState, defaultStorageLocation: e.target.value })}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
