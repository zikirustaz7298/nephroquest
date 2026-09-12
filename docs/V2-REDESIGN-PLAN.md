# NephroQuest v2 — audit and redesign plan

Written before any application edits. Baseline: clean main, e119aa7. Scope: this repository only.

## Audit (source and live site)
- `/`: clinical card menu, five direct case links, reads `nq_scores`, no persistent identity or journey.
- `/play`: repeated inline-style case listing; all five cases accessible.
- `/play/[id]`: client route wrapper; navigation currently happens during render. `ward.tsx` owns intro, canvas movement, proximity interaction, history, tests, consultant, diagnosis, staging, management and detailed scored debrief.
- `/drill`: 12 existing lab questions, random ten-question rounds, 45-second clock. Timer incorrectly uses useMemo (cleanup not effective); d12 answer text does not equal its displayed option. These are functional defects to fix without replacing question content.
- `lib/engine.ts`: pure budget/time/history/test transitions and 40/25/15/10/10 scoring, penalties, expert comparison. Preserve core formula and case outcomes; add regression tests.
- `lib/ward.ts`: 960×640 canvas, collision rectangles, five stations, keyboard movement and synthesized audio. Hospital geometry remains; replace rendering with original woodland infirmary artwork and healer sprite. Provide equivalent station buttons for keyboard/screen-reader/mobile access.
- `lib/sfx.ts`: local WebAudio synthesizer; no external audio. Add persistent opt-in sound control. Preserve movement/interaction sounds.
- `data/cases.ts`: five cases (two AKI, one electrolytes, one glomerular, one CKD), intact history/labs/expert paths/rationales. `data/drill.ts`: 12 questions across six topics. Do not invent a 13-topic reviewed curriculum.
- `globals.css` and layout: dark blue only, no app navigation, skip link, focus system or reduced-motion support. Inline colors and broken replacement glyphs in ward need cleanup.
- Live `/`, `/play`, `/play/aki-prerenal-001`, `/drill` fetched and match source. Browser harness blocked by remote-debugging permission; use a separate automated headless Playwright browser for real interactions, not permission UI.

## Clinical boundary / known legacy concerns
Existing material contains clinical inconsistencies (gardener BUN/Cr interpretation and staging; nephrotic biopsy/steroid assumptions; thiazide-associated sodium question; d12 answer string). Preserve original educational data, explicitly label as legacy educational scenarios pending clinician review, never present as current Malaysian CPG guidance. Only repair d12 matching in an adapter, not by altering medical data. No new dosing or management advice. Game penalties are scripted learning mechanics, not validated predictions of clinical harm. Clinical content expansion requires Malaysian MOH/official CPG source mapping and clinician review before publication.

## Design
Original locally authored SVG illustrations: layered misty green hills, cream cloud washes, gold lanterns, woodland clinic, river/map paths and herbarium objects. No franchise characters or copied assets. Green/cream/gold shared semantic variables, serif story headings, readable sans UI. Light and dark modes. CSS motion rather than adding Framer Motion: simple entrance, floating motes and button feedback do not warrant runtime dependency; all decorative movement respects reduced motion.

## Incremental delivery order
1. Commit this audit/plan only.
2. TDD persistent journey model: validated localStorage, preserve `nq_scores`, derive completion XP from best scores, daily activity and card-review XP bounded/idempotent, achievements, linear campaign unlocks (direct library never locked).
3. Shared shell + original title scene + map at `/play`: navigation to profile, daily missions, collection; region nodes link original cases, locked campaign nodes explain prerequisite, separate unrestricted library.
4. Profile `/profile`, daily `/missions`, collection `/collection`: persistent name, level/XP and badges; three daily goals; flashcards reuse legacy drill panels/explanations, local reviewed-card collection. No fake inventory rewards or unimplemented mode buttons.
5. Existing ward and drill: fantasy art, movement/sound, accessible station alternatives, modal keyboard handling, initial labs, reactive lab results, timer fix, safe result persistence and daily completion tracking.
6. Production build (NODE_OPTIONS=--max-old-space-size=1024), unit regression tests and real Playwright browser interactions: navigation, legacy migration, unlocks, theme/sound persistence, flashcards/missions, ward movement and completion, drill, mobile overflow, reduced motion. Review security/diff; independent reviewer tool is unavailable in this subagent, report that limit rather than claim independent approval.
7. Commit verification report and unique release marker, push origin main only after gates pass. Read remote main and live marker back; report exact deploy commit only if proven.

## Scope ledger
Delivered items will be recorded in `docs/V2-VERIFICATION.md` with actual tests and commit IDs. Target is a coherent playable v2 foundation, not a claim to the full future RPG.

Future/not delivered: full 13-topic clinical curriculum; eight distinct minigames; turn-based JRPG boss combat; complete narrative NPC system, multiplayer/cloud saves, clinician-approved new Malaysian content. Original requested region names are not available in the delegated context: working local names (Dewdrop Meadows, Copperleaf Crossing, Thunderfern Peaks, Mirrorwater Grove, Elderroot Sanctuary) are explicitly provisional, not claimed to satisfy unseen names. Acid-base and dialysis remain available through existing drill/collection content, not fabricated case regions. Future topic and region expansion needs the exact approved roster.
