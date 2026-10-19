import {useRef,useState} from 'react';
import {db} from '../../services/db';
import {discoverOpenLibrary} from '../../services/discoveryService';
import {checkReadingText,readPersonalFile} from '../../services/readingImport';
import type {BookPage} from '../../types/contentSources';
export function ReadingTools({onSelect}:{onSelect:(id:string)=>void}){
 const [title,setTitle]=useState(''),[author,setAuthor]=useState('Esra'),[passage,setPassage]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[rights,setRights]=useState(false),[fileName,setFileName]=useState('');
 const [query,setQuery]=useState(''),[catalog,setCatalog]=useState<BookPage>({books:[]});
 const input=useRef<HTMLInputElement>(null);
 async function upload(file?:File){if(!file)return;setBusy(true);setMessage('Reading file…');try{const text=await readPersonalFile(file,setMessage);setPassage(text);setFileName(file.name);setTitle(file.name.replace(/\.[^.]+$/,''));setMessage('File read locally. Review the text, confirm permission, then save.');}catch(error){setMessage(error instanceof Error?error.message:'Unable to import file.');}finally{setBusy(false);if(input.current)input.current.value='';}}
 async function save(){if(!rights||busy)return;setBusy(true);setMessage('');try{const text=checkReadingText(passage);if(!title.trim())throw new Error('Please enter a title.');const id=crypto.randomUUID();await db.transaction('rw',db.readings,async()=>{if(await db.readings.filter(r=>r.text===text).count())throw new Error('This passage is already saved.');await db.readings.add({id,title:title.trim(),author:author.trim()||'User provided',text,difficulty:'User-provided · difficulty not assessed',rights:'User confirmed ownership or reuse permission.',origin:fileName?'imported_file':'user_created',dateAdded:new Date().toISOString()});});onSelect(id);setPassage('');setTitle('');setFileName('');setRights(false);setMessage('Saved locally. Included in Save all and full exports.');}catch(error){setMessage(error instanceof Error?error.message:'Unable to save.');}finally{setBusy(false);}}
 async function findBooks(next?:string){setBusy(true);setMessage('');try{const result=await discoverOpenLibrary(query,next);setCatalog(previous=>({books:next?[...previous.books,...result.books.filter(b=>!previous.books.some(old=>old.id===b.id))]:result.books,next:result.next}));if(!result.books.length)setMessage('No books found.');}catch(error){setMessage(error instanceof Error?error.message:'Catalog unavailable.');}finally{setBusy(false);}}
 return <section className="space-y-4">
  <details className="retro-window-dark p-4"><summary className="cursor-pointer">＋ Upload or paste your writing</summary>
   <form className="space-y-3 mt-4" onSubmit={e=>{e.preventDefault();void save();}}>
    <label className="block">Upload file · TXT, MD, PDF, HTML, CSV<input ref={input} aria-label="Upload reading file" type="file" accept=".txt,.text,.md,.markdown,.pdf,.html,.htm,.csv" disabled={busy} onChange={e=>void upload(e.target.files?.[0])} className="block w-full mt-2" /></label>
    <p>Files stay local. Text-based PDFs only; scanned pages need OCR. Maximum 20 MB / 500 PDF pages.</p>
    <label className="block">Title<input aria-label="Reading title" required disabled={busy} value={title} onChange={e=>setTitle(e.target.value)} className="block w-full p-2 bg-[var(--color-black)] border" /></label>
    <label className="block">Author<input aria-label="Reading author" disabled={busy} value={author} onChange={e=>setAuthor(e.target.value)} className="block w-full p-2 bg-[var(--color-black)] border" /></label>
    <label className="block">English passage<textarea aria-label="Reading text" required disabled={busy} rows={6} value={passage} onChange={e=>setPassage(e.target.value)} className="vocab-text block w-full p-2 bg-[var(--color-black)] border" /></label>
    <label className="block"><input type="checkbox" disabled={busy} checked={rights} onChange={e=>setRights(e.target.checked)} /> I own this text or have permission to reuse it.</label>
    <button disabled={!rights||busy} className="retro-btn-teal p-2">Save reading passage</button>
   </form>
  </details>
  <details className="retro-window-dark p-4"><summary>Find books · Open Library</summary>
   <p>Metadata only. Check the original book’s rights before reuse.</p>
   <form className="flex flex-wrap gap-3" onSubmit={e=>{e.preventDefault();void findBooks();}}><input aria-label="Book catalog search" placeholder="Title or author" value={query} onChange={e=>setQuery(e.target.value)} className="p-2 border bg-[var(--color-black)]" /><button disabled={busy} className="retro-btn-teal p-2">Find books</button></form>
   <ul>{catalog.books.map(book=><li key={book.id}><a className="underline" href={book.url} target="_blank" rel="noreferrer">{book.title}</a> · {book.authors}</li>)}</ul>
   {catalog.next&&<button disabled={busy} onClick={()=>void findBooks(catalog.next)} className="retro-btn-cream p-2">More books</button>}
  </details>
  {message&&<p role="status">{message}</p>}
 </section>;
}
