import {useMemo,useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../../services/db';
import {LEXICAL_QUESTIONS} from '../../data/lexicalPractice';
import {practiceQueue,recordLexicalAnswer,shuffledChoices} from '../../services/lexicalPractice';
import {learningSummary} from '../../services/vocabularyIntelligence';
import {requestLanguageFeedback} from '../../services/languageFeedback';
import type {LexicalAttempt,LexicalExerciseKind} from '../../types/lexical';
import {EXERCISE_KINDS} from '../../services/lexicalValidation';

const labels:Record<LexicalExerciseKind,string>={meaning:'Meaning recognition',context:'Contextual gap',construction:'Sentence construction',translation:'Translation',formation:'Word formation',semantic:'Semantic differences',collocation:'Collocations',correction:'Error correction'};
export function LexicalPracticeView(){
 const attempts=useLiveQuery(()=>db.lexicalAttempts.toArray(),[])||[];
 const [kind,setKind]=useState<LexicalExerciseKind|'all'>('all'),[questionId,setQuestionId]=useState(LEXICAL_QUESTIONS[0].id),[answer,setAnswer]=useState(''),[result,setResult]=useState<LexicalAttempt>(),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const submission=useRef(crypto.randomUUID()),lock=useRef(false);
 const question=LEXICAL_QUESTIONS.find(q=>q.id===questionId)!;
 const choices=useMemo(()=>shuffledChoices(question),[question]);
 const stats=learningSummary(question.word,attempts);
 function choose(nextId:string){submission.current=crypto.randomUUID();setQuestionId(nextId);setAnswer('');setResult(undefined);setError('');}
 async function submit(){if(lock.current||result||!answer.trim())return;lock.current=true;setBusy(true);setError('');try{setResult(await recordLexicalAnswer(submission.current,question.id,answer));}catch(e){setError(e instanceof Error?e.message:'Unable to save answer.');}finally{lock.current=false;setBusy(false);}}
 async function feedback(){if(!result||lock.current)return;lock.current=true;setBusy(true);setError('');try{const value=await requestLanguageFeedback(result.id);setResult({...result,feedback:value});}catch(e){setError(e instanceof Error?e.message:'Optional feedback unavailable.');}finally{lock.current=false;setBusy(false);}}
 return <section className="p-4 sm:p-8 max-w-4xl mx-auto space-y-5" aria-label="Context and usage practice">
  <h2>Vocabulary · Context & Usage</h2><p>Original, curated practice · {LEXICAL_QUESTIONS.length} activities across eight skills. These activities include words outside your saved library. Saving an answer does not add vocabulary or imply mastery.</p>
  <div className="flex flex-wrap gap-3"><label>Skill <select aria-label="Vocabulary skill" disabled={busy} value={kind} onChange={e=>{const value=e.target.value as typeof kind;setKind(value);choose(LEXICAL_QUESTIONS.find(q=>value==='all'||q.kind===value)!.id);}}><option value="all">All skills</option>{EXERCISE_KINDS.map(k=><option key={k} value={k}>{labels[k]}</option>)}</select></label><label>Activity <select aria-label="Vocabulary activity" disabled={busy} value={questionId} onChange={e=>choose(e.target.value)}>{LEXICAL_QUESTIONS.filter(q=>kind==='all'||q.kind===kind).map(q=><option key={q.id} value={q.id}>{labels[q.kind]} · {q.prompt.slice(0,48)}…</option>)}</select></label></div>
  <article className="retro-window-dark p-5 space-y-4"><h3 className="vocab-word">{question.kind==='meaning'||!question.answers.length?question.word:labels[question.kind]}</h3><p className="vocab-text">{question.prompt}</p>
   <form onSubmit={e=>{e.preventDefault();void submit();}} className="space-y-3">
    {choices.length?<fieldset disabled={busy||!!result}><legend>Choose one answer</legend>{choices.map(choice=><label key={choice} className="block p-2 border border-[var(--color-outline)]"><input type="radio" name={question.id} value={choice} checked={answer===choice} onChange={()=>setAnswer(choice)}/> {choice}</label>)}</fieldset>:<label className="block">Your answer <textarea aria-label="Vocabulary answer" rows={question.answers.length?2:4} maxLength={4000} disabled={busy||!!result} value={answer} onChange={e=>setAnswer(e.target.value)} className="block w-full p-3 border border-[var(--color-outline)] bg-[var(--color-black)] vocab-text"/></label>}
    {!question.answers.length&&<p>No exact-match or keyword grading. Save your draft, then optionally request AI feedback from a separately configured local model.</p>}
    <button className="retro-btn-teal p-3" disabled={busy||!!result||!answer.trim()}>{question.answers.length?'Check answer':'Save ungraded answer'}</button>
   </form>
   {error&&<p role="alert">{error}</p>}
   {result&&<div role="status" className="space-y-3 p-3 border border-[var(--color-outline)]"><h4>{result.correct===null?'Saved · not automatically graded':result.correct?'Correct':'Needs practice'}</h4>{!result.correct&&question.answers.length>0&&<p>Expected: {question.answers.join(' / ')}</p>}<p>{result.explanation}</p>{result.correct===null&&<><details><summary>One possible answer / guidance</summary><p>{question.reference||question.explanation}</p></details><button type="button" className="retro-btn-cream p-3" disabled={busy} onClick={()=>void feedback()}>Optional AI language feedback</button></>}{result.feedback&&<div><p>AI-generated feedback · {result.feedback.model} · not verified grading</p><p>{result.feedback.category.replaceAll('_',' ')}</p><p>{result.feedback.explanation}</p><p>{result.feedback.suggestion}</p></div>}</div>}
   <div className="flex flex-wrap gap-3"><button type="button" className="retro-btn-cream p-3" disabled={busy} onClick={()=>choose(question.id)}>Repeat activity</button><button type="button" className="retro-btn-teal p-3" disabled={busy} onClick={()=>{const next=practiceQueue(attempts).find(q=>(kind==='all'||q.kind===kind)&&q.id!==question.id);choose(next?.id||question.id);}}>Next recommended activity</button></div>
  </article>
  <p>Activity progress: {stats.stage} · {stats.correct} correct / {stats.incorrect} incorrect · {stats.pendingProduction} ungraded production drafts{stats.needsReview?' · Needs contextual review':''}</p><p>Recognition → Understanding → Application. Production is recorded separately; neither ungraded drafts nor AI comments establish mastery. Weak and due activities receive greater selection weight. Existing flashcard SM-2 schedules are unchanged.</p>
  <details><summary>Recent attempts for this word</summary><div className="max-h-80 overflow-auto space-y-3">{attempts.filter(a=>a.word===question.word).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0,20).map(a=><article key={a.id} className="p-3 border border-[var(--color-outline)]"><p>{labels[a.kind]} · {a.timestamp.slice(0,10)} · {a.correct===null?'Ungraded':a.correct?'Correct':'Needs practice'}</p><p className="vocab-text">{a.answer}</p><p>{a.explanation}</p>{a.feedback&&<p>AI-generated feedback: {a.feedback.explanation}</p>}</article>)}</div></details>
 </section>;
}
