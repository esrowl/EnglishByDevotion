# Advanced Grammar and placement

EnglishByDevotion · Esra · 18 October 2026

## Using the feature

Open **Grammar**. The initial pathway shows B2–C1, not beginner lessons.
Change **Preferred learning level** whenever you want, or use **All levels**
to explore the complete A1–C2 library. Category and reading-progress filters
can be combined. **Review weak topics** searches across levels, while respecting
the other category/progress filters.

The optional placement assessment has 20 questions. Every answer is committed
immediately to IndexedDB. Hide or skip it without losing your place, resume after
a refresh, and retake after completing it. Applying a result to your preference
is an explicit action; a test never locks lessons or resets previous study.

Read a lesson through Learn, Understand, Observe, Common mistakes, Practice,
Summary and Review. Understand includes comparisons where the new curriculum
adds them. Original lessons retain their existing content and IDs. Practice
includes an exercise-focus selector so a learner can go directly to controlled
production rather than repeat recognition. A partial focused session does not
count as a completed session for mastery.

## Curriculum and source policy

There are **36 lessons**, including all 13 original lessons, and **122 objective
questions**, including all 65 original questions. The 23 additional lessons are:

| Pathway | Lesson | Module |
| --- | --- | --- |
| A1 | Clauses, pronouns and basic word order | Foundations |
| A2 | Time, place and countability | Foundations |
| B2 | Present and past perfect: result versus duration | Tenses & aspect |
| B2 | Future perfect and future perfect continuous | Tenses & aspect |
| B2 | Narrative tenses, temporary states and tense consistency | Tenses & aspect |
| C1 | Mixed, inverted and implied conditionals | Conditionals |
| B2 | Unless, provided that, supposing and as long as | Conditionals |
| B2 | Wish, if only, would rather and it is time | Conditionals |
| B2 | Deduction, past modals and degrees of necessity | Modals & deduction |
| C1 | Clefts, pseudo-clefts, fronting and information focus | Sentence structures |
| C1 | Ellipsis, substitution and parallel structure | Sentence structures |
| C1 | Advanced relatives, reduced clauses and participles | Sentence structures |
| B2 | Nominal clauses and embedded questions | Sentence structures |
| C1 | Perfect infinitives, gerunds and verb complementation | Verb patterns |
| B2 | Reporting verbs and causative structures | Verb patterns |
| C1 | Passive reporting and complex passive constructions | Verb patterns |
| B2 | Concession, contrast and conditional concession | Cohesion & academic English |
| B2 | Cause, effect, discourse markers and cohesive reference | Cohesion & academic English |
| C1 | Hedging, register and impersonal academic language | Cohesion & academic English |
| C1 | Nominalisation and information structure | Cohesion & academic English |
| C1 | Academic argument, perspectives and formal communication | Grammar in context |
| B2 | Describing trends, comparisons and cautious evaluation | Grammar in context |
| C2 extension | Subjunctive, concessive inversion and advanced modal scope | Precision & register |

Each new lesson supplies conceptual explanation, context, formulas, explained
examples, a comparative contrast, an explained correction, a summary, objective
practice and an original-production prompt with a model and self-review criteria.
Broader topic families are taught together rather than exposing empty individual
topic cards. This is a structured course extension, not an exhaustive reference
grammar or a complete certified A1–C2 course. C2 currently has one extension unit;
most new material intentionally targets B2–C1.

