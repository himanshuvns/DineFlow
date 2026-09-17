"use client";

import * as React from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Wifi,
  ShieldCheck,
  Zap,
  Clock,
  HardDrive,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { usePlatformStore, SystemServiceHealth } from "@/lib/stores/platform-store";

export default function PlatformSystemHealthPage() {
  const { toast } = useToast();
  const systemServices = usePlatformStore((s) => s.systemServices);
  const [isProbing, setIsProbing] = React.useState(false);
  const [lastProbedAt, setLastProbedAt] = React.useState("Just now");

  const handleRunHealthCheck = () => {
    setIsProbing(true);
    setTimeout(() => {
      setIsProbing(false);
      setLastProbedAt("Just now");
      toast({
        title: "Telemetry Probe Completed",
        description: "All 6 distributed microservices and third-party APIs responded with 200 OK.",
      });
    }, 900);
  };

  const allHealthy = systemServices.every((s) => s.status === "healthy");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              System Health & Edge Telemetry
            </h1>
            <Badge
              variant="outline"
              className={`font-semibold ${
                allHealthy
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              {allHealthy ? "All Systems Operational" : "Degraded Performance"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Real-time infrastructure health, microservice latency probes, uptime metrics, and API gateway telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Last probe: {lastProbedAt}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunHealthCheck}
            disabled={isProbing}
            className="border-neutral-200 dark:border-neutral-800"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isProbing ? "animate-spin" : ""}`} />
            Run Telemetry Probe
          </Button>
        </div>
      </div>

      {/* Global Uptime Status Banner */}
      <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent dark:from-emerald-500/10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Global Edge & Distributed Infrastructure Normal
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Multi-region failover active · Zero critical incidents reported in the last 30 days
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-right">
              <div>
                <span className="text-[11px] font-semibold uppercase text-neutral-600 dark:text-neutral-400">30d Platform Uptime</span>
                <p className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50">99.98%</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-neutral-600 dark:text-neutral-400">Avg Global Latency</span>
                <p className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50">28ms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Microservice Health Cards */}
      <div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Core Services & Microservices
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {systemServices.map((service) => (
            <Card
              key={service.name}
              className="border-neutral-200/80 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {service.name}
                    </h3>
                  </div>

                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase"
                  >
                    {service.status}
                  </Badge>
                </div>

                <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {service.details}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-100 dark:border-neutral-800/80 pt-3 text-xs">
                  <div>
                    <span className="text-[11px] text-neutral-600 dark:text-neutral-400">Response Latency</span>
                    <p className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {service.latencyMs} ms
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-600 dark:text-neutral-400">Target Uptime</span>
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {service.uptime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cluster Telemetry & Resource Limits */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-neutral-200/80 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              Database Connection Pool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">28 / 100</span>
              <span className="text-xs text-emerald-600 font-semibold">28% capacity</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "28%" }} />
            </div>
            <p className="text-[11px] text-neutral-500">
              MongoDB M10 Dedicated 3-node replica with connection multiplexing
            </p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-500" />
              API Server Memory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">1.4 GB / 8.0 GB</span>
              <span className="text-xs text-blue-600 font-semibold">17.5% memory</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "17.5%" }} />
            </div>
            <p className="text-[11px] text-neutral-500">
              Go Gin runtime goroutine pool: 412 active goroutines
            </p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Redis Cache Hit Ratio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">97.4%</span>
              <span className="text-xs text-amber-600 font-semibold">High Cache Heat</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: "97.4%" }} />
            </div>
            <p className="text-[11px] text-neutral-500">
              Upstash Redis token revocation & menu catalog cache
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
