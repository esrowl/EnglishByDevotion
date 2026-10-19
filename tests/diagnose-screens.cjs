// Read-only source snapshot -> disposable browser profile. Never use a user's browser profile.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('/Users/esra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.EBD_TEST_URL||'http://127.0.0.1:5180';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});try{
const results=[];
for(const mode of ['empty-profile','saved-snapshot']){
const context=await browser.newContext(),page=await context.newPage(),errors=[],failedRequests=[];
page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,1600));});page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
await page.goto(base+'/favicon.svg');
if(mode==='saved-snapshot'){
 const backup=JSON.parse(fs.readFileSync('storage/backups/current.json','utf8'));
 const result=await page.evaluate(async backup=>await(await import('/src/services/db.ts')).importDatabaseJSON(JSON.stringify(backup),'empty-profile'),backup);assert.ok(!result.error,result.error);
}else await page.evaluate(async()=>{const {db,DEFAULT_SETTINGS}=await import('/src/services/db.ts');await db.settings.put(DEFAULT_SETTINGS);});
await page.goto(base);await page.waitForFunction(()=>!document.querySelector('main')?.textContent.includes('Initializing'));
for(const tab of ['Home Desk','Continuous Study','Flashcard Drill','Writing Notes','Vocabulary Deck','Review Queue','Reading Library','Grammar','Import & Export','Statistics','Settings']){
 await page.getByRole('button',{name:tab,exact:true}).click();await page.waitForFunction(()=>!document.querySelector('main')?.textContent.includes('Loading screen…'));await page.waitForTimeout(250);
 const boundary=await page.getByText('This screen could not be displayed. Your saved data has not been deleted.',{exact:true}).count();results.push({mode,tab,crashed:boundary>0});
}
console.log(JSON.stringify({mode,results:results.filter(r=>r.mode===mode),errors,failedRequests},null,2));await context.close();
}
if(results.some(r=>r.crashed))process.exitCode=1;
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
