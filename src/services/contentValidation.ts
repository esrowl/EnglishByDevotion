import type { DictionaryData } from '../types/contentSources';

/** Imported backups and old cache entries are untrusted, just like network responses. */
export function isDictionaryData(value: unknown): value is DictionaryData {
  const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
  const stringList = (v: unknown) => Array.isArray(v) && v.every(item => typeof item === 'string');
  const credit = (v: unknown) => record(v) && typeof v.source === 'string' && typeof v.url === 'string' && [v.author,v.license,v.licenseUrl].every(item=>item === undefined || typeof item === 'string');
  if (!record(value) || typeof value.word !== 'string' || !value.word.trim() || typeof value.retrievedAt !== 'string') return false;
  if (!Array.isArray(value.credits) || !value.credits.every(credit)) return false;
  if (!Array.isArray(value.phonetics) || !value.phonetics.every(p=>record(p) && [p.text,p.audio].every(v=>v === undefined || typeof v === 'string') && (p.credit === undefined || credit(p.credit)))) return false;
  return Array.isArray(value.meanings) && value.meanings.length > 0 && value.meanings.every(m=>record(m) && typeof m.partOfSpeech === 'string' && stringList(m.synonyms) && stringList(m.antonyms) && Array.isArray(m.definitions) && m.definitions.length > 0 && m.definitions.every(d=>record(d) && typeof d.definition === 'string' && !!d.definition.trim() && (d.example === undefined || typeof d.example === 'string') && stringList(d.synonyms) && stringList(d.antonyms)));
}
