import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Img, staticFile } from 'remotion';

export interface AIPresenterProps {
  mode?: 'spotlight' | 'pip';
  title?: string;
  subtitle?: string;
  speakingText?: string;
  isSpeaking?: boolean;
}

export const AIPresenter: React.FC<AIPresenterProps> = ({
  mode = 'pip',
  title = 'Sarah Jenkins',
  subtitle = 'DineFlow AI Specialist',
  speakingText,
  isSpeaking = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle breathing / speaking motion
  const headBob = isSpeaking ? Math.sin((frame / 12) * Math.PI) * 3 : 0;
  const pulseScale = isSpeaking ? 1 + Math.sin((frame / 8) * Math.PI) * 0.015 : 1;

  // Waveform equalizer bars animation
  const bar1 = Math.abs(Math.sin(frame * 0.3)) * 18 + 6;
  const bar2 = Math.abs(Math.sin(frame * 0.4 + 1)) * 24 + 8;
  const bar3 = Math.abs(Math.sin(frame * 0.35 + 2)) * 20 + 6;
  const bar4 = Math.abs(Math.sin(frame * 0.5 + 3)) * 26 + 10;
  const bar5 = Math.abs(Math.sin(frame * 0.25 + 4)) * 16 + 6;

  const entry = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  if (mode === 'spotlight') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${entry})`,
          opacity: entry,
        }}
      >
        {/* Glow Ring */}
        <div
          style={{
            position: 'relative',
            width: 320,
            height: 320,
            borderRadius: '50%',
            padding: 6,
            background: 'linear-gradient(135deg, #6366f1, #3b82f6, #10b981)',
            boxShadow: '0 0 60px rgba(99, 102, 241, 0.4), 0 0 100px rgba(16, 185, 129, 0.2)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              transform: `translateY(${headBob}px) scale(${pulseScale})`,
              background: '#0f172a',
              border: '4px solid #ffffff',
            }}
          >
            <Img
              src={staticFile('images/ai_presenter.jpg')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Floating On-Air Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 999,
              padding: '6px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981',
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', letterSpacing: '0.5px' }}>
              LIVE DEMO
            </span>
          </div>
        </div>

        {/* Presenter Name Card */}
        <div
          style={{
            marginTop: 24,
            textAlign: 'center',
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(16px)',
            padding: '12px 32px',
            borderRadius: 20,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff' }}>{title}</div>
          <div style={{ fontSize: 15, color: '#94a3b8', fontWeight: 600 }}>{subtitle}</div>
        </div>

        {/* Closed Caption Bubble */}
        {speakingText && (
          <div
            style={{
              marginTop: 20,
              maxWidth: 700,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: 18,
              padding: '16px 28px',
              color: '#f8fafc',
              fontSize: 22,
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.4,
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            }}
          >
            "{speakingText}"
          </div>
        )}
      </div>
    );
  }

  // Picture-in-Picture (Corner PiP) Mode
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        right: 48,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 20,
        zIndex: 50,
        transform: `translateY(${(1 - entry) * 60}px) scale(${entry})`,
        opacity: entry,
      }}
    >
      {/* Speech Caption Bubble next to avatar */}
      {speakingText && (
        <div
          style={{
            maxWidth: 620,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '24px 24px 4px 24px',
            padding: '16px 24px',
            color: '#f8fafc',
            fontSize: 20,
            fontWeight: 600,
            lineHeight: 1.4,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Audio Equalizer Bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 28, flexShrink: 0 }}>
            {[bar1, bar2, bar3, bar4, bar5].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: isSpeaking ? h : 4,
                  background: 'linear-gradient(to top, #6366f1, #10b981)',
                  borderRadius: 2,
                  transition: 'height 0.1s ease',
                }}
              />
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#818cf8', fontWeight: 700, marginBottom: 2 }}>
              🎙️ {title}
            </div>
            <div>{speakingText}</div>
          </div>
        </div>
      )}

      {/* Circular Avatar Badge */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: '50%',
            padding: 4,
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #10b981 100%)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.3)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              transform: `translateY(${headBob}px) scale(${pulseScale})`,
              background: '#0f172a',
              border: '3px solid #ffffff',
            }}
          >
            <Img
              src={staticFile('images/ai_presenter.jpg')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>

        {/* Small Presenter Status Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 999,
            padding: '3px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>AI DEMO HOST</span>
        </div>
      </div>
    </div>
  );
};
