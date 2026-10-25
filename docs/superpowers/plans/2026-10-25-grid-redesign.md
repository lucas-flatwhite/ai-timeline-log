# 격자 개편과 영어판 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스크롤 연표를 최신순 판화 상자 격자(상세 창 포함)로 바꾸고, 한국어·영어를 함께 출시한다.

**Architecture:** 빌드 때 `content/`를 읽어 격자용 뷰 모델(`src/lib/view.ts`)을 만들고, Astro가 상자·상세 글·맺음을 모두 정적 HTML로 찍는다. 판화 설정은 `data-*`로 넘긴다. 브라우저 JS(`src/client/`)는 DOM만 읽는다. 하는 일은 세 가지다. 화면 가까이 온 상자만 판 전용 subset 글꼴로 새기고, 같은 장면을 강조하고, `<dialog>` 상세를 연다. 판 글꼴은 `prebuild` 스크립트가 언어별로 만든다.

**Tech Stack:** Astro 7.4(정적), TypeScript(Node 22.22 타입 스트리핑), zod 4(`astro/zod`), `yaml` 2, fontsource, `subset-font` 2.9, Vitest, Playwright 1.64

**Spec:** `docs/superpowers/specs/2026-10-25-grid-redesign-design.md`(이하 "스펙"). 바탕은 `docs/superpowers/specs/2026-10-18-ai-timeline-log-design.md`(이하 "10-18")다. 실행자는 둘 다 읽는다.

## Global Constraints

- Node `>=22.22.0`. `astro` 정확히 `7.4.0`. 출력은 정적이다. `base: '/ai-timeline-log'`, `trailingSlash: 'always'`, `site: 'https://lucasflatwhite.com'`. 이 값들은 바꾸지 않는다.
- 상대 import에는 `.ts` 확장자를 붙이고, 타입만 가져올 때는 `import type`을 쓴다(`verbatimModuleSyntax`).
- 외부 런타임 리소스 없음. Google Fonts 금지. 분석 도구 금지.
- 모든 글은 정적 HTML이다. JS는 날짜 형식이나 언어별 문구를 모른다. 필요한 문구는 빌드 때 `data-*`나 마크업에 넣는다.
- 색은 `tokens.css` 그대로다(`--paper #E3E1D9`, `--ink #111110`, `--ink2 #3B3A35`, `--ghost #A3A097`). 나무색 자리표시 `#D3D0C6`.
- 격자: 칸 64px, 간격 4px, `grid-template-columns: repeat(auto-fill, 64px)`, `grid-auto-flow: row dense`, 가운데 정렬. 표지 4×3, 연도·장면 2×2, 사건 1×1.
- 판 칼선 간격 `s = max(1.5, css/48) × dpr`(dpr 최대 2). 사건 상자는 `c` 패턴을 `h`로 바꾸고 문양은 `none`이다.
- 사건 주소는 `<장면 id>~<YYYYMMDD>`(월까지만 있으면 `YYYYMM`)이고, 겹치면 `-2`, `-3`을 붙인다. 연도 주소는 `year-YYYY`. 상세를 열고 닫을 때 `history.replaceState`를 쓴다.
- 이슈 저장소는 `https://github.com/lucas-flatwhite/ai-timeline-log`. 정정 양식은 `.github/ISSUE_TEMPLATE/correction.yml`, 항목 id는 `event`, `what`, `evidence`, `lang`.
- 성능 목표(느린 휴대폰 흉내: CPU 4×, 지연 150ms, 1.6Mbps)에서 첫 화면 상자가 모두 새겨질 때까지 390px는 1.5초 이하, 1440px는 2.0초 이하. 예산은 언어별 판 글꼴 합계 40KB 이하, 클라이언트 JS 합계 30KB 이하(압축 전).
- 금지어: ko `놀라운`, `혁명적`, `게임 체인저`. en `revolutionary`, `game-changer`, `groundbreaking`, `stunning`, `incredible`. 공통 `!`, 이모지.
- 상대 시간 표현(장면·사건·연도·시기 글에만 검사): ko `오늘`, `최근`, `올해`, `현재`. en `today`, `recently`, `this year`.
- 커밋 메시지는 다음 두 줄로 끝난다.
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01RNpVn6WPZS5tjdQ4X1q1o4`
- 작업 브랜치는 `grid-redesign`이다. 브랜치를 바꾸거나 푸시하지 않는다.

## Review Focus

1. **월까지만 있는 사건 날짜**(`2023-01`): 주소는 `…~202301`, 날짜 표시는 `202301`이다. 같은 달의 날짜 있는 사건보다 아래(과거 쪽)에 놓인다. 테스트는 Task 1에 있다.
2. **잘못되었거나 모르는 주소**(`#%E0%A4%A`, `#없는-id`)로 들어온 경우: 아무 창도 열지 않는다. 시작이 멈추지 않고 `data-ready="1"`이 된다. 테스트는 Task 8.
3. **판 글꼴이 오지 않는 경우**: 3.5초 뒤 대체 서체로라도 새기고, 오류가 없다. 테스트는 Task 7.
4. **키보드만 쓰는 사람**: Tab으로 상자에 가서 Enter로 열고, Esc로 닫으면 그 상자로 초점이 돌아온다. ← →로 앞뒤 사건으로 간다. 테스트는 Task 8.
5. **사건 주소로 바로 들어오는 경우**: 글꼴이 준비되기 전에 들어와도 준비된 뒤 상세가 열리고, 판화가 대체 서체가 아닌 판 글꼴로 새겨진다. 테스트는 Task 8.

---

## Part 1. 코드

### Task 1: 내용 모델 확장(사건 핵심어·그림·출처)과 격자 순수 함수

**Files:**
- Modify: `src/lib/schema.ts`, `src/lib/content.ts`, `content/scenes/*.yaml`(33개, `glyph` 추가), `tests/fixtures/content/scenes/2023-03-14-gpt-4.yaml`
- Create: `src/lib/grid.ts`, `content/pics.yaml`, `tests/fixtures/content/pics.yaml`, `scripts/backfill-glyphs.ts`(일회용, 커밋 후 Task 13에서 지움), `tests/unit/grid.test.ts`
- Test: `tests/unit/grid.test.ts`, `tests/unit/content.test.ts`

**Interfaces:**
- Produces:
  - `schema.ts`
    - `glyphSpec = z.union([text, z.object({ ko: text, en: text })])`
    - `picSchema = z.object({ d: text, cx: z.number(), cy: z.number(), note: text })`
    - `picsSchema = z.record(z.string().regex(/^[a-z0-9-]+$/), picSchema)`
    - 사건에 `glyph: glyphSpec`(필수), `pic: z.string().optional()`, `sources`(장면과 같은 형식, 기본값 `[]`)를 더한다.
    - 타입 `GlyphSpec`, `Pic`, `Pics`
  - `content.ts`: `Content`에 `pics: Pics`. `content/pics.yaml`을 읽는다.
  - `grid.ts`
    - `glyphFor(g: GlyphSpec, locale: Locale): string`
    - `ymd(iso: string): string`: `'2025-01-20'`는 `'20250120'`, `'2023-01'`은 `'202301'`
    - `itemAddresses(sceneId: string, dates: string[]): string[]`
    - `hashSeed(s: string): number`: FNV-1a 32비트 `% 99991 + 1`
    - `sortWall<T extends WallEntry>(entries: T[]): T[]`: 최신순. 원본 배열은 바꾸지 않는다.
    - `interface WallEntry { kind: 'year' | 'scene' | 'item'; date: string; order: number; seq: number }`. 연도 항목의 `date`는 `'YYYY'`다.

