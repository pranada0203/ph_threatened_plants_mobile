# DAO 2026-20 — Threatened Philippine Plants Dashboard

## Project Overview
A single-file, mobile-first web application serving as an interactive reference tool for the Updated National List of Threatened Philippine Plants under DENR Administrative Order No. 2026-20. The tool lists 1,237 threatened Philippine vascular plant taxa with full filtering, analytics, and species detail.

**Live URL:** https://dao202620.vercel.app — the project's primary domain.  
`phthreatenedplantsmobile.vercel.app` is an older alias of the same project and redirects here. Keep it alive: published citations and the presentation deck used it before the switch. Cite and share the primary domain only.
**Repository:** Connected to Vercel via GitHub (GitHub Desktop used for deployment)  
**Developer:** Mc Andrew Pranada (Plant Taxonomist / Botanist)  
**Built with:** Claude (Anthropic)

---

## Current File
**`index.html`** — the deployed file, at the repository root.

A single unified HTML file serving phone, tablet and desktop via CSS breakpoints. There is no build step, no framework, and no backend.

### Breakpoints
| Range | What changes |
|---|---|
| ≤768px | Phone. Two columns (Status, Species); family, habit and authority fold into the meta line under the binomial. Detail panel is a full-screen sheet. |
| 769–1000px | Narrow tablet / small window. Common name and Distribution drop; common name stacks under the binomial. |
| 769–1260px | Tablet. Narrower sidebar, tighter cell padding. |
| 769–1600px | Detail panel floats over the table rather than pushing it — seven of the eight old columns were fixed-width, so the panel used to take its 400px entirely out of the Scientific Name column. |
| ≥1261px | Full desktop column set and sidebar width. |

Local preview: `.claude/serve.ps1` serves the repo root on `http://localhost:8642` (it derives its root from its own location, so it works on any checkout).

---

## Data Structure
All 1,237 species are embedded as a JSON array (`var DATA=[...]`) in the `<script>` block. Each entry has:

```json
{
  "cat": "CR",
  "family": "Acanthaceae",
  "no": 1,
  "scientific": "Thunbergia ilocana Bremek.",
  "name": "Thunbergia ilocana",
  "authority": "Bremek.",
  "common": "Ilocos thunbergia",
  "endemic": true,
  "division": "Angiosperm",
  "cites": null,
  "habit": "vine",
  "habitConf": "verified",
  "dist": "LUZON: Ilocos Norte",
  "groups": ["Luzon Group"]
}
```

### Field Notes
- `cat`: CR, EN, VU, OTS
- `division`: Angiosperm, Gymnosperm, Pteridophyte
- `cites`: null, "I", or "II"
- `endemic`: true/false (Philippine endemic)
- `habit`: tree, shrub, herb, vine, liana — all verified by developer
- `habitConf`: "verified" for all 1,237 entries
- `dist`: raw distribution string from Co's Digital Flora of the Philippines (CDFP). All-caps = island name; mixed case = province/locality. May contain "(photos)" and "?" for uncertain localities.
- `groups`: array of major island group strings for filter — "Luzon Group", "Visayas", "Mindanao Group", "Palawan", "Sulu Group"

Two fields are computed once at load and cached on each record, so `render()` never parses distribution strings per row:
- `_dIsl`: array of title-cased island names parsed from `dist` (falls back to `groups` for the 5 records with no parseable island)
- `_dFull`: those names joined, used as the Distribution cell's hover title

### Known Data Corrections Applied
10 species name corrections from CDFP verification:
- Begonia noraaunoriae, normaaguilariae, platyphylla
- Dendrobium victoriae-reginae
- Wurfbainia mindanaensis, palawanensis
- Sphaerostephanos convergens
- Pronephrium camarinense
- Entada rheedei
- Syzygium siderocola

---

## Features

