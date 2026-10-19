/** Lightweight technical collage; every mark is decorative, not a live status. */
export function CyberneticOverlay() {
  return <svg className="cybernetic-overlay" viewBox="0 0 1400 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs><pattern id="cyber-dither" width="11" height="9" patternUnits="userSpaceOnUse"><path d="M1 2h2v2H1zM7 6h1v1H7z" fill="#2386FF"/></pattern><pattern id="cyber-violet-dither" width="9" height="7" patternUnits="userSpaceOnUse"><path d="M1 2h3v1H1zM6 5h1v1H6z" fill="#7948C8"/></pattern></defs>
    <g className="cyber-violet" fill="none" stroke="currentColor">
      <path d="M8 4H852V72H904V139H879M21 516H894V498H970M870 4V197M913 17V112M22 13V144H67M960 241H1370V433H1318" strokeWidth="1"/>
      {Array.from({length:24},(_,i)=><path key={i} d={`M${710+i*5} ${i%3*13}v${60+i%7*9}h${20+i%4*9}v${15+i%5*8}`} opacity={.3+i%4*.15}/>) }
      {Array.from({length:17},(_,i)=><path key={`scan-${i}`} d={`M0 ${146+i*4}h${35+i%5*19}M${42+i%4*12} ${426+i*3}h${160-i*5}`} opacity=".55"/>) }
      <path d="M1155 95h180v104h-180zM1185 95v104m30-104v104m30-104v104m30-104v104m30-104v104m-150-78h180m-180 26h180m-180 26h180" opacity=".55"/>
      <g className="cyber-diamond" transform="translate(1190 284) rotate(-8)">
        <path d="M-64 0 0-55 64 0 0 55Z M-64 0H64M0-55V55M-64 0Q0-36 64 0Q0 36-64 0M0-55Q-42 0 0 55Q42 0 0-55M-38-22 38 22M38-22-38 22M-45 17 0-55 45 17M-45-17 0 55 45-17" strokeWidth="1.3"/>
      </g>
    </g>
    <g className="cyber-cobalt" fill="currentColor">
      <path d="M182 23h142v9H182zM1340 410h60v4h-60zM1297 421h103v5h-103zM1332 433h68v4h-68zM1320 443h80v9h-80zM1346 459h54v3h-54z"/>
      <path d="M206 10h478v108H505v94H333v-52H206zM250 372h390v91H467v44H312z" fill="url(#cyber-dither)" opacity=".46"/>
    </g>
    <g className="cyber-violet" fill="url(#cyber-violet-dither)"><path d="M20 2h386v85H197v-34H20zM41 421h700v84H559v35H98z" opacity=".6"/></g>
    <g stroke="var(--color-cream)" opacity=".36">{[[27,100],[917,33],[1372,250],[1192,427],[1340,507],[954,489]].map(([x,y])=><path key={`${x}-${y}`} d={`M${x-5} ${y}h10M${x} ${y-5}v10`}/>)}</g>
    <g transform="translate(1000 488) skewX(-36)">{['blue','green','yellow','orange','pink'].map((color,i)=><g key={color} fill={`var(--color-${color})`}><path d={`M${i*54} 0h46v35h-46z`}/>{i>0&&Array.from({length:5},(_,j)=><path key={j} d={`M${i*54} ${j*7+3}h46v2h-46z`} fill="var(--color-black)"/>)}</g>)}</g>
    <g className="cyber-technical" fill="var(--color-ivory)" opacity=".64">
      <text x="936" y="61">COMPUTER / LANGUAGE</text><text x="936" y="80">LEARNING / HUMAN INTERFACE</text>
      <text x="953" y="376">EXPLORE</text><text x="953" y="395">LEARN / RECALL</text><text x="953" y="414">IMPROVE / REPEAT</text>
      <text x="24" y="467" fill="var(--color-blue-text)">0023</text><text x="24" y="486" fill="var(--color-blue-text)">0194</text>
    </g>
  </svg>;
}
