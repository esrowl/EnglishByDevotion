import { useMemo, useState } from 'react';
import { getReadingCollection } from '../../services/readingService';
import { DictionaryLookup } from '../library/DictionaryLookup';
import { SourceAttribution } from '../common/SourceAttribution';
import type { VocabularyItem } from '../../types/vocabulary';
import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../../services/db';
import {ReadingTools} from './ReadingTools';
import {ReadingVocabulary} from './ReadingVocabulary';
import {readingPages} from '../../services/readingImport';
import {ReadingExamples} from './ReadingExamples';

export function ReadingView({ onOpenDetail, onRefresh }: { onOpenDetail: (item: VocabularyItem) => void; onRefresh: () => void }) {
  const savedReadings=useLiveQuery(()=>db.readings.toArray(),[]) || [];
  const collection = [...getReadingCollection(),...savedReadings];
  const [selectedId, setSelectedId] = useState(collection[0]?.id);
  const [word, setWord] = useState('');
  const selected = collection.find(item => item.id === selectedId);
  const [readingPage,setReadingPage]=useState(0),[context,setContext]=useState('');
  const pages=useMemo(()=>readingPages(selected?.text||''),[selected?.text]);
  const currentPage=Math.min(readingPage,Math.max(0,pages.length-1));
  function chooseWord(word:string,context=''){setWord(word);setContext(context);}
  return <div className={`p-4 sm:p-8 space-y-6 max-w-5xl mx-auto ${word?'reading-has-inspector':''}`}>
    <h1 className="text-3xl">Reading Library</h1>
    <ReadingTools onSelect={id=>{setSelectedId(id);setReadingPage(0);setWord('');setContext('');}} />
    <div className="flex flex-wrap gap-3">{collection.map(item => <button key={item.id} className={`${selectedId === item.id ? 'retro-btn-teal' : 'retro-btn-cream'} p-3`} onClick={() => { setSelectedId(item.id); setReadingPage(0); setWord('');setContext(''); }}>{item.title}</button>)}</div>
    {selected ? <article className="retro-window-purple p-5 sm:p-8 text-[var(--color-cream)] space-y-4">
      <h2 className="text-2xl">{selected.title}</h2>
      <p>{selected.author} · {selected.difficulty}. Not an officially verified CEFR rating.</p>
      <p>Click an English word to look it up. You can also select a single word.</p>
      <div className="reading-passage" onMouseUp={() => { const selection = window.getSelection()?.toString().trim(); if (selection && /^[a-z]+(?:['’-][a-z]+)*$/i.test(selection)) chooseWord(selection.replaceAll('’', "'")); }}>
        {(pages[currentPage]||'').split('\n\n').map((paragraph, i) => <p key={i} className="vocab-text mb-5">
          {paragraph.split(/([A-Za-z]+(?:['’-][A-Za-z]+)*)/g).map((token, j) => /^[A-Za-z]/.test(token) ? <button key={j} className="reading-word" onClick={() => chooseWord(token.replaceAll('’', "'"))} aria-label={`Look up ${token}`}>{token}</button> : token)}
        </p>)}
      </div>
      {pages.length>1&&<nav aria-label="Reading pages" className="flex flex-wrap gap-3 items-center"><button className="retro-btn-cream p-2" disabled={!currentPage} onClick={()=>setReadingPage(currentPage-1)}>Previous page</button><span>Page {currentPage+1} / {pages.length}</span><button className="retro-btn-cream p-2" disabled={currentPage+1>=pages.length} onClick={()=>setReadingPage(currentPage+1)}>Next page</button></nav>}
      <ReadingVocabulary key={selected.id} text={selected.text} onSelect={chooseWord}/>
      <SourceAttribution credit={selected.credit} />
      {selected.origin && <p>Personal reading · {selected.rights}</p>}
      <div hidden={selected.credit?.source !== 'gutenberg'}>
      <p className="text-sm">This eBook is for the use of anyone anywhere in the United States and most other parts of the world at no cost and with almost no restrictions whatsoever. You may copy it, give it away or re-use it under the terms of the <a href="/licenses/GUTENBERG-LICENSE.txt" className="underline" target="_blank" rel="noreferrer">Project Gutenberg License</a> included with this eBook or online at <a href="https://www.gutenberg.org" className="underline" target="_blank" rel="noreferrer">www.gutenberg.org</a>. If you are not located in the United States, you will have to check the laws of the country where you are located before using this eBook.</p>
      <details><summary>Rights and source information</summary><p className="mt-3">{selected.rights}</p><p>Excerpt from the opening chapter. Line wrapping normalized; wording unchanged.</p><a className="underline" href="/licenses/GUTENBERG-LICENSE.txt" target="_blank" rel="noreferrer">Included Project Gutenberg license</a></details>
      </div>
    </article> : <p>The selected passage is unavailable. Choose another passage.</p>}
    {word?<aside id="reading-lookup" className="reading-word-inspector" aria-label="Selected word" key={word}><div className="reading-inspector-heading"><h3>{word}</h3><button className="retro-btn-cream px-3 py-2" aria-label="Close word inspector" onClick={()=>{setWord('');setContext('');}}>×</button></div><div className="reading-inspector-content space-y-3">{context&&<aside className="retro-window-dark p-4"><p>Context from your reading · not dictionary-verified</p><p className="vocab-example">{context}</p></aside>}<DictionaryLookup initialWord={word} enableLearningAction onWordSelected={chooseWord} onOpenDetail={onOpenDetail} onRefresh={onRefresh} /><ReadingExamples word={word}/></div></aside>:<DictionaryLookup onWordSelected={chooseWord} onOpenDetail={onOpenDetail} onRefresh={onRefresh}/>}

  </div>;
}
