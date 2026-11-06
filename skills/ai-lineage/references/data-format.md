# Data file format

One JSON file holds everything. The PNG, SVG, PDF, Mermaid text and source list are all made from it. Name it `<slug>.lineage.json` and keep it in `<working folder>/ai-lineage/<slug>/`. Output files take their names from it: `x.lineage.json` gives `x.png`, `x.svg`, `x.pdf`, `x.mmd`, `x.sources.md`, and `x.portrait.png` with `--portrait`. A file named `x.json` also gives `x.*`. Never name an output or data file `metadata.json`, because the skills installer skips that name.

## Top level

| Field | Required | Meaning |
| --- | --- | --- |
| `schema` | yes | The number `1`. |
| `subject` | yes | What the lineage is of, for example `Mixture of Experts`. Used in the image description. |
| `title` | yes | Chart title. It must fit on one line. |
| `lang` | yes | `"ko"` or `"en"`. Nothing else. |
| `researched` | yes | The day you did the research, as a full `YYYY-MM-DD`. |
| `style` | no | `woodcut`, `soft` or `proof`: the look the user chose. Without it the tool uses `woodcut`. The `--style` option wins. |
| `credit` | no | `true` adds the credit line, which is off by default. `--credit` does the same. |
| `nodes` | yes | 1 to 9 nodes. |
| `edges` | yes | The lines between nodes. May be empty, but a node with no line gets a warning. |
| `focal` | no | `{ "node": "<id>", "note": "<one line>" }`. At most one key link. |
| `omitted` | no | Strings naming what you left out. Printed as one line under the chart. With 9 nodes and an empty list, `check` warns. |
| `notes` | no | Free text for the data file. It is not drawn, but it is added as a final `Notes` section at the end of the source list. |

## Node

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Lowercase letters, digits and hyphens, starting with a letter or digit. Unique. |
| `row` | yes | `root`, `revival`, `merge` or `spread`. A row with no nodes is not drawn. |
| `kind` | yes | `paper`, `model`, `hardware`, `release`, `dataset` or `other`. Shown as a small tag on the top-left border of the box (PAPER, MODEL, HW, RELEASE, DATA, OTHER). |
| `name` | yes | The box title. See "Fitting text" below. |
| `sub` | no | Short detail, for example an author or a version. The line under the name reads `<date> · <sub>`. |
| `date` | yes | First public date: `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. |
| `side` | no | `true` for another branch or a condition rather than the main line (for example the Transformer, or GPU training). It is filled with a wood-grain tone. |
| `sources` | yes | At least one source. |
| `timeline` | no | `{ "id": "...", "url": "..." }` when the same event is in the AI Timeline Log, otherwise `null` or omit it. It is not drawn. It adds the address to the source list. Not allowed on a node dated before 2022-11-30. |

Nodes in a row are placed from the left, ordered by date. A missing month or day counts as the earliest value, and ties are ordered by `id`.

## Source

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | yes | Title as printed in the source. |
| `url` | yes | Must start with `http://` or `https://`. |
| `opened` | yes | `true` only if you opened this source in this session. Otherwise `false`. A node whose sources are all `false` is drawn as not verified (dashed border) and `check` warns. |
| `by` | no | Authors or organization. |
| `year` | no | Integer. |
| `venue` | no | Journal, conference or site. |
| `original` | no | The title in its original script, when the chart shows an English or romanized name. |

## Edge

| Field | Required | Meaning |
| --- | --- | --- |
| `from`, `to` | yes | Node ids. The two must differ, and at most one edge may join the same two nodes. |
| `type` | yes | `lineage` (builds on), `merge` (another branch joins here) or `enables` (a condition such as hardware or data). `enables` is always drawn dotted. |
| `status` | yes | `confirmed` or `inferred`. Inferred lines are dashed. |
| `evidence` | when `confirmed` | `{ "node": "<id>", "where": "<section, page, figure>" }`. `node` must be the `from` or the `to` node, the one whose text says the link exists. A confirmed edge without evidence is an error. So is a confirmed edge whose evidence node has no source with `"opened": true`: open a source of that node, or mark the edge `inferred`. |