### Filtering
- **Status tabs**: ALL / CR / EN / VU / OTS (header stat row on desktop, bottom nav on mobile)
- **Division**: Angiosperm, Gymnosperm, Pteridophyte
- **CITES**: App. I, App. II
- **Habit**: Tree, Shrub, Herb, Vine, Liana
- **Island Group**: 5 major groups with expandable sub-island chips (mobile filter sheet)
  - Luzon Group, Visayas, Mindanao Group, Palawan, Sulu Group
  - Sub-islands filterable individually (e.g. Sibuyan, Polillo, Siargao)
- **Flags**: Endemic only, Non-endemic highlight, No common name
- **Family**: Sidebar (desktop) / Filter sheet (mobile)
- **Search**: Accent-normalized (typing "pungapong" finds "pungápong"), searches name + authority + common + family + CITES

Division, CITES and habit are still fully filterable and still shown in the species panel — they stopped being *table columns*, not data. See the colour contract below.

Sortable columns: Status, Scientific Name, Family, Common Name. Distribution is derived, so it does not sort.

### Species Detail Panel
Opens from row click. Contains:
- Scientific name (italic), authority, threat/division/CITES/endemic/habit/infraspecific badges
- Common name
- Copy citation button
- Photographs — CC-licensed GBIF occurrence media (see below); hidden when none qualify
- External databases: IPNI, GBIF (with live occurrence data via GBIF API)
- Co's Digital Flora of the Philippines (CDFP) photo link — links to family page
- Local Distribution — parsed from dist field, all-caps = island label, mixed case = provinces, (photos) badge, ? uncertain badge
- Similar species (same family + category)

### GBIF Integration
Live API calls to `api.gbif.org`. Fallback to synonym search if the species is not matched. Occurrence counts lead the block as figures; the taxonomic match metadata sits beneath them as one caption line.

**Staleness guard.** Every fetch is stamped with a token from a monotonic counter (`gbifSeq`), and each response checks it before writing to the DOM. It must not be `Date.now()` — two `openPanel` calls in the same millisecond, which holding the down-arrow through the panel produces routinely, yielded identical tokens, so the check compared a number against itself and one species' results rendered into another's panel.

### Species Photographs
Up to three CC-licensed images per species, pulled from GBIF occurrence media (`mediaType=StillImage`), shown at the top of the panel body.

- **Licensing is a hard filter.** Only CC0, CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA and the Public Domain Mark are displayed (`MEDIA_LICENCE_OK`). All Rights Reserved, unrecognised URIs and missing licence fields are dropped rather than shown with a hedge — this tool is attached to a government issuance, so a wrong reuse is the developer's problem, not GBIF's.
- Every photograph is credited by photographer and licence beneath the strip, and each tile links to the GBIF occurrence record it came from. Credits are deduplicated per photographer, not per photo.
- Roughly **a third of taxa have no openly-licensed image**; the section stays hidden for those rather than rendering an empty frame. It also hides itself if every image fails to load.
- **Thumbnail sizing** is host-specific in `mediaThumbUrl()`. GBIF records originals: an iNaturalist original measured 2,077KB against 195KB for its `medium` variant, and a Smithsonian NMNH image arrives at 1517×2000 for a 115px tile. Both hosts are rewritten; every other host is used as published, because there is no portable resize and guessing risks a URL that does not exist.
- `https` only, so no mixed content.

### Analytics Modal
Charts describe the **current filtered view**, not the whole dataset.

**Distribution map** (`buildIslandMap`) — a proportional-symbol map, not a heat map: the data records presence per island, so one circle per island sized by count is the honest form; interpolating a surface between them would invent a density gradient across water that nothing measured. Circle *area* scales with the count (radius by square root), 26 islands are plotted covering ~90% of island records, and it redraws with the filters like every other chart.

`ISLAND_XY` holds the coordinates. They were geocoded **once** against OpenStreetMap via Nominatim and verified individually — do not regenerate them naively: a plain lookup returns real islets named "Panay Island" in Catanduanes and "Bohol Island" in Samar, and resolves Luzon and Palawan to local landmarks. Nothing is fetched at run time and no tiles are loaded. © OpenStreetMap contributors.

