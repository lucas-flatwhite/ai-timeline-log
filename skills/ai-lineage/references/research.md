# Research rules

These rules build on the habits of careful news research: primary sources first, announcement date apart from event date, a company's claim apart from a confirmed fact.

## Never cite from memory

Write a title, an author list, a date or a venue only after you opened the source in this session. If you could not open it, you may still keep the node, but set `"opened": false` on that source. The chart then marks the node as not verified, and the source list names it. Do not fill in details you only half remember.

## Rules

- **Primary sources only for nodes.** Papers (arXiv, conference proceedings, journals), official announcements, model cards, technical reports, official repositories. News articles and blog posts are clues that lead you to the primary source. Do not use them as the source of a node.
- **Date means first public.** Use the first arXiv version, the date of the announcement, or the model's release date. A conference date may be mentioned in `sub` or in the source's `venue`, but `date` stays the first public date. Give as much precision as you know: `YYYY`, `YYYY-MM` or `YYYY-MM-DD`.
- **Relations are confirmed or inferred.** A relation is `confirmed` only when the later work says it builds on, cites or continues the earlier one. Then write `evidence` with the node that says so and where (section, page, figure or reference number). Everything else is `inferred` and is drawn as a dashed line. When you are unsure, choose `inferred`.
- **At most nine nodes.** Place each in one of four rows by its role: `root` (the original idea), `revival` (the work that brought it back), `merge` (where another branch joined), `spread` (where it reached models and products people use). If there are too many, drop the least important and list them in `omitted`. The chart prints that list on one line under the drawing.
- **One key link, or none.** Choose at most one lesser-known node that actually connected the lineage and set `focal` on it, with a short note on why. The chart draws it as an inverted box.
- **Stop where the sources stop.** Do not stretch the roots back to earlier decades without evidence.
- **Disputed or ongoing matters.** Say in your reply that the account is as reported, and cite sources for both sides of a disputed claim. Keep a short remark in `notes`. It stays in the data file and is not drawn.

## Cross-check with the timeline

Fetch `https://lucasflatwhite.com/ai-timeline-log/timeline.json` once. If a node matches a scene there, set the node's `timeline` to `{ "id": "<scene id>", "url": "<scene url>" }`. The timeline starts on 2022-11-30, and `check` rejects `timeline` on an earlier node. If the file cannot be fetched, skip the cross-check and tell the user that you skipped it. Do not guess scene ids.

## Reading web pages

Read a page, note the URL and the date you opened it, and move on. Do not paste whole pages into the conversation. Fetch each source once.
