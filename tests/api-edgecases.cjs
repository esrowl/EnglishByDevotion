const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.EBD_PLAYWRIGHT_MODULE || process.env.LEXORA_PLAYWRIGHT_MODULE || '/Users/esra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.EBD_TEST_URL || process.env.LEXORA_TEST_URL || 'http://127.0.0.1:5180';
const checks=[];
async function check(name,fn){try{await fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:error.message});}}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.EBD_BROWSER || '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});
 try {
 const context=await browser.newContext();const page=await context.newPage();await page.goto(`${base}/favicon.svg`);
 // Explicit HTTP test fixture, never application content.
 const legacy=JSON.parse(fs.readFileSync('tests/fixtures/dictionary-hello.json','utf8'));
 const fixture={en:legacy.flatMap(entry=>entry.meanings.map(m=>({language:'English',partOfSpeech:m.partOfSpeech,definitions:m.definitions.map(d=>({definition:d.definition,examples:d.example?[d.example]:[]}))})))};
 for(const [status,pattern] of [[404,'No dictionary'],[429,'busy'],[500,'unavailable'],[503,'unavailable'],[400,'unavailable']]) await check(`HTTP ${status} has a useful error and no unhandled failure`,async()=>{
   const error=await page.evaluate(async status=>{const {requestJSON}=await import('/src/services/contentHttp.ts');const original=window.fetch;window.fetch=async()=>new Response('{}',{status});try{await requestJSON('https://example.com');return '';}catch(e){return e.message;}finally{window.fetch=original;}},status);assert.ok(error.includes(pattern),error);
 });
 await check('invalid JSON response is reported clearly',async()=>{
   const error=await page.evaluate(async()=>{const {requestJSON}=await import('/src/services/contentHttp.ts');const original=fetch;window.fetch=async()=>new Response('<html>bad</html>');try{await requestJSON('https://example.com');return '';}catch(e){return e.message;}finally{window.fetch=original;}});assert.match(error,/invalid JSON/);
 });
 await check('timeout aborts the request and returns a helpful message',async()=>{
   const error=await page.evaluate(async()=>{const {requestJSON}=await import('/src/services/contentHttp.ts');const original=fetch;window.fetch=(_,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));try{await requestJSON('https://example.com',30);return '';}catch(e){return e.message;}finally{window.fetch=original;}});assert.match(error,/timed out/);
 });
 await check('offline network rejection is distinguished from unknown word',async()=>{
   const error=await page.evaluate(async()=>{const {requestJSON}=await import('/src/services/contentHttp.ts');const original=fetch;window.fetch=async()=>{throw new TypeError('offline');};try{await requestJSON('https://example.com');return '';}catch(e){return e.message;}finally{window.fetch=original;}});assert.match(error,/Unable to connect/);
 });
 await check('malformed and empty dictionary schemas are rejected',async()=>{
   const count=await page.evaluate(async()=>{const {normalizeWiktionary:normalizeDictionaryResponse}=await import('/src/services/discoveryService.ts');let rejected=0;for(const bad of [null,{},[],[{word:'hello',meanings:[]}],[{word:'hello',meanings:[{definitions:[{}]}]}]])try{normalizeDictionaryResponse(bad);}catch{rejected++;}return rejected;});assert.equal(count,5);
 });
 await check('lookup rejects invalid inputs before sending requests',async()=>{
   const result=await page.evaluate(async()=>{const {validLookup}=await import('/src/services/contentHttp.ts');return ['', 'a'.repeat(81),'<script>alert(1)</script>','123','https://example.com'].map(word=>{try{validLookup(word);return false;}catch{return true;}});});assert.ok(result.every(Boolean));
 });
 await check('URL sanitization rejects script, data, HTTP and credential-bearing URLs',async()=>{
   const result=await page.evaluate(async()=>{const {safeUrl}=await import('/src/services/contentHttp.ts');return ['javascript:alert(1)','data:text/html,bad','http://example.com','https://name:secret@example.com'].map(safeUrl);});assert.ok(result.every(v=>!v));
 });
 await check('concurrent identical lookups share one real-schema request; lookup does not save',async()=>{
   const result=await page.evaluate(async fixture=>{const {getWiktionaryData:getDictionaryData}=await import('/src/services/discoveryService.ts');const {db}=await import('/src/services/db.ts');const original=fetch;let calls=0;window.fetch=async()=>{calls++;await new Promise(r=>setTimeout(r,30));return new Response(JSON.stringify(fixture));};try{const before=await db.vocabulary.count();const data=await Promise.all(Array.from({length:15},()=>getDictionaryData('hello')));return {calls,same:data.every(d=>d.word==='hello'),before,after:await db.vocabulary.count()};}finally{window.fetch=original;}},fixture);assert.equal(result.calls,1);assert.ok(result.same);assert.equal(result.before,result.after);
 });
 await check('missing optional dictionary audio/examples is not fabricated',async()=>{
   const result=await page.evaluate(async()=>{const {normalizeWiktionary:normalizeDictionaryResponse}=await import('/src/services/discoveryService.ts');return normalizeDictionaryResponse({en:[{language:'English',partOfSpeech:'Noun',definitions:[{definition:'Test definition.'}]}]},'test');});assert.deepEqual(result.phonetics,[]);assert.equal(result.meanings[0].definitions[0].example,undefined);
 });
 await check('Wiktionary keeps English entries only, strips executable HTML, and retains attribution',async()=>{
   const result=await page.evaluate(async()=>{const {normalizeWiktionary}=await import('/src/services/discoveryService.ts');return normalizeWiktionary({en:[{language:'English',partOfSpeech:'Noun',definitions:[{definition:'A <b>season</b><script>evil()</script>',examples:['An <i>example</i>.']}]},{language:'Dutch',partOfSpeech:'Noun',definitions:[{definition:'Not English'}]}]},'winter');});assert.equal(result.meanings.length,1);assert.equal(result.meanings[0].definitions[0].definition,'A season');assert.equal(result.source,'wiktionary');assert.match(result.credits[0].license,/CC BY-SA/);
 });
 await check('sentence filtering excludes unapproved, unsupported-license, long and unrelated examples',async()=>{
   const result=await page.evaluate(async()=>{const {normalizeTatoebaResponse}=await import('/src/services/tatoebaService.ts');const record={id:1,lang:'eng',license:'CC BY 2.0 FR',owner:'Test fixture only',text:'I enjoy winter every year.',is_unapproved:false,translations:[]};return normalizeTatoebaResponse({data:[record,{...record,id:2,is_unapproved:true},{...record,id:3,license:'unknown'},{...record,id:4,text:'x'.repeat(221)},{...record,id:5,text:'Wintertime is here.'},{...record,id:6,text:record.text}]},'winter');});assert.equal(result.length,1);assert.equal(result[0].translation,undefined);
 });
 await check('external pagination cannot redirect requests to another host or route',async()=>{
   const result=await page.evaluate(async()=>{const {getTatoebaPage}=await import('/src/services/tatoebaService.ts');const {discoverOpenLibrary}=await import('/src/services/discoveryService.ts');let rejected=0;for(const fn of [()=>getTatoebaPage('winter','https://evil.example/'),()=>getTatoebaPage('winter','https://api.tatoeba.org/admin'),()=>discoverOpenLibrary('alice','https://evil.example/search.json')])try{await fn();}catch{rejected++;}return rejected;});assert.equal(result,3);
 });
 await check('backup is a consistent snapshot of every portable store and creator identity',async()=>{
   const result=await page.evaluate(async()=>{const {exportDatabaseJSON}=await import('/src/services/db.ts');return JSON.parse(await exportDatabaseJSON());});assert.equal(result.author,'Esra');for(const key of ['vocabulary','reviewLogs','dailySessions','readings','contentCache'])assert.ok(Array.isArray(result.data[key]));assert.ok(result.data.settings);
 });
 await check('invalid nested backup rolls back vocabulary and auxiliary data atomically',async()=>{
   const result=await page.evaluate(async()=>{const {db,importDatabaseJSON}=await import('/src/services/db.ts');const before=await db.vocabulary.count();const res=await importDatabaseJSON(JSON.stringify({data:{vocabulary:[{id:'rollback',word:'rollback'}],reviewLogs:[{id:'bad-log'}]}}));return {before,after:await db.vocabulary.count(),error:res.error};});assert.ok(result.error);assert.equal(result.before,result.after);
 });
 await check('empty-profile portable restore preserves duplicate headwords, keys, preferences and links',async()=>{
   const snapshot={appName:'EnglishByDevotion — Personal Vocabulary Lab',version:'3.0.0',data:{vocabulary:[{id:'one',word:'snow',personalNotes:'first'},{id:'two',word:'snow',personalNotes:'second'}],reviewLogs:[{id:'r1',vocabularyId:'two',word:'snow',timestamp:'2020-01-01',rating:'good',mode:'en_to_tr',scheduledIntervalDays:1,easeFactorAfter:2.5}],dailySessions:[],readings:[{id:'reading1',title:'Esra reading',author:'Esra',text:'My original reading.',difficulty:'User provided',rights:'User provided'}],contentCache:[],settings:{id:'user_settings',defaultFlashcardMode:'typed_recall'}}};
   const result=await page.evaluate(async snapshot=>{const {db,importDatabaseJSON}=await import('/src/services/db.ts');const result=await importDatabaseJSON(JSON.stringify(snapshot),'empty-profile');return {result,words:await db.vocabulary.toArray(),log:await db.reviewLogs.get('r1'),settings:await db.settings.get('user_settings'),readings:await db.readings.count()};},snapshot);assert.ok(!result.result.error,result.result.error);assert.equal(result.words.length,2);assert.equal(result.log.vocabularyId,'two');assert.equal(result.settings.defaultFlashcardMode,'typed_recall');assert.equal(result.readings,1);
 });
 await check('full restore refuses nonempty profile without resetting it',async()=>{
   const result=await page.evaluate(async()=>{const {db,importDatabaseJSON}=await import('/src/services/db.ts');const before=await db.vocabulary.count();const result=await importDatabaseJSON(JSON.stringify({data:{vocabulary:[{id:'new',word:'newword'}]}}),'empty-profile');return {before,after:await db.vocabulary.count(),error:result.error};});assert.ok(result.error);assert.equal(result.before,result.after);
 });
 await check('portable restore preserves conflicting notes as separate records and restores preferences without deleting originals',async()=>{
   const result=await page.evaluate(async()=>{const {db,importDatabaseJSON}=await import('/src/services/db.ts');const before=await db.vocabulary.get('one');const payload={data:{vocabulary:[{...before,personalNotes:'Imported note'}],reviewLogs:[{id:'portable-review',vocabularyId:'one',word:'snow',timestamp:'2021-01-01',rating:'easy',mode:'en_to_tr'}],dailySessions:[],settings:{id:'user_settings',defaultFlashcardMode:'tr_to_en'}}};const first=await importDatabaseJSON(JSON.stringify(payload),'portable');const afterFirst=await db.vocabulary.count();const second=await importDatabaseJSON(JSON.stringify(payload),'portable');const words=await db.vocabulary.toArray();const log=await db.reviewLogs.get('portable-review');return {first,second,afterFirst,afterSecond:words.length,original:await db.vocabulary.get('one'),imported:words.find(v=>v.personalNotes==='Imported note'),log,settings:await db.settings.get('user_settings')};});assert.ok(!result.first.error,result.first.error);assert.equal(result.original.personalNotes,'first');assert.equal(result.imported.personalNotes,'Imported note');assert.equal(result.log.vocabularyId,result.imported.id);assert.equal(result.settings.defaultFlashcardMode,'tr_to_en');assert.equal(result.afterFirst,result.afterSecond);
 });
 await check('portable reading conflicts retain both texts and repeat import is idempotent',async()=>{
   const result=await page.evaluate(async()=>{const {db,importDatabaseJSON}=await import('/src/services/db.ts');const original=await db.readings.get('reading1');const payload={data:{vocabulary:[],readings:[{...original,text:'A different original reading.'}]}};const first=await importDatabaseJSON(JSON.stringify(payload),'portable');const afterFirst=await db.readings.count();const second=await importDatabaseJSON(JSON.stringify(payload),'portable');return {first,second,afterFirst,afterSecond:await db.readings.count(),original:await db.readings.get('reading1'),texts:(await db.readings.toArray()).map(r=>r.text)};});assert.ok(!result.first.error);assert.ok(!result.second.error);assert.equal(result.original.text,'My original reading.');assert.ok(result.texts.includes('A different original reading.'));assert.equal(result.afterFirst,result.afterSecond);
 });
 await check('cache cleanup does not delete vocabulary, notes, readings, settings or reviews',async()=>{
   const result=await page.evaluate(async()=>{const {db}=await import('/src/services/db.ts');const {clearExternalCache}=await import('/src/services/localPersistence.ts');const before=JSON.stringify([await db.vocabulary.toArray(),await db.readings.toArray(),await db.settings.toArray(),await db.reviewLogs.toArray()]);await clearExternalCache();return {same:before===JSON.stringify([await db.vocabulary.toArray(),await db.readings.toArray(),await db.settings.toArray(),await db.reviewLogs.toArray()]),cache:await db.contentCache.count()};});assert.ok(result.same);assert.equal(result.cache,0);
 });
 await check('malformed imported dictionary cache is ignored and never converted into a saved word',async()=>{
   const result=await page.evaluate(async fixture=>{const {db}=await import('/src/services/db.ts');const {dictionaryToVocabulary}=await import('/src/services/dictionaryService.ts');const {getWiktionaryData:getDictionaryData}=await import('/src/services/discoveryService.ts');const {isDictionaryData}=await import('/src/services/contentValidation.ts');const bad={word:'hello',meanings:[{}],phonetics:[],credits:[],retrievedAt:'today'};await db.contentCache.put({key:'wiktionary:hello',data:bad,retrievedAt:'today'});let rejected=false;try{dictionaryToVocabulary(bad);}catch{rejected=true;}const original=fetch;let calls=0;window.fetch=async()=>{calls++;return new Response(JSON.stringify(fixture));};try{return {rejected,invalid:!isDictionaryData(bad),calls:await getDictionaryData('hello').then(()=>calls)};}finally{window.fetch=original;}},fixture);assert.ok(result.rejected);assert.ok(result.invalid);assert.equal(result.calls,1);
 });
 await context.close();console.log(JSON.stringify({checks,total:checks.length,failed:checks.filter(c=>!c.passed).length},null,2));if(checks.some(c=>!c.passed))process.exitCode=1;
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