`PH_COAST` is the basemap: the Philippine landmass baked into the page so the circles sit on a country instead of on blank paper. Natural Earth 1:10m Admin 0 (public domain), feature 608, reduced offline to **82 islands / ~1,460 points / 7.3 KB** — Douglas-Peucker at 0.02°, islands under ~1.6 px² dropped, coordinates quantised to 1/100° (~1.1 km, about 0.28 px at the size this draws). Rings are `|`-separated; within a ring the first two fields are the starting lon,lat in hundredths of a degree and every later point is a `dlon.dlat` delta, all base36. `coastRings()` decodes it once and memoises, because the modal rebuilds the map on every filter change.

**Regenerate with `tools/derive-coastline.mjs`, never by hand.** Two things to know if you touch it:

- The projection window is the land's own extent (lat 4.4–21.1, lon 116.6–127.0), measured from `PH_COAST`. The earlier window stopped at 19.9°N and drew Batanes off the top of the card. If you change the simplification, re-measure the extent.
- 24 of the 26 `ISLAND_XY` points fall strictly inside a coastline polygon, and Biliran and Masbate land 0.8 km and 0.4 km offshore — inside Natural Earth's own generalisation at 1:10m, and ~0.02 px here. That point-in-polygon check is a free cross-validation of the geocoding; re-run it after editing either dataset.

Land is drawn as `--sf` (white) on the card's `--bg` paper ground with a `--bd-strong` coast stroke. **No new hue** — the map stays inside the three-tier colour contract and the green symbols remain the only saturated thing in the card.
 Top 15 Families, Threat Category (with a per-category breakdown table), Division donut with Endemicity by Division, CITES Listing Status, Growth Habit, Top Islands by Threatened Species.

Chart conventions:
- Bars are scaled to the largest value **in their own chart**, and each chart says so, because a full-width bar otherwise reads as "all of them" rather than "the most of any one".
- A bar's value sits at the end of that bar, flipping inside the fill above 86% so it cannot overflow the track.
- CITES is a proportion bar plus figures, not a donut — 1,018 of 1,237 taxa are unlisted, so a donut spent 82% of its area drawing an absence and left App. I (13 taxa) as a hairline.

### Language Toggle
EN/FIL toggle button in header stat row. Switches all UI chrome to Filipino. Scientific names, authorities, DAO references, CITES codes, island names all stay in English/Latin. Translation object stored in `var T={en:{...}, fil:{...}}`.

### Other Features
- Column sort (click headers)
- URL hash filter state (shareable/bookmarkable)
- Compact view toggle
- CSV export (includes Habit and Habit Confidence columns)
- Print stylesheet
- Keyboard shortcuts: `/` focus search, `Esc` close panel, `↑↓` navigate panel
- Similar species section in panel
- Copy citation button
- Share this tool (Web Share API with clipboard fallback)
- Send Feedback panel (slide-up, with email + link to About)
- **Methods & Citation paper** (`#paperOverlay`, opened by `.js-open-paper`, addressable at `#doc=1`) — scope, a provenance table separating what is reproduced from what is the author's, method, **distribution findings**, limitations, references and the recommended citation. This is the citable document; keep its figures in step with the dataset.

  Section 4 summarises the parsed distribution data. Its headline results: 623 of 1,232 taxa (51%) are recorded from a single island; Critically Endangered taxa are sharply narrower-ranged than the rest (mean 1.77 islands, 70% single-island, against 2.8–3.3 and 42–47% for EN/VU/OTS); Palawan has the highest single-island share of any major island (42% of its 398 taxa, vs Luzon 34% and Mindanao 27%); pteridophytes range wider than angiosperms (mean 3.44 vs 2.72); and CITES listing shows no range signal, which is the expected null. Every figure is derived from `DATA` at the time of writing — **recompute before editing that section**, and keep its collection-effort caveat, which is what makes the rest of it honest.
