import type {LexicalAttempt} from '../types/lexical';
export const EXERCISE_KINDS=['meaning','context','construction','translation','formation','semantic','collocation','correction'] as const;
export function validLexicalAttempt(value:unknown):value is LexicalAttempt {
  const a=value as LexicalAttempt;
  if(a?.feedback&&(!['incorrect','unnatural','inappropriate','minor_style','acceptable','uncertain'].includes(a.feedback.category)||typeof a.feedback.explanation!=='string'||typeof a.feedback.suggestion!=='string'||typeof a.feedback.model!=='string'||!Number.isFinite(Date.parse(a.feedback.generatedAt))))return false;
  return !!a&&typeof a.id==='string'&&!!a.id&&typeof a.word==='string'&&typeof a.questionId==='string'&&EXERCISE_KINDS.includes(a.kind)&&typeof a.answer==='string'&&(a.correct===null||typeof a.correct==='boolean')&&typeof a.explanation==='string'&&Number.isFinite(Date.parse(a.timestamp))&&/^\d{4}-\d{2}-\d{2}$/.test(a.nextReviewDate)&&Number.isInteger(a.interval)&&a.interval>=0&&Number.isInteger(a.repetition)&&a.repetition>=0;
}
