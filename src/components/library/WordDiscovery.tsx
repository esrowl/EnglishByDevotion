import {useState} from 'react';
import {discoverWords} from '../../services/discoveryService';
import type {WordSuggestion} from '../../types/contentSources';
import {DictionaryLookup} from './DictionaryLookup';
import type {VocabularyItem} from '../../types/vocabulary';

export function WordDiscovery(props:{onOpenDetail:(item:VocabularyItem)=>void;onRefresh:()=>void}) {
  const [topic,setTopic]=useState('winter'),[words,setWords]=useState<WordSuggestion[]>([]),[visible,setVisible]=useState(30),[selected,setSelected]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  return <details className="retro-window-dark p-4 space-y-3"><summary className="cursor-pointer">Discover more words · Datamuse</summary>
    <p>No daily word quota. Suggestions are not definitions; look up and save only the words you want.</p>
    <form className="flex flex-wrap gap-3" onSubmit={event=>{event.preventDefault();setBusy(true);setMessage('');void discoverWords(topic).then(data=>{setWords(data);setVisible(30);setMessage(data.length?`${data.length} available suggestions.`:'No suggestions. Try another topic.');}).catch(error=>setMessage(error.message)).finally(()=>setBusy(false));}}><label>Topic<input aria-label="Discovery topic" className="vocab-text block bg-[var(--color-black)] border p-2" value={topic} onChange={e=>setTopic(e.target.value)} /></label><button disabled={busy} className="retro-btn-teal p-2">{busy?'Loading…':'Discover words'}</button></form>
    <p role="status">{message}</p><div className="flex flex-wrap gap-2">{words.slice(0,visible).map(item=><button className="vocab-related border border-[var(--color-pink)] p-2" key={item.word} onClick={()=>setSelected(item.word)}>{item.word}</button>)}</div>
    {words.length>visible && <button className="retro-btn-cream p-2" onClick={()=>setVisible(count=>count+30)}>More suggestions</button>}
    <p>Datamuse · related-word suggestions. New queries require a key from February 2027; no paid/key service is configured. Change topics for fresh results.</p>
    {selected && <DictionaryLookup key={selected} initialWord={selected} {...props} />}
  </details>;
}
