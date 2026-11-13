# AGENTS.md

Rules for agents working in this repository. Every agent follows this file (`CLAUDE.md` only imports it). The overview for people is in `README.md`.

## Read first, by task

This file holds only the rules that always apply. For the tasks below, open the listed file first. Some agents load skills by themselves. If yours does not, open the path directly.

- Researching a new event or scene candidates: `.agents/skills/scene-research/SKILL.md`
- Recording an edition, poster Release: `.agents/skills/edition-release/SKILL.md`
- Event pictures (`pic`), `content/pics.yaml`: `.agents/skills/draw-pic/SKILL.md`

Skill sources live in `.agents/skills/`, and `.claude/skills` is a symlink to that folder. To change a skill, edit the files in `.agents/skills/`.

## Structure

- `content/scenes/<date>-<slug>.yaml`: one scene per file. The file name comes from `date` and `id` (with `id` `2025-01-deepseek` and `date` `2025-01-27`, the file is `2025-01-27-deepseek.yaml`).
- `content/years.yaml` year summaries, `content/arcs.yaml` eras, `content/ledger.yaml` lab lineage, `content/site.yaml` site copy and `asOf`, `content/pics.yaml` picture outlines, `content/topics.yaml` topics (threads that connect several scenes), `content/editions.yaml` edition records.
- Export files (`timeline.json`, `llms.txt`, `llms-full.txt`, `ko/llms-full.txt`, `feed.xml`, `ko/feed.xml`, `agent.md`, `ko/agent.md`, `.well-known/agent-skills/`) are built from the same content by `src/lib/export.ts`, `src/lib/feed.ts` and `src/lib/agent.ts`. Do not edit them by hand.
- The "tell your agent" button in the poster and data block only copies a line telling the agent to read `agent.md`. What the agent should do is in `agent.md`, and how it answers after install is in `SKILL.md` (English only). Do not put the as-of date in `SKILL.md`: a change would alter the digest in `index.json` and show up as an update for everyone who installed it.
- Language addresses: English is the default at `/ai-timeline-log/`, and Korean is at `/ai-timeline-log/ko/` (`locales`, `localePath` in `src/i18n/index.ts`). Old `en/` addresses and page addresses without a trailing slash (`/ai-timeline-log`, `/ai-timeline-log/ko`) redirect permanently through `vercel.json` (in both this repository and lucasflatwhite-com). The canonical address is `https://lucasflatwhite.com/ai-timeline-log/` without www (canonical, `site` in `astro.config.mjs`), and the main site's Vercel domain setting moves `www.` with a 308.
- The language shown is, in order: the chosen language, the browser's first language, English. The chosen language is stored in the browser key `lucas-flatwhite:locale` (`LOCALE_KEY`), and the whole site, including the arcade games, uses the same key. It is written only when a language link is clicked (a language shown from the browser setting is not written), and the redirect happens only when entering at the default address. Opening `ko/` directly always shows Korean, whatever is stored (inline script in `src/layouts/Page.astro`, `tests/e2e/lang.spec.ts`). Browser tests run with an `en-US` browser (`playwright.config.ts`).
- Facts (dates, figures, print settings, sources) are written once. Only the text sits side by side as `ko` and `en`.
- The schema is `src/lib/schema.ts` and the build checks are `src/lib/checks.ts`. Errors stop the build. Warnings are only printed.
- Scene index: `npm run index` prints one line per scene (date, id, event count, topics, English title). `--items` adds the start of each event sentence, `--since YYYY-MM` shows only later scenes, and `--grep <word>` searches scenes and the glossary (`content/glossary.yaml`). Use this first to check for duplicates or terms, instead of opening YAML files one by one or reading the whole glossary.
- Research notes: `docs/review/<date>-<slug>.md`. The format is in the `scene-research` skill.
- `skills/` holds public skills (`ai-lineage`). Installing copies only that folder, so a skill reads no file outside its own folder. Internal skills used only in this repository (`.agents/skills/`) are hidden with `metadata.internal: true`. Replace the library copies in a skill folder (`vendor/`) with `npm run lineage:vendor`.

