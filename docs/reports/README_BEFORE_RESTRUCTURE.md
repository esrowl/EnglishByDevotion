# EnglishByDevotion — Personal Vocabulary Lab (v2.0.0)

> *Small steps. Lasting fluency.*

**EnglishByDevotion** is a contemplative, open-ended English vocabulary learning environment designed around a **Retro-Futuristic Winter Library** aesthetic. It combines vintage computer accents, cozy reading surfaces, subtle animated snowfall, and an original contemplative owl character.

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Dexie IndexedDB**. Saved vocabulary, learning records and source caches are local. First-time external lookups require internet. No subscription or account is required. Offline app startup is not provided by a service worker.

---

## 🦉 Visual Identity: Retro-Futuristic Winter Library

- **Aesthetic**: Warm study room ambiance with deep espresso (`#352321`), midnight plum (`#28203D`), snow ivory (`#F4EDE0`), warm cream (`#F5DFBB`), stormy teal (`#11686A`), and muted terracotta (`#D96B4A`).
- **Typography**: Locally bundled Special Elite for vocabulary; VT323 for general controls and metadata, with existing pixel fonts retained for pixel UI. Courier New supplies fallback glyphs. Font license files are in `public/fonts`.
- **Contemplative Owl Character**: A quiet, intelligent vector-illustrated owl perched on a snowy winter branch.
- **Gentle Snowfall**: Subtle, low-CPU canvas particle system in the header and hero banners (respects `prefers-reduced-motion` and never blocks clicks).
- **Warm Reading Surfaces**: Vocabulary details and study cards use high-contrast warm ivory/cream reading panels for comfortable long reading sessions.

---

## 🌌 Open-Ended Learning Flow (No Artificial Quotas)

- **Completely Flexible**: No mandatory quota of 10 words. You can study 1 word, 5 words, 20 words, or stop whenever you choose.
- **Continuous Study**:
  - **Discover & Study**: Explore new vocabulary with full phonetic audio, English definitions, Turkish translations, example sentences, collocations, and synonyms.
  - **Flashcard Drill**: 6 active drill modes (EN→TR, TR→EN, Sentence fill-in, Collocation completion, Syn/Ant drill, Typed Recall).
  - **Sentence Writing Studio**: Compose your own original English sentences using target words with automatic verification and card integration.
  - **Spaced Repetition Queue**: Dedicated SM-2 review queue prioritizing items based on the forgetting curve.
- **Real-Time Activity Metrics**:
  - *Words Learned Today* (calculated from actual new words studied today).
  - *Words Reviewed Today* (calculated from review logs timestamped today).
  - *Words Due for Review*.

---

## 🚀 How to Run the Application

On macOS, double-click **EnglishByDevotion.command** in this project folder.
It starts the server and opens `http://localhost:5173`. Keep Terminal open;
press Ctrl+C to stop it. Node.js and the installed project dependencies are required.
The launcher reuses an existing EnglishByDevotion server and never switches ports silently.
Use the same browser and address as before: IndexedDB belongs to that browser and origin.

Navigate to the project folder and start the local Vite development server:

```bash
cd /Users/esra/Desktop/MyProjects/lexora
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

---

## 💾 Local Storage Architecture

All data is stored inside your browser's persistent **IndexedDB** database (`LexoraDB`).
- **Local persistence**: Saved data remains across reloads and server restarts unless the browser's site storage is cleared. Previously saved words and cached dictionary content can be read without a network connection while the application is loaded. Full offline app startup is not guaranteed; no service worker is configured.
- **Full Data Ownership**: Export your entire database to JSON or CSV anytime from the **Import & Export** screen.
