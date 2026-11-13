---
name: scene-research
description: How to research AI event candidates for the timeline and leave a research note in docs/review/. Use when researching new AI events or scene candidates for the timeline, summarizing the week's AI news, finding missing events, checking whether an event belongs, or backfilling a period.
metadata:
  internal: true
---

# Researching scene candidates

The output of this step is **one research note**. Do not write scene YAML. The YAML is written after the user picks candidates, in a new session, from this note and the scene index alone (`AGENTS.md`, "Adding and correcting scenes", from step 3).

## 1. Check what already exists (do not open the YAML)

- `npm run index`: the scene list and the scene count per topic. If the period is set, use `npm run index -- --since YYYY-MM --items`.
- `npm run index -- --grep <word>`: finds events already covered, and glossary spellings, by company, model or institution name.
- See the site's start date and as-of date only with `grep -E '^(start|asOf):' content/site.yaml`.
- Open a scene file only to judge whether a candidate belongs in an existing scene, and open only that file.

## 2. Selection criteria

- Pick only "events that changed the course". Do not add events to balance the count per year or per topic.
- The site starts at the ChatGPT launch (`site.start`, 2022-11-30). Earlier events do not become boxes. If needed, use them only as background in a scene's `lede`.
- Chinese events are covered too, but do not create a separate `china` topic. Put them in existing topics. Propose a new topic only when it has three or more scenes.
- A scene has 3 to 4 events, and a fifth only as a follow-up (see below). Before proposing to add to an existing scene, check its event count (the third column of the index).

### New scene or follow-up

Decide by the story, not by the free slots.

- **Follow-up (event 4 or 5 of an existing scene)**: the event is the next step of the question that the scene's title and lede ask, and it is a single event. A fifth event is for this case only. Example: the House Democrats' letter after `2026-10-offline`.
- **New scene**: the events ask a different question, even with the same company or technology. Or the follow-up story has grown to three or more events confirmed from primary sources. Give the new scene the same `topics` as the earlier one so the two read as one thread.
- **Hold**: a scene already has 5 events and another follow-up comes. Do not propose a sixth. Hold it until there are three events, then propose them as a new scene. A single event with no scene to join is held the same way.
- Do not swap out an existing event to make room. An event's address (`<scene id>~<YYYYMMDD>`) has no alias, so the old link stops working.

## 3. Sources

- Check primary sources first (company announcements, papers, regulator documents, filings, court documents). Use news summaries only to find candidates, and cite primary sources for the facts.
- Tell the announcement date apart from the day the event actually happened. If they differ, as with a signing date and an announcement date, or a test date and an announcement date, write both.
- Keep a company's claims and forecasts separate from independently confirmed facts.
- For an ongoing event, write `보도 기준` or `진행 중`. For a sensitive matter, give only the positions of both sides.
- For English names, check the glossary first with `npm run index -- --grep <name>`. If a name is not there, put the official English name and its source in the note (it is added to `content/glossary.yaml` at the writing step).

## 4. Reading web documents (saving context)

- Use the web reading tool first. If it fails or the result is thin, save with `defuddle parse <URL> --md -o <file>` and read only what you need with `grep` or line ranges.
- Keep saved files in a temporary folder outside the repository. Do not paste whole pages into the conversation.
- To avoid fetching a source twice, write the address and the date you checked it in the note right away.

## 5. With several candidates

- If you can start subagents, give each one a candidate. Each writes a file to a temporary folder in the "one candidate" format below, and returns only three lines (date, one sentence, proposed way to add it).
- If you cannot, handle candidates one at a time, and write a candidate's section to the file before moving to the next.
- Write the table last, and append the candidate files to the note with `cat`. Do not read them back in when appending.

## 6. Note format

File: `docs/review/<research date>-<slug>.md` (for example, `docs/review/2026-11-03-event-research.md`). This folder is committed and covered by the em dash check.

Write the note itself in Korean, like the earlier notes in `docs/review/`, including its headings and labels. The template below shows the structure.

```markdown
# Timeline candidates for <period or topic>

Checked on: YYYY-MM-DD. State in one or two sentences the date basis (announcement date or not, whether the time zone was converted) and the research scope. Say that the ranking and the scene grouping are editorial judgment and are not in the content yet.

## Candidates to review first

| Priority | Date | Event | Why chosen | Proposed way to add it |
| --- | --- | --- | --- | --- |
| 1 | MM-DD | ... | ... | New scene / event N of `<existing id>` / hold / reorganize |

### 1. <event>, <month day>

- One fact and a [primary source](URL).
- ...

Sentence that could be recorded: "<one Korean sentence close to a scene event sentence>"

Existing scene: `<id>` (N events). What overlaps or what sets it apart.

English name: names not in the glossary and the source of the official spelling (only if any).

Caution: where this event must not be overstated (not finished, not a ruling, a company claim and so on).
```

Keep it to about 3 lines of facts per event. Do not add commentary.

## 7. Writing rules (these apply to notes too)

- Do not use an em dash (U+2014). If a quoted article or document title has one, replace it with a comma or a colon. `npm test` checks all of `docs/`.
- Write absolute dates. Avoid words whose meaning changes with the day of reading, such as `오늘`, `최근` and `이번 주`.
- Avoid the banned words and the phrases that read as AI-written (`AGENTS.md`, "Style rules") in notes too, because note sentences easily carry over into scene text.

## 8. Finishing

- After writing the note, check it with `npm test -- no-em-dash`.
- Tell the user only the candidates in the table and the note's path. Writing scenes comes after the user picks candidates.
