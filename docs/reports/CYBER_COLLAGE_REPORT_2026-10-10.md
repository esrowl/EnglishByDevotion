# EnglishByDevotion — cybernetic header refinement

Owner: Esra. Project: `/Users/esra/Desktop/MyProjects/EnglishByDevotion`.

## Completed changes

- Removed owl illustrations from the visible header, sidebar, dashboard, footer and shared empty states. Unused owl source files remain for recoverability; they are not imported by active UI components.
- Enlarged the real HTML EnglishByDevotion title, keeping Pixelify Sans and warm cream. The dashboard hero now layers artwork behind text rather than presenting a separate decorative card.
- Moved the existing native Canvas globe into an oversized, rotated, partially clipped background. Its existing projection, slow animation, hidden-tab pause and reduced-motion support remain unchanged.
- Reused Esra's actual 1672×941 reference as a local asset. `CyberPortrait` crops the right-hand face region with an SVG viewport (original x=1220, y=98, width=360, height=485); the image is not stretched, regenerated or used to fake working controls. The reference's title and buttons are outside this crop.
- Added irregular SVG circuit clusters with unequal trace lengths, node density, thickness and disconnected fragments. Active backgrounds no longer repeat the old circuit tile. Long lesson surfaces stay plain.
- All decorative layers use `pointer-events: none`; hero artwork sits at z-index 1 beneath content at z-index 10. Desktop face opacity is 0.24; mobile is 0.13. Mobile artwork is smaller and more cropped.

## Preserved

Palette unchanged: black `#08090B`, charcoal `#111217`, cream `#F4D5A3`, ivory `#F5E8CE`, blue `#2386B3`, green `#A0B52B`, yellow `#F5B51B`, orange `#EF741C`, pink `#D83B70`, cyber blue `#3048DB`, cyber green `#58C96E`.

Only Pixelify Sans, Handjet and VT323 are used. Winter decoration, navigation, learning functionality, grammar content/keys, dictionary services and database schema were not changed. No dependencies were added. Personal IndexedDB/localStorage were not reset. Tests used disposable browser profiles and a separate server with temporary disk storage, not the running personal server.

## Files

Created:

- `public/assets/circuit-fragments.svg`
- `public/assets/header-reference.png` — unchanged user-provided reference
- `src/components/common/CyberPortrait.tsx`
- This report and screenshots in `docs/screenshots/cyber-collage-2026-10-10/`

Modified:

- `src/index.css`
- `src/components/common/WireframeGlobe.tsx` — decorative wrapper only
- `src/components/common/EmptyState.tsx`
- `src/components/dashboard/DashboardView.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `tests/visual-identity.cjs`
- `tests/grammar.cjs` — updated expected owl removal and circuit asset
- `README.md`

## Executed validation

| Command | Result |
| --- | --- |
| `npm run build` | Passed |
| `npm run lint` | Passed |
| `node tests/visual-identity.cjs` | 23/23 |
| `npm run test:grammar` | 37/37 |
| `npm run test:workflows` | 35/35 |
| `npm run test:regression` | 9/9 |

104 browser/data checks passed. Visual checks cover 1440px desktop and 390px mobile navigation, actual mesh pixels/animation, reduced motion, contrast, only the allowed fonts, absent page overflow, non-repeating circuits, rotated/cropped unframed artwork, clickability, unchanged vocabulary records and no uncaught browser errors. Workflow tests also exercised empty libraries, notes, flashcards, review, import/export and Continuous Study. Grammar progress persistence and backup recovery passed.

The rendered desktop dashboard and full mobile dashboard screenshots were visually inspected, not merely generated. Other section captures are available in the screenshot folder.

- [Desktop dashboard](../screenshots/cyber-collage-2026-10-10/dashboard-viewport.png)
- [Mobile dashboard](../screenshots/cyber-collage-2026-10-10/dashboard-390.png)
- [Vocabulary](../screenshots/cyber-collage-2026-10-10/vocabulary-1440.png)
- [Grammar](../screenshots/cyber-collage-2026-10-10/grammar-library-1440.png)

## Limits

Verified in Chromium/Edge desktop emulation, not every physical phone/browser. The supplied raster reference is retained at its original size (~2.1 MB); its two SVG uses share one cached image resource. No new bitmap artwork was generated. Redistribution rights for the user-provided reference were not independently verified; obtain permission before public redistribution. No cloud sync or full offline startup claim is made. Historical reports/screenshots describe previous versions and were retained unchanged.
