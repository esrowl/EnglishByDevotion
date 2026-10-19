# EnglishByDevotion · Vocabulary Intelligence upgrade

Esra · 18 October 2026

## Outcome and actual status

This is an incremental update of `/Users/esra/Desktop/MyProjects/EnglishByDevotion`.
The application was not rebuilt. Navigation, retro visual identity, three fonts,
Reading uploads, Grammar lessons, Writing Notes, classic flashcards and existing
learning records remain in place. No package dependency, paid service, API key,
model runtime or model weights were added.

| Area | Implemented | Limit / additional setup |
| --- | --- | --- |
| Local dictionary | 15,808 real prepared Wiktionary headwords | Not all 31,239 NGSL words have a usable prepared entry |
| Turkish | 90 source-backed headwords / 167 translation senses, plus existing saved meanings | Full bilingual coverage is incomplete; missing senses are shown honestly |
| Dictionary display | Open by default and reset open for the next word; grouped POS/definitions/credits | Some source fields, examples or audio are unavailable |
| Lexical relationships | Source-listed derived/related terms, sense-specific synonyms/antonyms, existing families preserved | Not a complete etymological family analysis or POS/TR table for every related term |
| Usage patterns | Seven authored pattern sets plus existing personal collocations/examples | No automatic generation for every imported word |
| Selection | Offline, rank + richness + diversity + recent relationships + sustained performance | Difficulty is explicitly heuristic, not verified CEFR or validated learner proficiency |
| Practice | 36 curated activities across eight kinds; 31 objectively graded questions | Two construction and three translation tasks are saved ungraded without a configured model |
| Progress | Per-word/type history, correct/incorrect/drafts, recent errors, due/weak recommendations | Automatic production mastery certification / full five-stage proficiency model not implemented |
| Optional AI | Loopback-only Ollama adapter, source-separated translation fallback and nuanced feedback | No installed/running model; real inference quality not validated |
| Data portability | Additive v7 stores, full export/import/disk backup, old-client safeguards | Existing 64 MB file/request safeguards remain; very large backups can use JSON export |

## Architecture inspected before changes

- React 19, TypeScript, Vite, existing CSS/Tailwind and native SVG/canvas artwork.
- Dexie `LexoraDB` schema v6 before this update: vocabulary, review logs, sessions,
  settings, source cache, readings, grammar progress/attempts, NGSL pool/core,
  discovery encounters/preferences and recall attempts.
- Existing Wiktionary cache and explicit dictionary lookup; Tatoeba examples;
  separate NGSL rank lists; existing simplified SM-2 flashcard scheduling.
- Turkish fields were retained in stored records but omitted from the active UI.
- Discovery still required live definitions for randomly chosen uncached words.
- Personal Writing Notes were deliberately ungraded; no reliable open-ended grader
  or installed local inference engine was present.

## Data/source decisions

The detailed starter set was retrieved using real official Kaikki per-headword
JSONL download links. The broad layer was prepared by streaming the official small
Simple English Wiktionary gzip file and retaining NGSL matches with usable English
senses. Tagged unsuitable/obsolete/inflection-only senses were filtered. Third-party
quoted examples and audio were not redistributed as if their rights were identical
to dictionary definitions. Each entry retains source and download URLs and license.

Original NGSL ranks are unchanged. Before personal exclusions, the 13,007 eligible
non-core entries distribute as 2,030 / 4,162 / 4,835 / 1,980 across the four existing
rank bands. These counts are not CEFR assignments. Frequency controls are preserved.
Selection keeps a modest editorial lane for richer prepared teaching entries and
also explores the broad pool; recent same-POS/family sequences are downweighted.

Turkish translation-table glosses remain separate unless there is an exact sense
match. A translation from another sense is never used as the primary flashcard
answer for an unrelated English definition. New source-backed translations can fill
gaps without replacing previously translated senses. Existing personal meanings
and notes remain separate. AI fallback translations never replace dictionary data.

Source suitability, OMW/Marian evaluation, license links and setup commands are
documented in [LEXICAL_LEARNING.md](../LEXICAL_LEARNING.md). Attribution is supplied
beside the dataset in [ATTRIBUTION.md](../../public/datasets/lexical/ATTRIBUTION.md).
Adapted dictionary content remains CC BY-SA 4.0 with contributor/source links.
The parser's software license is not mistaken for the dictionary content license.

## Exercise validation and adaptive behavior

| Kind | Activities | Validation |
| --- | --- | --- |
| Meaning recognition | 6 | Authored choices and exact keys |
| Contextual gaps | 4 | Authored disambiguated context/choices |
| Word formation | 5 | Defined keys, including explicit valid alternatives |
| Semantic differences | 7 | Sense-sensitive authored choices and explanations |
| Collocations | 5 | Authored choices or tightly specified preposition keys |
| Error correction | 4 | Structured replacements / targeted form keys |
| Sentence construction | 2 | Saved ungraded; optional language feedback |
| Translation | 3 | Both directions; ungraded without optional model |

Choice order is shuffled. Typed objective answers normalize case, spacing,
apostrophes and terminal punctuation; free-form answers are not judged by those
rules. Every objective question includes an explanation and a sense target. Related
mistakes and due/weak activities influence recommendations. Repeated submissions
are idempotent. Same-day repetitions cannot stretch review intervals. Existing
vocabulary SM-2 schedules are kept independent from new practice-question schedules.

Optional feedback categories are incorrect, unnatural, contextually inappropriate,
minor style, acceptable and uncertain. Replies are marked AI-generated, cached and
saved separately. Failed/unconfigured inference leaves the original draft intact
and does not block deterministic study. AI comments never count as verified mastery.