- [ ] **Step 1: 실패하는 테스트를 쓴다** (`tests/unit/grid.test.ts`)

```ts
test('glyphFor picks the locale or the shared string', () => {
  expect(glyphFor('GPT-6', 'en')).toBe('GPT-6');
  expect(glyphFor({ ko: '속도', en: 'PACE' }, 'en')).toBe('PACE');
});
test('ymd keeps month-only dates short', () => {
  expect(ymd('2025-01-20')).toBe('20250120');
  expect(ymd('2023-01')).toBe('202301');
});
test('itemAddresses suffixes same-date items', () => {
  expect(itemAddresses('2026-09-pace', ['2026-09-12', '2026-09-22', '2026-09-22', '2023-01']))
    .toEqual(['2026-09-pace~20260912', '2026-09-pace~20260922', '2026-09-pace~20260922-2', '2026-09-pace~202301']);
});
test('hashSeed is stable and small', () => {
  expect(hashSeed('2025-01-deepseek')).toBe(hashSeed('2025-01-deepseek'));
  expect(hashSeed('a')).not.toBe(hashSeed('b'));
  for (const s of ['x', '2025-01-deepseek', '2026-09-pace~20260922-2']) { expect(hashSeed(s)).toBeGreaterThanOrEqual(1); expect(hashSeed(s)).toBeLessThanOrEqual(99991); }
});
test('sortWall: newest first, year leads its year, scene before same-date item, month-only at month end', () => {
  const e = (kind, date, seq, order = 0) => ({ kind, date, seq, order });
  const out = sortWall([
    e('item', '2023-01', 0), e('item', '2023-01-23', 1), e('scene', '2023-01-23', 2), e('year', '2023', 3),
    e('item', '2022-12-05', 4), e('year', '2022', 5), e('scene', '2023-03-14', 6),
  ]).map(x => x.seq);
  expect(out).toEqual([3, 6, 2, 1, 0, 5, 4]);
});
```

`content.test.ts`에 다음 두 테스트를 더한다.
- 실제 `content/`를 읽으면 모든 사건에 `glyph`가 있고, 첫 장면 첫 사건의 `glyph`는 `'100만'`이다.
- 픽스처에서 사건 `glyph`를 지우면 `/items\.0\.glyph/`로 실패한다.

- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx vitest run tests/unit/grid.test.ts tests/unit/content.test.ts`
Expected: FAIL. `grid.ts` 없음, `glyph` 검사 없음.

- [ ] **Step 3: `src/lib/grid.ts`를 구현하고 스키마·로더를 넓힌다**

`sortWall`의 열쇠는 다음과 같다.
- 연도: `YYYY-99-99`
- 날짜가 `YYYY-MM`이면 `YYYY-MM-00`
- 그 밖에는 날짜 그대로

열쇠의 내림차순으로 정렬하고, 열쇠가 같으면 장면이 사건보다 앞, 그다음 `order` 오름차순, 그다음 `seq` 오름차순이다. `pics.yaml`은 `{}`로 시작한다.

- [ ] **Step 4: 33개 장면에 시안의 임시 핵심어를 넣는다**

`scripts/backfill-glyphs.ts`가 `/Users/lucas-flatwhite/Documents/github/ai-timeline-log/.superpowers/brainstorm/15013-1792917035/content/data.js`(`window.DATA=` 뒤 JSON)를 읽는다. 장면 파일을 이름순으로, 사건을 YAML 순서대로 돌면서 `scenes[i].items[k].g`를 `items[k].glyph`로 넣는다. 주석이 보존되도록 `yaml`의 `parseDocument`와 `setIn`을 쓴다. 개수가 128이 아니면 멈춘다. 픽스처 장면에도 사건마다 `glyph`를 손으로 넣는다.

Run: `node scripts/backfill-glyphs.ts && git diff --stat content/scenes | tail -1`
Expected: `33 files changed`

- [ ] **Step 5: 테스트를 통과시킨다**

Run: `npx vitest run`
Expected: PASS(기존 테스트 포함)

- [ ] **Step 6: 커밋한다** — `feat: give every event a keyword, optional picture and sources; add grid ordering and address helpers`

### Task 2: 빌드 검사 추가

**Files:**
- Modify: `src/lib/content.ts`
- Create: `src/lib/checks.ts`
- Test: `tests/unit/checks.test.ts`

**Interfaces:**
- Consumes: Task 1의 `glyphFor`, `itemAddresses`, `Pics`
- Produces:
  - `checkContent(c: Content): { errors: string[]; warnings: string[] }`. `loadContent`가 스키마 검사 뒤에 호출한다. 오류가 있으면 기존처럼 하나의 `Content errors:` 예외로 모으고, 경고는 `console.warn`으로 출력한다.
  - `hasHangul(s: string): boolean`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

각 테스트는 실제 `loadContent()` 결과를 `structuredClone`해서 한 군데만 망가뜨린 뒤 `checkContent`를 부른다.

```ts
test('real content passes', () => { expect(checkContent(loadContent()).errors).toEqual([]); });
test('Hangul in an English keyword', () => { /* scene[0].en = {...ko, glyph:'출발'} */ expect(errs).toContainEqual(expect.stringMatching(/en glyph .*Hangul/)); });
test('Hangul in an English item keyword', () => { /* items[0].glyph = { ko:'속도', en:'속도' } */ expect(errs).toContainEqual(expect.stringMatching(/items\.0 en glyph/)); });
test('unknown picture', () => { /* items[0].pic = 'nope' */ expect(errs).toContainEqual(expect.stringMatching(/pic "nope"/)); });
test('forbidden word', () => { /* ko.lede += ' 놀라운' */ expect(errs).toContainEqual(expect.stringMatching(/forbidden "놀라운"/)); });
test('exclamation mark and emoji', () => { /* items[1].ko += '!' ; years.2023.ko.body += ' 🚀' */ expect(errs.length).toBeGreaterThanOrEqual(2); });
test('relative time word in scene text', () => { /* ko.lede += ' 최근' */ expect(errs).toContainEqual(expect.stringMatching(/relative time "최근"/)); });
test('site lede may say 현재까지', () => { expect(checkContent(loadContent()).errors.join()).not.toMatch(/site/); });
test('scene added after firstEdition needs a source', () => { /* added = '2026-10-18', sources = [] */ expect(errs).toContainEqual(expect.stringMatching(/needs a source/)); });
test('long small-box keyword is a warning, not an error', () => { /* items[0].glyph = '행정명령' */ expect(r.errors).toEqual([]); expect(r.warnings).toContainEqual(expect.stringMatching(/행정명령/)); });
```

- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx vitest run tests/unit/checks.test.ts`
Expected: FAIL(`checks.ts` 없음)

