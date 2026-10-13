import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface RecordlyCursorProps {
  x: number; // percentage (0 - 100) or pixels
  y: number; // percentage (0 - 100) or pixels
  isClicking?: boolean;
  clickFrame?: number;
}

export const RecordlyCursor: React.FC<{
  x: number;
  y: number;
  isClicking?: boolean;
}> = ({ x, y, isClicking = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle breathing / floating animation
  const clickScale = isClicking ? 0.88 : 1.0;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-2px, -2px) scale(${clickScale})`,
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'transform 0.08s ease',
      }}
    >
      {/* Click Ripple Effect */}
      {isClicking && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 44,
            height: 44,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.45)',
            border: '2px solid rgba(16, 185, 129, 0.85)',
            animation: 'ripple 0.4s ease-out forwards',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
          }}
        />
      )}

      {/* Modern macOS-style Arrow Cursor */}
      <svg
        width="28"
        height="32"
        viewBox="0 0 28 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.55))',
        }}
      >
        <path
          d="M2.5 1.5L25 14L14.5 17L9.5 28.5L2.5 1.5Z"
          fill="#0F172A"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="10" r="2" fill="#10B981" />
      </svg>
    </div>
  );
};