- About panel (`#disclaimerOverlay`, opened by `.js-open-disclaimer`) — attribution, source terms, licensing and warranty notice. Maintained in English only; the English text governs.
- Vercel Analytics (`/_vercel/insights/script.js`)

---

## Layout Architecture

### Mobile (≤768px)
- Sticky toolbar: search + Filters button + Analytics + Export icons
- Full-screen slide-up panel (touchstart on toolbar handle to swipe-close)
- Bottom navigation bar: All/CR/EN/VU/OTS + Feedback icons
- "Developed by Mc Andrew Pranada" right-aligned in bottom nav bar
- Filter bottom sheet (expandable island group tabs)
- Table: Status + Species only. Family, habit and authority run together on one meta line beneath the binomial, in that order — only the authority is allowed to truncate, so the two short fields always survive. Common name stacks below.
- Header lockup: `DAO 2026-20` as a mono eyebrow above the title (same lockup as the landing page), not a pill beneath it
- Language toggle: flag button in the header row

### Desktop/iPad (≥769px) — `@media (min-width:769px)`
- Full sidebar with family list + search
- Full toolbar with all filter chips
- Detail panel floats above the table below 1600px, docks inline above it
- Five columns: Status, Scientific Name & Authority, Family, Common Name, Distribution
- Bottom nav hidden, footer shown
- Footer contains: "DAO 2026-20 • 1,237 species" + Send Feedback button + legend badges + "Developed by Mc Andrew Pranada"
- Feedback panel opens as centered modal (not bottom sheet)

---

## Design System

The stylesheet is token-driven; component rules should read tokens rather than literals.

### Colour contract — three tiers
Colour means *exception*, not *attribute*. An attribute shared by most of the dataset carries no colour at all.

| Tier | What | Treatment |
|---|---|---|
| 1 — Status | CR / EN / VU / OTS | The only saturated fill in the table. Full pills. |
| 2 — Exception marks | CITES, non-Angiosperm division, infraspecific rank | One neutral outlined chip (`.mk`), meaning carried by a 6px dot (`.mk-dot`). Rendered **only** for the exception. |
| 3 — Taxonomy & habit | Family, division, habit | No colour. Plain text in `--fa`. |

Because 1,044 of 1,237 taxa are Angiosperms and 1,018 are unlisted by CITES, those two values render nothing — the marks only appear on the 27 Gymnosperms, 166 Pteridophytes, 219 CITES-listed and 14 infraspecific taxa. Endemism stays visible on all 920 endemics but as a bare dot (`.mk-endemic`), not a badge. The footer legend lists exactly what the table draws, which is why Angiosperm is absent from it.

Charts are the one place colour encodes a dimension freely — but growth habit is single-hue and sorted by count, because it is nominal with no inherent colour meaning.

### Neutrals
| Token | Value | Use |
|---|---|---|
| `--ink` | `#1a1a1a` | Primary text |
| `--mu` | `#5c5c5c` | Secondary text |
| `--fa` | `#6f6f6f` | Anything **read**: authority, captions, chart values, counts |
| `--fa-deco` | `#a0a0a0` | Decoration **only**: rules, dashes, disabled glyphs, scrollbar thumb |
| `--bg` / `--sf` | `#f5f4ef` / `#ffffff` | Paper ground / card surface |

`--fa` must clear 4.5:1 against **both** grounds, not just white — `.kbd`, `.ext-link-sub`, `.similar-common`, `.live-status` and the search placeholders sit on `--bg`. `#6f6f6f` measures 5.02:1 on `--sf` and 4.56:1 on `--bg`. If it is read, it takes `--fa`; `--fa-deco` never carries text.

**There is a third ground.** The species panel's identity zone (`.panel-toolbar` + `.panel-hdr`) is a category tint, not white and not paper, and `--fa` was never tuned for it. That zone therefore redefines `--fa` to `--mu` locally:

```css
.panel-toolbar,.panel-hdr{--fa:var(--mu)}
```

