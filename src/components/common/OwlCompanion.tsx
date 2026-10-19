import React from 'react';

export type OwlVariant =
  | 'hatched_cream'     // Reference 1: Linework hatched owl with radial facial disc & bold eyes
  | 'barn_branch'       // Reference 2: Serene barn owl perched on branch with closed eyes & chevron feathers
  | 'snowy_celestial'   // Reference 3: Celestial snowy owl with circular orbit & 4-point stars
  | 'scholar_monocle';  // Reference 4: Cyber/retro scholar owl with teal monocle

interface OwlCompanionProps {
  variant?: OwlVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero' | 'brand';
  className?: string;
  speechText?: string;
}

export const OwlCompanion: React.FC<OwlCompanionProps> = ({
  variant = 'hatched_cream',
  size = 'md',
  className = '',
  speechText,
}) => {
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    hero: 'w-48 h-48 sm:w-56 sm:h-56',
    brand: 'w-36 h-36',
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center flex-shrink-0 select-none ${className}`}
      aria-label={`Owl Study Companion (${variant})`}
    >
      {/* Optional Speech Bubble */}
      {speechText && (
        <div className="absolute -top-9 z-20 bg-[#FFF4D8] border-2 border-black px-2.5 py-1 text-[10px] font-pixel text-black shadow-[2px_2px_0px_#000000] whitespace-nowrap">
          {speechText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FFF4D8] border-r-2 border-b-2 border-black rotate-45"></div>
        </div>
      )}

      <div className={`${sizeMap[size]} relative`}>
        {/* =========================================================================
            VARIANT 1: HATCHED CREAM OWL (Reference 1)
            Distinctive radial linear facial disc, deep round eyes, linework hatching
            ========================================================================= */}
        {variant === 'hatched_cream' && (
          <svg viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
            {/* Body Base (Warm Pale Cream) */}
            <path
              d="M75 60 C40 85, 25 140, 30 185 C32 205, 45 220, 70 230 C90 238, 120 235, 140 215 C165 190, 175 140, 160 85 C150 55, 110 50, 75 60 Z"
              fill="#F4EDE0"
              stroke="#19182A"
              strokeWidth="4"
            />

            {/* Left Wing Mantle */}
            <path
              d="M60 85 C35 120, 20 170, 40 215 C30 190, 28 145, 50 100 Z"
              fill="#EFE4D2"
              stroke="#19182A"
              strokeWidth="3.5"
            />
            {/* Wing Feather Hatching Marks (Matching Ref 1) */}
            <g stroke="#19182A" strokeWidth="2.5" strokeLinecap="round">
              <line x1="45" y1="120" x2="52" y2="135" />
              <line x1="42" y1="145" x2="48" y2="160" />
              <line x1="38" y1="170" x2="44" y2="185" />
              <line x1="60" y1="110" x2="68" y2="125" />
              <line x1="58" y1="135" x2="65" y2="150" />
              <line x1="55" y1="160" x2="62" y2="175" />
              <line x1="75" y1="125" x2="82" y2="140" />
              <line x1="72" y1="150" x2="78" y2="165" />
            </g>

            {/* Tail Plumage with Hatching */}
            <path
              d="M50 200 L45 235 L70 242 L95 240 L90 205 Z"
              fill="#E8DCB8"
              stroke="#19182A"
              strokeWidth="3.5"
            />
            <g stroke="#19182A" strokeWidth="2.5" strokeLinecap="round">
              <line x1="52" y1="210" x2="52" y2="230" />
              <line x1="62" y1="208" x2="62" y2="235" />
              <line x1="72" y1="210" x2="72" y2="235" />
              <line x1="82" y1="210" x2="82" y2="230" />
            </g>

            {/* Chest & Belly Linear Stippling/Hatching (Distinctive Ref 1 texture) */}
            <g stroke="#19182A" strokeWidth="2.5" strokeLinecap="round">
              {/* Row 1 */}
              <line x1="85" y1="100" x2="85" y2="110" />
              <line x1="95" y1="98" x2="95" y2="108" />
              <line x1="105" y1="98" x2="105" y2="108" />
              <line x1="115" y1="100" x2="115" y2="110" />
              <line x1="125" y1="104" x2="125" y2="114" />
              {/* Row 2 */}
              <line x1="80" y1="120" x2="80" y2="132" />
              <line x1="90" y1="118" x2="90" y2="130" />
              <line x1="100" y1="116" x2="100" y2="128" />
              <line x1="110" y1="116" x2="110" y2="128" />
              <line x1="120" y1="118" x2="120" y2="130" />
              <line x1="130" y1="122" x2="130" y2="134" />
              {/* Row 3 */}
              <line x1="82" y1="140" x2="82" y2="152" />
              <line x1="92" y1="138" x2="92" y2="150" />
              <line x1="102" y1="136" x2="102" y2="148" />
              <line x1="112" y1="136" x2="112" y2="148" />
              <line x1="122" y1="138" x2="122" y2="150" />
              <line x1="132" y1="142" x2="132" y2="154" />
              {/* Row 4 */}
              <line x1="85" y1="160" x2="85" y2="172" />
              <line x1="95" y1="158" x2="95" y2="170" />
              <line x1="105" y1="156" x2="105" y2="168" />
              <line x1="115" y1="156" x2="115" y2="168" />
              <line x1="125" y1="158" x2="125" y2="170" />
              {/* Row 5 */}
              <line x1="90" y1="180" x2="90" y2="192" />
              <line x1="100" y1="178" x2="100" y2="190" />
              <line x1="110" y1="178" x2="110" y2="190" />
              <line x1="120" y1="180" x2="120" y2="192" />
            </g>

            {/* Head Mask Disk */}
            <ellipse cx="118" cy="52" rx="46" ry="42" fill="#F4EDE0" stroke="#19182A" strokeWidth="4" />

            {/* Facial Disc Heart / Ring with Radial Hatching (Signature Ref 1) */}
            <ellipse cx="118" cy="52" rx="38" ry="34" fill="#FFFDF9" stroke="#19182A" strokeWidth="2.5" />
            <g stroke="#19182A" strokeWidth="1.8" strokeLinecap="round">
              {/* Radial Rays Left */}
              <line x1="90" y1="36" x2="98" y2="44" />
              <line x1="84" y1="52" x2="94" y2="52" />
              <line x1="88" y1="68" x2="96" y2="60" />
              <line x1="100" y1="76" x2="104" y2="64" />
              <line x1="104" y1="28" x2="106" y2="38" />
              {/* Radial Rays Right */}
              <line x1="146" y1="36" x2="138" y2="44" />
              <line x1="152" y1="52" x2="142" y2="52" />
              <line x1="148" y1="68" x2="140" y2="60" />
              <line x1="136" y1="76" x2="132" y2="64" />
              <line x1="132" y1="28" x2="130" y2="38" />
            </g>

            {/* Large Round Black Eyes (Ref 1) */}
            <circle cx="102" cy="50" r="11" fill="#19182A" />
            <circle cx="134" cy="50" r="11" fill="#19182A" />

            {/* Downward Hooked Beak */}
            <path d="M114 48 L122 48 L118 68 Z" fill="#19182A" />

            {/* Talons Claws Gripping Perch (Ref 1) */}
            <g stroke="#19182A" strokeWidth="3" fill="#F4EDE0">
              <path d="M92 205 C90 220, 80 235, 74 240" />
              <path d="M102 206 C102 224, 96 236, 92 242" />
              <path d="M112 206 C116 222, 118 234, 122 238" />
              <path d="M136 195 C142 208, 146 218, 154 220" />
            </g>
          </svg>
        )}

        {/* =========================================================================
            VARIANT 2: SERENE BARN OWL ON BRANCH (Reference 2)
            Calm closed eyes, dark espresso mantle with terracotta chevrons, wooden limb
            ========================================================================= */}
        {variant === 'barn_branch' && (
          <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
            {/* Gnarled Tree Branch */}
            <path
              d="M10 170 C40 160, 80 180, 120 165 C150 155, 180 168, 195 160 C185 185, 145 195, 100 190 C50 185, 20 180, 10 170 Z"
              fill="#8C6A53"
              stroke="#3D291D"
              strokeWidth="3.5"
            />
            {/* Branch Bark Texture */}
            <path d="M40 172 C55 178, 75 174, 95 180" stroke="#52392A" strokeWidth="2" strokeLinecap="round" />
            <path d="M110 170 C130 166, 155 172, 175 168" stroke="#52392A" strokeWidth="2" strokeLinecap="round" />
            {/* Branch Knot Spiral */}
            <path d="M98 178 C92 182, 86 182, 88 176 C90 172, 96 174, 94 178" stroke="#3D291D" strokeWidth="1.8" fill="none" />

            {/* Tail Plumage */}
            <path d="M138 160 L152 205 L168 200 L154 158 Z" fill="#211A28" stroke="#140F1A" strokeWidth="2.5" />

            {/* Dark Espresso / Charcoal Owl Body (Ref 2) */}
            <path
              d="M75 50 C45 75, 45 135, 65 170 C90 180, 130 175, 150 150 C165 125, 160 75, 135 50 C110 40, 90 42, 75 50 Z"
              fill="#24282D"
              stroke="#14171A"
              strokeWidth="4"
            />

            {/* Belly / Lower Plumage (Soft Beige/Grey Gradient) */}
            <path
              d="M72 130 C80 165, 120 165, 130 135 C115 145, 85 145, 72 130 Z"
              fill="#C4B8A8"
              stroke="#14171A"
              strokeWidth="2"
            />
            {/* Belly Texture Lines */}
            <g stroke="#24282D" strokeWidth="2" strokeLinecap="round">
              <line x1="82" y1="138" x2="82" y2="152" />
              <line x1="92" y1="140" x2="92" y2="156" />
              <line x1="102" y1="140" x2="102" y2="156" />
              <line x1="112" y1="138" x2="112" y2="152" />
            </g>

            {/* Terracotta/Tan Scalloped Feather Chevrons on Wing (Ref 2) */}
            <g stroke="#C68962" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M110 70 C114 78, 122 78, 126 70" />
              <path d="M130 76 C134 84, 142 84, 146 76" />
              <path d="M102 88 C106 96, 114 96, 118 88" />
              <path d="M122 96 C126 104, 134 104, 138 96" />
              <path d="M96 108 C100 116, 108 116, 112 108" />
              <path d="M114 116 C118 124, 126 124, 130 116" />
              <path d="M106 134 C110 140, 116 140, 120 134" />
            </g>

            {/* Heart-Shaped Cream Facial Disc Mask (Ref 2) */}
            <path
              d="M70 54 C60 75, 75 102, 95 102 C115 102, 130 75, 120 54 C110 44, 102 50, 95 56 C88 50, 80 44, 70 54 Z"
              fill="#EAE2D4"
              stroke="#14171A"
              strokeWidth="3.5"
            />

            {/* Serene / Peaceful Closed Eyes (Arcs, Ref 2) */}
            <path d="M76 74 C82 82, 88 82, 92 74" stroke="#24282D" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M98 74 C102 82, 108 82, 114 74" stroke="#24282D" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Subtle Delicate Beak */}
            <path d="M92 78 L98 78 L95 90 Z" fill="#C4B8A8" stroke="#14171A" strokeWidth="1.5" />

            {/* Pale Feathered Feet & Talons Perched on Branch (Ref 2) */}
            <g fill="#EAE2D4" stroke="#14171A" strokeWidth="2.5">
              <ellipse cx="132" cy="162" rx="7" ry="10" />
              <ellipse cx="144" cy="160" rx="7" ry="9" />
              {/* Claws */}
              <path d="M136 172 L136 178" stroke="#14171A" strokeWidth="3" strokeLinecap="round" />
              <path d="M148 169 L150 176" stroke="#14171A" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        )}

        {/* =========================================================================
            VARIANT 3: CELESTIAL SNOWY OWL (Reference 3)
            Linocut aesthetic, circular orbit, 4-point stars, stippled wing textures
            ========================================================================= */}
        {variant === 'snowy_celestial' && (
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
            {/* Celestial Orbit Ring */}
            <circle cx="100" cy="100" r="72" stroke="#E6EEF8" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.85" />

            {/* 4-Point Celestial Stars (Ref 3) */}
            {/* Top Star */}
            <path d="M100 12 L103 26 L117 29 L103 32 L100 46 L97 32 L83 29 L97 26 Z" fill="#E6EEF8" stroke="#11133D" strokeWidth="1.5" />
            {/* Left Star */}
            <path d="M25 85 L28 95 L38 98 L28 101 L25 111 L22 101 L12 98 L22 95 Z" fill="#F36B24" stroke="#11133D" strokeWidth="1.2" />
            {/* Right Star */}
            <path d="M175 75 L177 83 L185 85 L177 87 L175 95 L173 87 L165 85 L173 83 Z" fill="#20B7B0" stroke="#11133D" strokeWidth="1.2" />

            {/* Flying / Spread Wing (Upper Left, Ref 3) */}
            <path
              d="M75 90 C60 50, 68 20, 85 18 C95 18, 102 40, 105 75 Z"
              fill="#DCE6F5"
              stroke="#11133D"
              strokeWidth="3.5"
            />
            {/* Spread Wing (Right Upper, Ref 3) */}
            <path
              d="M110 85 C140 60, 175 45, 190 40 C175 65, 145 95, 125 105 Z"
              fill="#DCE6F5"
              stroke="#11133D"
              strokeWidth="3.5"
            />

            {/* Snowy Owl Body (Stippled White/Pale Slate) */}
            <ellipse cx="98" cy="115" rx="36" ry="34" fill="#EEF4FC" stroke="#11133D" strokeWidth="3.5" />

            {/* Stippled Feather Shading on Body (Linocut texture, Ref 3) */}
            <g fill="#11133D">
              <circle cx="80" cy="120" r="1.5" />
              <circle cx="85" cy="122" r="1.5" />
              <circle cx="90" cy="118" r="1.5" />
              <circle cx="95" cy="124" r="1.5" />
              <circle cx="100" cy="120" r="1.5" />
              <circle cx="105" cy="122" r="1.5" />
              <circle cx="110" cy="118" r="1.5" />

              <circle cx="82" cy="130" r="1.5" />
              <circle cx="88" cy="132" r="1.5" />
              <circle cx="94" cy="128" r="1.5" />
              <circle cx="102" cy="132" r="1.5" />
              <circle cx="108" cy="130" r="1.5" />

              <circle cx="86" cy="140" r="1.8" />
              <circle cx="92" cy="142" r="1.8" />
              <circle cx="98" cy="138" r="1.8" />
              <circle cx="104" cy="142" r="1.8" />
            </g>

            {/* Round Snowy Owl Head */}
            <circle cx="92" cy="85" r="26" fill="#EEF4FC" stroke="#11133D" strokeWidth="3.5" />

            {/* Wide Expressive Eyes (Ref 3) */}
            <circle cx="82" cy="85" r="7" fill="#11133D" />
            <circle cx="102" cy="85" r="7" fill="#11133D" />
            <circle cx="83" cy="84" r="2.5" fill="#FFFFFF" />
            <circle cx="103" cy="84" r="2.5" fill="#FFFFFF" />

            {/* Sharp Linocut Beak */}
            <polygon points="90,87 94,87 92,96" fill="#11133D" />

            {/* Powerful Feathered Talons (Ref 3) */}
            <g fill="#EEF4FC" stroke="#11133D" strokeWidth="2.5">
              <path d="M80 144 C76 156, 74 168, 70 172" />
              <path d="M88 145 C86 158, 86 170, 84 174" />
              <path d="M96 145 C98 158, 102 168, 106 172" />
            </g>
          </svg>
        )}

        {/* =========================================================================
            VARIANT 4: SCHOLAR CYBER/RETRO OWL (Teal Monocle & Perch)
            ========================================================================= */}
        {variant === 'scholar_monocle' && (
          <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
            {/* Retro Geometric Backdrop */}
            <circle cx="70" cy="65" r="54" fill="#211A55" stroke="#6543A5" strokeWidth="2.5" />
            <circle cx="70" cy="65" r="48" fill="#11133D" stroke="#20B7B0" strokeWidth="1" strokeDasharray="3 3" />

            {/* Winter Branch */}
            <path d="M8 108 C30 105, 60 110, 85 106 C105 103, 125 108, 134 105" stroke="#8C6A53" strokeWidth="4" strokeLinecap="round" />
            {/* Snow on branch */}
            <path d="M20 106 C40 103, 70 105, 95 104 C115 104, 125 105, 128 104" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

            {/* Body */}
            <ellipse cx="70" cy="78" rx="26" ry="28" fill="#F4EDE0" stroke="#11133D" strokeWidth="3" />
            {/* Chest Chevrons */}
            <path d="M62 76 L70 82 L78 76" stroke="#F36B24" strokeWidth="2" fill="none" />
            <path d="M60 84 L70 91 L80 84" stroke="#F36B24" strokeWidth="2" fill="none" />

            {/* Head */}
            <circle cx="70" cy="48" r="22" fill="#F4EDE0" stroke="#11133D" strokeWidth="3" />
            {/* Eyes */}
            <circle cx="62" cy="48" r="6" fill="#11133D" />
            <circle cx="78" cy="48" r="6" fill="#11133D" />
            <rect x="61" y="46" width="2" height="2" fill="#FFFFFF" />
            <rect x="77" y="46" width="2" height="2" fill="#FFFFFF" />

            {/* Beak */}
            <polygon points="68,48 72,48 70,58" fill="#F36B24" stroke="#11133D" strokeWidth="1" />

            {/* Teal Monocle with Cyber Wire */}
            <circle cx="78" cy="48" r="9" stroke="#20B7B0" strokeWidth="2" fill="none" />
            <line x1="87" y1="52" x2="96" y2="70" stroke="#20B7B0" strokeWidth="1.5" strokeDasharray="2 2" />
            <rect x="95" y="69" width="3" height="3" fill="#20B7B0" />
          </svg>
        )}
      </div>
    </div>
  );
};
