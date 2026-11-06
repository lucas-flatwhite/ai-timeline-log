# Looks

Ask the user which look to use before you start, as step 1 of `SKILL.md` says. Offer the three below with one short line each, in the user's language. With a user who writes in Korean, use the Korean names, which are the names on the site, and accept them in a request. Put the answer in `"style"` in the data file. The `--style woodcut|soft|proof` option wins over the file, so use it to draw another look later. If neither is set, the tool uses `woodcut`.

All three looks draw from the same five colors and use no accent color: paper, ink, a dark gray, a light gray and a wood-grain gray. Proof also uses blended fills, which are those colors mixed in fixed proportions. The key link is always an inverted box (light text on ink in Woodcut and Soft). The canvas size and type sizes are the same in every look, but a long title or name can fit in one look and fail in another, so a chart that passes in one look may still fail in the others. `check` tests one look at a time.

| Id | Name | Korean name | What it looks like |
| --- | --- | --- | --- |
| `woodcut` | Woodcut | 먹판 | Paper background, square boxes with a 2 px ink border, right-angle lines, heavy display type for the title and row names, a double rule around the page. |
| `soft` | Soft | 가까운 변화 | Lighter. Boxes with slightly rounded corners and a 1 px border, thin lines with rounded bends, no frame. |
| `proof` | Proof | 교정지 | A printer's proof. Paler background, thin 0.8 px lines, monospaced row names, crop marks, registration marks, an ink-density strip and a small info line around the edge. The key link is a tinted box with a heavy border instead of an inverted one. |

In every look:

- Boxes of another branch or condition (`"side": true`) are filled differently from the main line.
- A confirmed line is solid. An inferred line is dashed. A line of type `enables` is always dotted.
- A source that was not opened gives its node a dashed border.
- The legend lists only what the chart actually uses.
- One line under the drawing lists the omitted nodes, and the credit line, when it is turned on, is last.
