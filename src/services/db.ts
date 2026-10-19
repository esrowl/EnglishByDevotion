import Dexie, { type Table } from 'dexie';
import type { ContentCache, ReadingItem } from '../types/contentSources';
import type {GrammarProgress,GrammarAttempt} from '../types/grammar';
import {validGrammarProgress,validGrammarAttempt} from './grammarValidation';
import {validEncounter,validDiscoveryPreferences,validRecallAttempt} from '../types/discovery';
import type {DiscoveryWord,DiscoveryEncounter,DiscoveryPreferences,RecallAttempt} from '../types/discovery';
import {
  VocabularyItem,
  ReviewLog,
  DailySession,
  UserSettings,
  FlashcardMode,
} from '../types/vocabulary';
import { calculateNextSRS, getTodayDateString, Rating, isItemDue } from './srs';
import { INITIAL_SEED_VOCABULARY } from '../data/seedData';
import { normalizeVocabulary } from './vocabularyValidation';
import type {LexicalEntry,LexicalAttempt} from '../types/lexical';
import {validLexicalEntry} from './kaikkiAdapter';
import {validLexicalAttempt} from './lexicalValidation';
import type {GrammarPlacement,GrammarPreference,GrammarProduction} from '../types/grammarLearning';
import {validPlacement,validGrammarPreference,validProduction} from './grammarLearningValidation';

export class LexoraDatabase extends Dexie {
  vocabulary!: Table<VocabularyItem, string>;
  reviewLogs!: Table<ReviewLog, string>;
  dailySessions!: Table<DailySession, string>;
  settings!: Table<UserSettings, string>;
  contentCache!: Table<ContentCache, string>;
  readings!: Table<ReadingItem, string>;
  grammarProgress!: Table<GrammarProgress,string>;
  grammarAttempts!: Table<GrammarAttempt,string>;
  discoveryPool!:Table<DiscoveryWord,string>;
  discoveryCore!:Table<{key:string;word:string;rank:number},string>;
  discoveryEncounters!:Table<DiscoveryEncounter,string>;
  discoveryPreferences!:Table<DiscoveryPreferences,string>;
  recallAttempts!:Table<RecallAttempt,string>;
  lexicon!:Table<LexicalEntry,string>;
  lexicalAttempts!:Table<LexicalAttempt,string>;
  grammarPlacements!:Table<GrammarPlacement,string>;
  grammarPreferences!:Table<GrammarPreference,string>;
  grammarProduction!:Table<GrammarProduction,string>;

  constructor() {
    super('LexoraDB');
    this.version(1).stores({
      vocabulary: 'id, normalizedHeadword, word, partOfSpeech, cefrLevel, learningStatus, isFavorite, isDifficult, dateAdded, srs.nextReviewDate, *topicCategories',
      reviewLogs: 'id, vocabularyId, word, timestamp, rating, mode',
      dailySessions: 'date, isCompleted',
      settings: 'id',
    });
    // Additive migration: retain every existing store, record and primary key.
    this.version(2).stores({ contentCache: 'key, retrievedAt' });
    this.version(3).stores({ readings: 'id, title, dateAdded' });
    this.version(4).stores({grammarProgress:'lessonId,lastStudiedAt',grammarAttempts:'id,lessonId,sessionId,exerciseId,timestamp'});
    this.version(5).stores({discoveryPool:'key,rank,coreRank',discoveryEncounters:'word,seenAt,feedback,vocabularyId',discoveryPreferences:'id',recallAttempts:'id,vocabularyId,timestamp'});
    this.version(6).stores({discoveryCore:'key,rank'});
    this.version(7).stores({lexicon:'word,version',lexicalAttempts:'id,word,questionId,kind,timestamp,nextReviewDate'});
    this.version(8).stores({grammarPlacements:'id,startedAt,completedAt',grammarPreferences:'id',grammarProduction:'id,lessonId,timestamp'});
  }
}

export const db = new LexoraDatabase();

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'user_settings',
  dailyTarget: 0, // 0 indicates flexible open-ended learning without rigid quotas
  preferredCategories: ['IELTS Academic', 'Advanced General English', 'Natural English Expressions'],
  preferredCEFR: ['B2', 'C1', 'C2'],
  defaultFlashcardMode: 'en_to_tr',
  autoPlayAudio: false,
  learningLanguage: 'tr',
  showProvenanceBadge: true,
  theme: 'dark',
};

// ==================== DATABASE INITIALIZATION & HELPERS ====================

