import {useMemo,useState} from 'react';
import {readingWords} from '../../services/readingImport';
export function ReadingVocabulary({text,onSelect}:{text:string;onSelect:(word:string,context:string)=>void}){
  const words=useMemo(()=>readingWords(text),[text]);
  const [query,setQuery]=useState(''),[page,setPage]=useState(0);
  const filtered=words.filter(row=>row.word.includes(query.toLowerCase().trim())),pages=Math.max(1,Math.ceil(filtered.length/40)),current=Math.min(page,pages-1);
  return <details className="retro-window-dark p-4"><summary className="cursor-pointer">Words in this text · {words.length} unique</summary>
    <p>Choose a word for saved or Wiktionary meanings and available usage examples. Your text is context, not verified dictionary evidence. No automatic saving.</p>
    <input aria-label="Filter reading words" placeholder="Find a word…" className="p-2 border bg-[var(--color-black)] w-full" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}} />
    <div className="flex flex-wrap gap-2 my-4">{filtered.slice(current*40,(current+1)*40).map(row=><button key={row.word} className="retro-btn-cream p-2" onClick={()=>onSelect(row.word,row.context)}>{row.word} <span>×{row.count}</span></button>)}</div>
    {!filtered.length&&<p>No matching words.</p>}
    <div className="flex gap-3 items-center"><button className="retro-btn-cream p-2" disabled={!current} onClick={()=>setPage(current-1)}>Previous words</button><span>{current+1} / {pages}</span><button className="retro-btn-cream p-2" disabled={current+1>=pages} onClick={()=>setPage(current+1)}>More words</button></div>
  </details>;
}