- [ ] **Step 3: `checkContent`를 구현한다**

- 이모지 판정: `/\p{Extended_Pictographic}/u`
- 영어 문장 검사: 단어 경계, 대소문자 무시
- 상대 시간 검사 대상: 장면 kicker·title·lede, 사건 문장, 연도 요약, 시기 글. `site.yaml`은 제외한다.
- 작은 판 경고: 사건 핵심어의 각 줄이 한글 4자 이상이거나 라틴 8자 이상이면 경고한다.
- 출처 필수: `added > firstEdition`인 장면은 장면 출처나 사건 출처가 하나 이상 있어야 한다.

- [ ] **Step 4: 테스트를 통과시킨다**

Run: `npx vitest run`
Expected: PASS. 지금 내용에는 오류가 없다. 작은 판 경고는 나와도 된다(Task 13에서 0으로 만든다).

- [ ] **Step 5: 커밋한다** — `feat: check keywords, pictures, banned and relative-time words, and sources at build`

### Task 3: 화면 문구(ko 정리, en 추가)

**Files:**
- Modify: `src/i18n/ko.ts`, `src/i18n/index.ts`
- Create: `src/i18n/en.ts`
- Test: `tests/unit/i18n.test.ts`

**Interfaces:**
- Produces: `UI` 타입. 아래 키만 남긴다.
  - 남기는 키: `now`, `langNav`, `langSoon(name)`, `outroTitle(days)`, `ledgerTitle`, `sourcesTitle`, `endCount(count, start, now)`
  - 새 키
    - `report`: ko `제보·정정`, en `Report`
    - `fix`: ko `이 사건 정정·제보`, en `Report a correction`
    - `fixTitle(date, text)`: ko `[정정] ${date} ${text}`, en `[Correction] ${date} ${text}`
    - `sceneOf(title)`: ko `‘${title}’ 장면의 사건`, en `Part of “${title}”`
    - `added(date)`: ko `추가 ${date}`, en `Added ${date}`
    - `prev`: ko `← 이전 사건`, en `← Earlier`
    - `next`: ko `다음 사건 →`, en `Later →`
    - `close`: ko `닫기`, en `Close`
    - `sources`: ko `출처`, en `Sources`
    - `wall`: ko `AI 사건 격자`, en `Wall of AI events`
    - `details`: ko `모든 장면`, en `All scenes`
    - `making`: ko `만든 방법`, en `How this was made`
  - `index.ts`: `ui = { ko, en }`

- [ ] **Step 1: 실패하는 테스트를 쓴다.** `ko`와 `en`의 키 집합이 같다. `en.sceneOf('X')`는 `'Part of “X”'`다. `ko`에 `plateNo`, `railNav`, `cue`가 없다.
- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx vitest run tests/unit/i18n.test.ts`
Expected: FAIL

- [ ] **Step 3: 문구를 고치고 `en.ts`를 만든다.** `en.endCount`는 `${count} prints · ${start} – ${now}`, `en.now`는 `present`, `en.outroTitle`은 `What changed in ${days} days`, `en.ledgerTitle`은 `Major model releases`, `en.sourcesTitle`은 `Sources and basis`다.
- [ ] **Step 4: 테스트를 통과시킨다**

Run: `npx vitest run`
Expected: PASS. 영어 페이지는 아직 생기지 않는다. `site.en`이 없어서 `langs`의 en은 비활성이다.

- [ ] **Step 5: 커밋한다** — `feat: trim scroll-only UI strings and add English UI strings`

### Task 4: 격자 뷰 모델

**Files:**
- Modify: `src/lib/view.ts`(다시 쓴다), `src/lib/schema.ts`(`site`에 `repo: z.url()`, siteText에 `making: text.optional()`), `content/site.yaml`(`repo` 추가, ko `making` 문단 추가), `tests/fixtures/content/site.yaml`
- Test: `tests/unit/view.test.ts`(다시 쓴다)

**Interfaces:**
- Consumes: Task 1의 `sortWall`, `glyphFor`, `itemAddresses`, `hashSeed`, `ymd`. Task 3의 UI 키(`added`, `sceneOf`, `fixTitle`, `report`, `prev`, `next`, `close`, `fix`, `sources`)
- Produces (`buildView(c: Content, locale: Locale, today?: string): PageView`):

```ts
interface BoxView { kind: 'scene'|'item'|'year'; addr: string; date: string; glyph: string; pattern: string; angle?: number;
  motif: string; seed: number; pic?: string; scene?: string; label: string; off: boolean }
interface SourceView { url: string; title: string }
interface ItemDetail { addr: string; date: string; text: string; meta: string; fix: string; sources: SourceView[] }
interface SceneDetail { id: string; aliases: string[]; meta: string; title: string; lede: string; items: ItemDetail[];
  corrections: string[]; sources: SourceView[]; fix: string }
interface YearDetail { addr: string; year: string; title: string; body: string }
interface PageView {
  lang: Locale; title: string; description: string; ogTitle: string; ogDescription: string;
  canonical: string; ogImage: string; alternates: { hreflang: string; href: string }[];
  name: string; report: { label: string; href: string };
  cover: { glyph: string; tpl: string; start: string; lede: string };
  boxes: BoxView[]; scenes: SceneDetail[]; years: YearDetail[]; pics: Pics;
  dialog: { prev: string; next: string; close: string; fix: string; sources: string };
  langNav: string; langs: LangView[];
  outro: { /* 지금 필드 그대로 */ making?: string };
}
```

- `BoxView.date`: 장면·사건은 `ymd(...)`, 연도는 `'YYYY'`. `addr`는 장면이 `id`, 사건이 `itemAddresses` 결과, 연도가 `year-YYYY`. `off`는 요약이 없는 연도(2022)에만 `true`.
- 사건 상자: `pattern`은 장면 패턴(`c`면 `h`), `angle`은 장면 값, `motif`는 `'none'`.
- 시드: 장면은 `hashSeed(id)`, 사건은 `hashSeed(addr)`, 연도는 숫자 연도(지금과 같음).
- `label`(aria): `"<date> · <장면 제목 또는 사건 문장>"`, 연도는 `"<YYYY> · <요약 제목>"`.
- `SceneDetail.meta`: `"<ymd(date)> · <kicker>"`. 최근 추가 장면이면 `" · " + ui.added(formatDot(added))`를 붙인다. 최근 추가는 `added`의 최댓값이 `firstEdition`보다 늦을 때 그 날짜에 추가된 장면들이다(10-18 5절).
- `ItemDetail.meta`: `"<date> · <kicker> · " + ui.sceneOf(title)`.
- `fix`: `${repo}/issues/new?template=correction.yml&title=${enc(ui.fixTitle(date, text).slice(0,120))}&event=${enc(canonical + '#' + addr)}&lang=${locale}`. 장면이면 `text`가 장면 제목이다.
- `canonical`: `https://lucasflatwhite.com/ai-timeline-log/`, en은 `…/en/`. `ogImage`: `…/ai-timeline-log/og/<locale>.png`. `alternates`: ko, en(페이지가 있을 때만), `x-default`(=ko).
- `cover.glyph`: `heroGlyph.wide`에 빌드 날 일수를 채운 것. `tpl`은 채우기 전 틀, `start`는 `site.start`.
- 지우는 필드: `blocks`, `rail`, `hero*`, `bar*`, `cue`, `live`. 판 번호 문구는 아무 데도 남기지 않는다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**(`buildView(loadContent(), 'ko', '2026-10-25')`)

