import type {GrammarProgress,GrammarAttempt} from '../types/grammar';

export function validGrammarProgress(value:unknown):value is GrammarProgress {
  const p=value as GrammarProgress;if(!p || typeof p.lessonId!=='string' || !Number.isFinite(Date.parse(p.openedAt)) || !Number.isFinite(Date.parse(p.lastStudiedAt)))return false;
  return ['introduction','structure','examples','mistakes','practice','summary','review'].includes(p.section) && (!p.lessonCompletedAt || Number.isFinite(Date.parse(p.lessonCompletedAt))) && (!p.activeSession || (typeof p.activeSession.id==='string' && ['practice','review'].includes(p.activeSession.mode) && Number.isFinite(Date.parse(p.activeSession.startedAt))));
}
export function validGrammarAttempt(value:unknown):value is GrammarAttempt {
  const a=value as GrammarAttempt;return !!a && [a.id,a.lessonId,a.exerciseId,a.sessionId,a.answer].every(v=>typeof v==='string' && !!v.trim()) && a.id===`${a.sessionId}:${a.exerciseId}` && ['practice','review'].includes(a.mode) && typeof a.correct==='boolean' && Number.isFinite(Date.parse(a.timestamp));
}
