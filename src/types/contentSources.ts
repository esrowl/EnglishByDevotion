export type SourceId = 'dictionaryapi' | 'tatoeba' | 'gutenberg' | 'wiktionary' | 'datamuse' | 'gutendex' | 'openlibrary';

export interface SourceCredit {
  source: SourceId;
  id?: string;
  url: string;
  author?: string;
  license?: string;
  licenseUrl?: string;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: { definition: string; example?: string; synonyms: string[]; antonyms: string[] }[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryData {
  word: string;
  meanings: DictionaryMeaning[];
  phonetics: { text?: string; audio?: string; credit?: SourceCredit }[];
  credits: SourceCredit[];
  retrievedAt: string;
  source?: 'dictionaryapi' | 'wiktionary';
}

export interface ContentCache {
  key: string;
  data: DictionaryData | import('./vocabulary').ExampleSentence[] | SentencePage | WordSuggestion[] | BookPage;
  retrievedAt: string;
}

export interface ReadingItem {
  id: string;
  title: string;
  author: string;
  text: string;
  difficulty: string;
  credit?: SourceCredit;
  rights: string;
  origin?: 'user_created' | 'imported_file';
  dateAdded?: string;
}

export interface SentencePage { sentences: import('./vocabulary').ExampleSentence[]; next?: string; }
export interface WordSuggestion { word: string; credit: SourceCredit; }
export interface BookPage { books: {id:number|string;title:string;authors:string;url:string;copyright:boolean|null;source?:'gutendex'|'openlibrary'}[]; next?:string; }
