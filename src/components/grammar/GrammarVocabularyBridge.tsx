import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../../services/db';
import {grammarExercises} from '../../data/grammarExercises';
import {grammarLessons} from '../../data/grammarLessons';

export function GrammarVocabularyBridge({onOpen}:{onOpen:(id:string)=>void}){
 const vocabulary=useLiveQuery(()=>db.vocabulary.toArray(),[]);
 const matches=grammarExercises.filter(q=>q.vocabulary&&vocabulary?.some(v=>v.word.trim().toLowerCase()===q.vocabulary!.word));
 if(!matches.length)return null;
 return <section className="grammar-panel"><h3>Grammar with your saved vocabulary</h3><p>These authored contexts use words already in your library. Grammar answers do not change word familiarity, vocabulary scores or vocabulary review schedules.</p>{matches.map(q=><div className="grammar-example" key={q.id}><p>{q.vocabulary!.word} — {q.vocabulary!.meaning}</p><button className="retro-btn-cream p-3" onClick={()=>onOpen(q.lessonId)}>Study in context: {grammarLessons.find(l=>l.id===q.lessonId)?.title}</button></div>)}</section>;
}
