import {useLiveQuery} from 'dexie-react-hooks';
import type {VocabularyItem} from '../../types/vocabulary';
import {db} from '../../services/db';
import {DictionaryContent} from './DictionaryContent';
import {USAGE_NOTES} from '../../data/lexicalPractice';
import {estimatedDifficulty} from '../../services/vocabularyIntelligence';

export function LexicalContent({item,showDictionary=true}:{item:VocabularyItem;showDictionary?:boolean}){
 const stored=useLiveQuery(()=>db.lexicon.get(item.word.toLowerCase()),[item.word]);
 const entry=item.lexicalData||stored,translated=entry?.senses.filter(s=>s.turkish.length)||[];
 const notes=USAGE_NOTES[item.word.toLowerCase()]||[];
 return <section key={item.word} className="space-y-4" aria-label="Lexical information">
  <details open><summary>Turkish meanings · by dictionary sense</summary>
   {item.turkishMeaning&&<div className="p-3"><p className="vocab-text">{item.turkishMeaning}</p><p>Existing personal/imported translation · {item.provenance.sourceName||item.provenance.sourceType}. Retained separately; not automatically verified.</p></div>}
   {translated.map(s=><div key={s.id} className="p-3 border-b border-[var(--color-outline)]"><p>{s.partOfSpeech} · {s.translationGloss?'Translation-table sense':'Dictionary sense'}</p><p className="vocab-text">{s.definition}</p><p className="vocab-text">{s.turkish.join(' · ')}</p>{s.translationSourceUrl&&<a className="underline" href={s.translationSourceUrl} target="_blank" rel="noreferrer">Translation source · Wiktionary contributors · CC BY-SA 4.0</a>}</div>)}
   {!translated.length&&<p>No sense-linked Turkish translation in the local source yet. No automatic or invented translation is shown.</p>}
   {!translated.length&&item.aiTranslations?.map((t,i)=><div key={i} className="p-3 border border-[var(--color-orange)]"><p>AI-generated translation · {t.model} · unverified</p><p>{t.partOfSpeech} · {t.sense}</p><p className="vocab-text">{t.turkish.join(' · ')}</p></div>)}
   {entry&&<p><a className="underline" href={entry.sourceUrl} target="_blank" rel="noreferrer">Wiktionary contributors</a> via <a className="underline" href={entry.downloadUrl} target="_blank" rel="noreferrer">Kaikki</a> · dictionary-sourced, community-maintained; not independently verified · CC BY-SA 4.0.</p>}
  </details>
  {showDictionary&&(item.dictionaryData||entry)&&<details open><summary>All dictionary meanings & sources</summary><div className="pt-3"><DictionaryContent showWord={false} data={item.dictionaryData||entry!.dictionary}/></div></details>}
  {!!entry?.relations.length&&<details open><summary>Word family & lexical relationships</summary><p>Source-listed derived terms may include compounds. Related terms are broader lexical relationships, not asserted direct derivations.</p><div className="max-h-64 overflow-auto"><ul className="space-y-2">{entry.relations.map(r=><li key={`${r.kind}:${r.word}`}><a className="underline vocab-related" href={`https://en.wiktionary.org/wiki/${encodeURIComponent(r.word)}#English`} target="_blank" rel="noreferrer">{r.word}</a> · {r.kind==='derived'?'source-listed derived term':'broader related term'}{r.sense&&` · ${r.sense}`}</li>)}</ul></div></details>}
  {!!entry?.semanticRelations?.length&&<details open><summary>Contextual synonyms & antonyms</summary><p>These source-listed words relate to the stated sense; they are not universally interchangeable.</p>{entry.semanticRelations.map((r,i)=><div className="p-3" key={i}><p>{r.partOfSpeech} · {r.sense}</p><p className="vocab-related">{r.kind}: {r.words.join(', ')}</p></div>)}</details>}
  {!!notes.length&&<details open><summary>Collocations & sentence patterns</summary>{notes.map(n=><div key={n.pattern} className="space-y-2 py-3"><p className="vocab-related">{n.pattern}</p><p className="vocab-example">{n.example}</p><p>{n.explanation}</p></div>)}<p>Original instructional notes · not dictionary quotations.</p></details>}
  {entry&&<p>Estimated study complexity: {estimatedDifficulty(entry)}/100 · heuristic, not a verified CEFR level.</p>}
 </section>;
}
