import type {CEFRLevel} from './grammar';
import type {LanguageFeedback} from './lexical';
export const LEVELS:CEFRLevel[]=['A1','A2','B1','B2','C1','C2'];
export type AssessmentDomain='grammar'|'vocabulary'|'reading'|'usage'|'construction';
export const DOMAINS:AssessmentDomain[]=['grammar','vocabulary','reading','usage','construction'];
export interface PlacementQuestion {id:string;level:CEFRLevel;domain:AssessmentDomain;prompt:string;choices?:string[];answers:string[];explanation:string;focus:string;lessonIds:string[]}
export interface PlacementResponse {questionId:string;answer:string;correct:boolean;timestamp:string}
export interface GrammarPlacement {id:string;version:1;startedAt:string;completedAt?:string;responses:PlacementResponse[]}
export interface GrammarPreference {id:'grammar';preferredLevel:CEFRLevel;updatedAt:string;placementSkipped?:boolean}
export interface GrammarProduction {id:string;lessonId:string;answer:string;timestamp:string;feedback?:LanguageFeedback}
