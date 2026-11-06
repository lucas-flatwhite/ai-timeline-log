# Looks

Pick the look with `--style woodcut|soft|proof`, or with `"style"` in the data file. The option wins over the file. The default is `woodcut`. Use another look only when the user asks for it. Do not ask every time.

All three looks draw from the same five colors and use no accent color: paper, ink, a dark gray, a light gray and a wood-grain gray. Proof also uses blended fills, which are those colors mixed in fixed proportions. The key link is always an inverted box (light text on ink in Woodcut and Soft). The canvas size and type sizes are the same in every look, but a long title or name can fit in one look and fail in another, so a chart that passes in one look may still fail in the others. `check` tests one look at a time.

| Id | Name | What it looks like |
| --- | --- | --- |
| `woodcut` | Woodcut | The default. Paper background, square boxes with a 2 px ink border, right-angle lines, heavy display type for the title and row names, a double rule around the page. The "Timeline" mark is a stamp. |
| `soft` | Soft | Lighter. Boxes with slightly rounded corners and a 1 px border, thin lines with rounded bends, no frame. The "Timeline" mark is a tag on the box border. |
| `proof` | Proof | A printer's proof. Paler background, thin 0.8 px lines, monospaced row names, crop marks, registration marks, an ink-density strip and a small info line around the edge. The key link is a tinted box with a heavy border instead of an inverted one. |

In every look:

- Boxes of another branch or condition (`"side": true`) are filled differently from the main line.
- A confirmed line is solid. An inferred line is dashed. A line of type `enables` is always dotted.
- A source that was not opened gives its node a dashed border.
- The legend lists only what the chart actually uses.
- One line under the drawing lists the omitted nodes, and the credit line is last, unless it is turned off.
