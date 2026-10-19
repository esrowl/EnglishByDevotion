# EnglishByDevotion

Created by **Esra**. A quiet winter-night English vocabulary and reading desk,
with retro computer controls, local grammar lessons and cybernetic background art.

Continuous Study now defaults to a separate NGSL discovery pool (31,239 words),
excluding the 2,809-word core by membership. Original frequency ranks are retained;
they are not CEFR labels. Already Know records familiarity, Learn This Word saves
for active learning, and Next Word skips. There is no daily/new-word quota.
My Saved Words and Flashcard Drill retain personal-library practice.
Vocabulary discovery now uses a prepared local dictionary: 15,808 headwords,
13,007 eligible non-core entries before personal exclusions. Source-linked Turkish
translations are restored where available (90 dictionary headwords), alongside
preserved personal meanings. There is no claim of full Turkish coverage.
Explicit searches outside local/cache coverage still use Wiktionary and need internet.
Free Dictionary API and Gutendex were removed from active integrations.
Reading accepts TXT, Markdown, text-based PDF, HTML and CSV uploads, or pasted
writing. Select a word for meanings and licensed usage examples; save explicitly.
Scanned/password-protected PDFs and DOCX are not supported. Files remain local.
Details: `docs/reports/READING_POLISH_REPORT_2026-10-10.md`.

**18 October upgrade:** dictionary sections open automatically during study.
**Flashcard Drill → Context & Usage Practice** adds 36 curated activities across
eight skills. Six objective skills have deterministic grading; free-form writing
and bidirectional translation stay ungraded unless optional local AI feedback is
explicitly requested and configured. No model or dependency is installed.
See [lexical architecture, source licenses, preparation and optional AI setup](docs/LEXICAL_LEARNING.md).

**Advanced Grammar:** 36 local lessons, B2–C1 by default, with accessible A1–C2
pathways, comparisons and controlled transformations. An optional resumable
20-question placement diagnostic recommends an approximate level; it is not CEFR
certification. Recognition, controlled production and original ungraded writing
remain separate. Existing lesson IDs and progress are preserved. See the
[Grammar architecture, curriculum, assessment limits and storage guide](docs/GRAMMAR_LEARNING.md).

## Start

On macOS, double-click `EnglishByDevotion.command`. Keep Terminal open;
the app opens at `http://localhost:5173`. **Close app** saves committed records
and stops a server started by the shortcut. Ctrl+C also stops the server.

For development, use Node.js 24 or another version supported by all dependencies.
From a terminal in the project folder:

```sh
npm ci
npm start
```

On Windows/Linux use `npm run dev`, then open `http://localhost:5173` manually.
`npm run dev` does not enable managed shutdown; stop it with Ctrl+C.

## Static deployment

The project can be built for a static host such as Netlify using `npm run build`
and publishing the `dist` directory. Set the build environment to Node.js 24.
Commit the source, `public`, `package.json`, and `package-lock.json`; do not upload
`node_modules`, `dist`, or `storage/backups`. Review screenshots and files for
personal content before publishing. Git ignore rules do not remove files already
tracked in a repository's history.

On a static host, saved words and progress remain in this browser's IndexedDB;
clearing browser data can delete them, and they do not automatically sync to other
devices. Use **Export everything** for a JSON backup and Settings to restore it.
The local disk backup, managed shutdown, and optional local-model feedback and
translation need the local Vite server and are not available on a static host.

## Learning and sources

- Vocabulary, notes, six flashcard modes, continuous study, SRS and statistics are preserved. Writing Notes is explicitly ungraded personal writing, not a grammar checker.
- Grammar offers 13 complete lessons, 65 authored questions, explanatory feedback, resumable sessions and performance-based review. Difficulty groups are instructional, not verified CEFR levels.
- Wiktionary supplies English definitions and usage examples when available. Saved entries are checked first; lookups never save or mark words learned automatically.
- Tatoeba provides licensed English examples and a cursor-paginated **Get more** flow. Legacy translation metadata remains in backups, not the UI.
- Datamuse offers related-word discovery; suggestions are not verified definitions.
- Two licensed Gutenberg excerpts are bundled. Open Library provides metadata, not automatic full-text downloads. Upload your own permitted texts in Reading Library.
- There is no daily ten-word quota. Display batches and API page sizes are not library limits; upstream collections and rate limits remain finite.

## Data and portability

**Save all**, **Export everything**, **Clear cache** and **Close app** are separate
controls. Committed database changes receive debounced disk backups while the
local server is available. Finish open forms first; drafts are not silently committed.

The legacy IndexedDB name **LexoraDB** intentionally stays unchanged to preserve
existing records. Full JSON backups contain vocabulary, notes, SRS, review logs,
daily sessions, settings, personal readings, caches, grammar progress and grammar attempts. CSV is vocabulary-only.

## Documentation

- [Project and architecture guide](docs/TECHNICAL_GUIDE.md)
- [Grammar implementation and validation report](docs/reports/GRAMMAR_UPDATE_REPORT_2026-10-10.md)
- [Retro visual identity: before/after screenshots and validation](docs/reports/VISUAL_IDENTITY_REPORT_2026-10-10.md)
- [Browser/PC migration and backup procedures](docs/DATA_PORTABILITY.md)
- [Sources, endpoints and licensing](docs/SOURCES.md)
- [Test reports](docs/reports/)
- [Local user files](storage/README.md)

## Validation

```sh
npm run build
npm run lint
npm run test:regression
npm run test:workflows
npm run test:content
npm run test:fonts
npm run test:grammar
EBD_TEST_URL=http://127.0.0.1:5180 node tests/visual-identity.cjs
npm run test:api
npm run test:storage
npm run test:live
npm run test:source-ui
```

Browser tests require Playwright and a compatible browser. This machine uses
the existing Codex runtime and Microsoft Edge. New tests accept `EBD_PLAYWRIGHT_MODULE`,
`EBD_BROWSER`, `EBD_TEST_URL`; earlier suites retain their `LEXORA_*` compatibility
variables. Use a separate test server with **EBD_STORAGE_DIR pointing to a temporary
directory** so test snapshots never mix with personal disk backups. Live diagnostics
report provider availability separately from deterministic regression results.

Only Pixelify Sans (headings), Handjet (vocabulary) and VT323 (learning text and
controls) are used, locally bundled with licenses. The winter atmosphere is
retained; owl illustrations were removed from the visible UI at Esra's request. Full offline startup, conflict-free cloud
sync and identical behavior in all browsers are not claimed.
