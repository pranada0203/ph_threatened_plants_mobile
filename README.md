# DAO 2026-20 — Threatened Philippine Plants Dashboard

## Project Overview
A single-file, mobile-first web application serving as an interactive reference tool for the Updated National List of Threatened Philippine Plants under DENR Administrative Order No. 2026-20. The tool lists 1,237 threatened Philippine vascular plant taxa with full filtering, analytics, and species detail.

**Live URL:** https://phthreatenedplantsmobile.vercel.app  
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
- External databases: IPNI, GBIF (with live occurrence data via GBIF API)
- Co's Digital Flora of the Philippines (CDFP) photo link — links to family page
- Local Distribution — parsed from dist field, all-caps = island label, mixed case = provinces, (photos) badge, ? uncertain badge
- Similar species (same family + category)

### GBIF Integration
Live API calls to `api.gbif.org`. Uses token-based staleness guard to prevent race conditions. Fallback to synonym search if species not matched. Occurrence counts for global and Philippines.

### Analytics Modal
Charts describe the **current filtered view**, not the whole dataset. Top 15 Families, Threat Category (with a per-category breakdown table), Division donut with Endemicity by Division, CITES Listing Status, Growth Habit, Top Islands by Threatened Species.

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
- Send Feedback panel (slide-up, with email + disclaimer)
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
  - `logo_512.png`, `logo_192.png`, `logo_180.png`, `logo_152.png`, `logo_32.png`, `logo_16.png`
- **Enable Vercel Analytics** in project dashboard after deploy

---

## Known Issues / Pending Work
1. **No plant imagery** — the app is a botanical reference with no photographs. CDFP photos are linked but never shown. GBIF's occurrence-media endpoint returns CC-licensed images with attribution and the app already calls GBIF, so a thumbnail in the species panel is within reach of the existing integration. Open product decision.
2. **Filipino column headers truncate** — `Kategorya` and `Karaniwang Pangalan` ellipse, by choice. Widening those columns costs the Scientific Name column ~65px in *both* languages to fix a problem that exists in one, and letting headers wrap breaks English `Common Name` onto two lines and grows the header row. Every `<th>` carries a `title` with the full label. The real fix is shorter Filipino labels — a translation call, not a layout one.
3. **Language toggle** — some dynamic panel content (GBIF responses, similar species section titles) may not fully translate.
4. **`habitConf`** — every record is `"verified"`, so the `?` suffix `render()` emits for `"mixed"` is currently unreachable. Harmless, but it can go if the field is never used.

### Resolved
- ~~Distribution data incomplete~~ — coverage measured at **1,232 of 1,237** (99.6%), and it now has its own table column.
- ~~Script tag balance~~ — verified balanced (4 opens / 4 closes).
- ~~Desktop responsive breakpoint~~ — column widths re-measured against real content at every breakpoint; verified at 375, 768, 800, 1001, 1100, 1261 and 1440 in both languages.

---

## Attribution & Disclaimer
- Developer: **Mc Andrew Pranada**, Botanist
- Data source: DAO 2026-20, DENR Philippines (official government issuance)
- The developer does not claim authorship of the legal instrument or species list
- Habit classifications verified species-by-species by the developer
- Distribution data sourced from Co's Digital Flora of the Philippines (Pelser et al. 2011–)
- Built with Claude (Anthropic)

---

## Contact
pranada55@gmail.com
