"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

export interface AetherFlowHeroProps {
  title?: React.ReactNode;
  subtitle?: string;
  badgeText?: string;
  primaryCtaText?: string;
  onCtaClick?: () => void;
  ctaHref?: string;
  showOverlayContent?: boolean;
  className?: string;
  canvasClassName?: string;
  particleColor?: string;
  lineColor?: string;
}

const AetherFlowHero = ({
  title,
  subtitle,
  badgeText = "Next-Gen Hospitality OS",
  primaryCtaText = "Create Restaurant Workspace",
  onCtaClick,
  ctaHref = "/register",
  showOverlayContent = true,
  className,
  canvasClassName,
  particleColor = "rgba(16, 185, 129, 0.85)", // DineFlow Emerald
  lineColor = "rgba(20, 184, 166, ", // DineFlow Teal base
}: AetherFlowHeroProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isDarkRef = React.useRef(isDark);

  React.useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse: { x: number | null; y: number | null; radius: number } = {
      x: null,
      y: null,
      radius: 180,
    };

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;

      constructor(
        x: number,
        y: number,
        directionX: number,
        directionY: number,
        size: number
      ) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
      }

      draw() {
        if (!ctx) return;
        const currentDark = isDarkRef.current;
        let isNearMouse = false;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) < mouse.radius) {
            isNearMouse = true;
          }
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, isNearMouse ? this.size * 1.35 : this.size, 0, Math.PI * 2, false);
        if (isNearMouse) {
          // Highlight particle near cursor: white in dark mode, deep emerald in light mode
          ctx.fillStyle = currentDark ? "rgba(255, 255, 255, 0.95)" : "rgba(4, 120, 87, 1)";
        } else {
          // Ambient particle: emerald glow
          ctx.fillStyle = currentDark ? particleColor : "rgba(5, 150, 105, 0.85)";
        }
        ctx.fill();
      }

      update() {
        if (!canvas) return;
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }

        // Mouse collision repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius + this.size) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 3.5;
            this.y -= forceDirectionY * force * 3.5;
          }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    function init() {
      if (!canvas) return;
      particles = [];
      const numberOfParticles = Math.floor((canvas.height * canvas.width) / 10000);
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x =
          Math.random() * (canvas.width - size * 4) + size * 2;
        const y =
          Math.random() * (canvas.height - size * 4) + size * 2;
        const directionX = Math.random() * 0.4 - 0.2;
        const directionY = Math.random() * 0.4 - 0.2;
        particles.push(
          new Particle(x, y, directionX, directionY, size)
        );
      }
    }

    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || window.innerWidth;
      canvas.height = rect?.height || window.innerHeight;
      init();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const connect = () => {
      if (!ctx || !canvas) return;
      const currentDark = isDarkRef.current;

      // Draw subtle ambient cursor glow aura
      if (mouse.x !== null && mouse.y !== null) {
        const aura = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        if (currentDark) {
          aura.addColorStop(0, "rgba(16, 185, 129, 0.16)");
          aura.addColorStop(0.5, "rgba(20, 184, 166, 0.05)");
          aura.addColorStop(1, "rgba(16, 185, 129, 0)");
        } else {
          // Light mode: clean emerald cursor illumination
          aura.addColorStop(0, "rgba(16, 185, 129, 0.16)");
          aura.addColorStop(0.5, "rgba(13, 148, 136, 0.05)");
          aura.addColorStop(1, "rgba(16, 185, 129, 0)");
        }
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fillStyle = aura;
        ctx.fill();
      }

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = dx * dx + dy * dy;

          const maxDist = (canvas.width / 8) * (canvas.height / 8);
          if (distance < maxDist) {
            const opacityValue = Math.max(0, 1 - distance / 22000);

            let isNearMouse = false;
            if (mouse.x !== null && mouse.y !== null) {
              const dxMouse = particles[a].x - mouse.x;
              const dyMouse = particles[a].y - mouse.y;
              const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
              if (distMouse < mouse.radius) {
                isNearMouse = true;
              }
            }

            if (isNearMouse) {
              if (currentDark) {
                // In dark mode: radiant white/emerald connection
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.85})`;
              } else {
                // In light mode: deep vibrant emerald-700 connection (crisp & high contrast)
                ctx.strokeStyle = `rgba(4, 120, 87, ${opacityValue * 0.85})`;
              }
              ctx.lineWidth = 1.35;
            } else {
              if (currentDark) {
                ctx.strokeStyle = `${lineColor}${opacityValue * 0.4})`;
              } else {
                // Light mode ambient constellation lines
                ctx.strokeStyle = `rgba(13, 148, 136, ${opacityValue * 0.35})`;
              }
              ctx.lineWidth = 0.8;
            }

            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!ctx || !canvas) return;

      // Transparent clear so the parent background and ambient glows show through
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = event.clientX;
      const clientY = event.clientY;

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        mouse.x = clientX - rect.left;
        mouse.y = clientY - rect.top;
      } else {
        mouse.x = null;
        mouse.y = null;
      }
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    init();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleColor, lineColor]);

  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15 + 0.2,
        duration: 0.7,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div
      className={cn(
        "relative w-full flex flex-col items-center justify-center overflow-hidden bg-transparent",
        className
      )}
    >
      {/* Interactive Responsive Canvas */}
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 w-full h-full pointer-events-auto", canvasClassName)}
      />

      {/* Overlay Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Overlay HTML Content */}
      {showOverlayContent && (
        <div className="relative z-10 text-center p-6 max-w-5xl mx-auto pointer-events-none">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-xs sm:text-sm font-semibold text-emerald-300">
              {badgeText}
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-white"
          >
            {title || (
              <>
                The Intelligent OS for <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Modern Hospitality
                </span>
              </>
            )}
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed font-normal"
          >
            {subtitle ||
              "Empower your restaurants, cafés, hotels, and cloud kitchens with app-less QR code ordering, real-time Kitchen Displays (KDS), and automated WhatsApp customer billing."}
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
          >
            {ctaHref ? (
              <a
                href={ctaHref}
                onClick={onCtaClick}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold rounded-xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                {primaryCtaText}
                <ArrowRight className="h-4 w-4 text-slate-950" />
              </a>
            ) : (
              <button
                onClick={onCtaClick}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold rounded-xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                {primaryCtaText}
                <ArrowRight className="h-4 w-4 text-slate-950" />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AetherFlowHero;
