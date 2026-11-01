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
  Database,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useInventoryStore, InventorySettings } from "@/lib/stores/inventory-store";
import { cn } from "@/lib/utils";

export default function InventorySettingsPage() {
  const { toast } = useToast();
  const settings = useInventoryStore((s) => s.settings);
  const updateSettings = useInventoryStore((s) => s.updateSettings);
  const resetTenantInventory = useInventoryStore((s) => s.resetTenantInventory);
  const loadDemoInventory = useInventoryStore((s) => s.loadDemoInventory);
  const itemCount = useInventoryStore((s) => s.items.length);

  const [formState, setFormState] = React.useState<InventorySettings>(settings);
  const [resetModalOpen, setResetModalOpen] = React.useState(false);
  const [loadDemoModalOpen, setLoadDemoModalOpen] = React.useState(false);

  const handleSave = async () => {
    await updateSettings(formState);
    toast({
      title: "Settings Saved",
      description: "Inventory policies and deduction triggers have been updated.",
    });
  };

  const handleConfirmReset = () => {
    resetTenantInventory();
    setResetModalOpen(false);
    toast({
      title: "Catalog Reset to Clean Slate",
      description: "All stock items, movements, and suppliers have been cleared for this tenant.",
    });
  };

  const handleConfirmLoadDemo = () => {
    loadDemoInventory();
    setLoadDemoModalOpen(false);
    toast({
      title: "Sample Hotel Catalog Loaded",
      description: "Sample demo items and suppliers have been loaded for testing.",
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

        {/* Section 3: Data Management & Catalog Slate */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-500" />
                Catalog Data Management & Multi-Tenant Reset
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage your hotel&apos;s inventory isolation, reset to a completely clean slate, or load sample hotel items for testing.
              </p>
            </div>
            <Badge variant="outline" className="self-start sm:self-auto text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Current Active Items: {itemCount}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clean Slate Reset */}
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-rose-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Reset Catalog to Clean Slate (0 Items)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Permanently clears all inventory items, movements, and purchase orders for this hotel workspace.
                  Use this to wipe demo data and start fresh before importing your own Excel or CSV catalog.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetModalOpen(true)}
                className="border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer self-start gap-1.5 text-xs font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Reset to Empty Slate</span>
              </Button>
            </div>

            {/* Load Sample Demo Data */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Load Sample Hotel Demo Catalog
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Populate 8 sample restaurant pantry goods (Risotto, Truffle paste, Salmon, Olive oil) and vendors for sandbox testing and staff training.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setLoadDemoModalOpen(true)}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer self-start gap-1.5 text-xs font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Load Sample Demo Data</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Catalog to Empty Slate?"
        description="This will clear all inventory items, stock movements, and purchase records for this workspace."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmReset} className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Confirm & Reset Catalog</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                Warning: This action will set your items catalog to 0 items.
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                You will have a completely empty stock ledger. You can then import your real hotel inventory from an Excel spreadsheet or CSV file.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Load Demo Data Confirmation Modal */}
      <Modal
        isOpen={loadDemoModalOpen}
        onClose={() => setLoadDemoModalOpen(false)}
        title="Load Sample Hotel Demo Catalog?"
        description="Populates the catalog with 8 sample restaurant pantry goods, suppliers, and recipes."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setLoadDemoModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmLoadDemo} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Load Sample Data</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            This is helpful for staff demonstrations, testing KDS recipe deduction, and exploring features before adding your property&apos;s live items.
          </p>
        </div>
      </Modal>
    </div>
  );
}
