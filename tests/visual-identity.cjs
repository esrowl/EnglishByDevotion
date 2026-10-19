const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.EBD_PLAYWRIGHT_MODULE||'/Users/esra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.EBD_TEST_URL||'http://127.0.0.1:5180';
const output=process.env.EBD_SCREENSHOT_DIR||path.resolve(__dirname,'../docs/screenshots/retro-computing-2026-10-10');
fs.mkdirSync(output,{recursive:true});
const checks=[];
async function check(name,fn){try{await fn();checks.push({name,passed:true});console.log('PASS',name);}catch(e){checks.push({name,passed:false,error:e.message});console.log('FAIL',name,e.message);}}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.EBD_BROWSER||'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  async function capture(options){await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(60);return page.screenshot(options);}
  // Initialise this disposable profile with the application's actual curated seed,
  // before disk hydration: other test suites may write different temporary snapshots.
  await page.goto(`${url}/favicon.svg`);await page.evaluate(async()=>{await (await import('/src/services/db.ts')).initDatabase();});
  await page.goto(url);await page.locator('.quiet-home').waitFor();await page.evaluate(()=>document.fonts.ready);
  const before=await page.evaluate(async()=>JSON.stringify(await (await import('/src/services/db.ts')).db.vocabulary.toArray()));
  await check('rendered shell, sidebar, header and dominant main surface are near-black',async()=>{
   const colors=await page.evaluate(()=>['.retro-shell','aside','header','main','.quiet-home'].map(s=>getComputedStyle(document.querySelector(s)).backgroundColor));
   assert.ok(colors.every(c=>c==='rgb(8, 9, 11)'),JSON.stringify(colors));
  });
  await check('rendered Commodore palette, cream brand and blue selected navigation',async()=>{
   const r=await page.evaluate(()=>({brand:getComputedStyle(document.querySelector('.app-brand')).color,nav:getComputedStyle(document.querySelector('nav [aria-current]')).backgroundColor,palette:['blue','green','yellow','orange','pink'].map(c=>getComputedStyle(document.documentElement).getPropertyValue(`--color-${c}`).trim())}));
   assert.equal(r.brand,'rgb(244, 213, 163)');assert.equal(r.nav,'rgb(35, 134, 179)');assert.deepEqual(r.palette,['#2386B3','#A0B52B','#F5B51B','#EF741C','#D83B70']);
  });
  await check('quiet home restores branded header artwork and keeps one clear large practice action',async()=>{
   assert.equal(await page.locator('.quiet-home-header .cyber-hero-art').count(),1);
   assert.equal(await page.locator('.quiet-home-header .wireframe-globe').count(),1);
   assert.equal(await page.locator('.quiet-home button').count(),1);
   const r=await page.locator('.quiet-home h1').evaluate(e=>getComputedStyle(e).fontFamily);
   assert.equal(r,'"Pixelify Sans"');
   assert.ok(await page.getByRole('button',{name:'▶ Practice Now'}).isVisible());
  });
  await check('rendered screenshot is measurably different from previous navy design',async()=>{
   await page.emulateMedia({reducedMotion:'reduce'});const current=await capture({path:`${output}/dashboard-viewport.png`});
   const baselinePath=process.env.EBD_BEFORE_SCREENSHOT||path.resolve(__dirname,'../docs/screenshots/retro-computing-2026-10-10/before-dashboard.png');
   const baseline=fs.readFileSync(baselinePath);
   if(path.resolve(baselinePath)!==path.resolve(output,'before-dashboard.png'))fs.copyFileSync(baselinePath,`${output}/before-dashboard.png`);
   const r=await page.evaluate(async({before,after})=>{
    async function pixels(b64){const image=new Image();image.src=`data:image/png;base64,${b64}`;await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);return ctx.getImageData(0,0,c.width,c.height).data;}
    const a=await pixels(before),b=await pixels(after);let changed=0,black=0;for(let i=0;i<b.length;i+=4){if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>60)changed++;if(b[i]<36&&b[i+1]<36&&b[i+2]<40)black++;}return {changed:changed/(b.length/4),black:black/(b.length/4)};
   },{before:baseline.toString('base64'),after:current.toString('base64')});console.log('Screenshot comparison:',r);assert.ok(r.changed>.5,JSON.stringify(r));assert.ok(r.black>.5,JSON.stringify(r));await page.emulateMedia({reducedMotion:'no-preference'});
  });
  for(const [label,file,ready] of [
   ['Home Desk','dashboard','.quiet-home'],['Vocabulary Deck','vocabulary','main .vocab-word'],['Continuous Study','continuous-study','main .vocab-word'],['Grammar','grammar-library','.grammar-card'],['Writing Notes','practice-notes','main textarea'],['Review Queue','review','main h2'],['Flashcard Drill','flashcards','main select'],['Reading Library','reading','main h2'],
   ['Statistics','statistics','main h3'],['Import & Export','import','main h3'],['Settings','settings','main h3'],
  ])await check(`${file}: rendered capture, only three fonts, rectangular controls, no overflow`,async()=>{
   await page.getByRole('button',{name:label,exact:true}).click();if(label==='Continuous Study')await page.getByRole('button',{name:'MY SAVED WORDS',exact:true}).click();await page.locator(ready).first().waitFor();await page.waitForTimeout(150);
   const r=await page.evaluate(()=>{
    // Canvas resolves CSS Color 4/color-mix as well as rgb(); alpha utilities use color(srgb ...).
    const pixel=document.createElement('canvas');pixel.width=pixel.height=1;const colorContext=pixel.getContext('2d');
    const rgba=s=>{colorContext.clearRect(0,0,1,1);colorContext.fillStyle=s;colorContext.fillRect(0,0,1,1);const p=colorContext.getImageData(0,0,1,1).data;return [p[0],p[1],p[2],p[3]/255];};
    const blend=(a,b)=>a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3]));
    const lum=a=>a.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
    const bad=[...document.querySelectorAll('main .vocab-word,main .vocab-text,main .vocab-example')].filter(e=>e.getClientRects().length).flatMap(e=>{let bg=[8,9,11];const chain=[];for(let n=e;n;n=n.parentElement)chain.unshift(n);for(const n of chain)bg=blend(rgba(getComputedStyle(n).backgroundColor),bg);const foreground=blend(rgba(getComputedStyle(e).color),bg);const l1=lum(foreground),l2=lum(bg),contrast=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);return contrast<4.5?[{text:e.textContent.slice(0,60),contrast}]:[];});
    return {bad,overflow:document.documentElement.scrollWidth>innerWidth+2,families:[...new Set([...document.querySelectorAll('body *')].map(e=>getComputedStyle(e).fontFamily))],radii:[...document.querySelectorAll('main input:not([type="radio"]):not([type="checkbox"]),main select,main textarea')].map(e=>getComputedStyle(e).borderRadius)};
   });assert.equal(r.overflow,false);assert.deepEqual(r.bad,[],'Learning text must meet 4.5:1 contrast');assert.ok(r.families.every(f=>['Handjet','VT323','"Pixelify Sans"'].includes(f)),JSON.stringify(r.families));assert.ok(r.radii.every(r=>r==='0px'));await capture({path:`${output}/${file}-1440.png`,fullPage:true});
  });
  await check('visible circuits remain outside long lesson text',async()=>{await page.getByRole('button',{name:'Grammar',exact:true}).click();await page.locator('.circuit-panel').waitFor();const opacity=await page.locator('.circuit-panel').evaluate(e=>getComputedStyle(e,'::before').opacity);assert.ok(Number(opacity)>=.2);await page.getByRole('button',{name:/Articles: a, an and the/}).click();await page.getByRole('button',{name:'Observe',exact:true}).click();await page.locator('.grammar-panel').waitFor();assert.equal(await page.locator('.grammar-panel').evaluate(e=>getComputedStyle(e).backgroundImage),'none');await capture({path:`${output}/grammar-lesson-1440.png`,fullPage:true});});
  await check('practice feedback visibly distinguishes incorrect pink and correct green states',async()=>{
   await page.getByRole('button',{name:'Practice',exact:true}).click();await page.getByRole('button',{name:'Start practice',exact:true}).click();await page.getByLabel('a',{exact:true}).check();await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.locator('.grammar-feedback.incorrect').waitFor();assert.equal(await page.locator('.grammar-feedback.incorrect').evaluate(e=>getComputedStyle(e).borderLeftColor),'rgb(216, 59, 112)');await capture({path:`${output}/grammar-incorrect-1440.png`,fullPage:true});
   await page.getByRole('button',{name:'Next question',exact:true}).click();await page.getByLabel('Grammar answer').fill('a');await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.locator('.grammar-feedback.correct').waitFor();assert.equal(await page.locator('.grammar-feedback.correct').evaluate(e=>getComputedStyle(e).borderLeftColor),'rgb(160, 181, 43)');await capture({path:`${output}/grammar-correct-1440.png`,fullPage:true});
  });
  await page.setViewportSize({width:390,height:844});
  for(const [label,file,ready] of [['Home Desk','dashboard','.quiet-home'],['Vocabulary Deck','vocabulary','main .vocab-word'],['Grammar','grammar','.grammar-card']])await check(`${file}: 390px mobile layout without page overflow`,async()=>{await page.getByRole('button',{name:label,exact:true}).click();await page.locator(ready).first().waitFor();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);await capture({path:`${output}/${file}-390.png`,fullPage:true});});
  await check('visual navigation leaves vocabulary, notes and review schedules unchanged',async()=>assert.equal(await page.evaluate(async()=>JSON.stringify(await (await import('/src/services/db.ts')).db.vocabulary.toArray())),before));
  await check('no uncaught browser errors',async()=>assert.deepEqual(errors,[]));
  console.log(JSON.stringify({total:checks.length,failed:checks.filter(c=>!c.passed).length,checks},null,2));if(checks.some(c=>!c.passed))process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
