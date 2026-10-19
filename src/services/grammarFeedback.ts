import {db} from './db';
import {validProduction} from './grammarLearningValidation';
import type {LanguageFeedback} from '../types/lexical';
// Deliberately separate from deterministic scoring; a future evaluator can replace this adapter.
export async function requestGrammarFeedback(id:string):Promise<LanguageFeedback>{
 const draft=await db.grammarProduction.get(id);if(!draft)throw new Error('Save your original response first.');if(draft.feedback)return draft.feedback;
 const status=await fetch('/__local/status',{signal:AbortSignal.timeout(3000)});if(!status.ok||!status.headers.get('content-type')?.includes('application/json'))throw new Error('Local feedback server unavailable; your response is saved and ungraded.');
 const session=await status.json();const response=await fetch('/__local/language-feedback',{method:'POST',signal:AbortSignal.timeout(23000),headers:{'Content-Type':'application/json','X-EBD-Token':session.token},body:JSON.stringify({grammarLessonId:draft.lessonId,answer:draft.answer})});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'Optional local model unavailable. Your response remains ungraded.');
 if(!validProduction({...draft,feedback:data}))throw new Error('Invalid feedback; no grade assigned.');
 await db.grammarProduction.update(id,{feedback:data});return data;
}