```ts
expect(v.boxes.length).toBe(33 + 128 + 5);
expect(v.boxes[0]).toMatchObject({ kind: 'year', addr: 'year-2026', date: '2026', off: false });
expect(v.boxes.at(-1)).toMatchObject({ kind: 'scene', addr: '2022-11-chatgpt', date: '20221130' });   // 가장 오래된 상자
expect(v.boxes.find(b => b.addr === 'year-2022')).toMatchObject({ off: true });
const gpt4 = v.boxes.find(b => b.addr === '2023-03-gpt-4')!;
expect(gpt4).toMatchObject({ kind: 'scene', seed: hashSeed('2023-03-gpt-4') });
const m = v.boxes.find(b => b.addr === '2022-11-chatgpt~202301')!;
expect(m).toMatchObject({ kind: 'item', date: '202301', motif: 'none' });
expect(v.boxes.filter(b => b.kind === 'item' && b.pattern === 'c')).toEqual([]);
expect(v.cover).toEqual({ glyph: '1,425일', tpl: '{days}일', start: '2022-11-30', lede: 'ChatGPT가 공개된 2022년 11월 30일부터 현재까지, AI가 지나온 장면들을 기록합니다.' });
expect(v.report.href).toBe('https://github.com/lucas-flatwhite/ai-timeline-log/issues');
const d = v.scenes.find(s => s.id === '2026-07-sandbox-escape')!;
expect(d.items[1].meta).toBe('20260721 · 사고 · ‘샌드박스를 나간 에이전트’ 장면의 사건');
expect(decodeURIComponent(d.items[1].fix)).toContain('event=https://lucasflatwhite.com/ai-timeline-log/#2026-07-sandbox-escape~20260721');
expect(decodeURIComponent(d.items[1].fix)).toContain('title=[정정] 20260721 ');
expect(JSON.stringify(v)).not.toMatch(/제\d+판/);
expect(v.canonical).toBe('https://lucasflatwhite.com/ai-timeline-log/');
```

맺음 필드(`outro.title === '1,425일 동안 바뀐 것'`, arcs·ledger·sources)는 지금 `view.test.ts`의 기대값을 그대로 옮긴다.

- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx vitest run tests/unit/view.test.ts`
Expected: FAIL

- [ ] **Step 3: `buildView`를 다시 쓴다**

정렬에는 `sortWall`을 쓰고, 사건의 `seq`는 장면 순서와 사건 순서로 정한다. 아직 `ko.making`이 없으면 맺음의 "만든 방법"은 생략한다. 내용(한 문단: AI 도움으로 조사·작성, 1차 출처 우선, 오류는 GitHub 이슈로)은 이 Task에서 `site.yaml` ko에 쓴다.

- [ ] **Step 4: 테스트를 통과시킨다**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 5: 커밋한다** — `feat: build a newest-first wall view with scene and event details`

### Task 5: 판 전용 subset 글꼴

**Files:**
- Create: `src/lib/plate.ts`, `scripts/plate-font.ts`, `tests/unit/plate.test.ts`
- Modify: `package.json`(`subset-font@2.9.0` devDependency, `"predev"`·`"prebuild": "node scripts/plate-font.ts"`), `.gitignore`(`public/plate/`, `src/generated/`)

**Interfaces:**
- Consumes: Task 4의 `buildView`(박스 핵심어와 `cover.tpl`)
- Produces:
  - `plateText(v: PageView): string`: 상자 핵심어와 연도의 고유 문자, `cover.tpl`의 `{days}`를 `0123456789,`로 바꾼 글자를 합친다. 줄바꿈과 공백은 뺀다.
  - `makePlateFonts(text: string): Promise<{ sub: 'latin' | 'korean'; family: 'PlateL' | 'PlateK'; woff2: Uint8Array }[]>`
    - 원본은 `node_modules/@fontsource/black-han-sans/files/black-han-sans-{latin,korean}-400-normal.woff2`다.
    - 원본에 들어 있는 글자가 하나도 없으면 그 원본은 건너뛴다.
  - 스크립트 산출물
    - `public/plate/<locale>-<sub>.woff2`
    - `src/generated/plate.json` = `{ "<locale>": [{ "family": "PlateL", "file": "plate/ko-latin.woff2" }, ...] }`
    - 대상 언어는 `site[locale]`이 있는 언어만이다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

```ts
const v = buildView(loadContent(), 'ko', '2026-10-25');
test('plate text covers keywords, years and the day count', () => {
  const t = plateText(v);
  for (const ch of ['속', '도', '0', '9', ',', '일', 'G', '$']) expect(t).toContain(ch);
  expect(t).not.toMatch(/\s/);
});
test('Korean plate fonts fit the 40KB budget', async () => {
  const fonts = await makePlateFonts(plateText(v));
  expect(fonts.map(f => f.family).sort()).toEqual(['PlateK', 'PlateL']);
  expect(fonts.reduce((a, f) => a + f.woff2.byteLength, 0)).toBeLessThanOrEqual(40 * 1024);
}, 30_000);
test('a Latin-only text skips the Korean source', async () => {
  expect((await makePlateFonts('PACE 2026 1,425 days')).map(f => f.family)).toEqual(['PlateL']);
}, 30_000);
```

- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx vitest run tests/unit/plate.test.ts`
Expected: FAIL

- [ ] **Step 3: 구현한다**

`subset-font(buffer, text, { targetFormat: 'woff2' })`를 쓴다. 원본 cmap 포함 여부는 subset 결과의 글자 수로 판단해도 되고, `unicode-range`를 미리 읽어 거르는 방식이어도 된다.

- [ ] **Step 4: 테스트를 통과시키고 산출물을 확인한다**

Run: `npx vitest run && node scripts/plate-font.ts && ls -l public/plate src/generated/plate.json`
Expected: PASS, 그리고 `ko-latin.woff2`, `ko-korean.woff2`(합계 40KB 이하)와 `plate.json`

- [ ] **Step 5: 커밋한다** — `build: generate per-locale plate fonts holding only the carved characters`

### Task 6: 정적 마크업과 CSS(격자, 표지, 상세 글, 위 막대)

**Files:**
- Create: `src/components/TopBar.astro`, `src/components/Wall.astro`, `src/components/Details.astro`, `src/components/DetailDialog.astro`, `src/styles/wall.css`, `src/styles/detail.css`, `src/pages/en/index.astro`(`index.astro`와 같고 `locale='en'`. `site.en`이 아직 없으면 `Astro.redirect('../')`), `tests/e2e/static.spec.ts`(다시 쓴다)
- Modify: `src/pages/index.astro`, `src/layouts/Page.astro`(판 글꼴 `@font-face`·preload, `--plate` 토큰, `<html class>`에 `js`를 붙이는 인라인 스크립트, canonical·hreflang 자리), `src/components/Outro.astro`("만든 방법" 문단)
- Delete: `src/components/Hero.astro`, `Rail.astro`, `Scene.astro`, `YearPlate.astro`, `Bar.astro`, `src/styles/hero.css`, `scene.css`, `year.css`, `nav.css`, `motion.css`, `tests/e2e/behavior.spec.ts`(Task 7·8에서 새로 쓴다)

