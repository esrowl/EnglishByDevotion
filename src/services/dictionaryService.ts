import { db } from './db';
import { createInitialSRSState } from './srs';
import { validLookup, normalizeWord } from './contentHttp';
import { normalizeVocabulary } from './vocabularyValidation';
import { getWiktionaryData } from './discoveryService';
import { isDictionaryData } from './contentValidation';
import type { DictionaryData } from '../types/contentSources';
import type { VocabularyItem, PartOfSpeech } from '../types/vocabulary';

// Saved entries always win. Removed providers are never contacted, including for old preferences.
export async function lookupDictionary(input: string): Promise<{ saved?: VocabularyItem; dictionary?: DictionaryData }> {
  const word = validLookup(input);
  const saved = await db.vocabulary.filter(v => normalizeWord(v.normalizedHeadword || v.word) === word).first();
  if (saved) return { saved: normalizeVocabulary(saved) };
  return { dictionary: await getWiktionaryData(word) };
}

export function dictionaryToVocabulary(data: DictionaryData): VocabularyItem {
  if (!isDictionaryData(data)) throw new Error('Invalid dictionary data. Your existing vocabulary was preserved.');
  const allowed: PartOfSpeech[] = ['noun','verb','adjective','adverb','idiom','phrasal_verb','expression','conjunction','preposition','other'];
  const first = data.meanings[0];
  const allSynonyms = data.meanings.flatMap(m => [...m.synonyms, ...m.definitions.flatMap(d => d.synonyms)]);
  const allAntonyms = data.meanings.flatMap(m => [...m.antonyms, ...m.definitions.flatMap(d => d.antonyms)]);
  return {
    id: crypto.randomUUID(), word: data.word, normalizedHeadword: normalizeWord(data.word),
    partOfSpeech: allowed.includes(first.partOfSpeech as PartOfSpeech) ? first.partOfSpeech as PartOfSpeech : 'other',
    cefrLevel: 'Unspecified', ipa: data.phonetics.find(p => p.text)?.text,
    englishDefinition: first.definitions[0].definition, turkishMeaning: '',
    examples: [...new Set(data.meanings.flatMap(m => m.definitions.flatMap(d => d.example ? [d.example] : [])))].map((sentence, i) => ({ id: `dictionary-${i}-${crypto.randomUUID()}`, sentence, credit: data.credits[0] })),
    synonyms: [...new Set(allSynonyms)].map(word => ({ word })), antonyms: [...new Set(allAntonyms)].map(word => ({ word })),
    collocations: [], topicCategories: [], provenance: { sourceType: 'dictionary_verified', sourceName: data.source === 'wiktionary' ? 'Wiktionary' : 'Free Dictionary API', sourceUrl: data.credits[0]?.url || 'https://dictionaryapi.dev/', attribution: data.source === 'wiktionary' ? 'Wiktionary contributors · CC BY-SA 4.0' : 'Free Dictionary API / linked dictionary contributors', isVerified: true },
    isFavorite: false, isDifficult: false, learningStatus: 'new', dateAdded: new Date().toISOString(), srs: createInitialSRSState(), dictionaryData: data,
  };
}

export async function saveDictionaryWord(data: DictionaryData, forLearning = false): Promise<VocabularyItem> {
  const lexicalData=await db.lexicon.get(normalizeWord(data.word));
  return db.transaction('rw', db.vocabulary, async () => {
    const word = normalizeWord(data.word);
    const existing = await db.vocabulary.filter(v => normalizeWord(v.normalizedHeadword || v.word) === word).first();
    if (existing) {
      if(forLearning && existing.learningStatus==='new') {
        await db.vocabulary.update(existing.id,{learningStatus:'learning'});
        return normalizeVocabulary({...existing,learningStatus:'learning'});
      }
      return normalizeVocabulary(existing);
    }
    const item = dictionaryToVocabulary(data);
    if(lexicalData)item.lexicalData=lexicalData;
    if(forLearning)item.learningStatus='learning';
    await db.vocabulary.add(item);
    return item;
  });
}

export async function addSavedWordToLearning(id:string):Promise<VocabularyItem> {
  return db.transaction('rw',db.vocabulary,async()=>{
    const item=await db.vocabulary.get(id);
    if(!item)throw new Error('This word is no longer saved. Look it up again.');
    if(item.learningStatus==='new') {
      await db.vocabulary.update(id,{learningStatus:'learning'});
      return normalizeVocabulary({...item,learningStatus:'learning'});
    }
    // Never downgrade review/mastery, reset a schedule, or replace personal fields.
    return normalizeVocabulary(item);
  });
}

// An explicit enrichment stores external data separately, without replacing authored fields.
export async function attachDictionaryData(id: string, data: DictionaryData): Promise<void> {
  await db.vocabulary.update(id, { dictionaryData: data });
}
