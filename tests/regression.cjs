const assert = require('node:assert/strict');
const {chromium}=require(process.env.LEXORA_PLAYWRIGHT_MODULE || '/Users/esra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.LEXORA_TEST_URL || 'http://127.0.0.1:5173';
const checks=[];
async function check(name,fn){try{await fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:error.message});}}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.LEXORA_BROWSER || '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});
 try{
 const context=await browser.newContext({timezoneId:'Europe/Istanbul'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${base}/favicon.svg`);
 await page.evaluate(async()=>{
   const {db,DEFAULT_SETTINGS}=await import('/src/services/db.ts');const {createInitialSRSState}=await import('/src/services/srs.ts');
   const record=(id,word)=>({id,word,normalizedHeadword:word.toLowerCase(),partOfSpeech:'noun',turkishMeaning:'Test anlamı',englishDefinition:'User-created test definition.',examples:[{id:`ex-${id}`,sentence:`I study ${word} every evening.`}],collocations:[{collocation:`study ${word}`}],synonyms:[],antonyms:[],topicCategories:['Test'],provenance:{sourceType:'user_created',isVerified:false},isFavorite:false,isDifficult:false,learningStatus:'new',dateAdded:'2020-01-01T00:00:00Z',srs:createInitialSRSState(),personalNotes:'original notes'});
   await db.vocabulary.bulkAdd([record('a','winter'),record('b','take care'),record('c','c++')]);
   await db.settings.put({...DEFAULT_SETTINGS,defaultFlashcardMode:'en_to_tr'});
 });
 await page.goto(base);
 await page.getByRole('button',{name:'Flashcard Drill',exact:true}).click();
 await page.getByRole('button',{name:'Reveal Answer (Space)'}).waitFor();
 await check('rating advances deck rather than resetting to first card',async()=>{
   await page.getByRole('button',{name:'Reveal Answer (Space)'}).click();await page.getByRole('button',{name:/^Good/}).click();
   await page.waitForTimeout(250);assert.match(await page.locator('main').innerText(),/Card 2 \/ 3/);
 });
 await check('typed multiword answers accept spaces without flipping',async()=>{
   await page.locator('main select').first().selectOption('typed_recall');const input=page.getByPlaceholder('Type the English word here...');await input.fill('take');await input.press('Space');assert.equal(await input.inputValue(),'take ');
 });
 await check('difficult vocabulary query returns boolean-marked and lapse records',async()=>{
   const result=await page.evaluate(async()=>{const {db,getDifficultVocabulary}=await import('/src/services/db.ts');await db.vocabulary.update('b',{isDifficult:true});return (await getDifficultVocabulary()).map(v=>v.id);});assert.ok(result.includes('b'));
 });
 await check('CSV roundtrip preserves quoted commas, newlines, synonyms and definitions',async()=>{
   const result=await page.evaluate(async()=>{const {getVocabularyById}=await import('/src/services/db.ts');const {parseCSV,exportVocabularyToCSV}=await import('/src/services/importer.ts');const source=await getVocabularyById('a');source.englishDefinition='Quiet, cold weather.\nA "winter" evening.';source.synonyms=[{word:'cold season'}];const parsed=parseCSV(exportVocabularyToCSV([source]))[0];return {expected:source.englishDefinition,actual:parsed.englishDefinition,synonyms:parsed.synonyms,partOfSpeech:parsed.partOfSpeech,turkishMeaning:parsed.turkishMeaning};});assert.equal(result.actual,result.expected);assert.equal(result.synonyms[0].word,'cold season');assert.equal(result.partOfSpeech,'noun');assert.equal(result.turkishMeaning,'Test anlamı');
 });
 await check('restore rejects invalid records atomically without adding partial data',async()=>{
   const result=await page.evaluate(async()=>{const {db,importDatabaseJSON}=await import('/src/services/db.ts');const before=await db.vocabulary.count();const result=await importDatabaseJSON(JSON.stringify([{id:'badimport',word:'newword'},{id:'missing-word'}]));return {before,after:await db.vocabulary.count(),error:result.error};});assert.ok(result.error);assert.equal(result.before,result.after);
 });
 await check('backup parser retains dictionary and sentence source metadata',async()=>{
   const result=await page.evaluate(async()=>{const {parseJSON}=await import('/src/services/importer.ts');const raw={id:'parse-test',word:'hello',dictionaryData:{word:'hello',meanings:[{partOfSpeech:'noun',definitions:[{definition:'Greeting',synonyms:[],antonyms:[]}],synonyms:[],antonyms:[]}],phonetics:[],credits:[],retrievedAt:'2026-10-10'},examples:[{id:'tatoeba-1',sentence:'Hello, old chap!',credit:{source:'tatoeba',id:'1',url:'https://tatoeba.org/en/sentences/show/1',license:'CC BY 2.0 FR'}}]};const parsed=parseJSON(JSON.stringify([raw]))[0];return {dictionary:!!parsed.dictionaryData,credit:parsed.examples[0].credit?.id};});assert.ok(result.dictionary);assert.equal(result.credit,'1');
 });
 await check('malformed legacy records can be rendered without rewriting their raw data',async()=>{
   await page.evaluate(async()=>{const {db}=await import('/src/services/db.ts');await db.vocabulary.put({id:'legacy',word:'Legacy',examples:null,srs:null});});
   await page.reload();await page.getByRole('button',{name:'Vocabulary Deck',exact:true}).click();await page.getByRole('heading',{name:'Legacy',exact:true}).waitFor();assert.ok(!(await page.locator('main').innerText()).includes('Initializing'));assert.ok((await page.locator('main').innerText()).includes('Legacy'));assert.equal(errors.length,0);
 });
 await check('saved default practice mode is respected',async()=>{
   await page.evaluate(async()=>{const {db}=await import('/src/services/db.ts');await db.settings.update('user_settings',{defaultFlashcardMode:'typed_recall'});});await page.reload();await page.getByRole('button',{name:'Flashcard Drill',exact:true}).click();await page.locator('main select').first().waitFor();assert.equal(await page.locator('main select').first().inputValue(),'typed_recall');
 });
 await check('deleting a word cleans related references while keeping other history',async()=>{
   const result=await page.evaluate(async()=>{
     const {db,deleteVocabulary}=await import('/src/services/db.ts');const original=await db.vocabulary.get('a');
     await db.vocabulary.add({...original,id:'delete-test',word:'testword',normalizedHeadword:'testword'});
     await db.reviewLogs.add({id:'delete-log',vocabularyId:'delete-test'});
     await db.recallAttempts.add({id:'delete-recall',vocabularyId:'delete-test',timestamp:'2020-01-01T00:00:00Z',correct:true});
     await db.recallAttempts.add({id:'keep-recall',vocabularyId:'b',timestamp:'2020-01-01T00:00:00Z',correct:true});
     await db.discoveryEncounters.add({word:'testword',rank:5000,seenAt:'2020-01-01T00:00:00Z',feedback:'learning',vocabularyId:'delete-test'});
     await db.dailySessions.put({date:'2020-01-02',targetCount:2,completedVocabularyIds:['delete-test','b'],plannedVocabularyIds:['delete-test','b'],isCompleted:false,startedAt:'2020-01-02'});
     await deleteVocabulary('delete-test');
     return {word:await db.vocabulary.get('delete-test'),log:await db.reviewLogs.get('delete-log'),recall:await db.recallAttempts.get('delete-recall'),kept:await db.recallAttempts.get('keep-recall'),encounter:await db.discoveryEncounters.get('testword'),session:await db.dailySessions.get('2020-01-02')};
   });
   assert.equal(result.word,undefined);assert.equal(result.log,undefined);assert.equal(result.recall,undefined);assert.equal(result.kept.vocabularyId,'b');
   assert.equal(result.encounter.vocabularyId,undefined);assert.equal(result.encounter.feedback,'learning');
   assert.deepEqual(result.session.completedVocabularyIds,['b']);assert.deepEqual(result.session.plannedVocabularyIds,['b']);
 });
 await context.close();
 const dateContext=await browser.newContext({timezoneId:'Europe/Istanbul'});const datePage=await dateContext.newPage();await datePage.goto(`${base}/favicon.svg`);await datePage.clock.setFixedTime(new Date('2026-10-09T21:15:00Z'));
 await check('study day follows local date after midnight in Istanbul',async()=>{const day=await datePage.evaluate(async()=>{const {getTodayDateString}=await import('/src/services/srs.ts');return getTodayDateString();});assert.equal(day,'2026-10-10');});
 await dateContext.close();
 console.log(JSON.stringify({checks,browserErrors:errors},null,2));if(checks.some(c=>!c.passed))process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
