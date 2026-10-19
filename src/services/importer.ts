import {
  VocabularyItem,
  PartOfSpeech,
  CEFRLevel,
} from '../types/vocabulary';
import { createInitialSRSState } from './srs';
import { getAllVocabulary } from './db';

export interface ParsedImportItem {
  id: string;
  item: VocabularyItem;
  isDuplicate: boolean;
  warnings: string[];
  rawText?: string;
}

export interface ImportPreviewResult {
  items: ParsedImportItem[];
  totalParsed: number;
  duplicateCount: number;
  warningCount: number;
  format: 'json' | 'csv' | 'markdown' | 'txt' | 'unknown';
  error?: string;
}

function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

function generateId(): string {
  return 'vocab-' + Date.now() + '-' + Math.random().toString(36).substr(2, 7);
}

function createDefaultVocabularyItem(partial: Partial<VocabularyItem>): VocabularyItem {
  const word = partial.word?.trim();
  if (!word) throw new Error('Every imported record must contain a word.');
  return {
    ...partial,
    id: partial.id || generateId(),
    word,
    normalizedHeadword: normalizeWord(word),
    partOfSpeech: partial.partOfSpeech || 'other',
    cefrLevel: partial.cefrLevel || 'Unspecified',
    ipa: partial.ipa?.trim() || undefined,
    turkishMeaning: partial.turkishMeaning?.trim() || '',
    englishDefinition: partial.englishDefinition?.trim() || '',
    examples: partial.examples || [],
    collocations: partial.collocations || [],
    synonyms: partial.synonyms || [],
    antonyms: partial.antonyms || [],
    wordFamily: partial.wordFamily || undefined,
    grammaticalPatterns: partial.grammaticalPatterns || [],
    registerUsageNotes: partial.registerUsageNotes?.trim() || undefined,
    commonMistakes: partial.commonMistakes?.trim() || undefined,
    topicCategories: partial.topicCategories && partial.topicCategories.length > 0
      ? partial.topicCategories
      : ['General'],
    provenance: partial.provenance || {
      sourceType: 'imported_file',
      sourceName: 'User Imported File',
      attribution: 'Imported by user',
      isVerified: false,
    },
    personalNotes: partial.personalNotes?.trim() || undefined,
    isFavorite: partial.isFavorite ?? false,
    isDifficult: partial.isDifficult ?? false,
    learningStatus: partial.learningStatus || 'new',
    dateAdded: partial.dateAdded || new Date().toISOString(),
    srs: partial.srs || createInitialSRSState(),
  };
}

// ==================== JSON PARSER ====================

export function parseJSON(content: string, fileName?: string): VocabularyItem[] {
  const data = JSON.parse(content);
  let rawList: any[] = [];

  if (Array.isArray(data)) {
    rawList = data;
  } else if (data?.vocabulary && Array.isArray(data.vocabulary)) {
    rawList = data.vocabulary;
  } else if (data?.data?.vocabulary && Array.isArray(data.data.vocabulary)) {
    rawList = data.data.vocabulary;
  } else if (typeof data === 'object' && data !== null) {
    // Single item
    rawList = [data];
  }

  return rawList.map((raw) => {
    if (!raw || typeof (raw.word || raw.headword || raw.term) !== 'string') throw new Error('Invalid vocabulary record.');
    // Handle string arrays or object arrays for examples/collocations/synonyms
    const examples = Array.isArray(raw.examples)
      ? raw.examples.map((ex: any, idx: number) => {
          if (typeof ex === 'string') {
            return { id: `ex-${idx}`, sentence: ex };
          }
          return {
            ...ex,
            id: ex.id || `ex-${idx}`,
            sentence: ex.sentence || '',
            translation: ex.translation,
            highlightedTarget: ex.highlightedTarget || raw.word,
          };
        })
      : [];

    const collocations = Array.isArray(raw.collocations)
      ? raw.collocations.map((col: any) => {
          if (typeof col === 'string') {
            return { collocation: col };
          }
          return {
            collocation: col.collocation || '',
            meaningTr: col.meaningTr,
            example: col.example,
          };
        })
      : [];

    const synonyms = Array.isArray(raw.synonyms)
      ? raw.synonyms.map((syn: any) => {
          if (typeof syn === 'string') return { word: syn };
          return { word: syn.word || syn.name || '', nuance: syn.nuance };
        })
      : [];

    const antonyms = Array.isArray(raw.antonyms)
      ? raw.antonyms.map((ant: any) => {
          if (typeof ant === 'string') return { word: ant };
          return { word: ant.word || ant.name || '', nuance: ant.nuance };
        })
      : [];

    return createDefaultVocabularyItem({
      ...raw,
      word: raw.word || raw.headword || raw.term,
      turkishMeaning: raw.turkishMeaning || raw.meaningTr || raw.turkish || raw.meaning || '',
      englishDefinition: raw.englishDefinition || raw.definition || raw.definitionEn || '',
      examples,
      collocations,
      synonyms,
      antonyms,
      topicCategories: Array.isArray(raw.topicCategories)
        ? raw.topicCategories
        : raw.category ? [raw.category] : ['Imported'],
      provenance: raw.provenance || {
        sourceType: 'imported_file',
        sourceName: fileName || 'Imported JSON File',
        attribution: 'User file import',
        isVerified: false,
      },
    });
  });
}

