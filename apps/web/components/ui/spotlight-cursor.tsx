'use client';
import { useRef, useEffect, HTMLAttributes } from 'react';
import { useTheme } from '@/components/theme-provider';

export interface SpotlightConfig {
  radius?: number;
  brightness?: number;
  color?: string;
  smoothing?: number;
}

export const useSpotlightEffect = (config: SpotlightConfig) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const hexToRgb = (hex: string) => {
      const cleanHex = hex.replace('#', '');
      if (cleanHex.length === 3) {
        const r = parseInt(cleanHex[0] + cleanHex[0], 16);
        const g = parseInt(cleanHex[1] + cleanHex[1], 16);
        const b = parseInt(cleanHex[2] + cleanHex[2], 16);
        return `${r},${g},${b}`;
      }
      const bigint = parseInt(cleanHex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `${r},${g},${b}`;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mouseX !== -1000 && mouseY !== -1000) {
        const gradient = ctx.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, config.radius || 200
        );
        const rgbColor = hexToRgb(config.color || '#10b981');
        gradient.addColorStop(0, `rgba(${rgbColor}, ${config.brightness || 0.15})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.radius, config.brightness, config.color]);

  return canvasRef;
};

export interface ComponentProps extends HTMLAttributes<HTMLCanvasElement> {
  config?: SpotlightConfig;
}

export const Component = ({
  config = {},
  className = '',
  ...rest
}: ComponentProps) => {
  let isDark = true;
  try {
    const themeContext = useTheme();
    isDark = themeContext.resolvedTheme === 'dark';
  } catch {
    isDark = true;
  }

  const spotlightConfig = {
    radius: 260,
    brightness: isDark ? 0.14 : 0.08,
    color: isDark ? '#10b981' : '#059669', // DineFlow Emerald brand theme (adaptive)
    smoothing: 0.1,
    ...config,
  };

  const canvasRef = useSpotlightEffect(spotlightConfig);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] w-full h-full ${className}`}
      {...rest}
    />
  );
};

// Aliases for shadcn component naming conventions
export const SpotlightCursor = Component;
export default Component;
