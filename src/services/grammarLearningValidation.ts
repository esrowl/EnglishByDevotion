import {DOMAINS,LEVELS} from '../types/grammarLearning';
import type {GrammarPlacement,GrammarPreference,GrammarProduction} from '../types/grammarLearning';
import {placementQuestions} from '../data/placementQuestions';
const date=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object';
const normalized=(a:string)=>a.normalize('NFC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?;:"“”]/g,' ').trim().replace(/\s+/g,' ');
export function validPlacement(v:unknown):v is GrammarPlacement{
 if(!record(v)||typeof v.id!=='string'||!v.id||v.version!==1||!date(v.startedAt)||!Array.isArray(v.responses)||v.responses.length>20||v.completedAt!==undefined&&!date(v.completedAt)||!!v.completedAt!==(v.responses.length===20))return false;
 const ids=new Set<string>();
 return v.responses.every((r,i)=>{if(!record(r)||typeof r.questionId!=='string'||ids.has(r.questionId)||typeof r.answer!=='string'||!r.answer.trim()||r.answer.length>4000||!date(r.timestamp))return false;ids.add(r.questionId);const q=placementQuestions.find(q=>q.id===r.questionId);return !!q&&q.domain===DOMAINS[i%5]&&(!q.choices||q.choices.includes(r.answer))&&r.correct===q.answers.some(a=>normalized(a)===normalized(r.answer as string));});
}
export function validGrammarPreference(v:unknown):v is GrammarPreference{return record(v)&&v.id==='grammar'&&LEVELS.includes(v.preferredLevel as never)&&date(v.updatedAt)&&(v.placementSkipped===undefined||typeof v.placementSkipped==='boolean');}
export function validProduction(v:unknown):v is GrammarProduction{return record(v)&&typeof v.id==='string'&&!!v.id&&typeof v.lessonId==='string'&&!!v.lessonId&&typeof v.answer==='string'&&!!v.answer.trim()&&v.answer.length<=4000&&date(v.timestamp)&&(v.feedback===undefined||record(v.feedback)&&['incorrect','unnatural','inappropriate','minor_style','acceptable','uncertain'].includes(v.feedback.category as string)&&typeof v.feedback.explanation==='string'&&typeof v.feedback.suggestion==='string'&&typeof v.feedback.model==='string'&&date(v.feedback.generatedAt));}
