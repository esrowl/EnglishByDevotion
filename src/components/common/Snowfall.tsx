import React, { useEffect, useRef } from 'react';

interface SnowfallProps {
  particleCount?: number;
  className?: string;
  speed?: number;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  density: number;
  alpha: number;
  speedY: number;
  swaySpeed: number;
  swayAngle: number;
}

export const Snowfall: React.FC<SnowfallProps> = ({
  particleCount = 28,
  className = '',
  speed = 0.6,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 200);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize snowflakes
    const flakes: Snowflake[] = [];
    for (let i = 0; i < particleCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        density: Math.random() * particleCount,
        alpha: Math.random() * 0.5 + 0.35,
        speedY: (Math.random() * 0.7 + 0.3) * speed,
        swaySpeed: Math.random() * 0.02 + 0.005,
        swayAngle: Math.random() * Math.PI * 2,
      });
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden && !motionQuery.matches;
      cancelAnimationFrame(animationFrameId);
      if (isVisible) animationFrameId = requestAnimationFrame(render);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    motionQuery.addEventListener('change',handleVisibilityChange);

    const render = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];

          // Draw soft snowflake
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, false);
          ctx.fillStyle = `rgba(244, 237, 224, ${f.alpha})`; // Snow Ivory #F4EDE0
          ctx.fill();

          // Update position
          f.swayAngle += f.swaySpeed;
          f.x += Math.sin(f.swayAngle) * 0.5;
          f.y += f.speedY;

          // Wrap around edges
          if (f.y > height) {
            f.y = -5;
            f.x = Math.random() * width;
          }
          if (f.x > width) {
            f.x = 0;
          } else if (f.x < 0) {
            f.x = width;
          }
        }
      }

      if (isVisible) animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change',handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`snowfall-canvas absolute inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};