// ==================== CSV PARSER ====================

export function parseCSV(content: string, fileName?: string): VocabularyItem[] {
  const firstLine = content.split(/\r?\n/)[0];
  const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false;
  content = content.replace(/^\uFEFF/, '');
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      if (quoted && content[i+1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && char === delimiter) { row.push(field); field = ''; }
    else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && content[i+1] === '\n') i++;
      row.push(field); if (row.some(v => v.trim())) rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(field); if (row.some(v => v.trim())) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase());

  // Header mapping helpers
  const findIndex = (aliases: string[]) =>
    headers.findIndex((h) => aliases.some((a) => h === a || h === `${a}s`));

  const wordIdx = findIndex(['word', 'term', 'headword', 'kelime']);
  const trMeaningIdx = findIndex(['turkishmeaning', 'turkish', 'meaningtr', 'meaning_tr', 'anlam', 'turkce', 'translation']);
  const enDefIdx = findIndex(['definition', 'def', 'englishdefinition', 'meaning_en', 'aciklama']);
  const posIdx = findIndex(['pos', 'partofspeech', 'part_of_speech', 'tur']);
  const cefrIdx = findIndex(['cefr', 'level', 'seviye']);
  const ipaIdx = findIndex(['ipa', 'pronunciation', 'telaffuz']);
  const exIdx = findIndex(['example', 'ornek', 'sentence']);
  const colIdx = findIndex(['collocation', 'collocations', 'esdizim']);
  const synIdx = findIndex(['synonym', 'synonyms', 'esanlam']);
  const antIdx = findIndex(['antonym', 'antonyms', 'zitanlam']);
  const topicIdx = findIndex(['topiccategories', 'topic', 'category', 'kategori']);

  const items: VocabularyItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    // Basic CSV line splitter considering quotes
    const rawTokens = rows[i];
    if (wordIdx === -1 || !rawTokens[wordIdx]) continue;

    const word = rawTokens[wordIdx];
    const trMeaning = trMeaningIdx !== -1 ? rawTokens[trMeaningIdx] || '' : '';
    const enDef = enDefIdx !== -1 ? rawTokens[enDefIdx] || '' : '';
    const pos = (posIdx !== -1 ? rawTokens[posIdx]?.toLowerCase() : 'other') as PartOfSpeech;
    const cefr = (cefrIdx !== -1 ? rawTokens[cefrIdx]?.toUpperCase() : 'Unspecified') as CEFRLevel;
    const ipa = ipaIdx !== -1 ? rawTokens[ipaIdx] : undefined;

    const examples = exIdx !== -1 && rawTokens[exIdx]
      ? rawTokens[exIdx].split('|').map((sentence, index) => ({id: `ex-${index}`, sentence: sentence.trim()}))
      : [];

    const collocations = colIdx !== -1 && rawTokens[colIdx]
      ? rawTokens[colIdx].split('|').map((c) => ({ collocation: c.trim() }))
      : [];

    const synonyms = synIdx !== -1 && rawTokens[synIdx]
      ? rawTokens[synIdx].split('|').map((s) => ({ word: s.trim() }))
      : [];

    const antonyms = antIdx !== -1 && rawTokens[antIdx]
      ? rawTokens[antIdx].split('|').map((a) => ({ word: a.trim() }))
      : [];

    const topics = topicIdx !== -1 && rawTokens[topicIdx]
      ? rawTokens[topicIdx].split('|').map((t) => t.trim())
      : ['Imported CSV'];

    items.push(
      createDefaultVocabularyItem({
        word,
        turkishMeaning: trMeaning,
        englishDefinition: enDef,
        partOfSpeech: pos,
        cefrLevel: cefr,
        ipa,
        examples,
        collocations,
        synonyms,
        antonyms,
        topicCategories: topics,
        provenance: {
          sourceType: 'imported_file',
          sourceName: fileName || 'Imported CSV File',
          attribution: 'User CSV import',
          isVerified: false,
        },
      })
    );
  }

  return items;
}

