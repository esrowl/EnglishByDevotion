import React from 'react';

interface SnowAccumulationProps {
  className?: string;
  position?: 'top' | 'bottom';
  height?: number;
}

/**
 * Pixel-art snow accumulation drift that settles along card ledges, window sills, and borders.
 * Inspired by the snowy mountain reference.
 */
export const SnowAccumulation: React.FC<SnowAccumulationProps> = ({
  className = '',
  position = 'top',
  height = 10,
}) => {
  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none z-10 overflow-hidden select-none ${
        position === 'top' ? '-top-[6px]' : '-bottom-[6px]'
      } ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 12"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Crisp Pixel Snow Drift Pattern */}
        <path
          d="M0 12 L0 6 H12 V4 H24 V2 H44 V4 H60 V6 H72 V4 H92 V2 H124 V4 H140 V6 H156 V4 H180 V2 H210 V4 H228 V6 H244 V4 H268 V2 H298 V4 H316 V6 H332 V4 H356 V2 H384 V4 H400 V6 L400 12 Z"
          fill="#FFFFFF"
        />
        {/* Soft Shadow Underneath Snow Drift */}
        <path
          d="M0 12 L0 8 H12 V6 H24 V4 H44 V6 H60 V8 H72 V6 H92 V4 H124 V6 H140 V8 H156 V6 H180 V4 H210 V6 H228 V8 H244 V6 H268 V4 H298 V6 H316 V8 H332 V6 H356 V4 H384 V6 H400 V8 L400 12 Z"
          fill="#D6E4FF"
          opacity="0.75"
        />
        {/* Pixel Sparkle Highlights */}
        <rect x="32" y="3" width="3" height="1.5" fill="#FFFFFF" />
        <rect x="104" y="3" width="3" height="1.5" fill="#FFFFFF" />
        <rect x="192" y="3" width="3" height="1.5" fill="#FFFFFF" />
        <rect x="280" y="3" width="3" height="1.5" fill="#FFFFFF" />
        <rect x="368" y="3" width="3" height="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