## Adding and correcting scenes

1. **Research**: find out what happened and when. The bar for a scene is "an event that changed the course". Do not add scenes to balance the count per year. The method and the note format are in `.agents/skills/scene-research/SKILL.md`.
2. **Check sources**: check primary sources first (company announcements, papers, court documents) and use press reports as a supplement. For an ongoing event, say in the text that it is "as reported". For a sensitive matter, give only the positions of both sides. A scene added after the first edition (`firstEdition`) needs at least one source.
3. **Write ko and en**: write Korean and English together. English follows "English writing rules" below.
4. **Add topics**: give the scene at least one topic with `topics: [..]` (ids from `content/topics.yaml`). An unknown id is a build error, and a scene with no topic is a warning. Create a new topic only when it has three or more scenes.
5. **Reread the year summary**: reread that year's summary (`ko`, `en`) in `content/years.yaml` to check that it fits the new scene, and fix it if it does not. Every year with a scene must have a year summary.
6. **Update `asOf`**: set `asOf` in `content/site.yaml` to the day of the work. `date`, event dates and `added` cannot be later than `asOf`. For a new scene, `added` is the day of the work. For a changed scene, set `updated`.
7. **Check and test**: run everything in "Check commands" below.
8. **PR**: branch and open a PR. List the changed scenes and the source links in the body. Do not push directly to `main`. Write commit messages, PR titles and PR bodies in English.

### Editions and posters

The steps for recording an edition and uploading the poster Release are in `.agents/skills/edition-release/SKILL.md`. The key point: merging to `main` deploys right away, so **create the Release first, fetch the preview and sizes (`npm run poster:pull`), then merge.**

### Corrections

- Record a factual correction (date, figure, actor) in the scene's `corrections` as `{ date, ko, en }`. Fix typos silently.
- When a fact changes, update the scene's `updated` and add the source for the fix to `sources`.
- An `id` is an address, so do not change it. If you must, keep the old `id` in `aliases`.
- Correction reports arrive through the GitHub issue form (`.github/ISSUE_TEMPLATE/correction.yml`). Change the content only after checking the evidence.

## Event `glyph` (the key word carved in a box)

Every event (`items[]`) needs a `glyph`.

- An event box is a small 1×1 plate. **Korean must stay within 3 Hangul characters per line.** Four or more, or eight or more Latin characters, gives a build warning (it blurs on a small plate). A line break `\n` splits it into two lines.
- **Numbers and names** (`GPT-6`, `6개월`, `-17%`) are the same in both languages, so write one string.
- Otherwise write both as `{ ko, en }`. Example: `glyph: { ko: 침입, en: BREACH }`.
- Hangul in an English key word is a build error (it guards against a missing translation).
- A scene's `print.glyph` is the shared key word. If it differs by language, add `en.glyph`.

## `pic` (picture boxes)

Before adding a picture to an event or drawing an outline in `content/pics.yaml`, read `.agents/skills/draw-pic/SKILL.md`. Use pictures on only some events (around 10 to 20), and do not draw logos, trademarks or the faces of real people. This rule is about pictures (`pic`). The agent button icons in the poster and data block (Claude, Codex, Cursor, OpenCode) are an exception, used as a compatibility mark meaning "paste it here". Their SVGs come unchanged from lobehub/lobe-icons (MIT) and live in `src/components/AgentIcons.astro`. The GitHub mark in the top bar is another exception, used only to mark the link to this repository. Its SVG comes unchanged from primer/octicons (MIT) and lives in `src/components/GithubIcon.astro`.

## English writing rules

- Confirm official English names in a primary source (announcement, official site), record them in `content/glossary.yaml`, and use them as written. Do not write the same thing in different ways. For a name not in the glossary, check the source and add it to the glossary first.
- Do not translate the Korean literally. Write sentences that read naturally in English. An event sentence is one sentence in the present tense (for example, "OpenAI discloses that …").
- The banned words (below) and the ban on relative time expressions apply to English too.

