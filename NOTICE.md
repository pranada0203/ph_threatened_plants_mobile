# Third-party notices

Every item in this project that was made by someone else: what it is, its licence or terms, and how the project complies. The same list appears in the app under **About → Credits and licences**. Add an entry in the same commit that adds the item.

This project is an independent personal reference tool. It is **not** affiliated with, endorsed by or sponsored by the DENR, the Biodiversity Management Bureau, GBIF, CDFP, CITES, Anthropic or any other organisation named here. Names are used only to say where something comes from.

| Item | Used for | Licence / terms | How we comply |
|---|---|---|---|
| **DAO 2026-20**, DENR, Philippines | Species list and threat categories | Public government issuance | Cited as the source; no authorship of the instrument is claimed; official text linked and stated to govern. |
| **CITES Appendices** | Appendix listings | The Convention's own published appendices | Cited to CITES, not to DAO 2026-20. |
| **Co's Digital Flora of the Philippines** (Pelser, Barcelona & Nickrent, 2011–) | Distribution (condensed from their records) | **Terms not yet confirmed — see below** | Credited and linked; CDFP stated to be authoritative. |
| **GBIF** — Backbone Taxonomy, doi.org/10.15468/39omei | Name matching and occurrence counts, fetched live | GBIF data-use terms; backbone CC BY 4.0 | Fetched live, not stored. Cited. |
| **GBIF-served photographs** | Up to three per species | Each image's own licence. Only CC0, CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA and Public Domain Mark are shown; all others are filtered out | Served live from the holding platform, never copied or altered; credited to the photographer with licence and a link to the source record; takedown requests honoured. |
| **Natural Earth** 1:10m Admin 0 | Coastline (simplified, baked into the page) | Public domain | Credited as good practice; stated to be schematic, not a survey boundary. |
| **OpenStreetMap contributors** via Nominatim | Island positions for the map | ODbL 1.0 — © OpenStreetMap contributors | Credited with licence; positions baked into the page. |
| **Newsreader** — © 2020 The Newsreader Project Authors | Typeface | SIL Open Font License 1.1 — `fonts/OFL-newsreader.txt` | Self-hosted; licence file kept alongside; unmodified. |
| **Hanken Grotesk** — © 2021 The Hanken Grotesk Project Authors | Typeface | SIL Open Font License 1.1 — `fonts/OFL-hankengrotesk.txt` | Self-hosted; licence file kept alongside; unmodified. |
| **JetBrains Mono** — © 2020 The JetBrains Mono Project Authors | Typeface | SIL Open Font License 1.1 — `fonts/OFL-jetbrainsmono.txt` | Self-hosted; licence file kept alongside; unmodified. |

The font files in `fonts/` are the `latin` and `latin-ext` subsets as served by Google Fonts, copied unmodified. The subsetting was done by Google, not by this project.

## Link-outs (no content copied)

IPNI, CDFP species pages, the official DAO 2026-20 PDF (BMB) and GBIF record pages are linked, not reproduced.

## Open item: CDFP distribution data

The Distribution column is a condensed reading of CDFP's records. Credit is given, but **credit is not permission**, and no written permission or reuse terms from CDFP are on file. Before release, one of:

1. obtain CDFP's written permission (draft request: `docs/cdfp-permission-request.md`);
2. find and record CDFP's published reuse terms and comply with them; or
3. withdraw the Distribution column and link out to CDFP instead.

The release is held until this is resolved.

## Open item: source of common names

The `common` field (for example, "Ilocos thunbergia") has no source recorded in this repository. Before release the author should confirm where the common names come from (DAO 2026-20, CDFP, or their own compilation) and add the row above, with licence and credit.

## AI assistance

The page was written with Claude (Anthropic) as a coding and design-review assistant. Claude is a tool, not an author: every taxonomic judgment, habit assignment, correction and editorial decision is the author's.