Every faint-text consumer in the zone — authority, nav counter, close icon, section eyebrows — resolves `var(--fa)`, so one declaration lifts all four. Without it the deepened CR tint puts them at **4.11:1** and fails AA; with it they read 5.47:1, and 5.84–6.47:1 on the other three tints. **Deepen a panel tint and you must re-check this**, because `--mu` is the last step before the text stops being faint at all.

### Category tints

Two tokens per category, not one: `--<cat>-bg` tints the small status pill, `--<cat>-panel` tints the species panel's identity zone. They were one token until the CR panel proved indistinguishable from the paper ground at pill strength.

Keep them separate. Deepening the shared token would also deepen the pills in the status column, and the four pills are a family that should stay one weight across 1,237 rows.

| Category | Panel tint | Hue | Gap from paper | Sat | Luminance | `--mu` on it |
|---|---|---|---|---|---|---|
| CR | `#fee2e2` | 0 | 50° | 11% | 0.810 | 5.47:1 |
| EN | `#fee4c8` | 31 | 19° | 21% | 0.807 | 5.46:1 |
| VU | `#fcf4c6` | 51 | 1° | 21% | 0.895 | 6.02:1 |
| OTS | `#dbeafe` | 214 | 164° | 14% | 0.811 | 5.48:1 |

**Do not regenerate these by stepping every hue the same amount down a colour scale.** The paper ground `--bg` is itself a warm hue 50 at 2% saturation, so how far a tint sits from hue 50 decides how much saturation it needs to register. CR is 50° away and carries at 11%; OTS is 164° away and carries at 14%; EN and VU are almost the paper's own hue and need 21%. An equal step leaves VU looking like faintly tinted paper — and at the saturation that finally makes VU register on its own, it shouts over CR. These were tuned against each other side by side, then measured.

VU is the one that cannot sit at ~0.81 luminance with the others; yellow that dark goes olive, so it separates on saturation instead at 0.895.

Lowest pairwise separation is EN vs VU at 32.3 — both warm, and the closest pair in the set. Acceptable because only one panel is ever on screen, and each carries its accent rule and a pill naming the category. If you shift either, re-check that pair first.

The mobile sheet's drag handle takes `--fa-deco`, not `--bd-strong`: the latter is a border tone against white and falls to 1.35:1 on a category tint, which made the swipe affordance vanish. It is not held to 3:1 — the handle hints at the gesture rather than being the control, and the labelled close button is always beside it.

**`--bd` and `--bd-strong` are tones for white and paper. Do not put either on a category tint.** Both fall under 1.6:1 there. Anything that has to stay visible across grounds takes `--fa` or darker.

`.copy-cite-btn` is the worked example. Its dashed frame is the entire affordance and the button renders on six different grounds — four tints in the panel, white in the Methods modal. On `--bd` it measured 1.06:1 on the CR tint and **1.30:1 on white**, so it had never been visible anywhere; the tints only made it obvious. It is now `1px dashed var(--fa)`, which clears 3:1 on all six, and inside the panel's identity zone that token resolves to `--mu` — so the frame comes out a step stronger exactly where the ground is busiest, with no second rule. 1px rather than the old 1.5px: at this tone the heavier stroke reads as a box.

Its `:hover` and `.copied` states set a background as well as a border colour, so they are self-contained and unaffected by the tint behind them.

### Identity-zone audit

Every element that paints inside `.panel-toolbar` and `.panel-hdr` was walked in the rendered DOM across all four categories — text against its effective backdrop, all four border sides, own surfaces, and `::before`/`::after` marks. Re-run it after changing anything in that zone; reading the CSS is not enough, because what matters is the field an element actually lands on.

What it found, and what was done:

| Element | Was | Now | Action |
|---|---|---|---|
| `.panel-status-label` (EN) | 4.23:1 | 4.84:1 | **AA failure.** `--en` darkened |
| `.panel-status-label` (VU) | 4.43:1 | 4.79:1 | **AA failure.** `--vu` darkened |
| `.panel-nav-btn` border | 1.06:1 | 2.14:1 | `--bd` → `--fa-deco` |
| `.panel-status .pl` border | 1.19:1 | 4.79:1 | takes `--sp` in this zone |
| `.copy-cite-btn` border | 1.06:1 | 5.46:1 | `--bd` → `--fa`, 1px |

