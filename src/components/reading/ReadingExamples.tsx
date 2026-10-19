import {useState} from 'react';
import {getTatoebaPage} from '../../services/tatoebaService';
import {SourceAttribution} from '../common/SourceAttribution';
import type {SentencePage} from '../../types/contentSources';
export function ReadingExamples({word}:{word:string}){
  const [page,setPage]=useState<SentencePage>({sentences:[]}),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  async function load(next?:string){setBusy(true);setMessage('');try{const result=await getTatoebaPage(word,next);setPage(result);if(!result.sentences.length)setMessage('No suitable English examples available for this word.');}catch(error){setMessage(error instanceof Error?error.message:'Examples unavailable. Dictionary meanings remain accessible.');}finally{setBusy(false);}}
  return <section className="retro-window-dark p-4 space-y-3"><p>Usage examples for <strong>{word}</strong></p><button className="retro-btn-cream p-3" disabled={busy} onClick={()=>void load(page.next)}>{busy?'Loading examples…':page.next?'More usage examples':'Find usage examples · Tatoeba'}</button>
    {page.sentences.map(sentence=><div key={sentence.id}><p className="vocab-example">{sentence.sentence}</p><SourceAttribution credit={sentence.credit}/></div>)}
    {message&&<p role="status">{message}</p>}
  </section>;
}