## Storage safety

Schema v7 adds `lexicon` and `lexicalAttempts`; existing stores, primary keys and
relationships are retained. Vocabulary enrichment adds only missing lexical fields.
New stores and AI metadata are included in portable JSON and local disk backups.
Import validates nested records and rolls back atomically on invalid data. Old
clients cannot overwrite newer backups while omitting lexical, grammar or discovery
records. Source-cache clearing does not clear prepared lexical data or progress.

No personal browser profile was used for testing. Test servers used temporary backup
directories. Existing application/user backup files were not reset or deleted.

## Files created or modified

Types and data:

- `src/types/lexical.ts` (new), `src/types/vocabulary.ts`
- `src/data/lexicalPractice.ts` (new)
- `public/datasets/lexical/english-turkish.json` (new; 23,113,135 bytes)
- `public/datasets/lexical/ATTRIBUTION.md` (new)

Services:

- `src/services/kaikkiAdapter.ts` (new)
- `src/services/lexicalService.ts` (new)
- `src/services/lexicalValidation.ts` (new)
- `src/services/lexicalPractice.ts` (new)
- `src/services/vocabularyIntelligence.ts` (new)
- `src/services/languageFeedback.ts` (new)
- `src/services/db.ts`
- `src/services/advancedDiscovery.ts`
- `src/services/dictionaryService.ts`
- `src/services/discoveryService.ts`

Existing UI integration:

- `src/App.tsx`
- `src/components/daily/OpenEndedLearningView.tsx`
- `src/components/flashcards/FlashcardView.tsx`
- `src/components/flashcards/LexicalPracticeView.tsx` (new)
- `src/components/library/LexicalContent.tsx` (new)
- `src/components/library/LexicalTools.tsx` (new)
- `src/components/library/DictionaryContent.tsx`
- `src/components/library/DictionaryLookup.tsx`
- `src/components/library/LibraryView.tsx`
- `src/components/library/VocabularyDetailModal.tsx`

Preparation/server/tools/documentation:

- `scripts/prepare-lexicon.mjs` (new)
- `scripts/extend-simple-lexicon.mjs` (new)
- `scripts/server/languageFeedback.mjs` (new)
- `scripts/server/localServer.mjs`
- `package.json` (three useful scripts only; no dependency change)
- `README.md`, `docs/LEXICAL_LEARNING.md` (new technical guide)
- New tests: `tests/lexical-upgrade.cjs`, `tests/language-feedback.mjs`
- Updated regression tests: `tests/advanced-discovery.cjs`, `tests/grammar.cjs`,
  `tests/reading-polish.cjs`, `tests/reading-inspector.cjs`, `tests/regression.cjs`,
  `tests/workflows.cjs`, `tests/local-persistence.cjs`

Generated build, test JSON and rendered screenshots were refreshed. Palette tokens,
font files, CSS identity, grammar teaching content and answer keys were not changed.

## Tests actually executed

Headless Microsoft Edge, disposable browser contexts, isolated local servers:

| Suite | Passed |
| --- | --- |
| New lexical upgrade | 27 / 27 |
| Optional model protocol/error fixtures | 13 / 13 |
| NGSL discovery | 15 / 15 |
| Grammar | 37 / 37 |
| Regression | 9 / 9 |
| API edge cases | 24 / 24 |
| Existing application workflows | 35 / 35 |
| Reading inspector | 13 / 13 |
| Reading/PDF polish | 29 / 29 |
| Local persistence | 19 / 19 |

**221 checks passed.** Separately, font validation passed for all twelve tested
Turkish characters across Pixelify Sans, Handjet and VT323. `npm run build` and
`npm run lint` completed successfully; final lint produced no warnings.

The new suite explicitly disables external HTTP, performs 30 consecutive distinct
discoveries, verifies original ranks/core exclusion/feedback, and also runs discovery
with the browser actually offline. It checks sense alignment, no overwrites, valid
answer alternatives, ungraded free-form alternatives, atomic imports, repeated
submission safety, portable restore, open-by-default sections, missing-model behavior
and 1440px/390px layouts. Existing Reading tests loaded real Tatoeba examples and an
official PDF.js sample, and preserved upload/import/export workflows.

The optional model suite uses a **protocol fixture**, not a real model. No claim is
made about multilingual model accuracy or a live end-to-end AI grading test.

Testing caught a final-card queue race: completion previously reopened the queue
before refreshed due counts arrived. Refresh now completes before the completion
callback. Two timing-based tests now wait for actual rendered headings instead of
assuming a 150–300 ms delay is always sufficient with first-use dictionary loading.
The old-client backup tests isolate each store omission rather than relying on
which safeguard happens to reject a multi-store omission first.

Rendered UI was inspected, including real alleviate → azaltmak / dindirmek /
hafifletmek source-linked meanings. Screenshots are in
`docs/screenshots/lexical-upgrade-2026-10-18/`: desktop/mobile study and practice,
plus `turkish-senses-desktop.png`. No horizontal overflow or new uncaught browser
errors were observed in the tested screens.

## Remaining work, not claimed complete

- Expand reliable Turkish coverage beyond 90 dictionary headwords. Not every English
  entry has an available Turkish translation, and models are not silently enabled.
- Select/configure a multilingual local model and validate real sentence/translation
  quality before trusting its fallible feedback. No paid provider is configured.
- Broader validated exercises per imported word, complete family POS/TR tables,
  advanced familiar-word sense targeting and validated production mastery remain
  future work, not hidden placeholders advertised as complete features.
- First-use import and full backups carry the real cost of a ~22 MiB local dataset.
  Subsequent selections reuse cached metadata. This is not a full offline PWA claim.
