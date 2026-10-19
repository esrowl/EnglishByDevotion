export type GrammarGroup = 'Foundations' | 'Intermediate' | 'Upper Intermediate' | 'Advanced';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ExerciseKind = 'multiple-choice' | 'fill-blank' | 'error-identification' | 'sentence-ordering' | 'structure-recognition' | 'transformation' | 'error-correction' | 'sentence-completion' | 'context-selection' | 'guided-construction';
export interface GrammarExercise {
  id: string;
  lessonId: string;
  kind: ExerciseKind;
  prompt: string;
  choices?: string[];
  tokens?: string[];
  answers: string[];
  explanation: string;
  correction?: string;
  vocabulary?: {word:string;meaning:string};
}
export interface GrammarLesson {
  id: string;
  title: string;
  group: GrammarGroup;
  introduction: string[];
  purpose: string;
  structures: string[];
  examples: {sentence: string; why: string}[];
  mistakes: {incorrect: string; correct: string; why: string}[];
  summary: string[];
  turkish?: string;
  references: {title: string; url: string}[];
  level?: CEFRLevel;
  category?: string;
  comparisons?: {contrast:string;explanation:string}[];
  production?: {prompt:string;reference:string;criteria:string[]};
}
export type LessonSection = 'introduction' | 'structure' | 'examples' | 'mistakes' | 'practice' | 'summary' | 'review';
export interface GrammarProgress {
  lessonId: string;
  openedAt: string;
  lessonCompletedAt?: string;
  lastStudiedAt: string;
  section: LessonSection;
  activeSession?: {id: string; mode: 'practice' | 'review'; startedAt: string};
}
export interface GrammarAttempt {
  id: string;
  lessonId: string;
  exerciseId: string;
  sessionId: string;
  mode: 'practice' | 'review';
  answer: string;
  correct: boolean;
  timestamp: string;
}
