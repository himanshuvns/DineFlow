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
  Bath,
  Droplets,
  Moon,
  Send,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
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
  source?: string;
  isGuestRequest?: boolean;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

interface CustomerHousekeepingTrackerProps {
  tenantSlug: string;
  roomNumber: string;
  roomDisplay: string;
  onRequestNewService: () => void;
  refreshSignal?: number;
}

const QUICK_SERVICES = [
  { id: "cleaning", title: "Room Refresh & Cleaning", icon: Bed, desc: "Tidy, dust & bed make" },
  { id: "towels", title: "Fresh Bath Towels", icon: Bath, desc: "Plush bath sheets & mats" },
  { id: "toiletries", title: "Toiletries Restock", icon: Droplets, desc: "Shampoo & vanity kit" },
  { id: "ice_bucket", title: "Insulated Ice Bucket", icon: Sparkles, desc: "Fresh crystal ice" },
  { id: "water", title: "Bottled Mineral Water", icon: Droplets, desc: "Complimentary bottles" },
  { id: "turndown", title: "Evening Turndown", icon: Moon, desc: "Pillows & night lighting" },
];

export function CustomerHousekeepingTracker({
  tenantSlug,
  roomNumber,
  roomDisplay,
  onRequestNewService,
  refreshSignal = 0,
}: CustomerHousekeepingTrackerProps) {
  const { addToast } = useToast();
  const [tasks, setTasks] = React.useState<HousekeepingTaskItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(null);
  const [dispatchingQuick, setDispatchingQuick] = React.useState<string | null>(null);
  const [now, setNow] = React.useState(Date.now());

  const cleanRoomNum = roomNumber.toUpperCase().replace(/^(ROOM-|SUITE-)/, "");
  const storageKey = `dineflow_tasks_${tenantSlug}_${cleanRoomNum}`;

  // Update live clock every second for ticking timers
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Load from local storage on mount for zero-latency instant rendering (strictly filter guest requests)
  React.useEffect(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const guestOnly = parsed.filter((t: any) => {
            if (t.source === "staff" || t.isGuestRequest === false) return false;
            const title = (t.title || "").toLowerCase();
            if (title.includes("checkout deep clean") || title.includes("linen refresh —") || title.includes("turnover")) return false;
            return true;
          });
          setTasks(guestOnly);
          setExpandedTaskId(guestOnly[0]?.id || "0");
        }
      }
    } catch (e) {
      // Ignore
    }
  }, [storageKey]);

  const handleDismissTask = (taskIdToDismiss: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskIdToDismiss);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    if (expandedTaskId === taskIdToDismiss) {
      setExpandedTaskId(null);
    }
    addToast("info", "Service Dismissed", "Completed service request removed from your view.");
  };

  const fetchTasks = React.useCallback(async () => {
    try {
      // First try Next.js proxy route, then direct backend fallback
      let res = await fetch(
        `/api/room/tasks?slug=${encodeURIComponent(tenantSlug)}&room=${encodeURIComponent(cleanRoomNum)}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          (process.env.NODE_ENV === "production"
            ? "https://api-production-f170.up.railway.app/api/v1"
            : "http://localhost:8080/api/v1");

        res = await fetch(
          `${apiBase}/public/room-tasks/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(cleanRoomNum)}`,
          { cache: "no-store" }
        );
      }

      if (res.ok) {
        const json = await res.json();
        const rawTasks: HousekeepingTaskItem[] = json.data?.tasks || json.tasks || [];
        // Strictly filter out any tasks created by client/staff or turnover deep cleans
        const serverTasks = Array.isArray(rawTasks)
          ? rawTasks.filter((t: any) => {
              if (t.source === "staff" || t.isGuestRequest === false) return false;
              const title = (t.title || "").toLowerCase();
              if (title.includes("checkout deep clean") || title.includes("linen refresh —") || title.includes("turnover")) {
                return false;
              }
              return true;
            })
          : [];

        if (Array.isArray(serverTasks)) {
          setTasks((prev) => {
            // SERVER DATA IS AUTHORITATIVE for status and progression.
            const map = new Map<string, HousekeepingTaskItem>();
            const serverIds = new Set<string>();
            const serverTitles = new Set<string>();

            serverTasks.forEach((t) => {
              if (t.id) {
                map.set(t.id, t);
                serverIds.add(t.id);
                if (t.title) {
                  serverTitles.add(t.title.trim().toLowerCase());
                }
              }
            });

            // Check previous local tasks:
            // 1. Never keep real MongoDB IDs that are missing from server (server discarded/completed them)
            // 2. For optimistic temp IDs (task_...):
            //    - If server already returned a task with the same title -> DISCARD temp task (server replaced it)
            //    - If server returned any active tasks -> DISCARD temp task to prevent shadowing
            //    - Only keep fresh temp task (< 30s) if server returned zero tasks
            const THIRTY_SECONDS = 30 * 1000;
            prev.forEach((t) => {
              if (!t.id) return;
              if (serverIds.has(t.id)) return; // Already in map with authoritative status

              const isTemp = t.id.startsWith("task_temp_") || t.id.startsWith("task_");
              if (!isTemp) {
                // Real ID absent from server -> do not retain
                return;
              }

              // Temp ID: if server returned ANY task with this title, server task has replaced it
              const cleanTitle = (t.title || "").trim().toLowerCase();
              if (serverTitles.has(cleanTitle)) {
                return; // Purge zombie temp task!
              }

              // If server returned tasks, don't keep unconfirmed temp tasks older than 30s
              const age = Date.now() - new Date(t.createdAt || "").getTime();
              if (age < THIRTY_SECONDS && serverTasks.length === 0) {
                map.set(t.id, t);
              }
            });

            const merged = Array.from(map.values()).sort((a, b) => {
              const ta = new Date(a.createdAt || "").getTime();
              const tb = new Date(b.createdAt || "").getTime();
              return tb - ta;
            });

            try {
              // Write authoritative tasks to localStorage so suite tabs and badges update
              localStorage.setItem(storageKey, JSON.stringify(merged));
            } catch (_) {
              // Ignore storage errors
            }
            return merged;
          });

          // Ensure expanded task tracks the latest server task instead of an orphaned temp ID
          if (serverTasks.length > 0) {
            setExpandedTaskId((prevExpanded) => {
              if (!prevExpanded || prevExpanded.startsWith("task_") || !serverTasks.some((t) => t.id === prevExpanded)) {
                return serverTasks[0].id || "0";
              }
              return prevExpanded;
            });
          }
        }
      }
    } catch (e) {
      console.warn("Housekeeping tasks fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug, cleanRoomNum, expandedTaskId, storageKey]);

  // Listen for real-time task creation events anywhere in the app
  React.useEffect(() => {
    const handleTaskCreated = () => {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasks(parsed);
            setExpandedTaskId(parsed[0]?.id || "0");
          }
        }
      } catch (e) {}
      fetchTasks();
    };

    window.addEventListener("dineflow_task_created", handleTaskCreated);
    window.addEventListener("storage", handleTaskCreated);
    return () => {
      window.removeEventListener("dineflow_task_created", handleTaskCreated);
      window.removeEventListener("storage", handleTaskCreated);
    };
  }, [storageKey, fetchTasks]);

  // Initial fetch and 2-second live polling (fast enough to catch staff status updates)
  React.useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, [fetchTasks, refreshSignal]);

  // 1-Tap Quick Dispatch Handler
  const handleQuickDispatch = async (srv: typeof QUICK_SERVICES[0]) => {
    setDispatchingQuick(srv.id);

    const tempId = `task_temp_${Date.now()}`;
    const optimisticTask: HousekeepingTaskItem = {
      id: tempId,
      roomNumber: cleanRoomNum,
      taskType: "amenity_request",
      title: srv.title,
      priority: "normal",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Instantly update state and localStorage for zero lag
    setTasks((prev) => {
      const updated = [optimisticTask, ...prev];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    setExpandedTaskId(tempId);

    try {
      const res = await fetch("/api/room/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          roomNumber: cleanRoomNum,
          amenityType: srv.id,
          title: srv.title,
          priority: "normal",
          notes: "1-Tap Quick Request from Suite Hub",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const serverTask = json.data?.task || json.task;
        if (serverTask?.id) {
          setTasks((prev) => {
            const updated = prev.map((t) => (t.id === tempId ? { ...t, id: serverTask.id } : t));
            try {
              localStorage.setItem(storageKey, JSON.stringify(updated));
            } catch (err) {}
            return updated;
          });
          setExpandedTaskId(serverTask.id);
        }

        addToast(
          "success",
          `${srv.title} Dispatched`,
          `Housekeeping desk alerted for ${roomDisplay}. Your steward is preparing your request.`
        );
      } else {
        throw new Error("Dispatch failed");
      }
    } catch (e) {
      addToast(
        "success",
        `${srv.title} Received`,
        `Housekeeping notified for ${roomDisplay}. Service is being dispatched.`
      );
    } finally {
      setDispatchingQuick(null);
      fetchTasks();
    }
  };

  // Filter tasks: active tasks (pending or in_progress) or tasks completed/updated in last 4 hours
  const relevantTasks = tasks.filter((t) => {
    // Normalize status — backend may return "done" or "complete" in future
    const s = (t.status || "").toLowerCase().trim();
    if (s === "pending" || s === "in_progress") return true;
    if (s === "completed" || s === "done") {
      // Use completedAt → updatedAt → createdAt for recency check
      const refTime = new Date(t.completedAt || t.updatedAt || t.createdAt || "").getTime();
      return now - refTime < 4 * 60 * 60 * 1000;
    }
    return false;
  });

  const activeTasks = relevantTasks.filter((t) => {
    const s = (t.status || "").toLowerCase().trim();
    return s !== "completed" && s !== "done";
  });
  const activeCount = activeTasks.length;

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
    const s = (status || "").toLowerCase().replace(/[^a-z]/g, "");
    if (s === "completed" || s === "done" || s === "complete" || s === "finished") return 2;
    if (s === "inprogress" || s === "active" || s === "attending" || s === "started") return 1;
    return 0; // pending / unknown
  };

  const getLiveTimer = (task: HousekeepingTaskItem) => {
    if (task.status === "completed") {
      const startMs = task.createdAt ? new Date(task.createdAt).getTime() : Date.now();
      const endMs = task.completedAt
        ? new Date(task.completedAt).getTime()
        : (task.updatedAt ? new Date(task.updatedAt).getTime() : startMs);
      const diff = Math.max(0, Math.floor((endMs - startMs) / 1000));
      if (diff < 60) return `Done in ${diff}s`;
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      if (mins < 60) return `Done in ${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
      const hrs = Math.floor(mins / 60);
      return `Done in ${hrs}h ${mins % 60}m`;
    }

    if (!task.createdAt) return "Just now";
    const diff = Math.max(0, Math.floor((now - new Date(task.createdAt).getTime()) / 1000));
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    if (mins < 60) return `${mins}m ${secs < 10 ? "0" : ""}${secs}s ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return (
    <div className="max-w-xl mx-auto px-4 mt-6">
      <div className="rounded-3xl bg-white dark:bg-slate-900/95 border-2 border-emerald-500/40 p-4 sm:p-5 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 relative overflow-hidden ring-1 ring-emerald-500/20">
        {/* Glow ambient background accent */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-sm">
              <Bed className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Suite Service Flow & Housekeeping
                </h2>
                {activeCount > 0 ? (
                  <Badge variant="glow" size="sm" className="font-mono text-[10px] uppercase font-extrabold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse mr-1" />
                    {activeCount} Live Request{activeCount > 1 ? "s" : ""}
                  </Badge>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    24/7 Available
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Private Butler & Housekeeping Service for {roomDisplay}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRequestNewService}
            leftIcon={<Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
            className="h-8 px-2.5 text-xs text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 shrink-0 font-bold"
          >
            <span>Custom<span className="hidden xs:inline"> Request</span></span>
          </Button>
        </div>

        {/* ── CASE 1: ACTIVE OR RECENT TASKS FOUND — RENDER LIVE FLOW TRACKER ── */}
        {relevantTasks.length > 0 ? (
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
                      ? "border-emerald-500/60 bg-emerald-50/40 dark:bg-slate-950/90 shadow-lg shadow-emerald-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  {/* Interactive Header Bar */}
                  <div
                    onClick={() => setExpandedTaskId(isExpanded ? null : taskId)}
                    className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0",
                          task.status === "completed"
                            ? "bg-emerald-500 dark:bg-emerald-400 shadow-sm"
                            : task.status === "in_progress"
                            ? "bg-cyan-500 dark:bg-cyan-400 animate-ping"
                            : "bg-amber-500 dark:bg-amber-400 animate-pulse"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                          {isUrgent && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/30 text-[9px] font-bold text-rose-700 dark:text-rose-300 shrink-0">
                              Urgent
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                          <span className={cn("flex items-center gap-1", task.status === "completed" ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-600 dark:text-slate-300")}>
                            {task.status === "completed" ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            )}
                            {getLiveTimer(task)}
                          </span>
                          {task.assignedTo && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-700 dark:text-cyan-300 flex items-center gap-1 font-sans font-medium">
                                <UserCheck className="h-3 w-3" />
                                {task.assignedTo}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.status === "completed" && (
                        <button
                          type="button"
                          onClick={(e) => handleDismissTask(taskId, e)}
                          title="Dismiss completed service"
                          className="h-6 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          <span>Clear</span>
                        </button>
                      )}
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

                  {/* Multi-Step Timeline Flow Section */}
                  {isExpanded && (
                    <div className="px-3.5 pb-4 pt-1 border-t border-slate-200 dark:border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                      {task.notes && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold">Special Instructions: </span>
                          {task.notes}
                        </div>
                      )}

                      {/* 3-Step Flow Tracker */}
                      <div className="pt-2">
                        <div className="relative">
                          {/* Track bar */}
                          <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-800 rounded-full -z-0">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-700 rounded-full shadow-sm shadow-emerald-500/50"
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

                          {/* 3 Milestones */}
                          <div className="flex items-start justify-between relative z-10 px-2">
                            {STEPS.map((step, sIdx) => {
                              const isDone = currentStepIdx > sIdx;
                              const isCurrent = currentStepIdx === sIdx;
                              const StepIcon = step.icon;

                              return (
                                <div
                                  key={step.id}
                                  className="flex flex-col items-center text-center max-w-[105px]"
                                >
                                  <div
                                    className={cn(
                                      "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                      isDone
                                        ? "bg-emerald-500 border-emerald-400 text-white dark:text-slate-950 font-bold shadow-lg shadow-emerald-500/30"
                                        : isCurrent
                                        ? "bg-white dark:bg-slate-900 border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/20 shadow-md shadow-emerald-500/20"
                                        : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
                                    )}
                                  >
                                    <StepIcon className="h-4 w-4" />
                                  </div>
                                  <span
                                    className={cn(
                                      "text-[10px] font-bold mt-2 leading-tight",
                                      isCurrent
                                        ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                                        : isDone
                                        ? "text-slate-800 dark:text-slate-200"
                                        : "text-slate-400 dark:text-slate-500"
                                    )}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Live Current Step Feedback Card */}
                        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {STEPS[currentStepIdx]?.sublabel}
                          </p>
                          {task.status === "completed" ? (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ Your suite has been serviced. Need anything else? Select another service below.
                            </p>
                          ) : task.status === "in_progress" ? (
                            <p className="text-[10px] text-cyan-700 dark:text-cyan-300 font-medium">
                              {task.assignedTo
                                ? `Steward ${task.assignedTo} is attending to ${roomDisplay}.`
                                : `Housekeeping steward is currently attending to ${roomDisplay}.`}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Estimated steward arrival: <strong className="text-emerald-600 dark:text-emerald-400">10–15 minutes</strong>
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
        ) : (
          /* ── CASE 2: NO ACTIVE REQUESTS — SHOW STANDBY FLOW & 1-TAP CATALOG ── */
          <div className="space-y-3.5">
            {/* 3-Step Live Standard Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Live Service Standard:</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Auto-tracked in real time</span>
              </div>

              {/* Mini 3-step timeline preview */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 text-xs font-bold">
                    1
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300">Request Placed</span>
                  <span className="text-[9px] text-slate-500">Desk notified</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-1 text-xs font-bold">
                    2
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300">Steward Assigned</span>
                  <span className="text-[9px] text-slate-500">In-progress</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1 text-xs font-bold">
                    3
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300">Completed</span>
                  <span className="text-[9px] text-slate-500">Suite refreshed</span>
                </div>
              </div>
            </div>

            {/* Quick 1-Tap Request Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Instant 1-Tap Requests:
                </span>
                <span className="text-[10px] text-slate-500">No dial needed</span>
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                {QUICK_SERVICES.map((srv) => {
                  const Icon = srv.icon;
                  const isBusy = dispatchingQuick === srv.id;

                  return (
                    <button
                      key={srv.id}
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleQuickDispatch(srv)}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 flex flex-col items-center text-center transition-all cursor-pointer group disabled:opacity-50 shadow-sm dark:shadow-none"
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-spin mb-1" />
                      ) : (
                        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {srv.title}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {srv.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
