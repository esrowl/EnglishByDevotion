import type { VocabularyItem } from '../types/vocabulary';
import { createInitialSRSState } from './srs';

/** Read-time compatibility only: never rewrite legacy records or schedules. */
export function normalizeVocabulary(raw: Partial<VocabularyItem>): VocabularyItem {
  if (!raw || typeof raw.word !== 'string' || !raw.word.trim()) throw new Error('Every vocabulary record must contain a word.');
  const text = (value: unknown) => typeof value === 'string' ? value : '';
  const list = <T,>(value: T[] | undefined) => Array.isArray(value) ? value.filter(Boolean) : [];
  const initial = createInitialSRSState();
  const srs = {...initial, ...raw.srs};
  for (const key of ['repetition', 'interval', 'easeFactor', 'lapses'] as const) {
    if (!Number.isFinite(srs[key]) || srs[key] < 0) srs[key] = initial[key];
  }
  if (typeof srs.nextReviewDate !== 'string') srs.nextReviewDate = initial.nextReviewDate;
  return {
    ...raw,
    id: raw.id || crypto.randomUUID(), word: raw.word.trim(),
    normalizedHeadword: raw.word.trim().normalize('NFC').toLowerCase(),
    partOfSpeech: raw.partOfSpeech || 'other', cefrLevel: raw.cefrLevel || 'Unspecified',
    turkishMeaning: text(raw.turkishMeaning), englishDefinition: text(raw.englishDefinition),
    examples: list(raw.examples).filter(e => typeof e.sentence === 'string'),
    collocations: list(raw.collocations).filter(e => typeof e.collocation === 'string'),
    synonyms: list(raw.synonyms).filter(e => typeof e.word === 'string'),
    antonyms: list(raw.antonyms).filter(e => typeof e.word === 'string'),
    topicCategories: list(raw.topicCategories).filter(e => typeof e === 'string'),
    grammaticalPatterns: list(raw.grammaticalPatterns).filter(e => typeof e === 'string'),
    provenance: raw.provenance || {sourceType: 'user_created', isVerified: false},
    personalNotes: text(raw.personalNotes), isFavorite: !!raw.isFavorite, isDifficult: !!raw.isDifficult,
    learningStatus: raw.learningStatus || 'new', dateAdded: raw.dateAdded || '',
    srs,
  };
}
