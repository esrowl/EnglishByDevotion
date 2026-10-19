const assert=require('node:assert/strict');
const {chromium}=require('/Users/esra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.EBD_TEST_URL||'http://127.0.0.1:5180';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});try{
 const page=await browser.newPage(),errors=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto(base+'/favicon.svg');
 await page.evaluate(async()=>{const {db,DEFAULT_SETTINGS}=await import('/src/services/db.ts');await db.settings.put(DEFAULT_SETTINGS);});
 const target='**/src/components/daily/OpenEndedLearningView.tsx';
 await page.route(target,r=>r.abort('connectionrefused'));
 await page.goto(base);await page.getByRole('button',{name:'Continuous Study',exact:true}).click();
 const message=page.getByText('This screen could not be displayed. Your saved data has not been deleted.',{exact:true});await message.waitFor();
 await page.unroute(target);await page.getByRole('button',{name:'Try again',exact:true}).click();await message.waitFor();
 const retryStillFailed=await message.isVisible();
 await page.reload();await page.getByRole('button',{name:'Continuous Study',exact:true}).click();await page.getByRole('button',{name:'MY SAVED WORDS',exact:true}).waitFor();
 assert.equal(await message.count(),0);
 console.log(JSON.stringify({mode:'deliberately blocked module fixture, not a captured user-browser error',sameMessageReproduced:true,retryStillFailed,reloadRecovers:true,moduleError:errors.filter(e=>/Failed to fetch dynamically imported module|TypeError/.test(e)).map(e=>e.slice(0,2000))},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
