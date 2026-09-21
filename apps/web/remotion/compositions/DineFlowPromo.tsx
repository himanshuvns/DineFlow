import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

export type DineFlowPromoProps = {
  brandName: string;
  tagline: string;
  venueName: string;
  primaryColor: string;
  accentColor: string;
  websiteUrl: string;
  [key: string]: unknown;
};

export const defaultDineFlowPromoProps: DineFlowPromoProps = {
  brandName: 'DineFlow',
  tagline: 'Next-Gen Restaurant & Hospitality OS',
  venueName: 'The Grand Bistro & Suites',
  primaryColor: '#6366f1',
  accentColor: '#10b981',
  websiteUrl: 'dineflow-steel.vercel.app',
};

// Scene 1: Brand Intro (Frames 0 - 75)
const SceneIntro: React.FC<{ props: DineFlowPromoProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const textY = interpolate(frame, [15, 40], [40, 0], {
    extrapolateRight: 'clamp',
  });

  const textOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const badgeScale = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #1e1b4b 0%, #090d16 80%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(16, 185, 129, 0) 70%)',
          filter: 'blur(60px)',
          transform: `scale(${logoScale})`,
        }}
      />

      {/* Logo Container */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 50px rgba(99, 102, 241, 0.45)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <span style={{ fontSize: 56 }}>🍽️</span>
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            letterSpacing: '-2px',
            background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {props.brandName}
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          fontSize: 38,
          fontWeight: 600,
          color: '#94a3b8',
          letterSpacing: '0.5px',
          marginBottom: 40,
        }}
      >
        {props.tagline}
      </div>

      {/* Feature Badges */}
      <div
        style={{
          opacity: Math.max(0, badgeScale),
          transform: `scale(${Math.max(0, badgeScale)})`,
          display: 'flex',
          gap: 16,
        }}
      >
        {['⚡ Multi-Tenant', '📱 Contactless QR', '🍳 Real-Time KDS', '💬 WhatsApp Automation'].map(
          (feature, i) => (
            <div
              key={i}
              style={{
                padding: '12px 24px',
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: 20,
                fontWeight: 600,
                color: '#e2e8f0',
              }}
            >
              {feature}
            </div>
          )
        )}
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: QR Dining (Frames 75 - 150)
const SceneQROrdering: React.FC<{ props: DineFlowPromoProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneSlide = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const contentFade = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const orderSuccessScale = spring({
    frame: frame - 45,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 140px',
        background: 'radial-gradient(circle at 70% 30%, #064e3b 0%, #090d16 75%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Left Column: Text Highlights */}
      <div style={{ maxWidth: 700 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 24,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          📱 Seamless Guest Experience
        </div>
        <h2
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 24,
            color: '#f8fafc',
          }}
        >
          Scan. Order. Pay. <br />
          <span style={{ color: '#34d399' }}>Zero App Download.</span>
        </h2>
        <p style={{ fontSize: 26, color: '#94a3b8', lineHeight: 1.6 }}>
          Guests scan the table QR code for an instant, interactive digital menu.
          Orders route directly to the kitchen with zero wait time.
        </p>
      </div>

      {/* Right Column: Simulated Mobile Phone Card */}
      <div
        style={{
          transform: `translateY(${(1 - phoneSlide) * 120}px) scale(${phoneSlide})`,
          width: 420,
          background: '#0f172a',
          borderRadius: 40,
          padding: 24,
          border: '4px solid #334155',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)',
          position: 'relative',
        }}
      >
        {/* Phone Notch */}
        <div
          style={{
            width: 140,
            height: 20,
            background: '#334155',
            borderRadius: 10,
            margin: '0 auto 20px',
          }}
        />

        <div style={{ opacity: contentFade }}>
          {/* Table Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #1e293b',
              paddingBottom: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: '#94a3b8' }}>{props.venueName}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>Table 14</div>
            </div>
            <div
              style={{
                background: '#10b981',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Active
            </div>
          </div>

          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            <div
              style={{
                background: '#1e293b',
                padding: 14,
                borderRadius: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Truffle Risotto</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Extra parmesan</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>$24.00</div>
            </div>

            <div
              style={{
                background: '#1e293b',
                padding: 14,
                borderRadius: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Hibiscus Spritz</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Sparkling soda</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>$12.00</div>
            </div>
          </div>

          {/* Success Overlay after frame 45 */}
          {frame > 45 && (
            <div
              style={{
                transform: `scale(${Math.max(0, orderSuccessScale)})`,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: 18,
                borderRadius: 18,
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 4 }}>✅ Order Placed!</div>
              <div style={{ fontSize: 14, color: '#d1fae5' }}>Sent instantly to Kitchen Display</div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: KDS & Housekeeping Dispatch (Frames 150 - 225)
const SceneKitchenOperations: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftCard = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const rightCard = spring({
    frame: frame - 12,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 120px',
        background: 'radial-gradient(circle at 30% 70%, #1e1b4b 0%, #090d16 80%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            borderRadius: 999,
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818cf8',
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          ⚡ Real-Time Operations
        </div>
        <h2 style={{ fontSize: 60, fontWeight: 800, margin: 0 }}>
          Live Kitchen Display & Smart Staff Dispatch
        </h2>
      </div>

      <div style={{ display: 'flex', gap: 40, width: '100%', maxWidth: 1400 }}>
        {/* Left: KDS Ticket */}
        <div
          style={{
            flex: 1,
            transform: `translateY(${(1 - leftCard) * 80}px)`,
            opacity: leftCard,
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 28,
            padding: 36,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <div>
              <span style={{ fontSize: 16, color: '#94a3b8' }}>KITCHEN DISPLAY (KDS)</span>
              <div style={{ fontSize: 32, fontWeight: 800 }}>Order #248</div>
            </div>
            <div
              style={{
                padding: '6px 16px',
                borderRadius: 999,
                background: frame > 40 ? '#10b981' : '#f59e0b',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 700,
                transition: 'all 0.3s ease',
              }}
            >
              {frame > 40 ? 'READY FOR PICKUP' : 'PREPARING (4m)'}
            </div>
          </div>

          <div style={{ fontSize: 20, color: '#cbd5e1', lineHeight: 1.8 }}>
            <div>• 1x Truffle Wild Mushroom Risotto</div>
            <div>• 1x Signature Hibiscus Spritz</div>
            <div style={{ color: '#94a3b8', fontSize: 16, marginTop: 12 }}>
              Table 14 • Server: Alex M.
            </div>
          </div>
        </div>

        {/* Right: Housekeeping Dispatch */}
        <div
          style={{
            flex: 1,
            transform: `translateY(${(1 - rightCard) * 80}px)`,
            opacity: rightCard,
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 28,
            padding: 36,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <div>
              <span style={{ fontSize: 16, color: '#94a3b8' }}>HOTEL HOUSEKEEPING</span>
              <div style={{ fontSize: 32, fontWeight: 800 }}>Suite 201</div>
            </div>
            <div
              style={{
                padding: '6px 16px',
                borderRadius: 999,
                background: '#3b82f6',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              IN PROGRESS
            </div>
          </div>

          <div style={{ fontSize: 20, color: '#cbd5e1', lineHeight: 1.8 }}>
            <div>• Priority: VIP Guest Arrival (5:00 PM)</div>
            <div>• Assigned Staff: Maria Santos</div>
            <div style={{ color: '#94a3b8', fontSize: 16, marginTop: 12 }}>
              Task: Deep Clean & Fresh Linens
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: WhatsApp Alerts (Frames 225 - 295)
const SceneWhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bubble1 = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  const bubble2 = spring({
    frame: frame - 20,
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 40%, #064e3b 0%, #090d16 80%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            borderRadius: 999,
            background: 'rgba(37, 211, 102, 0.15)',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            color: '#25d366',
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          💬 WhatsApp Automated Alerts
        </div>
        <h2 style={{ fontSize: 58, fontWeight: 800, margin: 0 }}>
          Instant Push Notifications to Staff & Guests
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 800 }}>
        {/* WhatsApp Message 1 */}
        <div
          style={{
            transform: `scale(${bubble1})`,
            opacity: bubble1,
            background: '#1f2c34',
            borderRadius: '20px 20px 20px 4px',
            padding: '24px 30px',
            border: '1px solid #2a3942',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#25d366',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>🟢 DineFlow Cloud Bot</span>
            <span style={{ fontSize: 13, color: '#8696a0' }}>• Just now</span>
          </div>
          <div style={{ fontSize: 22, color: '#e9edef', lineHeight: 1.5 }}>
            🔔 <b>Order #248 (Table 14)</b> is ready for pickup! Kitchen expediter dispatched server.
          </div>
        </div>

        {/* WhatsApp Message 2 */}
        <div
          style={{
            transform: `scale(${bubble2})`,
            opacity: bubble2,
            background: '#1f2c34',
            borderRadius: '20px 20px 20px 4px',
            padding: '24px 30px',
            border: '1px solid #2a3942',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#25d366',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>🟢 DineFlow Cloud Bot</span>
            <span style={{ fontSize: 13, color: '#8696a0' }}>• 1m ago</span>
          </div>
          <div style={{ fontSize: 22, color: '#e9edef', lineHeight: 1.5 }}>
            🧹 <b>Suite 201</b> turndown service completed by <b>Maria Santos</b>. Room is marked ready for check-in!
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Outro & Call to Action (Frames 295 - 360)
const SceneOutro: React.FC<{ props: DineFlowPromoProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const buttonPulse = interpolate(
    Math.sin((frame / 10) * Math.PI),
    [-1, 1],
    [0.98, 1.02]
  );

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #1e1b4b 0%, #090d16 80%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: 'center',
          maxWidth: 1000,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: '-2px',
            lineHeight: 1.15,
            marginBottom: 24,
            background: 'linear-gradient(to right, #ffffff, #c7d2fe, #a7f3d0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Supercharge Your Venue with {props.brandName}
        </div>

        <p
          style={{
            fontSize: 32,
            color: '#94a3b8',
            marginBottom: 48,
            fontWeight: 500,
          }}
        >
          All-in-one platform for Restaurants, Cafes, Hotels & Cloud Kitchens.
        </p>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${buttonPulse})`,
            display: 'inline-block',
            padding: '22px 64px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #10b981 100%)',
            fontSize: 28,
            fontWeight: 800,
            color: '#ffffff',
            boxShadow: '0 20px 50px rgba(99, 102, 241, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            marginBottom: 32,
          }}
        >
          Get Started at {props.websiteUrl}
        </div>

        <div style={{ fontSize: 20, color: '#64748b' }}>
          Free Setup • Zero Hardware Lock-In • 24/7 Support
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Main Video Composition Container
export const DineFlowPromo: React.FC<DineFlowPromoProps> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#090d16' }}>
      {/* Scene 1: Brand Intro (0 to 75 frames = 2.5s) */}
      <Sequence from={0} durationInFrames={75}>
        <SceneIntro props={props} />
      </Sequence>

      {/* Scene 2: QR Table Ordering (75 to 150 frames = 2.5s) */}
      <Sequence from={75} durationInFrames={75}>
        <SceneQROrdering props={props} />
      </Sequence>

      {/* Scene 3: Live Kitchen Display & Dispatch (150 to 225 frames = 2.5s) */}
      <Sequence from={150} durationInFrames={75}>
        <SceneKitchenOperations />
      </Sequence>

      {/* Scene 4: WhatsApp Automated Alerts (225 to 295 frames = 2.3s) */}
      <Sequence from={225} durationInFrames={70}>
        <SceneWhatsApp />
      </Sequence>

      {/* Scene 5: Outro & Call to Action (295 to 360 frames = 2.2s) */}
      <Sequence from={295} durationInFrames={65}>
        <SceneOutro props={props} />
      </Sequence>
    </AbsoluteFill>
  );
};