export async function initDatabase(): Promise<void> {
  // Serialize initialization, including React StrictMode's repeated effect.
  await db.transaction('rw', db.vocabulary, db.settings, async () => {
  const count = await db.vocabulary.count();
  if (count === 0 && !(await db.settings.get('user_settings'))) {
    // Populate default seed data
    await db.vocabulary.bulkAdd(INITIAL_SEED_VOCABULARY);
  }

  const existingSettings = await db.settings.get('user_settings');
  if (!existingSettings) {
    await db.settings.put(DEFAULT_SETTINGS);
  }
  });
}

export async function resetWithSeedData(): Promise<void> {
  await db.transaction('rw', db.vocabulary, async () => {
    const existing = await getAllVocabulary();
    const words = new Set(existing.map(v => v.normalizedHeadword));
    for (const item of INITIAL_SEED_VOCABULARY) {
      if (!words.has(item.normalizedHeadword) && !(await db.vocabulary.get(item.id))) await db.vocabulary.add(item);
    }
  });
}

export async function getAllVocabulary(): Promise<VocabularyItem[]> {
  return (await db.vocabulary.toArray()).filter(v => typeof v?.word === 'string' && v.word.trim()).map(normalizeVocabulary);
}

export async function getVocabularyById(id: string): Promise<VocabularyItem | undefined> {
  const item = await db.vocabulary.get(id);
  return item ? normalizeVocabulary(item) : undefined;
}

export async function addVocabulary(item: VocabularyItem, allowDuplicate = false): Promise<string> {
  await db.transaction('rw', db.vocabulary, async () => {
    const normalized = normalizeVocabulary(item);
    if (!allowDuplicate && (await getAllVocabulary()).some(v => v.normalizedHeadword === normalized.normalizedHeadword)) throw new Error('This word is already in your vocabulary library.');
    await db.vocabulary.add(normalized);
  });
  return item.id;
}

export async function updateVocabulary(
  id: string,
  updates: Partial<VocabularyItem>
): Promise<void> {
  await db.transaction('rw', db.vocabulary, async () => {
    const existing = await getVocabularyById(id);
    if (!existing) throw new Error('This word no longer exists.');
    const safeUpdates = {...updates};
    delete safeUpdates.id;
    if (updates.word !== undefined) {
      if (!updates.word.trim()) throw new Error('A word is required.');
      const normalized = updates.word.trim().normalize('NFC').toLowerCase();
      if (normalized !== existing.normalizedHeadword && (await getAllVocabulary()).some(v => v.id !== id && v.normalizedHeadword === normalized)) throw new Error('This word already exists.');
      safeUpdates.normalizedHeadword = normalized;
    }
    await db.vocabulary.update(id, safeUpdates);
  });
}

export async function deleteVocabulary(id: string): Promise<void> {
  await db.transaction('rw', [db.vocabulary, db.reviewLogs, db.recallAttempts, db.discoveryEncounters, db.dailySessions], async () => {
    await db.vocabulary.delete(id);
    await db.reviewLogs.where('vocabularyId').equals(id).delete();
    await db.recallAttempts.where('vocabularyId').equals(id).delete();
    // Keep discovery feedback as history, but do not point it at a deleted word.
    await db.discoveryEncounters.where('vocabularyId').equals(id).modify({vocabularyId: undefined});
    await db.dailySessions.toCollection().modify(session => {
      if (Array.isArray(session.completedVocabularyIds)) session.completedVocabularyIds = session.completedVocabularyIds.filter(wordId => wordId !== id);
      if (Array.isArray(session.plannedVocabularyIds)) session.plannedVocabularyIds = session.plannedVocabularyIds.filter(wordId => wordId !== id);
    });
  });
}

export async function toggleFavorite(id: string): Promise<boolean> {
  return db.transaction('rw',db.vocabulary,async()=>{
  const item = await db.vocabulary.get(id);
  if (!item) return false;
  const newFav = !item.isFavorite;
  await db.vocabulary.update(id, { isFavorite: newFav });
  return newFav;
  });
}

export async function toggleDifficult(id: string): Promise<boolean> {
  return db.transaction('rw',db.vocabulary,async()=>{
  const item = await db.vocabulary.get(id);
  if (!item) return false;
  const newDiff = !item.isDifficult;
  await db.vocabulary.update(id, { isDifficult: newDiff });
  return newDiff;
  });
}

export async function getDueVocabulary(): Promise<VocabularyItem[]> {
  const all = await getAllVocabulary();
  return all.filter((item) => isItemDue(item.srs));
}

