const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');

// Read TrueType cmap tables directly; no font-processing dependency is required.
function glyphs(file) {
  const b = fs.readFileSync(file), u16 = o => b.readUInt16BE(o), u32 = o => b.readUInt32BE(o);
  let cmap;
  for (let n=0;n<u16(4);n++) { const p=12+n*16; if (b.toString('ascii',p,p+4)==='cmap') cmap=u32(p+8); }
  assert.ok(cmap,'cmap exists');
  const chars=new Set();
  for(let n=0;n<u16(cmap+2);n++) {
    const s=cmap+u32(cmap+4+n*8+4), format=u16(s);
    if(format===12) for(let g=0;g<u32(s+12);g++) {const p=s+16+g*12;for(let c=u32(p);c<=u32(p+4);c++) if(u32(p+8)+c-u32(p))chars.add(c);}
    if(format===4) {
      const count=u16(s+6)/2,end=s+14,start=end+count*2+2,delta=start+count*2,range=delta+count*2;
      for(let i=0;i<count;i++) for(let c=u16(start+i*2);c<=u16(end+i*2)&&c<65535;c++) {
        const ro=u16(range+i*2);let gid=ro?u16(range+i*2+ro+2*(c-u16(start+i*2))):c;
        if(!ro||gid) gid=(gid+b.readInt16BE(delta+i*2))&65535;
        if(gid)chars.add(c);
      }
    }
  }
  return chars;
}
const root=path.resolve(__dirname,'..');
const fonts={pixelifySans:glyphs(`${root}/public/fonts/PixelifySans-Variable.ttf`),handjet:glyphs(`${root}/public/fonts/Handjet-Variable.ttf`),vt323:glyphs(`${root}/public/fonts/VT323-Regular.ttf`)};
const coverage=Object.fromEntries([...'çğıİöşüÇĞÖŞÜ'].map(c=>[c,Object.fromEntries(Object.entries(fonts).map(([name,chars])=>[name,chars.has(c.codePointAt(0))]))]));
assert.ok(Object.values(coverage).every(c=>Object.values(c).every(Boolean)),'all three fonts include Turkish glyphs without a fourth fallback family');
for(const [name,chars] of Object.entries(fonts))assert.ok(chars.has(65)&&chars.has(97),`English ${name} glyph coverage`);
console.log(JSON.stringify({result:'PASS',coverage},null,2));
