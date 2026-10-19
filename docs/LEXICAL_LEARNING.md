# Vocabulary Intelligence & Adaptive Learning

EnglishByDevotion · Esra · 18 October 2026

## Architecture

The existing React 19 / TypeScript / Vite / Dexie application is retained. Fonts,
colors, navigation, Reading, Grammar, Writing Notes and six classic flashcard modes
are preserved. No new dependency or model installation is required for normal study.

Database `LexoraDB` keeps its original name and all existing stores. Additive schema
version 7 introduces:

| Store | Key | Purpose |
| --- | --- | --- |
| lexicon | word | Prepared dictionary entries, senses, provenance and links |
| lexicalAttempts | id | Objective answers, ungraded drafts, review intervals, optional AI feedback |

Existing vocabulary may gain an optional `lexicalData` field; only missing lexical
coverage is enriched. Personal definitions, Turkish meanings, notes, IDs, settings
and existing SM-2 schedules are not rewritten. `aiTranslations`, if explicitly
prepared, remain separate from verified/source-backed lexical fields.

Full JSON export, portable import, automatic disk backup and cross-browser restore
include both new stores. Older v1–v6 backups remain importable. Invalid lexical
records roll back the entire import transaction. Old clients omitting lexical
stores are rejected when saving over a newer disk backup.

## Sources and suitability

1. **Kaikki / English Wiktionary**: selected official per-headword JSONL downloads,
   preserving translation-table glosses, parts of speech, IPA, source-listed derived
   terms and contextual synonyms/antonyms. Translation-table glosses are not blindly
   matched to numbered dictionary definitions. Source-backed means community-sourced,
   not independently verified.
2. **Kaikki / Simple English Wiktionary**: the official small gzip JSONL download
   supplies broader English definitions matched to the original NGSL word list.
   A simpler definition is not an elementary-word label; NGSL core exclusion still
   applies. No claims of B2/C2 certification are made.
3. **Open Multilingual WordNet** was investigated; the public OMW v1 inventory did
   not supply an obvious supported Turkish package for this integration. No guessed
   English-to-Turkish synset mappings were introduced.
4. **Helsinki-NLP opus-mt-tc-big-en-tr** was evaluated: its official model repository
   lists a 470 MB PyTorch weight file plus tokenizer/runtime requirements. This is
   not bundled into a browser application merely for missing translations.
5. **Optional local Ollama** provides an opt-in fallback protocol for translations
   and free-form feedback. No model is installed or downloaded by this project.

Primary references:

- [Kaikki downloads and extraction metadata](https://kaikki.org/dictionary/rawdata.html)
- [Wiktextract documented fields](https://github.com/tatuylonen/wiktextract)
- [OMW v1 inventory](https://omwn.org/omw1.html)
- [Marian model files and license](https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-tr/tree/main)
- [Ollama documented chat endpoint](https://docs.ollama.com/api/chat)
- [Dictionary attribution and CC BY-SA terms](../public/datasets/lexical/ATTRIBUTION.md)

## Actual bundled coverage

- 31,239 original NGSL extended ranks and 2,809 core entries remain unchanged.
- 15,808 locally prepared dictionary headwords.
- 13,007 meet the strict non-core/rank discovery filter before personal exclusions.
- 90 headwords have source-linked Turkish translations, covering 167 translation
  senses. Existing personal/imported Turkish meanings are also shown, separately.
- Source-backed Turkish coverage is **not** claimed for all 15,808 or 31,239 words.
- Some original definitions have no exact Turkish sense match. Those translations
  appear under their own gloss, not as an answer to a different English definition.
- 55 source-listed contextual synonym/antonym groups in the detailed starter subset;
  further sense-level relationships appear where supplied by the broader data.

## Study and selection

Ordinary discovery and practice make no external dictionary/model requests. Initial
preparation loads a local JSON asset into IndexedDB. Cached entries and rank metadata
are reused rather than decoding the full dictionary on every Next Word action.
On subsequent starts, an installed complete local pack requires no fetch to reload it.

Balanced / More Frequent / Less Frequent remain. Rank-band heuristics are combined
with source richness, part-of-speech diversity, recent family separation and an
explicitly estimated study-complexity score. A 25% editorial lane gives the richer
prepared teaching subset a chance rather than letting it disappear inside the raw
list; remaining selections explore the broader pool. This is not a CEFR estimator.

Adaptive level changes require at least 20 additional objective attempts, evidence
from at least three study dates, and review evidence or diverse contextual practice.
Claimed familiarity, AI feedback and ungraded writing are not counted as objective
successes. New-word mode still excludes encountered and personally saved words.
Already Know / Learn This Word / Next Word keep their distinct meanings.

No daily/ten-word quota exists. The available offline pool is finite; missing words
require additional prepared dictionary data, not a fabricated definition or silent
live request. Explicit dictionary searches and explicit Tatoeba loading may still
use the existing network adapters. This is not a claim that every application asset
is installed as an offline PWA.

## Exercises and progress

Open **Flashcard Drill → Context & Usage Practice**, also available through the
Continuous Study flashcard sub-mode. Classic modes are still available.

There are 36 original curated activities across eight skills:

- Meaning recognition, contextual gaps, word formation, semantic distinctions,
  collocations and structured error correction: deterministic, versioned answer keys.
- Sentence construction and bidirectional translation: saved as ungraded production;
  optional local AI can provide nuanced feedback, never exact-match grading.

No arbitrary source sentence is turned into an automatically graded question.
Distractor choices are shuffled. Typed objective answers tolerate case, whitespace,
curly apostrophes and terminal punctuation; alternatives are explicitly authored.
Every graded answer has a sense target and explanation. The activity title/menu does
not reveal the expected cloze/formation answer.

Attempts track word, exercise kind, response, objective correctness or ungraded state,
date, explanation and next review date. Due/weak questions and semantic confusions
receive greater recommendation weight. Repeated same-day success cannot stretch a
question's schedule. Existing vocabulary SM-2 history is independent and preserved.

Recognition / Understanding / Application are derived from demonstrated objective
skills. Production drafts and model comments are recorded separately. Automatic
production mastery certification and a fully validated five-stage mastery model
are **not implemented**; the UI does not pretend otherwise. The curated practice
pool is not a generated full-course exercise set for every imported vocabulary item.

## Preparing or extending data

From the project directory, with Node's native TypeScript stripping supported:

```sh
npm run prepare:lexicon
```

This explicitly fetches the detailed 130-headword starter set through official
download links, not during study. It preserves previously prepared broader coverage.
For an already downloaded official English JSONL dump:

```sh
npm run prepare:lexicon -- /absolute/path/to/english-data.jsonl
```

For the official Simple English gzip file linked from Kaikki's downloads page:

```sh
node scripts/extend-simple-lexicon.mjs /absolute/path/to/simple-extract.jsonl.gz
```

The generated `public/datasets/lexical/english-turkish.json` can be imported through
**Continuous Study → Local vocabulary data & enrichment → Import prepared lexical
JSON**. Imports add new headwords and fill missing sense-linked Turkish translations;
existing translated senses are retained. The asset is around 22 MB minified, kept
outside the JS bundle. First-use import and full backups therefore cost some time
and disk space. Packs larger than 64 MB need to be split before browser import;
this is a file-safety limit, not a study quota. Full disk backups also retain the
existing 64 MB request safeguard; full JSON export remains an alternative.

## Optional AI setup

No Ollama runtime/model was found or installed during this update. Select and install
a suitable English/Turkish model separately, test its quality, then start the existing
app with an explicit model name:

```sh
EBD_OLLAMA_MODEL=your-installed-model npm run dev
```

The default endpoint is `http://127.0.0.1:11434`. An optional `EBD_OLLAMA_URL` must also
be a loopback HTTP origin. Remote URLs and credentials in URLs are rejected. The
frontend talks only to authenticated same-origin `/__local/` routes; no API key is
embedded in the client. Model calls are explicit, time-bounded, non-streaming and
request unloading after use. Malformed feedback is rejected. Reusable replies are
cached; saved drafts/feedback and generated translations remain in IndexedDB/exports.

Use **Prepare one missing Turkish meaning · optional local AI** in the enrichment
panel for one missing saved-word translation at a time. Nothing runs continuously
in the background. Existing dictionary translations and personal meanings are not
replaced. Open-ended feedback distinguishes incorrect / unnatural / contextually
inappropriate / minor style / acceptable / uncertain; all comments remain labeled
AI-generated and fallible. Actual model quality and end-to-end live inference still
require setup and validation. Protocol-fixture tests are not model-quality tests.

## Important files

- `src/types/lexical.ts`: dictionary senses, questions, attempts and feedback contracts.
- `src/services/kaikkiAdapter.ts`: conservative source normalization and validation.
- `src/services/lexicalService.ts`: local packs and non-destructive enrichment.
- `src/services/vocabularyIntelligence.ts`: selection scoring and evidence summaries.
- `src/services/lexicalPractice.ts`: grading, review scheduling and recommendations.
- `src/data/lexicalPractice.ts`: original teaching content and explicit answer keys.
- `src/components/library/LexicalContent.tsx`: open-by-default sense display.
- `src/components/library/LexicalTools.tsx`: explicit preparation/import controls.
- `src/components/flashcards/LexicalPracticeView.tsx`: new practice inside existing UI.
- `scripts/server/languageFeedback.mjs`: optional loopback-only model adapter.
- `src/services/db.ts`: additive migration and full portability.

See the dated implementation report in `docs/reports/` for executed tests and limits.
