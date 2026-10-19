import {useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../../services/db';
import {saveGrammarProduction} from '../../services/grammarLearning';
import {requestGrammarFeedback} from '../../services/grammarFeedback';
import type {GrammarLesson} from '../../types/grammar';

export function GrammarProduction({lesson}:{lesson:GrammarLesson}){
 const drafts=useLiveQuery(()=>db.grammarProduction.where('lessonId').equals(lesson.id).reverse().sortBy('timestamp'),[lesson.id]);
 const [answer,setAnswer]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);const lock=useRef(false);
 const task=lesson.production||{prompt:`Write an original example illustrating ${lesson.title.toLowerCase()}. Explain your intended meaning.`,reference:lesson.examples[0].sentence,criteria:['Use the lesson structure.','Check meaning, reference time and context.']};
 async function act(fn:()=>Promise<unknown>){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'Could not save your response.');}finally{lock.current=false;setBusy(false);}}
 return <section className="grammar-panel space-y-3"><h3>Active production · original language</h3><p>{task.prompt}</p><p>Free writing is saved ungraded. No string matching can establish grammatical correctness or preserved meaning. Optional local-model comments, when configured, are advisory and never count toward objective mastery.</p><ul>{task.criteria.map(c=><li key={c}>{c}</li>)}</ul>
 <form onSubmit={e=>{e.preventDefault();void act(async()=>{await saveGrammarProduction(lesson.id,answer);setAnswer('');});}}><label>Your original response<textarea aria-label="Original grammar response" className="grammar-input" maxLength={4000} rows={4} value={answer} disabled={busy} onChange={e=>setAnswer(e.target.value)}/></label><button disabled={busy||!answer.trim()} className="retro-btn-teal p-3">Save ungraded response</button></form>
 {error&&<p role="alert">{error}</p>}<details><summary>One possible model · not an exhaustive answer key</summary><p>{task.reference}</p></details>
 {drafts?.slice(0,5).map(d=><div className="grammar-example" key={d.id}><p>{d.answer}</p><p>Saved {new Date(d.timestamp).toLocaleString()} · Ungraded</p>{d.feedback?<div><p>AI advisory · {d.feedback.category} · {d.feedback.model}</p><p>{d.feedback.explanation}</p><p>{d.feedback.suggestion}</p></div>:<button disabled={busy} className="retro-btn-cream p-3" onClick={()=>void act(()=>requestGrammarFeedback(d.id))}>Optional local-model feedback</button>}</div>)}
 </section>;
}
