import { useState } from 'react';
import type { VocabularyItem, ExampleSentence } from '../../types/vocabulary';
import { attachDictionaryData } from '../../services/dictionaryService';
import { getTatoebaSentences, getTatoebaPage, saveTatoebaSentence } from '../../services/tatoebaService';
import { getWiktionaryData } from '../../services/discoveryService';
import { DictionaryContent } from './DictionaryContent';
import { SourceAttribution } from '../common/SourceAttribution';

export function ExternalWordContent({ item, onRefresh }: { item: VocabularyItem; onRefresh: () => void }) {
  const [sentences, setSentences] = useState<ExampleSentence[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [cursor,setCursor]=useState<string>();
  const [liveStarted,setLiveStarted]=useState(false);
  const [hasMore,setHasMore]=useState(true);
  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage('');
    try { await action(); } catch (e) { setMessage(e instanceof Error ? e.message : 'Unable to load content. Try again.'); }
    finally { setBusy(false); }
  }
  return <section className="space-y-4 border-t border-[var(--color-pink)] pt-4">
    <h3>External content · saved fields and progress stay intact</h3>
    <div className="flex flex-wrap gap-3">
      <button disabled={busy} className="retro-btn-teal p-2" onClick={() => void run(async () => { await attachDictionaryData(item.id, await getWiktionaryData(item.word)); onRefresh(); setMessage('Dictionary data attached. Your own definitions and notes are preserved.'); })}>Attach dictionary data</button>
      <button disabled={busy} className="retro-btn-cream p-2" onClick={() => void run(async () => { setSentences(await getTatoebaSentences(item.word)); setLoaded(true); })}>Find Tatoeba examples</button>
    </div>
    {busy && <p role="status">Loading source…</p>}
    {message && <p role="status">{message}</p>}
    {item.dictionaryData && <DictionaryContent data={item.dictionaryData} />}
    {loaded && !sentences.length && <p>No suitable licensed examples were found for this word.</p>}
    {loaded && <button disabled={busy || !hasMore} className="retro-btn-cream p-2" onClick={()=>void run(async()=>{const page=await getTatoebaPage(item.word,liveStarted?cursor:undefined);setSentences(previous=>{const seen=new Set(previous.map(e=>e.sentence.toLowerCase()));return [...previous,...page.sentences.filter(e=>!seen.has(e.sentence.toLowerCase()))];});setCursor(page.next);setLiveStarted(true);setHasMore(!!page.next);if(!page.sentences.length)setMessage(page.next?'No suitable examples on this page. You can try the next page.':'End of available examples. Try another word or source.');})}>{hasMore ? 'Get more Tatoeba examples' : 'End of available Tatoeba results'}</button>}
    {!!sentences.length && <p>Community examples. Review suitability before adding; source licenses are retained.</p>}
    {sentences.map(sentence => <div key={sentence.id} className="border border-[var(--color-pink)] p-3 space-y-2">
      <p className="vocab-example">{sentence.sentence}</p>
      
      <SourceAttribution credit={sentence.credit} />
      <button disabled={busy || item.examples.some(e => e.id === sentence.id || e.sentence.toLowerCase() === sentence.sentence.toLowerCase())} className="retro-btn-teal p-2 disabled:opacity-50" onClick={() => void run(async () => { await saveTatoebaSentence(item.id, sentence); onRefresh(); setMessage('Example saved. It is available to existing sentence-context exercises.'); })}>Add example to this word</button>
    </div>)}
  </section>;
}
