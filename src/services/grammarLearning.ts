import {db} from './db';
import {grammarLessons} from '../data/grammarLessons';
import {exercisesFor} from '../data/grammarExercises';
import {placementQuestions} from '../data/placementQuestions';
import {grammarStats,normalizeGrammarAnswer} from './grammarService';
import {DOMAINS,LEVELS} from '../types/grammarLearning';
import type {AssessmentDomain,GrammarPlacement,GrammarPreference} from '../types/grammarLearning';
import type {CEFRLevel,GrammarAttempt,GrammarProgress} from '../types/grammar';

export const PLACEMENT_LENGTH=20;
const correct=(keys:string[],answer:string)=>!!answer.trim()&&keys.some(k=>normalizeGrammarAnswer(k)===normalizeGrammarAnswer(answer));
// A transparent, uncalibrated Rasch-like heuristic; not a validated psychometric scale.
// The small prior prevents one answer from producing an extreme estimate.
export function ability(session:GrammarPlacement,domain?:AssessmentDomain){
 const evidence=session.responses.flatMap(r=>{const q=placementQuestions.find(q=>q.id===r.questionId);return q&&(!domain||q.domain===domain)?[{q,correct:correct(q.answers,r.answer)}]:[];});
 if(!evidence.length)return undefined;
 const weights=Array.from({length:61},(_,i)=>{const theta=i/10;let log=-0.025*(theta-2.5)**2;for(const e of evidence){const chance=e.q.choices?1/e.q.choices.length:0;const p=chance+(1-chance)/(1+Math.exp(-1.5*(theta-LEVELS.indexOf(e.q.level)-.3)));log+=Math.log(e.correct?p:1-p);}return {theta,log};});
 const peak=Math.max(...weights.map(w=>w.log));const total=weights.reduce((s,w)=>s+Math.exp(w.log-peak),0);
 const mean=weights.reduce((s,w)=>s+w.theta*Math.exp(w.log-peak),0)/total;
 return {value:mean,level:LEVELS[Math.max(0,Math.min(5,Math.floor(mean)))],count:evidence.length,correct:evidence.filter(e=>e.correct).length};
}
export function nextPlacementQuestion(session:GrammarPlacement){
 if(session.completedAt||session.responses.length>=PLACEMENT_LENGTH)return undefined;
 const used=new Set(session.responses.map(r=>r.questionId));
 const domain=DOMAINS[session.responses.length%DOMAINS.length];
 const estimate=ability(session,domain)?.value??ability(session)?.value??3;
 return placementQuestions.filter(q=>q.domain===domain&&!used.has(q.id)).sort((a,b)=>Math.abs(LEVELS.indexOf(a.level)-estimate)-Math.abs(LEVELS.indexOf(b.level)-estimate)||a.id.localeCompare(b.id))[0];
}
export function placementResult(session:GrammarPlacement){
 const dimensions=DOMAINS.map(domain=>({domain,...ability(session,domain)}));
 const overall=ability(session);
 const mistakes=session.responses.flatMap(r=>{const q=placementQuestions.find(q=>q.id===r.questionId);return q&&!correct(q.answers,r.answer)?[q]:[];});
 const priorities=[...new Set(mistakes.flatMap(q=>q.lessonIds))];
 const strengths=dimensions.filter(d=>d.count&&d.count>=3&&d.correct!/d.count>=.75).map(d=>d.domain);
 return {overall:overall?.level,dimensions,strengths,priorities,focus:[...new Set(mistakes.map(q=>q.focus))],complete:session.responses.length===PLACEMENT_LENGTH};
}
export async function startPlacement(){
 return db.transaction('rw',db.grammarPlacements,async()=>{const sessions=await db.grammarPlacements.toArray();const pending=sessions.filter(s=>!s.completedAt).sort((a,b)=>b.startedAt.localeCompare(a.startedAt))[0];if(pending)return pending;const session:GrammarPlacement={id:crypto.randomUUID(),version:1,startedAt:new Date().toISOString(),responses:[]};await db.grammarPlacements.add(session);return session;});
}
export async function answerPlacement(id:string,questionId:string,answer:string){
 return db.transaction('rw',db.grammarPlacements,async()=>{
  const session=await db.grammarPlacements.get(id);if(!session)throw new Error('Placement session not found.');
  // Duplicate submissions are idempotent, including a repeated final submission.
  if(session.responses.some(r=>r.questionId===questionId))return session;
  const q=nextPlacementQuestion(session);if(!q||q.id!==questionId)throw new Error('This question is no longer active.');
  if(!answer.trim()||answer.length>4000||q.choices&&!q.choices.includes(answer))throw new Error('Enter an answer or choose an available option.');
  const now=new Date().toISOString();const updated={...session,responses:[...session.responses,{questionId,answer,correct:correct(q.answers,answer),timestamp:now}]};
  if(updated.responses.length===PLACEMENT_LENGTH)updated.completedAt=now;
  await db.grammarPlacements.put(updated);return updated;
 });
}
export async function setGrammarLevel(level:CEFRLevel,placementSkipped=false){
 if(!LEVELS.includes(level))throw new Error('Choose an available learning level.');
 const preference:GrammarPreference={id:'grammar',preferredLevel:level,placementSkipped,updatedAt:new Date().toISOString()};await db.grammarPreferences.put(preference);
}
export function skillBreakdown(lessonId:string,attempts:GrammarAttempt[]){
 const questions=exercisesFor(lessonId);const byId=new Map(questions.map(q=>[q.id,q]));
 const records=attempts.filter(a=>a.lessonId===lessonId&&byId.has(a.exerciseId)).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
 const recognition=records.filter(a=>!!byId.get(a.exerciseId)?.choices);
 const production=records.filter(a=>!byId.get(a.exerciseId)?.choices);
 const summary=(items:GrammarAttempt[])=>({attempted:items.length,correct:items.filter(a=>a.correct).length,recentAccuracy:items.length?items.slice(-10).filter(a=>a.correct).length/Math.min(10,items.length):undefined});
 const recurring=questions.filter(q=>records.filter(a=>a.exerciseId===q.id&&!a.correct).length>=2).map(q=>({exerciseId:q.id,kind:q.kind,prompt:q.prompt,explanation:q.explanation}));
 const r=summary(recognition),p=summary(production);
 return {recognition:r,production:p,recurring,recommendation:p.attempted&&p.recentAccuracy!<.8?'Prioritize controlled sentence construction and transformations.':!p.attempted?'Try controlled production; recognition alone does not demonstrate sentence construction.':r.attempted&&r.recentAccuracy!<.8?'Revisit the explanation and contrasts before another recognition exercise.':'Practise again on a later date to check retention.',vocabulary:questions.filter(q=>q.vocabulary).map(q=>({...q.vocabulary!,grammarAttempts:records.filter(a=>a.exerciseId===q.id).length}))};
}
export function recommendGrammar(progress:GrammarProgress[],attempts:GrammarAttempt[],level:CEFRLevel='B2'){
 return grammarLessons.map(lesson=>{const p=progress.find(p=>p.lessonId===lesson.id),s=grammarStats(lesson.id,p,attempts),skills=skillBreakdown(lesson.id,attempts);return {lesson,stats:s,skills,score:(s.weak?100:0)+(s.due?80:0)+(p&&!p.lessonCompletedAt?10:0)-(s.mastered?40:0)-Math.abs(LEVELS.indexOf(lesson.level||'B2')-LEVELS.indexOf(level))*8};}).sort((a,b)=>b.score-a.score).slice(0,3);
}
export async function saveGrammarProduction(lessonId:string,answer:string){
 if(!grammarLessons.some(l=>l.id===lessonId)||!answer.trim()||answer.length>4000)throw new Error('Enter a response of up to 4,000 characters.');
 const record={id:crypto.randomUUID(),lessonId,answer:answer.trim(),timestamp:new Date().toISOString()};await db.grammarProduction.add(record);return record;
}
