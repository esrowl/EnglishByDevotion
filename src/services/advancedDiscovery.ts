import {db} from './db';
import {normalizeWord} from './contentHttp';
import {dictionaryToVocabulary} from './dictionaryService';
import {isDictionaryData} from './contentValidation';
import type {DiscoveryWord,DiscoveryPreferences,DiscoveryFeedback} from '../types/discovery';
import type {VocabularyItem} from '../types/vocabulary';
import type {DictionaryData} from '../types/contentSources';
import {ensureLexicon,preparedLexicalEntries} from './lexicalService';
import {chooseIntelligentCandidate} from './vocabularyIntelligence';

export const DEFAULT_DISCOVERY:DiscoveryPreferences={id:'discovery',preference:'balanced',provider:'wiktionary',adaptiveLevel:0,evaluatedAttempts:0};
export const BAND_WEIGHTS=[.15,.35,.40,.10];
export function rankBand(rank:number){return rank<=5000?0:rank<=10000?1:rank<=20000?2:3;}
export function parseRankCSV(csv:string):{word:string;rank:number}[]{
  const lines=csv.replace(/^\uFEFF/,'').trim().split(/\r?\n/);
  if(lines.shift()?.trim()!=='word,rank')throw new Error('Invalid NGSL columns.');
  const rows=lines.map(line=>{const match=line.match(/^([^,]+),(\d+)$/);if(!match)throw new Error('Invalid NGSL record.');return {word:match[1],rank:Number(match[2])};});
  if(new Set(rows.map(r=>normalizeWord(r.word))).size!==rows.length||new Set(rows.map(r=>r.rank)).size!==rows.length||rows.some(r=>r.rank<1||r.rank>rows.length))throw new Error('Duplicate or invalid NGSL ranks.');
  return rows;
}
let importing:Promise<void>|undefined;
export function ensureDiscoveryPool():Promise<void>{
  return importing ||= (async()=>{
    if(await db.discoveryPool.count()===31239&&await db.discoveryCore.count()===2809)return;
    const files=await Promise.all(['ngsl.csv','ngsl_sfi_31k.csv'].map(async name=>{const r=await fetch(`/datasets/ngsl/${name}`);if(!r.ok)throw new Error('Local NGSL dataset could not be loaded. Retry or use My Saved Words.');return parseRankCSV(await r.text());}));
    if(files[0].length!==2809||files[1].length!==31239)throw new Error('Incomplete NGSL datasets; personal vocabulary was preserved.');
    const core=new Map(files[0].map(r=>[normalizeWord(r.word),r.rank]));
    await db.transaction('rw',[db.discoveryPool,db.discoveryCore],async()=>{
      const existing=new Set(await db.discoveryPool.toCollection().primaryKeys());
      await db.discoveryPool.bulkAdd(files[1].map(r=>({key:normalizeWord(r.word),word:r.word,rank:r.rank,coreRank:core.get(normalizeWord(r.word))})).filter(r=>!existing.has(r.key)));
      const existingCore=new Set(await db.discoveryCore.toCollection().primaryKeys());
      await db.discoveryCore.bulkAdd(files[0].map(r=>({...r,key:normalizeWord(r.word)})).filter(r=>!existingCore.has(r.key)));
    });
  })().catch(error=>{importing=undefined;throw error;});
}
export async function getDiscoveryPreferences(){return {...DEFAULT_DISCOVERY,...await db.discoveryPreferences.get('discovery'),provider:'wiktionary' as const};}
export async function setDiscoveryProvider(provider:'dictionaryapi'|'wiktionary'){
  if(provider!=='wiktionary')throw new Error('Invalid dictionary provider.');
  await db.transaction('rw',db.discoveryPreferences,async()=>{await db.discoveryPreferences.put({...await getDiscoveryPreferences(),provider});});
}
export async function setDiscoveryPreference(preference:DiscoveryPreferences['preference']){
  if(!['balanced','gentler','rarer'].includes(preference))throw new Error('Invalid discovery preference.');
  await db.transaction('rw',db.discoveryPreferences,async()=>{await db.discoveryPreferences.put({...await getDiscoveryPreferences(),preference});});
}
export function selectionWeights(p:DiscoveryPreferences){
  const bias=p.adaptiveLevel+(p.preference==='gentler'?-1:p.preference==='rarer'?1:0);
  const weights=BAND_WEIGHTS.map((w,i)=>w*Math.pow(1.18,bias*(i-1)));const sum=weights.reduce((a,b)=>a+b,0);return weights.map(w=>w/sum);
}
export async function adaptDiscovery(){
  return db.transaction('rw',[db.discoveryPreferences,db.discoveryEncounters,db.recallAttempts,db.reviewLogs,db.lexicalAttempts],async()=>{
    const p=await getDiscoveryPreferences();
    const selected=new Set((await db.discoveryEncounters.toArray()).filter(e=>e.feedback==='learning'&&e.vocabularyId).map(e=>e.vocabularyId));
    const lexical=(await db.lexicalAttempts.toArray()).filter(a=>a.correct!==null);
    const attempts=[...(await db.recallAttempts.toArray()).filter(a=>selected.has(a.vocabularyId)),...lexical].sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
    const recent=attempts.slice(-40),days=new Set(recent.map(a=>a.timestamp.slice(0,10)));
    const reviews=(await db.reviewLogs.toArray()).filter(r=>selected.has(r.vocabularyId)).sort((a,b)=>a.timestamp.localeCompare(b.timestamp)).slice(-40);
    const diverseContext=lexical.filter(a=>['context','formation','collocation','correction'].includes(a.kind)).length>=10&&new Set(lexical.map(a=>a.kind)).size>=3;
    if(attempts.length-p.evaluatedAttempts<20||days.size<3||reviews.length<10&&!diverseContext)return p;
    const accuracy=recent.filter(a=>a.correct).length/recent.length;
    const reviewSuccess=reviews.length?reviews.filter(r=>r.rating==='good'||r.rating==='easy').length/reviews.length:accuracy;
    const direction=accuracy>=.85&&reviewSuccess>=.8?1:accuracy<.6||reviewSuccess<.5?-1:0;
    const updated={...p,adaptiveLevel:Math.max(-2,Math.min(2,p.adaptiveLevel+direction)),evaluatedAttempts:attempts.length};
    await db.discoveryPreferences.put(updated);return updated;
  });
}
export function chooseCandidate(pool:DiscoveryWord[],excluded:Set<string>,weights:number[],random= Math.random):DiscoveryWord|undefined{
  const groups:Array<DiscoveryWord[]>=[[],[],[],[]];
  for(const row of pool)if(!row.coreRank&&row.rank>2809&&!row.unusable&&!excluded.has(row.key)&&/^[a-z]+(?:[ '-][a-z]+)*$/.test(row.key))groups[rankBand(row.rank)].push(row);
  const total=weights.reduce((sum,w,i)=>sum+(groups[i].length?w:0),0);if(!total)return;
  let target=random()*total;
  for(let i=0;i<4;i++){if(!groups[i].length)continue;target-=weights[i];if(target<0)return groups[i][Math.min(groups[i].length-1,Math.floor(random()*groups[i].length))];}
  return groups.findLast(g=>g.length)?.[0];
}
// Dictionary calls occur outside transactions. A final atomic claim prevents two tabs
// from displaying the same new word. Loading/retrying never creates a learning record.
let preparedPool:DiscoveryWord[]|undefined,preparedCount=0;
export async function nextDiscoveryWord():Promise<{entry:DiscoveryWord;item:VocabularyItem}|null>{
  await Promise.all([ensureDiscoveryPool(),ensureLexicon()]);const preferences=await adaptDiscovery();
  const entries=await preparedLexicalEntries();
  if(!preparedPool||preparedCount!==entries.size){preparedPool=(await db.discoveryPool.bulkGet([...entries.keys()])).filter((row):row is DiscoveryWord=>!!row);preparedCount=entries.size;}
  const pool=preparedPool;
  const encounters=await db.discoveryEncounters.toArray();
  const excluded=new Set(encounters.map(e=>e.word));
  const recent=encounters.sort((a,b)=>a.seenAt.localeCompare(b.seenAt)).slice(-5).flatMap(e=>entries.has(e.word)?[entries.get(e.word)!]:[]);
  (await db.vocabulary.toArray()).forEach(v=>excluded.add(normalizeWord(v.normalizedHeadword||v.word)));
  // Local entries only. Dictionary enrichment is a separate explicit preparation step.
  for(let attempt=0;attempt<16;attempt++){
    const entry=chooseIntelligentCandidate(pool,entries,excluded,selectionWeights(preferences),recent,preferences.adaptiveLevel);if(!entry)return null;excluded.add(entry.key);
    const lexicalData=entries.get(entry.key)!,dictionary=lexicalData.dictionary;
    if(!isDictionaryData(dictionary))continue;
    const claimed=await db.transaction('rw',[db.discoveryEncounters,db.vocabulary],async()=>{
      if(await db.discoveryEncounters.get(entry.key)||await db.vocabulary.filter(v=>normalizeWord(v.normalizedHeadword||v.word)===entry.key).count())return false;
      await db.discoveryEncounters.add({word:entry.key,rank:entry.rank,seenAt:new Date().toISOString()});return true;
    });
    if(claimed)return {entry,item:{...dictionaryToVocabulary(dictionary),lexicalData,frequencyRank:entry.rank,frequencySource:'ngsl_sfi_31k'}};
  }
  throw new Error('No usable dictionary entry in this batch. Retry to continue; there is no daily word limit.');
}
export async function recordDiscoveryFeedback(word:string,feedback:DiscoveryFeedback,provider:'dictionaryapi'|'wiktionary'='wiktionary',displayedData?:DictionaryData){
  if(!['familiar','learning','skipped'].includes(feedback))throw new Error('Invalid word feedback.');
  const key=normalizeWord(word);const cached=await db.contentCache.get(`${provider}:${key}`);
  const lexicalData=await db.lexicon.get(key);
  const dictionary=displayedData||lexicalData?.dictionary||cached?.data;
  return db.transaction('rw',[db.discoveryEncounters,db.vocabulary],async()=>{
    const encounter=await db.discoveryEncounters.get(key);if(!encounter)throw new Error('This word has not been encountered.');
    if(encounter.feedback)return encounter;
    let vocabularyId:string|undefined;
    if(feedback==='learning'){
      const existing=await db.vocabulary.filter(v=>normalizeWord(v.normalizedHeadword||v.word)===key).first();
      if(existing)vocabularyId=existing.id;
      else{
        if(!isDictionaryData(dictionary)||normalizeWord(dictionary.word)!==key||(dictionary.source||'dictionaryapi')!==provider)throw new Error('Dictionary data unavailable. Look up this word again before saving.');
        const item=dictionaryToVocabulary(dictionary);item.learningStatus='learning';item.frequencyRank=encounter.rank;item.frequencySource='ngsl_sfi_31k';
        if(lexicalData)item.lexicalData=lexicalData;
        await db.vocabulary.add(item);vocabularyId=item.id;
      }
    }
    const result={...encounter,feedback,feedbackAt:new Date().toISOString(),vocabularyId};await db.discoveryEncounters.put(result);return result;
  });
}