The two status-label failures are the ones that mattered: 12px/600 text under the 4.5:1 floor. `--vu` was additionally failing on the paper ground at 4.47:1, which predates the tints entirely.

**Two things are knowingly left below 3:1.**

*Classification pills* (`.habit-pill`, `.div-pill`, `.endemic-badge`) sit at 1.15–1.44:1 against the tint. They are readable anyway because they clear the field by **hue**, not luminance — 71° to 141° away from it. Their own text passes. The status pill was the single exception at 0–4°, sharing its panel's hue by construction, and that is the one that was fixed. If you add a pill whose hue lands near a category tint, it will need the same treatment.

*Nav buttons* sit at 2.14:1. The arrow glyph inside carries `--mu` at 5.5:1, so the control is identifiable on its own and the border is affordance rather than identification. Pushing it to `--fa` puts a hard dark box on something small enough to compete with the species name.

### Panel body sweep

The body sits on the paper ground, not a tint, so it was swept separately — across seven species chosen to exercise different body content: CITES I, no common name, nine islands, an infraspecific name, and one of each category. The GBIF blocks are async, so the sweep waits for them; sweeping immediately after opening a panel misses the photographs, the occurrence figures and the match badge entirely.

**Zero text failures.** The only text problem the body ever had was `--vu` at 4.47:1 on paper, fixed with the identity-zone work.

Fourteen borders measure between 1.13:1 and 1.9:1, and all are left alone deliberately:

- The white cards — `.dist-block`, `.ext-link`, `.live-block`, `.similar-item`, `.cdfp-btn` — carry a white fill at 1.10:1 over paper plus a hairline at 1.13:1. Neither number is impressive, but the card reads as a flat area difference and every one of them is identified by its own legible text. This is the "blocks on white, body on paper" inversion working as designed; it is the quietest thing in the app on purpose.
- `.dist-also` and `.gbif-caption` have no fill, so their border is their only edge, at 1.30:1. They are dividers inside a card, not controls.
- The rest are badges and pills whose text passes.

**Keyboard focus ring:** `--gl` at 2px with 1px offset, measured on all six grounds it can appear over — 4.86 on white, 4.42 on paper, and 3.97–4.38 on the four tints. Worst case 3.97:1 against a 3:1 requirement.

One trap when re-running any of this: **`element.focus()` does not reliably set `:focus-visible`**, so a programmatic sweep reports no focus ring anywhere and looks like a catastrophic finding. Drive it with a real Tab key press.

Not covered by either sweep: `:hover` and `:active` states. `.copy-cite-btn` was checked by hand because its hover changes the border, and it sets its own background so it is self-contained.

### Type scale
Every `font-size` resolves through these tokens. Six raw px values remain, all deliberate one-offs; the mobile search input is pinned to 16px because iOS Safari zooms the page on focus below that.

| Token | Value | Role |
|---|---|---|
| `--t-micro` | 11px | Mono eyebrows, pill and mark codes |
| `--t-xs` | 12px | Captions, authority, secondary meta |
| `--t-sm` | 13px | Table cells, chips, list items |
| `--t-base` | 14px | Base body, inputs |
| `--t-md` | 16px | Binomials in the table |
| `--t-lg` | 18px | Panel titles |
| `--t-xl` | 22px | Modal titles, stat figures |
| `--t-2xl` | 28px | Empty-state glyph |

Landing-page display sizes (`--t-landing-title`, `--t-landing-stat`) sit outside this scale deliberately.

### Column classes
Responsive show/hide keys off these classes, never `:nth-child` — positional selectors silently retarget when the column order changes, which has already happened once.

`.cc` Status · `.csp` Species · `.cf` Family · `.cco` Common name · `.cds` Distribution

