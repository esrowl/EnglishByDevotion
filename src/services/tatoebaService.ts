import { db } from './db';
import { array, object, text, validLookup, requestJSON, safeUrl } from './contentHttp';
import type { SourceCredit, SentencePage } from '../types/contentSources';
import { getVocabularyById } from './db';
import type { ExampleSentence } from '../types/vocabulary';
import curated from '../data/tatoebaCurated.json';

function credit(record: Record<string, unknown>): SourceCredit | undefined {
  const license = text(record.license);
  if (!Number.isInteger(record.id) || !['CC BY 2.0 FR', 'CC0 1.0'].includes(license)) return undefined;
  return { source: 'tatoeba', id: String(record.id), url: `https://tatoeba.org/en/sentences/show/${record.id}`,
    author: text(record.owner) || 'Tatoeba contributors', license,
    licenseUrl: license === 'CC0 1.0' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : 'https://creativecommons.org/licenses/by/2.0/fr/',
  };
}

export function normalizeTatoebaResponse(raw: unknown, word: string): ExampleSentence[] {
  if (!Array.isArray(object(raw).data)) throw new Error('Tatoeba returned invalid sentence data.');
  const seen = new Set<string>();
  const target = word.toLowerCase();
  return array(object(raw).data).flatMap(value => {
    const record = object(value);
    const sentence = text(record.text);
    const source = credit(record);
    const words = sentence.toLowerCase().match(/[a-z]+(?:['-][a-z]+)*/g) || [];
    if (!source || record.lang !== 'eng' || record.is_unapproved === true || !sentence || sentence.length > 220 || !words.join(' ').includes(target) || seen.has(sentence.toLowerCase())) return [];
    // Match complete tokens/phrases rather than unrelated words containing the headword.
    if (!(` ${words.join(' ')} `).includes(` ${target} `)) return [];
    seen.add(sentence.toLowerCase());
    const translation = array(record.translations).map(object).find(t => t.lang === 'tur' && t.is_direct === true && t.is_unapproved !== true && text(t.text) && credit(t));
    return [{ id: `tatoeba-${record.id}`, sentence, highlightedTarget: word, credit: source,
      translation: translation ? text(translation.text) : undefined,
      translationCredit: translation ? credit(translation) : undefined,
    }];
  });
}

const pending = new Map<string, Promise<ExampleSentence[]>>();
export async function getTatoebaSentences(input: string): Promise<ExampleSentence[]> {
  const word = validLookup(input), key = `tatoeba:${word}`;
  const cached = await db.contentCache.get(key);
  if (cached && Array.isArray(cached.data)) return cached.data as ExampleSentence[];
  const local = normalizeTatoebaResponse(curated, word);
  if (local.length) return local;
  if (pending.has(word)) return pending.get(word)!;
  const task = (async () => {
    const params = new URLSearchParams({ lang: 'eng', q: `"${word}"`, sort: 'words', is_unapproved: 'no', is_orphan: 'no', word_count: '3-20', limit: '20', 'showtrans:lang': 'tur', 'showtrans:is_direct': 'yes', 'showtrans:is_unapproved': 'no' });
    const data = normalizeTatoebaResponse(await requestJSON(`https://api.tatoeba.org/v1/sentences?${params}`), word);
    await db.contentCache.put({ key, data, retrievedAt: new Date().toISOString() });
    return data;
  })();
  pending.set(word, task);
  try { return await task; } finally { pending.delete(word); }
}

export async function saveTatoebaSentence(id: string, sentence: ExampleSentence): Promise<void> {
  await db.transaction('rw', db.vocabulary, async () => {
    const item = await getVocabularyById(id);
    if (!item) throw new Error('Save the vocabulary word before adding examples.');
    if (item.examples.some(e => e.id === sentence.id || e.sentence.toLowerCase() === sentence.sentence.toLowerCase())) return;
    await db.vocabulary.update(id, { examples: [...item.examples, sentence] });
  });
}

/** Official cursor pagination; never follow arbitrary external URLs. */
export async function getTatoebaPage(input:string, next?:string):Promise<SentencePage> {
  const word=validLookup(input);
  const params=new URLSearchParams({lang:'eng',q:`"${word}"`,sort:'words',is_unapproved:'no',is_orphan:'no',word_count:'3-20',limit:'20','showtrans:lang':'tur','showtrans:is_direct':'yes','showtrans:is_unapproved':'no'});
  const url=next || `https://api.tatoeba.org/v1/sentences?${params}`;
  const checked=safeUrl(url);
  if(!checked || new URL(checked).origin!=='https://api.tatoeba.org' || new URL(checked).pathname!=='/v1/sentences')throw new Error('Invalid Tatoeba pagination URL.');
  const key=`tatoeba-page:${word}:${url}`,cache=await db.contentCache.get(key);
  if(cache && !Array.isArray(cache.data) && 'sentences' in cache.data)return cache.data;
  const raw=await requestJSON(url),paging=object(object(raw).paging),nextUrl=safeUrl(paging.next);
  const data={sentences:normalizeTatoebaResponse(raw,word),next:paging.has_next===true && nextUrl && new URL(nextUrl).origin==='https://api.tatoeba.org' && new URL(nextUrl).pathname==='/v1/sentences' ? nextUrl : undefined};
  await db.contentCache.put({key,data,retrievedAt:new Date().toISOString()});return data;
}