// ==================== MARKDOWN / TEXT PARSER ====================

export function parseMarkdownOrText(content: string, fileName?: string): VocabularyItem[] {
  const items: VocabularyItem[] = [];
  const lines = content.split(/\r?\n/);

  // Strategy 1: Section-based parsing (## Word or ### Word)
  const sectionRegex = /^#{1,4}\s+(.+)$/;
  let currentItem: Partial<VocabularyItem> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const matchSection = line.match(sectionRegex);
    if (matchSection) {
      if (currentItem && currentItem.word) {
        items.push(createDefaultVocabularyItem(currentItem));
      }
      const rawWord = matchSection[1].replace(/[*_`]/g, '').trim();
      currentItem = {
        word: rawWord,
        examples: [],
        collocations: [],
        synonyms: [],
        antonyms: [],
        topicCategories: ['AI Study Notes'],
        provenance: {
          sourceType: 'imported_file',
          sourceName: fileName || 'Imported Markdown/Text',
          attribution: 'Imported Study Notes',
          isVerified: false,
        },
      };
      continue;
    }

    if (currentItem) {
      const lowerLine = line.toLowerCase();

      // Meaning / Definition
      if (lowerLine.startsWith('- turkish:') || lowerLine.startsWith('- anlam:') || lowerLine.startsWith('- meaning:')) {
        currentItem.turkishMeaning = line.split(':')[1]?.trim() || '';
      } else if (lowerLine.startsWith('- definition:') || lowerLine.startsWith('- english:') || lowerLine.startsWith('- def:')) {
        currentItem.englishDefinition = line.split(':')[1]?.trim() || '';
      } else if (lowerLine.startsWith('- pos:') || lowerLine.startsWith('- part of speech:')) {
        currentItem.partOfSpeech = line.split(':')[1]?.trim().toLowerCase() as PartOfSpeech;
      } else if (lowerLine.startsWith('- cefr:') || lowerLine.startsWith('- level:')) {
        currentItem.cefrLevel = line.split(':')[1]?.trim().toUpperCase() as CEFRLevel;
      } else if (lowerLine.startsWith('- ipa:')) {
        currentItem.ipa = line.split(':')[1]?.trim();
      } else if (lowerLine.startsWith('- example:') || lowerLine.startsWith('- ornek:') || lowerLine.startsWith('example:')) {
        const text = line.replace(/^[-*\s]*(example|ornek):\s*/i, '').trim();
        if (text) {
          currentItem.examples?.push({ id: `ex-${currentItem.examples.length}`, sentence: text });
        }
      } else if (lowerLine.startsWith('- collocations:') || lowerLine.startsWith('- esdizim:')) {
        const text = line.replace(/^[-*\s]*(collocations|esdizim):\s*/i, '').trim();
        const parts = text.split(/[,;|]/).map((p) => p.trim()).filter(Boolean);
        parts.forEach((p) => currentItem?.collocations?.push({ collocation: p }));
      } else if (lowerLine.startsWith('- synonyms:') || lowerLine.startsWith('- esanlam:')) {
        const text = line.replace(/^[-*\s]*(synonyms|esanlam):\s*/i, '').trim();
        const parts = text.split(/[,;|]/).map((p) => p.trim()).filter(Boolean);
        parts.forEach((p) => currentItem?.synonyms?.push({ word: p }));
      } else if (lowerLine.startsWith('- antonyms:') || lowerLine.startsWith('- zitanlam:')) {
        const text = line.replace(/^[-*\s]*(antonyms|zitanlam):\s*/i, '').trim();
        const parts = text.split(/[,;|]/).map((p) => p.trim()).filter(Boolean);
        parts.forEach((p) => currentItem?.antonyms?.push({ word: p }));
      }
    } else {
      // Strategy 2: Line-by-line bullet parsing: "**ubiquitous** - her yerde bulunan - present everywhere"
      // or "ephemeral : gelip geçici : short-lived"
      const bulletMatch = line.match(/^[-*•]?\s*\*{0,2}([a-zA-Z\s'-]+)\*{0,2}\s*[:—–-]\s*([^:—–-]+)(?:[:—–-](.*))?$/);
      if (bulletMatch) {
        const word = bulletMatch[1].trim();
        const tr = bulletMatch[2].trim();
        const en = bulletMatch[3]?.trim() || '';
        items.push(
          createDefaultVocabularyItem({
            word,
            turkishMeaning: tr,
            englishDefinition: en,
            topicCategories: ['Text Notes'],
            provenance: {
              sourceType: 'imported_file',
              sourceName: fileName || 'Imported Text List',
              attribution: 'User text import',
              isVerified: false,
            },
          })
        );
      }
    }
  }

  // Push final item if pending
  if (currentItem && currentItem.word) {
    items.push(createDefaultVocabularyItem(currentItem));
  }

  return items;
}

// ==================== MAIN PREVIEW WORKFLOW ====================

export async function processFileForImport(
  fileContent: string,
  fileName: string
): Promise<ImportPreviewResult> {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  let format: ImportPreviewResult['format'] = 'unknown';
  let rawItems: VocabularyItem[] = [];

  try {
    if (ext === 'json' || fileContent.trim().startsWith('[') || fileContent.trim().startsWith('{')) {
      format = 'json';
      rawItems = parseJSON(fileContent, fileName);
    } else if (ext === 'csv') {
      format = 'csv';
      rawItems = parseCSV(fileContent, fileName);
    } else if (ext === 'md' || ext === 'markdown') {
      format = 'markdown';
      rawItems = parseMarkdownOrText(fileContent, fileName);
    } else {
      format = 'txt';
      rawItems = parseMarkdownOrText(fileContent, fileName);
    }
  } catch (err: any) {
    return {
      items: [],
      totalParsed: 0,
      duplicateCount: 0,
      warningCount: 0,
      format,
      error: `Parse error: ${err.message || 'Invalid file format'}`,
    };
  }

  if (rawItems.length === 0) {
    return {
      items: [],
      totalParsed: 0,
      duplicateCount: 0,
      warningCount: 0,
      format,
      error: 'No valid vocabulary items could be extracted from this file. Check the format preview.',
    };
  }

  // Retrieve existing vocabulary to detect duplicates
  const existing = await getAllVocabulary();
  const existingWordSet = new Set(existing.map((w) => w.normalizedHeadword));

  let duplicateCount = 0;
  let warningCount = 0;

  const parsedItems: ParsedImportItem[] = rawItems.map((item) => {
    const warnings: string[] = [];
    const isDuplicate = existingWordSet.has(item.normalizedHeadword);
    existingWordSet.add(item.normalizedHeadword);

    if (isDuplicate) {
      duplicateCount += 1;
      warnings.push(`"${item.word}" already exists in your library.`);
    }

    if (!item.turkishMeaning && !item.englishDefinition) {
      warnings.push('Missing both Turkish meaning and English definition.');
      warningCount += 1;
    }

    if (!item.examples || item.examples.length === 0) {
      warnings.push('No example sentences provided.');
    }

    return {
      id: item.id,
      item,
      isDuplicate,
      warnings,
    };
  });

  return {
    items: parsedItems,
    totalParsed: parsedItems.length,
    duplicateCount,
    warningCount,
    format,
  };
}

// ==================== CSV EXPORTER ====================

export function exportVocabularyToCSV(items: VocabularyItem[]): string {
  const headers = [
    'Word',
    'PartOfSpeech',
    'CEFR',
    'IPA',
    'TurkishMeaning',
    'EnglishDefinition',
    'Examples',
    'Collocations',
    'Synonyms',
    'Antonyms',
    'TopicCategories',
    'LearningStatus',
    'ProvenanceType',
    'SourceName',
  ];

  const rows = items.map((item) => {
    const escape = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;
    const exStr = item.examples.map((e) => e.sentence).join(' | ');
    const colStr = item.collocations.map((c) => c.collocation).join(' | ');
    const synStr = item.synonyms.map((s) => s.word).join(' | ');
    const antStr = item.antonyms.map((a) => a.word).join(' | ');
    const topicStr = item.topicCategories.join(' | ');

    return [
      escape(item.word),
      escape(item.partOfSpeech),
      escape(item.cefrLevel),
      escape(item.ipa),
      escape(item.turkishMeaning),
      escape(item.englishDefinition),
      escape(exStr),
      escape(colStr),
      escape(synStr),
      escape(antStr),
      escape(topicStr),
      escape(item.learningStatus),
      escape(item.provenance.sourceType),
      escape(item.provenance.sourceName),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
