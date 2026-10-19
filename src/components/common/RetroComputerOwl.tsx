import React from 'react';

interface RetroComputerOwlProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const RetroComputerOwl: React.FC<RetroComputerOwlProps> = ({
  className = '',
  size = 'hero',
}) => {
  const sizeClasses = {
    sm: 'w-48 h-48',
    md: 'w-64 h-64',
    lg: 'w-80 h-80',
    hero: 'w-72 h-72 sm:w-96 sm:h-96 lg:w-[440px] lg:h-[440px]',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${sizeClasses[size]} ${className}`}
      aria-label="90s Retro CRT Computer displaying EnglishByDevotion Owl"
    >
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Halftone dot pattern for the purple starburst */}
          <pattern id="dotPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.5" fill="#4B2C82" />
          </pattern>
        </defs>

        {/* 1. Purple Retro Comic / Starburst Background */}
        <path
          d="M160 10 L185 50 L230 35 L235 80 L280 85 L265 130 L305 155 L275 190 L300 230 L255 240 L250 285 L205 275 L180 310 L145 285 L115 310 L90 275 L45 285 L40 240 L-5 230 L20 190 L-10 155 L30 130 L15 85 L60 80 L65 35 L110 50 Z"
          fill="#6543A5"
          stroke="#000000"
          strokeWidth="3"
        />
        <path
          d="M160 10 L185 50 L230 35 L235 80 L280 85 L265 130 L305 155 L275 190 L300 230 L255 240 L250 285 L205 275 L180 310 L145 285 L115 310 L90 275 L45 285 L40 240 L-5 230 L20 190 L-10 155 L30 130 L15 85 L60 80 L65 35 L110 50 Z"
          fill="url(#dotPattern)"
          opacity="0.6"
        />

        {/* Pixel Star Accents (Golden & Turquoise) */}
        {/* Top Left Star */}
        <rect x="36" y="44" width="6" height="6" fill="#F36B24" />
        <rect x="30" y="50" width="6" height="6" fill="#F36B24" />
        <rect x="42" y="50" width="6" height="6" fill="#F36B24" />
        <rect x="36" y="56" width="6" height="6" fill="#F36B24" />
        <rect x="36" y="50" width="6" height="6" fill="#FFF4D8" />

        {/* Top Right Star */}
        <rect x="270" y="54" width="5" height="5" fill="#20B7B0" />
        <rect x="265" y="59" width="5" height="5" fill="#20B7B0" />
        <rect x="275" y="59" width="5" height="5" fill="#20B7B0" />
        <rect x="270" y="64" width="5" height="5" fill="#20B7B0" />
        <rect x="270" y="59" width="5" height="5" fill="#FFFFFF" />

        {/* Bottom Left Sparkle */}
        <rect x="24" y="220" width="4" height="4" fill="#20B7B0" />
        <rect x="284" y="210" width="4" height="4" fill="#F36B24" />

        {/* 2. CRT Monitor Housing (Beige 90s Casing) */}
        {/* Shadow under monitor */}
        <rect x="68" y="48" width="184" height="154" rx="10" fill="#000000" />
        
        {/* Outer Beige Bezel */}
        <rect x="64" y="44" width="184" height="150" rx="10" fill="#E8DEC8" stroke="#000000" strokeWidth="3.5" />
        
        {/* Inner Bezel Chamfer Highlight */}
        <rect x="74" y="54" width="164" height="130" rx="6" fill="#D2C5AC" stroke="#000000" strokeWidth="2.5" />
        
        {/* Inner CRT Screen Bezel (Dark Recess) */}
        <rect x="82" y="62" width="148" height="114" rx="4" fill="#1A1C30" stroke="#000000" strokeWidth="2.5" />

        {/* 3. CRT Screen (Turquoise Cyan Glass) */}
        <rect x="86" y="66" width="140" height="106" rx="3" fill="#169894" />
        
        {/* Screen Scanlines / Grid */}
        <line x1="86" y1="80" x2="226" y2="80" stroke="#127E7B" strokeWidth="1" />
        <line x1="86" y1="94" x2="226" y2="94" stroke="#127E7B" strokeWidth="1" />
        <line x1="86" y1="108" x2="226" y2="108" stroke="#127E7B" strokeWidth="1" />
        <line x1="86" y1="122" x2="226" y2="122" stroke="#127E7B" strokeWidth="1" />
        <line x1="86" y1="136" x2="226" y2="136" stroke="#127E7B" strokeWidth="1" />
        <line x1="86" y1="150" x2="226" y2="150" stroke="#127E7B" strokeWidth="1" />
        <line x1="86" y1="164" x2="226" y2="164" stroke="#127E7B" strokeWidth="1" />

        {/* 4. Inside Screen: Pixel Owl & Folder */}
        {/* Yellow Pixel Folder */}
        <path
          d="M130 84 H152 V88 H178 V120 H130 Z"
          fill="#F7C948"
          stroke="#000000"
          strokeWidth="2"
        />
        <path
          d="M130 92 H178 V120 H130 Z"
          fill="#FADB5F"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Folder tab highlight */}
        <rect x="134" y="86" width="14" height="4" fill="#FFF3C4" />

        {/* Pixel Owl Mascot perched on folder */}
        {/* Owl Body */}
        <rect x="144" y="94" width="20" height="20" rx="3" fill="#211A55" stroke="#000000" strokeWidth="1.5" />
        {/* Owl Belly */}
        <rect x="148" y="102" width="12" height="10" fill="#F8E7BE" />
        {/* Ear tufts */}
        <polygon points="144,94 148,88 150,94" fill="#F36B24" stroke="#000000" strokeWidth="1" />
        <polygon points="164,94 160,88 158,94" fill="#F36B24" stroke="#000000" strokeWidth="1" />
        {/* Big Owl Eyes */}
        <rect x="146" y="96" width="6" height="6" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
        <rect x="156" y="96" width="6" height="6" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
        {/* Pupils (Teal & Black) */}
        <rect x="148" y="98" width="3" height="3" fill="#11133D" />
        <rect x="158" y="98" width="3" height="3" fill="#11133D" />
        <rect x="149" y="98" width="1" height="1" fill="#FFFFFF" />
        <rect x="159" y="98" width="1" height="1" fill="#FFFFFF" />
        {/* Beak */}
        <polygon points="152,102 156,102 154,106" fill="#F36B24" stroke="#000000" strokeWidth="0.8" />
        {/* Feet */}
        <rect x="147" y="114" width="4" height="2" fill="#F36B24" stroke="#000000" strokeWidth="0.8" />
        <rect x="157" y="114" width="4" height="2" fill="#F36B24" stroke="#000000" strokeWidth="0.8" />

        {/* Text inside screen: welcome.voc */}
        <rect x="110" y="130" width="92" height="16" fill="#11133D" stroke="#000000" strokeWidth="1.5" />
        <text
          x="156"
          y="142"
          fill="#F8E7BE"
          fontFamily="'VT323'"
          fontSize="7"
          textAnchor="middle"
        >
          welcome.voc
        </text>

        {/* Pixel Cursor Pointer */}
        <path
          d="M182 136 L182 152 L186 148 L191 156 L194 154 L189 146 L195 146 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1.5"
        />

        {/* CRT Glass Reflection Glare */}
        <polygon points="88,68 126,68 96,150 88,150" fill="#FFFFFF" opacity="0.15" />

        {/* Monitor Base Pedestal Swivel */}
        <polygon points="130,194 182,194 190,206 122,206" fill="#C2B59D" stroke="#000000" strokeWidth="3" />

        {/* 5. Desktop Computer Base Unit (Horizontal Box) */}
        {/* Shadow */}
        <rect x="46" y="210" width="224" height="52" rx="4" fill="#000000" />
        
        {/* Main Base Case */}
        <rect x="42" y="206" width="224" height="48" rx="4" fill="#E8DEC8" stroke="#000000" strokeWidth="3.5" />
        
        {/* 3.5" Floppy Disk Drive Slot */}
        <rect x="176" y="218" width="70" height="8" rx="2" fill="#3D3A35" stroke="#000000" strokeWidth="2" />
        <rect x="178" y="221" width="56" height="2" fill="#1A1C30" />
        {/* Eject button */}
        <rect x="238" y="220" width="6" height="4" fill="#C2B59D" stroke="#000000" strokeWidth="1" />
        
        {/* Power switch & LEDs */}
        <circle cx="64" cy="222" r="4" fill="#20B7B0" stroke="#000000" strokeWidth="1.5" />
        <circle cx="78" cy="222" r="3" fill="#F36B24" stroke="#000000" strokeWidth="1" />
        {/* Ventilation Slits */}
        <line x1="100" y1="218" x2="154" y2="218" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        <line x1="100" y1="224" x2="154" y2="224" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

        {/* 6. Vintage Mechanical Keyboard */}
        {/* Shadow */}
        <polygon points="34,260 274,260 254,302 14,302" fill="#000000" />
        
        {/* Keyboard Body */}
        <polygon points="30,256 270,256 250,298 10,298" fill="#D2C5AC" stroke="#000000" strokeWidth="3.5" />
        
        {/* Keyboard Key Grid (Rows of Keys) */}
        {/* Top Function Key Strip */}
        <polygon points="40,260 258,260 254,266 36,266" fill="#3D3A35" stroke="#000000" strokeWidth="1.5" />
        {/* Row 1 Keys */}
        <polygon points="38,268 252,268 248,274 34,274" fill="#E8DEC8" stroke="#000000" strokeWidth="1.5" />
        {/* Row 2 Keys */}
        <polygon points="35,276 246,276 242,282 31,282" fill="#E8DEC8" stroke="#000000" strokeWidth="1.5" />
        {/* Row 3 Spacebar Row */}
        <polygon points="32,284 240,284 234,292 26,292" fill="#E8DEC8" stroke="#000000" strokeWidth="1.5" />
        {/* Spacebar highlight */}
        <polygon points="90,285 180,285 176,291 86,291" fill="#F8E7BE" stroke="#000000" strokeWidth="1" />

        {/* 7. Retro Badge Attached to Bottom-Right */}
        <g transform="translate(194, 252)">
          <rect x="2" y="2" width="112" height="42" rx="3" fill="#000000" />
          <rect x="0" y="0" width="112" height="42" rx="3" fill="#211A55" stroke="#6543A5" strokeWidth="2.5" />
          <text
            x="56"
            y="14"
            fill="#F36B24"
            fontFamily="'VT323'"
            fontSize="6"
            textAnchor="middle"
          >
            BEST LEARNED
          </text>
          <text
            x="56"
            y="25"
            fill="#20B7B0"
            fontFamily="'VT323'"
            fontSize="7"
            textAnchor="middle"
          >
            IN DAILY
          </text>
          <text
            x="56"
            y="35"
            fill="#F8E7BE"
            fontFamily="'VT323'"
            fontSize="6"
            textAnchor="middle"
          >
            SESSIONS
          </text>
        </g>
      </svg>
    </div>
  );
};
