// Explicit, offline build/enrichment task. Never invoked by ordinary study.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createInterface} from 'node:readline';
import {normalizeKaikki} from '../src/services/kaikkiAdapter.ts';

const output=new URL('../public/datasets/lexical/english-turkish.json',import.meta.url);
const words=['alleviate','substantial','reluctant','undermine','deteriorate','compelling','issue','medicine','medical','medically','medicate','medication','medicinal','prevent','responsible','effective','efficient','effect','affect','economic','economical','historic','historical','imply','infer','mitigate','adverse','ubiquitous','serendipity','exacerbate','ambiguous','resilient','sustainable','coherent','plausible','meticulous','inevitable','consequence','nevertheless','furthermore','allocate','acknowledge','acquire','adequate','advocate','assess','assumption','attain','attribute','beneficial','capacity','cease','clarify','coincide','commitment','comprehensive','concurrent','conduct','considerable','consistent','constitute','constraint','controversial','convey','crucial','decline','derive','despite','diminish','discrepancy','distinction','diverse','elaborate','emerge','emphasis','enhance','ensure','establish','evaluate','evidence','explicit','facilitate','feasible','fluctuate','fundamental','hence','implement','implication','incentive','incorporate','indicate','inherent','initial','insight','integrity','justify','maintain','notion','obtain','perceive','persistent','perspective','potential','precise','predominant','principle','prioritize','prominent','proportion','pursue','reinforce','relevant','retain','reveal','significant','subsequent','sufficient','supplement','tendency','therefore','thorough','undergo','valid','viable','widespread','make','take','health','winter','curiosity'];
const entries=new Map(),failures=[];
const dump=process.argv[2];
if(dump){
  // Stream the official English JSONL dump; RAM grows only with retained NGSL entries.
  const ranks=new Set((await readFile(new URL('../public/datasets/ngsl/ngsl_sfi_31k.csv',import.meta.url),'utf8')).split(/\r?\n/).slice(1).map(l=>l.split(',')[0]));
  const lines=createInterface({input:createReadStream(dump),crlfDelay:Infinity});
  for await(const line of lines){if(!line.trim())continue;const raw=JSON.parse(line);if(raw.lang_code!=='en'||!ranks.has(raw.word))continue;const bucket=entries.get(raw.word)||[];bucket.push(raw);entries.set(raw.word,bucket);}
  for(const [word,rows] of entries){try{entries.set(word,normalizeKaikki(rows,'https://kaikki.org/dictionary/rawdata.html'));}catch{entries.delete(word);}}
}else{
  for(const word of words){
    try{
      const page=`https://kaikki.org/dictionary/English/meaning/${word[0]}/${word.slice(0,2)}/${word}.html`;
      const response=await fetch(page,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const html=await response.text(),link=[...html.matchAll(/href="([^"<>]+\.jsonl)"/g)].map(m=>new URL(m[1],page)).find(u=>u.hostname==='kaikki.org');
      if(!link)throw new Error('No official JSONL download link');
      const data=await fetch(link,{signal:AbortSignal.timeout(20000)});if(!data.ok)throw new Error(`Download ${data.status}`);
      const rows=(await data.text()).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));
      const entry=normalizeKaikki(rows,link.href);entries.set(word,entry);console.log(`${word}: ${entry.senses.filter(s=>s.turkish.length).length} Turkish senses`);
    }catch(e){failures.push({word,error:e.message});console.error(word,e.message);}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
}
if(!entries.size)throw new Error('No real entries retrieved; output not modified.');
// Preparing a targeted batch must not remove already prepared dictionary coverage.
const previous=await readFile(output,'utf8').then(JSON.parse).catch(error=>{if(error.code==='ENOENT')return {entries:[]};throw error;});
const combined=new Map(previous.entries.map(entry=>[entry.word,entry]));
for(const [word,entry] of entries)combined.set(word,entry);
await mkdir(new URL('.',output),{recursive:true});
await writeFile(output,JSON.stringify({format:'ebd-lexical-1',preparedAt:new Date().toISOString(),source:'Kaikki / Wiktionary editions',license:'CC BY-SA 4.0',entries:[...combined.values()]}));
console.log(JSON.stringify({prepared:entries.size,total:combined.size,failures}));
