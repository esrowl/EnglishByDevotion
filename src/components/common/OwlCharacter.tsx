import React from 'react';

interface OwlCharacterProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero' | 'brand';
  className?: string;
  variant?: 'perched' | 'reading' | 'cyber';
}

export const OwlCharacter: React.FC<OwlCharacterProps> = ({
  size = 'md',
  className = '',
  variant = 'perched',
}) => {
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-11 h-11',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    hero: 'w-36 h-36 sm:w-44 sm:h-44',
    brand: 'w-28 h-28 sm:w-32 sm:h-32',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${sizeMap[size]} ${className}`}
      aria-label="Contemplative Owl mascot perched on winter branch"
    >
      <svg
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Retro Geometric Backdrop Portal */}
        <circle cx="70" cy="65" r="54" fill="#28203D" stroke="#4a3861" strokeWidth="2" />
        <circle cx="70" cy="65" r="48" fill="#1d152a" stroke="#11686A" strokeWidth="1" strokeDasharray="3 3" />

        {/* Ambient Moon / Amber Glow */}
        <circle cx="70" cy="55" r="36" fill="#F5DFBB" fillOpacity="0.08" />

        {/* Distant Snow Constellations / Cybernetic Pixels */}
        <rect x="34" y="32" width="3" height="3" fill="#0E9594" fillOpacity="0.7" />
        <rect x="102" y="28" width="2" height="2" fill="#F5DFBB" fillOpacity="0.8" />
        <rect x="110" y="52" width="3" height="3" fill="#D96B4A" fillOpacity="0.6" />
        <rect x="26" y="68" width="2" height="2" fill="#F4EDE0" fillOpacity="0.8" />
        <rect x="98" y="90" width="3" height="3" fill="#0E9594" fillOpacity="0.5" />

        {/* Winter Gnarled Branch */}
        <path
          d="M8 108 C30 105, 60 110, 85 106 C105 103, 125 108, 134 105 C125 112, 90 118, 50 115 C25 113, 12 110, 8 108 Z"
          fill="#352321"
          stroke="#231716"
          strokeWidth="2"
        />
        {/* Bark Knots & Grain */}
        <path d="M35 108 C42 110, 55 109, 65 111" stroke="#231716" strokeWidth="1.5" />
        <path d="M90 106 C100 107, 115 106, 122 108" stroke="#231716" strokeWidth="1.5" />

        {/* Snow Layer on Branch */}
        <path
          d="M20 106.5 C35 103.5, 65 105, 85 104.5 C102 104, 118 105, 124 104.5 C115 107, 95 107.5, 75 107 C45 106, 28 107.5, 20 106.5 Z"
          fill="#F4EDE0"
          stroke="#F5DFBB"
          strokeWidth="0.8"
        />

        {/* Tail Feathers */}
        <path d="M62 102 L66 122 L74 122 L78 102 Z" fill="#231716" stroke="#352321" strokeWidth="1.2" />
        <path d="M66 102 L68 120 L72 120 L74 102 Z" fill="#352321" />

        {/* Main Body (Deep Plum & Espresso) */}
        <ellipse cx="70" cy="78" rx="28" ry="30" fill="#28203D" stroke="#352321" strokeWidth="2" />

        {/* Chest Plumage (Warm Cream & Terracotta scalloped feathers) */}
        <path
          d="M54 70 C58 88, 82 88, 86 70 C84 94, 56 94, 54 70 Z"
          fill="#F5DFBB"
          stroke="#D96B4A"
          strokeWidth="1"
        />
        {/* Feather Barbs (Pixel/Retro chevron details) */}
        <path d="M62 76 L70 82 L78 76" stroke="#D96B4A" strokeWidth="1.5" fill="none" />
        <path d="M60 84 L70 91 L80 84" stroke="#D96B4A" strokeWidth="1.5" fill="none" />
        <path d="M64 92 L70 97 L76 92" stroke="#D96B4A" strokeWidth="1.5" fill="none" />

        {/* Folded Wings with Shading & Highlights */}
        {/* Left Wing */}
        <path
          d="M44 60 C40 80, 50 98, 56 104 C49 92, 45 78, 48 64 Z"
          fill="#352321"
          stroke="#4a3861"
          strokeWidth="1.5"
        />
        <path d="M47 70 C45 84, 52 96, 56 102" stroke="#11686A" strokeWidth="1.5" />

        {/* Right Wing */}
        <path
          d="M96 60 C100 80, 90 98, 84 104 C91 92, 95 78, 92 64 Z"
          fill="#352321"
          stroke="#4a3861"
          strokeWidth="1.5"
        />
        <path d="M93 70 C95 84, 88 96, 84 102" stroke="#11686A" strokeWidth="1.5" />

        {/* Owl Head Disk (Heart-shaped / Pale Mask) */}
        <ellipse cx="70" cy="48" rx="25" ry="22" fill="#28203D" stroke="#352321" strokeWidth="1.5" />

        {/* Left Facial Disc */}
        <circle cx="61" cy="48" r="14" fill="#F4EDE0" stroke="#352321" strokeWidth="1.2" />
        {/* Right Facial Disc */}
        <circle cx="79" cy="48" r="14" fill="#F4EDE0" stroke="#352321" strokeWidth="1.2" />

        {/* Facial Disc Shadows */}
        <path d="M50 48 C50 56, 58 60, 61 60 C54 58, 50 54, 50 48 Z" fill="#F5DFBB" />
        <path d="M90 48 C90 56, 82 60, 79 60 C86 58, 90 54, 90 48 Z" fill="#F5DFBB" />

        {/* Prominent Feather Brow Tufts (Ear Tufts) */}
        <path d="M50 36 L43 20 L57 32 Z" fill="#352321" stroke="#D96B4A" strokeWidth="1.2" />
        <path d="M46 32 L44 24 L52 30 Z" fill="#D96B4A" />

        <path d="M90 36 L97 20 L83 32 Z" fill="#352321" stroke="#D96B4A" strokeWidth="1.2" />
        <path d="M94 32 L96 24 L88 30 Z" fill="#D96B4A" />

        {/* Expressive Contemplative Eyes */}
        {/* Left Eye */}
        <circle cx="61" cy="48" r="7" fill="#352321" />
        <circle cx="61" cy="48" r="5.5" fill="#D96B4A" />
        <circle cx="61" cy="48" r="4" fill="#0E9594" />
        <circle cx="61" cy="48" r="2.5" fill="#150f1e" />
        <rect x="59.5" y="46" width="2" height="2" fill="#FFFFFF" />
        <rect x="62.5" y="49" width="1" height="1" fill="#F5DFBB" />

        {/* Right Eye */}
        <circle cx="79" cy="48" r="7" fill="#352321" />
        <circle cx="79" cy="48" r="5.5" fill="#D96B4A" />
        <circle cx="79" cy="48" r="4" fill="#0E9594" />
        <circle cx="79" cy="48" r="2.5" fill="#150f1e" />
        <rect x="77.5" y="46" width="2" height="2" fill="#FFFFFF" />
        <rect x="80.5" y="49" width="1" height="1" fill="#F5DFBB" />

        {/* Sharp Beak */}
        <path
          d="M67 48 L73 48 L70 59 Z"
          fill="#D96B4A"
          stroke="#231716"
          strokeWidth="1"
        />
        <path d="M69 49 L71 49 L70 57 Z" fill="#F5DFBB" fillOpacity="0.4" />

        {/* Strong Talons Gripping Branch */}
        {/* Left Foot */}
        <ellipse cx="61" cy="107" rx="3.5" ry="3" fill="#D96B4A" stroke="#231716" strokeWidth="1" />
        <ellipse cx="66" cy="107" rx="3.5" ry="3" fill="#D96B4A" stroke="#231716" strokeWidth="1" />
        {/* Right Foot */}
        <ellipse cx="74" cy="107" rx="3.5" ry="3" fill="#D96B4A" stroke="#231716" strokeWidth="1" />
        <ellipse cx="79" cy="107" rx="3.5" ry="3" fill="#D96B4A" stroke="#231716" strokeWidth="1" />

        {/* Claws Tips */}
        <path d="M59 108 L58 112" stroke="#231716" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M64 108 L64 113" stroke="#231716" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M76 108 L76 113" stroke="#231716" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M81 108 L82 112" stroke="#231716" strokeWidth="1.5" strokeLinecap="round" />

        {/* Retro Scholar Monocle for 'reading' / 'cyber' */}
        {(variant === 'reading' || variant === 'cyber') && (
          <>
            <circle cx="79" cy="48" r="9.5" fill="none" stroke="#0E9594" strokeWidth="1.5" />
            <line x1="88" y1="52" x2="98" y2="70" stroke="#0E9594" strokeWidth="1" strokeDasharray="2 1" />
            <rect x="97" y="69" width="3" height="3" fill="#0E9594" />
          </>
        )}

        {/* Foreground Drifting Snow Flakes */}
        <circle cx="36" cy="44" r="1.8" fill="#F4EDE0" fillOpacity="0.9" />
        <circle cx="106" cy="38" r="1.4" fill="#F4EDE0" fillOpacity="0.85" />
        <circle cx="98" cy="80" r="1.5" fill="#F4EDE0" fillOpacity="0.8" />
        <circle cx="28" cy="84" r="2" fill="#F4EDE0" fillOpacity="0.9" />
        <circle cx="116" cy="98" r="1.5" fill="#F4EDE0" fillOpacity="0.75" />
      </svg>
    </div>
  );
};
