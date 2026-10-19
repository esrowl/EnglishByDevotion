const assert = require('node:assert/strict');
const {chromium} = require(process.env.LEXORA_PLAYWRIGHT_MODULE || '/Users/esra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.LEXORA_TEST_URL || 'http://127.0.0.1:5173';
const results = [];
async function check(name, action) { try { await action(); results.push({name, passed:true}); } catch(error) { results.push({name, passed:false, error:error.message}); } }
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:process.env.LEXORA_BROWSER || '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});
 try {
 const context = await browser.newContext({timezoneId:'Europe/Istanbul'});
 const page = await context.newPage(); const errors=[]; page.on('pageerror', error => errors.push(error.message)); page.setDefaultTimeout(8000);
 await page.goto(`${base}/favicon.svg`);
 await page.evaluate(async () => {
   const {db,DEFAULT_SETTINGS} = await import('/src/services/db.ts'); const {createInitialSRSState}=await import('/src/services/srs.ts');
   const word=(id,word)=>({id,word,normalizedHeadword:word,partOfSpeech:'noun',turkishMeaning:'Türkçe anlam',englishDefinition:'A personal definition.',examples:[{id:`ex-${id}`,sentence:`I study ${word} every day.`}],collocations:[{collocation:`study ${word}`}],synonyms:[],antonyms:[],topicCategories:['Test'],provenance:{sourceType:'user_created',isVerified:false},personalNotes:'Preserve this note',isFavorite:false,isDifficult:false,learningStatus:'new',dateAdded:'2020-01-01',srs:createInitialSRSState()});
   await db.vocabulary.bulkAdd([word('a','winter'),word('b','take care'),word('c','c++')]); await db.settings.put(DEFAULT_SETTINGS);
 });
 await page.goto(base);
 const nav = async label => { await page.getByRole('button',{name:label,exact:true}).click(); if(label==='Continuous Study')await page.getByRole('button',{name:'MY SAVED WORDS',exact:true}).click();await page.waitForTimeout(150); };
 await check('all six flashcard modes render and punctuation does not crash blanking', async()=>{
   await nav('Flashcard Drill');
   for (let i=0;i<2;i++) { await page.getByRole('button',{name:'Reveal Answer (Space)'}).click(); await page.getByRole('button',{name:/^Good/}).click(); await page.waitForTimeout(120); }
   for (const mode of ['en_to_tr','tr_to_en','sentence_context','collocation','synonym_antonym','typed_recall']) {
     await page.locator('main select').first().selectOption(mode); assert.match(await page.locator('main').innerText(), /Card 3 \/ 3/);
     if (mode === 'sentence_context') assert.match(await page.locator('main').innerText(), /I study _______________ every day/);
   }
   assert.equal(errors.length,0);
 });
 await check('completed flashcard session cannot repeatedly rate its final card',async()=>{
   await page.locator('main select').first().selectOption('en_to_tr'); await page.getByRole('button',{name:'Reveal Answer (Space)'}).click(); await page.getByRole('button',{name:/^Good/}).click();
   await page.getByText('Practice session complete!',{exact:true}).waitFor();
   assert.equal(await page.getByRole('button',{name:/^Good/}).count(),0);
   assert.equal(await page.evaluate(async()=> (await import('/src/services/db.ts')).db.reviewLogs.count()),3);
 });
 await check('review queue advances through a stable due-card snapshot',async()=>{
   await page.evaluate(async()=> {const {db}=await import('/src/services/db.ts'); await db.vocabulary.toCollection().modify(item=>{item.srs.nextReviewDate='2020-01-01';});});
   await page.reload(); await nav('Review Queue'); await page.getByRole('button',{name:'Start Review Session'}).click();
   for(let i=0;i<3;i++) {await page.getByRole('button',{name:'Reveal Answer (Space)'}).click();await page.getByRole('button',{name:/^Good/}).click();await page.waitForTimeout(150);if(i===0)assert.match(await page.locator('main').innerText(),/Card 2 \/ 3/);}
   await page.getByRole('heading',{name:'All Reviews Complete for Today!',exact:true}).waitFor();assert.match(await page.locator('main').innerText(),/All Reviews Complete/);
 });
 await check('unsaved notes survive favorite refresh and saved notes persist',async()=>{
   await nav('Vocabulary Deck'); await page.locator('main .vocab-word').filter({hasText:/^winter$/}).click();
   const notes=page.getByPlaceholder('Add personal mnemonics, study context, or reflections...');await notes.fill('My unsaved Turkish note: ç ğ ı İ ö ş ü');
   await page.getByRole('button',{name:'Favorite',exact:true}).click(); await page.waitForTimeout(120);assert.match(await notes.inputValue(),/My unsaved/);
   await page.getByRole('button',{name:'Save Notes',exact:true}).click();await page.waitForTimeout(120);
   assert.match(await page.evaluate(async()=> (await (await import('/src/services/db.ts')).db.vocabulary.get('a')).personalNotes),/My unsaved/);
   await page.getByRole('button',{name:'Close dialog'}).click();
 });
 await check('duplicate create keeps dialog and shows helpful error without changing records',async()=>{
   await page.getByRole('button',{name:'New word',exact:true}).click();await page.getByPlaceholder('e.g. ubiquitous, serendipity').fill('winter');
   await page.getByRole('button',{name:'Save Vocabulary Record'}).click();await page.getByRole('alert').waitFor();assert.match(await page.getByRole('alert').innerText(),/already/);assert.equal(await page.getByRole('dialog').count(),1);
   await page.getByRole('button',{name:'Cancel',exact:true}).click();
 });
 await check('new vocabulary saves and survives reload without becoming learned',async()=>{
   await page.getByRole('button',{name:'New word',exact:true}).click();await page.getByPlaceholder('e.g. ubiquitous, serendipity').fill('snowfall');await page.getByRole('button',{name:'Save Vocabulary Record'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await page.reload();
   const word=await page.evaluate(async()=> (await import('/src/services/db.ts')).db.vocabulary.where('normalizedHeadword').equals('snowfall').first());assert.equal(word.learningStatus,'new');
 });
 await check('writing verifies complete target words and appends one unique sentence',async()=>{
   await nav('Writing Notes');await page.locator('main select').selectOption('a');const input=page.locator('main textarea').first();await input.fill('I enjoy wintertime.');assert.equal(await page.getByRole('button',{name:'Save to Vocabulary Card'}).isDisabled(),true);
   await input.fill('I enjoy winter very much.');await page.getByRole('button',{name:'Save to Vocabulary Card'}).click();await page.waitForTimeout(180);await page.getByRole('button',{name:'Save to Vocabulary Card'}).click();await page.waitForTimeout(180);
   const count=await page.evaluate(async()=> (await (await import('/src/services/db.ts')).db.vocabulary.get('a')).examples.filter(e=>e.sentence==='I enjoy winter very much.').length);assert.equal(count,1);
 });
 await check('restore is additive and preserves notes, settings, progress, primary keys and daily sessions',async()=>{
   const result=await page.evaluate(async()=>{
     const {db,importDatabaseJSON}=await import('/src/services/db.ts');const before=await db.vocabulary.get('a');const settings=await db.settings.get('user_settings');
     const imported={...before,id:'foreign-id',personalNotes:'OVERWRITE',srs:{...before.srs,repetition:0}};
     const result=await importDatabaseJSON(JSON.stringify({data:{vocabulary:[imported,{...before,id:'new-id',word:'midnight'}],reviewLogs:[],dailySessions:[{date:'2020-01-02',targetCount:1,completedVocabularyIds:['foreign-id'],plannedVocabularyIds:['foreign-id'],isCompleted:true,startedAt:'2020-01-02'}],settings:{...settings,defaultFlashcardMode:'typed_recall'}}}));
     return {result,same:JSON.stringify(before)===JSON.stringify(await db.vocabulary.get('a')),foreign:!!(await db.vocabulary.get('foreign-id')),session:await db.dailySessions.get('2020-01-02'),sameSettings:JSON.stringify(settings)===JSON.stringify(await db.settings.get('user_settings'))};
   });assert.equal(result.result.count,1);assert.ok(result.same&&result.sameSettings&&!result.foreign);assert.equal(result.session.completedVocabularyIds[0],'a');
 });
 await check('continuous discovery has no duplicate deck and ends instead of repeating first word',async()=>{
   await page.reload();await nav('Continuous Study');
   await page.evaluate(async()=> {const {db}=await import('/src/services/db.ts');await db.vocabulary.toCollection().modify({learningStatus:'new'});});
   await page.reload();await nav('Continuous Study');
   const n=await page.evaluate(async()=> (await import('/src/services/db.ts')).db.vocabulary.count());
   for(let i=0;i<n;i++) {await page.getByRole('button',{name:'LEARNED! NEXT WORD'}).click();await page.getByText(`${i+1} STUDIED`,{exact:true}).waitFor();await page.waitForTimeout(400);}
   await page.getByText('Study session complete',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'LEARNED! NEXT WORD'}).count(),0);
 });
 const labels=['Home Desk','Continuous Study','Flashcard Drill','Writing Notes','Vocabulary Deck','Review Queue','Reading Library','Import & Export','Statistics','Settings'];
 await check('CSV upload imports quoted data and skips repeated words within one file',async()=>{
   await nav('Import & Export');
   await page.locator('input[type="file"]').setInputFiles({name:'test.csv',mimeType:'text/csv',buffer:Buffer.from('Word,TurkishMeaning,EnglishDefinition\nblizzard,kar fırtınası,"A cold, snowy storm."\nblizzard,duplicate,duplicate\n')});
   const button=page.getByRole('button',{name:/Confirm & Import/});await button.waitFor();await button.click();
   await page.getByText(/Successfully imported 1 vocabulary records/).waitFor();
   const word=await page.evaluate(async()=> (await import('/src/services/db.ts')).db.vocabulary.where('normalizedHeadword').equals('blizzard').toArray());assert.equal(word.length,1);assert.equal(word[0].englishDefinition,'A cold, snowy storm.');
 });
 await check('invalid import shows useful parse error and adds no records',async()=>{
   const before=await page.evaluate(async()=> (await import('/src/services/db.ts')).db.vocabulary.count());
   await page.locator('input[type="file"]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('[{"id":"bad"}]')});
   await page.getByText(/Parse error:/).waitFor();assert.equal(await page.evaluate(async()=> (await import('/src/services/db.ts')).db.vocabulary.count()),before);
 });
 for(const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   for(const label of labels) await check(`${width}px navigation and layout: ${label}`,async()=>{
     await nav(label);assert.ok(!(await page.locator('main').innerText()).includes('could not be displayed'));
     const overflow=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,bad:[...document.querySelectorAll('main .vocab-text, main .vocab-word, main .vocab-example')].filter(el=>el.clientWidth>0&&el.scrollWidth>el.clientWidth+2).map(el=>el.textContent.slice(0,60))}));
     assert.ok(overflow.page<=overflow.viewport+2,JSON.stringify(overflow));assert.deepEqual(overflow.bad,[]);
   });
 }
 await nav('Flashcard Drill');await page.screenshot({path:'/private/tmp/lexora-bugfix-mobile.png',fullPage:true});
 await check('large library renders incrementally without losing searchable records',async()=>{
   await page.evaluate(async()=>{const {db}=await import('/src/services/db.ts');const template=await db.vocabulary.get('a');await db.vocabulary.bulkAdd(Array.from({length:500},(_,i)=>({...template,id:`large-${i}`,word:`word${i}`,normalizedHeadword:`word${i}`})));});
   await page.reload();await nav('Vocabulary Deck');await page.locator('main .group').first().waitFor();assert.equal(await page.locator('main .group').count(),60);await page.getByRole('button',{name:/Show more words/}).click();assert.equal(await page.locator('main .group').count(),120);
 });
 await check('cancelled native speech settles old promise even if browser emits no end event',async()=>{
   const success=await page.evaluate(async()=>{const {speechService}=await import('/src/services/speech.ts');const synth=window.speechSynthesis;const speak=synth.speak;const cancel=synth.cancel;synth.speak=()=>{};synth.cancel=()=>{};try{let ended=false;const promise=speechService.speak('winter').then(()=>{ended=true});speechService.stop();await promise;return ended;}finally{synth.speak=speak;synth.cancel=cancel;}});assert.ok(success);
 });
 await check('no uncaught browser errors across workflows',async()=>assert.deepEqual(errors,[]));
 await context.close();
 const empty=await browser.newContext();const emptyPage=await empty.newPage();await emptyPage.goto(`${base}/favicon.svg`);await emptyPage.evaluate(async()=>{const {db,DEFAULT_SETTINGS}=await import('/src/services/db.ts');await db.settings.put(DEFAULT_SETTINGS);});await emptyPage.goto(base);
 await check('intentionally empty library is not reseeded on reload and all screens still render',async()=>{
   for(const label of labels){await emptyPage.getByRole('button',{name:label,exact:true}).click();await emptyPage.waitForTimeout(120);assert.ok(!(await emptyPage.locator('main').innerText()).includes('could not be displayed'));}
   assert.equal(await emptyPage.evaluate(async()=> (await import('/src/services/db.ts')).db.vocabulary.count()),0);
 });await empty.close();
 console.log(JSON.stringify({checks:results,browserErrors:errors},null,2));if(results.some(r=>!r.passed))process.exitCode=1;
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
