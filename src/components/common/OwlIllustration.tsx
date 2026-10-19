import React from 'react';

interface OwlIllustrationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const OwlIllustration: React.FC<OwlIllustrationProps> = ({
  className = '',
  size = 'hero',
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48 sm:w-56 sm:h-56',
    hero: 'w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${sizeClasses[size]} ${className}`}
      aria-label="Contemplative Owl perched on a snowy winter branch"
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        {/* Retro Geometric Cyber-Moon Background */}
        <circle cx="100" cy="95" r="78" fill="#20152e" stroke="#3d2b52" strokeWidth="2" />
        <circle cx="100" cy="95" r="70" fill="#170f22" stroke="#11686A" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="100" cy="95" r="54" fill="#F5DFBB" fillOpacity="0.06" />

        {/* Pixel Constellation Accents */}
        <rect x="42" y="44" width="4" height="4" fill="#0E9594" fillOpacity="0.8" />
        <rect x="46" y="48" width="2" height="2" fill="#F4EDE0" />
        <rect x="156" y="38" width="4" height="4" fill="#D96B4A" fillOpacity="0.8" />
        <rect x="160" y="42" width="2" height="2" fill="#F5DFBB" />
        <rect x="168" y="78" width="3" height="3" fill="#0E9594" fillOpacity="0.6" />
        <rect x="30" y="96" width="3" height="3" fill="#F4EDE0" fillOpacity="0.7" />
        <rect x="148" y="130" width="4" height="4" fill="#0E9594" fillOpacity="0.5" />

        {/* Winter Snow-Laden Oak/Pine Branch */}
        <path
          d="M10 152 C40 148, 80 156, 120 150 C150 146, 178 152, 192 148 C180 158, 140 166, 85 162 C45 160, 20 156, 10 152 Z"
          fill="#352321"
          stroke="#201413"
          strokeWidth="3"
        />
        {/* Branch Knots, Twigs & Bark Texture */}
        <path d="M45 152 C55 155, 75 154, 90 156" stroke="#201413" strokeWidth="2" strokeLinecap="round" />
        <path d="M125 150 C140 151, 160 150, 175 153" stroke="#201413" strokeWidth="2" strokeLinecap="round" />
        <path d="M150 152 L165 164 L160 166 L148 154 Z" fill="#352321" stroke="#201413" strokeWidth="1.5" />

        {/* Thick Snow Cap on Branch */}
        <path
          d="M25 150 C45 146, 85 148, 118 147 C145 146, 170 148, 180 147 C168 152, 135 153, 105 152 C65 151, 38 153, 25 150 Z"
          fill="#F4EDE0"
          stroke="#F5DFBB"
          strokeWidth="1.2"
        />
        {/* Hanging Snow Pillows / Icicle Droplets */}
        <circle cx="55" cy="154" r="2.5" fill="#F4EDE0" />
        <circle cx="135" cy="153" r="2" fill="#F4EDE0" />
        <circle cx="165" cy="152" r="2" fill="#F4EDE0" />

        {/* Tail Plumage */}
        <path d="M88 144 L94 172 L106 172 L112 144 Z" fill="#201413" stroke="#352321" strokeWidth="2" />
        <path d="M94 144 L97 168 L103 168 L106 144 Z" fill="#352321" />

        {/* Owl Body & Wing Mantle */}
        <ellipse cx="100" cy="112" rx="38" ry="40" fill="#28203D" stroke="#352321" strokeWidth="2.5" />

        {/* Scalloped Chest Feathers (Warm Cream & Terracotta) */}
        <path
          d="M78 100 C82 126, 118 126, 122 100 C120 134, 80 134, 78 100 Z"
          fill="#F5DFBB"
          stroke="#D96B4A"
          strokeWidth="1.5"
        />
        {/* Pixel-Art Feather Chevrons */}
        <path d="M88 108 L100 116 L112 108" stroke="#D96B4A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M86 118 L100 128 L114 118" stroke="#D96B4A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M90 128 L100 136 L110 128" stroke="#D96B4A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M94 138 L100 143 L106 138" stroke="#D96B4A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Left Wing with Layered Coverts */}
        <path
          d="M65 88 C58 114, 70 138, 80 146 C70 130, 64 112, 70 92 Z"
          fill="#352321"
          stroke="#4a3861"
          strokeWidth="2"
        />
        <path d="M68 102 C66 120, 75 136, 80 144" stroke="#11686A" strokeWidth="2" strokeLinecap="round" />
        <path d="M72 110 C70 124, 77 136, 80 142" stroke="#0E9594" strokeWidth="1.5" strokeLinecap="round" />

        {/* Right Wing with Layered Coverts */}
        <path
          d="M135 88 C142 114, 130 138, 120 146 C130 130, 136 112, 130 92 Z"
          fill="#352321"
          stroke="#4a3861"
          strokeWidth="2"
        />
        <path d="M132 102 C134 120, 125 136, 120 144" stroke="#11686A" strokeWidth="2" strokeLinecap="round" />
        <path d="M128 110 C130 124, 123 136, 120 142" stroke="#0E9594" strokeWidth="1.5" strokeLinecap="round" />

        {/* Owl Facial Disc Mask */}
        <ellipse cx="100" cy="70" rx="35" ry="30" fill="#28203D" stroke="#352321" strokeWidth="2" />

        {/* Left Facial Disc */}
        <circle cx="87" cy="70" r="19" fill="#F4EDE0" stroke="#352321" strokeWidth="1.8" />
        {/* Right Facial Disc */}
        <circle cx="113" cy="70" r="19" fill="#F4EDE0" stroke="#352321" strokeWidth="1.8" />

        {/* Facial Disc Shadow Shading */}
        <path d="M72 70 C72 82, 82 88, 87 88 C78 85, 72 78, 72 70 Z" fill="#F5DFBB" />
        <path d="M128 70 C128 82, 118 88, 113 88 C122 85, 128 78, 128 70 Z" fill="#F5DFBB" />

        {/* Prominent Majestic Ear Tufts */}
        <path d="M72 54 L62 32 L82 48 Z" fill="#352321" stroke="#D96B4A" strokeWidth="1.8" />
        <path d="M68 48 L65 36 L76 46 Z" fill="#D96B4A" />

        <path d="M128 54 L138 32 L118 48 Z" fill="#352321" stroke="#D96B4A" strokeWidth="1.8" />
        <path d="M132 48 L135 36 L124 46 Z" fill="#D96B4A" />

        {/* Deep, Intelligent, Glowing Eyes */}
        {/* Left Eye */}
        <circle cx="87" cy="70" r="9.5" fill="#201413" />
        <circle cx="87" cy="70" r="7.5" fill="#D96B4A" />
        <circle cx="87" cy="70" r="5.5" fill="#0E9594" />
        <circle cx="87" cy="70" r="3.5" fill="#140d1c" />
        <rect x="85" y="67" width="2.5" height="2.5" fill="#FFFFFF" />
        <rect x="89" y="71" width="1.5" height="1.5" fill="#F5DFBB" />

        {/* Right Eye */}
        <circle cx="113" cy="70" r="9.5" fill="#201413" />
        <circle cx="113" cy="70" r="7.5" fill="#D96B4A" />
        <circle cx="113" cy="70" r="5.5" fill="#0E9594" />
        <circle cx="113" cy="70" r="3.5" fill="#140d1c" />
        <rect x="111" y="67" width="2.5" height="2.5" fill="#FFFFFF" />
        <rect x="115" y="71" width="1.5" height="1.5" fill="#F5DFBB" />

        {/* Hooked Beak */}
        <path
          d="M96 70 L104 70 L100 84 Z"
          fill="#D96B4A"
          stroke="#201413"
          strokeWidth="1.5"
        />
        <path d="M98 71 L101 71 L100 81 Z" fill="#F5DFBB" fillOpacity="0.5" />

        {/* Strong Talons Gripping the Branch */}
        {/* Left Foot */}
        <ellipse cx="88" cy="150" rx="4.5" ry="3.5" fill="#D96B4A" stroke="#201413" strokeWidth="1.2" />
        <ellipse cx="94" cy="150" rx="4.5" ry="3.5" fill="#D96B4A" stroke="#201413" strokeWidth="1.2" />
        {/* Right Foot */}
        <ellipse cx="106" cy="150" rx="4.5" ry="3.5" fill="#D96B4A" stroke="#201413" strokeWidth="1.2" />
        <ellipse cx="112" cy="150" rx="4.5" ry="3.5" fill="#D96B4A" stroke="#201413" strokeWidth="1.2" />

        {/* Claws Tips */}
        <path d="M85 151 L84 156" stroke="#201413" strokeWidth="2" strokeLinecap="round" />
        <path d="M92 151 L92 157" stroke="#201413" strokeWidth="2" strokeLinecap="round" />
        <path d="M108 151 L108 157" stroke="#201413" strokeWidth="2" strokeLinecap="round" />
        <path d="M115 151 L116 156" stroke="#201413" strokeWidth="2" strokeLinecap="round" />

        {/* Retro Scholar Monocle with Cyberpunk Circuit Line */}
        <circle cx="113" cy="70" r="13" fill="none" stroke="#0E9594" strokeWidth="1.8" />
        <line x1="126" y1="76" x2="140" y2="100" stroke="#0E9594" strokeWidth="1.5" strokeDasharray="3 1.5" />
        <rect x="139" y="99" width="4" height="4" fill="#0E9594" />

        {/* Foreground Pixel-Snow Particles */}
        <circle cx="50" cy="60" r="2.5" fill="#F4EDE0" fillOpacity="0.9" />
        <circle cx="148" cy="52" r="2" fill="#F4EDE0" fillOpacity="0.85" />
        <circle cx="138" cy="112" r="2.2" fill="#F4EDE0" fillOpacity="0.8" />
        <circle cx="40" cy="118" r="2.8" fill="#F4EDE0" fillOpacity="0.9" />
        <circle cx="162" cy="138" r="2" fill="#F4EDE0" fillOpacity="0.75" />
      </svg>
    </div>
  );
};
