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
| ≤768px | Phone. Two columns (Status, Species); family, habit and authority fold into the meta line under the binomial, common name beneath. The list runs edge to edge. Detail panel, modals and filters are bottom sheets. Category filter is the docked segmented bar. |
| 769–1000px | Narrow tablet / small window. Common name and Distribution drop; common name stacks under the binomial. The header gives up its DAO pill and the Home label. |
| 769–1260px | Tablet. Narrower sidebar (188px), tighter cell padding, keyboard hints hidden. |
| 769–1600px | Detail panel **floats** over the table and slides in, rather than docking — docking took its width out of the one flexible column. |
| ≥1601px | Detail panel docks inline beside the table. |

The phone and desktop blocks are scoped to `screen`. A printed A4 page is ~680px wide, and without that scope it fell into the phone block and printed the fixed bottom bar on every page. Print has its own block: the table in ink on white, Distribution dropped.

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
12 species name corrections from CDFP verification:
- Begonia noraaunoriae, normaaguilariae, platyphylla
- Dendrobium victoriae-reginae
- Wurfbainia mindanaensis, palawanensis
- Sphaerostephanos convergens
- Pronephrium camarinense
- Entada rheedei
- Syzygium siderocola
- Oceaniopteris egregia (was "Oceanopteris egregia")
- Phaeanthus villosus (was "Phaenthus villosus")

---

## Features

### Filtering
- **Status tabs**: All / CR / EN / VU / OTS — a segmented control in the header on desktop, the docked bottom bar on phone. Both are `<button>`s (they were click-only `<div>`s, unreachable by keyboard) and stay in sync. The cover’s four category figures are entry points into the same filter.
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

Land is drawn in `--land` (a quiet warm grey, lighter than the card in dark mode so islands never read as holes) with a `--bd-strong` coast stroke, on the white chart card. **No new hue** — the olive data symbols (`--g`) remain the only saturated thing in the card. Labels carry a halo of the card colour (`--sf`), and their font comes from CSS (`.island-map text`), which overrides the SVG presentation attribute.
 Top 15 Families, Threat Category (with a per-category breakdown table), Division donut with Endemicity by Division, CITES Listing Status, Growth Habit, Top Islands by Threatened Species.

Chart conventions:
- Bars are scaled to the largest value **in their own chart**, and each chart says so, because a full-width bar otherwise reads as "all of them" rather than "the most of any one".
- A bar's value sits at the end of that bar, flipping inside the fill above 86% so it cannot overflow the track.
- CITES is a proportion bar plus figures, not a donut — 1,018 of 1,237 taxa are unlisted, so a donut spent 82% of its area drawing an absence and left App. I (13 taxa) as a hairline.

### Language Toggle
EN/FIL flag button, on the cover and in the catalogue header (both carry `.js-lang-toggle`; `applyLang()` updates every one). Switches all UI chrome to Filipino. Scientific names, authorities, DAO references, CITES codes, island names and the four category names all stay in English/Latin. Translation object stored in `var T={en:{...}, fil:{...}}`. English interface labels are sentence case.

The flags (`#i-flag-ph`, `#i-flag-us` in the sprite) are drawn **for a circle** on a 32×32 canvas, not cropped from 4:3 flags: cropping cut the Philippine sun and two of its three stars, and the US stars never rendered at all (they were an SVG `<marker>`, which does not draw through `<use>`). Every star and sun ray is placed inside the circle; the US stars are round dots, since a star at 26px is under a pixel wide. Official colours: PH `#0038a8` / `#ce1126` / `#fcd116`, US `#b22234` / `#3c3b6e`.

### Theme
Light and dark, following the system by default. The sun/moon button (`.js-theme-toggle`, cover and header) records an explicit choice as `data-theme` on `<html>` and in `localStorage['dao-theme']`; a script at the very top of `<head>` re-applies it before the stylesheet parses, so a dark-mode visitor never sees an ivory frame. The button always offers the opposite of what is on screen, and relabels itself when the system theme changes. `#metaTheme` (the browser-chrome colour) follows.

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

### Cover
- A greeting: the herbarium-sheet illustration, the serif title, one search field (the "composer") with a clay send button, and a live match count beneath it.
- The list as one card: 1,237 in display serif, the category proportion bar, and four **category buttons** — each opens the catalogue already filtered (`.js-enter-cat`, which clicks the matching `.sc` tab so there is one filter path). "Explore the list" resets the category to All; other filters are left as they were.
- Supporting documents as a quiet row: Methods & citation, the official PDF, Analytics.
- Theme and language controls top right; About and the author in the footer.
- Verified to fit without scrolling at 1280×720, 1440×800, 1440×900, 393×695, 375×667 and 430×932 — **in fallback fonts**, which is what a first visit renders under `display=optional`.

