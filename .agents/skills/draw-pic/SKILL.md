---
name: draw-pic
description: Rules for adding a picture (pic) to an event box or drawing a new outline in content/pics.yaml. Covers the coordinate system, fill direction, what not to draw, and the pictures used by the five "How to use" boxes. Use when adding a pic to an event or drawing a new outline in content/pics.yaml.
metadata:
  internal: true
---

# `pic` (picture boxes)


- Writing `pic: <name>` on an event carves the picture in the top 60% of the box and the key word in the bottom 37% (`glyph` is still required). The name must exist in `content/pics.yaml` (otherwise it is a build error).
- When to use it: only on events with an object or scene that reads at a glance from a single outline. Do not force it. Not every event needs one. A part of the whole (around 10 to 20) is enough.
- How to draw:
  - The coordinate system is **100×100**. An outline goes in one `d` string and is a silhouette shown by filling. Several closed pieces (`M … Z`) can follow one another.
  - The fill rule is nonzero. **Draw solid pieces clockwise and holes counterclockwise.** If solid pieces run in different directions, their overlap goes empty. If two hole pieces overlap, that spot fills in again, so draw each hole as one piece.
  - The plate carves it at a tilt of −0.12 rad, so keep the picture roughly within 12 to 88.
  - **Do not draw logos, trademarks or faces (of real people).** Use only the general shape of objects and scenes.
  - It must read on a small plate (about 64px), so avoid thin lines and fine decoration, and draw in heavy masses.
- An entry is `<name>: { d, cx, cy, note }`. `d` is the path string, `cx` and `cy` are the center of the picture's bounding box (the reference point placed at the center of the picture area), and `note` is one line on what it means. Names use lowercase letters, numbers and hyphens.
- The five "How to use" boxes at the very end of the closing section (`src/lib/guide.ts`) use these pictures too (`eye`, `cursor`, `trail`, `poster`, `bubble`). Do not delete them even if no event uses them. A missing one is a build error, so they are also in the test content (`tests/fixtures/content/pics.yaml`). The text of those boxes is in `guide` in `src/i18n`, and their Korean key words also stay within 3 Hangul characters.
