import type {LexicalEntry,LexicalSense} from '../types/lexical';

const strings=(v:unknown):string[]=>Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'):[];
const records=(v:unknown):Record<string,any>[]=>Array.isArray(v)?v.filter(x=>x&&typeof x==='object'):[];
const excluded=new Set(['obsolete','archaic','rare','offensive','vulgar','slur','derogatory']);
// Never merge a top-level translation into an arbitrary numbered definition.
// Its original translation-table gloss is retained as a separate sense.
export function normalizeKaikki(rows:Record<string,any>[],downloadUrl:string,retrievedAt=new Date().toISOString(),edition:'en'|'simple'='en'):LexicalEntry {
  const word=rows[0]?.word;
  if(typeof word!=='string'||!word.trim()||rows.some(r=>r.word!==word||r.lang_code!=='en'))throw new Error('Expected one English headword per lexical entry.');
  const senses:LexicalSense[]=[],relations:LexicalEntry['relations']=[],meanings:LexicalEntry['dictionary']['meanings']=[],semanticRelations:NonNullable<LexicalEntry['semanticRelations']>=[];
  for(const [rowIndex,row] of rows.entries()){
    const pos=({adj:'adjective',adv:'adverb'} as Record<string,string>)[row.pos]|| (typeof row.pos==='string'?row.pos:'other');
    for(const [field,kind] of [['synonyms','synonym'],['antonyms','antonym']] as const){
      const groups=new Map<string,string[]>();for(const r of records(row[field]))if(typeof r.word==='string'&&typeof r.sense==='string'&&r.sense.trim()){const words=groups.get(r.sense)||[];if(!words.includes(r.word))words.push(r.word);groups.set(r.sense,words);}
      for(const [sense,words] of groups)semanticRelations.push({kind,sense,words,partOfSpeech:pos});
    }
    const good=records(row.senses).filter(s=>!strings(s.tags).some(t=>excluded.has(t))&&!s.form_of&&!s.alt_of&&strings(s.glosses).length);
    for(const [i,s] of good.entries()){
      senses.push({id:`${word}:${rowIndex}:${i}`,partOfSpeech:pos,definition:strings(s.glosses).join(' '),turkish:records(s.translations).filter(t=>t.lang_code==='tr'&&typeof t.word==='string').map(t=>t.word),tags:strings(s.tags),synonyms:records(s.synonyms).map(t=>t.word).filter(x=>typeof x==='string'),antonyms:records(s.antonyms).map(t=>t.word).filter(x=>typeof x==='string')});
    }
    const translations=new Map<string,string[]>();
    for(const t of records(row.translations))if(t.lang_code==='tr'&&typeof t.word==='string'&&typeof t.sense==='string'&&t.sense.trim()){
      const values=translations.get(t.sense)||[];if(!values.includes(t.word))values.push(t.word);translations.set(t.sense,values);
    }
    for(const [gloss,turkish] of translations){
      const exact=senses.find(s=>s.partOfSpeech===pos&&s.definition.toLowerCase()===gloss.toLowerCase());
      if(exact)exact.turkish=[...new Set([...exact.turkish,...turkish])];
      else senses.push({id:`${word}:${rowIndex}:tr:${gloss}`,partOfSpeech:pos,definition:gloss,translationGloss:gloss,turkish,tags:[],synonyms:[],antonyms:[]});
    }
    if(good.length)meanings.push({partOfSpeech:pos,definitions:good.map(s=>({definition:strings(s.glosses).join(' '),synonyms:records(s.synonyms).map(t=>t.word).filter(x=>typeof x==='string'),antonyms:records(s.antonyms).map(t=>t.word).filter(x=>typeof x==='string')})),synonyms:[],antonyms:[]});
    for(const kind of ['derived','related'] as const)for(const r of records(row[kind]))if(typeof r.word==='string'&&r.word!==word&&/^[a-z]+(?:[ '-][a-z]+)*$/i.test(r.word))relations.push({word:r.word,kind,sense:typeof r.sense==='string'?r.sense:undefined});
  }
  if(!meanings.length)throw new Error('No suitable English dictionary senses.');
  const sourceUrl=`https://${edition}.wiktionary.org/wiki/${encodeURIComponent(word)}${edition==='en'?'#English':''}`;
  const phonetics=rows.flatMap(row=>records(row.sounds)).filter(s=>typeof s.ipa==='string').map(s=>({text:s.ipa as string}));
  return {word:word.toLowerCase(),version:'kaikki-1',senses,semanticRelations,relations:[...new Map(relations.map(r=>[`${r.kind}:${r.word}`,r])).values()],sourceUrl,downloadUrl,retrievedAt,verification:'dictionary_sourced',license:'CC BY-SA 4.0',dictionary:{word:word.toLowerCase(),source:'wiktionary',meanings,phonetics:[...new Map(phonetics.map(p=>[p.text,p])).values()],retrievedAt,credits:[{source:'wiktionary',url:sourceUrl,author:'Wiktionary contributors; extracted by Kaikki/Wiktextract',license:'CC BY-SA 4.0 · adapted: filtered senses, Turkish translation tables and lexical links',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'}]}};
}

export function validLexicalEntry(value:unknown):value is LexicalEntry {
  const v=value as LexicalEntry;
  if(v?.senses&&(!Array.isArray(v.senses)||new Set(v.senses.map(s=>s?.id)).size!==v.senses.length||v.senses.some(s=>s.translationSourceUrl&&!/^https:\/\/(en|simple)\.wiktionary\.org\/wiki\//.test(s.translationSourceUrl)||s.translationDownloadUrl&&!s.translationDownloadUrl.startsWith('https://kaikki.org/'))))return false;
  if(v?.semanticRelations&&(!Array.isArray(v.semanticRelations)||!v.semanticRelations.every(s=>['synonym','antonym'].includes(s.kind)&&typeof s.sense==='string'&&typeof s.partOfSpeech==='string'&&Array.isArray(s.words)&&s.words.every(w=>typeof w==='string'))))return false;
  if(!v?.dictionary||!Array.isArray(v.dictionary.credits)||!v.dictionary.credits.length||!Array.isArray(v.dictionary.phonetics)||!Array.isArray(v.dictionary.meanings)||!v.dictionary.meanings.every(m=>typeof m.partOfSpeech==='string'&&Array.isArray(m.synonyms)&&Array.isArray(m.antonyms)&&Array.isArray(m.definitions)&&m.definitions.length>0&&m.definitions.every(d=>typeof d.definition==='string'&&d.definition.trim()&&Array.isArray(d.synonyms)&&Array.isArray(d.antonyms))))return false;
  return !!v&&typeof v.word==='string'&&/^[a-z]+(?:[ '-][a-z]+)*$/.test(v.word)&&v.verification==='dictionary_sourced'&&v.license==='CC BY-SA 4.0'&&typeof v.sourceUrl==='string'&&/^https:\/\/(en|simple)\.wiktionary\.org\/wiki\//.test(v.sourceUrl)&&typeof v.downloadUrl==='string'&&v.downloadUrl.startsWith('https://kaikki.org/')&&Array.isArray(v.senses)&&v.senses.every(s=>typeof s.id==='string'&&typeof s.definition==='string'&&typeof s.partOfSpeech==='string'&&Array.isArray(s.turkish)&&s.turkish.every(t=>typeof t==='string')&&Array.isArray(s.tags)&&Array.isArray(s.synonyms)&&Array.isArray(s.antonyms))&&Array.isArray(v.relations)&&v.relations.every(r=>typeof r.word==='string'&&['derived','related'].includes(r.kind))&&!!v.dictionary&&Array.isArray(v.dictionary.meanings)&&v.dictionary.meanings.length>0;
}
