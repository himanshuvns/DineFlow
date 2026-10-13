import React from 'react';
import { AbsoluteFill } from 'remotion';

export interface RecordlyFrameProps {
  children: React.ReactNode;
  url?: string;
  stepBadge?: string;
  subtitles?: string;
}

export const RecordlyFrame: React.FC<RecordlyFrameProps> = ({
  children,
  url = 'https://dine.rovixatech.com/register',
  stepBadge,
  subtitles,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #111827 0%, #070B14 60%, #030509 100%)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow & grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px), radial-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Floating Badge */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          left: 56,
          right: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'between',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 999,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
            }}
          >
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
            <span>DineFlow Academy • Master Tutorial 01</span>
          </div>

          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
            Restaurant Registration & Workspace Launch
          </span>
        </div>

        {stepBadge && (
          <div
            style={{
              marginLeft: 'auto',
              padding: '6px 18px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
            }}
          >
            {stepBadge}
          </div>
        )}
      </div>

      {/* Floating Browser Window Canvas */}
      <div
        style={{
          position: 'relative',
          width: 1560,
          height: 870,
          borderRadius: 22,
          overflow: 'hidden',
          background: '#090D16',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 100px -15px rgba(0, 0, 0, 0.85), 0 0 50px -10px rgba(16, 185, 129, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}
      >
        {/* macOS Browser Chrome Topbar */}
        <div
          style={{
            height: 48,
            background: '#0F172A',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: 16,
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          {/* Traffic Lights */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', border: '1px solid #e0443e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', border: '1px solid #dea123' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f', border: '1px solid #1aab29' }} />
          </div>

          {/* Nav arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', marginLeft: 8 }}>
            <span style={{ fontSize: 14 }}>‹</span>
            <span style={{ fontSize: 14 }}>›</span>
          </div>

          {/* Centered URL Bar */}
          <div
            style={{
              flex: 1,
              maxWidth: 580,
              margin: '0 auto',
              height: 30,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 500,
              color: '#94a3b8',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            <span style={{ color: '#10b981' }}>🔒</span>
            <span>{url}</span>
          </div>

          {/* Right Status pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 11, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            <span>Secure SSL</span>
          </div>
        </div>

        {/* Browser Content Area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            background: '#090D16',
          }}
        >
          {children}
        </div>
      </div>

      {/* Modern Word-Synced Subtitles Bar */}
      {subtitles && (
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 1100,
            padding: '12px 28px',
            borderRadius: 999,
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(16px)',
            color: '#f8fafc',
            fontSize: 17,
            fontWeight: 600,
            lineHeight: 1.4,
            textAlign: 'center',
            letterSpacing: '-0.01em',
            zIndex: 60,
          }}
        >
          <span style={{ color: '#34d399', fontWeight: 800, marginRight: 8 }}>AI Guide:</span>
          <span>{subtitles}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
