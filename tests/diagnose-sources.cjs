const fs=require('node:fs');
const {chromium}=require('/Users/esra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.EBD_TEST_URL||'http://127.0.0.1:5180';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});try{
 const page=await browser.newPage();await page.goto(base+'/favicon.svg');
 const result=await page.evaluate(async()=>{
   const d=await import('/src/services/discoveryService.ts'),t=await import('/src/services/tatoebaService.ts'),results=[];
   for(const word of ['winter','curiosity','learning']){
     await Promise.all([
       ['wiktionary',()=>d.getWiktionaryData(word)],['tatoeba',()=>t.getTatoebaPage(word)],
       ['datamuse',()=>d.discoverWords(word)],['openlibrary',()=>d.discoverOpenLibrary(word)],
     ].map(async([source,fn])=>{const started=performance.now();try{await fn();results.push({source,query:word,success:true,ms:Math.round(performance.now()-started)});}catch(e){results.push({source,query:word,success:false,ms:Math.round(performance.now()-started),error:e.message});}}));
   }
   return results;
 });
 console.log(JSON.stringify(result,null,2));fs.writeFileSync('docs/reports/SOURCE_DIAGNOSTICS_2026-10-18.json',JSON.stringify(result,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