### Performance constraints
All 1,237 rows are in the DOM at once (~23,500 nodes), so two rules matter:
- The search box is bound to `debouncedRender` (120ms), never `render` directly — `render()` rebuilds every row through `innerHTML`.
- `tbody tr` carries `content-visibility:auto`, reset under `@media print` so off-screen rows still print.

---

## Key JS Functions

| Function | Purpose |
|---|---|
| `getFiltered()` | Returns filtered+sorted DATA array |
| `render()` | Renders tbody from getFiltered() — rebuilds all rows, so never bind it straight to an input event |
| `debouncedRender()` | 120ms-debounced `render()`; what the search box is bound to |
| `distIslands(dist)` | Pulls the all-caps island names out of a CDFP `dist` string |
| `titleCaseIsland(s)` | Title-cases an all-caps island name for display |
| `distCell(rec)` | Builds the Distribution cell — first two islands plus a `+N` counter, full list on hover |
| `fetchGBIFMedia(token,key)` | Fetches occurrence media, filters to open licences, dedupes, renders the photo strip |
| `mediaThumbUrl(u)` | Host-specific thumbnail rewrite (iNaturalist, Smithsonian NMNH) |
| `licenceLabel(url)` | Turns a Creative Commons URI into a short code (CC0, CC BY-NC, …) |
| `barRow(label,value,pct,colour,title)` | One bar row for every analytics chart; owns the rule that a value sits outside its bar, or inside it once the bar passes 86% |
| `buildFams()` | Renders family sidebar |
| `openPanel(s)` | Opens species detail panel |
| `closePanel()` | Closes panel, clears active row |
| `fetchGBIF(s)` | Live GBIF species match + occurrences |
| `renderDist(dist, groups)` | Parses distribution string into island/province hierarchy |
| `renderDistLine(text)` | Renders province line with photo/uncertain badges |
| `normalize(s)` | Accent-strips string for search |
| `getInfraRank(scientific)` | Detects var./subsp./f. from scientific name |
| `buildAnalytics()` | Builds analytics modal HTML |
| `applyLang()` | Applies current language to all UI strings |
| `t(key)` | Returns translation string for current language |
| `encodeHash()` | Writes filter state to URL hash |
| `restoreHash()` | Restores filter state from URL hash |

---

## State Variables

```javascript
var cat='ALL'      // Active threat category
var fam=''         // Active family filter
var div=''         // Active division filter
var cites=''       // Active CITES filter ('I', 'II', or '')
var habit=''       // Active habit filter
var region=''      // Active island group ('Luzon Group', etc.)
var island=''      // Active specific island ('SIBUYAN', etc.)
var endemic=false  // Endemic only toggle
var nocommon=false // No common name toggle
var nonendem=false // Non-endemic highlight toggle
var sortCol=''     // Active sort column
var sortDir=1      // Sort direction (1=asc, -1=desc)
var LANG='en'      // Current language ('en' or 'fil')
var activeSpecies=null // Currently open species
```

---

## External Dependencies
- Google Fonts: Cormorant Garamond, IBM Plex Mono, Inter
- GBIF API: `api.gbif.org/v1/species/match` and `api.gbif.org/v1/occurrence/search`
- CDFP: `philippineplants.org/Families/[Family].html` (link-out only, no scraping)
- IPNI: `ipni.org/search` (link-out only)
- Vercel Analytics: `/_vercel/insights/script.js`

---

## Deployment
- **Platform**: Vercel (free tier)
- **Method**: push to `main` → auto-deploy (GitHub Desktop or `git push`)
- **Files needed in repo root**:
  - `index.html`
  - `vercel.json`
  - `logo_512.png`, `logo_192.png`, `logo_180.png`, `logo_152.png`, `logo_32.png`, `logo_16.png`

### Caching — read this before debugging anything on a phone
`vercel.json` sets `Cache-Control: public, max-age=0, must-revalidate` on `/` and `/index.html`, so the HTML is revalidated on every load. The logos keep a week-long cache; they never change.