**Interfaces:**
- Consumes: Task 4의 `PageView`, Task 5의 `src/generated/plate.json`
- Produces (DOM 약속. Task 7·8의 JS는 이것만 읽는다):
  - `<header class="top">`
    - 안에 `.name`, `nav.lang`(LangSwitch), `a.report[target=_blank]`가 있다.
    - `position: sticky; top: 0`이다.
  - `<main id="wall" class="wall" aria-label={ui.wall} data-live-start={cover.start}>`
    - 첫 자식은 `.cover`다.
    - `.cover` 안에는 `canvas.cv[data-kind="days"][data-glyph][data-tpl]`과 `p.lede`가 있다.
  - 상자: `<a class="box {kind}" href="#{addr}">`
    - 속성: `data-kind`, `data-addr`, `data-glyph`, `data-pattern`, `data-angle?`, `data-motif`, `data-seed`, `data-pic?`, `data-scene?`, `aria-label`
    - 안에 `<canvas>`, `<span class="g">{glyph}</span>`(판화가 없을 때 보이는 글자), `<i class="d">{date}</i>`가 있다.
    - `off` 연도만 `<span class="box year off">`로 만든다.
  - `<section id="details" aria-label={ui.details}>`
    - 장면마다 `<article class="detail" id={id} data-addr={id} data-aliases="a b" data-fix={fix}>`
      - 안: `p.meta`, `h2`, `p.lede`, `ol.items > li[id=addr][data-addr][data-meta][data-fix] > (span.date + span.text)`
      - 선택: `p.corr`, 장면 출처 `p.src`, 사건 출처 `p.src[data-for=addr]`(각각 `<a>` 목록)
    - 연도마다 `<article class="detail year" id="year-YYYY" data-addr>` 안에 `h2`, `p`
  - `<script type="application/json" id="pics">`: `PageView.pics`
  - `<dialog id="detail" aria-labelledby="detail-title">` 안
    - `canvas.dcv`
    - `div.dbody`
    - `p.dsrc`
    - `a.fix`(`{ui.fix} ↗`)
    - `button.prev`, `button.next`, `button.x[aria-label=ui.close]`
  - CSS
    - `html.js #details { display: none }`
    - `.wall.focus .box:not(.rel) canvas { opacity: .25 }`(`@media (hover: hover)` 안)
    - `.box .g`는 판화가 그려지면 숨긴다(`.box.carved .g { visibility: hidden }`).
    - `.box .d`는 올림·초점 때만 보인다.
    - `@media (max-width: 720px)`에서 `#detail`은 화면 전체를 덮는다.

- [ ] **Step 1: 실패하는 브라우저 테스트를 쓴다**(`static.spec.ts`. JS 끈 컨텍스트가 필요하면 `test.use({ javaScriptEnabled: false })`)
  - `every scene title and event sentence is in the HTML`: `content/`의 모든 ko 제목·사건 문장이 `#details`에 있다.
  - `boxes: 166, newest first, links to addresses`: `.wall .box`가 166개다. 첫 상자의 `href`는 `#year-2026`이다. 상자마다 `data-glyph`가 비어 있지 않다.
  - `without JS the details list is visible and box links jump to it`: JS를 끄고 `#details`가 보인다. `a.box[href="#2023-03-gpt-4"]`를 누르면 `#2023-03-gpt-4`가 화면 안에 있다.
  - `plate font is preloaded`: `link[rel=preload][as=font][href*="plate/ko-"]`가 하나 이상 있다.
  - `language switch: KO current, EN disabled for now`, `no external font service`, `icons`: 기존 테스트를 새 마크업에 맞게 옮긴다.
- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx playwright test tests/e2e/static.spec.ts --project=chromium`
Expected: FAIL

- [ ] **Step 3: 컴포넌트·CSS를 만들고 옛 것을 지운다**

`src/client/main.ts`는 이 Task에서 빈 진입점(`applyLiveDays` 호출만)으로 바꾼다. 옛 `plates.ts`, `hero.ts`, `types.ts`는 지운다. `live.ts`는 `#wall[data-live-start]`와 `.cover canvas[data-tpl]`을 읽도록 고친다. 그 밖의 `[data-live]`(맺음 제목)는 지금처럼 채운다.

- [ ] **Step 4: 테스트를 통과시킨다**

Run: `npm run check && npx vitest run && npx playwright test tests/e2e/static.spec.ts`
Expected: PASS(Chromium·WebKit)

- [ ] **Step 5: 커밋한다** — `feat: render the wall, cover box, detail articles and top bar as static HTML`

### Task 7: 상자 새기기

**Files:**
- Modify: `src/engine/motif.ts`(`frame` 추가), `src/client/main.ts`, `src/client/env.ts`(`PLATE` 토큰 추가)
- Create: `src/engine/pic.ts`, `src/client/tiles.ts`, `src/client/wall.ts`, `tests/unit/pic.test.ts`, `tests/e2e/wall.spec.ts`

**Interfaces:**
- Consumes: Task 6의 DOM 약속
- Produces:
  - `frame(g: CanvasRenderingContext2D, w: number, h: number, s: number): void`: 두께 `1.5s`, 안쪽 여백 `1.3s`의 사각 테두리(시안의 `frame`)
  - `drawPic(g: CanvasRenderingContext2D, pic: Pic, R: Rect, rot = -0.12, scale = 1.1): void`: `pic.d`를 `R` 안 정사각형에 맞춘다. `(cx, cy)`를 가운데로, `rot`만큼 기울여, `Path2D`로 칠한다.
  - `TileSpec = { kind: 'scene' | 'item' | 'year' | 'days'; glyph: string; pattern: string; angle: number; motif: string; seed: number; pic?: Pic }`
  - `carveTile(cv: HTMLCanvasElement, t: TileSpec, cssW: number, cssH: number): void`
    - `mount`+`paint(pr, 1, 0)`로 그린다.
    - 장면·사건(그림 없음): 시안 `renderPrint`의 밑그림 순서를 따른다. 바탕 `.08`, 비네트 `.15`, `fitGlyph(0.94)`, 문양, 흰 막 `.4`, 글자, `frame`.
    - 그림 사건: 위 60% `drawPic`, 아래 37%(`y = R.y + 0.63R.h`) `fitGlyph(0.96)`
    - 연도: 먹 바탕(`PAPER` 색 칼선), 사선 ±22°
    - 일수: 먹 바탕, `rays` 문양, 흰 막 `.45`
  - `initWall(): { ready: Promise<void> }`
    - 첫 화면에 보이는 상자가 모두 새겨지면 `ready`가 끝난다.
    - 새겨진 상자에는 `.carved`를 붙인다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**
  - `pic.test.ts`: 가짜 `g`(`save/translate/rotate/scale/fill/restore` 기록)로 `drawPic`이 `fill`을 한 번 부르고 `restore`로 끝나는지 본다.
  - `wall.spec.ts`(390×780, 1440×860)
    - `first screen boxes are carved after ready`: 화면 안 `.box:not(.off)`가 모두 `.carved`다.
    - `scrolling to the bottom carves every box`: 끝까지 내리고 1초 뒤 `.box:not(.off):not(.carved)`가 0개다.
    - `no console errors, no horizontal scroll`
    - `waits for the plate font`: 기존 `the engraver waits for the real typefaces` 테스트를 `PlateK`/`PlateL`로 옮긴다.
    - `fonts that never arrive fall back after 3.5s`: `**/plate/**`를 영원히 막고, 6초 안에 `data-ready="1"`이 되고 첫 화면이 `.carved`다(Review Focus 3).
    - `the cover shows today's day count`: 기존 `counts days to the viewer's today` 테스트를 `.cover canvas[data-glyph]`에 맞게 옮긴다.
- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx vitest run tests/unit/pic.test.ts && npx playwright test tests/e2e/wall.spec.ts --project=chromium`
Expected: FAIL

- [ ] **Step 3: 구현한다**
  - `wall.ts`는 `IntersectionObserver`(`rootMargin: '300px 0px'`)로 대기열에 넣는다. `requestAnimationFrame`마다 8ms 안에서 꺼내 새기고, 지금 화면 안의 상자를 먼저 새긴다.
  - `main.ts` 순서
    1. `applyLiveDays()`
    2. 판 글꼴 대기: `document.fonts.load('400 64px ' + PLATE, 화면의 모든 data-glyph)`와 3.5초 중 먼저 끝나는 것
    3. `initWall()`
    4. `root.dataset.ready = '1'`
  - 대체 서체 순서는 `--plate: PlateL, PlateK, var(--display)`다.
- [ ] **Step 4: 테스트를 통과시킨다**

Run: `npx vitest run && npx playwright test tests/e2e/wall.spec.ts`
Expected: PASS

- [ ] **Step 5: 커밋한다** — `feat: carve wall boxes on demand with the plate font`

### Task 8: 같은 장면 강조와 상세 창

**Files:**
- Create: `src/client/detail.ts`, `tests/e2e/detail.spec.ts`
- Modify: `src/client/wall.ts`(강조), `src/client/main.ts`

**Interfaces:**
- Consumes: Task 6의 DOM, Task 7의 `carveTile`, `initWall`
- Produces: `initDetail(): void`. 상자 클릭을 가로채 `dialog#detail`을 연다.
  - 열린 상자: `article`의 내용을 `.dbody`에 복제한다. 사건이면 해당 `li`에 `.hl`을 붙이고 `p.meta`를 `li.dataset.meta`로 바꾼다.
  - 판화: `.dcv`에 280×280으로 `carveTile`
  - 출처: 사건 출처(`p.src[data-for]`)가 있으면 그것, 없으면 장면 출처를 보인다. 둘 다 없으면 숨긴다.
  - 정정 링크: `a.fix.href`는 사건이면 `li.dataset.fix`, 아니면 `article.dataset.fix`
  - 앞뒤: 순서는 `.wall .box:not(.year)`의 DOM 순서다. `.prev`는 다음 인덱스(과거), `.next`는 이전 인덱스. 양 끝에서는 `disabled`. ← →도 같다.
  - 목록 `li`를 누르면 그 사건으로 바뀐다.
  - 주소: 열 때 `history.replaceState(null, '', '#' + addr)`, 닫을 때 해시를 지운다. 그때마다 `nav.lang a`의 `href` 해시를 맞춘다.
  - 시작할 때 해시가 상자 주소, `article[data-aliases]` 중 하나, `year-YYYY` 중 하나면 `ready` 뒤에 연다. 해시 디코딩에 실패하거나 모르는 해시면 무시한다.
  - 닫힘(Esc, ×, 바깥 클릭): 연 상자로 초점을 돌린다.
  - 강조: `pointerenter`/`focusin` 때 `.wall`에 `.focus`를, 같은 `data-scene` 상자에 `.rel`을 붙인다. 떠나면 뗀다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**(`detail.spec.ts`, 데스크톱. 휴대폰 크기는 열기·닫기만)
  - `click opens the scene; list click switches to the event`: `a.box[href="#2023-03-gpt-4"]`를 누르면 `#detail[open]`이 되고 제목이 장면 제목이다. 목록 두 번째 `li`를 누르면 `.hl`이 그 `li`이고, `location.hash`가 그 사건 주소다.
  - `arrow keys move in time order`: 사건 상자를 열고 `ArrowLeft`를 누르면 해시가 격자에서 다음 상자(과거)의 주소다. 맨 처음 상자에서는 `.next`가 `disabled`다.
  - `Esc closes and returns focus to the box; hash cleared`(Review Focus 4): 키보드만 쓴다. `Tab`으로 첫 사건 상자까지 간 뒤 `Enter`로 열고 `Escape`로 닫는다. 그 뒤 `document.activeElement`가 그 상자이고, `location.hash`는 `''`다.
  - `deep link to an event opens after fonts`(Review Focus 5): `goto('./#2026-07-sandbox-escape~20260721')` 후 `#detail[open]`, `.hl` 텍스트에 `허깅페이스`가 들어 있다. 그 사건 상자의 `data-glyph`로 `document.fonts.check('64px PlateL, PlateK', glyph)`가 `true`다.
  - `alias and year addresses open`, `bad hashes are ignored`(Review Focus 2): `#%E0%A4%A`와 `#없는-id`로 들어와도 `data-ready="1"`이 되고 창이 열리지 않는다.
  - `correction link carries the event`: `a.fix`의 `href`에 `template=correction.yml`과 `event=`(사건 주소, 인코딩된 형태)가 들어 있다.
  - `hover lights up the same scene`: 사건 상자에 올리면 `.rel`인 상자 수가 그 장면의 사건 수 + 1이고, `.wall.focus`가 된다.
  - `language links keep the open address`: 상세를 연 뒤 `nav.lang a`의 `href`가 `#…`로 끝난다.
- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx playwright test tests/e2e/detail.spec.ts --project=chromium`
Expected: FAIL

- [ ] **Step 3: 구현한다**
- [ ] **Step 4: 테스트를 통과시킨다**

Run: `npx playwright test`
Expected: PASS(Chromium·WebKit 전체)

- [ ] **Step 5: 커밋한다** — `feat: detail dialog with event list, time-order navigation, addresses and same-scene highlight`

### Task 9: 정정 이슈 양식

**Files:**
- Create: `.github/ISSUE_TEMPLATE/correction.yml`, `.github/ISSUE_TEMPLATE/config.yml`(`blank_issues_enabled: true`)
- Test: `tests/unit/issue-template.test.ts`

- [ ] **Step 1: 실패하는 테스트를 쓴다.** `yaml`로 읽어 `body`의 `id` 목록이 `['event', 'what', 'evidence', 'lang']`이다. `event`는 `input`, `what`은 `required: true`인 `textarea`, `lang`은 `ko`·`en` 선택지가 있는 `dropdown`이다. `title`은 `'[Correction] '`으로 시작한다.
- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx vitest run tests/unit/issue-template.test.ts`
Expected: FAIL

