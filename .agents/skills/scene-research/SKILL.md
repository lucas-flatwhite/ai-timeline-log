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
- Held candidates from earlier sessions stay in their research notes, where the "Proposed way to add it" column says `보류`. Find them with `grep -rn "보류" docs/review` and check whether a new event lets one of them go ahead.

## 2. Selection criteria

- Pick only "events that changed the course". Do not add events to balance the count per year or per topic.
- The site starts at the ChatGPT launch (`site.start`, 2022-11-30). Earlier events do not become boxes. If needed, use them only as background in a scene's `lede`.
- Chinese events are covered too, but do not create a separate `china` topic. Put them in existing topics. Propose a new topic only when it has three or more scenes.
- A scene has 3 to 4 events, and a fifth only as a follow-up (see below). Before proposing to add to an existing scene, check its event count (the third column of the index).

### New scene or follow-up

Decide by the story, not by the free slots.

- **Join an existing scene**: the event is the next step of the question that the scene's title and lede ask. A scene with 3 events takes it as the fourth. A scene with 4 events takes it as the fifth only when it is a single follow-up.
- **New scene**: the events ask a different question, even with the same company or technology. Or the follow-up story has three or more events confirmed from primary sources. Give the new scene the same `topics` as the earlier one so the two read as one thread.
- **Hold**: there is no legal place yet. This covers a follow-up to a scene that already has 5 events, two or more follow-ups to a scene with 4 (keep them together instead of putting one in the fifth slot), and a single event with no scene to join. Do not propose a sixth event. Propose a new scene once the held events reach three.
- Events never move between scenes. Do not swap an event out to make room, and an event already in a fifth slot does not count toward a new scene's three. An event's address (`<scene id>~<YYYYMMDD>`) has no alias, so a moved or removed event's link stops working.

Same question or not:

- Same: the House Democrats' letter of 2026-10-28 asking frontier AI companies to report safety incidents within 48 hours. `2026-10-offline` records agents acting in the outside world and companies taking models off the live internet in response. The letter is the next response to those incidents.
- Different: the Claude Fable 5.2 and Mythos 5.2 release. Mythos is in `2026-04-mythos`, which is about a model kept from general release because of its skill at finding vulnerabilities. The 5.2 release is about capping the research skills that would speed up AI development, so it went into `2026-11-research-brakes`.

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
| 1 | MM-DD | ... | ... | New scene / event N of `<existing id>` / hold (write `보류` and the reason) |

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
