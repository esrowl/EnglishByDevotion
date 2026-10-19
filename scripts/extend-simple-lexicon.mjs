import {readFile,writeFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createGunzip} from 'node:zlib';
import {createInterface} from 'node:readline';
import {normalizeKaikki} from '../src/services/kaikkiAdapter.ts';

const file=process.argv[2];if(!file)throw new Error('Usage: node scripts/extend-simple-lexicon.mjs /path/to/official/simple-extract.jsonl.gz');
const output=new URL('../public/datasets/lexical/english-turkish.json',import.meta.url);
const pack=JSON.parse(await readFile(output,'utf8')),entries=new Map(pack.entries.map(e=>[e.word,e]));
const ranks=new Set((await readFile(new URL('../public/datasets/ngsl/ngsl_sfi_31k.csv',import.meta.url),'utf8')).split(/\r?\n/).slice(1).map(l=>l.split(',')[0]));
const grouped=new Map();
for await(const line of createInterface({input:createReadStream(file).pipe(createGunzip()),crlfDelay:Infinity})){
 if(!line.trim())continue;const r=JSON.parse(line);if(r.lang_code!=='en'||!ranks.has(r.word)||entries.has(r.word))continue;const rows=grouped.get(r.word)||[];rows.push(r);grouped.set(r.word,rows);
}
let added=0;
for(const [word,rows] of grouped){try{const e=normalizeKaikki(rows,'https://kaikki.org/dictionary/downloads/simple/simple-extract.jsonl.gz',new Date().toISOString(),'simple');if(!/^[a-z]+(?:[ '-][a-z]+)*$/.test(e.word)||!e.dictionary.meanings.some(m=>['noun','verb','adjective','adverb','conjunction','preposition'].includes(m.partOfSpeech)))continue;entries.set(word,e);added++;}catch{/* Inflected-only, invalid or unusable entries are not included. */}}
await writeFile(output,JSON.stringify({...pack,preparedAt:new Date().toISOString(),source:'Kaikki / English and Simple English Wiktionary',entries:[...entries.values()]}));
console.log(JSON.stringify({added,total:entries.size,translated:[...entries.values()].filter(e=>e.senses.some(s=>s.turkish.length)).length}));
