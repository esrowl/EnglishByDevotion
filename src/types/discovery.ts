export interface DiscoveryWord { key:string; word:string; rank:number; coreRank?:number; unusable?:boolean; unusableProviders?:('dictionaryapi'|'wiktionary')[]; }
export type DiscoveryFeedback = 'familiar' | 'learning' | 'skipped';
export interface DiscoveryEncounter { word:string; rank:number; seenAt:string; feedback?:DiscoveryFeedback; feedbackAt?:string; vocabularyId?:string; }
export interface DiscoveryPreferences { id:'discovery'; preference:'balanced'|'gentler'|'rarer'; provider?:'dictionaryapi'|'wiktionary'; adaptiveLevel:number; evaluatedAttempts:number; }
export interface RecallAttempt { id:string; vocabularyId:string; timestamp:string; correct:boolean; }
export const validEncounter=(v:DiscoveryEncounter)=>!!v&&typeof v.word==='string'&&/^[a-z]+(?:[ '-][a-z]+)*$/.test(v.word)&&Number.isInteger(v.rank)&&v.rank>0&&v.rank<=31239&&typeof v.seenAt==='string'&&Number.isFinite(Date.parse(v.seenAt))&&(!v.feedback||['familiar','learning','skipped'].includes(v.feedback));
export const validDiscoveryPreferences=(v:DiscoveryPreferences)=>!!v&&v.id==='discovery'&&['balanced','gentler','rarer'].includes(v.preference)&&(!v.provider||['dictionaryapi','wiktionary'].includes(v.provider))&&Number.isInteger(v.adaptiveLevel)&&Math.abs(v.adaptiveLevel)<=2&&Number.isInteger(v.evaluatedAttempts)&&v.evaluatedAttempts>=0;
export const validRecallAttempt=(v:RecallAttempt)=>!!v&&typeof v.id==='string'&&typeof v.vocabularyId==='string'&&typeof v.correct==='boolean'&&typeof v.timestamp==='string'&&Number.isFinite(Date.parse(v.timestamp));