A `lineage` edge whose target is dated earlier than its source gets a warning.

Edges only go downward or stay in the same row. An edge to a higher row is an error (`goes upward`), so put earlier work in higher rows (`root` first, then `revival`, `merge`, `spread`).

Two boxes that sit next to each other in one row, with no box between them, get a direct arrow from the facing side of one to the facing side of the other. When a chart has such an arrow, every gap between columns widens from 16 to 40 px and the boxes get narrower, so check the fit. A same-row edge that skips over a box still goes down, across and up under the row.

## Fitting text

The canvas and type sizes never change. The tool measures the real text with the bundled fonts, and `check` reports what does not fit.

- The line under the name is the date, then a middle dot, then `sub`, in a monospaced font. Keep `sub` short, about 14 characters. `check` says `sub does not fit` if it is too long.
- A name wraps at spaces onto at most two lines at 28 px. A single word wider than the box is an error, because it cannot be split. Hangul takes about 26 px per syllable and Latin about 16 px per letter.
- Box width depends on the widest row: there are `max(2, most nodes in one row)` columns. A row of four makes every box narrower.
- At most 4 nodes per row in landscape and 3 in portrait. At most 9 nodes in all.
- Height is limited as well. In landscape, two-line names in every one of four rows do not fit, and `check` reports `too tall`. Shorten names, move detail into `sub`, or move a node to `omitted`.
- The title, the key link note and the omitted list must each fit on one line.
- The legend shows only what the chart uses, for example the "condition" entry appears only if some edge has type `enables`.

## Messages from `check`

Each message names the node or edge. Exit code 1 means the data has errors, and nothing is drawn. Typical ones: `no source, at least one is required`, `confirmed edge needs evidence { node, where }`, `name does not fit in two lines`, `goes upward`, `timeline is not allowed before 2022-11-30`, and a message naming a character that no bundled font has.

## Short example

The names are made up. Do not copy them into a real chart.

```json
{
  "schema": 1,
  "subject": "Sparse Routing",
  "title": "Sparse Routing: from a 2012 paper to Gamma-Net",
  "lang": "en",
  "researched": "2026-11-05",
  "nodes": [
    {
      "id": "alpha-2012", "row": "root", "kind": "paper",
      "name": "Alpha Sparse Routing", "sub": "Rivera et al.", "date": "2012-06",
      "sources": [{ "title": "Alpha Sparse Routing", "by": "Rivera, Chen", "year": 2012,
                    "venue": "Example Journal", "url": "https://example.org/alpha", "opened": true }]
    },
    {
      "id": "beta-2020", "row": "revival", "kind": "paper",
      "name": "Beta Scaling", "sub": "Okafor et al.", "date": "2020-03-14",
      "sources": [{ "title": "Beta Scaling", "url": "https://example.org/beta", "opened": true }]
    },
    {
      "id": "gamma-2024", "row": "spread", "kind": "model",
      "name": "Gamma-Net", "sub": "v1", "date": "2024-05",
      "sources": [{ "title": "Gamma-Net model card", "url": "https://example.org/gamma", "opened": false }],
      "timeline": null
    }
  ],
  "edges": [
    { "from": "alpha-2012", "to": "beta-2020", "type": "lineage", "status": "confirmed",
      "evidence": { "node": "beta-2020", "where": "Section 2, cites Rivera et al. 2012" } },
    { "from": "beta-2020", "to": "gamma-2024", "type": "lineage", "status": "inferred" }
  ],
  "focal": { "node": "beta-2020", "note": "Made the 2012 idea work at scale" },
  "omitted": ["Delta Gating (2016)"]
}
```

A full worked example, with its drawn files, is in the `examples/` folder of this skill.
