import type { DictionaryData } from '../../types/contentSources';
import { SourceAttribution } from '../common/SourceAttribution';
import { isDictionaryData } from '../../services/contentValidation';

export function DictionaryContent({ data, showWord = true }: { data: DictionaryData; showWord?:boolean }) {
  if (!isDictionaryData(data)) return <p role="alert">Saved external dictionary data is invalid. Your word and notes are preserved; look up the word again to refresh external information.</p>;
  return <section className="space-y-4">
    <h3 className="text-xl">{data.source === 'wiktionary' ? 'Wiktionary · community dictionary' : 'Free Dictionary API'} · external dictionary data</h3>
    {showWord&&<h2 className="vocab-word">{data.word}</h2>}
    <div className="flex flex-wrap gap-4">
      {data.phonetics.map((p, i) => <div key={i} className="min-w-0 max-w-full">
        {p.text && <p className="vocab-text">{p.text}</p>}
        {p.audio && <audio controls preload="none" src={p.audio} className="max-w-full" aria-label={`${data.word} pronunciation`} />}
        <SourceAttribution credit={p.credit} />
      </div>)}
    </div>
    {!data.phonetics.some(p => p.audio) && <p>No recorded pronunciation audio provided.</p>}
    {data.meanings.map((m, i) => <div key={i} className="space-y-2 border-t border-current/20 pt-3">
      <h4>{m.partOfSpeech}</h4>
      <ol className="list-decimal pl-6 space-y-3">
        {m.definitions.map((d, j) => <li key={j}>
          <p className="vocab-text">{d.definition}</p>
          {d.example && <p className="vocab-example mt-2">“{d.example}”</p>}
          {!!d.synonyms.length && <p className="vocab-related">Synonyms: {d.synonyms.join(', ')}</p>}
          {!!d.antonyms.length && <p className="vocab-related">Antonyms: {d.antonyms.join(', ')}</p>}
        </li>)}
      </ol>
      {!!m.synonyms.length && <p className="vocab-related">Synonyms: {m.synonyms.join(', ')}</p>}
      {!!m.antonyms.length && <p className="vocab-related">Antonyms: {m.antonyms.join(', ')}</p>}
    </div>)}
    
    {data.credits.map((credit, i) => <SourceAttribution key={i} credit={credit} />)}
  </section>;
}
