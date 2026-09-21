import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
} from 'remotion';
import { AIPresenter } from '../components/AIPresenter';

export type QROrderingDemoProps = {
  restaurantName: string;
  tableNumber: string;
  primaryColor: string;
  accentColor: string;
  [key: string]: unknown;
};

export const defaultQROrderingDemoProps: QROrderingDemoProps = {
  restaurantName: 'The Grand Bistro',
  tableNumber: '14',
  primaryColor: '#6366f1',
  accentColor: '#10b981',
};

// Scene 1: Presenter Introduction (Frames 0 - 180, 6s)
const Scene1_Intro: React.FC<{ props: QROrderingDemoProps }> = ({ props }) => {
  const frame = useCurrentFrame();

  const titleFade = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [10, 35], [30, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at center, #1e1b4b 0%, #090d16 80%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 100px',
      }}
    >
      {/* Left Column: Feature Title & Badge */}
      <div
        style={{
          maxWidth: 750,
          opacity: titleFade,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 22px',
            borderRadius: 999,
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#818cf8',
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 24,
            letterSpacing: '0.5px',
          }}
        >
          <span>✨ FEATURE DEMO 01</span>
          <span>•</span>
          <span>GUEST EXPERIENCE</span>
        </div>

        <h1
          style={{
            fontSize: 68,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-2px',
            marginBottom: 24,
            background: 'linear-gradient(to right, #ffffff, #c7d2fe, #a7f3d0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Contactless QR Table Ordering
        </h1>

        <p
          style={{
            fontSize: 26,
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: 36,
          }}
        >
          Discover how DineFlow empowers guests to scan, browse, customize, and order in seconds with zero app installation.
        </p>

        <div style={{ display: 'flex', gap: 16 }}>
          {['Zero App Download', 'Instant Menu Sync', 'Real-time KDS Routing'].map((pill, i) => (
            <div
              key={i}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: 16,
                fontWeight: 600,
                color: '#cbd5e1',
              }}
            >
              ✓ {pill}
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: AI Presenter Spotlight */}
      <AIPresenter
        mode="spotlight"
        title="Sarah Jenkins"
        subtitle="DineFlow AI Specialist"
        speakingText="Welcome to DineFlow! Today, let's explore contactless QR table ordering."
      />
    </AbsoluteFill>
  );
};

// Scene 2: Scan QR Code & Open Menu (Frames 180 - 420, 8s)
const Scene2_Scan: React.FC<{ props: QROrderingDemoProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera phone animation
  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // Laser scanner sweep (repeats or sweeps down)
  const laserY = interpolate(frame, [20, 50], [0, 220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isScanned = frame >= 50;

  // Menu slide up after scan
  const menuExpand = spring({
    frame: frame - 55,
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 60% 40%, #064e3b 0%, #090d16 80%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* SFX: Scan Beep at frame 50 */}
      {frame >= 50 && frame < 55 && (
        <Audio src={staticFile('audio/sfx_beep.mp3')} volume={0.8} />
      )}

      {/* Left Stage: Table & Mobile Device Mockup */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 80,
          transform: `scale(${phoneSpring})`,
        }}
      >
        {/* Table Tent with QR Code */}
        <div
          style={{
            width: 320,
            background: '#0f172a',
            borderRadius: 24,
            padding: 24,
            border: '2px solid #334155',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
            {props.restaurantName}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 16 }}>
            Table {props.tableNumber}
          </div>

          {/* QR Code Canvas with Scan Frame */}
          <div
            style={{
              position: 'relative',
              width: 240,
              height: 240,
              margin: '0 auto',
              background: '#ffffff',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Mock QR Grid */}
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'repeating-linear-gradient(0deg, #0f172a 0px, #0f172a 8px, transparent 8px, transparent 16px), repeating-linear-gradient(90deg, #0f172a 0px, #0f172a 8px, #ffffff 8px, #ffffff 16px)',
                borderRadius: 8,
              }}
            />

            {/* Laser Line */}
            {frame < 55 && (
              <div
                style={{
                  position: 'absolute',
                  top: laserY,
                  left: 10,
                  right: 10,
                  height: 3,
                  background: '#10b981',
                  boxShadow: '0 0 12px #10b981, 0 0 20px #10b981',
                }}
              />
            )}

            {/* Success Checkmark */}
            {isScanned && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(16, 185, 129, 0.92)',
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                <span style={{ fontSize: 44, marginBottom: 6 }}>✓</span>
                QR Verified
              </div>
            )}
          </div>

          <div style={{ fontSize: 13, color: '#64748b', marginTop: 14 }}>
            Scan with phone camera to order
          </div>
        </div>

        {/* Smartphone Screen displaying the Web Menu */}
        <div
          style={{
            width: 440,
            height: 780,
            background: '#0b0f19',
            borderRadius: 48,
            border: '5px solid #334155',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Phone Speaker Notch */}
          <div
            style={{
              width: 140,
              height: 22,
              background: '#1e293b',
              borderRadius: 12,
              margin: '12px auto 6px',
            }}
          />

          {/* Browser URL Bar */}
          <div
            style={{
              background: '#1e293b',
              padding: '6px 14px',
              margin: '0 16px 12px',
              borderRadius: 12,
              fontSize: 12,
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ color: '#10b981' }}>🔒</span>
            <span style={{ color: '#e2e8f0' }}>dineflow.com/m/grand-bistro/table-14</span>
          </div>

          {/* Digital Menu Content */}
          <div
            style={{
              flex: 1,
              padding: '10px 20px',
              transform: `translateY(${(1 - Math.max(0, menuExpand)) * 100}px)`,
              opacity: Math.max(0, menuExpand),
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{props.restaurantName}</h3>
                <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>● Table {props.tableNumber} Active</span>
              </div>
              <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: 8, fontSize: 13 }}>
                🔍 Search
              </div>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['Chef Specials', 'Starters', 'Mains', 'Cocktails'].map((cat, i) => (
                <div
                  key={i}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: i === 0 ? '#6366f1' : '#1e293b',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>

            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  background: '#1e293b',
                  borderRadius: 18,
                  padding: 16,
                  border: '1px solid #334155',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>Truffle Wild Mushroom Risotto</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0' }}>Arborio rice, aged parmesan, truffle oil</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 10, background: '#064e3b', color: '#34d399', padding: '2px 8px', borderRadius: 6 }}>VEG</span>
                    <span style={{ fontSize: 10, background: '#1e1b4b', color: '#c7d2fe', padding: '2px 8px', borderRadius: 6 }}>GLUTEN-FREE</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#34d399' }}>$24.00</div>
                  <div
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      marginTop: 8,
                    }}
                  >
                    + Add
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#1e293b',
                  borderRadius: 18,
                  padding: 16,
                  border: '1px solid #334155',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>Signature Hibiscus Spritz</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0' }}>Botanical soda, fresh berries, mint</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#34d399' }}>$12.00</div>
                  <div
                    style={{
                      background: '#334155',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      marginTop: 8,
                    }}
                  >
                    + Add
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Presenter in Corner PiP */}
      <AIPresenter
        mode="pip"
        title="Sarah Jenkins"
        subtitle="DineFlow AI Specialist"
        speakingText="Guests simply scan the table QR code with their camera to instantly open your interactive digital menu. Zero app download required."
      />
    </AbsoluteFill>
  );
};

