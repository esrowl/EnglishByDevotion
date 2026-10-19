// User files stay in the browser. PDF.js loads only for PDF imports.
export function checkReadingText(text: string): string {
  const clean=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();
  if(!clean||!/[A-Za-z]/.test(clean))throw new Error('No English text found. Scanned PDFs need OCR; upload a text-based PDF or paste the text.');
  if(clean.includes('\0')||clean.length>2_000_000)throw new Error('Binary or oversized text. Split it into smaller passages.');
  return clean;
}
export async function readPersonalFile(file: File, progress: (message:string)=>void=()=>{}): Promise<string> {
  if(!file.size)throw new Error('The file is empty.');
  if(file.size>20*1024*1024)throw new Error('Maximum file size is 20 MB. Split larger documents first.');
  const extension=file.name.split('.').pop()?.toLowerCase();
  if(['txt','md','markdown','text','csv'].includes(extension||''))return checkReadingText(await file.text());
  if(extension==='html'||extension==='htm'){
    // Template content stays inert: imported images/iframes cannot make requests.
    const template=document.createElement('template');template.innerHTML=await file.text();
    const doc=template.content;
    doc.querySelectorAll('script,style,iframe,noscript').forEach(node=>node.remove());
    doc.querySelectorAll('p,div,br,li,h1,h2,h3').forEach(node=>node.append('\n'));
    return checkReadingText(doc.textContent||'');
  }
  if(extension!=='pdf')throw new Error('Supported: TXT, Markdown, text-based PDF, HTML and CSV. Export other documents as PDF or TXT.');
  const {getDocument,GlobalWorkerOptions}=await import('pdfjs-dist');
  const {default:workerUrl}=await import('pdfjs-dist/build/pdf.worker.mjs?url');
  GlobalWorkerOptions.workerSrc=workerUrl;
  const task=getDocument({data:new Uint8Array(await file.arrayBuffer())});
  try{
    const document=await task.promise;
    if(document.numPages>500)throw new Error('Maximum 500 PDF pages per import. Split this document into smaller files.');
    const pages:string[]=[];let length=0;
    for(let number=1;number<=document.numPages;number++){
      progress(`Reading PDF page ${number} of ${document.numPages}…`);
      const page=await document.getPage(number),content=await page.getTextContent();
      const text=content.items.map(item=>'str' in item?item.str+(item.hasEOL?'\n':' '):'').join('');
      length+=text.length;if(length>2_000_000)throw new Error('Too much text. Split this document into smaller files.');
      pages.push(text);page.cleanup();
    }
    return checkReadingText(pages.join('\n\n'));
  }catch(error){
    if(error instanceof Error&&/password/i.test(error.name))throw new Error('Password-protected PDF. Upload an unlocked copy.');
    throw error instanceof Error?error:new Error('Unable to read this PDF. Try a text-based PDF or TXT.');
  }finally{await task.destroy();}
}
export function readingWords(text:string):{word:string;count:number;context:string}[]{
  const words=new Map<string,{word:string;count:number;context:string}>();
  for(const match of text.matchAll(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)){
    const word=match[0].toLowerCase().replaceAll('’',"'"),previous=words.get(word);
    if(previous){previous.count++;continue;}
    const start=match.index,offset=Math.max(0,start-160),before=text.slice(offset,start);
    const left=offset+Math.max(before.lastIndexOf('.'),before.lastIndexOf('\n'))+1;
    const tail=text.slice(start,start+240),end=tail.search(/[.!?\n]/);
    words.set(word,{word,count:1,context:text.slice(left,start+(end<0?tail.length:end+1)).trim()});
  }
  return [...words.values()].sort((a,b)=>b.count-a.count||a.word.localeCompare(b.word));
}
// Paginate instead of mounting thousands of interactive word buttons.
export function readingPages(text:string):string[]{return text.match(/[\s\S]{1,6000}(?:\s|$)|[\s\S]{1,6000}/g)||[];}