### Mobile (≤768px)
- Sticky, translucent header + toolbar: `DAO 2026-20` as a mono eyebrow above the title; theme, language and home as icon buttons; search, Filters (with a count badge), Analytics, Export.
- The title may wrap (balanced) rather than truncate: English fits one line in Newsreader, Filipino never does.
- List edge to edge. Status + Species only; family, habit and authority on one meta line under the binomial, in that order — only the authority truncates. Common name beneath.
- Docked bottom bar: a segmented control, All · CR · EN · VU · OTS with counts, the active segment a raised white thumb with its code in the category colour.
- Feedback: an ink round button above the bar.
- Detail panel, analytics, filters and feedback are bottom sheets. Panel and sheets swipe to close (`enableSheetSwipe`); the panel's open/closed transforms carry no `!important`, so the inline transform the gesture writes wins and the sheet follows the finger.

### Desktop/iPad (≥769px)
- Header row: mark, serif title, DAO pill, the category segmented control, theme, language, Return home.
- Toolbar: search (with result count), Filters, Compact, Analytics, Export, Print, keyboard hints.
- Family sidebar flat on the paper; the table is the single white card.
- Five columns: Status, Scientific name & authority, Family, Common name, Distribution.
- Footer: count, Send feedback, and a legend of exactly what the table draws.
- Filters and feedback open as centred dialogs.
- A closed panel is `visibility:hidden` once its slide finishes, so its links leave the tab order.

---

## Design System

The design language is Anthropic's: warm ivory paper, near-black ink, one clay accent, an editorial serif for anything read as a name or a title, a quiet grotesque for the interface, hairlines and soft light instead of boxes. The stylesheet is token-driven; component rules read tokens, never literals, and the dark theme is a second set of values for the same names — no component knows which theme it is in.

### Colour contract

**Clay is the interface, never the data.** `--accent` marks the interface's own state — the send button, the focus ring, the open row's leading rule, the filter-count badge, the brand plate, links. It encodes nothing about a plant, so it can never be mistaken for a threat category, even though CR and EN are warm hues too.

Data colour keeps the three-tier rule — colour means *exception*, not *attribute*:

| Tier | What | Treatment |
|---|---|---|
| 1 — Status | CR / EN / VU / OTS | The only saturated fill in a row: a tinted pill with a dot. |
| 2 — Exception marks | CITES, non-Angiosperm division, infraspecific rank | One neutral chip (`.mk`), meaning carried by a 6px dot. Rendered **only** for the exception. |
| 3 — Taxonomy & habit | Family, division, habit | No colour. |

1,044 of 1,237 taxa are Angiosperms and 1,018 are unlisted by CITES, so those render nothing; the marks appear only on the 27 Gymnosperms, 166 Pteridophytes, 219 CITES-listed and 14 infraspecific taxa. Endemism stays on all 920 endemics as a bare olive dot. **Every selected filter chip is solid ink**, whatever it filters — "on" is a state, and hue stays with the data.

Charts use one olive data hue, `--g`, for every single-series chart and the map, and the category colours for the category chart. The JS builders reference `--g` by name, which is why it keeps the old token.

### Neutrals

`--fa` is for anything **read** at small sizes; it must clear 4.5:1 on all three grounds. `--fa-deco` is decoration only — rules, `aria-hidden` separators, disabled glyphs — and never carries text. The "—" placeholder for a missing common name or distribution is read — it says "none recorded" — so it takes `--fa`.

| Token | Light | on `--bg` / `--bg-2` / `--sf` | Dark | on `--bg` / `--bg-2` / `--sf` |
|---|---|---|---|---|
| `--ink` | `#141413` | 17.5 / 16.3 / 18.4 | `#faf9f5` | 14.4 / 15.8 / 12.6 |
| `--mu` | `#57564f` | 7.00 / 6.52 / 7.37 | `#c2c0b6` | 8.31 / 9.12 / 7.25 |
| `--fa` | `#6b6a64` | 5.15 / 4.80 / 5.43 | `#a3a198` | 5.85 / 6.43 / 5.11 |
| `--fa-deco` | `#b0aea5` | decoration | `#6b6a64` | decoration |
| `--accent-ink` | `#a8492a` | 5.46 / 5.09 / 5.75 | `#e0896b` | 5.75 / 6.31 / 5.01 |

