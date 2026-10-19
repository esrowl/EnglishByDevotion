import {db} from './db';
import {validLexicalEntry} from './kaikkiAdapter';
import type {LexicalEntry} from '../types/lexical';
import type {VocabularyItem} from '../types/vocabulary';

let prepared:Promise<void>|undefined;
export const BUNDLED_LEXICON_SIZE=15808;
let entryCache:Map<string,LexicalEntry>|undefined;
export async function preparedLexicalEntries(){
  if(!entryCache||entryCache.size!==await db.lexicon.count())entryCache=new Map((await db.lexicon.toArray()).map(e=>[e.word,e]));
  return entryCache;
}
export function ensureLexicon(){return prepared||=(async()=>{
  const count=await db.lexicon.count();if(count>=BUNDLED_LEXICON_SIZE)return;
  try{
    const response=await fetch('/datasets/lexical/english-turkish.json');
    if(!response.ok)throw new Error('Local lexical dataset unavailable. Saved vocabulary remains accessible.');
    await importLexicalPack(await response.json());
  }catch(error){if(!count)throw error;}
})().catch(error=>{prepared=undefined;throw error;});}
export async function importLexicalPack(pack:unknown){
  const p=pack as {format:string;entries:unknown[]};
  if(p?.format!=='ebd-lexical-1'||!Array.isArray(p.entries)||!p.entries.every(validLexicalEntry))throw new Error('Invalid lexical pack; no personal data changed.');
  let added=0,changed=false;
  await db.transaction('rw',db.lexicon,async()=>{
    const incoming=p.entries as LexicalEntry[],previous=await db.lexicon.bulkGet(incoming.map(e=>e.word)),missing:LexicalEntry[]=[],updated:LexicalEntry[]=[];
    for(let i=0;i<incoming.length;i++){const old=previous[i];if(!old)missing.push(incoming[i]);else{const merged=mergeLexicalEntry(old,incoming[i]);if(merged!==old)updated.push(merged);}}
    await db.lexicon.bulkAdd(missing);if(updated.length)await db.lexicon.bulkPut(updated);added=missing.length;changed=!!(missing.length||updated.length);
  });
  if(changed)entryCache=undefined;
  return added;
}
export function mergeLexicalEntry(previous:LexicalEntry,incoming:LexicalEntry):LexicalEntry{
  if(previous.word!==incoming.word)return previous;
  const additions=incoming.senses.filter(s=>s.turkish.length&&!previous.senses.some(p=>p.partOfSpeech===s.partOfSpeech&&p.definition===s.definition&&p.turkish.length)).map(s=>({...s,id:`${s.id}:supplement`,translationSourceUrl:s.translationSourceUrl||incoming.sourceUrl,translationDownloadUrl:s.translationDownloadUrl||incoming.downloadUrl}));
  return additions.length?{...previous,senses:[...previous.senses.filter(p=>!additions.some(s=>s.id===p.id)),...additions]}:previous;
}
export function withLexicalData(item:VocabularyItem,entry?:LexicalEntry):VocabularyItem {
  if(!entry)return item;
  return {...item,lexicalData:item.lexicalData||entry};
}
export async function enrichSavedVocabulary(){
  await ensureLexicon();let enriched=0,missing=0;
  await db.transaction('rw',db.vocabulary,db.lexicon,async()=>{
    for(const item of await db.vocabulary.toArray()){
      const entry=await db.lexicon.get(item.word.trim().toLowerCase());
      if(!entry){missing++;continue;}
      const lexicalData=item.lexicalData?mergeLexicalEntry(item.lexicalData,entry):entry;
      if(lexicalData!==item.lexicalData){await db.vocabulary.update(item.id,{lexicalData});enriched++;}
    }
  });
  return {enriched,missing};
}
// Unknown legacy translation provenance is intentionally not promoted to verified.
export function primaryTurkish(item:VocabularyItem){
  // A Turkish translation from another sense is never a flashcard answer for this definition.
  return item.turkishMeaning?.trim()||item.lexicalData?.senses.find(s=>s.partOfSpeech===item.partOfSpeech&&s.definition===item.englishDefinition&&s.turkish.length)?.turkish[0]||'';
}
