import React from 'react';

interface StudyRoomWindowProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

/**
 * A cozy study-room window overlooking a snowy mountain peak and glowing cyberpunk city skyline at night.
 * Inspired directly by the user's uploaded snow mountain and neon city visual references.
 */
export const StudyRoomWindow: React.FC<StudyRoomWindowProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`relative rounded-none border-2 border-black bg-[#0A0B1A] overflow-hidden shadow-[4px_4px_0px_#000000] select-none ${className}`}
      aria-label="Study room window overlooking pixel-art snowy mountain and neon city"
    >
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="skyNight" x1="200" y1="0" x2="200" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#08091E" />
            <stop offset="45%" stopColor="#12143E" />
            <stop offset="85%" stopColor="#211842" />
            <stop offset="100%" stopColor="#2E1B38" />
          </linearGradient>

          {/* Window pane glass reflection */}
          <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#20B7B0" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* 1. Deep Night Sky */}
        <rect x="0" y="0" width="400" height="240" fill="url(#skyNight)" />

        {/* Pixel Stars & Constellations */}
        <rect x="30" y="24" width="2" height="2" fill="#FFFFFF" opacity="0.9" />
        <rect x="65" y="40" width="1.5" height="1.5" fill="#20B7B0" opacity="0.8" />
        <rect x="90" y="18" width="2" height="2" fill="#FFFFFF" opacity="0.95" />
        <rect x="130" y="32" width="1.5" height="1.5" fill="#F36B24" opacity="0.75" />
        <rect x="175" y="14" width="2.5" height="2.5" fill="#FFFFFF" opacity="0.9" />
        <rect x="220" y="28" width="1.5" height="1.5" fill="#20B7B0" opacity="0.8" />
        <rect x="260" y="16" width="2" height="2" fill="#FFFFFF" opacity="0.85" />
        <rect x="310" y="38" width="1.5" height="1.5" fill="#FFFFFF" opacity="0.7" />
        <rect x="355" y="22" width="2.5" height="2.5" fill="#F36B24" opacity="0.8" />
        <rect x="380" y="45" width="1.5" height="1.5" fill="#20B7B0" opacity="0.9" />

        {/* 2. Snowy Mountain Peak Silhouette in Background (Reference 4) */}
        {/* Mountain Base / Dark Mass */}
        <polygon
          points="20,170 120,60 145,75 190,40 240,85 285,55 380,170"
          fill="#111736"
        />
        {/* Mountain Middle Ridge */}
        <polygon
          points="60,170 120,60 145,75 190,40 230,170"
          fill="#17224D"
        />
        {/* Snow Slopes & Highlights on the Peaks (White Pixel Shading) */}
        <polygon
          points="190,40 175,70 185,90 195,120 210,105 215,80 205,55"
          fill="#FFFFFF"
        />
        <polygon
          points="120,60 110,85 118,105 130,130 135,100 130,75"
          fill="#FFFFFF"
        />
        <polygon
          points="285,55 270,85 280,105 295,130 300,95 295,70"
          fill="#FFFFFF"
        />
        {/* Distant mountain blue snow shading */}
        <polygon
          points="190,40 195,65 198,90 205,120 215,105 215,80"
          fill="#94B7EB"
          opacity="0.6"
        />

        {/* 3. Cyberpunk Neon City Skyline in Foreground (Reference 5) */}
        {/* Distant dark skyline silhouetted blocks */}
        <rect x="15" y="110" width="30" height="90" fill="#0D1024" />
        <rect x="50" y="95" width="35" height="105" fill="#0E122B" />
        <rect x="90" y="115" width="25" height="85" fill="#0A0D20" />
        <rect x="120" y="85" width="45" height="115" fill="#0E132E" />
        <rect x="170" y="70" width="55" height="130" fill="#131738" />
        <rect x="230" y="90" width="38" height="110" fill="#0F1430" />
        <rect x="272" y="105" width="42" height="95" fill="#0C1026" />
        <rect x="320" y="80" width="48" height="120" fill="#121738" />
        <rect x="372" y="110" width="30" height="90" fill="#0D1128" />

        {/* Tower Spire / Antennas */}
        <rect x="195" y="48" width="4" height="24" fill="#F36B24" />
        <rect x="196" y="42" width="2" height="8" fill="#FFFFFF" />
        <circle cx="197" cy="40" r="2" fill="#F36B24" />

        <rect x="342" y="60" width="3" height="22" fill="#20B7B0" />
        <circle cx="343.5" cy="58" r="2" fill="#20B7B0" />

        {/* Neon Windows on Buildings (Glowing Pixels matching Ref 5) */}
        {/* Tower 1: Cyan / Turquoise Neon Grid */}
        <g fill="#20B7B0">
          <rect x="55" y="102" width="5" height="2" />
          <rect x="64" y="102" width="5" height="2" />
          <rect x="73" y="102" width="5" height="2" />
          <rect x="55" y="110" width="5" height="2" />
          <rect x="73" y="110" width="5" height="2" />
          <rect x="55" y="118" width="5" height="2" />
          <rect x="64" y="118" width="5" height="2" />
          <rect x="55" y="126" width="5" height="2" />
          <rect x="73" y="126" width="5" height="2" />
          <rect x="64" y="134" width="5" height="2" />
          <rect x="55" y="142" width="5" height="2" />
          <rect x="73" y="142" width="5" height="2" />
          <rect x="55" y="150" width="5" height="2" />
          <rect x="64" y="150" width="5" height="2" />
        </g>

        {/* Tower 2: Amber & Orange Glowing Windows */}
        <g fill="#F36B24">
          <rect x="126" y="92" width="6" height="2" />
          <rect x="136" y="92" width="6" height="2" />
          <rect x="146" y="92" width="6" height="2" />
          <rect x="126" y="100" width="6" height="2" />
          <rect x="146" y="100" width="6" height="2" />
          <rect x="136" y="108" width="6" height="2" />
          <rect x="126" y="116" width="6" height="2" />
          <rect x="146" y="116" width="6" height="2" />
          <rect x="126" y="124" width="6" height="2" />
          <rect x="136" y="124" width="6" height="2" />
          <rect x="146" y="124" width="6" height="2" />
          <rect x="136" y="132" width="6" height="2" />
          <rect x="126" y="140" width="6" height="2" />
          <rect x="146" y="140" width="6" height="2" />
        </g>

        {/* Center Highrise: Neon Diamond Emblem + Magenta/Green Windows */}
        {/* Neon Diamond (Bank of China style as in Ref 5) */}
        <polygon
          points="197,80 212,95 197,110 182,95"
          fill="none"
          stroke="#20B7B0"
          strokeWidth="2"
        />
        <g fill="#FFF4D8">
          <rect x="178" y="120" width="4" height="3" />
          <rect x="186" y="120" width="4" height="3" />
          <rect x="204" y="120" width="4" height="3" />
          <rect x="212" y="120" width="4" height="3" />
          <rect x="178" y="130" width="4" height="3" />
          <rect x="194" y="130" width="4" height="3" />
          <rect x="212" y="130" width="4" height="3" />
          <rect x="186" y="140" width="4" height="3" />
          <rect x="204" y="140" width="4" height="3" />
          <rect x="178" y="150" width="4" height="3" />
          <rect x="212" y="150" width="4" height="3" />
        </g>

        {/* Right Tower: Green & Lime Windows */}
        <g fill="#4ADE80">
          <rect x="236" y="98" width="5" height="2" />
          <rect x="246" y="98" width="5" height="2" />
          <rect x="256" y="98" width="5" height="2" />
          <rect x="236" y="108" width="5" height="2" />
          <rect x="256" y="108" width="5" height="2" />
          <rect x="246" y="118" width="5" height="2" />
          <rect x="236" y="128" width="5" height="2" />
          <rect x="246" y="128" width="5" height="2" />
          <rect x="256" y="128" width="5" height="2" />
          <rect x="246" y="138" width="5" height="2" />
          <rect x="236" y="148" width="5" height="2" />
          <rect x="256" y="148" width="5" height="2" />
        </g>

        {/* Large Tower 4: Magenta & Warm Orange */}
        <g fill="#E879F9">
          <rect x="328" y="90" width="6" height="2.5" />
          <rect x="340" y="90" width="6" height="2.5" />
          <rect x="352" y="90" width="6" height="2.5" />
          <rect x="328" y="100" width="6" height="2.5" />
          <rect x="352" y="100" width="6" height="2.5" />
          <rect x="340" y="110" width="6" height="2.5" />
          <rect x="328" y="120" width="6" height="2.5" />
          <rect x="340" y="120" width="6" height="2.5" />
          <rect x="352" y="120" width="6" height="2.5" />
          <rect x="328" y="130" width="6" height="2.5" />
          <rect x="352" y="130" width="6" height="2.5" />
          <rect x="340" y="140" width="6" height="2.5" />
        </g>

        {/* 4. Harbor / Waterline & Pixel Reflections at Base */}
        <rect x="0" y="195" width="400" height="45" fill="#080918" />
        {/* Pixel Reflections in Water */}
        <g opacity="0.6">
          <rect x="55" y="202" width="18" height="2" fill="#20B7B0" />
          <rect x="62" y="210" width="12" height="2" fill="#20B7B0" />
          <rect x="126" y="204" width="22" height="2" fill="#F36B24" />
          <rect x="134" y="212" width="14" height="2" fill="#F36B24" />
          <rect x="184" y="200" width="30" height="2" fill="#20B7B0" />
          <rect x="190" y="208" width="20" height="2" fill="#FFF4D8" />
          <rect x="238" y="205" width="18" height="2" fill="#4ADE80" />
          <rect x="330" y="203" width="26" height="2" fill="#E879F9" />
          <rect x="338" y="212" width="16" height="2" fill="#E879F9" />
        </g>

        {/* 5. Drifting Pixel Snowflakes in Front of City */}
        <g fill="#FFFFFF" opacity="0.85">
          <rect x="42" y="60" width="2" height="2" />
          <rect x="88" y="92" width="2.5" height="2.5" />
          <rect x="155" y="65" width="2" height="2" />
          <rect x="215" y="110" width="3" height="3" />
          <rect x="270" y="80" width="2" height="2" />
          <rect x="305" y="140" width="2.5" height="2.5" />
          <rect x="365" y="95" width="2" height="2" />
          <rect x="110" y="160" width="3" height="3" />
          <rect x="180" y="175" width="2" height="2" />
          <rect x="250" y="185" width="2.5" height="2.5" />
        </g>

        {/* 6. Window Frame & Mullions (Retro 90s Study Room Frame) */}
        {/* Glass Glare Overlay */}
        <rect x="0" y="0" width="400" height="240" fill="url(#glassGlare)" />

        {/* Outer Frame */}
        <rect x="0" y="0" width="400" height="240" fill="none" stroke="#211A55" strokeWidth="12" />
        <rect x="6" y="6" width="388" height="228" fill="none" stroke="#000000" strokeWidth="2" />

        {/* Central Vertical Mullion */}
        <rect x="196" y="0" width="8" height="240" fill="#211A55" stroke="#000000" strokeWidth="1.5" />
        {/* Horizontal Mullion */}
        <rect x="0" y="116" width="400" height="8" fill="#211A55" stroke="#000000" strokeWidth="1.5" />

        {/* 7. Thick Pixel Snow Accumulated on Window Sill Ledge (Bottom) */}
        <path
          d="M0 240 L0 228 H20 V224 H50 V222 H90 V224 H130 V226 H170 V222 H210 V220 H250 V224 H290 V222 H340 V225 H380 V223 H400 V228 L400 240 Z"
          fill="#FFFFFF"
        />
        <path
          d="M0 240 L0 232 H20 V228 H50 V226 H90 V228 H130 V230 H170 V226 H210 V224 H250 V228 H290 V226 H340 V229 H380 V227 H400 V232 L400 240 Z"
          fill="#D6E4FF"
          opacity="0.8"
        />
        {/* Snow on the middle mullion cross */}
        <path
          d="M0 120 H196 V117 H204 V117 H400 V120 H0 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
