"use client";

import React from "react";
import { useTheme } from "@/components/theme-provider";

export interface AetherParticleCanvasProps {
  className?: string;
  particleColor?: string;
  lineColor?: string;
  cursorAuraColor?: string;
  particleDensityDivider?: number;
}

export function AetherParticleCanvas({
  className = "w-full h-full",
  particleColor = "rgba(16, 185, 129, 0.85)",
  lineColor = "rgba(20, 184, 166, ",
  cursorAuraColor = "rgba(16, 185, 129, ",
  particleDensityDivider = 11000,
}: AetherParticleCanvasProps) {
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
      radius: 170,
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
        ctx.arc(
          this.x,
          this.y,
          isNearMouse ? this.size * 1.35 : this.size,
          0,
          Math.PI * 2,
          false
        );
        if (isNearMouse) {
          ctx.fillStyle = currentDark
            ? "rgba(255, 255, 255, 0.95)"
            : "rgba(15, 23, 42, 0.9)";
        } else {
          ctx.fillStyle = currentDark ? particleColor : "rgba(16, 185, 129, 0.75)";
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
            this.x -= forceDirectionX * force * 3.2;
            this.y -= forceDirectionY * force * 3.2;
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
      const numberOfParticles = Math.floor(
        (canvas.height * canvas.width) / particleDensityDivider
      );
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * (canvas.width - size * 4) + size * 2;
        const y = Math.random() * (canvas.height - size * 4) + size * 2;
        const directionX = Math.random() * 0.35 - 0.175;
        const directionY = Math.random() * 0.35 - 0.175;
        particles.push(new Particle(x, y, directionX, directionY, size));
      }
    }

    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect && rect.width > 0 ? Math.floor(rect.width) : window.innerWidth;
      canvas.height = rect && rect.height > 0 ? Math.floor(rect.height) : window.innerHeight;
      init();
    };

    window.addEventListener("resize", resizeCanvas);
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(canvas.parentElement);
    }
    resizeCanvas();

    const connect = () => {
      if (!ctx || !canvas) return;
      const currentDark = isDarkRef.current;

      // Draw subtle ambient cursor glow aura
      if (mouse.x !== null && mouse.y !== null) {
        const aura = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius
        );
        aura.addColorStop(0, `${cursorAuraColor}0.14)`);
        aura.addColorStop(0.5, `${cursorAuraColor}0.04)`);
        aura.addColorStop(1, `${cursorAuraColor}0)`);
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
              ctx.strokeStyle = currentDark
                ? `rgba(255, 255, 255, ${opacityValue * 0.85})`
                : `rgba(15, 23, 42, ${opacityValue * 0.75})`;
              ctx.lineWidth = 1.25;
            } else {
              ctx.strokeStyle = currentDark
                ? `${lineColor}${opacityValue * 0.35})`
                : `rgba(16, 185, 129, ${opacityValue * 0.3})`;
              ctx.lineWidth = 0.75;
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
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleColor, lineColor, cursorAuraColor, particleDensityDivider]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none block ${className}`}
      aria-hidden="true"
    />
  );
}