export async function getDifficultVocabulary(): Promise<VocabularyItem[]> {
  return (await getAllVocabulary()).filter(v => v.isDifficult || v.srs.lapses > 1);
}

export async function getRecentVocabulary(limit = 10): Promise<VocabularyItem[]> {
  const all = await db.vocabulary.toArray();
  return all
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, limit);
}

// ==================== REAL-TIME DAILY ACTIVITY METRICS ====================

export interface TodayActivityStats {
  wordsLearnedToday: number;
  wordsReviewedToday: number;
  wordsDueToday: number;
}

export async function getTodayActivityStats(vocabulary?: VocabularyItem[]): Promise<TodayActivityStats> {
  const today = getTodayDateString();
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const allLogs = await db.reviewLogs.where('timestamp').between(start.toISOString(), end.toISOString(), true, false).toArray();
  const allVocab = vocabulary || await getAllVocabulary();

  // Words reviewed today (unique vocabulary IDs reviewed today)
  const todayLogs = allLogs.filter((l) => {
    const date = new Date(l.timestamp);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` === today;
  });
  const uniqueReviewedIds = new Set(todayLogs.map((l) => l.vocabularyId));

  // Words learned today: items that were studied/added today
  const learnedToday = allVocab.filter((v) => {
    if (!v.dateLearned) return false;
    const date = new Date(v.dateLearned);
    return date >= start && date < end;
  });

  const dueCount = allVocab.filter((v) => isItemDue(v.srs)).length;

  return {
    wordsLearnedToday: learnedToday.length,
    wordsReviewedToday: uniqueReviewedIds.size,
    wordsDueToday: dueCount,
  };
}

// ==================== SRS & REVIEW LOGS ====================

export async function recordReviewResult(
  vocabularyId: string,
  rating: Rating,
  mode: FlashcardMode,
  durationMs = 0
): Promise<VocabularyItem | undefined> {
  if (!['again','hard','good','easy'].includes(rating)) throw new Error('Invalid review rating.');
  return db.transaction('rw', db.vocabulary, db.reviewLogs, async () => {
  const item = await getVocabularyById(vocabularyId);
  if (!item) return undefined;

  const { srs: updatedSRS, newStatus } = calculateNextSRS(item.srs, rating);

  const isDifficult = updatedSRS.lapses >= 2 ? true : item.isDifficult;

  const updatedItem: VocabularyItem = {
    ...item,
    srs: updatedSRS,
    learningStatus: newStatus,
    isDifficult,
    dateLearned: item.dateLearned || (item.learningStatus === 'new' ? new Date().toISOString() : undefined),
  };

  await db.vocabulary.put(updatedItem);

  const reviewLog: ReviewLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    vocabularyId: item.id,
    word: item.word,
    timestamp: new Date().toISOString(),
    rating,
    mode,
    responseDurationMs: durationMs,
    scheduledIntervalDays: updatedSRS.interval,
    easeFactorAfter: updatedSRS.easeFactor,
  };

  await db.reviewLogs.add(reviewLog);

  return updatedItem;
  });
}

export async function markWordLearned(vocabularyId: string): Promise<void> {
  const item = await db.vocabulary.get(vocabularyId);
  if (!item) return;

  if (item.learningStatus === 'new') {
    await db.vocabulary.update(vocabularyId, {
      learningStatus: 'learning',
      dateLearned: new Date().toISOString(),
    });
  }
}

// ==================== SETTINGS & BACKUP ====================

export async function getSettings(): Promise<UserSettings> {
  const settings = await db.settings.get('user_settings');
  return { ...DEFAULT_SETTINGS, ...settings };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await db.settings.put(settings);
}

export async function exportDatabaseJSON(): Promise<string> {
  return db.transaction('r', [db.vocabulary, db.reviewLogs, db.dailySessions, db.settings, db.contentCache, db.readings,db.grammarProgress,db.grammarAttempts,db.discoveryEncounters,db.discoveryPreferences,db.recallAttempts,db.lexicon,db.lexicalAttempts,db.grammarPlacements,db.grammarPreferences,db.grammarProduction], async () => {
  const vocabulary = await db.vocabulary.toArray();
  const reviewLogs = await db.reviewLogs.toArray();
  const dailySessions = await db.dailySessions.toArray();
  const settings = await getSettings();
  const contentCache = await db.contentCache.toArray();
  const readings = await db.readings.toArray();
  const grammarProgress=await db.grammarProgress.toArray();
  const grammarAttempts=await db.grammarAttempts.toArray();

  const exportPayload = {
    appName: 'EnglishByDevotion — Personal Vocabulary Lab',
    version: '8.0.0',
    author: 'Esra',
    exportDate: new Date().toISOString(),
    data: {
      vocabulary,
      reviewLogs,
      dailySessions,
      settings,
      contentCache,
      readings,
      grammarProgress,
      grammarAttempts,
      discoveryEncounters:await db.discoveryEncounters.toArray(),
      discoveryPreferences:await db.discoveryPreferences.toArray(),
      recallAttempts:await db.recallAttempts.toArray(),
      lexicon:await db.lexicon.toArray(),
      lexicalAttempts:await db.lexicalAttempts.toArray(),
      grammarPlacements:await db.grammarPlacements.toArray(),
      grammarPreferences:await db.grammarPreferences.toArray(),
      grammarProduction:await db.grammarProduction.toArray(),
    },
  };

  return JSON.stringify(exportPayload, null, 2);
  });
}

export async function importDatabaseJSON(jsonString: string, mode: 'merge' | 'empty-profile' | 'portable' = 'merge'): Promise<{ count: number; error?: string }> {
  try {
    const parsed = JSON.parse(jsonString);
    let itemsToImport: VocabularyItem[] = [];

    if (parsed?.data && Array.isArray(parsed.data.vocabulary)) {
      itemsToImport = parsed.data.vocabulary;
    } else if (Array.isArray(parsed)) {
      itemsToImport = parsed;
    } else {
      return { count: 0, error: 'Unrecognized JSON format.' };
    }

    if (itemsToImport.length === 0 && !parsed.data) {
      return { count: 0, error: 'No vocabulary records found in the JSON file.' };
    }

    if(itemsToImport.some(item=>item.lexicalData&&!validLexicalEntry(item.lexicalData)))throw new Error('Invalid lexical vocabulary data.');
    if(itemsToImport.some(item=>item.aiTranslations&&(!Array.isArray(item.aiTranslations)||!item.aiTranslations.every(t=>t.status==='ai_generated'&&typeof t.sense==='string'&&typeof t.partOfSpeech==='string'&&typeof t.model==='string'&&Array.isArray(t.turkish)&&t.turkish.every(s=>typeof s==='string')))))throw new Error('Invalid generated translation data.');
    const validated = itemsToImport.map(normalizeVocabulary);
    let count = 0;
    await db.transaction('rw', [db.vocabulary, db.reviewLogs, db.dailySessions, db.settings, db.readings, db.contentCache,db.grammarProgress,db.grammarAttempts,db.discoveryEncounters,db.discoveryPreferences,db.recallAttempts,db.lexicon,db.lexicalAttempts,db.grammarPlacements,db.grammarPreferences,db.grammarProduction], async () => {
      const empty = !(await db.vocabulary.count()) && !(await db.reviewLogs.count()) && !(await db.dailySessions.count()) && !(await db.readings.count()) && !(await db.grammarProgress.count()) && !(await db.grammarAttempts.count()) && !(await db.discoveryEncounters.count()) && !(await db.recallAttempts.count());
      if (mode === 'empty-profile' && !empty) throw new Error('Full restore requires an empty profile; existing data was preserved.');
      if(mode==='empty-profile'&&await db.lexicalAttempts.count())throw new Error('Existing lexical progress was preserved.');
      if(mode==='empty-profile'&&((await db.grammarPlacements.count())||(await db.grammarPreferences.count())||(await db.grammarProduction.count())))throw new Error('Existing grammar learning records were preserved.');
      for(const store of ['grammarPlacements','grammarPreferences','grammarProduction'] as const){
        const values=parsed.data?.[store];if(values!==undefined&&!Array.isArray(values))throw new Error('Invalid grammar learning backup.');
        for(const value of values||[]){
          const valid=store==='grammarPlacements'?validPlacement(value):store==='grammarPreferences'?validGrammarPreference(value):validProduction(value);
          if(!valid)throw new Error(`Invalid ${store} record; import cancelled.`);
          const table=db.table(store);const prior=await table.get(value.id);
          if(!prior)await table.add(value);
          else if(store==='grammarPreferences'){if(value.updatedAt>prior.updatedAt)await table.put(value);}
          else if(store==='grammarPlacements'){
            const common=Math.min(prior.responses.length,value.responses.length);
            if(prior.startedAt!==value.startedAt||JSON.stringify(prior.responses.slice(0,common))!==JSON.stringify(value.responses.slice(0,common)))throw new Error('Conflicting placement history; existing records preserved.');
            if(value.responses.length>prior.responses.length)await table.put(value);
          }else if(prior.lessonId!==value.lessonId||prior.answer!==value.answer||prior.timestamp!==value.timestamp)throw new Error('Conflicting production record; existing answer preserved.');
          else if(!prior.feedback&&value.feedback)await table.put({...prior,feedback:value.feedback});
        }
      }
      for(const name of ['lexicon','lexicalAttempts'])if(parsed.data?.[name]!==undefined&&!Array.isArray(parsed.data[name]))throw new Error('Invalid lexical backup.');
      for(const entry of parsed.data?.lexicon||[]){if(!validLexicalEntry(entry))throw new Error('Invalid lexical entry in backup.');if(!(await db.lexicon.get(entry.word)))await db.lexicon.add(entry);}
      for(const attempt of parsed.data?.lexicalAttempts||[]){
        if(!validLexicalAttempt(attempt))throw new Error('Invalid lexical attempt in backup.');
        const previous=await db.lexicalAttempts.get(attempt.id);
        if(!previous)await db.lexicalAttempts.add(attempt);
        else{
          const immutable=['word','questionId','kind','timestamp','answer','correct','explanation','nextReviewDate','interval','repetition'] as const;
          if(immutable.some(key=>previous[key]!==attempt[key]))throw new Error('Conflicting lexical attempt; existing history preserved.');
          if(!previous.feedback&&attempt.feedback)await db.lexicalAttempts.update(previous.id,{feedback:attempt.feedback});
        }
      }
      const existing = await getAllVocabulary();
      const words = new Map(existing.map(v => [v.normalizedHeadword, v.id]));
      const ids = new Map<string, string>();
      for (const item of validated) {
        let match = (mode === 'merge' ? words.get(item.normalizedHeadword) : undefined) || (await db.vocabulary.get(item.id))?.id;
        if (match && mode === 'portable') {
          const existingItem = await getVocabularyById(match);
          const stable = (value: unknown): string => JSON.stringify(value, (_key, entry) => entry && typeof entry === 'object' && !Array.isArray(entry) ? Object.fromEntries(Object.keys(entry).sort().map(key=>[key,entry[key]])) : entry);
          if (stable(existingItem) !== stable(item)) {
            const importedCopy = (await getAllVocabulary()).find(v => stable({...v,id:item.id}) === stable(item));
            if (importedCopy) {ids.set(item.id,importedCopy.id);continue;}
            const originalId=item.id;item.id=crypto.randomUUID();ids.set(originalId,item.id);match=undefined;
          }
        }
        if (match) { ids.set(item.id, match); continue; }
        await db.vocabulary.add(item); words.set(item.normalizedHeadword, item.id); ids.set(item.id, item.id); count++;
      }
      for (const log of parsed.data?.reviewLogs || []) {
        if (!log.id || !log.vocabularyId || !log.timestamp) throw new Error('Invalid review log in backup.');
        if (ids.has(log.vocabularyId)) {
          const mapped = {...log, vocabularyId: ids.get(log.vocabularyId)};
          const existingLog = await db.reviewLogs.get(log.id);
          if (!existingLog) await db.reviewLogs.add(mapped);
          else if (mode === 'portable' && existingLog.vocabularyId !== mapped.vocabularyId && !(await db.reviewLogs.where('vocabularyId').equals(mapped.vocabularyId!).filter(l=>l.timestamp===log.timestamp && l.rating===log.rating && l.mode===log.mode).count())) await db.reviewLogs.add({...mapped,id:crypto.randomUUID()});
        }
      }
      for (const session of parsed.data?.dailySessions || []) {
        if (!session.date || !Array.isArray(session.completedVocabularyIds) || !Array.isArray(session.plannedVocabularyIds)) throw new Error('Invalid session in backup.');
        const existingSession=await db.dailySessions.get(session.date);
        const mapped={...session,completedVocabularyIds:session.completedVocabularyIds.map((id:string)=>ids.get(id)||id),plannedVocabularyIds:session.plannedVocabularyIds.map((id:string)=>ids.get(id)||id)};
        if (!existingSession) await db.dailySessions.add(mapped);
        else if(mode==='portable') await db.dailySessions.update(session.date,{completedVocabularyIds:[...new Set([...existingSession.completedVocabularyIds,...mapped.completedVocabularyIds])],plannedVocabularyIds:[...new Set([...existingSession.plannedVocabularyIds,...mapped.plannedVocabularyIds])]});
      }
      for (const reading of parsed.data?.readings || []) {
        if (typeof reading?.id !== 'string' || typeof reading.title !== 'string' || typeof reading.text !== 'string' || !reading.text.trim()) throw new Error('Invalid reading in backup.');
        const existingReading = await db.readings.get(reading.id);
        if (!existingReading) await db.readings.add(reading);
        else if (mode === 'portable' && JSON.stringify({...existingReading,id:''}) !== JSON.stringify({...reading,id:''})) {
          const importedCopy = await db.readings.filter(r=>r.text===reading.text && r.title===reading.title && r.author===reading.author).first();
          if (!importedCopy) await db.readings.add({...reading,id:crypto.randomUUID()});
        }
      }
      for (const cache of parsed.data?.contentCache || []) {
        if (typeof cache?.key !== 'string' || !cache.data || typeof cache.retrievedAt !== 'string') throw new Error('Invalid content cache in backup.');
        if (!(await db.contentCache.get(cache.key))) await db.contentCache.add(cache);
      }
      for(const progress of parsed.data?.grammarProgress || []) {
        if(!validGrammarProgress(progress))throw new Error('Invalid grammar progress in backup.');
        const previous=await db.grammarProgress.get(progress.lessonId);
        if(!previous)await db.grammarProgress.add(progress);
        else {
          const latest=mode==='portable' && progress.lastStudiedAt>previous.lastStudiedAt ? progress : previous;
          await db.grammarProgress.put({...previous,...latest,openedAt:previous.openedAt<progress.openedAt?previous.openedAt:progress.openedAt,lessonCompletedAt:previous.lessonCompletedAt || progress.lessonCompletedAt});
        }
      }
      for(const attempt of parsed.data?.grammarAttempts || []) {
        if(!validGrammarAttempt(attempt))throw new Error('Invalid grammar attempt in backup.');
        const previous=await db.grammarAttempts.get(attempt.id);
        if(!previous)await db.grammarAttempts.add(attempt);
        else if(previous.answer!==attempt.answer || previous.correct!==attempt.correct || previous.lessonId!==attempt.lessonId)throw new Error('Conflicting grammar attempt in backup; existing data was preserved.');
      }
      for(const name of ['discoveryEncounters','discoveryPreferences','recallAttempts'])if(parsed.data?.[name]!==undefined&&!Array.isArray(parsed.data[name]))throw new Error('Invalid discovery backup.');
      for(const encounter of parsed.data?.discoveryEncounters||[]){
        if(!validEncounter(encounter))throw new Error('Invalid discovery encounter in backup.');
        const previous=await db.discoveryEncounters.get(encounter.word);
        const incoming={...encounter,vocabularyId:encounter.vocabularyId?(ids.get(encounter.vocabularyId)||encounter.vocabularyId):undefined};
        if(!previous)await db.discoveryEncounters.add(incoming);
        else if(!previous.feedback&&incoming.feedback)await db.discoveryEncounters.put({...previous,feedback:incoming.feedback,feedbackAt:incoming.feedbackAt,vocabularyId:incoming.vocabularyId});
      }
      for(const preference of parsed.data?.discoveryPreferences||[]){
        if(!validDiscoveryPreferences(preference))throw new Error('Invalid discovery preferences in backup.');
        if(mode==='empty-profile'||!(await db.discoveryPreferences.get('discovery')))await db.discoveryPreferences.put(preference);
      }
      for(const attempt of parsed.data?.recallAttempts||[]){
        if(!validRecallAttempt(attempt))throw new Error('Invalid recall attempt in backup.');
        const mapped={...attempt,vocabularyId:ids.get(attempt.vocabularyId)||attempt.vocabularyId};
        const previous=await db.recallAttempts.get(attempt.id);
        if(!previous)await db.recallAttempts.add(mapped);
        else if(previous.vocabularyId!==mapped.vocabularyId||previous.correct!==mapped.correct)throw new Error('Conflicting recall attempt; existing data was preserved.');
      }
      if (parsed.data?.settings && (mode === 'empty-profile' || mode === 'portable' || !(await db.settings.get('user_settings')))) {
        if (parsed.data.settings.id !== 'user_settings') throw new Error('Invalid settings in backup.');
        await db.settings.put({...DEFAULT_SETTINGS, ...parsed.data.settings});
      }
    });
    return { count };
  } catch (err: any) {
    return { count: 0, error: err.message || 'Failed to parse JSON file.' };
  }
}
