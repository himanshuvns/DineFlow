"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Info,
  RotateCcw,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { usePlatformStore } from "@/lib/stores/platform-store";

export default function PlatformFeatureFlagsPage() {
  const { toast } = useToast();
  const {
    featureFlags,
    clients,
    fetchFeatureFlags,
    fetchClients,
    togglePlatformDefaultFlag,
    setClientFeatureOverride,
  } = usePlatformStore();

  React.useEffect(() => {
    fetchFeatureFlags();
    fetchClients();
  }, [fetchFeatureFlags, fetchClients]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const filteredFlags = featureFlags.filter((f) => {
    const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleGlobalFlag = (key: string, currentVal: boolean, name: string) => {
    togglePlatformDefaultFlag(key);
    toast({
      title: "Platform Default Updated",
      description: `${name} is now ${!currentVal ? "ENABLED" : "DISABLED"} globally for new workspaces.`,
    });
  };

  const handleToggleTenantOverride = (
    clientId: string,
    clientName: string,
    featureKey: string,
    currentEnabled: boolean
  ) => {
    const newEnabled = !currentEnabled;
    setClientFeatureOverride(clientId, featureKey, newEnabled);
    toast({
      title: "Tenant Override Saved",
      description: `${featureKey} explicitly set to ${newEnabled ? "ENABLED" : "DISABLED"} for ${clientName}.`,
    });
  };

  // Count total overrides
  const totalOverridesCount = clients.reduce(
    (sum, c) => sum + Object.keys(c.featureOverrides || {}).length,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              Feature Flags & Rollout Control
            </h1>
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
              Live Gate
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Control platform-wide module accessibility, progressive rollouts, and tenant-specific feature overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700">
            <Zap className="mr-1 h-3 w-3 text-amber-500" />
            {featureFlags.length} Global Flags
          </Badge>
          <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700">
            {totalOverridesCount} Active Tenant Overrides
          </Badge>
        </div>
      </div>

      {/* Global Flags Grid */}
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Global Feature Catalog & Defaults
          </h2>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
            >
              <option value="all">All Categories</option>
              <option value="core">Core Platform</option>
              <option value="hotel">Hotel PMS</option>
              <option value="growth">Growth & Messaging</option>
              <option value="ai">AI Studio</option>
              <option value="compliance">Tax & Compliance</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFlags.map((flag) => (
            <Card
              key={flag.key}
              className="border-neutral-200/80 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-1 text-[10px] uppercase font-bold tracking-wider"
                    >
                      {flag.category}
                    </Badge>
                    <CardTitle className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {flag.name}
                    </CardTitle>
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() =>
                      handleToggleGlobalFlag(flag.key, flag.platformDefault, flag.name)
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      flag.platformDefault
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        flag.platformDefault ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="font-mono text-[10px] text-neutral-600 dark:text-neutral-400">
                  key: {flag.key}
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {flag.description}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80 pt-2 text-[11px]">
                  <span className="text-neutral-500 dark:text-neutral-400">Default Onboard Status:</span>
                  <span
                    className={`font-semibold ${
                      flag.platformDefault
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-neutral-500"
                    }`}
                  >
                    {flag.platformDefault ? "Enabled Globally" : "Disabled by Default"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Per-Tenant Override Matrix */}
      <Card className="border-neutral-200/80 dark:border-neutral-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Tenant Feature Override Matrix
              </CardTitle>
              <CardDescription className="text-xs">
                Grant early access to preview modules or restrict capabilities per enterprise contract
              </CardDescription>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant..."
                className="h-8 pl-8 text-xs bg-white dark:bg-neutral-900"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 min-w-[200px]">Tenant Client</th>
                  <th className="px-4 py-3">Plan</th>
                  {featureFlags.map((flag) => (
                    <th key={flag.key} className="px-3 py-3 text-center whitespace-nowrap">
                      {flag.name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {clients
                  .filter((c) =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.city.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-neutral-50/75 dark:hover:bg-neutral-900/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {client.name}
                        </div>
                        <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                          {client.city} · {client.id}
                        </div>
                      </td>
                      <td className="px-4 py-3 uppercase text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
                        {client.plan.replace("_", " ")}
                      </td>

                      {featureFlags.map((flag) => {
                        const hasExplicitOverride =
                          client.featureOverrides &&
                          client.featureOverrides[flag.key] !== undefined;
                        const isEnabled = hasExplicitOverride
                          ? client.featureOverrides[flag.key]
                          : flag.platformDefault;

                        return (
                          <td key={flag.key} className="px-3 py-3 text-center">
                            <button
                              onClick={() =>
                                handleToggleTenantOverride(
                                  client.id,
                                  client.name,
                                  flag.key,
                                  isEnabled
                                )
                              }
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isEnabled
                                  ? hasExplicitOverride
                                    ? "bg-purple-600 dark:bg-purple-500"
                                    : "bg-emerald-600 dark:bg-emerald-500"
                                  : "bg-neutral-200 dark:bg-neutral-700"
                              }`}
                              title={
                                hasExplicitOverride
                                  ? `Explicitly overridden: ${isEnabled ? "Enabled" : "Disabled"}`
                                  : `Inherited default: ${flag.platformDefault ? "Enabled" : "Disabled"}`
                              }
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isEnabled ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                            {hasExplicitOverride && (
                              <div className="text-[9px] font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                                override
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
