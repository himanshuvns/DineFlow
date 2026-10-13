import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
} from 'remotion';
import { RecordlyFrame } from '../components/RecordlyFrame';
import { RecordlyCursor } from '../components/RecordlyCursor';

export interface Tutorial01Props {
  restaurantName?: string;
  ownerName?: string;
  phone?: string;
  [key: string]: unknown;
}

export const defaultTutorial01Props: Tutorial01Props = {
  restaurantName: 'The Grand Bistro',
  ownerName: 'Vikram Malhotra',
  phone: '98765 43210',
};

export const Tutorial01_Registration: React.FC<Tutorial01Props> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene Schedule (Total: 1340 frames / ~44.6s @ 30fps) ──
  // Scene 1: Intro Overview (Frames 0 - 240 / 8s)
  // Scene 2: Category & Business Name (Frames 240 - 620 / 12.6s)
  // Scene 3: Owner & Mobile (Frames 620 - 910 / 9.6s)
  // Scene 4: Password & Submit (Frames 910 - 1070 / 5.3s)
  // Scene 5: Dashboard Workspace Launch (Frames 1070 - 1340 / 9.0s)

  // ── Subtitles based on timeline ──
  let activeSubtitles = '';
  let activeStepBadge = 'STEP 1: GETTING STARTED';
  if (frame < 240) {
    activeSubtitles =
      'Welcome to DineFlow! In this tutorial, we will set up your new restaurant workspace and digital QR menu in just a few simple steps.';
    activeStepBadge = 'WELCOME TO DINEFLOW';
  } else if (frame < 620) {
    activeSubtitles =
      'First, navigate to the registration page. Choose your hospitality vertical, such as Restaurant, and enter your business name. Notice how your dedicated contactless QR menu link is instantly generated.';
    activeStepBadge = 'STEP 1: BUSINESS IDENTITY';
  } else if (frame < 910) {
    activeSubtitles =
      'Next, provide your owner details and your mobile number. Real-time validation ensures your restaurant account and WhatsApp dispatch gateway are securely configured.';
    activeStepBadge = 'STEP 2: OWNER CREDENTIALS';
  } else if (frame < 1070) {
    activeSubtitles =
      'Create a secure password with instant strength feedback, and click Create Restaurant Account.';
    activeStepBadge = 'STEP 3: SECURITY & LAUNCH';
  } else {
    activeSubtitles =
      'Congratulations! Your DineFlow kitchen workspace is live. You are now ready to add dishes, print table QR stands, and start taking live orders.';
    activeStepBadge = 'WORKSPACE ACTIVATED 🚀';
  }

  // ── Camera Zoom & Pan Physics (Recordly Style) ──
  // Default overview: scale 1.0, center
  let cameraScale = 1.0;
  let originX = 50;
  let originY = 50;

  if (frame >= 240 && frame < 620) {
    // Zoom in on Category & Name (top half of form)
    const zoomProgress = interpolate(frame, [240, 275], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    cameraScale = interpolate(zoomProgress, [0, 1], [1.0, 1.48]);
    originX = interpolate(zoomProgress, [0, 1], [50, 48]);
    originY = interpolate(zoomProgress, [0, 1], [50, 24]);
  } else if (frame >= 620 && frame < 910) {
    // Zoom in on Owner & Phone (middle of form)
    const panProgress = interpolate(frame, [620, 655], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    cameraScale = 1.48;
    originX = interpolate(panProgress, [0, 1], [48, 52]);
    originY = interpolate(panProgress, [0, 1], [24, 48]);
  } else if (frame >= 910 && frame < 1070) {
    // Zoom in on Password & CTA Button (bottom of form)
    const panProgress = interpolate(frame, [910, 945], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    cameraScale = interpolate(panProgress, [0, 1], [1.48, 1.42]);
    originX = interpolate(panProgress, [0, 1], [52, 50]);
    originY = interpolate(panProgress, [0, 1], [48, 76]);
  } else if (frame >= 1070) {
    // Zoom out smoothly to view the entire live Dashboard
    const outProgress = interpolate(frame, [1070, 1105], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    cameraScale = interpolate(outProgress, [0, 1], [1.42, 1.03]);
    originX = 50;
    originY = 50;
  }

  // ── Cursor Position Keyframing (Recordly Cursor Trajectory) ──
  let cursorX = 85;
  let cursorY = 20;
  let isClicking = false;

  if (frame < 240) {
    // Glides gently from top right towards the center
    cursorX = interpolate(frame, [40, 180], [85, 62], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [40, 180], [20, 36], { extrapolateRight: 'clamp' });
  } else if (frame >= 240 && frame < 330) {
    // Moves to "Restaurant" category card and clicks
    cursorX = interpolate(frame, [240, 300], [62, 38], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [240, 300], [36, 17], { extrapolateRight: 'clamp' });
    isClicking = frame >= 300 && frame <= 316;
  } else if (frame >= 330 && frame < 440) {
    // Glides to "Business Name" input and clicks
    cursorX = interpolate(frame, [330, 375], [38, 45], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [330, 375], [17, 28], { extrapolateRight: 'clamp' });
    isClicking = frame >= 375 && frame <= 390;
  } else if (frame >= 440 && frame < 620) {
    // Hovers near the live generated QR slug badge
    cursorX = interpolate(frame, [440, 520], [45, 68], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [440, 520], [28, 25], { extrapolateRight: 'clamp' });
  } else if (frame >= 620 && frame < 730) {
    // Glides to First Name and clicks
    cursorX = interpolate(frame, [620, 660], [68, 38], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [620, 660], [25, 41], { extrapolateRight: 'clamp' });
    isClicking = frame >= 660 && frame <= 675;
  } else if (frame >= 730 && frame < 830) {
    // Glides to Mobile Number field and clicks
    cursorX = interpolate(frame, [730, 770], [38, 48], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [730, 770], [41, 54], { extrapolateRight: 'clamp' });
    isClicking = frame >= 770 && frame <= 785;
  } else if (frame >= 830 && frame < 960) {
    // Glides to Password field and clicks
    cursorX = interpolate(frame, [830, 930], [48, 44], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [830, 930], [54, 68], { extrapolateRight: 'clamp' });
    isClicking = frame >= 930 && frame <= 945;
  } else if (frame >= 960 && frame < 1070) {
    // Glides to "Create Restaurant Account" button and clicks
    cursorX = interpolate(frame, [960, 1015], [44, 50], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [960, 1015], [68, 86], { extrapolateRight: 'clamp' });
    isClicking = frame >= 1015 && frame <= 1032;
  } else {
    // Glides across the Dashboard navigation & metrics
    cursorX = interpolate(frame, [1070, 1260], [50, 65], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [1070, 1260], [86, 32], { extrapolateRight: 'clamp' });
  }

  // ── Dynamic Typing Animations ──
  // Business Name: "The Grand Bistro" (starts typing frame 385 to 490)
  const fullBizName = 'The Grand Bistro';
  const bizCharsCount = Math.floor(
    interpolate(frame, [385, 485], [0, fullBizName.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const typedBizName = fullBizName.slice(0, bizCharsCount);

  // Slug generation follows business name
  const typedSlug = typedBizName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // First Name: "Vikram" (frames 675 to 710)
  const fullFirstName = 'Vikram';
  const firstCharsCount = Math.floor(
    interpolate(frame, [675, 710], [0, fullFirstName.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const typedFirstName = fullFirstName.slice(0, firstCharsCount);

  // Last Name: "Malhotra" (frames 712 to 745)
  const fullLastName = 'Malhotra';
  const lastCharsCount = Math.floor(
    interpolate(frame, [712, 745], [0, fullLastName.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const typedLastName = fullLastName.slice(0, lastCharsCount);

  // Phone Number: "98765 43210" (frames 785 to 845)
  const fullPhone = '98765 43210';
  const phoneCharsCount = Math.floor(
    interpolate(frame, [785, 845], [0, fullPhone.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const typedPhone = fullPhone.slice(0, phoneCharsCount);
  const isPhoneValid = phoneCharsCount >= 10;

  // Password: "••••••••••••" (frames 940 to 980)
  const passwordDotsCount = Math.floor(
    interpolate(frame, [940, 975], [0, 12], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const typedPassword = '•'.repeat(passwordDotsCount);
  const isPasswordStrong = passwordDotsCount >= 8;

  // Form Submission & Redirecting state (frames 1015 - 1070)
  const isSubmitting = frame >= 1015 && frame < 1070;
  const isDashboardLive = frame >= 1070;

  return (
    <AbsoluteFill>
      {/* Audio Tracks */}
      <Sequence from={0} durationInFrames={240}>
        <Audio src={staticFile('audio/tutorials/video01/scene1.mp3')} />
      </Sequence>
      <Sequence from={240} durationInFrames={380}>
        <Audio src={staticFile('audio/tutorials/video01/scene2.mp3')} />
      </Sequence>
      <Sequence from={620} durationInFrames={290}>
        <Audio src={staticFile('audio/tutorials/video01/scene3.mp3')} />
      </Sequence>
      <Sequence from={910} durationInFrames={160}>
        <Audio src={staticFile('audio/tutorials/video01/scene4.mp3')} />
      </Sequence>
      <Sequence from={1070} durationInFrames={270}>
        <Audio src={staticFile('audio/tutorials/video01/scene5.mp3')} />
      </Sequence>

      {/* Sound Effects on Clicks & Success */}
      <Sequence from={305} durationInFrames={30}>
        <Audio src={staticFile('audio/sfx_tap.mp3')} volume={0.65} />
      </Sequence>
      <Sequence from={380} durationInFrames={30}>
        <Audio src={staticFile('audio/sfx_tap.mp3')} volume={0.65} />
      </Sequence>
      <Sequence from={1018} durationInFrames={30}>
        <Audio src={staticFile('audio/sfx_tap.mp3')} volume={0.8} />
      </Sequence>
      <Sequence from={1075} durationInFrames={90}>
        <Audio src={staticFile('audio/sfx_success.mp3')} volume={0.75} />
      </Sequence>

      {/* Frame Wrapper with Browser Topbar & Subtitles */}
      <RecordlyFrame
        url={isDashboardLive ? 'https://dine.rovixatech.com/dashboard' : 'https://dine.rovixatech.com/register'}
        stepBadge={activeStepBadge}
        subtitles={activeSubtitles}
      >
        {/* Recordly Smooth Camera Controller */}
        <div
          style={{
            width: '100%',
            height: '100%',
            transformOrigin: `${originX}% ${originY}%`,
            transform: `scale(${cameraScale})`,
            transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)',
            position: 'relative',
          }}
        >
          {/* Animated Mouse Cursor */}
          <RecordlyCursor x={cursorX} y={cursorY} isClicking={isClicking} />

          {!isDashboardLive ? (
            /* ════════════ SCREEN 1: REGISTRATION & ONBOARDING PORTAL ════════════ */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                background: '#090D16',
                color: '#F8FAFC',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              {/* Left Column: Branding Showcase & Value Proposition */}
              <div
                style={{
                  width: '38%',
                  height: '100%',
                  background: 'linear-gradient(145deg, #0B1120 0%, #060911 100%)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '44px 38px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Brand Logo & Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <span style={{ fontSize: 24 }}>🍽️</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                        DineFlow
                      </span>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#10B981', letterSpacing: '0.04em' }}>
                        HOSPITALITY CLOUD OS
                      </span>
                    </div>
                  </div>

                  <h2
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      lineHeight: 1.25,
                      letterSpacing: '-0.03em',
                      marginBottom: 16,
                      background: 'linear-gradient(to right, #FFFFFF, #E2E8F0, #94A3B8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Launch your high-margin digital restaurant in minutes.
                  </h2>

                  <p style={{ fontSize: 13.5, color: '#94A3B8', lineHeight: 1.6, marginBottom: 32 }}>
                    Empower your floor staff, speed up kitchen dispatch by 2.4x, and recover lost diners with 1-click WhatsApp re-engagement.
                  </p>

                  {/* Highlights checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { icon: '⚡', title: 'Instant QR Table Ordering', desc: 'No app download required for diners' },
                      { icon: '🍳', title: 'Real-time Live KDS', desc: 'Acoustic chimes and split-ticket routing' },
                      { icon: '💬', title: 'WhatsApp Invoicing & AI Bot', desc: 'Automated GST tax bills to guests' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9' }}>{item.title}</div>
                          <div style={{ fontSize: 11.5, color: '#64748B' }}>{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Trust Badge */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 18 }}>🛡️</span>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>
                    <strong style={{ color: '#F8FAFC' }}>Multi-Tenant Data Isolated</strong> • 256-bit AES encryption
                  </div>
                </div>
              </div>

              {/* Right Column: Actual Registration Form UI */}
              <div
                style={{
                  width: '62%',
                  height: '100%',
                  padding: '36px 48px',
                  overflowY: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div style={{ maxWidth: 620, margin: '0 auto', width: '100%' }}>
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 12px',
                        borderRadius: 999,
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        color: '#34d399',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: 8,
                      }}
                    >
                      <span>🚀 14-Day Full Access Trial</span>
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                      Register New Restaurant
                    </h1>
                    <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                      Create your organization account to unlock contactless QR menus and KDS.
                    </p>
                  </div>

                  {/* Form Container */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* 1. Category Selector */}
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                        Hospitality Vertical
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                        {[
                          { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
                          { id: 'cafe', label: 'Café', icon: '☕' },
                          { id: 'hotel', label: 'Hotel', icon: '🏨' },
                          { id: 'cloud_kitchen', label: 'Cloud Kitchen', icon: '🍲' },
                          { id: 'resort', label: 'Resort', icon: '🌴' },
                        ].map((cat) => {
                          const isSelected = cat.id === 'restaurant';
                          return (
                            <div
                              key={cat.id}
                              style={{
                                padding: '8px 6px',
                                borderRadius: 12,
                                textAlign: 'center',
                                background: isSelected
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : 'rgba(255, 255, 255, 0.03)',
                                border: isSelected
                                  ? '1.5px solid #10B981'
                                  : '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <div style={{ fontSize: 16, marginBottom: 2 }}>{cat.icon}</div>
                              <div
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: isSelected ? 800 : 600,
                                  color: isSelected ? '#34D399' : '#94A3B8',
                                }}
                              >
                                {cat.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Business Name & Live Slug Preview */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8' }}>
                          Business Name
                        </label>
                        {typedSlug && (
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: 'ui-monospace, monospace',
                              color: '#10B981',
                              fontWeight: 700,
                              background: 'rgba(16, 185, 129, 0.1)',
                              padding: '2px 8px',
                              borderRadius: 6,
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                            }}
                          >
                            dineflow.app/m/{typedSlug}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          height: 42,
                          borderRadius: 12,
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: typedBizName ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 14px',
                          gap: 10,
                          color: '#F8FAFC',
                          fontSize: 13,
                        }}
                      >
                        <span style={{ color: '#64748B' }}>🏪</span>
                        <span>{typedBizName || 'e.g. The Grand Bistro'}</span>
                        {typedBizName && <span style={{ color: '#10B981', marginLeft: 'auto' }}>✓</span>}
                      </div>
                    </div>

                    {/* 3. Owner First Name & Last Name */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 5 }}>
                          First Name
                        </label>
                        <div
                          style={{
                            height: 42,
                            borderRadius: 12,
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: typedFirstName ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 14px',
                            gap: 10,
                            color: '#F8FAFC',
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: '#64748B' }}>👤</span>
                          <span>{typedFirstName || 'First Name'}</span>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 5 }}>
                          Last Name
                        </label>
                        <div
                          style={{
                            height: 42,
                            borderRadius: 12,
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: typedLastName ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 14px',
                            gap: 10,
                            color: '#F8FAFC',
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: '#64748B' }}>👤</span>
                          <span>{typedLastName || 'Last Name'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Mobile Number with +91 Country Pill */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8' }}>
                          Mobile Number
                        </label>
                        <span style={{ fontSize: 10.5, color: '#64748B' }}>10-digit Indian Mobile</span>
                      </div>
                      <div
                        style={{
                          height: 42,
                          borderRadius: 12,
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: isPhoneValid ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 12px',
                          color: '#F8FAFC',
                          fontSize: 13,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            paddingRight: 10,
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#E2E8F0',
                            fontWeight: 700,
                            fontSize: 12.5,
                          }}
                        >
                          <span>🇮🇳 +91</span>
                        </div>
                        <span style={{ marginLeft: 12, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                          {typedPhone || '98765 43210'}
                        </span>
                        {isPhoneValid && (
                          <span style={{ color: '#10B981', marginLeft: 'auto', fontWeight: 800 }}>✓ Verified</span>
                        )}
                      </div>
                    </div>

                    {/* 5. Password & Strength Meter */}
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 5 }}>
                        Create Secure Password
                      </label>
                      <div
                        style={{
                          height: 42,
                          borderRadius: 12,
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: isPasswordStrong ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 14px',
                          gap: 10,
                          color: '#F8FAFC',
                          fontSize: 16,
                          letterSpacing: '0.15em',
                        }}
                      >
                        <span style={{ color: '#64748B', letterSpacing: 'normal', fontSize: 13 }}>🔒</span>
                        <span>{typedPassword || '••••••••••••'}</span>
                      </div>

                      {/* Password Strength Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                          {[1, 2, 3, 4].map((bar) => {
                            const isBarActive = passwordDotsCount >= bar * 2.5;
                            return (
                              <div
                                key={bar}
                                style={{
                                  height: 4,
                                  flex: 1,
                                  borderRadius: 2,
                                  background: isBarActive ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                                  transition: 'background 0.2s ease',
                                }}
                              />
                            );
                          })}
                        </div>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: isPasswordStrong ? '#34D399' : '#94A3B8',
                          }}
                        >
                          {isPasswordStrong ? 'Strong' : 'Medium'}
                        </span>
                      </div>
                    </div>

                    {/* 6. Primary Action Button */}
                    <div style={{ marginTop: 8 }}>
                      <div
                        style={{
                          height: 46,
                          borderRadius: 12,
                          background: isSubmitting
                            ? 'linear-gradient(to right, #059669, #047857)'
                            : 'linear-gradient(to right, #10B981, #059669)',
                          color: '#030712',
                          fontWeight: 800,
                          fontSize: 13.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.35)',
                          cursor: 'pointer',
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                            <span style={{ color: '#FFFFFF' }}>Provisioning Restaurant Workspace…</span>
                          </>
                        ) : (
                          <>
                            <span>Create Restaurant Account</span>
                            <span>→</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ════════════ SCREEN 2: LIVE DINEFLOW OPERATIONS DASHBOARD ════════════ */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                background: '#070A12',
                color: '#F8FAFC',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              {/* Sidebar Preview */}
              <div
                style={{
                  width: 240,
                  height: '100%',
                  background: '#0A0E18',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                    }}
                  >
                    T
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>The Grand Bistro</div>
                    <div style={{ fontSize: 10, color: '#10B981', fontWeight: 700 }}>● Online Kitchen</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'Overview', icon: '📊', active: true },
                    { label: 'Live KDS & Orders', icon: '🍳', badge: 'Live' },
                    { label: 'Menu Management', icon: '🍽️' },
                    { label: 'Tables & QR Codes', icon: '📱' },
                    { label: 'WhatsApp Connect', icon: '💬', badge: 'AI' },
                    { label: 'Reviews & QR Stand', icon: '⭐' },
                    { label: 'Staff & Permissions', icon: '👥' },
                    { label: 'Settings & Billing', icon: '⚙️' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: 10,
                        background: item.active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        color: item.active ? '#34D399' : '#94A3B8',
                        fontWeight: item.active ? 800 : 500,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: item.badge === 'Live' ? '#ef4444' : '#10b981',
                            color: '#ffffff',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Dashboard Stage */}
              <div style={{ flex: 1, padding: '32px 40px', overflowY: 'hidden' }}>
                {/* Top Celebration Card */}
                <div
                  style={{
                    padding: '24px 28px',
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 78, 59, 0.3) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: 'rgba(16, 185, 129, 0.25)',
                        color: '#6ee7b7',
                        fontSize: 11,
                        fontWeight: 800,
                        marginBottom: 6,
                      }}
                    >
                      <span>🎉 WORKSPACE READY</span>
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                      Welcome to The Grand Bistro!
                    </h2>
                    <p style={{ fontSize: 13, color: '#A7F3D0', marginTop: 4 }}>
                      Your multi-tenant kitchen, digital QR menu, and KDS dispatch board are operational.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '10px 20px',
                      borderRadius: 12,
                      background: '#10B981',
                      color: '#030712',
                      fontSize: 12.5,
                      fontWeight: 800,
                      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    View Table QR Code →
                  </div>
                </div>

                {/* 3 Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                  {[
                    { label: "Today's Revenue", val: '₹0.00', sub: 'Ready for live dining', icon: '💰' },
                    { label: 'Active Kitchen Orders', val: '0 Orders', sub: 'KDS Live Audio Chimes On', icon: '🍳' },
                    { label: 'Dining Tables', val: '12 Tables', sub: 'QR Stands Ready to Print', icon: '📱' },
                  ].map((card, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '20px 22px',
                        borderRadius: 18,
                        background: '#0D1322',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>{card.label}</span>
                        <span style={{ fontSize: 20 }}>{card.icon}</span>
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                        {card.val}
                      </div>
                      <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 4 }}>
                        {card.sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Next Steps */}
                <div
                  style={{
                    padding: '20px 24px',
                    borderRadius: 18,
                    background: '#0D1322',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 14 }}>
                    Quick Onboarding Checklist:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {[
                      { step: '1', title: 'Add Dishes & Prices', desc: 'Create your digital menu catalog' },
                      { step: '2', title: 'Print QR Standees', desc: 'Place on dining tables for contactless scan' },
                      { step: '3', title: 'Connect WhatsApp', desc: 'Automate tax invoices and chatbot' },
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 14,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#10B981',
                            color: '#030712',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {step.step}
                        </div>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#F8FAFC' }}>{step.title}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </RecordlyFrame>
    </AbsoluteFill>
  );
};