Grounds: `--bg` ivory `#faf9f5` (the page), `--bg-2` `#f3f1ea` (tracks, wells, selected rows), `--sf` `#ffffff` (cards, table, sheets). Dark: `#262624` / `#1f1e1d` / `#30302e`. `--accent` itself (`#d97757`) is 2.96:1 on ivory, so it is a fill and mark colour only.

`--bd` and `--bd-strong` are hairlines for the neutral grounds. Anything that must stay visible on a **category tint** takes `--bd-tint`, an alpha of ink that darkens whatever it sits on (the panel's nav buttons, its chips, the copy-citation button).

### Category colours

Four tokens per category: ink, pill tint, pill edge, panel tint. Hues follow the IUCN convention (red, orange, yellow; blue for the non-IUCN "other threatened"), pulled toward the warm paper so the four sit in one family. EN and VU inks were deepened until they cleared 5:1 on their own panel tints.

| | Ink (light) | on `--bg` | on pill | on panel | `--mu` on panel | Ink (dark) | on pill | on panel |
|---|---|---|---|---|---|---|---|---|
| CR | `#a8352a` | 6.21 | 5.42 | 5.02 | 5.66 | `#f08a78` | 5.76 | 5.64 |
| EN | `#98480f` | 6.10 | 5.39 | 5.02 | 5.76 | `#eb9b5b` | 6.11 | 5.98 |
| VU | `#765b06` | 6.10 | 5.53 | 5.13 | 5.89 | `#d9b75a` | 6.84 | 6.74 |
| OTS | `#375f90` | 6.23 | 5.60 | 5.18 | 5.83 | `#8fb4de` | 6.39 | 6.31 |

**The panel's identity zone redefines `--fa`.** `--fa` measures 4.16–4.33 on the four light panel tints, so the zone sets

```css
.panel-toolbar,.panel-hdr{--fa:var(--mu)}
```

and every faint-text consumer inside it — authority, counter, close icon, section labels — lifts at once. Deepen a tint and this is the first thing to re-measure.

**Chart fills carry their own labels.** `barRow()` moves a value *inside* its bar past 86%, so every chart fill must carry white text (light) or `#1f1e1d` (dark) at AA: `--g` 5.29, CR 6.55, EN 6.42, VU 6.42, OTS 6.56, `--gym` 5.68, `--pte` 5.34, `--c1` 6.94, `--c2` 5.95 in light; 5.1–8.6 in dark. Lighten a chart hue and its inside label fails.

**Focus ring:** 2px `--focus`, 2px offset — `#b8552f` in light (≥3.68:1 on every ground, the four tints included), `#e0896b` in dark (≥4.93:1).

### Type

| Family | Role |
|---|---|
| **Newsreader** | Display, binomials, figures, and long-form reading (the Methods paper and About are set in it). Variable with an optical-size axis, so the 56px cover title and the 17px table italic are each drawn for their size. |
| **Hanken Grotesk** | Interface text. |
| **JetBrains Mono** | Codes and figures: CR, CITES II, counts, licence codes. |

Loaded with `display=optional` (see the comment on the `<link>`), so a first visit renders in the fallbacks — Georgia and `system-ui` — and the layout is checked in those too.

| Token | Value | Role |
|---|---|---|
| `--t-micro` | 11px | Codes, pills, mono figures |
| `--t-xs` | 12px | Captions, authority, secondary meta |
| `--t-sm` | 13px | Table cells, chips, list items |
| `--t-base` | 14px | Body, inputs |
| `--t-md` | 16px | Binomials (the table sets them at 17px) |
| `--t-lg` | 18px | Sheet titles, chart titles |
| `--t-xl` | 22px | Figures, modal titles on phone |
| `--t-2xl` | 28px | Panel binomial, modal titles |

The phone search inputs are pinned to 16px; iOS Safari zooms the page on focus below that.

### Shape, elevation, motion

Radii `--r-2xs` 4 · `--r-xs` 6 · `--r-sm` 8 (buttons) · `--r-md` 12 (inputs, cards) · `--r-lg` 16 (table, charts) · `--r-xl` 20 (composer, sheets, modals). Surfaces separate by a single figure/ground step and soft shadow rather than borders; card edges are `inset` box-shadows so they never change a box's size. Motion is short and eased (`--ease`, `--ease-sheet`); `prefers-reduced-motion` removes it.

### Contrast audit

Every visible text element is measured against the ground it **actually lands on**: ancestor backgrounds composited, alpha included, from the root down. Swept in light and dark, at 1440×900 and 393×695, across 20 states — the cover and its live hint; the catalogue; a panel of each category, header and body, with GBIF results (mocked) rendered; search highlights; the non-endemic wash; analytics top and bottom; the filter sheet with a chip selected and a group expanded; feedback; the Methods paper top and bottom; About. **Result: zero text failures in every combination.**

What the sweep needs to be trusted — each of these has produced a confidently wrong answer before:

- **Disable transitions first** (`*{transition:none!important;animation:none!important}`). Reading computed style mid-transition returns the start value.
- **Wait for the GBIF blocks.** They are async; sweeping straight after opening a panel misses the photographs, the figures and the match badge.
- **Bar values inside a bar sit on a sibling**, not an ancestor: measure them against `.bar-fill`, or they read as white on the track.
- **Skip `aria-hidden` subtrees** — they are decoration by declaration, which is the `--fa-deco` rule.
- **`element.focus()` does not reliably set `:focus-visible`.** Drive focus with a real Tab key press, or the sweep reports no focus ring anywhere.
- **Hover cannot be read from computed style.** Mirror `:hover`/`:active` rules onto classes (a pseudo-class and a class have identical specificity, so the real cascade decides). When walking rules, test `selectorText` before recursing: every `CSSStyleRule` now exposes an empty `cssRules` list.

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
- Google Fonts: Newsreader, Hanken Grotesk, JetBrains Mono
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
- ~~`.ds-more` below AA~~ — the `+N` island counter used `--fa-deco` at 2.37:1. It now takes `--fa` and stays quieter than the island names by size, face (mono) and a small well, not by a failing tone.
- ~~Desktop responsive breakpoint~~ — column widths re-measured against real content at every breakpoint; verified at 375, 768, 800, 1001, 1100, 1261 and 1440 in both languages.

---

## Brand mark

A **herbarium sheet** — a mounted specimen with its determination label. It was chosen over the previous conifer for a reason worth keeping: conifers are 27 of 1,237 taxa, the smallest of the three divisions, so the old mark depicted 2% of the list and read as temperate rather than Philippine. A herbarium sheet says what the tool actually is, which is a taxonomic reference tied to a legal instrument, not a nature app.

`logo.svg` is the master. The same geometry is duplicated as a `<symbol id="i-logo">` in the sprite inside `index.html`, and the header, landing plate and feedback sheet all draw it through `<use>` rather than fetching a raster — the page requests nothing at runtime, and that now includes its own logo.

**Colours are literal, not `var()`.** The same geometry is rasterised into the PNG favicons, and a rasteriser cannot resolve custom properties. The plate and label are clay `#d97757` (`--accent`), the sheet ivory `#faf9f5` (`--bg`), the specimen ink `#141413` (`--ink`); keep them in step with those tokens by hand. The mark is the same in both themes — it is an icon with its own ground.

The literals are *defaults* inside `var()`, so the mark has parts that can be switched off per placement. Custom properties inherit into a `<use>` shadow tree, which ordinary selectors cannot reach — this is the only way to restyle the mark's internals from outside.

| Token | Controls |
|---|---|
| `--mark-plate` | the rounded-square ground |
| `--mark-sheet` / `--mark-sheet-edge` | the sheet's fill / its outline |
| `--mark-ink` | stem and leaves |
| `--mark-label` | the determination label block |

**The cover does not use the mark.** It carries a larger drawing of the same idea: a hand-drawn herbarium sheet with a mounted specimen, straps and a determination label, in bold ink line with flat fills set a few units off-register — Anthropic's illustration manner. Every colour in it is a class (`.art-*`) reading `--art-*` tokens, so it follows the theme. Its leaves were generated as exact almond curves by a small script; it is inline in the cover markup, so edit it there.

Files, and how to regenerate them:

| File | Role |
|---|---|
| `logo.svg` | master, and the favicon modern browsers use |
| `logo_32.png` / `logo_16.png` | legacy favicon fallback |
| `logo_180.png` | `apple-touch-icon`, the iOS home screen |

The 16px PNG is drawn from a **simplified variant** — bigger sheet, thicker stem, one pair of leaves, no label — because the full mark's detail is below what 16 pixels resolve. Only one `apple-touch-icon` size is declared; iOS scales from 180 and the extra 152/192 files were doing nothing.

`logo_180.png` is drawn **full-bleed** (square plate, no corner radius): iOS applies its own corner mask and fills transparent corners with black.

There is no local rasteriser in this project. The PNGs are generated by rendering the SVG in a headless browser and screenshotting it at 1× with a transparent background. If you regenerate them, check the PNG signature and the IHDR dimensions before writing — a silently truncated file still writes.

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
