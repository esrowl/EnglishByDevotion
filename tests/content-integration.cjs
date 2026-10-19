// Run with a running Vite server. Uses a disposable browser context, never the user's profile.
// LEXORA_PLAYWRIGHT_MODULE can point to an existing Playwright installation.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.LEXORA_PLAYWRIGHT_MODULE || '/Users/esra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fixture = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/wiktionary-hello.json`, 'utf8'));
const base = process.env.LEXORA_TEST_URL || 'http://127.0.0.1:5173';
const passed = [];
function check(name, value) { assert.ok(value, name); passed.push(name); }

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.LEXORA_BROWSER || '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/favicon.svg`);
    // Reproduce a populated v1 database before opening the updated app.
    const migration = await page.evaluate(async fixture => {
      const { LexoraDatabase, db, initDatabase } = await import('/src/services/db.ts');
      const {dictionaryToVocabulary}=await import('/src/services/dictionaryService.ts');const {normalizeWiktionary}=await import('/src/services/discoveryService.ts');const normalizeDictionaryResponse=raw=>normalizeWiktionary(raw,'hello');
      const Dexie = Object.getPrototypeOf(LexoraDatabase);
      const old = new Dexie('LexoraDB');
      old.version(1).stores({ vocabulary: 'id, normalizedHeadword, word, partOfSpeech, cefrLevel, learningStatus, isFavorite, isDifficult, dateAdded, srs.nextReviewDate, *topicCategories', reviewLogs: 'id, vocabularyId, word, timestamp, rating, mode', dailySessions: 'date, isCompleted', settings: 'id' });
      const record = { ...dictionaryToVocabulary(normalizeDictionaryResponse(fixture)), id: '!existing-winter', word: 'winter', normalizedHeadword: 'winter', englishDefinition: 'My own definition', turkishMeaning: 'Kış', dictionaryData: undefined, examples: [{ id: 'existing-example', sentence: 'Winter makes the garden quiet.' }], personalNotes: 'ç ğ ı İ ö ş ü · original notes', learningStatus: 'review', dateAdded: '2020-01-01T00:00:00Z', srs: { repetition: 4, interval: 30, easeFactor: 2.7, lapses: 1, nextReviewDate: '2020-01-01', lastReviewedDate: '2020-01-01T00:00:00Z' } };
      const log = { id: 'existing-log', vocabularyId: record.id, word: 'winter', timestamp: '2020-01-01T00:00:00Z', rating: 'good', mode: 'sentence_context', scheduledIntervalDays: 30, easeFactorAfter: 2.7 };
      const session = { date: '2020-01-01', isCompleted: false, completedVocabularyIds: [record.id], plannedVocabularyIds: [record.id] };
      const settings = { id: 'user_settings', personalSetting: 'preserve me' };
      await old.table('vocabulary').add(record); await old.table('reviewLogs').add(log); await old.table('dailySessions').add(session); await old.table('settings').put(settings); old.close();
      await db.open(); await Promise.all([initDatabase(), initDatabase()]);
      return { version: db.verno, count: await db.vocabulary.count(), unchanged: JSON.stringify(await db.vocabulary.get(record.id)) === JSON.stringify(record), log: JSON.stringify(await db.reviewLogs.get(log.id)) === JSON.stringify(log), session: JSON.stringify(await db.dailySessions.get(session.date)) === JSON.stringify(session), settings: JSON.stringify(await db.settings.get(settings.id)) === JSON.stringify(settings), cache: !!db.contentCache };
    }, fixture);
    check('v1→v6 additive migration preserves vocabulary, notes, SRS, history, sessions and settings', migration.version === 6 && migration.count === 1 && migration.unchanged && migration.log && migration.session && migration.settings && migration.cache);
    let requests = 0;
    await page.route('https://en.wiktionary.org/api/rest_v1/page/definition/hello', async route => { requests++; await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) }); });
    await page.route('https://en.wiktionary.org/api/rest_v1/page/definition/zzzzunknown', route => route.fulfill({ status: 404, contentType: 'application/json', body: '{}' }));
    await page.goto(base);
    await page.getByRole('button', { name: /Vocabulary Deck/ }).click();
    await page.getByRole('textbox', { name: 'Dictionary word' }).fill('winter');
    await page.getByRole('button', { name: 'Look up', exact: true }).click();
    await page.getByRole('button', { name: 'Open saved entry' }).waitFor();
    check('local lookup uses saved entry without network request', requests === 0);
    await page.getByRole('textbox', { name: 'Dictionary word' }).fill('hello');
    await page.getByRole('button', { name: 'Look up', exact: true }).click();
    await page.getByRole('button', { name: 'Save to vocabulary library' }).waitFor();
    check('recorded REAL Wiktionary response displays parts of speech, definitions and no invented audio', await page.locator('audio').count() === 0 && await page.locator('ol li').count() > 1 && (await page.locator('main').innerText()).includes('interjection'));
    const beforeSave = await page.evaluate(async () => { const {db}=await import('/src/services/db.ts'); return {v:await db.vocabulary.count(),logs:await db.reviewLogs.count(),cache:await db.contentCache.count()}; });
    check('lookup caches data without adding vocabulary or learning logs', beforeSave.v === 1 && beforeSave.logs === 1 && beforeSave.cache === 1);
    await page.getByRole('button', { name: 'Save to vocabulary library' }).click();
    await page.getByRole('button', { name: 'Open saved entry' }).waitFor();
    const serviceTests = await page.evaluate(async fixture => {
      const dictionary = await import('/src/services/dictionaryService.ts');
      const {db}=await import('/src/services/db.ts');
      const tatoeba=await import('/src/services/tatoebaService.ts');
      const {normalizeWiktionary}=await import('/src/services/discoveryService.ts');const data=normalizeWiktionary(fixture,'hello');
      const results=await Promise.all([dictionary.saveDictionaryWord(data),dictionary.saveDictionaryWord(data)]);
      const existing=await db.vocabulary.get('!existing-winter');
      await dictionary.attachDictionaryData(existing.id,data);
      const after=await db.vocabulary.get(existing.id);
      const examples=await tatoeba.getTatoebaSentences('winter');
      const bilingual=examples.find(e=>e.translation);
      await Promise.all([tatoeba.saveTatoebaSentence(existing.id,bilingual),tatoeba.saveTatoebaSentence(existing.id,bilingual)]);
      const final=await db.vocabulary.get(existing.id);
      let invalid=false;try{normalizeWiktionary({bad:true},'hello');}catch{invalid=true;}
      return {count:await db.vocabulary.count(),same:results[0].id===results[1].id,status:results[0].learningStatus,notes:after.personalNotes===existing.personalNotes,srs:JSON.stringify(after.srs)===JSON.stringify(existing.srs),definition:after.englishDefinition===existing.englishDefinition,logs:await db.reviewLogs.count(),translation:bilingual.translation,credit:bilingual.credit,translationCredit:bilingual.translationCredit,missing:examples.some(e=>!e.translation),exampleCount:final.examples.filter(e=>e.id===bilingual.id).length,invalid};
    }, fixture);
    check('concurrent saves deduplicate and keep new status',serviceTests.count===2&&serviceTests.same&&serviceTests.status==='new');
    check('explicit enrichment preserves authored fields, notes, schedules and review history',serviceTests.notes&&serviceTests.srs&&serviceTests.definition&&serviceTests.logs===1);
    check('real Tatoeba dataset includes Turkish translation, original IDs, authors, record licenses and missing translations',serviceTests.translation==='Kışa bayılıyorum.'&&serviceTests.credit.id==='13699851'&&serviceTests.translationCredit.id==='13699854'&&serviceTests.credit.license==='CC BY 2.0 FR'&&serviceTests.missing);
    check('saving Tatoeba examples appends without duplicates',serviceTests.exampleCount===1);
    check('invalid external data is rejected',serviceTests.invalid);
    await page.reload();
    await page.getByRole('button', { name: /Vocabulary Deck/ }).click();
    await page.getByRole('textbox', { name: 'Dictionary word' }).fill('zzzzunknown');
    await page.getByRole('button', { name: 'Look up', exact: true }).click();
    await page.getByRole('alert').waitFor();
    check('404 shows helpful unknown-word error', (await page.getByRole('alert').innerText()).includes('No dictionary entry'));
    await page.getByRole('button', {name:'Reading Library',exact:true}).click();
    check('real Gutenberg passages open with source metadata', (await page.locator('.reading-passage').innerText()).includes('Alice was beginning') && (await page.locator('main').innerText()).includes('gutenberg #11'));
    await page.getByRole('button', {name:'Look up sister',exact:true}).first().click();
    check('reading word click populates shared dictionary lookup',await page.getByRole('textbox',{name:'Dictionary word'}).inputValue()==='sister');
    await page.evaluate(async()=>{ window.lexoraTestServices = { dictionary: await import('/src/services/dictionaryService.ts'), source:await import('/src/services/discoveryService.ts'), storage: await import('/src/services/db.ts') }; });
    await context.setOffline(true);
    const offline=await page.evaluate(async()=>{const d=window.lexoraTestServices.dictionary;const {db}=window.lexoraTestServices.storage;const saved=await d.lookupDictionary('hello');const cached=await window.lexoraTestServices.source.getWiktionaryData('hello');return {saved:!!saved.saved,cached:cached.word,count:await db.vocabulary.count()};});
    check('saved words and dictionary cache remain accessible offline after reload',offline.saved&&offline.cached==='hello'&&offline.count===2);
    const offlineError=await page.evaluate(async()=>{try{await window.lexoraTestServices.dictionary.lookupDictionary('nevercached');return '';}catch(e){return e.message;}});
    check('offline uncached lookup returns helpful error',offlineError.includes('Unable to connect'));
    // Returning online is needed to load development modules, not IndexedDB records.
    await context.setOffline(false);
    const fonts=await page.evaluate(async()=>{await document.fonts.ready;return {handjet:document.fonts.check('20px "Handjet"'),pixelify:document.fonts.check('20px "Pixelify Sans"'),retro:document.fonts.check('20px "VT323"'),vocab:getComputedStyle(document.querySelector('.vocab-text')).fontFamily,body:getComputedStyle(document.body).fontFamily};});
    check('three local fonts load and explanations/interface use VT323',fonts.handjet&&fonts.pixelify&&fonts.retro&&fonts.vocab.includes('VT323')&&fonts.body.includes('VT323'));
    for(const label of ['Flashcard Drill','Review Queue','Writing Notes','Continuous Study','Statistics','Import & Export','Settings','Home Desk']) { await page.getByRole('button',{name:new RegExp(label)}).first().click(); await page.waitForTimeout(80); check(`existing navigation: ${label}`,await page.locator('main').innerText()!==''); }
    await page.getByRole('button',{name:'Flashcard Drill',exact:true}).click();
    await page.locator('main select').waitFor();
    check('existing six exercise modes remain available',await page.locator('main select option').count()===6);
    await page.locator('main select').selectOption('sentence_context');
    // The original v1 record is first. Select the appended licensed example.
    await page.getByRole('combobox',{name:'Practice sentence'}).waitFor();
    await page.getByRole('combobox',{name:'Practice sentence'}).selectOption('1');
    await page.getByText(/I adore _______________/).waitFor();
    check('Tatoeba saved sentence feeds existing fill-in-the-blank exercise with attribution', (await page.locator('main').innerText()).includes('I adore _______________') && (await page.locator('main').innerText()).includes('tatoeba #13699851'));
    await page.getByRole('button',{name:'Reveal Answer (Space)'}).click();
    check('existing answer reveal still works', await page.getByRole('button',{name:/^Good/}).count()>0);
    await page.screenshot({path:'/private/tmp/lexora-flashcards.png',fullPage:true});
    await page.getByRole('button',{name:'Reading Library',exact:true}).click();
    await page.screenshot({path:'/private/tmp/lexora-reading.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'/private/tmp/lexora-mobile.png',fullPage:false});
    const overflow=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,learning:[...document.querySelectorAll('.vocab-text,.vocab-word')].filter(el=>el.scrollWidth>el.clientWidth+2).length}));
    check('learning text wraps on mobile without internal overflow',overflow.learning===0);
    const longText=await page.evaluate(()=>{
      const panel=document.querySelector('.reading-passage');
      const word=document.createElement('p');word.className='vocab-word';word.textContent='pneumonoultramicroscopicsilicovolcanoconiosis';panel.append(word);
      const translation=document.createElement('p');translation.className='vocab-text';translation.textContent='ç ğ ı İ ö ş ü · Uzun Türkçe açıklamalar ve örnek cümleler rahatça okunabilmelidir.';panel.append(translation);
      const valid=word.scrollWidth<=word.clientWidth+2&&translation.scrollWidth<=translation.clientWidth+2&&parseFloat(getComputedStyle(translation).fontSize)>=18;
      word.remove();translation.remove();return valid;
    });
    check('long words and Turkish content wrap at readable mobile font sizes',longText);
    check('no uncaught browser errors',errors.length===0);
    console.log(JSON.stringify({passed,requests,overflow,errors},null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);console.log('Checks completed before failure:',passed);process.exitCode=1;});
