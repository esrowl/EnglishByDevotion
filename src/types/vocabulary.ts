import type { DictionaryData, SourceCredit } from './contentSources';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'idiom'
  | 'phrasal_verb'
  | 'expression'
  | 'conjunction'
  | 'preposition'
  | 'other';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Unspecified';

export type LearningStatus = 'new' | 'learning' | 'review' | 'mastered';

export type ProvenanceType =
  | 'dictionary_verified'
  | 'ai_generated'
  | 'user_created'
  | 'imported_file';

export interface ContentProvenance {
  sourceType: ProvenanceType;
  sourceName?: string;
  sourceUrl?: string;
  attribution?: string;
  isVerified: boolean;
  notes?: string;
}

export interface ExampleSentence {
  id: string;
  sentence: string;
  translation?: string;
  highlightedTarget?: string;
  credit?: SourceCredit;
  translationCredit?: SourceCredit;
}

export interface CollocationItem {
  collocation: string;
  meaningTr?: string;
  example?: string;
}

export interface SynonymAntonymItem {
  word: string;
  nuance?: string;
}

export interface WordFamily {
  noun?: string[];
  verb?: string[];
  adjective?: string[];
  adverb?: string[];
}

export interface SRSState {
  repetition: number;
  interval: number; // in days
  easeFactor: number; // starts at 2.5
  lapses: number;
  lastRating?: 'again' | 'hard' | 'good' | 'easy';
  nextReviewDate: string; // ISO date string YYYY-MM-DD
  lastReviewedDate?: string; // ISO datetime string
}

export interface VocabularyItem {
  id: string;
  word: string;
  normalizedHeadword: string; // trimmed and lowercase
  partOfSpeech: PartOfSpeech;
  cefrLevel?: CEFRLevel;
  ipa?: string;
  turkishMeaning: string;
  englishDefinition: string;
  examples: ExampleSentence[];
  collocations: CollocationItem[];
  synonyms: SynonymAntonymItem[];
  antonyms: SynonymAntonymItem[];
  wordFamily?: WordFamily;
  grammaticalPatterns?: string[];
  registerUsageNotes?: string;
  commonMistakes?: string;
  topicCategories: string[];
  provenance: ContentProvenance;
  personalNotes?: string;
  isFavorite: boolean;
  isDifficult: boolean;
  learningStatus: LearningStatus;
  dateAdded: string; // ISO datetime string
  dateLearned?: string; // First actual study, not lookup or import.
  srs: SRSState;
  dictionaryData?: DictionaryData;
  frequencyRank?:number;
  frequencySource?:'ngsl_sfi_31k';
  lexicalData?: import('./lexical').LexicalEntry;
  aiTranslations?: {sense:string;partOfSpeech:string;turkish:string[];model:string;generatedAt:string;status:'ai_generated'}[];
}

export interface ReviewLog {
  id: string;
  vocabularyId: string;
  word: string;
  timestamp: string; // ISO datetime
  rating: 'again' | 'hard' | 'good' | 'easy';
  mode: FlashcardMode;
  responseDurationMs?: number;
  scheduledIntervalDays: number;
  easeFactorAfter: number;
}

export type FlashcardMode =
  | 'en_to_tr'
  | 'tr_to_en'
  | 'sentence_context'
  | 'collocation'
  | 'synonym_antonym'
  | 'typed_recall';

export interface DailySession {
  date: string; // YYYY-MM-DD
  targetCount: number;
  completedVocabularyIds: string[];
  plannedVocabularyIds: string[];
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface UserSettings {
  id: string;
  dailyTarget: number;
  preferredCategories: string[];
  preferredCEFR: CEFRLevel[];
  defaultFlashcardMode: FlashcardMode;
  autoPlayAudio: boolean;
  learningLanguage: 'tr';
  showProvenanceBadge: boolean;
  theme: 'dark';
}
