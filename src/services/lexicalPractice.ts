import {db} from './db';
import {LEXICAL_QUESTIONS} from '../data/lexicalPractice';
import type {LexicalAttempt,LexicalQuestion} from '../types/lexical';
import {addDaysToDate,getTodayDateString} from './srs';
import {learningSummary} from './vocabularyIntelligence';

export const normalizeLexicalAnswer=(value:string)=>value.normalize('NFC').toLocaleLowerCase('en').replace(/[’‘]/g,"'").trim().replace(/[.!?,;:]+$/,'').replace(/\s+/g,' ').trim();
export function gradeLexicalAnswer(question:LexicalQuestion,answer:string):boolean|null {
  if(!question.answers.length)return null;
  return !!answer.trim()&&question.answers.some(key=>normalizeLexicalAnswer(key)===normalizeLexicalAnswer(answer));
}
export async function recordLexicalAnswer(id:string,questionId:string,answer:string):Promise<LexicalAttempt>{
  const question=LEXICAL_QUESTIONS.find(q=>q.id===questionId);
  if(!question||!id||!answer.trim()||answer.length>4000)throw new Error('A valid question and answer (up to 4,000 characters) are required.');
  return db.transaction('rw',db.lexicalAttempts,async()=>{
    const existing=await db.lexicalAttempts.get(id);if(existing){if(existing.questionId!==questionId||existing.answer!==answer)throw new Error('Conflicting submission.');return existing;}
    const previous=await db.lexicalAttempts.where('questionId').equals(questionId).sortBy('timestamp');
    const last=previous.at(-1),correct=gradeLexicalAnswer(question,answer),today=getTodayDateString();
    // Repeated answers on the same day cannot stretch the review schedule.
    const spaced=!!last&&last.nextReviewDate<=today&&last.timestamp.slice(0,10)<today;
    const repetition=correct===true?(last?last.repetition+(spaced?1:0):1):0;
    const interval=correct===null?0:correct?spaced?Math.min(90,Math.max(1,(last?.interval||1)*2)):last?.interval||1:1;
    const attempt:LexicalAttempt={id,word:question.word,questionId,kind:question.kind,answer,correct,explanation:question.explanation,timestamp:new Date().toISOString(),repetition,interval,nextReviewDate:correct===null?today:!spaced&&last?.correct&&correct?last.nextReviewDate:addDaysToDate(today,interval)};
    await db.lexicalAttempts.add(attempt);return attempt;
  });
}
export function practiceQueue(attempts:LexicalAttempt[],random=Math.random){
  const today=getTodayDateString(),last=new Map<string,LexicalAttempt>();
  const confused=new Set(attempts.filter(a=>a.correct===false).flatMap(a=>[a.word,...LEXICAL_QUESTIONS.filter(q=>q.word===normalizeLexicalAnswer(a.answer)).map(q=>q.word)]));
  for(const a of [...attempts].sort((a,b)=>a.timestamp.localeCompare(b.timestamp)))last.set(a.questionId,a);
  const weight=(q:LexicalQuestion)=>{const p=last.get(q.id),weak=learningSummary(q.word,attempts).needsReview;return (!p?5:p.correct===null?1:p.nextReviewDate<=today?8:1)+(weak&&q.kind!=='meaning'?3:0)+(confused.has(q.word)&&q.kind==='semantic'?3:0);};
  return LEXICAL_QUESTIONS.map(q=>({q,score:-Math.log(Math.max(.000001,random()))/weight(q)})).sort((a,b)=>a.score-b.score).map(r=>r.q);
}
export function shuffledChoices(q:LexicalQuestion,random=Math.random){const choices=[...(q.choices||[])];for(let i=choices.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}return choices;}