Reference organisation was checked against the [British Council B1–B2 syllabus](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2)
and [C1 syllabus](https://learnenglish.britishcouncil.org/free-resources/grammar/c1),
including its [emphasis lesson](https://learnenglish.britishcouncil.org/free-resources/grammar/c1/emphasis-cleft-sentences-inversion-auxiliaries).
The [Council of Europe CEFR descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors)
describe proficiency, not a universal one-structure-to-one-level grammar list.
All new explanations, questions and examples are original authored material;
external commercial lessons were not copied. Level tags are editorial guidance,
not a British Council endorsement or official classification of each structure.

## Files and boundaries

- `src/types/grammar.ts`: existing lesson/exercise/progress types with optional
  level, category, comparison, production and vocabulary metadata.
- `src/data/grammarLessons.ts`, `grammarExercises.ts`: preserve original records
  and append the extension. Original IDs, keys and five-question sessions stay
  unchanged so old completion/retention calculations remain meaningful.
- `src/data/advancedGrammar.ts`: 23 original units and their 57 versioned questions.
- `src/data/placementQuestions.ts`: 40 versioned original diagnostic items, across
  six approximate levels and five assessed dimensions.
- `src/types/grammarLearning.ts`: placement, preference and ungraded production
  record contracts, independent of vocabulary progress.
- `src/services/grammarService.ts`: unchanged objective grading, exercise sessions,
  lesson progress and delayed review rules.
- `src/services/grammarLearning.ts`: adaptive question selection, estimated result,
  preference changes, skill breakdown, recurring errors, recommendations and drafts.
- `src/services/grammarLearningValidation.ts`: portable-record validation.
- `src/components/grammar/GrammarView.tsx`: existing lesson UI plus filters,
  recommendation text, comparisons and focused practice selection.
- `PlacementPanel.tsx`, `GrammarProduction.tsx`, `GrammarVocabularyBridge.tsx`:
  small additions inside the existing Grammar screen, using existing styles.
- `src/services/grammarFeedback.ts`: optional advisory inference adapter, separated
  from grading and presentation.
- `scripts/server/languageFeedback.mjs`: reuses the existing loopback-only local
  model adapter, now accepting registered Grammar tasks as well as vocabulary tasks.

No Writing-section code, visual tokens, fonts, navigation, vocabulary-selection
logic, third-party API integrations or dependencies were changed.

## Objective validation versus original writing

Objective exercises have explicit keys and explanations. Multiple choice,
fill-in-the-blank, error identification, ordering and structure recognition remain.
New tasks add contextual selection, error correction and controlled sentence
transformation/rewriting. Formatting normalization tolerates case, whitespace,
ordinary sentence punctuation and curly apostrophes. It does not remove negation,
change verb tense or equate arbitrary synonyms.

Controlled production is deliberately constrained to a stated opening and target
construction. Finite answer keys are **not** semantic grading of unrestricted
writing: a valid alternative outside the key can be unmatched. The UI explains
this limitation. Do not expand keys automatically from AI output or use arbitrary
string matching to certify a learner’s original sentence.

Original writing is stored in a separate ungraded table. Its model answer is one
example, not an exhaustive key. The existing optional local Ollama adapter can
offer grammar/context/meaning feedback when explicitly requested. It accepts
alternatives and can report uncertainty; comments retain model and time metadata.
It never adds a boolean grade or updates objective mastery. No model was installed
or downloaded. Real inference quality has not been evaluated on this machine;
protocol tests use an explicitly labelled fixture, not fabricated successful AI.

## Placement algorithm and limits

Twenty items are selected without replacement from the 40-item version-1 bank.
Domains rotate: grammar, vocabulary, reading, contextual usage, controlled
construction. Thus a completed test has four responses per domain.

The first question is around B2. Subsequent questions target the estimated ability
nearest an unused item in the active domain. Estimation uses a small, transparent
Rasch-like heuristic: a grid from 0 to 6, logistic slope 1.5, item locations from
editorial A1–C2 indices, and a weak prior centred at 2.5. Multiple-choice items
include a guessing term of 1 / number of choices. Typed transformations do not.
Domain estimates use that domain’s responses; the overall estimate uses all
responses. Blank evidence produces no result, not an invented B2 score.

These items and parameters are **not psychometrically calibrated**. Four items
per area cannot establish stable domain proficiency. Displayed estimates are
low-confidence pathway suggestions and explicitly allow adjacent levels. A high
result does not prove C2 competence. Listening, speaking and unrestricted writing
are unassessed. Strengths require at least three responses and 75% matched keys;
improvement topics derive from the actual missed items and linked lessons.
The answer review shows actual responses, keys and explanations after completion.

## Progress and adaptation

The existing `grammarProgress` and `grammarAttempts` contracts remain intact.
Recognition uses choice-based questions; controlled production uses typed/ordered
answers. They are summarized separately, with recent accuracy over ten attempts.
Two or more missed attempts on the same authored question expose its explanation
as a recurring error. This identifies repeated task difficulties, not a linguistic
diagnosis inferred from arbitrary writing.

Recommendations prioritize weak/due lessons, then the preferred pathway and
unfinished reading, while deprioritizing already mastered topics. Weak production
specifically recommends transformations/construction; the focus selector allows
direct access. Full-session mastery still needs completed reading, two successful
full sessions including a review at least 24 hours later, and 80% recent accuracy.
Immediate repetition or reading alone cannot establish mastery.

The vocabulary bridge is intentionally small: the authored deteriorate/perfect
continuous and mitigate/modal passive tasks display meaning with context. If these
words already exist in the personal library, Grammar offers their context links.
Grammar results never mutate word familiarity, vocabulary SRS, or lexical scores.
This is not a new automatic vocabulary exercise generator for arbitrary saved words.

## Storage and migration

Dexie `LexoraDB` version **8** adds only three stores:

| Store | Key | Purpose |
| --- | --- | --- |
| `grammarPlacements` | `id` | Resumable diagnostic responses and completed history |
| `grammarPreferences` | `id = grammar` | Editable pathway and skipped-test preference |
| `grammarProduction` | `id` | Original ungraded responses and optional advisory comments |

All old stores, primary keys and records remain. No destructive upgrade runs.
Full JSON backup version `8.0.0` exports these records; the existing automatic disk
backup observes them too. Import validates records and merges append-only histories;
conflicting assessment prefixes or original answer bodies abort the transaction.
Placement correctness is checked against the actual item key rather than trusting
an imported boolean. Older compatible backups lacking the new stores remain
importable. An older client cannot save a snapshot that silently omits new records
already present in the disk backup. Clearing external cache does not clear Grammar.

Lessons, objective checks, placement and progress do not need a model or internet
once the app and modules are loaded. This is not a claim that the entire website
can cold-start offline: no new service worker was added. Optional model feedback
requires a configured, reachable local model; disk backup requires the local server.

## Validation

Run the app on an isolated port with `EBD_STORAGE_DIR` pointing to a temporary
directory, never the user’s backup folder. Test scripts create disposable browser
contexts, not personal browser profiles.

```sh
EBD_STORAGE_DIR=/private/tmp/ebd-grammar-tests npm run dev -- --host 127.0.0.1 --port 5180 --strictPort
node tests/advanced-grammar.cjs
node tests/grammar.cjs
node tests/lexical-upgrade.cjs
npm run test:language-feedback
npm run test:storage
LEXORA_TEST_URL=http://127.0.0.1:5180 node tests/regression.cjs
LEXORA_TEST_URL=http://127.0.0.1:5180 node tests/workflows.cjs
npm run build
npm run lint
```

The storage suite owns a separate port 5181 and temporary folder. See the dated
report in `docs/reports` for actual execution results and remaining limits.
