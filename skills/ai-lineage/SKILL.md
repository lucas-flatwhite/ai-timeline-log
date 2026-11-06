---
name: ai-lineage
description: Draws a sourced lineage chart for an AI technique, model family or idea. Use when the user asks where an AI technique came from, what its lineage or roots are, which papers it started from, how it descends from earlier work, or asks to draw a lineage chart, family tree or origin timeline for it. Researches the origin papers and releases, checks every date against primary sources, and renders the chart as SVG, PNG, PDF and Mermaid together with a source list.
---

# AI lineage chart

This skill traces where an AI technique, model family or idea came from and draws the result as one chart. The chart has at most nine boxes, placed in four rows (roots, revival, merge, spread) and joined by lines. Every box has a source, and a node whose sources you could not open at all is marked "not verified" in the chart. Every line is marked as confirmed or inferred.

You write one JSON data file. A bundled script checks it and draws from it. Nothing needs to be installed except this skill.

All commands below are relative to the folder that contains this `SKILL.md`. Run them from the user's working folder with the full path to `scripts/lineage.mjs`, so that data and output stay outside the skill folder. Never put data or drawn files inside the skill folder, because a skill update can replace it. The script finds its fonts and libraries by itself, so it works from any current directory. It needs Node.js 20 or later.

## Steps

1. **Narrow the scope.** If the subject is broad ("reasoning models", "agents"), ask what exactly the user wants the lineage of, and wait for the answer. If it is specific ("mixture of experts", "LoRA"), start.
2. **Research.** Follow [references/research.md](references/research.md). Open every source you cite. Do not write titles, authors or dates from memory.
3. **Write the data file** at `<working folder>/ai-lineage/<slug>/<slug>.lineage.json`. The fields and limits are in [references/data-format.md](references/data-format.md). `<slug>` is a short lowercase name for the subject, such as `moe`.
4. **Check.** Run `node scripts/lineage.mjs check <file.lineage.json>`. Exit code 0 means ok, 1 means the data has errors, 2 means a usage error, 3 means an internal failure (a crash or a file that could not be written, not a problem in the data; report the message to the user instead of editing the data). Fix every error and run it again. Do not draw until it passes. Warnings do not block, but read them and report them in step 6. `check` tests one look (the `style` in the data file, or `woodcut`) in landscape only.
5. **Draw.** Run `node scripts/lineage.mjs draw <file.lineage.json>`. Options:
   - `--style woodcut|soft|proof` picks the look. The default is `woodcut`. Use another one only when the user asks for it, and do not ask every time. See [references/styles.md](references/styles.md).
   - `--no-credit` leaves out the credit line.
   - `--portrait` also writes a phone-shaped PNG.
   - `--out <dir>` writes the files there. The default is the folder of the data file.

   `draw` runs the check first for the look and shape you asked for, and refuses data that fails it. So `draw` with `--style` or `--portrait` can still report errors after `check` passed, for example a long title that fits in one look but not another. Nothing is written then. Shorten the name or title, move detail into `sub`, or move a node to `omitted`, and run `draw` again.
6. **Hand over.** Tell the user, briefly:
   - the paths of the files made,
   - how many relations are confirmed and how many are inferred,
   - which sources you could not open (a node is shown as not verified in the chart only when all of its sources are unopened; the source list names every unopened source),
   - which nodes you left out (the `omitted` list),
   - that the credit line is on and that `--no-credit` turns it off,
   - the names of the other two looks (Soft and Proof). Add that drawing another look with `--style` writes the same file names, so give it `--out <dir>` to keep the first drawing.

## Output files

`<slug>` is the data file name without `.lineage.json`. With `moe.lineage.json` you get:

| File | Contents |
| --- | --- |
| `<slug>.png` | The chart, 2400 x 1350 px. |
| `<slug>.svg` | The chart with text converted to outlines, so it needs no fonts. |
| `<slug>.pdf` | The same chart as a PDF. |
| `<slug>.mmd` | A Mermaid version of the graph. |
| `<slug>.sources.md` | The numbered source list, the evidence for each confirmed relation, the AI Timeline Log address of any matched node, the sources not verified, the omitted list and the notes. |
| `<slug>.portrait.png` | Only with `--portrait`. 2160 x 2700 px. |

Do not name any file `metadata.json`. The skills installer skips files with that name.

## Language

The chart is drawn in Korean (`"lang": "ko"`) or English (`"lang": "en"`). No other language is supported.

- If the user writes in Korean, draw Korean. If the user writes in any other language, draw English, answer in the user's language, and say in one line that the chart is in English because only Korean and English are supported.
- Fixed words (row names, legend, "omitted", "not verified", the credit line) come from the tool in both languages. You write only the title, node names, `sub`, and the note on the key link.
- Names in Latin letters or Hangul stay as they are. Names in any other script (for example a report titled only in Chinese or Russian) go into the chart in English or in a romanized form. Put the original text in the source's `original` field.
- Characters that none of the bundled fonts have, such as Japanese kana or Chinese characters, are errors in `check`. Use the English or romanized name.

## Credit line

The chart ends with a small line saying it was made with this tool: `Made with AI Timeline Log · lucasflatwhite.com/ai-timeline-log`. A Korean chart uses the Korean wording of the same line. It is on by default. Turn it off with `--no-credit` or `"credit": false` in the data file. If the user does not want it, turn it off without argument. Always mention in the handover that it exists and how to turn it off.

## If you cannot run commands

In a chat app without command execution, do steps 1 to 3 only. Put three things in the reply: the data file as a JSON block, a Mermaid version of the graph, and the numbered source list. Say that the PNG, SVG and PDF can be made from the same data file in an agent that can run commands, such as Claude Code or Codex.

## What this skill does not do

- It does not predict the future or write what-if histories ("what if the transformer had not been published").
- It does not write dialogues or opinions in the voice of a real person.
- It does not connect work to old papers without evidence. Roots go back only as far as sources reach, so a chart can start in 2017 as well as in 1991.
- It does not draw logos, trademarks or faces of real people.
- It does not enlarge the canvas or shrink the type to fit more in. If a chart does not fit, shorten names, move detail into `sub`, or move a node to `omitted`.
- It does not cite a source it has not opened.

Worked example: the `examples/` folder holds a finished data file with its drawn files.
