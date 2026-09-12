"use client";

import * as React from "react";

interface PeekingChefProps {
  isPasswordFocused?: boolean;
}

export function PeekingChef({ isPasswordFocused = false }: PeekingChefProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [pupilOffset, setPupilOffset] = React.useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = React.useState(false);

  // Track cursor and calculate eye direction
  React.useEffect(() => {
    if (isPasswordFocused) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      // Center of the face in screen coordinates
      const faceCx = rect.left + rect.width * 0.5;
      const faceCy = rect.top + rect.height * 0.5;
      const dx = e.clientX - faceCx;
      const dy = e.clientY - faceCy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const maxPupilTravel = 5;
      const ratio = Math.min(maxPupilTravel, dist * 0.03) / dist;
      setPupilOffset({ x: dx * ratio, y: dy * ratio });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isPasswordFocused]);

  // Reset pupils when covering eyes
  React.useEffect(() => {
    if (isPasswordFocused) setPupilOffset({ x: 0, y: 0 });
  }, [isPasswordFocused]);

  // Blink every ~3.5s
  React.useEffect(() => {
    if (isPasswordFocused) return;
    const id = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 140);
    }, 3500);
    return () => clearInterval(id);
  }, [isPasswordFocused]);

  const lx = 82 + pupilOffset.x;
  const ly = 124 + pupilOffset.y;
  const rx = 118 + pupilOffset.x;
  const ry = 124 + pupilOffset.y;

  return (
    <div className="flex flex-col items-center select-none" aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox="0 0 200 245"
        width="220"
        height="270"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xl"
      >
        {/* Chef hat brim */}
        <ellipse cx="100" cy="84" rx="48" ry="10" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Hat body */}
        <rect x="62" y="42" width="76" height="46" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Hat dome */}
        <ellipse cx="100" cy="42" rx="38" ry="18" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Hat shine */}
        <ellipse cx="87" cy="35" rx="11" ry="5" fill="white" opacity="0.55" />
        {/* Emerald stripe */}
        <rect x="62" y="72" width="76" height="5" rx="1" fill="#10b981" opacity="0.3" />

        {/* Neck */}
        <rect x="86" y="162" width="28" height="20" rx="6" fill="#fde8c8" />

        {/* Head */}
        <ellipse cx="100" cy="137" rx="52" ry="58" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.5" />
        {/* Ears */}
        <ellipse cx="48" cy="137" rx="10" ry="13" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" />
        <ellipse cx="48" cy="137" rx="5" ry="7" fill="#f8b98a" opacity="0.45" />
        <ellipse cx="152" cy="137" rx="10" ry="13" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" />
        <ellipse cx="152" cy="137" rx="5" ry="7" fill="#f8b98a" opacity="0.45" />

        {/* Cheek blush */}
        <ellipse cx="70" cy="153" rx="12" ry="7" fill="#f87171" opacity="0.18" />
        <ellipse cx="130" cy="153" rx="12" ry="7" fill="#f87171" opacity="0.18" />

        {/* Eyebrows */}
        {isPasswordFocused ? (
          <>
            <path d="M70 111 Q82 105 92 109" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M108 109 Q118 105 130 111" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d="M70 113 Q82 108 92 112" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M108 112 Q118 108 130 113" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Eyes */}
        {isPasswordFocused ? (
          <>
            {/* Squint lines */}
            <path d="M70 125 Q82 119 92 125" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M108 125 Q118 119 128 125" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Sweat drop */}
            <ellipse cx="67" cy="115" rx="2.5" ry="4" fill="#93c5fd" opacity="0.75" />
            <circle cx="67" cy="110" r="1.5" fill="#93c5fd" opacity="0.5" />
          </>
        ) : (
          <>
            {/* Left eye */}
            <ellipse cx="82" cy="124" rx="14" ry={blinking ? 2 : 14} fill="white" stroke="#1e293b" strokeWidth="1.5" style={{ transition: "ry 0.05s" }} />
            <circle cx={lx} cy={ly} r={blinking ? 0 : 6} fill="#1e293b" style={{ transition: "cx 0.06s, cy 0.06s, r 0.05s" }} />
            <circle cx={lx + 2} cy={ly - 3} r={blinking ? 0 : 2} fill="white" style={{ transition: "cx 0.06s, cy 0.06s" }} />
            {/* Right eye */}
            <ellipse cx="118" cy="124" rx="14" ry={blinking ? 2 : 14} fill="white" stroke="#1e293b" strokeWidth="1.5" style={{ transition: "ry 0.05s" }} />
            <circle cx={rx} cy={ry} r={blinking ? 0 : 6} fill="#1e293b" style={{ transition: "cx 0.06s, cy 0.06s, r 0.05s" }} />
            <circle cx={rx + 2} cy={ry - 3} r={blinking ? 0 : 2} fill="white" style={{ transition: "cx 0.06s, cy 0.06s" }} />
          </>
        )}

        {/* Nose */}
        <ellipse cx="100" cy="143" rx="5" ry="3.5" fill="#f5a97f" opacity="0.55" />
        <circle cx="97" cy="144" r="1.5" fill="#d97706" opacity="0.3" />
        <circle cx="103" cy="144" r="1.5" fill="#d97706" opacity="0.3" />

        {/* Mouth */}
        {isPasswordFocused ? (
          <path d="M87 159 Q100 156 113 159" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M85 159 Q100 171 115 159" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Hands covering eyes (password mode) */}
        {isPasswordFocused && (
          <>
            {/* Left arm */}
            <path d="M58 188 Q62 168 74 150 Q80 140 83 129" stroke="#fde8c8" strokeWidth="16" strokeLinecap="round" fill="none" />
            {/* Left palm */}
            <ellipse cx="80" cy="123" rx="18" ry="14" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.5" />
            {/* Left fingers */}
            <ellipse cx="65" cy="113" rx="5.5" ry="9" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" transform="rotate(-20,65,113)" />
            <ellipse cx="73" cy="108" rx="5.5" ry="10" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" transform="rotate(-10,73,108)" />
            <ellipse cx="82" cy="107" rx="5.5" ry="10" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" />
            <ellipse cx="91" cy="109" rx="5" ry="9" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" transform="rotate(10,91,109)" />
            <ellipse cx="98" cy="114" rx="5" ry="8" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" transform="rotate(20,98,114)" />

            {/* Right arm */}
            <path d="M142 188 Q138 168 126 150 Q120 140 117 129" stroke="#fde8c8" strokeWidth="16" strokeLinecap="round" fill="none" />
            {/* Right palm */}
            <ellipse cx="120" cy="123" rx="18" ry="14" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.5" />
            {/* Right fingers */}
            <ellipse cx="102" cy="114" rx="5" ry="8" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" transform="rotate(-20,102,114)" />
            <ellipse cx="109" cy="109" rx="5" ry="9" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" transform="rotate(-10,109,109)" />
            <ellipse cx="118" cy="107" rx="5.5" ry="10" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" />
            <ellipse cx="127" cy="108" rx="5.5" ry="10" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" transform="rotate(10,127,108)" />
            <ellipse cx="135" cy="113" rx="5.5" ry="9" fill="#fde8c8" stroke="#f5c89a" strokeWidth="1.2" transform="rotate(20,135,113)" />
          </>
        )}

        {/* Body / Chef jacket */}
        <path
          d="M70 180 Q60 187 55 212 Q52 232 55 245 L145 245 Q148 232 145 212 Q140 187 130 180 Q115 174 100 174 Q85 174 70 180Z"
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5"
        />
        {/* Buttons */}
        <circle cx="100" cy="196" r="3" fill="#10b981" opacity="0.75" />
        <circle cx="100" cy="211" r="3" fill="#10b981" opacity="0.75" />
        <circle cx="100" cy="226" r="3" fill="#10b981" opacity="0.75" />
        {/* Lapels */}
        <path d="M100 180 Q90 187 85 200 L100 193Z" fill="#e2e8f0" />
        <path d="M100 180 Q110 187 115 200 L100 193Z" fill="#e2e8f0" />
        {/* Bow tie */}
        <path d="M92 180 L85 174 L92 169 L100 174 L108 169 L115 174 L108 180 L100 176Z" fill="#10b981" opacity="0.9" />
      </svg>

      {/* Caption */}
      <div className="mt-2 text-center min-h-[28px]">
        {isPasswordFocused ? (
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 italic animate-pulse">
            🙈 Not peeking, promise!
          </p>
        ) : (
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
            👀 Watching over your workspace
          </p>
        )}
      </div>
    </div>
  );
}