## Style rules (checked by the build)

- Banned words: Korean `놀라운`, `혁명적`, `게임 체인저`; English `revolutionary`, `game-changer`, `groundbreaking`, `stunning`, `incredible`; in both, `!` and emoji.
- **Never use an em dash (U+2014) anywhere. There are no exceptions.** This covers Korean and English text, UI strings (`src/i18n/`), source titles, YAML comments, code comments, tests, commit messages and PR bodies. If an original article title has one, replace it with a comma or a colon (`:`). In text, split the sentence with a period, or use a comma, colon or parentheses. The build blocks it as an error in every content string (source titles included), and a unit test (`tests/unit/no-em-dash.test.ts`) checks all text files in the repository. The en dash (`–`) in date ranges stays.
- Do not use relative time expressions in scene, event, year or era text: Korean `오늘`, `최근`, `올해`, `현재`; English `today`, `recently`, `this year`. Their meaning changes with the day of reading.
- Each scene has 3 to 4 events. A fifth is allowed only for a follow-up to the same story, and the build warns about it. Six or more is an error. When to start a new scene instead is in `.agents/skills/scene-research/SKILL.md` ("New scene or follow-up").

### Phrases that read as AI-written (the build cannot catch these, so check by eye)

State facts briefly and do not add commentary on what they mean. If you see the phrases below, replace them with factual sentences.

- Korean: `~하는 일이 중요해졌다`, `~이 과제가 됐다`, `서로 다른 길을 제시했다`, `~의 경계를 정했다`, `~로 이어졌다` (when dressing up causation), `폭발적으로`, `세상을 놀라게 한`, `새로운 장을 열었다`, `패러다임`, `~에 그치지 않고`.
- English: `became essential`, `became a pressing task`, `offering different ways to`, `extended to`, `marks a turning point`, `a new era`, `landscape`, `paradigm`, `underscores`, `highlights`, `delve`, `pivotal`, `In a world where`, and titles of the form `X Meets Y`.
- A string of participle phrases at the end of a sentence (`…, enabling …, describing …, noting …`). An event is one sentence, but do not chain three or four clauses. If it gets long, drop the less important fact.
- Do not repeat three-item lists used for rhetoric, or titles built as parallel pairs (`A의 B, C의 D`).
- Qualifiers such as `보도 기준` and `진행 중` are facts, so keep them, but write them once and briefly.

## Check commands

All of these must pass before a PR. CI (`.github/workflows/check.yml`) runs them in the same order, and browser tests run on Chromium and WebKit side by side.

```bash
npm run check        # astro check. precheck builds the plate font list (src/generated/plate.json) first, so it runs on a fresh clone
npm test             # unit tests (including content checks)
npm run build        # builds the plate fonts and the static site. Content errors show up here as a build failure
npm run budget       # size budget: plate font per language 40KB, client JS 30KB (uncompressed) or less
npx playwright test --project=chromium   # browser tests (builds and starts the preview server itself)
npx playwright test --project=webkit     # Safari engine. Catches Safari-only problems, such as links not taking focus on mouse click
```

Read the build warnings too. If warnings increase, find out why.

## Do not

- Do not add external runtime resources, analytics tools or Google Fonts.
- `src/generated/` and `public/plate/` are build output, so do not commit them.
- Shared images (`public/og/`) are regenerated with `scripts/og.ts` and committed when the content changes a lot.
- Do not commit poster files or put them on the site. They go only to GitHub Releases (to avoid Vercel costs). The only exception is the preview in the poster and data block: the screen PNG of the latest poster edition reduced to a 600px wide AVIF, one per language, at 100KB or less, in `public/poster/`. Each edition overwrites it, so they do not pile up (`npm run poster:pull` makes it and `npm run budget` checks it).
- Do not send visitor information to a server. "New boxes since your last visit" uses only browser storage (`atl:seen`, `atl:since`), and the chosen language uses only `lucas-flatwhite:locale`.

## License

Code is MIT (root `LICENSE`), and content (`content/`) is CC BY 4.0 (`content/LICENSE`).
