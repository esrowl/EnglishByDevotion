import {db} from './db';
import type {LanguageFeedback} from '../types/lexical';
export async function prepareMissingTurkish(){
 const items=(await db.vocabulary.toArray()).filter(v=>!v.turkishMeaning?.trim()&&!v.aiTranslations?.length&&!v.lexicalData?.senses.some(s=>s.turkish.length));
 const candidate=items.find(v=>v.englishDefinition?.trim());if(!candidate)return 'No saved words with a missing Turkish meaning and an English definition remain.';
 const status=await fetch('/__local/status',{signal:AbortSignal.timeout(3000)});
 if(!status.ok || !status.headers.get('content-type')?.includes('application/json'))throw new Error('Optional local AI is unavailable on this site. Existing vocabulary is unchanged.');
 const session=await status.json();
 const response=await fetch('/__local/translate-sense',{method:'POST',headers:{'Content-Type':'application/json','X-EBD-Token':session.token},signal:AbortSignal.timeout(23000),body:JSON.stringify({word:candidate.word,sense:candidate.englishDefinition,partOfSpeech:candidate.partOfSpeech})});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'Optional local translation unavailable.');
 if(data.status!=='ai_generated'||!Array.isArray(data.turkish)||!data.turkish.every((s:unknown)=>typeof s==='string')||typeof data.model!=='string'||data.sense!==candidate.englishDefinition||data.partOfSpeech!==candidate.partOfSpeech)throw new Error('Invalid model translation; nothing saved.');
 if(!data.turkish.length)return `No confident model translation for ${candidate.word}; left untranslated.`;
 await db.transaction('rw',db.vocabulary,db.lexicon,async()=>{const latest=await db.vocabulary.get(candidate.id),lexical=await db.lexicon.get(candidate.word.toLowerCase());if(latest&&!latest.turkishMeaning?.trim()&&!latest.aiTranslations?.length&&!lexical?.senses.some(s=>s.turkish.length))await db.vocabulary.update(latest.id,{aiTranslations:[data]});});
 return `${candidate.word}: AI-generated translation saved separately; not dictionary-verified. Repeat preparation for another missing word.`;
}
export async function requestLanguageFeedback(attemptId:string):Promise<LanguageFeedback>{
 const attempt=await db.lexicalAttempts.get(attemptId);
 if(!attempt||attempt.correct!==null)throw new Error('Only saved, ungraded free-form answers can request optional feedback.');
 if(attempt.feedback)return attempt.feedback;
 const status=await fetch('/__local/status',{signal:AbortSignal.timeout(3000)});
 if(!status.ok || !status.headers.get('content-type')?.includes('application/json'))throw new Error('Local feedback server unavailable. Your answer remains saved and ungraded.');
 const session=await status.json();
 const response=await fetch('/__local/language-feedback',{method:'POST',headers:{'Content-Type':'application/json','X-EBD-Token':session.token},signal:AbortSignal.timeout(23000),body:JSON.stringify({questionId:attempt.questionId,answer:attempt.answer})});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'Optional feedback unavailable. Your answer is saved.');
 if(!['incorrect','unnatural','inappropriate','minor_style','acceptable','uncertain'].includes(data.category)||typeof data.explanation!=='string'||typeof data.suggestion!=='string'||typeof data.model!=='string')throw new Error('Invalid feedback; answer remains ungraded.');
 await db.lexicalAttempts.update(attempt.id,{feedback:data});return data;
}
