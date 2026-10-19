import {db} from './db';
import {grammarLessons} from '../data/grammarLessons';
import {exercisesFor} from '../data/grammarExercises';
import type {GrammarAttempt, GrammarExercise, GrammarProgress, LessonSection} from '../types/grammar';

export const normalizeGrammarAnswer = (answer:string) => answer.normalize('NFC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?;:"“”]/g,' ').trim().replace(/\s+/g,' ');
export function evaluateGrammarAnswer(exercise:GrammarExercise,answer:string) {
  const value=normalizeGrammarAnswer(answer);
  return {correct:!!value && exercise.answers.some(key=>normalizeGrammarAnswer(key)===value),explanation:exercise.explanation,answers:exercise.answers,correction:exercise.correction};
}
const lessonFor = (id:string) => {
  const lesson=grammarLessons.find(l=>l.id===id);
  if(!lesson)throw new Error('This grammar lesson is not available.');
  return lesson;
};
export async function openGrammarLesson(lessonId:string) {
  lessonFor(lessonId);
  return db.transaction('rw',db.grammarProgress,async()=>{
    const now=new Date().toISOString();const previous=await db.grammarProgress.get(lessonId);
    const progress:GrammarProgress=previous ? {...previous,lastStudiedAt:now} : {lessonId,openedAt:now,lastStudiedAt:now,section:'introduction'};
    await db.grammarProgress.put(progress);return progress;
  });
}
export async function setGrammarSection(lessonId:string,section:LessonSection) {
  lessonFor(lessonId);await db.grammarProgress.update(lessonId,{section,lastStudiedAt:new Date().toISOString()});
}
export async function completeGrammarReading(lessonId:string) {
  lessonFor(lessonId);await db.grammarProgress.update(lessonId,{lessonCompletedAt:new Date().toISOString(),lastStudiedAt:new Date().toISOString()});
}
export async function startGrammarSession(lessonId:string,mode:'practice'|'review'='practice',repeat=false) {
  lessonFor(lessonId);
  return db.transaction('rw',[db.grammarProgress,db.grammarAttempts],async()=>{
    const progress=await db.grammarProgress.get(lessonId);if(!progress)throw new Error('Open the lesson before practising.');
    if(progress.activeSession && !repeat) {
      const count=await db.grammarAttempts.where('sessionId').equals(progress.activeSession.id).count();
      if(count<exercisesFor(lessonId).length)return progress.activeSession;
    }
    const session={id:crypto.randomUUID(),mode,startedAt:new Date().toISOString()};
    await db.grammarProgress.update(lessonId,{activeSession:session,section:'practice',lastStudiedAt:session.startedAt});return session;
  });
}
export async function submitGrammarAnswer(lessonId:string,exerciseId:string,answer:string) {
  const exercise=exercisesFor(lessonId).find(q=>q.id===exerciseId);
  if(!exercise || !answer.trim())throw new Error('Choose or enter an answer before checking.');
  if(exercise.choices && !exercise.choices.includes(answer))throw new Error('Choose one of the supplied answers.');
  return db.transaction('rw',[db.grammarProgress,db.grammarAttempts],async()=>{
    const progress=await db.grammarProgress.get(lessonId);const session=progress?.activeSession;
    if(!session)throw new Error('Start a practice session first.');
    const id=`${session.id}:${exercise.id}`;const previous=await db.grammarAttempts.get(id);
    if(previous)return previous; // Double clicks/reloads never inflate scores.
    const timestamp=new Date().toISOString();
    const attempt:GrammarAttempt={id,lessonId,exerciseId,sessionId:session.id,mode:session.mode,answer,correct:evaluateGrammarAnswer(exercise,answer).correct,timestamp};
    await db.grammarAttempts.add(attempt);
    await db.grammarProgress.update(lessonId,{lastStudiedAt:timestamp});return attempt;
  });
}

export function grammarStats(lessonId:string,progress:GrammarProgress|undefined,attempts:GrammarAttempt[],now=Date.now()) {
  const questions=exercisesFor(lessonId);const validIds=new Set(questions.map(q=>q.id));
  const records=attempts.filter(a=>a.lessonId===lessonId && validIds.has(a.exerciseId)).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
  const sessions=new Map<string,GrammarAttempt[]>();
  for(const record of records){const session=sessions.get(record.sessionId)||[];if(!session.some(a=>a.exerciseId===record.exerciseId))session.push(record);sessions.set(record.sessionId,session);}
  const finished=[...sessions.values()].filter(a=>a.length===questions.length).map(items=>({items,score:items.filter(a=>a.correct).length/items.length,time:Date.parse(items.at(-1)!.timestamp)})).sort((a,b)=>a.time-b.time);
  const latest=finished.at(-1);const recent=records.slice(-10);const recentScore=recent.length?recent.filter(a=>a.correct).length/recent.length:0;
  // Reading completion alone cannot confer mastery. A delayed REVIEW must demonstrate retention.
  const retained=!!latest && latest.score>=0.8 && latest.items.every(a=>a.mode==='review') && finished.some(s=>s!==latest && s.score>=0.8 && latest.time-s.time>=24*60*60*1000);
  const mastered=!!progress?.lessonCompletedAt && retained && recentScore>=0.8;
  const nextReviewAt=latest ? new Date(latest.time+(latest.score<0.8?1:mastered?7:3)*86400000).toISOString() : undefined;
  const due=!!nextReviewAt && Date.parse(nextReviewAt)<=now;
  const weak=records.length>0 && (recentScore<0.8 || (!!latest && latest.score<0.8));
  const status = !progress?'Not Started':weak||due?'Needs Review':mastered?'Mastered':records.length?'Practicing':'In Progress';
  return {status,attempted:records.length,correct:records.filter(a=>a.correct).length,incorrect:records.filter(a=>!a.correct).length,recentScore,finishedSessions:finished.length,latestScore:latest?.score,nextReviewAt,due,weak,mastered,lastStudiedAt:progress?.lastStudiedAt};
}

