import type {GrammarExercise, ExerciseKind} from '../types/grammar';
import {advancedExercises} from './advancedGrammar';

type Question = {kind:ExerciseKind;prompt:string;answers:string[];explanation:string;choices?:string[];tokens?:string[];correction?:string};
const choice = (prompt:string,choices:string[],answer:string,explanation:string):Question => ({kind:'multiple-choice',prompt,choices,answers:[answer],explanation});
const blank = (prompt:string,answers:string[],explanation:string):Question => ({kind:'fill-blank',prompt,answers,explanation});
const error = (prompt:string,choices:string[],answer:string,correction:string,explanation:string):Question => ({kind:'error-identification',prompt,choices,answers:[answer],correction,explanation});
const order = (tokens:string,sentence:string,explanation:string):Question => ({kind:'sentence-ordering',prompt:`Arrange the supplied words to practise the lesson pattern. Begin with “${sentence.split(' ')[0]}”. Use every word; capitalization and ordinary punctuation do not affect the score.`,tokens:tokens.split(' / '),answers:[sentence],explanation});
const recognize = (prompt:string,choices:string[],answer:string,explanation:string):Question => ({kind:'structure-recognition',prompt,choices,answers:[answer],explanation});

// Fixed, authored questions and explicit answer keys. No random blank generation or AI judging.
const questions: Record<string,Question[]> = {
  articles:[
    choice('Choose the indefinite article: She bought ___ umbrella.',['a','an','the'],'an','Umbrella begins with a vowel sound, so the requested indefinite article is an. A has the wrong sound; the would be definite.'),
    blank('Use a or an: He is ___ university student.',['a'],'University begins with /j/, a consonant sound, so a is required; spelling alone is not the rule.'),
    error('Identify the correction needed: “I need an useful guide.”',['Change an to a','Change guide to guides','Change need to needs'],'Change an to a','I need a useful guide.','Useful begins with /j/. Plural guides cannot follow an, and I does not take needs.'),
    order('notebook / a / bought / I','I bought a notebook.','The subject precedes bought; a introduces the singular object notebook.'),
    recognize('“The notebook I mentioned is on the desk.” What does the before notebook signal?',['An unspecified member of a type','An identifiable noun','A general plural category'],'An identifiable noun','I mentioned identifies the notebook. It is neither unspecified nor a general plural.'),
  ],
  agreement:[
    choice('Every evening, she ___ the window.',['open','opens','opening'],'opens','She is third-person singular, so present simple takes opens. Open lacks agreement; opening requires an auxiliary.'),
    blank('Use the present simple auxiliary: ___ he work here?',['does'],'Does carries third-person singular agreement in a present simple question; work stays plain.'),
    error('Keep the plural meaning (several keys). Which correction fixes “The keys is on the desk”?',['Change keys to key','Change is to are','Change desk to desks'],'Change is to are','The keys are on the desk.','The subject keys is plural, so are is required. Changing the object does not fix agreement; changing the subject would change the intended meaning.'),
    order('every / reads / she / evening','She reads every evening.','She agrees with reads; every evening specifies a habitual time.'),
    recognize('In “The box of pencils is heavy”, which phrase controls is?',['of pencils','heavy','The box'],'The box','The head noun box is singular. Pencils belongs to a modifying phrase, and heavy is a complement.'),
  ],
  present:[
    choice('Use the present continuous: At this moment, Esra ___ a lesson.',['studies','is studying','study'],'is studying','The requested continuous form needs is + studying. Studies is simple; study does not agree with Esra.'),
    blank('Complete using the present simple of read: She ___ before bed every night.',['reads'],'A routine takes present simple; she requires the -s form reads.'),
    error('Which correction fixes “They watching the snow now”?',['Add are before watching','Change snow to snows','Add do before watching'],'Add are before watching','They are watching the snow now.','The continuous needs are + -ing. Do cannot be followed by watching here; changing snow does not add the missing auxiliary.'),
    order('now / checking / am / I / the / weather','I am checking the weather now.','I takes am, followed by checking. The object is the weather and now supplies the time.'),
    recognize('“I know the answer.” Which description fits know here?',['A state in the present simple','A present continuous action','A past perfect action'],'A state in the present simple','Know expresses a state in the simple present. There is no be + -ing or had + participle.'),
  ],
  past:[
    choice('Choose the missing auxiliary: At eight yesterday, they ___ waiting outside.',['was','were','did'],'were','They requires were in the past continuous. Was has the wrong agreement; did does not precede waiting.'),
    blank('Use the base form after did: Did she ___ (go) home?',['go'],'Did already marks past tense. Went or gone would mark the main verb incorrectly in this question.'),
    error('Identify the incorrect part: “I did not went outside.”',['did not','went','outside'],'went','I did not go outside.','Went must become go after did not. Did not and outside are already well formed.'),
    order('reading / was / I / when / rang / the / phone','I was reading when the phone rang.','Was reading provides ongoing background; rang describes the interrupting event.'),
    recognize('“I was cooking when you arrived.” What does was cooking describe?',['A future intention','Background activity already in progress','A present habit'],'Background activity already in progress','Was + -ing frames an ongoing past activity. It is not a future form or present routine.'),
  ],
  perfect:[
    choice('Complete with the correct participle: I have ___ my key.',['lose','lost','losing'],'lost','Have takes the past participle lost. Lose is the base form; losing is an -ing form.'),
    blank('Use for or since: We have lived here ___ 2020.',['since'],'2020 is a starting point, not a duration, so since is required.'),
    error('In standard tense usage, what must change in “I have visited them yesterday”?',['Use visited instead of have visited','Use visiting instead of visited','Use has instead of have'],'Use visited instead of have visited','I visited them yesterday.','Yesterday is a finished past-time expression, so past simple fits. Visiting lacks a suitable auxiliary; has does not agree with I.'),
    order('left / had / train / the / before / arrived / we','The train had left before we arrived.','Had left looks back from the later past arrival; arrived establishes that reference event.'),
    recognize('“She had finished before we arrived.” Identify had finished.',['Past simple','Present perfect','Past perfect'],'Past perfect','Had + past participle is past perfect. Present perfect uses have/has; past simple has no had auxiliary.'),
  ],
  future:[
    choice('Use the grammatical will form: I ___ call you tomorrow.',['will to','will','will calling'],'will','Will takes the base verb call, without to or -ing. This question checks form, not a uniquely possible future meaning.'),
    blank('Complete the going-to form: They ___ going to practise tonight.',['are',"'re"],'The plural subject needs are before going to. The explicitly accepted contracted fragment is ’re; both form They are/They’re going to.'),
    error('What must change in “She will to bring a notebook”?',['Remove to','Change will to wills','Remove She'],'Remove to','She will bring a notebook.','Will takes bring without to; core modals have no -s. Removing the subject does not repair the target form.'),
    order('going / am / I / to / tomorrow / study','I am going to study tomorrow.','The structure is subject + be + going to + base verb. Tomorrow establishes future time.'),
    recognize('“We are meeting the tutor at six; the appointment is booked.” Which future use is highlighted?',['An arranged meeting','An imaginary past','A present perfect result'],'An arranged meeting','The present continuous plus a booked appointment signals an arrangement. There is no counterfactual past or perfect auxiliary.'),
  ],
  modals:[
    choice('Which form is grammatical? She can ___ the monitor.',['repairs','to repair','repair'],'repair','Can selects the bare infinitive repair, not repairs or to repair.'),
    blank('Use must or must not to express prohibition: You ___ touch the exposed wire.',['must not',"mustn't"],'Prohibition requires must not/mustn’t. Must without not would express an obligation to touch it.'),
    error('Identify the error in “He can speaks French”.',['He','speaks','French'],'speaks','He can speak French.','After can, speak must be plain. The subject He and language noun French are not the error.'),
    order('save / should / you / a / backup','You should save a backup.','Should takes save; this construction gives advice.'),
    recognize('“You do not have to attend.” What does it mean?',['Attendance is forbidden','Attendance is not required','Attendance is impossible'],'Attendance is not required','Do not have to removes an obligation; it does not prohibit attendance or imply inability.'),
  ],
  passive:[
    choice('Use the passive: The window was ___ yesterday.',['break','broken','broke'],'broken','Passive was requires the participle broken. Break is base; broke is past simple.'),
    blank('Complete the past passive: The letters ___ (be) delivered yesterday.',['were'],'Letters is plural and yesterday is past, so were + delivered forms the required passive.'),
    error('Identify the error in “The train was arrived at noon”.',['was arrived','at noon','The train'],'was arrived','The train arrived at noon.','Arrive is intransitive here and cannot form this passive. The subject and time phrase are valid.'),
    order('was / the / repaired / monitor / yesterday','The monitor was repaired yesterday.','The receiver monitor is the subject; was repaired is past passive.'),
    recognize('“The files must be copied.” Identify the construction.',['Modal passive','Present perfect active','Past continuous active'],'Modal passive','Must + be + copied is modal passive. There is no have/has or was/were + -ing.'),
  ],
  relatives:[
    choice('Choose a possessive relative: The student ___ notebook is blue is outside.',['whose','who','which'],'whose','Whose modifies notebook and shows possession. Who/which alone cannot mark possession before this noun.'),
    blank('Use who or that: The tutor ___ helped me was patient.',['who','that'],'Both who and that can be subject relatives for a person in a defining clause. The subject relative cannot be omitted.'),
    error('What corrects “Esra, that lives in Ankara, called”?',['Replace that with who','Remove lives','Replace called with calling'],'Replace that with who','Esra, who lives in Ankara, called.','The commas mark a non-defining clause about a person, so who is suitable and that is not. The other changes break finite verbs.'),
    order('who / me / helped / the / tutor / smiled','The tutor who helped me smiled.','Who helped me identifies the tutor and who is the subject of helped.'),
    recognize('In “The book that I borrowed is old”, can that be omitted?',['No, because it is the subject','Yes, because it is the object in a defining clause','Yes, because all relatives can be omitted'],'Yes, because it is the object in a defining clause','I is the subject of borrowed; that stands for its object. Only this kind of defining object relative can be omitted, not all relatives.'),
  ],
  'verb-patterns':[
    choice('I enjoy ___ beside the window.',['to read','reading','read'],'reading','Enjoy selects an -ing complement. Neither to read nor plain read fits this verb pattern.'),
    blank('Complete with the full infinitive of leave: We decided ___.',['to leave'],'Decide selects a to-infinitive, so both to and leave are required.'),
    error('Which correction fixes “She avoided to answer”?',['Change to answer to answering','Change avoided to avoids without other changes','Add was before avoided'],'Change to answer to answering','She avoided answering.','Avoid selects an -ing complement. Changing tense does not fix the complement; adding was creates an unsuitable passive here.'),
    order('to / decided / we / leave / early','We decided to leave early.','Decided takes the to-infinitive to leave; early modifies leaving.'),
    recognize('“He stopped to read the sign.” What is the role of to read?',['The activity he ended','The purpose of stopping','A passive action'],'The purpose of stopping','He paused another activity in order to read. Stopped reading would mean he ended reading; neither form is passive.'),
  ],
  conditionals:[
    choice('Use the ordinary first conditional: If it ___, we will stay inside.',['snows','will snow','snowing'],'snows','The if-clause uses present simple snows. Will snow is not the targeted ordinary prediction pattern; snowing lacks a finite auxiliary.'),
    blank('Use the third conditional: If I ___ known about the problem, I would have helped.',['had'],'The unreal past condition needs had + known. Have would not mark this past counterfactual condition.'),
    error('What corrects “If I had saw it, I would have called”?',['Change saw to seen','Change had to have','Change called to calling'],'Change saw to seen','If I had seen it, I would have called.','Past perfect needs the participle seen. Have and calling would break the third conditional pattern.'),
    order('had / I / more / time / if / would / I / read','If I had more time, I would read.','Here had is simple past of have, expressing an imagined present; would read gives the consequence. A comma is optional for scoring.'),
    recognize('“If I had charged it, I would have finished.” Which pattern is used?',['First conditional','Second conditional','Third conditional'],'Third conditional','Had + participle and would have + participle create a counterfactual past. First and second conditionals use different time/form patterns.'),
  ],
  reported:[
    choice('Report a past question using statement order: She asked where ___.',['did I live','I lived','do I live'],'I lived','An embedded reported question uses subject + verb, not did/do + subject inversion.'),
    blank('Use told or said: He ___ me that he was ready.',['told'],'Tell takes a person object directly. Say would need to before me.'),
    error('Which correction fixes “She asked where was I”?',['Use where I was','Use where am I','Use where did I was'],'Use where I was','She asked where I was.','Reported questions use statement order. Am I remains direct-question order; did cannot precede was.'),
    order('that / tired / he / was / said / Deniz','Deniz said that he was tired.','Deniz is the reporting subject; the embedded statement uses he + was.'),
    recognize('“He asked whether I had saved the file.” What does whether introduce?',['A reported yes/no question','A relative clause','A prohibition'],'A reported yes/no question','Whether embeds a yes/no question using statement order. It is not a relative pronoun or modal prohibition.'),
  ],
  inversion:[
    choice('Not only ___ she speak English, but she also speaks German.',['do','does','has','is'],'does','Present simple speak needs does before singular she in inversion. Do has wrong agreement; has/is cannot be followed by plain speak in this construction.'),
    blank('Complete the inverted past conditional: ___ I known, I would have acted differently.',['had'],'Had I known replaces If I had known. The past-perfect auxiliary moves before the subject.'),
    error('Identify the correction in “Rarely does she visits us”.',['Change visits to visit','Change does to do','Move us before she'],'Change visits to visit','Rarely does she visit us.','Does carries agreement and takes plain visit. Do has wrong agreement; moving the object does not fix the verb.'),
    order('heard / never / had / I / that / melody','Never had I heard that melody.','Fronted never triggers had + I + heard; heard remains a past participle.'),
    recognize('“Had I checked, I would have noticed.” Which structure is used?',['A direct present question','Third conditional with inversion','A present passive'],'Third conditional with inversion','Had I checked is an inverted unreal past condition, not a question. Would have noticed supplies its past consequence.'),
  ],
};
export const grammarExercises: GrammarExercise[] = [...Object.entries(questions).flatMap(([lessonId,items])=>items.map((q,index)=>({...q,lessonId,id:`${lessonId}-${index+1}`}))),...advancedExercises];
export const exercisesFor = (lessonId:string) => grammarExercises.filter(q=>q.lessonId===lessonId);
