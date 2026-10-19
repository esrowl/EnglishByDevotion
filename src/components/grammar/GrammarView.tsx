import {useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../../services/db';
import {grammarLessons} from '../../data/grammarLessons';
import {exercisesFor} from '../../data/grammarExercises';
import {openGrammarLesson,setGrammarSection,completeGrammarReading,startGrammarSession,submitGrammarAnswer,grammarStats} from '../../services/grammarService';
import type {GrammarAttempt,GrammarProgress,LessonSection} from '../../types/grammar';
import {LEVELS} from '../../types/grammarLearning';
import {recommendGrammar,skillBreakdown} from '../../services/grammarLearning';
import {PlacementPanel} from './PlacementPanel';
import {GrammarProduction} from './GrammarProduction';
import {GrammarVocabularyBridge} from './GrammarVocabularyBridge';

const sections: {id:LessonSection;label:string}[]=[{id:'introduction',label:'Learn'},{id:'structure',label:'Understand'},{id:'examples',label:'Observe'},{id:'mistakes',label:'Common mistakes'},{id:'practice',label:'Practice'},{id:'summary',label:'Summary'},{id:'review',label:'Review'}];
const kindLabels={'multiple-choice':'Multiple choice','fill-blank':'Fill in the blank','error-identification':'Error identification','sentence-ordering':'Sentence ordering','structure-recognition':'Structure recognition',transformation:'Controlled sentence transformation','error-correction':'Error correction','sentence-completion':'Sentence completion','context-selection':'Contextual selection','guided-construction':'Guided construction'};

function GrammarPractice({progress,attempts,onRun}:{progress:GrammarProgress;attempts:GrammarAttempt[];onRun:(mode:'practice'|'review',repeat?:boolean)=>Promise<void>}) {
  const questions=exercisesFor(progress.lessonId);const session=progress.activeSession;
  const records=attempts.filter(a=>a.sessionId===session?.id);
  const firstMissing=questions.findIndex(q=>!records.some(a=>a.exerciseId===q.id));
  const [index,setIndex]=useState(firstMissing<0?questions.length-1:firstMissing);
  const [answer,setAnswer]=useState('');const [used,setUsed]=useState<number[]>([]);
  const [localResult,setLocalResult]=useState<GrammarAttempt>();
  const [busy,setBusy]=useState(false);const lock=useRef(false);const [error,setError]=useState('');
  const question=questions[index];
  const result=records.find(a=>a.exerciseId===question.id) || (localResult?.exerciseId===question.id?localResult:undefined);
  async function check(){if(lock.current || result)return;lock.current=true;setBusy(true);setError('');try{setLocalResult(await submitGrammarAnswer(progress.lessonId,question.id,answer));}catch(e){setError(e instanceof Error?e.message:'Could not save this answer.');}finally{lock.current=false;setBusy(false);}}
  if(!session)return <div className="grammar-panel"><h3>Ready to practise?</h3><p>{questions.length} authored questions with explicit keys and explanations. Each answer is saved once per session. Repeating creates a new session without erasing previous attempts.</p><button className="retro-btn-teal p-3" onClick={()=>void onRun('practice')}>Start practice</button></div>;
  const completed=records.length===questions.length;
  return <div className="grammar-panel space-y-4">
    <div className="flex flex-wrap justify-between gap-3"><h3>{session.mode==='review'?'Review':'Practice'} · {kindLabels[question.kind]}</h3><span>Question {index+1} / {questions.length}</span></div>
    <label>Choose practice focus<select aria-label="Choose grammar practice focus" className="grammar-input" disabled={busy} value={index} onChange={e=>{setIndex(Number(e.target.value));setAnswer('');setUsed([]);setLocalResult(undefined);}}>{questions.map((q,i)=><option key={q.id} value={i}>{i+1} · {q.choices?'Recognition':'Controlled production'} · {kindLabels[q.kind]}{records.some(a=>a.exerciseId===q.id)?' · answered':''}</option>)}</select></label>
    <p>{question.prompt}</p>
    {question.vocabulary&&<p>Vocabulary in context: <strong>{question.vocabulary.word}</strong> — {question.vocabulary.meaning}. This answer measures the grammatical form, not whether you have mastered the word. Vocabulary familiarity and its review schedule remain separate.</p>}
    {['transformation','error-correction','guided-construction','sentence-completion'].includes(question.kind)&&<p>Controlled production: follow the requested opening and structure. Explicit answer alternatives are checked; an unmatched response is not a general judgment of your writing. Original sentences can be saved ungraded below.</p>}
    {question.tokens && <div className="flex flex-wrap gap-2" aria-label="Scrambled words">{question.tokens.map((token,i)=><button key={i} className="grammar-token" disabled={busy || !!result || used.includes(i)} onClick={()=>{setUsed([...used,i]);setAnswer(previous=>`${previous} ${token}`.trim());}}>{token}</button>)}<button className="grammar-token" disabled={busy || !!result} onClick={()=>{setAnswer('');setUsed([]);}}>Reset order</button></div>}
    {!result && <form className="space-y-4" onSubmit={e=>{e.preventDefault();void check();}}>
      {question.choices ? <fieldset disabled={busy} className="space-y-2"><legend>Choose one answer</legend>{question.choices.map(option=><label key={option} className={`grammar-choice ${answer===option?'selected':''}`}><input type="radio" name={question.id} value={option} checked={answer===option} onChange={()=>setAnswer(option)} /> {option}</label>)}</fieldset> : <label className="block">{question.kind==='sentence-ordering'?'Your ordered sentence':'Your answer'}<input aria-label="Grammar answer" value={answer} disabled={busy} autoComplete="off" onChange={e=>setAnswer(e.target.value)} className="grammar-input" /></label>}
      <button className="retro-btn-teal p-3" disabled={busy || !answer.trim()}>Check answer</button>
    </form>}
    {error && <p role="alert">{error}</p>}
    {result && <div role="status" className={`grammar-feedback ${result.correct?'correct':'incorrect'}`}>
      <h4>{result.correct?'Correct · here is why':'Needs another look · here is why'}</h4>
      <p>Your answer: {result.answer}</p><p>Accepted answer{question.answers.length>1?'s':''}: {question.answers.join(' / ')}</p>
      {question.correction && <p>Corrected sentence: {question.correction}</p>}<p>{question.explanation}</p>
    </div>}
    <div className="flex flex-wrap gap-3">
      <button className="retro-btn-cream p-3" disabled={index===0 || busy} onClick={()=>{setIndex(index-1);setAnswer('');setUsed([]);setLocalResult(undefined);}}>Previous question</button>
      {index<questions.length-1 && <button className="retro-btn-cream p-3" disabled={!result || busy} onClick={()=>{setIndex(index+1);setAnswer('');setUsed([]);setLocalResult(undefined);}}>Next question</button>}
    </div>
    {completed && <div className="grammar-feedback"><h4>Session complete · {records.filter(a=>a.correct).length} / {questions.length}</h4><p>Opening or finishing a lesson does not establish mastery. A successful later review demonstrates retention; repeating immediately is useful practice, not delayed review.</p><button className="retro-btn-teal p-3" onClick={()=>void onRun('practice',true)}>Repeat exercises</button></div>}
  </div>;
}

export function GrammarView(){
  const data=useLiveQuery(async()=>({progress:await db.grammarProgress.toArray(),attempts:await db.grammarAttempts.toArray(),preference:await db.grammarPreferences.get('grammar')}),[]);
  const [lessonId,setLessonId]=useState<string>();const [weakOnly,setWeakOnly]=useState(false);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const [level,setLevel]=useState('recommended'),[category,setCategory]=useState('all'),[status,setStatus]=useState('all');
  const lock=useRef(false);
  async function act(task:()=>Promise<unknown>){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await task();}catch(e){setError(e instanceof Error?e.message:'Unable to save grammar progress.');}finally{lock.current=false;setBusy(false);}}
  if(!data)return <p className="p-6">Loading local grammar progress…</p>;
  const lesson=grammarLessons.find(l=>l.id===lessonId);const progress=data.progress.find(p=>p.lessonId===lessonId);
  const stats=lesson?grammarStats(lesson.id,progress,data.attempts):undefined;
  const skills=lesson?skillBreakdown(lesson.id,data.attempts):undefined;
  const preferred=data.preference?.preferredLevel||'B2';
  const visibleLessons=grammarLessons.filter(l=>{
    const p=data.progress.find(p=>p.lessonId===l.id),s=grammarStats(l.id,p,data.attempts);
    const levelMatches=level==='all'||(level==='recommended'?(l.level===preferred||preferred==='B2'&&l.level==='C1'):l.level===level);
    const statusMatches=status==='all'||(status==='Completed'&&!!p?.lessonCompletedAt)||(status==='Not Started'&&!p)||(status==='In Progress'&&!!p&&!p.lessonCompletedAt)||(status==='Needs Review'&&(s.weak||s.due));
    return (weakOnly?(s.weak||s.due):levelMatches)&&(category==='all'||l.category===category)&&statusMatches;
  });
  const section=progress?.section || 'introduction';
  const run=async(mode:'practice'|'review',repeat=false)=>{if(lesson)await act(()=>startGrammarSession(lesson.id,mode,repeat));};
  return <div className="grammar-view p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
    {error && <p role="alert">{error}</p>}
    {!lesson && <>
      <section className="grammar-intro circuit-panel"><div><p className="retro-status">LOCAL LESSONS · OBJECTIVE PRACTICE</p><h2>Grammar Library</h2><p>Learn → Understand → Observe → Practice → Review</p><p>{grammarLessons.length} complete lessons. CEFR tags are approximate editorial pathways, not official classifications of individual structures. Default recommendations emphasize B2–C1; all levels stay accessible.</p></div></section>
      <PlacementPanel />
      <GrammarVocabularyBridge onOpen={id=>void act(async()=>{await openGrammarLesson(id);setLessonId(id);})}/>
      <section className="grammar-panel"><h3>Suggested next steps</h3>{recommendGrammar(data.progress,data.attempts,preferred).map(r=><p key={r.lesson.id}>{r.lesson.title} · {r.stats.status}. {r.skills.recommendation}</p>)}</section>
      <div className="flex flex-wrap gap-4">
        <label>Level <select className="grammar-input" aria-label="Filter grammar level" value={level} onChange={e=>setLevel(e.target.value)}><option value="recommended">My pathway ({preferred}{preferred==='B2'?'–C1':''})</option><option value="all">All levels</option>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></label>
        <label>Category <select className="grammar-input" aria-label="Filter grammar category" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{[...new Set(grammarLessons.map(l=>l.category))].map(c=><option key={c}>{c}</option>)}</select></label>
        <label>Progress <select className="grammar-input" aria-label="Filter grammar progress" value={status} onChange={e=>setStatus(e.target.value)}>{['all','Not Started','In Progress','Completed','Needs Review'].map(s=><option key={s} value={s}>{s==='all'?'All progress':s}</option>)}</select></label>
      </div>
      <button className="retro-btn-cream p-3" aria-pressed={weakOnly} onClick={()=>setWeakOnly(!weakOnly)}>{weakOnly?'Show all topics':'Review weak topics'}</button>
      {!visibleLessons.length&&<p>No lessons match these filters. Choose All levels, All categories and All progress to explore the full library.</p>}
      {LEVELS.map(group=>{
        const lessons=visibleLessons.filter(l=>l.level===group);
        return !!lessons.length && <section key={group} className="space-y-3"><h3>{group}</h3><div className="grammar-grid">{lessons.map(l=>{const p=data.progress.find(p=>p.lessonId===l.id),s=grammarStats(l.id,p,data.attempts);return <button key={l.id} disabled={busy} className={`grammar-card group-${l.group.toLowerCase().replace(' ','-')}`} onClick={()=>void act(async()=>{await openGrammarLesson(l.id);setLessonId(l.id);})}><h4>{l.title}</h4><p>{s.status} · {s.attempted} attempts</p><p>{s.correct} correct · {s.incorrect} incorrect</p><p>{p?.lessonCompletedAt?'Lesson read':'Lesson not completed'} · {p?'Resume lesson':'Open lesson'}</p>{s.nextReviewAt && <p>Review {new Date(s.nextReviewAt).toLocaleDateString()}</p>}</button>;})}</div></section>;
      })}
      {weakOnly && !grammarLessons.some(l=>{const s=grammarStats(l.id,data.progress.find(p=>p.lessonId===l.id),data.attempts);return s.weak||s.due;}) && <p>No weak or due topics yet. Practise a lesson to build your review history.</p>}
    </>}
    {lesson && progress && stats && <>
      <button className="retro-btn-cream p-3" onClick={()=>setLessonId(undefined)}>← Grammar Library</button>
      <section className="grammar-intro"><p className="retro-status">{lesson.level} (approximate) · {lesson.category} · {stats.status}</p><h2>{lesson.title}</h2><p>{stats.attempted} attempted · {stats.correct} correct · {stats.incorrect} incorrect · recent accuracy {Math.round(stats.recentScore*100)}%</p><p>{progress.lessonCompletedAt?'Lesson reading completed':'Lesson reading in progress'} · Last studied {new Date(progress.lastStudiedAt).toLocaleString()}</p><progress aria-label="Grammar recent accuracy" max={100} value={Math.round(stats.recentScore*100)} />{skills&&<><p>Recognition: {skills.recognition.correct} / {skills.recognition.attempted} · Controlled production: {skills.production.correct} / {skills.production.attempted}</p><p>{skills.recommendation}</p></>}</section>
      <nav aria-label="Lesson sections" className="flex flex-wrap gap-2">{sections.map(s=><button key={s.id} disabled={busy} className={`grammar-tab ${section===s.id?'active':''}`} aria-current={section===s.id?'step':undefined} onClick={()=>void act(()=>setGrammarSection(lesson.id,s.id))}>{s.label}</button>)}</nav>
      {section==='introduction' && <section className="grammar-panel"><h3>Introduction · Learn</h3>{lesson.introduction.map((p,i)=><p key={i}>{p}</p>)}<h4>Why use this structure?</h4><p>{lesson.purpose}</p></section>}
      {section==='structure' && <section className="grammar-panel"><h3>Structure · Understand</h3><ul>{lesson.structures.map(s=><li key={s} className="grammar-formula">{s}</li>)}</ul><p>{lesson.purpose}</p><h4>Comparative understanding</h4>{lesson.comparisons?.length?lesson.comparisons.map(c=><div className="grammar-example" key={c.contrast}><p>{c.contrast}</p><p>{c.explanation}</p></div>):lesson.examples.map(e=><div className="grammar-example" key={e.sentence}><p>{e.sentence}</p><p>{e.why}</p></div>)}</section>}
      {section==='examples' && <section className="grammar-panel"><h3>Examples · Observe</h3>{lesson.examples.map((e,i)=><div key={i} className="grammar-example"><p>{e.sentence}</p><p className="grammar-note">Why: {e.why}</p></div>)}</section>}
      {section==='mistakes' && <section className="grammar-panel"><h3>Common mistakes</h3>{lesson.mistakes.map((m,i)=><div key={i} className="grammar-example"><p>Incorrect: <s>{m.incorrect}</s></p><p>Correct: {m.correct}</p><p>Why: {m.why}</p></div>)}</section>}
      {section==='practice' && <><GrammarPractice key={progress.activeSession?.id || lesson.id} progress={progress} attempts={data.attempts.filter(a=>a.lessonId===lesson.id)} onRun={run} /><GrammarProduction key={lesson.id} lesson={lesson}/></>}
      {section==='summary' && <section className="grammar-panel"><h3>Summary</h3><ul>{lesson.summary.map(s=><li key={s}>{s}</li>)}</ul><button disabled={busy || !!progress.lessonCompletedAt} className="retro-btn-teal p-3" onClick={()=>void act(()=>completeGrammarReading(lesson.id))}>{progress.lessonCompletedAt?'Reading marked complete':'Mark lesson reading complete'}</button><p>This records reading completion, not mastery. Demonstrate understanding through practice and later review.</p></section>}
      {section==='review' && <section className="grammar-panel"><h3>Review and retention</h3><p>{stats.status} · {stats.finishedSessions} completed exercise sessions.</p><p>{stats.nextReviewAt?`Next review: ${new Date(stats.nextReviewAt).toLocaleString()}`:'Complete a practice session to schedule review.'}</p><p>Below 80%: review after one day. At least 80%: after three days. Mastered topics: seven days. Mastery requires completed reading, two successful full sessions including a review at least 24 hours later, and recent accuracy of at least 80%.</p><button disabled={busy} className="retro-btn-teal p-3" onClick={()=>void run('review',true)}>Start review</button><p>You can review sooner, but it will not prove delayed retention.</p></section>}
      {section==='review'&&!!skills?.recurring.length&&<section className="grammar-panel"><h4>Recurring errors · at least two unmatched attempts</h4>{skills.recurring.map(r=><div key={r.exerciseId} className="grammar-example"><p>{r.prompt}</p><p>{r.explanation}</p></div>)}</section>}
      <div className="flex flex-wrap gap-3"><button className="retro-btn-cream p-3" disabled={busy || section==='introduction'} onClick={()=>void act(()=>setGrammarSection(lesson.id,sections[Math.max(0,sections.findIndex(s=>s.id===section)-1)].id))}>Previous section</button><button className="retro-btn-teal p-3" disabled={busy || section==='review'} onClick={()=>void act(()=>setGrammarSection(lesson.id,sections[Math.min(sections.length-1,sections.findIndex(s=>s.id===section)+1)].id))}>Next section</button></div>
      <footer className="grammar-references"><p>Original teaching text and questions. Grammar references (not copied lessons):</p>{lesson.references.map(r=><a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.title}</a>)}</footer>
    </>}
  </div>;
}