// Scene 3: Customize Dish & Place Order (Frames 420 - 660, 8s)
const Scene3_Customize: React.FC<{ props: QROrderingDemoProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isModalOpen = frame >= 30;
  const isItemAdded = frame >= 80;
  const isOrderPlaced = frame >= 150;

  const modalSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #090d16 80%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* SFX: Tap sounds */}
      {frame === 80 && <Audio src={staticFile('audio/sfx_tap.mp3')} volume={0.8} />}
      {frame === 150 && <Audio src={staticFile('audio/sfx_tap.mp3')} volume={0.8} />}

      {/* Smartphone Display with Interactive Customizer */}
      <div
        style={{
          width: 460,
          height: 800,
          background: '#0b0f19',
          borderRadius: 48,
          border: '5px solid #334155',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '24px 24px 16px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>{props.restaurantName}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Table {props.tableNumber}</div>
          </div>
          <div style={{ background: '#10b981', color: '#ffffff', padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
            Active Session
          </div>
        </div>

        {/* Selected Item Hero */}
        <div style={{ padding: 24 }}>
          <div
            style={{
              height: 180,
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              borderRadius: 20,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              boxShadow: 'inset 0 -20px 30px rgba(0,0,0,0.5)',
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 48 }}>🍄</span>
            <div style={{ fontSize: 24, fontWeight: 900 }}>Truffle Wild Mushroom Risotto</div>
            <div style={{ fontSize: 18, color: '#34d399', fontWeight: 800, marginTop: 4 }}>$24.00</div>
          </div>
        </div>

        {/* Customization Drawer / Modal */}
        {isModalOpen && (
          <div
            style={{
              transform: `translateY(${(1 - modalSpring) * 300}px)`,
              background: '#1e293b',
              borderRadius: '28px 28px 0 0',
              padding: 24,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Customize Your Dish</div>

              {/* Option 1 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#0f172a',
                  padding: '12px 16px',
                  borderRadius: 14,
                  marginBottom: 10,
                  border: isItemAdded ? '2px solid #10b981' : '1px solid #334155',
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Extra Truffle Shavings</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Fresh Black Périgord</div>
                </div>
                <div style={{ color: '#34d399', fontWeight: 800 }}>+$4.00 ✓</div>
              </div>

              {/* Option 2 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#0f172a',
                  padding: '12px 16px',
                  borderRadius: 14,
                  border: '1px solid #334155',
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Dietary Note</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>No added butter (Gluten Free)</div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: 13 }}>Included</div>
              </div>
            </div>

            {/* Bottom Button */}
            <div
              style={{
                background: isOrderPlaced ? '#059669' : 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                padding: '16px 24px',
                borderRadius: 16,
                textAlign: 'center',
                fontWeight: 800,
                fontSize: 18,
                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
                transform: isOrderPlaced ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              {isOrderPlaced ? '✓ Order Placed ($28.00)' : 'Place Order • $28.00'}
            </div>
          </div>
        )}
      </div>

      {/* AI Presenter in Corner PiP */}
      <AIPresenter
        mode="pip"
        title="Sarah Jenkins"
        subtitle="DineFlow AI Specialist"
        speakingText="Guests can explore appetizing photos, filter dietary preferences, customize their dishes, and place an order in seconds."
      />
    </AbsoluteFill>
  );
};

// Scene 4: Real-Time Kitchen Dispatch & Outro (Frames 660 - 900, 8s)
const Scene4_Dispatch: React.FC<{ props: QROrderingDemoProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const splitIn = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at center, #064e3b 0%, #090d16 80%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 100px',
      }}
    >
      {/* SFX: Success Chime */}
      {frame === 10 && <Audio src={staticFile('audio/sfx_success.mp3')} volume={0.8} />}

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 18px',
            borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          <span>⚡ INSTANT REAL-TIME DISPATCH</span>
        </div>
        <h2 style={{ fontSize: 56, fontWeight: 900, margin: 0 }}>
          Order Directly Reaches Kitchen Display
        </h2>
      </div>

      {/* Split Cards */}
      <div
        style={{
          display: 'flex',
          gap: 40,
          width: '100%',
          maxWidth: 1200,
          transform: `scale(${splitIn})`,
          opacity: splitIn,
          marginBottom: 40,
        }}
      >
        {/* Left: Kitchen Display Ticket */}
        <div
          style={{
            flex: 1,
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, color: '#94a3b8' }}>KITCHEN DISPLAY (KDS)</div>
              <div style={{ fontSize: 32, fontWeight: 900 }}>Ticket #104</div>
            </div>
            <div style={{ background: '#10b981', color: '#ffffff', padding: '6px 16px', borderRadius: 8, fontSize: 14, fontWeight: 700 }}>
              JUST ARRIVED
            </div>
          </div>
          <div style={{ fontSize: 20, color: '#e2e8f0', lineHeight: 1.8 }}>
            <div>• <b>1x Truffle Wild Mushroom Risotto</b></div>
            <div style={{ color: '#34d399', fontSize: 16, paddingLeft: 18 }}>+ Extra Truffle Shavings</div>
            <div style={{ color: '#94a3b8', fontSize: 15, marginTop: 12 }}>
              Table {props.tableNumber} • Guest QR Direct Order
            </div>
          </div>
        </div>

        {/* Right: Guest Progress Screen */}
        <div
          style={{
            flex: 1,
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, color: '#94a3b8' }}>GUEST MOBILE WEB</div>
              <div style={{ fontSize: 32, fontWeight: 900 }}>Order #104</div>
            </div>
            <div style={{ background: '#3b82f6', color: '#ffffff', padding: '6px 16px', borderRadius: 8, fontSize: 14, fontWeight: 700 }}>
              IN PREPARATION
            </div>
          </div>
          <div style={{ fontSize: 20, color: '#e2e8f0', lineHeight: 1.8 }}>
            <div>⏱️ Estimated Prep Time: <b>12 mins</b></div>
            <div>💳 Payment: <b>Digital Receipt Sent</b></div>
            <div style={{ color: '#94a3b8', fontSize: 15, marginTop: 12 }}>
              Server alerted for table delivery.
            </div>
          </div>
        </div>
      </div>

      {/* AI Presenter in Corner PiP */}
      <AIPresenter
        mode="pip"
        title="Sarah Jenkins"
        subtitle="DineFlow AI Specialist"
        speakingText="Orders route directly to your kitchen display in real time, cutting wait times and delighting your guests. That's DineFlow QR dining!"
      />
    </AbsoluteFill>
  );
};

// Main Composition for Video 1
export const QROrderingDemo: React.FC<QROrderingDemoProps> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#090d16' }}>
      {/* Background Voiceover Narration Audio */}
      <Audio src={staticFile('audio/narration.mp3')} volume={1} />

      {/* Scene 1: Presenter Intro (0 to 180 frames = 6s) */}
      <Sequence from={0} durationInFrames={180}>
        <Scene1_Intro props={props} />
      </Sequence>

      {/* Scene 2: Scan QR & Open Digital Menu (180 to 420 frames = 8s) */}
      <Sequence from={180} durationInFrames={240}>
        <Scene2_Scan props={props} />
      </Sequence>

      {/* Scene 3: Customize Dish & Place Order (420 to 660 frames = 8s) */}
      <Sequence from={420} durationInFrames={240}>
        <Scene3_Customize props={props} />
      </Sequence>

      {/* Scene 4: Instant KDS Dispatch & Outro (660 to 900 frames = 8s) */}
      <Sequence from={660} durationInFrames={240}>
        <Scene4_Dispatch props={props} />
      </Sequence>
    </AbsoluteFill>
  );
};
