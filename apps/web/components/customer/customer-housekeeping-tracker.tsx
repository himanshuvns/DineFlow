"use client";

import * as React from "react";
import {
  Bed,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
  Check,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HousekeepingTaskItem {
  id?: string;
  roomNumber?: string;
  taskType?: string;
  title: string;
  priority?: "normal" | "high" | "urgent" | string;
  status: "pending" | "in_progress" | "completed" | string;
  assignedTo?: string;
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

interface CustomerHousekeepingTrackerProps {
  tenantSlug: string;
  roomNumber: string;
  roomDisplay: string;
  onRequestNewService: () => void;
  refreshSignal?: number;
}

export function CustomerHousekeepingTracker({
  tenantSlug,
  roomNumber,
  roomDisplay,
  onRequestNewService,
  refreshSignal = 0,
}: CustomerHousekeepingTrackerProps) {
  const [tasks, setTasks] = React.useState<HousekeepingTaskItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(null);

  const cleanRoomNum = roomNumber.toUpperCase().replace(/^(ROOM-|SUITE-)/, "");

  const fetchTasks = React.useCallback(async () => {
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://api-production-f170.up.railway.app/api/v1"
          : "http://localhost:8080/api/v1");

      const res = await fetch(
        `${apiBase}/public/rooms/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanRoomNum)}/tasks`,
        { cache: "no-store" }
      );

      if (res.ok) {
        const json = await res.json();
        const rawTasks = json.data?.tasks || json.tasks || [];
        if (Array.isArray(rawTasks)) {
          setTasks(rawTasks);
          // Default expand the first active task
          if (!expandedTaskId && rawTasks.length > 0) {
            setExpandedTaskId(rawTasks[0].id || "0");
          }
        }
      }
    } catch (e) {
      console.warn("Housekeeping tasks fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug, cleanRoomNum, expandedTaskId]);

  // Initial fetch and 4-second live polling
  React.useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 4000);
    return () => clearInterval(interval);
  }, [fetchTasks, refreshSignal]);

  // Filter tasks: active tasks (pending or in_progress) or tasks completed in the last 2 hours
  const relevantTasks = tasks.filter((t) => {
    if (t.status === "pending" || t.status === "in_progress") return true;
    if (t.status === "completed") {
      if (!t.completedAt && !t.createdAt) return true;
      const refTime = new Date(t.completedAt || t.createdAt || "").getTime();
      return Date.now() - refTime < 2 * 60 * 60 * 1000;
    }
    return false;
  });

  if (loading && tasks.length === 0) {
    return null;
  }

  if (relevantTasks.length === 0) {
    return null;
  }

  const activeCount = relevantTasks.filter((t) => t.status !== "completed").length;

  const STEPS = [
    {
      id: "pending",
      label: "Request Placed",
      sublabel: "Housekeeping desk alerted • In dispatch queue",
      icon: CheckCircle2,
    },
    {
      id: "in_progress",
      label: "Steward Attending",
      sublabel: "Housekeeping steward assigned & attending to your suite",
      icon: Sparkles,
    },
    {
      id: "completed",
      label: "Service Completed",
      sublabel: "Suite serviced & refreshed • Verified by supervisor",
      icon: Check,
    },
  ];

  const getStepIndex = (status: string) => {
    if (status === "completed") return 2;
    if (status === "in_progress") return 1;
    return 0; // pending
  };

  const getElapsedTime = (isoDate?: string) => {
    if (!isoDate) return "Just now";
    const diff = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
    if (diff < 60) return "Just now";
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return (
    <div className="max-w-xl mx-auto px-4 mt-6">
      <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-4 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Bed className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Suite Service Flow
                </h2>
                {activeCount > 0 ? (
                  <Badge variant="glow" size="sm" className="font-mono text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                    {activeCount} Active
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm" className="text-[10px]">
                    All Completed
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Live updates for {roomDisplay}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRequestNewService}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            className="h-8 px-2.5 text-xs text-emerald-400 hover:text-white border-emerald-500/30 hover:bg-emerald-500/20"
          >
            <span>Request<span className="hidden xs:inline"> Service</span></span>
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {relevantTasks.map((task, idx) => {
            const taskId = task.id || String(idx);
            const isExpanded = expandedTaskId === taskId || relevantTasks.length === 1;
            const currentStepIdx = getStepIndex(task.status);
            const isUrgent = task.priority === "urgent" || task.priority === "high";

            return (
              <div
                key={taskId}
                className={cn(
                  "rounded-2xl border transition-all overflow-hidden",
                  isExpanded
                    ? "border-emerald-500/40 bg-slate-950/80 shadow-md"
                    : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                )}
              >
                {/* Accordion Bar */}
                <div
                  onClick={() => setExpandedTaskId(isExpanded ? null : taskId)}
                  className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        task.status === "completed"
                          ? "bg-emerald-400"
                          : task.status === "in_progress"
                          ? "bg-cyan-400 animate-ping"
                          : "bg-amber-400 animate-pulse"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{task.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{getElapsedTime(task.createdAt)}</span>
                        {task.assignedTo && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 flex items-center gap-1 font-medium">
                              <UserCheck className="h-3 w-3" />
                              {task.assignedTo}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        task.status === "completed"
                          ? "success"
                          : task.status === "in_progress"
                          ? "glow"
                          : "warning"
                      }
                      size="sm"
                      className="capitalize text-[10px] font-bold"
                    >
                      {task.status === "in_progress"
                        ? "In Progress"
                        : task.status === "completed"
                        ? "Completed"
                        : "Requested"}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Timeline Flow */}
                {isExpanded && (
                  <div className="px-3.5 pb-4 pt-1 border-t border-slate-800/80 space-y-4">
                    {/* Notes if provided */}
                    {task.notes && (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                        <span className="text-slate-500 font-semibold">Special Instructions: </span>
                        {task.notes}
                      </div>
                    )}

                    {/* Progress Bar / Flow Tracker */}
                    <div className="pt-2">
                      <div className="relative">
                        {/* Connecting track */}
                        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-800 -z-0">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                            style={{
                              width:
                                currentStepIdx === 0
                                  ? "0%"
                                  : currentStepIdx === 1
                                  ? "50%"
                                  : "100%",
                            }}
                          />
                        </div>

                        {/* 3 Steps */}
                        <div className="flex items-start justify-between relative z-10">
                          {STEPS.map((step, sIdx) => {
                            const isDone = currentStepIdx > sIdx;
                            const isCurrent = currentStepIdx === sIdx;
                            const StepIcon = step.icon;

                            return (
                              <div
                                key={step.id}
                                className="flex flex-col items-center text-center max-w-[100px]"
                              >
                                <div
                                  className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                    isDone
                                      ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/30"
                                      : isCurrent
                                      ? "bg-slate-900 border-emerald-400 text-emerald-400 ring-4 ring-emerald-500/20 shadow-md"
                                      : "bg-slate-950 border-slate-800 text-slate-600"
                                  )}
                                >
                                  <StepIcon className="h-4 w-4" />
                                </div>
                                <span
                                  className={cn(
                                    "text-[10px] font-bold mt-2",
                                    isCurrent
                                      ? "text-emerald-400 font-extrabold"
                                      : isDone
                                      ? "text-slate-200"
                                      : "text-slate-500"
                                  )}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Current Step Description Card */}
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                        <p className="text-xs font-semibold text-white">
                          {STEPS[currentStepIdx]?.sublabel}
                        </p>
                        {task.status === "completed" && (
                          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
                            ✓ Your suite has been serviced. Need anything else? Tap &ldquo;Request Service&rdquo; anytime.
                          </p>
                        )}
                        {task.status === "in_progress" && task.assignedTo && (
                          <p className="text-[10px] text-cyan-400 font-medium mt-0.5">
                            Steward {task.assignedTo} is attending to your room.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
