import { useEffect, useRef, useState } from 'react';
import type { DictionaryData } from '../../types/contentSources';
import type { VocabularyItem } from '../../types/vocabulary';
import { lookupDictionary, saveDictionaryWord, addSavedWordToLearning } from '../../services/dictionaryService';
import { DictionaryContent } from './DictionaryContent';
import {LexicalContent} from './LexicalContent';

export function DictionaryLookup({ initialWord = '', onOpenDetail, onRefresh, onWordSelected, enableLearningAction = false }: {
  initialWord?: string; onOpenDetail: (item: VocabularyItem) => void; onRefresh: () => void; onWordSelected?: (word:string)=>void; enableLearningAction?:boolean;
}) {
  const [word, setWord] = useState(initialWord);
  const [data, setData] = useState<DictionaryData>();
  const [saved, setSaved] = useState<VocabularyItem>();
  const [error, setError] = useState('');
  const [message,setMessage]=useState('');
  const [busy, setBusy] = useState(!!initialWord);
  const sequence = useRef(0);
  async function search(query: string) {
    const token = ++sequence.current;
    setBusy(true); setError(''); setMessage(''); setData(undefined); setSaved(undefined);
    await load(query, token);
  }
  async function load(query: string, token: number) {
    try {
      const result = await lookupDictionary(query);
      if (sequence.current !== token) return;
      setSaved(result.saved); setData(result.dictionary);
    } catch (e) { if (sequence.current === token) setError(e instanceof Error ? e.message : 'Lookup failed. Please try again.'); }
    finally { if (sequence.current === token) setBusy(false); }
  }
  useEffect(() => {
    const token=++sequence.current;
    if (initialWord) {
      void lookupDictionary(initialWord).then(result=>{if(sequence.current===token){setSaved(result.saved);setData(result.dictionary);}}).catch(error=>{if(sequence.current===token)setError(error instanceof Error?error.message:'Lookup failed.');}).finally(()=>{if(sequence.current===token)setBusy(false);});
    }
    const currentSequence = sequence;
    return () => { currentSequence.current++; };
  }, [initialWord]);
  async function save() {
    if (!data) return;
    setBusy(true); setError('');
    try { const item = await saveDictionaryWord(data); setSaved(item); setData(undefined); onRefresh(); }
    catch { setError('Unable to save locally. Check browser storage permissions and try again.'); }
    finally { setBusy(false); }
  }
  async function learn() {
    if(busy||(!saved&&!data))return;
    setBusy(true);setError('');setMessage('');
    try {
      const item=saved?await addSavedWordToLearning(saved.id):await saveDictionaryWord(data!,true);
      setSaved(item);setData(undefined);onRefresh();setMessage('Added to your learning list. Review history and notes are preserved.');
    }catch(error){setError(error instanceof Error?error.message:'Unable to add this word to learning.');}
    finally{setBusy(false);}
  }
  return <section className="retro-window-dark p-4 space-y-4 min-w-0">
    <form onSubmit={e => { e.preventDefault(); if(onWordSelected&&word!==initialWord){onWordSelected(word);return;}void search(word); }} className="flex flex-wrap gap-3 items-end">
      <label className="flex-1 min-w-0">Dictionary lookup
        <input value={word} onChange={e => setWord(e.target.value)} className="vocab-text block w-full bg-[var(--color-black)] border border-[var(--color-pink)] p-2 mt-1" placeholder="English word" aria-label="Dictionary word" />
      </label>
      <button disabled={busy || !word.trim()} className="retro-btn-teal px-3 py-2 disabled:opacity-50">{busy ? 'Please wait…' : 'Look up'}</button>
    </form>
    {!enableLearningAction&&<p>Saved library first · Wiktionary definitions. Lookups do not save words or mark them learned.</p>}
    {error && <p role="alert" className="text-[var(--color-cream)]">{error}</p>}
    {enableLearningAction&&(data||saved)&&<div className="reading-learning-action"><button className="retro-btn-teal px-4 py-3" disabled={busy||!!saved&&saved.learningStatus!=='new'} onClick={()=>void learn()}>{saved&&saved.learningStatus!=='new'?'In learning list':'Add to Learn'}</button>{message&&<p role="status">{message}</p>}</div>}
    {saved && <div className="space-y-2"><h3 className="vocab-word">{saved.word}</h3><p className="vocab-text">{saved.englishDefinition}</p><button className="retro-btn-teal p-2" onClick={() => onOpenDetail(saved)}>Open saved entry</button><p>Already in your library. Your notes and progress are preserved.</p>{saved.examples.map((example,i)=><p key={example.id||i} className="vocab-example">{example.sentence}</p>)}</div>}
    {data && <><DictionaryContent data={data} /><button className="retro-btn-teal p-2" disabled={busy} onClick={() => void save()}>Save to vocabulary library</button></>}
    {saved&&<LexicalContent item={saved} showDictionary={false}/>}
  </section>;
}
