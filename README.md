# DAO 2026-20 — Threatened Philippine Plants Dashboard

## Project Overview
A single-file, mobile-first web application serving as an interactive reference tool for the Updated National List of Threatened Philippine Plants under DENR Administrative Order No. 2026-20. The tool lists 1,237 threatened Philippine vascular plant taxa with full filtering, analytics, and species detail.

**Live URL:** https://phthreatenedplantsmobile.vercel.app  
**Repository:** Connected to Vercel via GitHub (GitHub Desktop used for deployment)  
**Developer:** Mc Andrew Pranada (Plant Taxonomist / Botanist)  
**Built with:** Claude (Anthropic)

---

## Current File
**`dao_2026_20_v11_mobile.html`** — rename to `index.html` for Vercel deployment.

This is a single unified HTML file serving both mobile (≤768px) and desktop/iPad (≥769px) via CSS breakpoints. There is no build step, no framework, no backend.

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
Charts: Top 15 Families, Threat Category Breakdown, Division Donut, CITES Donut, Growth Habit, Top Islands by Threatened Species, Endemicity by Division.

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
- Table: Status + Family + Scientific Name (with stacked common name) only
- Language toggle: FIL/EN pill in stat row

### Desktop/iPad (≥769px) — `@media (min-width:769px)`
- Full sidebar with family list + search
- Full toolbar with all filter chips
- Side-sliding detail panel (width-based transition)
- All table columns visible
- Bottom nav hidden, footer shown
- Footer contains: "DAO 2026-20 • 1,237 species" + Send Feedback button + legend badges + "Developed by Mc Andrew Pranada"
- Feedback panel opens as centered modal (not bottom sheet)

---

## Key JS Functions

| Function | Purpose |
|---|---|
| `getFiltered()` | Returns filtered+sorted DATA array |
| `render()` | Renders tbody from getFiltered() |
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
- **Method**: GitHub Desktop → push to main → auto-deploy
- **Files needed in repo root**:
  - `index.html` (renamed from dao_2026_20_v11_mobile.html)
  - `logo_512.png`, `logo_192.png`, `logo_180.png`, `logo_152.png`, `logo_32.png`, `logo_16.png`
- **Enable Vercel Analytics** in project dashboard after deploy

---

## Known Issues / Pending Work
1. **Distribution data incomplete** — CDFP scraping done via separate Claude account (pteridophytes + some others). Full distribution for all 1,237 species is a work in progress.
2. **Desktop responsive breakpoint** — Stages 1-4 of desktop restoration applied. Minor polish may remain.
3. **Script tag balance** — file has 2 `<script>` opens and 3 `</script>` closes as of last session — verify before deploy and fix if causing load issues.
4. **Language toggle** — FIL/EN toggle implemented. Some dynamic panel content (GBIF responses, similar species section titles) may not fully translate.

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
