import {db} from './db';
import {isDictionaryData} from './contentValidation';
import {array, object, text, validLookup, requestJSON} from './contentHttp';
import type {DictionaryData, WordSuggestion, BookPage} from '../types/contentSources';

function plain(value:unknown):string {
  const doc = new DOMParser().parseFromString(text(value),'text/html');
  doc.querySelectorAll('script,style,iframe').forEach(node=>node.remove());
  return (doc.body.textContent || '').replace(/\s+/g,' ').trim();
}

export async function discoverOpenLibrary(query:string, next?:string):Promise<BookPage> {
  if(query.length>150)throw new Error('Use a shorter book search.');
  const url=next || `https://openlibrary.org/search.json?q=${encodeURIComponent(query || 'English stories')}&limit=20&fields=key,title,author_name,first_publish_year&page=1`;
  const parsed=new URL(url);
  if(parsed.origin!=='https://openlibrary.org' || parsed.pathname!=='/search.json')throw new Error('Invalid Open Library pagination URL.');
  const key=`openlibrary:${url}`,cache=await db.contentCache.get(key);
  if(cache && !Array.isArray(cache.data) && 'books' in cache.data)return cache.data;
  const raw=object(await requestJSON(url));if(!Array.isArray(raw.docs))throw new Error('Open Library returned invalid catalog data.');
  const books=array(raw.docs).map(object).filter(record=>/^\/works\/OL\d+W$/.test(text(record.key)) && text(record.title)).map(record=>({id:text(record.key),title:text(record.title),authors:array(record.author_name).filter(a=>typeof a==='string').join(', '),url:`https://openlibrary.org${record.key}`,copyright:null,source:'openlibrary' as const}));
  const page=Number(parsed.searchParams.get('page')) || 1;
  parsed.searchParams.set('page',String(page+1));
  const data={books,next:books.length && Number(raw.numFound)>page*20 ? parsed.href : undefined};
  await db.contentCache.put({key,data,retrievedAt:new Date().toISOString()});return data;
}
export function normalizeWiktionary(raw:unknown, word:string):DictionaryData {
  const meanings=array(object(raw).en).map(object).filter(m=>m.language==='English').map(m=>({
    partOfSpeech:text(m.partOfSpeech).toLowerCase() || 'unspecified',synonyms:[],antonyms:[],
    definitions:array(m.definitions).map(object).map(d=>({definition:plain(d.definition),example:array(d.examples).map(plain).find(Boolean),synonyms:[],antonyms:[]})).filter(d=>!!d.definition),
  })).filter(m=>m.definitions.length);
  if(!meanings.length)throw new Error('No English Wiktionary definitions were found.');
  return {word,meanings,phonetics:[],source:'wiktionary',retrievedAt:new Date().toISOString(),credits:[{source:'wiktionary',url:`https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,author:'Wiktionary contributors',license:'CC BY-SA 4.0; see entry history and license',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'}]};
}
const pendingDictionary=new Map<string,Promise<DictionaryData>>();
export async function getWiktionaryData(input:string):Promise<DictionaryData> {
  const word=validLookup(input),key=`wiktionary:${word}`;
  const local=await db.lexicon.get(word);
  if(local)return local.dictionary;
  const cache=await db.contentCache.get(key);
  if(cache && isDictionaryData(cache.data))return cache.data;
  if(pendingDictionary.has(word))return pendingDictionary.get(word)!;
  const task=(async()=>{
    const data=normalizeWiktionary(await requestJSON(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`),word);
    await db.contentCache.put({key,data,retrievedAt:data.retrievedAt});return data;
  })();
  pendingDictionary.set(word,task);
  try{return await task;}finally{pendingDictionary.delete(word);}
}
export async function discoverWords(input:string):Promise<WordSuggestion[]> {
  const topic=validLookup(input),key=`datamuse:${topic}`;
  const cache=await db.contentCache.get(key);
  if(cache && Array.isArray(cache.data))return cache.data as WordSuggestion[];
  if(new Date()>=new Date('2027-02-01T00:00:00Z'))throw new Error('Datamuse now requires an API key. Use dictionary search or Wiktionary instead; no paid/key service is configured.');
  const raw=await requestJSON(`https://api.datamuse.com/words?ml=${encodeURIComponent(topic)}&max=1000`);
  if(!Array.isArray(raw))throw new Error('Datamuse returned invalid suggestions.');
  const seen=new Set<string>();
  const data=array(raw).map(object).flatMap(record=>{
    const word=text(record.word);if(!/^[a-z]+(?:[ '-][a-z]+)*$/i.test(word)||seen.has(word.toLowerCase()))return [];seen.add(word.toLowerCase());
    return [{word,credit:{source:'datamuse' as const,url:'https://www.datamuse.com/api/',author:'Datamuse',license:'Datamuse API terms; suggestions, not verified definitions'}}];
  });
  await db.contentCache.put({key,data,retrievedAt:new Date().toISOString()});return data;
}