- [ ] **Step 3: 양식을 쓴다.** 라벨과 설명은 영어로 쓰고, 설명에 한국어 한 줄을 덧붙인다(스펙 8절).
- [ ] **Step 4: 테스트를 통과시킨다**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 5: 커밋한다** — `chore: add a correction issue form prefilled from each event`

### Task 10: 메타와 OG 이미지

**Files:**
- Modify: `src/layouts/Page.astro`(canonical, `link rel=alternate hreflang` ×(ko, en, x-default), `og:url`, `og:image`(1200×630), `og:type=website`, `twitter:card=summary_large_image`)
- Create: `scripts/og.ts`, `public/og/ko.png`(Task 18에서 `en.png`), `tests/e2e/meta.spec.ts`

**Interfaces:**
- Consumes: `PageView.canonical`, `alternates`, `ogImage`
- Produces: `node scripts/og.ts [locale…]`
  - 실행 중인 미리보기(`http://localhost:4321/ai-timeline-log/`)를 Playwright로 연다.
  - 표지 상자를 숨기고 격자 왼쪽 위 1200×630을 찍는다.
  - 그 위에 먹 띠를 얹고 `AI Timeline Log`와 `2022.11.30 → 현재`(en `Since Nov 30, 2022`)를 쓴다. 일수는 넣지 않는다.
  - 결과를 `public/og/<locale>.png`에 쓴다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**(`meta.spec.ts`). canonical `https://lucasflatwhite.com/ai-timeline-log/`, `og:image`가 `…/og/ko.png`이고 그 파일이 200으로 열린다. `twitter:card`, `hreflang="x-default"`가 있다.
- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx playwright test tests/e2e/meta.spec.ts --project=chromium`
Expected: FAIL

- [ ] **Step 3: 메타를 넣는다.** 그다음 `npm run build && npx astro preview --port 4321 &` 상태에서 `node scripts/og.ts ko`를 실행하고, 이미지를 눈으로 확인한다.
- [ ] **Step 4: 테스트를 통과시킨다**

Run: `npx playwright test tests/e2e/meta.spec.ts`
Expected: PASS

- [ ] **Step 5: 커밋한다** — `feat: canonical, hreflang and share images cut from the wall`

### Task 11: 예산 검사, CI, 라이선스, 작업 규칙

**Files:**
- Create: `scripts/budget.ts`, `.github/workflows/check.yml`, `content/LICENSE`(CC BY 4.0 전문), `CLAUDE.md`
- Modify: `package.json`(`"budget": "node scripts/budget.ts"`), `README.md`(라이선스 구분, 새 스크립트)

**Interfaces:**
- Produces: `node scripts/budget.ts`
  - `dist/plate/<locale>-*.woff2` 언어별 합계가 40960바이트를 넘거나, `dist/_astro/*.js` 합계가 30720바이트를 넘으면 종료 코드 1이다.
  - 표를 출력한다.

- [ ] **Step 1: 예산 스크립트를 쓰고, 일부러 예산을 1바이트로 낮춰 실패하는지 본다**

Run: `BUDGET_FONT=1 node scripts/budget.ts; echo $?`
Expected: 표 출력, 그리고 `1`

- [ ] **Step 2: 실제 예산으로 통과를 확인한다**

Run: `npm run build && npm run budget; echo $?`
Expected: `0`

- [ ] **Step 3: CI를 쓴다.** `check.yml`은 `pull_request`와 `push: main`에서 돈다. 순서는 Node 22.22, `npm ci`, `npm run check`, `npm test`, `npm run build`, `npm run budget`, `npx playwright install --with-deps chromium`, `npx playwright test --project=chromium`이다.
- [ ] **Step 4: `CLAUDE.md`를 쓴다.** 10-18 문서 11절의 절차에 다음을 더한다.
  - 사건 `glyph` 규칙: 작은 판은 한글 3자 이내, 숫자·이름은 공용, 그 밖에는 `{ ko, en }`
  - `pic`을 쓸 때와 그리는 법(100×100, 로고 금지)
  - 영어 문장 원칙(`glossary.yaml`)
  - 검사 명령(`npm test`, `npm run build`, `npm run budget`)
- [ ] **Step 5: 커밋한다** — `chore: budget check, PR workflow, content license and agent working rules`

### Task 12: 성능 측정 스크립트

**Files:**
- Create: `scripts/perf.ts`
- Modify: `package.json`(`"perf": "node scripts/perf.ts"`)

**Interfaces:**
- Produces: `node scripts/perf.ts [--locale ko|en]`
  - 미리보기 서버를 대상으로 측정한다. 조건은 Playwright Chromium CDP에서 `Network.emulateNetworkConditions({ latency: 150, downloadThroughput: 1.6e6/8, uploadThroughput: 750e3/8 })`와 `Emulation.setCPUThrottlingRate({ rate: 4 })`다.
  - 390×844와 1440×900에서 각각 3회 잰다.
  - "첫 화면 시간"은 화면 안 `.box:not(.off)`가 모두 `.carved`가 된 시각의 `performance.now()`다.
  - 받은 바이트 합계(`encodedBodySize`)와 함께 중앙값을 출력한다.
  - 목표(1.5초, 2.0초)를 넘으면 `OVER`를 표시한다. 실패 코드는 내지 않는다.
  - 미리보기 서버는 HTTP/1.1이라 실제(HTTP/2)보다 불리하다는 점을 출력 첫 줄에 적는다.

- [ ] **Step 1: 스크립트를 쓰고 실행한다**

Run: `npm run build && (npx astro preview --port 4321 &) && sleep 3 && npm run perf`
Expected: 표 두 줄(390, 1440). 결과를 이 Task의 커밋 메시지 본문에 붙인다.

- [ ] **Step 2: 목표를 넘으면 원인을 찾는다**

글꼴 preload, 대기열 순서, JS 크기 순서로 본다. HTTP/1.1 탓으로 보이면 `--h2` 옵션을 붙인다. 이 옵션은 시안 측정 때처럼 `dist`를 자체 서명 인증서의 `http2.createSecureServer`로 내주고, base 경로를 벗겨 매핑하는 방식이다. 이 상태로 다시 잰다.

- [ ] **Step 3: 커밋한다** — `chore: add a throttled first-screen performance probe`

## Part 2. 내용 (Claude가 쓰고 사용자가 검토)

내용 Task는 "실패하는 테스트" 대신 빌드 검사(Task 2)가 문지기다. 모든 Task가 끝날 때 `npm test && npm run build`가 통과해야 한다. 검토 자료는 `docs/review/2026-10-25-content-review.md` 한 파일에 Task마다 절을 더해 간다.

### Task 13: 한국어 사건 핵심어 다듬기

**Files:** `content/scenes/*.yaml`(사건 `glyph`), `docs/review/2026-10-25-content-review.md`(새 파일), 지움: `scripts/backfill-glyphs.ts`

- [ ] **Step 1:** 128개 핵심어를 사건 문장과 대조해 다시 고른다.
  - 기준: 작은 판에서 읽힘(한글 3자 이내 또는 라틴 7자 이내), 사건의 고유한 한 단어, 같은 장면 안에서 겹치지 않음
  - 숫자·모델 이름이면 공용 문자열로 둔다.
- [ ] **Step 2:** `npm run build`의 작은 판 경고가 0개다.
- [ ] **Step 3:** 검토 문서 1절에 `장면 | 날짜 | 사건 문장 | 이전 핵심어 | 새 핵심어` 표를 쓴다.
- [ ] **Step 4: 커밋한다** — `content: refine event keywords for small boxes`

### Task 14: 영어 글 전체와 용어집

**Files:**
- `content/scenes/*.yaml`(`en` 블록, 사건 `en`)
- `content/years.yaml`, `content/arcs.yaml`, `content/ledger.yaml`(`lab.en`)
- `content/site.yaml`(`en`: `heroGlyph`, `lede`, `description`, `ogDescription`, `ledgerNote`, `sourcesNote`, `making`)
- `content/glossary.yaml`(새 파일)
- 검토 문서

- [ ] **Step 1:** `glossary.yaml`부터 쓴다.
  - 고유명사(회사, 모델, 법, 기관)의 공식 영문명과 1차 출처 URL을 적는다.
  - 형식: `[{ ko, en, source }]`
  - 스키마 검사는 하지 않지만 `yaml` 파싱은 되어야 한다.
- [ ] **Step 2:** 장면 33개(kicker, title, lede), 사건 128개, 연도 4개, 시기 3개, 연구소 6개, `site.en`을 쓴다.
  - 문체: 한국어 원문의 짧고 건조한 기록체를 따른다.
  - 금지어와 상대 시간 검사를 통과해야 한다.
  - `site.en.lede`의 `to the present`는 예외다.
- [ ] **Step 3:** `npm run build`가 통과하고 `dist/en/index.html`이 생긴다(이제 `site.en`이 있다).
- [ ] **Step 4:** 검토 문서 2절에 장면별 `ko | en`을 나란히 쓴다.
- [ ] **Step 5: 커밋한다** — `content: English text for every scene, event, year, era and lab, with a glossary`

### Task 15: 영어 핵심어

**Files:** `content/scenes/*.yaml`(장면 `en.glyph`, 사건 `glyph: { ko, en }`), 검토 문서

- [ ] **Step 1:** 한글이 든 핵심어(장면 10, 사건 68 안팎)에 영어를 붙인다.
  - 대문자 위주의 짧은 단어로, 작은 판 기준은 라틴 7자 이내다(예: `속도` → `PACE`, `탈출` → `ESCAPE`).
  - 날짜형 장면 핵심어는 10-18 문서의 예(`1.22` → `JAN 22`)를 따른다.
- [ ] **Step 2:** `npm run build`가 통과한다(한글 검사, 작은 판 경고 0). `npm run budget`에서 en 판 글꼴이 40KB 이하다.
- [ ] **Step 3:** 검토 문서 3절에 `ko 핵심어 | en 핵심어` 표를 쓴다.
- [ ] **Step 4: 커밋한다** — `content: English keywords for the wall`

### Task 16: 그림 상자

**Files:** `content/pics.yaml`, `content/scenes/*.yaml`(사건 `pic`), 검토 문서

- [ ] **Step 1:** 그림이 자연스러운 사건을 10~20개 고른다.
  - 대상: 물건·장소·행위가 뚜렷한 사건(예: 목소리 → 마이크, 금메달 → 메달, 칩 → 반도체)
  - 로고·인물 얼굴·상표 모양은 쓰지 않는다.
- [ ] **Step 2:** 각 그림을 100×100 좌표의 닫힌 SVG path 하나로 그린다. `note`에 무엇을 뜻하는지 적는다.
  - 위키 사건에서 쓴 퍼즐 조각 경로를 예로 참고한다. `cx: 58, cy: 42`이고, 경로는 `M20 20 H45 A9 9 0 1 1 55 20 H80 V45 A9 9 0 1 1 80 55 V80 H55 A9 9 0 1 0 45 80 H20 V55 A9 9 0 1 0 20 45 Z`다.
- [ ] **Step 3:** `npm run dev`로 띄워 64px·132px·280px에서 그림이 알아보이는지 눈으로 확인한다. 알아보기 어려운 것은 단순하게 다시 그리거나 뺀다.
- [ ] **Step 4:** 검토 문서 4절에 `사건 | 그림 이름 | 뜻` 표와 상자 캡처(`docs/review/pics/*.png`)를 넣는다.
- [ ] **Step 5: 커밋한다** — `content: picture boxes for events that suggest an image`

### Task 17: 장면별 출처 채우기

**Files:** `content/scenes/*.yaml`(출처가 없는 28개 장면의 `sources`, 필요하면 사건 `sources`), 검토 문서

- [ ] **Step 1:** 장면마다 1차 출처(회사 발표, 공식 문서, 판결문)를 우선해 1~3개를 찾는다.
  - 진행 중인 사건은 언론 보도를 쓰고 `publisher`를 적는다.
  - 장면 글과 사실이 다르면 고치지 말고 검토 문서에 따로 적는다.
- [ ] **Step 2:** `npm run build` 경고에 "출처 없는 장면"이 0개다.
- [ ] **Step 3:** 검토 문서 5절에 `장면 | 출처 | 글과 다른 점` 표를 쓴다.
- [ ] **Step 4: 커밋한다** — `content: sources for every scene`

## Part 3. 출시 준비

### Task 18: 영어 필수화, 두 언어 검증, 승인 자료

**Files:**
- Modify: `src/lib/schema.ts`(사건 `en`, 장면 `en`, 연도·시기·연구소 `en`, `site.en`을 필수로), `tests/e2e/*.spec.ts`(ko·en 반복), `tests/unit/content.test.ts`
- Create: `public/og/en.png`

- [ ] **Step 1: 실패하는 테스트를 쓴다.** 픽스처 장면에서 `en`을 지우면 `/en: .*Required|expected object/`로 실패한다. e2e의 각 `describe`를 `for (const path of ['./', './en/'])`로 감싼다. en에서 `.cover canvas`의 `data-glyph`가 `/^\d{1,3}(,\d{3})* days$/`이고, `nav.lang a[aria-current]`가 EN이다.
- [ ] **Step 2: 실행해서 실패를 확인한다**

Run: `npx vitest run tests/unit/content.test.ts`
Expected: FAIL

- [ ] **Step 3:** 스키마를 필수로 바꾸고 `node scripts/og.ts en`을 실행한다.
- [ ] **Step 4: 모든 검사를 통과시킨다**

Run: `npm run check && npm test && npm run build && npm run budget && npx playwright test && npm run perf`
Expected: 모두 PASS. `perf`는 4줄(언어 2 × 폭 2)이고, `OVER`가 없다.

- [ ] **Step 5:** 승인 자료를 만든다. 두 언어 × 390·1440 첫 화면, 상세 창, 맺음을 `docs/review/shots/`에 찍는다. 검토 문서 맨 위에 `perf` 결과를 붙인다.
- [ ] **Step 6: 커밋한다** — `feat: require English everywhere and verify both languages end to end`

사용자가 검토 문서와 화면을 승인하면 출시 준비가 끝난다. main 병합과 배포는 사용자가 따로 지시한다.
