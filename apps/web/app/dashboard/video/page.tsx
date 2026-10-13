"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Video,
  Play,
  Download,
  Sparkles,
  Sliders,
  Layers,
  Terminal,
  CheckCircle2,
  RefreshCw,
  Mic,
  QrCode,
  Volume2,
} from "lucide-react";
import {
  DineFlowPromo,
  defaultDineFlowPromoProps,
  DineFlowPromoProps,
} from "@/remotion/compositions/DineFlowPromo";
import {
  QROrderingDemo,
  defaultQROrderingDemoProps,
  QROrderingDemoProps,
} from "@/remotion/compositions/QROrderingDemo";
import {
  Tutorial01_Registration,
  defaultTutorial01Props,
  Tutorial01Props,
} from "@/remotion/compositions/Tutorial01_Registration";

// Dynamically import Remotion Player to prevent SSR issues
const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-slate-900/90 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-800 animate-pulse">
        <Video className="w-12 h-12 text-indigo-400 mb-3 animate-bounce" />
        <span className="text-sm font-semibold">Initializing Remotion Engine & Audio Bus…</span>
      </div>
    ),
  }
);

type VideoType = "tutorial-01" | "qr-demo" | "promo";

export default function VideoStudioPage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoType>("tutorial-01");
  const [tutorial01Props, setTutorial01Props] = useState<Tutorial01Props>(defaultTutorial01Props);
  const [qrProps, setQrProps] = useState<QROrderingDemoProps>(defaultQROrderingDemoProps);
  const [promoProps, setPromoProps] = useState<DineFlowPromoProps>(defaultDineFlowPromoProps);
  const [copied, setCopied] = useState(false);

  const isTutorial01 = selectedVideo === "tutorial-01";
  const isQr = selectedVideo === "qr-demo";
  const renderCommand = isTutorial01
    ? "pnpm --filter web video:render:tutorial01"
    : isQr
    ? "pnpm --filter web video:render:qr"
    : "pnpm --filter web video:render";

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(renderCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetProps = () => {
    if (isQr) {
      setQrProps(defaultQROrderingDemoProps);
    } else {
      setPromoProps(defaultDineFlowPromoProps);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <Video className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Remotion Video Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Audio & AI Host Enabled
            </span>
          </div>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
            Programmatically create, customize, and render high-definition videos with AI avatar voiceover and audio effects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isTutorial01 && (
            <a
              href="/tutorials/tutorial-01-registration.mp4"
              download="DineFlow-Tutorial-01-Registration.mp4"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4</span>
            </a>
          )}
          <button
            onClick={handleCopyCommand}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700/60 shadow-sm transition-all duration-200"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Command Copied!</span>
              </>
            ) : (
              <>
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Copy Render CLI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Video Selection Tabs */}
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedVideo("tutorial-01")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            isTutorial01
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>Tutorial 1: Restaurant Registration & Onboarding</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/20 ml-1">45s Recordly</span>
        </button>

        <button
          onClick={() => setSelectedVideo("qr-demo")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            isQr
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Demo: QR Ordering (AI Host)</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/20 ml-1">30s</span>
        </button>

        <button
          onClick={() => setSelectedVideo("promo")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            selectedVideo === "promo"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Product Overview Promo</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/20 ml-1">12s</span>
        </button>
      </div>

      {/* Main Grid: Player + Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Video Player */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-slate-950 shadow-2xl">
            <div className="w-full aspect-video">
              <Player
                key={selectedVideo}
                component={
                  isTutorial01
                    ? (Tutorial01_Registration as React.ComponentType<Record<string, unknown>>)
                    : isQr
                    ? (QROrderingDemo as React.ComponentType<Record<string, unknown>>)
                    : (DineFlowPromo as React.ComponentType<Record<string, unknown>>)
                }
                inputProps={
                  isTutorial01
                    ? (tutorial01Props as Record<string, unknown>)
                    : isQr
                    ? (qrProps as Record<string, unknown>)
                    : (promoProps as Record<string, unknown>)
                }
                durationInFrames={isTutorial01 ? 1340 : isQr ? 900 : 360}
                fps={30}
                compositionWidth={1920}
                compositionHeight={1080}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                controls
                autoPlay
                loop
              />
            </div>
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span>Resolution: <b>1920×1080 (1080p Full HD)</b></span>
                <span>Framerate: <b>30 FPS</b></span>
                <span>Duration: <b>{isTutorial01 ? "45s (1340 frames)" : isQr ? "30s (900 frames)" : "12s (360 frames)"}</b></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Mic className="w-3.5 h-3.5" />
                {isTutorial01 ? "AI Voice Assistant & SFX Synced (Recordly Camera)" : isQr ? "AI Host Voiceover & SFX Synced" : "Visual Animation"}
              </div>
            </div>
          </div>

          {/* Video Timeline & Scene Breakdown Card */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B0F19] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>Sequence & Storyboard Breakdown</span>
              </div>
              <span className="text-xs text-slate-500">
                {isTutorial01 ? "5 Synchronized Scenes (Recordly Dynamic Motion)" : isQr ? "4 Synchronized Scenes" : "5 Modular Scenes"}
              </span>
            </div>

            {isTutorial01 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[
                  {
                    title: "1. Introduction & Overview",
                    time: "0.0s – 8.0s",
                    desc: "Welcome to DineFlow portal & feature highlights",
                    avatar: "Full Screen Camera",
                  },
                  {
                    title: "2. Category & Dynamic QR Slug",
                    time: "8.0s – 20.6s",
                    desc: "Selects Restaurant vertical, types name, instant slug",
                    avatar: "Auto-Zoom In (1.48x)",
                  },
                  {
                    title: "3. Owner Profile & +91 Phone",
                    time: "20.6s – 30.3s",
                    desc: "Types name, 10-digit mobile, instant live validation",
                    avatar: "Smooth Pan & Zoom",
                  },
                  {
                    title: "4. Password Security & Submit",
                    time: "30.3s – 35.6s",
                    desc: "Password meter turns 100% Strong, clicks CTA button",
                    avatar: "Action Trigger Zoom",
                  },
                  {
                    title: "5. Workspace Launch & Dashboard",
                    time: "35.6s – 44.6s",
                    desc: "Transitions to live operations, KDS, & table QR codes",
                    avatar: "Celebration Outro",
                  },
                ].map((scene, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {scene.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        {scene.desc}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[10px]">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{scene.time}</span>
                      <span className="text-slate-400 font-medium">{scene.avatar}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : isQr ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[
                  {
                    title: "1. Presenter Intro",
                    time: "0.0s – 6.0s",
                    desc: "Sarah introduces QR Dining",
                    avatar: "Spotlight Host",
                  },
                  {
                    title: "2. Scan QR & Menu",
                    time: "6.0s – 14.0s",
                    desc: "Laser scan & web menu load",
                    avatar: "PiP Narration",
                  },
                  {
                    title: "3. Customize & Order",
                    time: "14.0s – 22.0s",
                    desc: "Truffle add-on & 1-tap cart",
                    avatar: "Equalizer Sync",
                  },
                  {
                    title: "4. Kitchen Dispatch",
                    time: "22.0s – 30.0s",
                    desc: "Real-time KDS ticket & Outro",
                    avatar: "Closing CTA",
                  },
                ].map((scene, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {scene.title}
                      </span>
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
                        {scene.time}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                        {scene.desc}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2 block">
                      🎙️ {scene.avatar}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                {[
                  { title: "1. Brand Intro", time: "0.0s – 2.5s", desc: "Logo reveal & glow" },
                  { title: "2. QR Dining", time: "2.5s – 5.0s", desc: "Mobile ordering mock" },
                  { title: "3. Live KDS", time: "5.0s – 7.5s", desc: "Kitchen & room dispatch" },
                  { title: "4. WhatsApp Bot", time: "7.5s – 9.8s", desc: "Instant alert bubbles" },
                  { title: "5. Brand Outro", time: "9.8s – 12.0s", desc: "CTA & free trial" },
                ].map((scene, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{scene.title}</span>
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-1">{scene.time}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{scene.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Customizer Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B0F19] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Live Video Customizer</span>
              </div>
              <button
                onClick={handleResetProps}
                className="text-xs text-slate-500 hover:text-indigo-500 flex items-center gap-1 transition-colors"
                title="Reset to defaults"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {isQr ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Restaurant / Venue Name
                  </label>
                  <input
                    type="text"
                    value={qrProps.restaurantName}
                    onChange={(e) => setQrProps({ ...qrProps, restaurantName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Table Number
                  </label>
                  <input
                    type="text"
                    value={qrProps.tableNumber}
                    onChange={(e) => setQrProps({ ...qrProps, tableNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 space-y-1 text-xs text-indigo-900 dark:text-indigo-200">
                  <div className="font-bold flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-indigo-500" />
                    AI Presenter Voice Profile
                  </div>
                  <div>Voice: <b>Samantha (en_US)</b></div>
                  <div>Role: <b>AI Product Specialist (Live Avatar)</b></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={promoProps.brandName}
                    onChange={(e) => setPromoProps({ ...promoProps, brandName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={promoProps.tagline}
                    onChange={(e) => setPromoProps({ ...promoProps, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Export to MP4 Card */}
          <div className="p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 shadow-lg space-y-4">
            <div className="flex items-center gap-2 font-bold text-white">
              <Download className="w-5 h-5 text-indigo-400" />
              <span>Export High-Def MP4</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Render this composition into a Full HD 1080p MP4 video file with synchronized audio and AI presenter:
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 flex items-center justify-between gap-2 overflow-x-auto">
              <span>{renderCommand}</span>
              <button
                onClick={handleCopyCommand}
                className="text-xs text-slate-400 hover:text-white p-1"
                title="Copy"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Output: <code>{isQr ? "apps/web/out/qr-ordering-demo.mp4" : "apps/web/out/dineflow-promo.mp4"}</code>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