This exists because the app declares `apple-mobile-web-app-capable`, so it can be added to the iOS Home Screen and run standalone — and a standalone web app caches its HTML far more stubbornly than a Safari tab. While diagnosing a layout bug, **three correct deploys in a row never reached the device at all**; the only fix was deleting and re-adding the Home Screen icon.

**Verify changes in Safari, not from the Home Screen icon.** If the icon shows something stale, delete and re-add it.
- **Enable Vercel Analytics** in project dashboard after deploy

---

## Known Issues / Pending Work
1. **Filipino column headers truncate** — `Kategorya` and `Karaniwang Pangalan` ellipse, by choice. Widening those columns costs the Scientific Name column ~65px in *both* languages to fix a problem that exists in one, and letting headers wrap breaks English `Common Name` onto two lines and grows the header row. Every `<th>` carries a `title` with the full label. The real fix is shorter Filipino labels — a translation call, not a layout one.
2. **Language toggle** — some dynamic panel content (GBIF responses, similar species section titles) may not fully translate.
3. **`habitConf`** — every record is `"verified"`, so the `?` suffix `render()` emits for `"mixed"` is currently unreachable. Harmless, but it can go if the field is never used.

### Resolved
- ~~No plant imagery~~ — CC-licensed GBIF occurrence photographs now appear in the species panel; roughly two thirds of taxa have at least one.
- ~~Distribution data incomplete~~ — coverage measured at **1,232 of 1,237** (99.6%), and it now has its own table column.
- ~~Script tag balance~~ — verified balanced (4 opens / 4 closes).
- ~~Desktop responsive breakpoint~~ — column widths re-measured against real content at every breakpoint; verified at 375, 768, 800, 1001, 1100, 1261 and 1440 in both languages.

---

## Attribution & Rights

The in-app **Methods & Citation** paper and **About** panel are the authoritative versions of this; keep all three in step when any changes.

**Recommended citation** — Pranada, M.A.K. 2026. *Threatened Philippine Plants: an interactive reference to the Updated National List of Threatened Philippine Plants (DAO 2026-20)*. Version 1.0. https://dao202620.vercel.app

Cite the sources directly for their own material: DAO 2026-20 for the taxa and threat categories, the CITES Appendices for appendix listings, CDFP for localities, the GBIF Backbone Taxonomy (doi.org/10.15468/39omei) for occurrence data, and each photographer for their image.

- Developer: **Mc Andrew Pranada**, Botanist. Independent personal project — **not** a DENR or BMB publication, and carrying no official status. Where this tool and the official DAO 2026-20 text differ, the official text governs.
- **Species list and threat categories**: DAO 2026-20, DENR Philippines — an official government issuance. No authorship of the legal instrument or the list is claimed.
- **CITES appendix listings**: from the CITES Appendices themselves, **not** from DAO 2026-20, which does not carry them. Do not attribute these to the DENR.
- **Growth habit**: not part of DAO 2026-20. Assigned species by species by the developer; professional judgment, not an official determination.
- **Distribution**: Co's Digital Flora of the Philippines (Pelser, Barcelona & Nickrent, 2011–). Condensed from their records; CDFP is authoritative.
- **Map coastline**: Natural Earth 1:10m Admin 0 — **public domain**, no attribution required; credited anyway as good practice. Simplified for drawing, so it is a schematic outline and **not a survey boundary**: nothing on the map states anything about territory, maritime limits or disputed areas. Island positions from OpenStreetMap via Nominatim, © OpenStreetMap contributors, under the ODbL. Both are baked into the page; no tile server is contacted.
- **Photographs**: served live from GBIF occurrence records, never hosted or modified here. Open licences only (CC0, CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA, Public Domain Mark); All Rights Reserved and unlicensed images are not shown. Copyright stays with each photographer, each image is credited with its licence and links to its source record, and takedown requests are honoured.
- **Warranty**: provided as is, without warranty. Not for permitting, enforcement, compliance, commercial or legal use.
- Built with Claude (Anthropic)

---

## Contact
pranada55@gmail.com
