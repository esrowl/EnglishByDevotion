import type {DictionaryData} from './contentSources';

export interface LexicalSense {
  id:string; partOfSpeech:string; definition:string; turkish:string[];
  translationGloss?:string; tags:string[]; synonyms:string[]; antonyms:string[];
  translationSourceUrl?:string; translationDownloadUrl?:string;
}
export interface LexicalEntry {
  word:string; version:string; dictionary:DictionaryData; senses:LexicalSense[];
  relations:{word:string; kind:'derived'|'related'; sense?:string}[];
  semanticRelations?:{kind:'synonym'|'antonym';sense:string;partOfSpeech:string;words:string[]}[];
  sourceUrl:string; downloadUrl:string; retrievedAt:string;
  verification:'dictionary_sourced'; license:'CC BY-SA 4.0';
}
export type LexicalExerciseKind='meaning'|'context'|'construction'|'translation'|'formation'|'semantic'|'collocation'|'correction';
export interface LexicalQuestion {
  id:string; word:string; sense:string; kind:LexicalExerciseKind; prompt:string;
  answers:string[]; choices?:string[]; explanation:string;
  direction?:'en-tr'|'tr-en'; reference?:string;
}
export interface LanguageFeedback {
  category:'incorrect'|'unnatural'|'inappropriate'|'minor_style'|'acceptable'|'uncertain';
  explanation:string; suggestion:string; model:string; generatedAt:string;
}
export interface LexicalAttempt {
  id:string; word:string; questionId:string; kind:LexicalExerciseKind;
  timestamp:string; answer:string; correct:boolean|null; explanation:string;
  nextReviewDate:string; interval:number; repetition:number; feedback?:LanguageFeedback;
}
