import {useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../../services/db';
import {LEVELS} from '../../types/grammarLearning';
import {placementQuestions} from '../../data/placementQuestions';
import {answerPlacement,nextPlacementQuestion,PLACEMENT_LENGTH,placementResult,setGrammarLevel,startPlacement} from '../../services/grammarLearning';
import type {CEFRLevel} from '../../types/grammar';

export function PlacementPanel(){
 const data=useLiveQuery(async()=>({sessions:await db.grammarPlacements.toArray(),preference:await db.grammarPreferences.get('grammar')}),[]);
 const [open,setOpen]=useState(false),[answer,setAnswer]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);const lock=useRef(false);
 const session=data?.sessions.sort((a,b)=>b.startedAt.localeCompare(a.startedAt))[0];
 const question=session?nextPlacementQuestion(session):undefined;const result=session?.completedAt?placementResult(session):undefined;
 async function act(task:()=>Promise<unknown>){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await task();}catch(e){setError(e instanceof Error?e.message:'Could not save placement progress.');}finally{lock.current=false;setBusy(false);}}
 return <section className="grammar-panel space-y-4" aria-label="Learning level and optional assessment">
  <h3>Personal learning pathway</h3><p>Default focus: B2–C1. Every lesson remains accessible, regardless of your preference or test result.</p>
  <label>Preferred learning level <select className="grammar-input" aria-label="Preferred learning level" disabled={busy} value={data?.preference?.preferredLevel||'B2'} onChange={e=>void act(()=>setGrammarLevel(e.target.value as CEFRLevel))}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></label>
  <p>Optional 20-question diagnostic: grammar, vocabulary, reading, contextual usage and controlled sentence transformation. Starts around B2 and adapts to your responses. This is an uncalibrated learning recommendation, not an official CEFR certificate. Listening, speaking and unrestricted writing are not assessed.</p>
  <div className="flex flex-wrap gap-3"><button disabled={busy} className="retro-btn-teal p-3" onClick={()=>void act(async()=>{await startPlacement();setAnswer('');setOpen(true);})}>{session&&!session.completedAt?'Resume placement assessment':session?'Retake placement assessment':'Start optional placement assessment'}</button><button className="retro-btn-cream p-3" disabled={busy} onClick={()=>void act(async()=>{await setGrammarLevel(data?.preference?.preferredLevel||'B2',true);setOpen(false);})}>Skip assessment · keep my level</button>{session&&<button className="retro-btn-cream p-3" onClick={()=>setOpen(!open)}>{open?'Hide assessment':'Show assessment'}</button>}</div>
  {error&&<p role="alert">{error}</p>}
  {open&&question&&session&&<form key={question.id} className="grammar-example space-y-3" onSubmit={e=>{e.preventDefault();void act(async()=>{await answerPlacement(session.id,question.id,answer);setAnswer('');});}}>
    <h4>Diagnostic {session.responses.length+1} / {PLACEMENT_LENGTH} · {question.domain}</h4><p>{question.prompt}</p>
    {question.choices?<fieldset disabled={busy}><legend>Choose one answer</legend>{question.choices.map(c=><label className="grammar-choice" key={c}><input type="radio" name="placement" checked={answer===c} onChange={()=>setAnswer(c)}/> {c}</label>)}</fieldset>:<label>Your transformation<input maxLength={4000} aria-label="Placement answer" className="grammar-input" value={answer} disabled={busy} onChange={e=>setAnswer(e.target.value)}/><span>Controlled task: use the requested opening and structure. Other valid wording may not match this finite answer key. This does not assess unrestricted writing.</span></label>}
    <button className="retro-btn-teal p-3" disabled={busy||!answer.trim()}>Save and continue</button><p>Answers are saved after each question. Feedback appears at the end so it does not coach later diagnostic answers.</p>
  </form>}
  {open&&result&&session&&<div className="space-y-3" aria-label="Placement results"><h4>Approximate pathway: {result.overall}</h4><p>Low confidence: only four items per area; these results are not validated proficiency measurements. Adjacent levels may also be appropriate.</p><ul>{result.dimensions.map(d=><li key={d.domain}>{d.domain}: {d.level||'Not assessed'} · {d.correct||0} / {d.count||0} · approximate</li>)}</ul><p>Relative strengths: {result.strengths.join(', ')||'More evidence needed'}.</p><p>Improve: {result.focus.join('; ')||'Try harder material and delayed review to check consistency.'}</p><p>Recommended topics: {result.priorities.map(id=>placementQuestions.flatMap(q=>q.lessonIds).includes(id)?id.replaceAll('-',' '):id).join('; ')||'Explore adjacent levels and test retention through review.'}</p><button className="retro-btn-teal p-3" disabled={busy} onClick={()=>void act(()=>setGrammarLevel(result.overall!))}>Use {result.overall} as my preference</button>
    <details><summary>Review my answers and explanations</summary>{session.responses.map(r=>{const q=placementQuestions.find(q=>q.id===r.questionId)!;return <div className="grammar-example" key={q.id}><p>{q.prompt}</p><p>{r.correct?'Accepted':'Not matched to the task key'} · Your answer: {r.answer}</p><p>Key: {q.answers.join(' / ')}. {q.explanation}</p></div>;})}</details>
  </div>}
 </section>;
}
