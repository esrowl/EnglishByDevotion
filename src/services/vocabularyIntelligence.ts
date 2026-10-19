import type {DiscoveryWord} from '../types/discovery';
import type {LexicalEntry,LexicalAttempt} from '../types/lexical';

export function estimatedDifficulty(entry:LexicalEntry){
  // Transparent pedagogical heuristic, not a CEFR mapping or rarity score.
  const abstract=entry.senses.some(s=>s.tags.some(t=>['figuratively','formal','technical','abstract-noun'].includes(t)));
  const complexity=Math.min(1,entry.senses.reduce((n,s)=>n+s.definition.split(/\s+/).length,0)/Math.max(1,entry.senses.length)/30);
  return Math.min(100,Math.round(25+complexity*35+(abstract?15:0)+Math.min(20,entry.senses.length*2)));
}
export function lexicalSelectionScore(entry:LexicalEntry,recent:LexicalEntry[],level:number){
  const pos=entry.dictionary.meanings[0]?.partOfSpeech;
  const posCount=recent.slice(-5).filter(e=>e.dictionary.meanings[0]?.partOfSpeech===pos).length;
  const related=recent.slice(-3).some(e=>e.relations.some(r=>r.word===entry.word)||entry.relations.some(r=>r.word===e.word));
  const content=1+Math.min(4,entry.senses.filter(s=>s.turkish.length).length)*.12+Math.min(4,entry.relations.length)*.04;
  const difficulty=estimatedDifficulty(entry),target=55+level*8;
  return content*(1/(1+posCount*.4))*(related?.15:1)*Math.max(.3,1-Math.abs(difficulty-target)/100);
}
export function chooseIntelligentCandidate(pool:DiscoveryWord[],entries:Map<string,LexicalEntry>,excluded:Set<string>,weights:number[],recent:LexicalEntry[],level:number,random=Math.random){
  const available=pool.filter(r=>!r.coreRank&&r.rank>2809&&!r.unusable&&!excluded.has(r.key)&&entries.has(r.key));
  // A modest editorial lane prevents a large raw list from drowning out the
  // deliberately prepared, richer intermediate/advanced teaching entries.
  const enriched=available.filter(r=>entries.get(r.key)!.downloadUrl.includes('/meaning/'));
  const eligible=enriched.length&&random()<.25?enriched:available;
  const band=(r:number)=>r<=5000?0:r<=10000?1:r<=20000?2:3;
  const counts=[0,0,0,0];eligible.forEach(r=>counts[band(r.rank)]++);
  const scored=eligible.map(row=>({row,score:weights[band(row.rank)]/counts[band(row.rank)]*lexicalSelectionScore(entries.get(row.key)!,recent,level)}));
  let roll=random()*scored.reduce((sum,r)=>sum+r.score,0);
  for(const row of scored){roll-=row.score;if(roll<0)return row.row;}
  return scored.at(-1)?.row;
}
export function learningSummary(word:string,attempts:LexicalAttempt[]){
  const a=attempts.filter(a=>a.word===word),graded=a.filter(a=>a.correct!==null),recent=graded.slice(-12);
  const accuracy=recent.length?recent.filter(a=>a.correct).length/recent.length:0;
  const byKind=Object.fromEntries([...new Set(a.map(a=>a.kind))].map(kind=>{const rows=graded.filter(a=>a.kind===kind);return [kind,{attempts:rows.length,correct:rows.filter(a=>a.correct).length,incorrect:rows.filter(a=>!a.correct).length}];}));
  const application=graded.some(a=>['formation','collocation','correction'].includes(a.kind)&&a.correct);
  const context=graded.some(a=>a.kind==='context'&&a.correct);
  // Free-form AI feedback is deliberately not deterministic mastery evidence.
  const stage=application?'Application':context?'Understanding':graded.length?'Recognition':'Not started';
  return {attempts:a.length,correct:graded.filter(a=>a.correct).length,incorrect:graded.filter(a=>!a.correct).length,accuracy,byKind,stage,needsReview:recent.length>=2&&accuracy<.7,pendingProduction:a.filter(a=>a.correct===null).length};
}
