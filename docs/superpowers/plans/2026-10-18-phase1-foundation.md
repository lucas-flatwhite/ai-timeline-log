# 1단계: 기반과 원본 재현 (ko) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 원본 `index.html` 한 파일을 Astro 정적 사이트로 옮겨, 내용은 YAML 파일로, 스타일·판화 엔진·스크롤 제어는 모듈로 분리하되 한국어 화면과 동작은 원본과 똑같이 재현한다.

**Architecture:** 빌드 시 `content/`의 YAML을 읽어 zod로 검사하고(`src/lib/content.ts`), 화면에 필요한 값을 모두 계산한 뷰 모델(`src/lib/view.ts`)을 만든다. Astro 컴포넌트가 이를 정적 HTML로 찍고, 판화 설정은 `data-*` 속성으로 넘긴다. 브라우저 JS(`src/client/`)는 DOM만 읽어 원본과 같은 판화·고정·먹 입히기를 수행한다.

**Tech Stack:** Astro 7.4, TypeScript(Node 22.22 타입 스트리핑), zod 4(`astro/zod`), `yaml` 2, fontsource, Vitest, Playwright 1.64

**Spec:** `docs/superpowers/specs/2026-10-18-ai-timeline-log-design.md` (이 계획은 13절의 1단계를 구현한다. 2~5단계는 1단계 완료 후 별도 계획으로 쓴다)

**스펙과 다르게 정한 점 (이유 포함)**
- 스펙 3절의 `src/content.config.ts`(Astro 콘텐츠 컬렉션) 대신 `src/lib/content.ts`의 자체 로더를 쓴다. YAML 파싱 → zod 검사 → 파일 간 교차 검사를 한 곳에서 하고, Vitest로 픽스처 테스트를 할 수 있기 때문이다. 스키마 검사는 그대로 빌드 실패로 이어진다.
- 스펙 4.3절 "장면이 있는 연도에 요약이 없으면 실패"는 **시작 연도(2022)를 제외**한다. 원본에도 2022 연도 판이 없고 표지가 그 역할을 한다.
- 1단계는 원본 재현이므로 판 번호, "오늘" 문구, 원래 제목("생성형 AI 1,405일")을 그대로 둔다. 바꾸는 것은 2단계다. 단 장면 주소는 처음부터 고정 ID를 쓴다(화면 차이 없음).
- 항목 날짜는 저장 형식이 ISO로 바뀌므로 다른 해 날짜 표시가 `23.01.23` → `2023.01.23`으로 바뀐다(스펙 7절의 표). 원본과의 글자 일치 검사는 날짜 표시를 제외하고, 날짜는 값으로 비교한다.

## Global Constraints

- Node `>=22.22.0` (Astro 7.4의 요구 사항). `package.json`에 `"type": "module"`.
- `astro` 정확히 `7.4.0`. 출력은 정적(`output` 기본값).
- `site: 'https://lucas-flatwhite.github.io'`, `base: '/ai-timeline-log'`, `trailingSlash: 'always'`.
- 외부 런타임 리소스 없음. Google Fonts 링크 금지. 폰트는 `@fontsource/black-han-sans`(400), `@fontsource/hahmlet`(400, 600), `@fontsource/ibm-plex-mono`(500).
- TypeScript는 `astro/tsconfigs/base`(strict 아님). `verbatimModuleSyntax`가 켜져 있으므로 타입만 가져올 때는 `import type`.
- 상대 경로 import에는 `.ts` 확장자를 붙인다(Node 실행 스크립트와 Vite 양쪽에서 동작).
- 원본 동작 보존: 애니메이션은 표지 찍기, 판화 찍기·지우기, 항목 먹 입히기 세 가지뿐. 타이밍 상수·임계값을 바꾸지 않는다.
- JS가 꺼져도 모든 글이 HTML에 있어야 한다.
- 원본 참조 파일: `reference/original/index.html`(Task 1에서 생성). 이 계획의 "원본 N–M행"은 이 파일의 줄 번호다.
- 모든 커밋 메시지는 다음 두 줄로 끝난다(한 문단으로):
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01F47iUnPCPhWZcyTJmgjg5n
  ```
  아래 커밋 명령의 `$TRAILER`는 이 두 줄이다. 셸에서 먼저 정의한다:
  `TRAILER=$'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01F47iUnPCPhWZcyTJmgjg5n'`
- 작업 브랜치: `feat/restructure` (이미 있음).

## Review Focus

1. **폰트 파일이 안 오거나 늦음** → 3.5초 뒤 대체 서체로라도 판화가 찍히고 오류 없이 동작해야 한다. (Task 8 `fonts blocked` 테스트)
2. **높이 500px 미만 가로 휴대폰(844×390)** → 고정 없이 일반 스크롤로 모든 글이 보이고 오류·가로 스크롤이 없어야 한다. (Task 8 `short landscape` 테스트)
3. **장면 주소로 바로 진입(`/#2025-01-deepseek`)** → 폰트 로딩 뒤 레이아웃이 바뀌어도 그 장면에 도착하고 상단 표시줄이 그 장면을 가리켜야 한다. (Task 8 `deep link` 테스트, Task 8의 재정렬 코드)
4. **사람이 손으로 고친 YAML**: 연도만 적은 값(`from: 2023` → 숫자), 날짜 객체, 잘못된 날짜(`2023-02-30`) → 정상화되거나 파일명·필드가 명시된 오류로 빌드가 멈춰야 한다. (Task 2 `normalizeDate`, Task 3 로더 테스트)
5. **숫자처럼 보이거나 줄바꿈이 있는 핵심어**(`"1.22"`, `"2.27"`, `"CODE\nRED"`) → YAML → HTML 속성 → canvas까지 문자열 그대로 가야 한다. (Task 4 이관 일치 테스트, Task 7 JS-off 테스트)

---

### Task 1: 프로젝트 골격과 원본 보관

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `.nvmrc`, `public/.nojekyll`, `src/pages/index.astro`(임시), `tests/unit/smoke.test.ts`
- Create: `reference/original/index.html`, `reference/original/README.md`, `reference/original/ai-timeline-prompt.md`
- Modify: `README.md`

**Interfaces:**
- Produces: npm 스크립트 `dev`, `build`, `preview`, `check`, `test`, `test:e2e`, `migrate`, `parity`. 원본 참조 파일 경로.

- [ ] **Step 1: 원본 보관**

```bash
mkdir -p reference/original
unzip -j -o ~/Downloads/ai-1405.zip 'ai-1405/index.html' 'ai-1405/README.md' -d reference/original
cp ~/Downloads/ai-timeline-prompt.md reference/original/
wc -l reference/original/index.html   # 기대: 691
sed -n '240p' reference/original/index.html | cut -c1-40   # 기대: var CH=[
```

- [ ] **Step 2: package.json 작성과 설치**

```json
{
  "name": "ai-timeline-log",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.22.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview --port 4321",
    "check": "astro check",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "migrate": "node scripts/migrate-original.ts",
    "parity": "node scripts/parity-shots.ts"
  }
}
```

```bash
npm i astro@7.4.0 yaml@^2 @fontsource/black-han-sans@^5.3.0 @fontsource/hahmlet@^5.3.0 @fontsource/ibm-plex-mono@^5.3.0
npm i -D vitest @playwright/test@1.64.1 @astrojs/check@0.9.10 typescript@^5
npx playwright install chromium
echo "22.22" > .nvmrc
```

- [ ] **Step 3: 설정 파일**

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lucas-flatwhite.github.io',
  base: '/ai-timeline-log',
  trailingSlash: 'always',
});
```

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/base",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["node_modules", "dist", "reference", ".parity"]
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'] },
});
```

`.gitignore`:
```
node_modules/
dist/
.astro/
.parity/
test-results/
playwright-report/
.DS_Store
```

`public/.nojekyll`: 빈 파일 (`touch public/.nojekyll`).

`src/pages/index.astro` (Task 7에서 교체):
```astro
---
---
<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>scaffold</title></head><body><p>scaffold</p></body></html>
```

`tests/unit/smoke.test.ts`:
```ts
import { test, expect } from 'vitest';
import { existsSync } from 'node:fs';

test('reference original is kept in the repo', () => {
  expect(existsSync('reference/original/index.html')).toBe(true);
  expect(existsSync('reference/original/ai-timeline-prompt.md')).toBe(true);
});
```

- [ ] **Step 4: 빌드와 테스트 확인**

Run: `npm run build && ls dist && grep -c scaffold dist/index.html && npm test`
Expected: `dist/index.html` 존재, `1`, Vitest `1 passed`.

- [ ] **Step 5: README에 개발 방법 추가**

`README.md` 끝에 추가:
````markdown

## 개발

Node 22.22 이상이 필요합니다.

```bash
npm install
npm run dev        # http://localhost:4321/ai-timeline-log/
npm test           # 단위 테스트
npm run test:e2e   # 브라우저 테스트 (빌드 후 미리보기 서버로 실행)
```

`reference/original/`은 처음 아티팩트로 만든 한 파일 버전입니다. 구조를 바꾼 뒤 원본과 같은지 비교하는 기준으로만 쓰고, 배포에는 포함되지 않습니다.
````

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project and keep original reference" -m "$TRAILER"
```

---

### Task 2: 날짜 라이브러리

**Files:**
- Create: `src/lib/dates.ts`
- Test: `tests/unit/dates.test.ts`

**Interfaces:**
- Produces (모두 `src/lib/dates.ts`에서 export):
  - `type Locale = 'ko' | 'en'`
  - `interface Span { from: string; to?: string }`
  - `parts(iso: string): { y: number; m?: number; d?: number }` — `YYYY`, `YYYY-MM`, `YYYY-MM-DD`만 허용, 범위 검사
  - `normalizeDate(v: unknown): string` — `Date` → `YYYY-MM-DD`(UTC), 정수 → 문자열, 문자열은 검사 후 그대로
  - `toUTC(iso: string): number`, `daysBetween(a: string, b: string): number`, `fraction(iso: string, start: string, end: string): number`
  - `formatDot(iso)`(`2022.11.30`), `formatYYMM(iso)`(`22.11`), `formatDate(locale, iso)`, `formatLong(locale, iso)`(`2026년 10월 5일` / `October 5, 2026`), `formatMonthLong(locale, iso)`(`2026년 10월` / `October 2026`)
  - `formatSpan(locale: Locale, span: Span): string`, `formatItemDate(locale: Locale, iso: string, sceneYear: number): string`
  - `parseLegacyWhen(when: string): Span`, `parseLegacyItemDate(s: string, sceneYear: number): string`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/dates.test.ts`:
```ts
import { describe, test, expect } from 'vitest';
import {
  parts, normalizeDate, daysBetween, fraction, formatDot, formatYYMM, formatDate, formatLong,
  formatMonthLong, formatSpan, formatItemDate, parseLegacyWhen, parseLegacyItemDate,
} from '../../src/lib/dates.ts';

const ORIGINAL_WHENS = [
  '2022.11.30', '2023.02', '2023.03.14', '2023.05', '2023.07–08', '2023.10–11', '2023.12–2024.02',
  '2024.03', '2024.05', '2024.06', '2024.09–10', '2024.10–12', '2025.01', '2025.02', '2025.03',
  '2025.05', '2025.06–08', '2025.09–10', '2025.10.31', '2025.11–12', '2026.01', '2026.02',
  '2026.02–03', '2026.03–05', '2026.06', '2026.07', '2026.07–09', '2026.09',
];

describe('parts / normalizeDate', () => {
  test('accepts year, month and day precision', () => {
    expect(parts('2023')).toEqual({ y: 2023, m: undefined, d: undefined });
    expect(parts('2023-01')).toEqual({ y: 2023, m: 1, d: undefined });
    expect(parts('2024-02-29')).toEqual({ y: 2024, m: 2, d: 29 });
  });
  test('rejects impossible dates', () => {
    expect(() => parts('2023-13')).toThrow(/month/);
    expect(() => parts('2023-02-30')).toThrow(/day/);
    expect(() => parts('2023/01/01')).toThrow(/Invalid date/);
  });
  test('normalizes YAML values', () => {
    expect(normalizeDate(new Date('2022-11-30T00:00:00Z'))).toBe('2022-11-30');
    expect(normalizeDate(2023)).toBe('2023');
    expect(normalizeDate('2023-01')).toBe('2023-01');
    expect(() => normalizeDate('2023-02-30')).toThrow();
    expect(() => normalizeDate(null)).toThrow();
  });
});

describe('arithmetic', () => {
  test('day count of the first edition', () => {
    expect(daysBetween('2022-11-30', '2026-10-05')).toBe(1405);
  });
  test('fraction spans start..end', () => {
    expect(fraction('2022-11-30', '2022-11-30', '2026-10-05')).toBe(0);
    expect(fraction('2026-10-05', '2022-11-30', '2026-10-05')).toBe(1);
    expect(fraction('2023-01', '2022-11-30', '2026-10-05')).toBeCloseTo(2 / 1405, 6);
  });
});

describe('formatting', () => {
  test('short forms', () => {
    expect(formatDot('2022-11-30')).toBe('2022.11.30');
    expect(formatYYMM('2022-11-30')).toBe('22.11');
    expect(formatYYMM('2026-04')).toBe('26.04');
    expect(formatDate('ko', '2022-11')).toBe('2022.11');
    expect(formatDate('ko', '2023')).toBe('2023');
    expect(formatDate('en', '2022-11')).toBe('Nov 2022');
  });
  test('long forms', () => {
    expect(formatLong('ko', '2026-10-05')).toBe('2026년 10월 5일');
    expect(formatLong('en', '2026-10-05')).toBe('October 5, 2026');
    expect(formatMonthLong('ko', '2026-10-05')).toBe('2026년 10월');
    expect(formatMonthLong('en', '2026-10-05')).toBe('October 2026');
  });
  test('spans (spec section 7)', () => {
    expect(formatSpan('ko', { from: '2025-01' })).toBe('2025.01');
    expect(formatSpan('ko', { from: '2024-09', to: '2024-10' })).toBe('2024.09–10');
    expect(formatSpan('ko', { from: '2023-12', to: '2024-02' })).toBe('2023.12–2024.02');
    expect(formatSpan('ko', { from: '2022-11-30' })).toBe('2022.11.30');
    expect(formatSpan('en', { from: '2025-01' })).toBe('Jan 2025');
    expect(formatSpan('en', { from: '2024-09', to: '2024-10' })).toBe('Sep–Oct 2024');
    expect(formatSpan('en', { from: '2023-12', to: '2024-02' })).toBe('Dec 2023 – Feb 2024');
    expect(formatSpan('en', { from: '2022-11-30' })).toBe('Nov 30, 2022');
  });
  test('item dates (spec section 7)', () => {
    expect(formatItemDate('ko', '2025-01-20', 2025)).toBe('01.20');
    expect(formatItemDate('ko', '2023-01-23', 2022)).toBe('2023.01.23');
    expect(formatItemDate('ko', '2023-01', 2022)).toBe('2023.01');
    expect(formatItemDate('ko', '2023-01', 2023)).toBe('2023.01');
    expect(formatItemDate('en', '2025-01-20', 2025)).toBe('Jan 20');
    expect(formatItemDate('en', '2023-01-23', 2022)).toBe('Jan 23, 2023');
    expect(formatItemDate('en', '2023-01', 2022)).toBe('Jan 2023');
  });
});

describe('legacy parsing', () => {
  test('every original "when" round-trips', () => {
    for (const w of ORIGINAL_WHENS) expect(formatSpan('ko', parseLegacyWhen(w))).toBe(w);
  });
  test('item shorthands', () => {
    expect(parseLegacyItemDate('12.05', 2022)).toBe('2022-12-05');
    expect(parseLegacyItemDate('23.01', 2022)).toBe('2023-01');
    expect(parseLegacyItemDate('23.01.23', 2022)).toBe('2023-01-23');
    expect(() => parseLegacyItemDate('2023', 2022)).toThrow();
  });
  test('rejects unknown when', () => {
    expect(() => parseLegacyWhen('2023년 2월')).toThrow();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/unit/dates.test.ts`
Expected: FAIL — `Failed to load url ../../src/lib/dates.ts`

- [ ] **Step 3: 구현**

`src/lib/dates.ts`:
```ts
export type Locale = 'ko' | 'en';
export interface Span { from: string; to?: string }
interface Parts { y: number; m?: number; d?: number }

const EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const RE = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

export function parts(iso: string): Parts {
  const r = RE.exec(iso);
  if (!r) throw new Error(`Invalid date "${iso}" (expected YYYY, YYYY-MM or YYYY-MM-DD)`);
  const y = +r[1];
  const m = r[2] ? +r[2] : undefined;
  const d = r[3] ? +r[3] : undefined;
  if (m !== undefined && (m < 1 || m > 12)) throw new Error(`Invalid month in "${iso}"`);
  if (d !== undefined && (d < 1 || d > new Date(Date.UTC(y, m!, 0)).getUTCDate())) throw new Error(`Invalid day in "${iso}"`);
  return { y, m, d };
}

export function normalizeDate(v: unknown): string {
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) throw new Error('Invalid date object');
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === 'number' && Number.isInteger(v)) v = String(v);
  if (typeof v !== 'string') throw new Error(`Invalid date ${JSON.stringify(v)}`);
  parts(v);
  return v;
}

export function toUTC(iso: string): number {
  const p = parts(iso);
  return Date.UTC(p.y, (p.m ?? 1) - 1, p.d ?? 1);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toUTC(b) - toUTC(a)) / 86_400_000);
}

export function fraction(iso: string, start: string, end: string): number {
  return (toUTC(iso) - toUTC(start)) / (toUTC(end) - toUTC(start));
}

const p2 = (n: number) => String(n).padStart(2, '0');

function dot(p: Parts, withYear = true): string {
  const out: string[] = withYear ? [String(p.y)] : [];
  if (p.m !== undefined) out.push(p2(p.m));
  if (p.d !== undefined) out.push(p2(p.d));
  return out.join('.');
}

function en(p: Parts): string {
  if (p.m === undefined) return String(p.y);
  if (p.d === undefined) return `${EN[p.m - 1]} ${p.y}`;
  return `${EN[p.m - 1]} ${p.d}, ${p.y}`;
}

export function formatDot(iso: string): string {
  return dot(parts(iso));
}

export function formatYYMM(iso: string): string {
  const p = parts(iso);
  return `${String(p.y).slice(2)}.${p2(p.m ?? 1)}`;
}

export function formatDate(locale: Locale, iso: string): string {
  const p = parts(iso);
  return locale === 'ko' ? dot(p) : en(p);
}

export function formatLong(locale: Locale, iso: string): string {
  const p = parts(iso);
  if (p.m === undefined || p.d === undefined) throw new Error(`formatLong needs YYYY-MM-DD: ${iso}`);
  return locale === 'ko' ? `${p.y}년 ${p.m}월 ${p.d}일` : `${EN_LONG[p.m - 1]} ${p.d}, ${p.y}`;
}

export function formatMonthLong(locale: Locale, iso: string): string {
  const p = parts(iso);
  if (p.m === undefined) throw new Error(`formatMonthLong needs a month: ${iso}`);
  return locale === 'ko' ? `${p.y}년 ${p.m}월` : `${EN_LONG[p.m - 1]} ${p.y}`;
}

export function formatSpan(locale: Locale, span: Span): string {
  const f = parts(span.from);
  if (!span.to) return locale === 'ko' ? dot(f) : en(f);
  const t = parts(span.to);
  if (locale === 'ko') return `${dot(f)}–${dot(t, t.y !== f.y)}`;
  if (t.y !== f.y) return `${en(f)} – ${en(t)}`;
  if (f.d === undefined && t.d === undefined) return `${EN[f.m! - 1]}–${EN[t.m! - 1]} ${f.y}`;
  if (f.d !== undefined && t.d !== undefined) return `${EN[f.m! - 1]} ${f.d} – ${EN[t.m! - 1]} ${t.d}, ${f.y}`;
  return `${en(f)} – ${en(t)}`;
}

export function formatItemDate(locale: Locale, iso: string, sceneYear: number): string {
  const p = parts(iso);
  const short = p.y === sceneYear && p.d !== undefined;
  if (locale === 'ko') return short ? dot(p, false) : dot(p);
  return short ? `${EN[p.m! - 1]} ${p.d}` : en(p);
}

/** 원본의 기간 표기("2023.07–08", "2023.12–2024.02", "2022.11.30")를 Span으로 */
export function parseLegacyWhen(when: string): Span {
  const r = /^(\d{4})\.(\d{2})(?:\.(\d{2}))?(?:–(?:(\d{4})\.)?(\d{2}))?$/.exec(when);
  if (!r) throw new Error(`Unrecognized when "${when}"`);
  const [, y, mo, d, y2, mo2] = r;
  const from = d ? `${y}-${mo}-${d}` : `${y}-${mo}`;
  return mo2 ? { from, to: `${y2 ?? y}-${mo2}` } : { from };
}

/** 원본의 항목 날짜 축약형: "MM.DD"(장면 연도), "YY.MM", "YY.MM.DD" */
export function parseLegacyItemDate(s: string, sceneYear: number): string {
  const p = s.split('.');
  if (p.length === 3) return normalizeDate(`20${p[0]}-${p[1]}-${p[2]}`);
  if (p.length === 2) return normalizeDate(+p[0] > 12 ? `20${p[0]}-${p[1]}` : `${sceneYear}-${p[0]}-${p[1]}`);
  throw new Error(`Unrecognized item date "${s}"`);
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run tests/unit/dates.test.ts`
Expected: PASS (all)

- [ ] **Step 5: Commit**

```bash
git add src/lib/dates.ts tests/unit/dates.test.ts
git commit -m "feat: add date parsing and locale formatting" -m "$TRAILER"
```

---

### Task 3: 내용 스키마와 로더

**Files:**
- Create: `src/lib/schema.ts`, `src/lib/content.ts`
- Create: `tests/fixtures/content/site.yaml`, `tests/fixtures/content/years.yaml`, `tests/fixtures/content/arcs.yaml`, `tests/fixtures/content/ledger.yaml`, `tests/fixtures/content/sources.yaml`, `tests/fixtures/content/scenes/2023-03-14-gpt-4.yaml`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: `normalizeDate`, `toUTC` (Task 2)
- Produces:
  - `src/lib/schema.ts`: `sceneSchema`, `siteSchema`, `yearsSchema`, `arcsSchema`, `ledgerSchema`, `sourcesSchema` (zod), 타입 `Scene`, `Site`, `Years`, `Arc`, `Lab`, `Source` (`z.output`)
  - `src/lib/content.ts`: `interface Content { site: Site; scenes: Scene[]; years: Years; arcs: Arc[]; ledger: Lab[]; sources: Source[] }`, `loadContent(dir?: string): Content` — 기본 `join(process.cwd(), 'content')`. 오류가 하나라도 있으면 `Content errors:\n- <파일>: <경로>: <메시지>` 형식으로 모두 모아 throw. 장면은 `(date, order)` 순, 계보 모델은 날짜 순(안정 정렬).

- [ ] **Step 1: 픽스처 작성**

`tests/fixtures/content/site.yaml`:
```yaml
start: 2022-11-30
asOf: 2026-10-05
firstEdition: 2026-10-05
ko:
  name: 생성형 AI 목판 연표
  heroGlyph: { wide: "{days}일", tall: "{days}\n일" }
  lede: "{startLong}부터 {asOfLong}까지 장면 {count}개."
  description: "설명 {count}"
  ogDescription: "공유 {count}"
  ledgerNote: 계보 메모
  sourcesNote: "{asOfLong}까지의 보도."
```

`tests/fixtures/content/years.yaml`:
```yaml
2023:
  ko: { title: 경쟁이 시작된 해, body: 본문 }
```

`tests/fixtures/content/arcs.yaml`:
```yaml
- from: 2022-11
  to: 2023
  ko: { title: 묻고 답하기, body: 본문 }
```

`tests/fixtures/content/ledger.yaml`:
```yaml
- lab: { ko: OpenAI }
  models:
    - { name: GPT-4, date: 2023-03 }
    - { name: ChatGPT, date: 2022-11 }
```

`tests/fixtures/content/sources.yaml`:
```yaml
- { url: "https://example.com/a", title: "Example · A" }
```

`tests/fixtures/content/scenes/2023-03-14-gpt-4.yaml`:
```yaml
id: 2023-03-gpt-4
date: 2023-03-14
span: { from: 2023-03-14 }
added: 2026-10-05
print: { pattern: c, motif: disc, glyph: "GPT-4" }
items:
  - { date: 2023-03-15, ko: 항목 하나 }
  - { date: 2023-03-22, ko: 항목 둘 }
  - { date: 2023-03-31, ko: 항목 셋 }
ko: { kicker: 성능 도약, title: GPT-4, lede: 요약 }
```

- [ ] **Step 2: 실패하는 테스트 작성**

`tests/unit/content.test.ts`:
```ts
import { describe, test, expect } from 'vitest';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadContent } from '../../src/lib/content.ts';

const FIXTURE = 'tests/fixtures/content';
const SCENE = 'scenes/2023-03-14-gpt-4.yaml';

function copyFixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'content-'));
  cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
function edit(dir: string, rel: string, fn: (s: string) => string) {
  const p = join(dir, rel);
  writeFileSync(p, fn(readFileSync(p, 'utf8')));
}

describe('loadContent', () => {
  test('loads and normalizes the valid fixture', () => {
    const c = loadContent(FIXTURE);
    expect(c.site.asOf).toBe('2026-10-05');
    expect(c.scenes.map(s => s.id)).toEqual(['2023-03-gpt-4']);
    expect(c.scenes[0].order).toBe(0);
    expect(c.scenes[0].aliases).toEqual([]);
    expect(c.arcs[0].to).toBe('2023');              // YAML 숫자 2023 → 문자열
    expect(c.ledger[0].models.map(m => m.name)).toEqual(['ChatGPT', 'GPT-4']);  // 날짜순
    expect(c.years['2023'].ko.title).toBe('경쟁이 시작된 해');
  });

  test('names the file and field of a missing value', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace('title: GPT-4, ', ''));
    expect(() => loadContent(dir)).toThrowError(`${SCENE}: ko.title`);
  });

  test('collects file-name and duplicate-id problems together', () => {
    const dir = copyFixture();
    cpSync(join(dir, SCENE), join(dir, 'scenes/2023-03-14-gpt-4-copy.yaml'));
    let msg = '';
    try { loadContent(dir); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('Content errors:');
    expect(msg).toContain('scenes/2023-03-14-gpt-4-copy.yaml: file name must be 2023-03-14-gpt-4.yaml');
    expect(msg).toContain('duplicate id 2023-03-gpt-4');
  });

  test('rejects dates after asOf and added before firstEdition', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace('2023-03-31', '2027-01').replace('added: 2026-10-05', 'added: 2026-10-01'));
    expect(() => loadContent(dir)).toThrowError(/item date 2027-01 is after asOf 2026-10-05[\s\S]*added 2026-10-01 is before firstEdition/);
  });

  test('requires a year summary for years after the start year', () => {
    const dir = copyFixture();
    edit(dir, 'years.yaml', () => '{}\n');
    expect(() => loadContent(dir)).toThrowError(/years.yaml: missing summary for 2023/);
  });

  test('rejects impossible dates and bad item counts', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace('2023-03-15', '2023-02-30').replace(/  - \{ date: 2023-03-31.*\n/, ''));
    let msg = '';
    try { loadContent(dir); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain(`${SCENE}: items.0.date: Invalid day in "2023-02-30"`);
    expect(msg).toMatch(new RegExp(`${SCENE}: items: `));
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run tests/unit/content.test.ts`
Expected: FAIL — `Failed to load url ../../src/lib/content.ts`

- [ ] **Step 4: 스키마 구현**

`src/lib/schema.ts`:
```ts
import { z } from 'astro/zod';
import { normalizeDate } from './dates.ts';

const isoDate = z.unknown().transform((v, ctx) => {
  try { return normalizeDate(v); }
  catch (e) { ctx.addIssue({ code: 'custom', message: (e as Error).message }); return z.NEVER; }
});
const dayDate = isoDate.refine(s => /^\d{4}-\d{2}-\d{2}$/.test(s), 'Expected YYYY-MM-DD');
const text = z.string().min(1);

const sceneText = z.object({ kicker: text, title: text, lede: text, glyph: text.optional() });

export const sceneSchema = z.object({
  id: z.string().regex(/^\d{4}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected YYYY-MM-slug'),
  date: dayDate,
  span: z.object({ from: isoDate, to: isoDate.optional() }),
  order: z.number().int().default(0),
  added: dayDate,
  updated: dayDate.optional(),
  aliases: z.array(z.string()).default([]),
  print: z.object({
    pattern: z.enum(['h', 'd', 'w', 'c']),
    angle: z.number().optional(),
    motif: z.enum(['rays', 'disc', 'grid', 'fall', 'rise', 'none']),
    glyph: text,
  }),
  sources: z.array(z.object({ url: z.string().url(), title: text, publisher: z.string().optional() })).default([]),
  corrections: z.array(z.object({ date: dayDate, ko: text, en: text.optional() })).default([]),
  items: z.array(z.object({ date: isoDate, ko: text, en: text.optional() })).min(3).max(4),
  ko: sceneText,
  en: sceneText.optional(),
});

const siteText = z.object({
  name: text,
  heroGlyph: z.object({ wide: text, tall: text }),
  lede: text,
  description: text,
  ogDescription: text,
  ledgerNote: text,
  sourcesNote: text,
});
export const siteSchema = z.object({ start: dayDate, asOf: dayDate, firstEdition: dayDate, ko: siteText, en: siteText.optional() });

const titled = z.object({ title: text, body: text });
export const yearsSchema = z.record(z.string().regex(/^\d{4}$/), z.object({ ko: titled, en: titled.optional() }));
export const arcsSchema = z.array(z.object({ from: isoDate, to: isoDate.optional(), ko: titled, en: titled.optional() }));
export const ledgerSchema = z.array(z.object({
  lab: z.object({ ko: text, en: text.optional() }),
  models: z.array(z.object({ name: text, date: isoDate })).min(1),
}));
export const sourcesSchema = z.array(z.object({ url: z.string().url(), title: text }));

export type Scene = z.output<typeof sceneSchema>;
export type Site = z.output<typeof siteSchema>;
export type Years = z.output<typeof yearsSchema>;
export type Arc = z.output<typeof arcsSchema>[number];
export type Lab = z.output<typeof ledgerSchema>[number];
export type Source = z.output<typeof sourcesSchema>[number];
```

- [ ] **Step 5: 로더 구현**

`src/lib/content.ts`:
```ts
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { z } from 'astro/zod';
import { toUTC } from './dates.ts';
import {
  sceneSchema, siteSchema, yearsSchema, arcsSchema, ledgerSchema, sourcesSchema,
  type Scene, type Site, type Years, type Arc, type Lab, type Source,
} from './schema.ts';

export interface Content { site: Site; scenes: Scene[]; years: Years; arcs: Arc[]; ledger: Lab[]; sources: Source[] }

export function loadContent(dir: string = join(process.cwd(), 'content')): Content {
  const errors: string[] = [];
  const read = (rel: string): unknown => {
    try { return parse(readFileSync(join(dir, rel), 'utf8')); }
    catch (e) { errors.push(`${rel}: ${(e as Error).message}`); return undefined; }
  };
  function check<S extends z.ZodType>(schema: S, data: unknown, where: string): z.output<S> | undefined {
    const r = schema.safeParse(data);
    if (r.success) return r.data;
    for (const i of r.error.issues) errors.push(`${where}: ${i.path.join('.') || '(root)'}: ${i.message}`);
    return undefined;
  }

  const site = check(siteSchema, read('site.yaml'), 'site.yaml');
  const years = check(yearsSchema, read('years.yaml'), 'years.yaml');
  const arcs = check(arcsSchema, read('arcs.yaml'), 'arcs.yaml');
  const ledger = check(ledgerSchema, read('ledger.yaml'), 'ledger.yaml');
  const sources = check(sourcesSchema, read('sources.yaml'), 'sources.yaml');

  const scenes: Scene[] = [];
  const seen = new Map<string, string>();
  for (const f of readdirSync(join(dir, 'scenes')).filter(n => n.endsWith('.yaml')).sort()) {
    const where = `scenes/${f}`;
    const s = check(sceneSchema, read(where), where);
    if (!s) continue;
    const expected = `${s.date}-${s.id.slice(8)}.yaml`;
    if (f !== expected) errors.push(`${where}: file name must be ${expected}`);
    for (const key of [s.id, ...s.aliases]) {
      if (seen.has(key)) errors.push(`${where}: duplicate id ${key} (also in ${seen.get(key)})`);
      else seen.set(key, where);
    }
    if (site) {
      const limit = toUTC(site.asOf);
      if (toUTC(s.date) > limit) errors.push(`${where}: date ${s.date} is after asOf ${site.asOf}`);
      s.items.forEach((it, i) => {
        if (toUTC(it.date) > limit) errors.push(`${where}: items.${i}: item date ${it.date} is after asOf ${site.asOf}`);
      });
      if (s.added > site.asOf) errors.push(`${where}: added ${s.added} is after asOf ${site.asOf}`);
      if (s.added < site.firstEdition) errors.push(`${where}: added ${s.added} is before firstEdition ${site.firstEdition}`);
    }
    scenes.push(s);
  }

  if (site && years) {
    const startYear = site.start.slice(0, 4);
    for (const y of new Set(scenes.map(s => s.date.slice(0, 4)))) {
      if (y > startYear && !years[y]) errors.push(`years.yaml: missing summary for ${y}`);
    }
  }

  if (errors.length || !site || !years || !arcs || !ledger || !sources) {
    throw new Error(`Content errors:\n- ${errors.join('\n- ')}`);
  }

  scenes.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.order - b.order));
  for (const lab of ledger) lab.models.sort((a, b) => toUTC(a.date) - toUTC(b.date));
  return { site, scenes, years, arcs, ledger, sources };
}
```

- [ ] **Step 6: 통과 확인**

Run: `npx vitest run tests/unit/content.test.ts`
Expected: PASS (6 tests). 실패하면 오류 메시지 문자열이 테스트의 기대값과 같은지 먼저 확인한다(로더 메시지를 테스트에 맞춘다).

- [ ] **Step 7: Commit**

```bash
git add src/lib/schema.ts src/lib/content.ts tests/fixtures tests/unit/content.test.ts
git commit -m "feat: add content schema and validating loader" -m "$TRAILER"
```

---

### Task 4: 원본 내용 이관

**Files:**
- Create: `scripts/lib/original.ts`, `scripts/migrate-original.ts`
- Create (스크립트 실행 결과): `content/scenes/*.yaml`(28개), `content/years.yaml`, `content/arcs.yaml`, `content/ledger.yaml`, `content/sources.yaml`
- Create (직접 작성): `content/site.yaml`
- Test: `tests/unit/migration-parity.test.ts`

**Interfaces:**
- Consumes: `parseLegacyWhen`, `parseLegacyItemDate`, `formatSpan`, `formatYYMM`, `formatDate` (Task 2), `loadContent` (Task 3)
- Produces:
  - `scripts/lib/original.ts`: `readOriginal(path?: string): Original`, `interface Original { CH: OrigScene[]; YR: Record<string, { t: string; p: string }>; LEDGER: [string, [string, string][]][]; arcs: { span: string; title: string; body: string }[]; sources: { url: string; title: string }[] }`, `interface OrigScene { d: string; when: string; k: string; t: string; l: string; i: [string, string][]; g: string; p: string; a?: number; m: string }`, `SLUGS: string[]`(28개, 원본 순서)
  - 장면 ID는 `${date.slice(0,7)}-${slug}`, 파일명은 `${date}-${slug}.yaml`.

- [ ] **Step 1: 원본 읽기 모듈**

`scripts/lib/original.ts`:
```ts
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

export interface OrigScene { d: string; when: string; k: string; t: string; l: string; i: [string, string][]; g: string; p: string; a?: number; m: string }
export interface Original {
  CH: OrigScene[];
  YR: Record<string, { t: string; p: string }>;
  LEDGER: [string, [string, string][]][];
  arcs: { span: string; title: string; body: string }[];
  sources: { url: string; title: string }[];
}

/** 원본 CH 배열 순서와 같은 장면 슬러그 */
export const SLUGS = [
  'chatgpt', 'bing-bard-llama', 'gpt-4', 'warnings', 'llama-2', 'openai-board', 'sora',
  'claude-3', 'gpt-4o', 'nvidia-top', 'reasoning-nobel', 'computer-use-mcp', 'deepseek',
  'vibe-coding', 'ghibli', 'coding-agents', 'gpt-5', 'gigawatt', 'gyeongju-gpu', 'gemini-3',
  'ai-basic-act', 'saaspocalypse', 'pentagon', 'mythos', 'export-control', 'sandbox-escape',
  'math-gpt-6', 'pace',
];

function literal(html: string, name: string, close: string): unknown {
  const head = `var ${name}=`;
  const from = html.indexOf(head);
  if (from < 0) throw new Error(`${name} not found`);
  const end = html.indexOf(`\n${close};`, from);
  if (end < 0) throw new Error(`${name} end not found`);
  // 사용자가 직접 만든 원본 파일의 데이터 리터럴만 평가한다
  return runInNewContext(`(${html.slice(from + head.length, end + 1 + close.length)})`);
}

const decode = (s: string) => s.replace(/&amp;/g, '&');

export function readOriginal(path = 'reference/original/index.html'): Original {
  const html = readFileSync(path, 'utf8');
  const arcsBlock = html.slice(html.indexOf('<ol class="arcs">'), html.indexOf('</ol>', html.indexOf('<ol class="arcs">')));
  const arcs = [...arcsBlock.matchAll(/<li><span class="span">(.*?)<\/span><h3>(.*?)<\/h3><p>(.*?)<\/p><\/li>/g)]
    .map(m => ({ span: m[1], title: m[2], body: m[3] }));
  const srcBlock = html.slice(html.indexOf('<details class="src">'), html.indexOf('</details>'));
  const sources = [...srcBlock.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)]
    .map(m => ({ url: decode(m[1]), title: decode(m[2]) }));
  return {
    CH: literal(html, 'CH', ']') as OrigScene[],
    YR: literal(html, 'YR', '}') as Original['YR'],
    LEDGER: literal(html, 'LEDGER', ']') as Original['LEDGER'],
    arcs,
    sources,
  };
}
```

- [ ] **Step 2: 실패하는 일치 테스트 작성**

`tests/unit/migration-parity.test.ts`:
```ts
import { describe, test, expect } from 'vitest';
import { readOriginal, SLUGS } from '../../scripts/lib/original.ts';
import { loadContent } from '../../src/lib/content.ts';
import { formatSpan, formatYYMM, formatDate, parseLegacyItemDate } from '../../src/lib/dates.ts';

const O = readOriginal();
const C = loadContent();

describe('migrated content matches the original artifact', () => {
  test('counts', () => {
    expect(O.CH).toHaveLength(28);
    expect(C.scenes).toHaveLength(28);
    expect(C.scenes.reduce((n, s) => n + s.items.length, 0)).toBe(109);
    expect(O.arcs).toHaveLength(3);
    expect(O.sources).toHaveLength(21);
  });

  test('scenes, in order, field by field', () => {
    C.scenes.forEach((s, i) => {
      const o = O.CH[i];
      expect(s.id).toBe(`${o.d.slice(0, 7)}-${SLUGS[i]}`);
      expect(s.date).toBe(o.d);
      expect(formatSpan('ko', s.span)).toBe(o.when);
      expect(s.ko.kicker).toBe(o.k);
      expect(s.ko.title).toBe(o.t);
      expect(s.ko.lede).toBe(o.l);
      expect(s.print.glyph).toBe(o.g);
      expect(s.print.pattern).toBe(o.p);
      expect(s.print.angle).toBe(o.a);
      expect(s.print.motif).toBe(o.m || 'none');
      expect(s.items.map(x => x.ko)).toEqual(o.i.map(x => x[1]));
      expect(s.items.map(x => x.date)).toEqual(o.i.map(x => parseLegacyItemDate(x[0], +o.d.slice(0, 4))));
      expect(s.added).toBe('2026-10-05');
    });
  });

  test('glyphs that look like numbers or contain newlines stay strings', () => {
    const g = Object.fromEntries(C.scenes.map(s => [s.id, s.print.glyph]));
    expect(g['2026-01-ai-basic-act']).toBe('1.22');
    expect(g['2026-02-pentagon']).toBe('2.27');
    expect(g['2025-11-gemini-3']).toBe('CODE\nRED');
  });

  test('years, arcs, ledger, sources', () => {
    for (const [y, v] of Object.entries(O.YR)) {
      expect(C.years[y].ko).toEqual({ title: v.t, body: v.p });
    }
    expect(C.arcs.map(a => ({
      span: formatDate('ko', a.from) + (a.to ? ' – ' + formatDate('ko', a.to) : ''),
      title: a.ko.title, body: a.ko.body,
    }))).toEqual(O.arcs);
    expect(C.ledger.map(l => [l.lab.ko, l.models.map(m => [m.name, formatYYMM(m.date)])])).toEqual(O.LEDGER);
    expect(C.sources).toEqual(O.sources);
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run tests/unit/migration-parity.test.ts`
Expected: FAIL — `site.yaml: ENOENT` 등 (`content/`가 아직 없음)

- [ ] **Step 4: 이관 스크립트**

`scripts/migrate-original.ts`:
```ts
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { stringify } from 'yaml';
import { readOriginal, SLUGS } from './lib/original.ts';
import { parseLegacyWhen, parseLegacyItemDate } from '../src/lib/dates.ts';

const FIRST_EDITION = '2026-10-05';
const O = readOriginal();
if (O.CH.length !== SLUGS.length) throw new Error(`slug count ${SLUGS.length} != scenes ${O.CH.length}`);

const dump = (v: unknown) => stringify(v, { lineWidth: 0 });
const bound = (s: string) => s.trim().replace('.', '-');   // "2022.11" → "2022-11", "2023" → "2023"

rmSync('content/scenes', { recursive: true, force: true });
mkdirSync('content/scenes', { recursive: true });

O.CH.forEach((c, i) => {
  const year = +c.d.slice(0, 4);
  const print: Record<string, unknown> = { pattern: c.p };
  if (c.a !== undefined) print.angle = c.a;
  print.motif = c.m || 'none';
  print.glyph = c.g;
  const scene = {
    id: `${c.d.slice(0, 7)}-${SLUGS[i]}`,
    date: c.d,
    span: parseLegacyWhen(c.when),
    added: FIRST_EDITION,
    print,
    items: c.i.map(([d, t]) => ({ date: parseLegacyItemDate(d, year), ko: t })),
    ko: { kicker: c.k, title: c.t, lede: c.l },
  };
  writeFileSync(`content/scenes/${c.d}-${SLUGS[i]}.yaml`, dump(scene));
});

writeFileSync('content/years.yaml', dump(Object.fromEntries(
  Object.entries(O.YR).map(([y, v]) => [y, { ko: { title: v.t, body: v.p } }]),
)));

writeFileSync('content/arcs.yaml', dump(O.arcs.map(a => {
  const [from, to] = a.span.split(' – ').map(bound);
  return to ? { from, to, ko: { title: a.title, body: a.body } } : { from, ko: { title: a.title, body: a.body } };
})));

writeFileSync('content/ledger.yaml', dump(O.LEDGER.map(([lab, models]) => ({
  lab: { ko: lab },
  models: models.map(([name, yymm]) => ({ name, date: `20${yymm.replace('.', '-')}` })),
}))));

writeFileSync('content/sources.yaml', dump(O.sources));
console.log(`migrated ${O.CH.length} scenes`);
```

- [ ] **Step 5: site.yaml 직접 작성**

원본 6–9행, 179행, 198행, 203행의 문장을 템플릿으로 옮긴 것이다. 변수는 Task 6의 `fill()`이 채운다: `{days}`, `{count}`, `{startLong}`, `{asOfLong}`, `{startDot}`, `{asOfDot}`, `{asOfMonthLong}`.

`content/site.yaml`:
```yaml
start: 2022-11-30
asOf: 2026-10-05
firstEdition: 2026-10-05
ko:
  name: 생성형 AI 목판 연표
  heroGlyph:
    wide: "{days}일"
    tall: "{days}\n일"
  lede: "ChatGPT가 공개된 {startLong}부터 {asOfLong}까지, 생성형 AI가 지나온 장면 {count}개를 판화로 찍었습니다. 내리면 판이 한 장씩 멈춰 서서 자세한 내용을 보여 주고, 더 내리면 다음 판으로 넘어갑니다."
  description: "ChatGPT 공개({startDot})부터 {asOfMonthLong}까지 생성형 AI의 주요 장면 {count}개를 흑백 목판화 스타일로 찍어 스크롤로 넘겨 보는 연표."
  ogDescription: "ChatGPT 공개부터 {asOfMonthLong}까지, 생성형 AI의 장면 {count}개를 목판화로 찍은 스크롤 연표."
  ledgerNote: "연구소별 대표 모델의 공개 시점입니다. 날짜는 연.월 기준이며, Mythos 계열처럼 제한 공개된 모델도 포함했습니다."
  sourcesNote: "{asOfLong}까지의 각 사 발표와 언론 보도를 바탕으로 정리했습니다. 2026년 하반기 일부 사건은 조사와 소송이 진행 중이어서 이후 사실관계가 달라질 수 있습니다."
```

- [ ] **Step 6: 실행하고 통과 확인**

Run: `npm run migrate && ls content/scenes | wc -l && npx vitest run tests/unit/migration-parity.test.ts`
Expected: `migrated 28 scenes`, `28`, PASS (4 tests)

눈으로도 하나 확인: `cat content/scenes/2025-11-18-gemini-3.yaml` — `glyph: |-` 블록 아래 `CODE`, `RED` 두 줄.

- [ ] **Step 7: 전체 단위 테스트**

Run: `npm test`
Expected: 모두 PASS

- [ ] **Step 8: Commit**

```bash
git add scripts content tests/unit/migration-parity.test.ts
git commit -m "feat: migrate original timeline content to YAML" -m "$TRAILER"
```

---

### Task 5: 판화 엔진 모듈

**Files:**
- Create: `src/engine/random.ts`, `src/engine/compose.ts`, `src/engine/glyph.ts`, `src/engine/motif.ts`, `src/engine/engrave.ts`, `src/engine/mount.ts`
- Test: `tests/unit/engrave.test.ts`

**Interfaces:**
- Produces:
  - `random.ts`: `clamp(x: number): number`, `ease(t: number): number`, `mulberry(a: number): () => number`, `hsh(n: number): number`, `nz(x: number): number`
  - `compose.ts`: `type Sampler = (x: number, y: number) => number`, `compose(w: number, h: number, fn: (g: CanvasRenderingContext2D) => void): Sampler`
  - `glyph.ts`: `interface Rect { x: number; y: number; w: number; h: number }`, `interface Fit { F: number; lines: { t: string; x: number; y: number }[]; box: Rect }`, `fitGlyph(g, text: string, R: Rect, frac: number, font: string): Fit`, `drawGlyph(g, fit: Fit, font: string): void`
  - `motif.ts`: `vignette(g, w, h, a)`, `border(g, w, h, s)`, `motif(g, kind: string, box: Rect, R: Rect, w, h, rng: () => number)`
  - `engrave.ts`: `BK = 64`, `interface PathLike { moveTo(x: number, y: number): void; lineTo(x: number, y: number): void; closePath(): void }`, `interface EngraveOptions { w: number; h: number; s: number; src: Sampler; mode: 'lines' | 'rings'; ang?: number; wave?: { f: number; g: number; ph: number } | null; cx?: number; cy?: number; maxR?: number; seed: number; sweep?: number }`, `engrave(o: EngraveOptions, makePath?: () => PathLike): PathLike[]`
  - `mount.ts`: `interface Print { ctx: CanvasRenderingContext2D; k: number; w: number; h: number; P: Path2D[]; color: string; key: number; fit?: Fit }`, `mount(cv: HTMLCanvasElement, w, h, P, color: string, budget?: number): Print`, `buckets(pr: Print, tin: number, tout: number): void`, `paint(pr: Print, tin: number, tout: number): void`

원칙: 알고리즘은 원본을 **글자 그대로** 옮긴다. 아래 "verbatim" 지시는 원본 줄을 복사하고 표시된 부분만 바꾸라는 뜻이다. `var`를 `let`/`const`로 바꾸거나 식을 정리하지 않는다(재현성 보장).

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/engrave.test.ts`:
```ts
import { describe, test, expect } from 'vitest';
import { engrave, BK, type PathLike } from '../../src/engine/engrave.ts';
import { mulberry, clamp, ease } from '../../src/engine/random.ts';

function recorder() {
  const made: { m: number; l: number; c: number }[] = [];
  const make = (): PathLike => {
    const ops = { m: 0, l: 0, c: 0 };
    made.push(ops);
    return { moveTo() { ops.m++; }, lineTo() { ops.l++; }, closePath() { ops.c++; } };
  };
  return { made, make, strokes: () => made.reduce((n, o) => n + o.c, 0) };
}
const base = { w: 200, h: 120, s: 5, mode: 'lines' as const, ang: 0, maxR: 0.9, seed: 3, sweep: 1 };

describe('engrave', () => {
  test('returns BK buckets', () => {
    const r = recorder();
    expect(engrave({ ...base, src: () => 1 }, r.make)).toHaveLength(BK);
  });
  test('white sketch carves nothing, dark sketch carves strokes', () => {
    const white = recorder(); engrave({ ...base, src: () => 0 }, white.make);
    const dark = recorder(); engrave({ ...base, src: () => 1 }, dark.make);
    expect(white.strokes()).toBe(0);
    expect(dark.strokes()).toBeGreaterThan(50);
  });
  test('same seed → same cut, different seed → different cut', () => {
    const a = recorder(); engrave({ ...base, src: (x) => (x > 100 ? 0.7 : 0.3) }, a.make);
    const b = recorder(); engrave({ ...base, src: (x) => (x > 100 ? 0.7 : 0.3) }, b.make);
    const c = recorder(); engrave({ ...base, seed: 4, src: (x) => (x > 100 ? 0.7 : 0.3) }, c.make);
    expect(a.made).toEqual(b.made);
    expect(a.made).not.toEqual(c.made);
  });
  test('rings and waves modes carve', () => {
    const r = recorder(); engrave({ ...base, mode: 'rings', cx: 100, cy: 60, src: () => 1 }, r.make);
    const w = recorder(); engrave({ ...base, wave: { f: 0.02, g: 0.005, ph: 1 }, src: () => 1 }, w.make);
    expect(r.strokes()).toBeGreaterThan(20);
    expect(w.strokes()).toBeGreaterThan(20);
  });
});

describe('random', () => {
  test('mulberry is deterministic', () => {
    const a = mulberry(7), b = mulberry(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  test('clamp and ease', () => {
    expect(clamp(-1)).toBe(0); expect(clamp(2)).toBe(1);
    expect(ease(0)).toBe(0); expect(ease(1)).toBe(1); expect(ease(0.5)).toBe(0.5);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/unit/engrave.test.ts`
Expected: FAIL — `Failed to load url ../../src/engine/engrave.ts`

- [ ] **Step 3: random.ts**

```ts
/* 원본 294–299행. pad()는 쓰지 않아 뺐다 */
export function clamp(x: number): number { return x < 0 ? 0 : x > 1 ? 1 : x; }
export function ease(t: number): number { t = clamp(t); return t * t * (3 - 2 * t); }
export function mulberry(a: number): () => number { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function hsh(n: number): number { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
export function nz(x: number): number { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hsh(i) * (1 - u) + hsh(i + 1) * u; }
```

- [ ] **Step 4: compose.ts**

```ts
export type Sampler = (x: number, y: number) => number;

/* 밑그림을 그려 농도 샘플러로 바꾼다. 본문은 원본 338–352행 verbatim */
export function compose(w: number, h: number, fn: (g: CanvasRenderingContext2D) => void): Sampler {
  // ← 원본 338–352행을 그대로 붙여 넣는다 (var ss=... 부터 return function(x,y){...}; 까지)
}
```
붙여 넣은 뒤 `getContext('2d',{willReadFrequently:true})`의 반환값에 `!`가 필요하면 `var g=c.getContext('2d',{willReadFrequently:true})!;`로만 바꾼다.

- [ ] **Step 5: glyph.ts**

```ts
export interface Rect { x: number; y: number; w: number; h: number }
export interface Fit { F: number; lines: { t: string; x: number; y: number }[]; box: Rect }

/* 원본 354–361행. 바뀐 점: 전역 FONT 대신 font 인자 */
export function fitGlyph(g: CanvasRenderingContext2D, text: string, R: Rect, frac: number, font: string): Fit {
  var lines=text.split('\n');g.font='400 100px '+font;
  var M=lines.map(function(t){var m=g.measureText(t);var L=m.actualBoundingBoxLeft||0;var Rt=m.actualBoundingBoxRight!=null?m.actualBoundingBoxRight:m.width;var A=m.actualBoundingBoxAscent!=null?m.actualBoundingBoxAscent:76;var D=m.actualBoundingBoxDescent!=null?m.actualBoundingBoxDescent:4;return {t:t,L:L,W:L+Rt,A:A,D:D};});
  var gap=9,tot=0,mw=0;M.forEach(function(m,i){tot+=m.A+m.D+(i?gap:0);mw=Math.max(mw,m.W);});
  var k=Math.min(R.w*frac/mw,R.h*frac/tot),bw=mw*k,bh=tot*k,y=R.y+(R.h-bh)/2,out:Fit['lines']=[];
  M.forEach(function(m,i){if(i)y+=gap*k;var base=y+m.A*k;out.push({t:m.t,x:R.x+(R.w-m.W*k)/2+m.L*k,y:base});y=base+m.D*k;});
  return {F:100*k,lines:out,box:{x:R.x+(R.w-bw)/2,y:R.y+(R.h-bh)/2,w:bw,h:bh}};
}

/* 원본 362행. 바뀐 점: font 인자 */
export function drawGlyph(g: CanvasRenderingContext2D, fit: Fit, font: string): void {
  g.font='400 '+fit.F+'px '+font;g.textAlign='left';g.textBaseline='alphabetic';fit.lines.forEach(function(L){g.fillText(L.t,L.x,L.y);});
}
```

- [ ] **Step 6: motif.ts**

원본 363–377행(`vignette`, `border`, `motif` 세 함수와 `border` 안의 주석)을 verbatim 복사하고, 각 `function` 앞에 `export `만 붙인다. 맨 위에 다음 한 줄을 둔다:
```ts
import type { Rect } from './glyph.ts';
```
그리고 시그니처만 다음처럼 타입을 단다(본문은 그대로):
```ts
export function vignette(g: CanvasRenderingContext2D, w: number, h: number, a: number) { /* 원본 363행 본문 */ }
export function border(g: CanvasRenderingContext2D, w: number, h: number, s: number) { /* 원본 365–368행 */ }
export function motif(g: CanvasRenderingContext2D, kind: string, box: Rect, R: Rect, w: number, h: number, rng: () => number) { /* 원본 371–376행 */ }
```
`kind`가 `'none'`이면 원본의 if 사슬 어디에도 걸리지 않아 아무것도 그리지 않는다(원본의 `''`와 같은 동작).

- [ ] **Step 7: engrave.ts**

```ts
import { mulberry, nz } from './random.ts';
import type { Sampler } from './compose.ts';

export const BK = 64;
export interface PathLike { moveTo(x: number, y: number): void; lineTo(x: number, y: number): void; closePath(): void }
export interface EngraveOptions {
  w: number; h: number; s: number; src: Sampler; mode: 'lines' | 'rings';
  ang?: number; wave?: { f: number; g: number; ph: number } | null;
  cx?: number; cy?: number; maxR?: number; seed: number; sweep?: number;
}

/* 원본 380–458행. 바뀐 점: Path2D 생성을 makePath()로 주입(테스트용) */
export function engrave(o: EngraveOptions, makePath: () => PathLike = () => new Path2D()): PathLike[] {
  // ← 원본 381–457행을 그대로 붙여 넣는다.
  //   단 382행의 `P.push(new Path2D())`만 `P.push(makePath())`로 바꾼다.
}
```
붙여 넣은 본문의 `var P=[];`는 `var P:PathLike[]=[];`로만 바꾼다.

- [ ] **Step 8: mount.ts**

```ts
import { BK } from './engrave.ts';
import type { Fit } from './glyph.ts';

export interface Print { ctx: CanvasRenderingContext2D; k: number; w: number; h: number; P: Path2D[]; color: string; key: number; fit?: Fit }

/* 원본 459–478행 verbatim. 바뀐 점: export와 타입 */
export function mount(cv: HTMLCanvasElement, w: number, h: number, P: Path2D[], color: string, budget?: number): Print {
  var k=Math.min(window.devicePixelRatio||1,2,Math.sqrt((budget||4.2e6)/(w*h)));
  cv.width=Math.round(w*k);cv.height=Math.round(h*k);cv.style.width=w+'px';cv.style.height=h+'px';
  return {ctx:cv.getContext('2d')!,k:k,w:w,h:h,P:P,color:color,key:-1};
}
export function buckets(pr: Print, tin: number, tout: number): void {
  var g=pr.ctx,a=tout*BK,b=tin*BK;if(b<=a)return;
  g.fillStyle=pr.color;
  for(var i=Math.floor(a);i<b&&i<BK;i++){
    var al=1;if(i<a)al=1-(a-i);if(i+1>b)al=Math.min(al,b-i);if(al<=0.01)continue;
    g.globalAlpha=al;g.fill(pr.P[i]);
  }
  g.globalAlpha=1;
}
export function paint(pr: Print, tin: number, tout: number): void {
  var key=(Math.round(tin*512)<<10)|Math.round(tout*512);
  if(key===pr.key)return;pr.key=key;
  pr.ctx.setTransform(pr.k,0,0,pr.k,0,0);pr.ctx.clearRect(0,0,pr.w,pr.h);
  buckets(pr,tin,tout);
}
```
(원본 `mount`·`buckets`·`paint`와 한 글자씩 대조한다.)

- [ ] **Step 9: 통과 확인**

Run: `npx vitest run tests/unit/engrave.test.ts && npm run check`
Expected: PASS (6 tests), `astro check` 오류 0 (경고는 허용)

- [ ] **Step 10: Commit**

```bash
git add src/engine tests/unit/engrave.test.ts
git commit -m "feat: extract woodcut engine into modules" -m "$TRAILER"
```

---

### Task 6: 뷰 모델과 UI 문구

**Files:**
- Create: `src/i18n/ko.ts`, `src/i18n/index.ts`, `src/lib/view.ts`
- Test: `tests/unit/view.test.ts`

**Interfaces:**
- Consumes: `Content` / `loadContent` (Task 3), dates 함수들 (Task 2)
- Produces (`src/lib/view.ts`):
  - `fill(tpl: string, vars: Record<string, string>): string` — 모르는 `{key}`는 throw
  - `interface ItemView { date: string; label: string; text: string }`
  - `interface SceneView { id: string; index: number; no: string; when: string; kicker: string; title: string; lede: string; items: ItemView[]; glyph: string; pattern: string; angle?: number; motif: string; seed: number; bar: string; p: number; year: string; aria: string }`
  - `interface YearView { year: string; title: string; body: string; countLine: string; bar: string; p: number }`
  - `type Block = { kind: 'year'; year: YearView } | { kind: 'scene'; scene: SceneView }`
  - `interface PageView { lang: Locale; title: string; description: string; ogTitle: string; ogDescription: string; barTitle: string; barStart: string; heroName: string; heroRange: string; heroSr: string; heroWide: string; heroTall: string; heroLines: string[]; lede: string; cue: string; blocks: Block[]; scenes: SceneView[]; rail: { nav: string; labels: { text: string; top: string }[]; ticks: { i: number; top: string; aria: string }[] }; outro: { bar: string; eyebrow: string; title: string; arcs: { span: string; title: string; body: string }[]; ledgerTitle: string; ledgerNote: string; ledger: { lab: string; models: { name: string; date: string }[] }[]; sourcesTitle: string; sourcesNote: string; sources: { url: string; title: string }[]; end: [string, string] } }`
  - `buildView(c: Content, locale: Locale): PageView`

- [ ] **Step 1: 실패하는 테스트 작성**

기대 문자열은 원본 HTML·JS에서 그대로 가져온 것이다(원본 6–9, 166, 175, 179, 189–190, 229, 308, 316–319, 646–649행).

`tests/unit/view.test.ts`:
```ts
import { describe, test, expect } from 'vitest';
import { loadContent } from '../../src/lib/content.ts';
import { buildView, fill } from '../../src/lib/view.ts';

const v = buildView(loadContent(), 'ko');
const scene = (id: string) => v.scenes.find(s => s.id === id)!;

describe('fill', () => {
  test('replaces known keys and rejects unknown ones', () => {
    expect(fill('{a}·{b}', { a: '1', b: '2' })).toBe('1·2');
    expect(() => fill('{nope}', {})).toThrow(/nope/);
  });
});

describe('buildView(ko) reproduces the original strings', () => {
  test('head and hero', () => {
    expect(v.title).toBe('생성형 AI 1,405일');
    expect(v.description).toBe('ChatGPT 공개(2022.11.30)부터 2026년 10월까지 생성형 AI의 주요 장면 28개를 흑백 목판화 스타일로 찍어 스크롤로 넘겨 보는 연표.');
    expect(v.ogTitle).toBe('생성형 AI 1,405일');
    expect(v.ogDescription).toBe('ChatGPT 공개부터 2026년 10월까지, 생성형 AI의 장면 28개를 목판화로 찍은 스크롤 연표.');
    expect(v.barTitle).toBe('생성형 AI 1,405일');
    expect(v.barStart).toBe('2022.11.30');
    expect(v.heroName).toBe('생성형 AI 목판 연표');
    expect(v.heroRange).toBe('2022.11.30 → 2026.10.05');
    expect(v.heroSr).toBe('생성형 AI ');
    expect(v.heroLines).toEqual(['1,405', '일']);
    expect(v.heroWide).toBe('1,405일');
    expect(v.heroTall).toBe('1,405\n일');
    expect(v.lede).toBe('ChatGPT가 공개된 2022년 11월 30일부터 2026년 10월 5일까지, 생성형 AI가 지나온 장면 28개를 판화로 찍었습니다. 내리면 판이 한 장씩 멈춰 서서 자세한 내용을 보여 주고, 더 내리면 다음 판으로 넘어갑니다.');
    expect(v.cue).toBe('아래로');
  });

  test('blocks: year plates sit before their first scene, none for 2022', () => {
    const order = v.blocks.map(b => (b.kind === 'year' ? `Y${b.year.year}` : b.scene.index));
    expect(order.slice(0, 3)).toEqual([0, 'Y2023', 1]);
    expect(order.filter(x => typeof x === 'string')).toEqual(['Y2023', 'Y2024', 'Y2025', 'Y2026']);
    const y2023 = v.blocks.find(b => b.kind === 'year' && b.year.year === '2023') as { kind: 'year'; year: { countLine: string; bar: string } };
    expect(y2023.year.countLine).toBe('장면 5개 · 제2판–제6판');
    expect(y2023.year.bar).toBe('2023년  ·  장면 5개');
  });

  test('scenes', () => {
    const d = scene('2025-01-deepseek');
    expect(d.no).toBe('제13판');
    expect(d.when).toBe('2025.01');
    expect(d.bar).toBe('2025.01  ·  제13판 / 28');
    expect(d.aria).toBe('제13판 2025.01 딥시크 쇼크');
    expect(d.seed).toBe(12);
    expect(d.items[0]).toEqual({ date: '2025-01-20', label: '01.20', text: '딥시크, 추론 모델 R1을 MIT 라이선스로 공개.' });
    expect(scene('2022-11-chatgpt').items.map(i => i.label)).toEqual(['12.05', '12.21', '2023.01', '2023.01.23']);
    expect(scene('2025-11-gemini-3').glyph).toBe('CODE\nRED');
    expect(scene('2024-11-computer-use-mcp').angle).toBe(-20);
    expect(scene('2022-11-chatgpt').angle).toBeUndefined();
  });

  test('rail', () => {
    expect(v.rail.nav).toBe('연표 바로가기');
    expect(v.rail.labels.map(l => l.text)).toEqual(['22.11', '2023', '2024', '2025', '2026', '26.10']);
    expect(v.rail.labels[0].top).toBe('0');
    expect(v.rail.labels[5].top).toBe('100%');
    expect(v.rail.ticks).toHaveLength(28);
    expect(v.rail.ticks[0].top).toBe('0.00%');
  });

  test('outro', () => {
    expect(v.outro.bar).toBe('2026.10.05  ·  오늘');
    expect(v.outro.eyebrow).toBe('2026.10.05 · 오늘');
    expect(v.outro.title).toBe('1,405일 동안 바뀐 것');
    expect(v.outro.arcs[0].span).toBe('2022.11 – 2023');
    expect(v.outro.ledgerTitle).toBe('주요 모델 판본');
    expect(v.outro.ledger[0].models[0]).toEqual({ name: 'ChatGPT (GPT-3.5)', date: '22.11' });
    expect(v.outro.sourcesTitle).toBe('출처와 기준');
    expect(v.outro.sourcesNote.startsWith('2026년 10월 5일까지의 각 사 발표와')).toBe(true);
    expect(v.outro.end).toEqual(['판 28장 · 2022.11.30 – 2026.10.05', '생성형 AI 1,405일']);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/unit/view.test.ts`
Expected: FAIL — `Failed to load url ../../src/lib/view.ts`

- [ ] **Step 3: UI 문구**

`src/i18n/ko.ts`:
```ts
/* 고정된 화면 문구. 편집자가 고치는 문장은 content/site.yaml에 둔다 */
export const ko = {
  title: (days: string) => `생성형 AI ${days}일`,
  heroSr: '생성형 AI ',
  cue: '아래로',
  plateNo: (n: number) => `제${n}판`,
  yearCount: (count: number, first: number, last: number) => `장면 ${count}개 · 제${first}판–제${last}판`,
  barScene: (when: string, n: number, total: number) => `${when}  ·  제${n}판 / ${total}`,
  barYear: (y: string, count: number) => `${y}년  ·  장면 ${count}개`,
  barEnd: (asOf: string) => `${asOf}  ·  오늘`,
  railNav: '연표 바로가기',
  railLabel: (n: number, when: string, title: string) => `제${n}판 ${when} ${title}`,
  outroEyebrow: (asOf: string) => `${asOf} · 오늘`,
  outroTitle: (days: string) => `${days}일 동안 바뀐 것`,
  ledgerTitle: '주요 모델 판본',
  sourcesTitle: '출처와 기준',
  endCount: (count: number, start: string, asOf: string) => `판 ${count}장 · ${start} – ${asOf}`,
};
export type UI = typeof ko;
```

`src/i18n/index.ts`:
```ts
import type { Locale } from '../lib/dates.ts';
import { ko, type UI } from './ko.ts';

export const ui: Partial<Record<Locale, UI>> = { ko };
export function uiFor(locale: Locale): UI {
  const t = ui[locale];
  if (!t) throw new Error(`No UI strings for locale ${locale}`);
  return t;
}
```

- [ ] **Step 4: 뷰 모델 구현**

`src/lib/view.ts`:
```ts
import type { Content } from './content.ts';
import {
  daysBetween, fraction, formatSpan, formatItemDate, formatDot, formatLong, formatMonthLong,
  formatYYMM, formatDate, type Locale,
} from './dates.ts';
import { uiFor } from '../i18n/index.ts';

export interface ItemView { date: string; label: string; text: string }
export interface SceneView {
  id: string; index: number; no: string; when: string; kicker: string; title: string; lede: string;
  items: ItemView[]; glyph: string; pattern: string; angle?: number; motif: string; seed: number;
  bar: string; p: number; year: string; aria: string;
}
export interface YearView { year: string; title: string; body: string; countLine: string; bar: string; p: number }
export type Block = { kind: 'year'; year: YearView } | { kind: 'scene'; scene: SceneView };
export interface PageView {
  lang: Locale; title: string; description: string; ogTitle: string; ogDescription: string;
  barTitle: string; barStart: string; heroName: string; heroRange: string; heroSr: string;
  heroWide: string; heroTall: string; heroLines: string[]; lede: string; cue: string;
  blocks: Block[]; scenes: SceneView[];
  rail: { nav: string; labels: { text: string; top: string }[]; ticks: { i: number; top: string; aria: string }[] };
  outro: {
    bar: string; eyebrow: string; title: string; arcs: { span: string; title: string; body: string }[];
    ledgerTitle: string; ledgerNote: string; ledger: { lab: string; models: { name: string; date: string }[] }[];
    sourcesTitle: string; sourcesNote: string; sources: { url: string; title: string }[]; end: [string, string];
  };
}

export function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => {
    if (!(k in vars)) throw new Error(`Unknown template key {${k}} in "${tpl}"`);
    return vars[k];
  });
}

function need<T>(v: T | undefined, what: string): T {
  if (v === undefined) throw new Error(`Missing ${what}`);
  return v;
}

const pct = (x: number) => (x * 100).toFixed(2) + '%';

export function buildView(c: Content, locale: Locale): PageView {
  const t = uiFor(locale);
  const { site } = c;
  const st = need(site[locale], `site.${locale}`);
  const days = daysBetween(site.start, site.asOf).toLocaleString('en-US');
  const count = c.scenes.length;
  const startDot = formatDot(site.start), asOfDot = formatDot(site.asOf);
  const vars = {
    days, count: String(count), startDot, asOfDot,
    startLong: formatLong(locale, site.start), asOfLong: formatLong(locale, site.asOf),
    asOfMonthLong: formatMonthLong(locale, site.asOf),
  };
  const fr = (d: string) => fraction(d, site.start, site.asOf);

  const scenes: SceneView[] = c.scenes.map((s, i) => {
    const text = need(s[locale], `${s.id}.${locale}`);
    const when = formatSpan(locale, s.span);
    const year = s.date.slice(0, 4);
    return {
      id: s.id, index: i, no: t.plateNo(i + 1), when,
      kicker: text.kicker, title: text.title, lede: text.lede,
      items: s.items.map((it, k) => ({
        date: it.date,
        label: formatItemDate(locale, it.date, +year),
        text: need(it[locale], `${s.id}.items.${k}.${locale}`),
      })),
      glyph: text.glyph ?? s.print.glyph, pattern: s.print.pattern, angle: s.print.angle, motif: s.print.motif,
      seed: i,                                   // 1단계: 원본과 같은 순번 시드 (스펙 6절)
      bar: t.barScene(when, i + 1, count), p: fr(s.date), year,
      aria: t.railLabel(i + 1, when, text.title.replace(/"/g, '')),
    };
  });

  const blocks: Block[] = [];
  const seen = new Set<string>();
  for (const s of scenes) {
    if (!seen.has(s.year)) {
      seen.add(s.year);
      const yt = c.years[s.year]?.[locale];
      if (yt) {
        const list = scenes.filter(x => x.year === s.year);
        blocks.push({ kind: 'year', year: {
          year: s.year, title: yt.title, body: yt.body,
          countLine: t.yearCount(list.length, list[0].index + 1, list[list.length - 1].index + 1),
          bar: t.barYear(s.year, list.length), p: fr(`${s.year}-01-01`),
        } });
      }
    }
    blocks.push({ kind: 'scene', scene: s });
  }

  const startYear = site.start.slice(0, 4);
  const railYears = [...new Set(scenes.map(s => s.year))].filter(y => y > startYear);
  const heroWide = fill(st.heroGlyph.wide, vars), heroTall = fill(st.heroGlyph.tall, vars);
  const title = t.title(days);

  return {
    lang: locale, title,
    description: fill(st.description, vars), ogTitle: title, ogDescription: fill(st.ogDescription, vars),
    barTitle: title, barStart: startDot,
    heroName: st.name, heroRange: `${startDot} → ${asOfDot}`, heroSr: t.heroSr,
    heroWide, heroTall, heroLines: heroTall.split('\n'),
    lede: fill(st.lede, vars), cue: t.cue,
    blocks, scenes,
    rail: {
      nav: t.railNav,
      labels: [
        { text: formatYYMM(site.start), top: '0' },
        ...railYears.map(y => ({ text: y, top: pct(fr(`${y}-01-01`)) })),
        { text: formatYYMM(site.asOf), top: '100%' },
      ],
      ticks: scenes.map(s => ({ i: s.index, top: pct(s.p), aria: s.aria })),
    },
    outro: {
      bar: t.barEnd(asOfDot), eyebrow: t.outroEyebrow(asOfDot), title: t.outroTitle(days),
      arcs: c.arcs.map(a => {
        const at = need(a[locale], `arc.${locale}`);
        return { span: formatDate(locale, a.from) + (a.to ? ' – ' + formatDate(locale, a.to) : ''), title: at.title, body: at.body };
      }),
      ledgerTitle: t.ledgerTitle, ledgerNote: st.ledgerNote,
      ledger: c.ledger.map(l => ({ lab: need(l.lab[locale], `ledger.lab.${locale}`), models: l.models.map(m => ({ name: m.name, date: formatYYMM(m.date) })) })),
      sourcesTitle: t.sourcesTitle, sourcesNote: fill(st.sourcesNote, vars),
      sources: c.sources.map(s => ({ url: s.url, title: s.title })),
      end: [t.endCount(count, startDot, asOfDot), title],
    },
  };
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run tests/unit/view.test.ts && npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/i18n src/lib/view.ts tests/unit/view.test.ts
git commit -m "feat: compute page view model with Korean UI strings" -m "$TRAILER"
```

---

### Task 7: 스타일, 레이아웃, 정적 페이지

**Files:**
- Create: `src/styles/base.css`, `src/styles/tokens.css`, `src/styles/nav.css`, `src/styles/hero.css`, `src/styles/year.css`, `src/styles/scene.css`, `src/styles/outro.css`, `src/styles/motion.css`
- Create: `src/layouts/Page.astro`, `src/components/Bar.astro`, `src/components/Rail.astro`, `src/components/Hero.astro`, `src/components/YearPlate.astro`, `src/components/Scene.astro`, `src/components/Outro.astro`
- Modify: `src/pages/index.astro` (임시 페이지 교체)
- Create: `playwright.config.ts`, `tests/e2e/static.spec.ts`

**Interfaces:**
- Consumes: `buildView`, `PageView`, `SceneView`, `YearView` (Task 6), `loadContent` (Task 3)
- Produces (Task 8의 JS가 읽는 DOM 계약):
  - `#bar[data-start]`, `#barT`, `#rail` 안의 `button[data-i]`, `#hero`, `#heroStage`, `#rays`, `#nums`, `#numtext[data-wide][data-tall]`, `#outro[data-bar]`
  - `section.ch#<scene id>[data-glyph][data-pattern][data-angle?][data-motif][data-seed][data-bar][data-p]` 안의 `.stage`, `canvas.print`, `.plate`, `.cuts li`
  - `section.yr[data-y][data-bar][data-p]` 안의 `canvas`, `.yr-text`

- [ ] **Step 1: 스타일 파일 (원본에서 줄 단위 복사)**

모두 원본 줄을 그대로 복사한다. 내용을 고치지 않는다.

| 파일 | 원본 행 |
| --- | --- |
| `src/styles/base.css` | 11–14 (첫 `<style>`의 내용), 이어서 36–41 |
| `src/styles/tokens.css` | 20–35 (레이아웃 주석 + `:root`) |
| `src/styles/nav.css` | 43–61 (고정 표시줄, 눈금자) |
| `src/styles/hero.css` | 63–81 |
| `src/styles/year.css` | 83–91 |
| `src/styles/scene.css` | 93–129 |
| `src/styles/outro.css` | 131–157 |
| `src/styles/motion.css` | 159–162 |

```bash
f=reference/original/index.html
{ sed -n '11,14p' $f; sed -n '36,41p' $f; } > src/styles/base.css
sed -n '20,35p' $f > src/styles/tokens.css
sed -n '43,61p' $f > src/styles/nav.css
sed -n '63,81p' $f > src/styles/hero.css
sed -n '83,91p' $f > src/styles/year.css
sed -n '93,129p' $f > src/styles/scene.css
sed -n '131,157p' $f > src/styles/outro.css
sed -n '159,162p' $f > src/styles/motion.css
head -1 src/styles/tokens.css   # 기대: /* 레이아웃: 목판 연표. ...
tail -1 src/styles/motion.css   # 기대: }
```

- [ ] **Step 2: 레이아웃**

`src/layouts/Page.astro`:
```astro
---
import '@fontsource/black-han-sans/400.css';
import '@fontsource/hahmlet/400.css';
import '@fontsource/hahmlet/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import '../styles/base.css';
import '../styles/tokens.css';
import '../styles/nav.css';
import '../styles/hero.css';
import '../styles/year.css';
import '../styles/scene.css';
import '../styles/outro.css';
import '../styles/motion.css';
import type { PageView } from '../lib/view.ts';

interface Props { view: PageView }
const { view } = Astro.props;
---
<!doctype html>
<html lang={view.lang}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{view.title}</title>
<meta name="description" content={view.description}>
<meta property="og:title" content={view.ogTitle}>
<meta property="og:description" content={view.ogDescription}>
</head>
<body>
<slot />
</body>
</html>
```

- [ ] **Step 3: 컴포넌트**

인라인 요소 사이에는 공백을 두지 않는다(원본은 공백 없이 이어 붙여 생성했고, 공백이 생기면 `time`과 본문 사이 간격이 달라진다).

`src/components/Bar.astro`:
```astro
---
import type { PageView } from '../lib/view.ts';
const { view } = Astro.props as { view: PageView };
---
<div class="bar" id="bar" aria-hidden="true" data-start={view.barStart}><b>{view.barTitle}</b><span id="barT">{view.barStart}</span><i></i></div>
```

`src/components/Rail.astro`:
```astro
---
import type { PageView } from '../lib/view.ts';
const { view } = Astro.props as { view: PageView };
---
<nav class="rail" id="rail" aria-label={view.rail.nav}><div class="ax"></div>{view.rail.labels.map(l => <span class="yl" style={`top:${l.top}`}>{l.text}</span>)}{view.rail.ticks.map(t => <button type="button" data-i={t.i} style={`top:${t.top}`} aria-label={t.aria}></button>)}</nav>
```

`src/components/Hero.astro`:
```astro
---
import type { PageView } from '../lib/view.ts';
const { view } = Astro.props as { view: PageView };
---
<header class="hero" id="hero">
  <div class="hero-stage" id="heroStage">
    <canvas class="rays" id="rays" aria-hidden="true"></canvas>
    <canvas class="nums" id="nums" aria-hidden="true"></canvas>
    <div class="hero-top">
      <p class="hero-name">{view.heroName}</p>
      <p class="hero-range">{view.heroRange}</p>
    </div>
    <h1 class="numtext" id="numtext" data-wide={view.heroWide} data-tall={view.heroTall}><span class="sr">{view.heroSr}</span>{view.heroLines.map(l => <span>{l}</span>)}</h1>
    <div class="hero-foot">
      <p class="hero-lede">{view.lede}</p>
      <p class="cue">{view.cue}</p>
    </div>
  </div>
</header>
```

`src/components/YearPlate.astro`:
```astro
---
import type { YearView } from '../lib/view.ts';
const { year: y } = Astro.props as { year: YearView };
---
<section class="yr" data-y={y.year} data-bar={y.bar} data-p={String(y.p)} aria-labelledby={`y${y.year}`}><canvas aria-hidden="true"></canvas><div class="yr-text"><p class="yr-eyebrow">{y.year}</p><h2 id={`y${y.year}`}>{y.title}</h2><p>{y.body}</p><p class="count">{y.countLine}</p></div></section>
```

`src/components/Scene.astro`:
```astro
---
import type { SceneView } from '../lib/view.ts';
const { scene: s } = Astro.props as { scene: SceneView };
---
<section class="ch" id={s.id} style={`--n:${s.items.length}`} aria-labelledby={`h-${s.id}`} data-glyph={s.glyph} data-pattern={s.pattern} data-angle={s.angle} data-motif={s.motif} data-seed={s.seed} data-bar={s.bar} data-p={String(s.p)}><div class="stage"><canvas class="print" aria-hidden="true"></canvas><article class="plate"><p class="meta"><span class="no">{s.no}</span><span class="when">{s.when}</span><span class="kick">{s.kicker}</span></p><h2 id={`h-${s.id}`}>{s.title}</h2><p class="lede">{s.lede}</p><ol class="cuts">{s.items.map(it => <li><time datetime={it.date}>{it.label}</time><span>{it.text}</span></li>)}</ol></article></div></section>
```

`src/components/Outro.astro`:
```astro
---
import type { PageView } from '../lib/view.ts';
const { view } = Astro.props as { view: PageView };
const o = view.outro;
---
<section class="outro" id="outro" aria-labelledby="outroH" data-bar={o.bar}>
  <div class="outro-in">
    <p class="eyebrow">{o.eyebrow}</p>
    <h2 id="outroH">{o.title}</h2>
    <ol class="arcs">{o.arcs.map(a => <li><span class="span">{a.span}</span><h3>{a.title}</h3><p>{a.body}</p></li>)}</ol>

    <h2 class="sub">{o.ledgerTitle}</h2>
    <p class="note">{o.ledgerNote}</p>
    <div class="ledger" id="ledger">{o.ledger.map(l => <div class="lab"><h3>{l.lab}</h3><ol>{l.models.map(m => <li>{m.name}<time>{m.date}</time></li>)}</ol></div>)}</div>

    <details class="src">
      <summary>{o.sourcesTitle}</summary>
      <p>{o.sourcesNote}</p>
      <ul>{o.sources.map(s => <li><a href={s.url} target="_blank" rel="noopener">{s.title}</a></li>)}</ul>
    </details>

    <p class="end"><span>{o.end[0]}</span><span>{o.end[1]}</span></p>
  </div>
</section>
```

- [ ] **Step 4: 페이지**

`src/pages/index.astro` (Task 1의 임시 파일을 교체):
```astro
---
import Page from '../layouts/Page.astro';
import Bar from '../components/Bar.astro';
import Rail from '../components/Rail.astro';
import Hero from '../components/Hero.astro';
import YearPlate from '../components/YearPlate.astro';
import Scene from '../components/Scene.astro';
import Outro from '../components/Outro.astro';
import { loadContent } from '../lib/content.ts';
import { buildView } from '../lib/view.ts';

const view = buildView(loadContent(), 'ko');
---
<Page view={view}>
<Bar view={view} />
<Rail view={view} />
<Hero view={view} />
<main id="tl">{view.blocks.map(b => (b.kind === 'year' ? <YearPlate year={b.year} /> : <Scene scene={b.scene} />))}</main>
<Outro view={view} />
</Page>
```

- [ ] **Step 5: Playwright 설정과 JS-off 테스트 작성**

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:4321/ai-timeline-log/', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321/ai-timeline-log/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

`tests/e2e/static.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every piece of text is in the HTML', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle('생성형 AI 1,405일');
    await expect(page.locator('section.ch')).toHaveCount(28);
    await expect(page.locator('section.ch h2')).toHaveCount(28);
    await expect(page.locator('.cuts li')).toHaveCount(109);
    await expect(page.locator('section.yr')).toHaveCount(4);
    await expect(page.locator('.lab')).toHaveCount(6);
    await expect(page.locator('.src li')).toHaveCount(21);
    await expect(page.locator('[id="2025-01-deepseek"] h2')).toHaveText('딥시크 쇼크');
    await expect(page.locator('[id="2022-11-chatgpt"] .cuts time').first()).toHaveText('12.05');
  });

  test('glyph data survives YAML → HTML', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('[id="2025-11-gemini-3"]')).toHaveAttribute('data-glyph', 'CODE\nRED');
    await expect(page.locator('[id="2026-01-ai-basic-act"]')).toHaveAttribute('data-glyph', '1.22');
    await expect(page.locator('[id="2024-11-computer-use-mcp"]')).toHaveAttribute('data-angle', '-20');
    await expect(page.locator('#numtext')).toHaveAttribute('data-tall', '1,405\n일');
  });

  test('no external font service', async ({ page }) => {
    await page.goto('./');
    expect(await page.content()).not.toContain('fonts.googleapis.com');
  });
});
```

- [ ] **Step 6: 실행**

Run: `npx playwright test tests/e2e/static.spec.ts`
Expected: PASS (3 tests)

- [ ] **Step 7: Commit**

```bash
git add src/styles src/layouts src/components src/pages playwright.config.ts tests/e2e/static.spec.ts
git commit -m "feat: render the timeline as static HTML from content" -m "$TRAILER"
```

---

### Task 8: 브라우저 동작 이식

**Files:**
- Create: `src/client/env.ts`, `src/client/types.ts`, `src/client/plates.ts`, `src/client/hero.ts`, `src/client/main.ts`
- Modify: `src/pages/index.astro` (스크립트 추가)
- Test: `tests/e2e/behavior.spec.ts`

**Interfaces:**
- Consumes: 엔진 모듈 (Task 5), DOM 계약 (Task 7)
- Produces: `document.documentElement.dataset.ready === '1'` — 폰트 대기(최대 3.5초)와 재배치가 끝났다는 표시. 테스트가 기다리는 신호.

- [ ] **Step 1: 실패하는 동작 테스트 작성**

`tests/e2e/behavior.spec.ts`:
```ts
import { test, expect, type Page } from '@playwright/test';

const ready = (page: Page) => page.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout: 15_000 });
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    // 미리보기 서버에는 favicon이 없다(원본도 없음). 그 404만 무시한다
    if (m.type() === 'error' && !m.location().url.includes('favicon')) errors.push(`console: ${m.text()}`);
  });
  return errors;
}
async function pinnedPoint(page: Page, id: string) {
  await page.evaluate((id) => {
    const el = document.getElementById(id)!;
    const stage = el.querySelector<HTMLElement>('.stage')!;
    const pinned = document.documentElement.classList.contains('pin') && !el.classList.contains('loose');
    scrollTo(0, el.getBoundingClientRect().top + scrollY + (pinned ? (el.offsetHeight - stage.offsetHeight) * 0.72 : 0));
  }, id);
}

for (const vp of [{ width: 390, height: 780 }, { width: 1440, height: 860 }]) {
  test.describe(`${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    test('no errors while scrolling the whole page; prints get carved', async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto('./');
      await ready(page);
      await pinnedPoint(page, '2025-01-deepseek');
      await page.waitForTimeout(800);
      expect(await page.locator('[id="2025-01-deepseek"] canvas.print').evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
      expect(await page.locator('#nums').evaluate((c: HTMLCanvasElement) => c.width)).toBe(0); // 표지에서 멀어지면 해제
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
          scrollTo(0, y);
          await new Promise(r => setTimeout(r, 25));
        }
      });
      expect(errors).toEqual([]);
    });

    test('pinned plates fit the screen (or fall back to loose)', async ({ page }) => {
      await page.goto('./');
      await ready(page);
      const r = await page.evaluate(() => {
        const out = { clipped: [] as string[], dense: [] as string[], loose: [] as string[] };
        for (const el of document.querySelectorAll<HTMLElement>('.ch')) {
          if (el.classList.contains('dense')) out.dense.push(el.id);
          if (el.classList.contains('loose')) { out.loose.push(el.id); continue; }
          const stage = el.querySelector<HTMLElement>('.stage')!;
          scrollTo(0, el.getBoundingClientRect().top + scrollY + (el.offsetHeight - stage.offsetHeight) * 0.72);
          const b = el.querySelector('.plate')!.getBoundingClientRect();
          if (b.top < -0.5 || b.bottom > innerHeight + 0.5) out.clipped.push(`${el.id} top=${b.top.toFixed(1)} bottom=${b.bottom.toFixed(1)}`);
        }
        return out;
      });
      console.log(`[ko ${vp.width}x${vp.height}] dense: ${r.dense.join(', ') || '-'} | loose: ${r.loose.join(', ') || '-'}`);
      expect(r.clipped).toEqual([]);
    });

    test('no horizontal scroll', async ({ page }) => {
      await page.goto('./');
      await ready(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  });
}

test.describe('reduced motion', () => {
  test('every item is inked from the start', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await ready(page);
    await page.evaluate(() => scrollTo(0, 2000));
    await expect(page.locator('.cuts li.inked')).toHaveCount(109);
  });
});

test.describe('desktop rail', () => {
  test.use({ viewport: { width: 1440, height: 860 } });
  test('clicking a tick jumps to that scene', async ({ page }) => {
    await page.goto('./');
    await ready(page);
    await page.evaluate(() => scrollTo(0, innerHeight * 2));
    await expect(page.locator('#rail')).toHaveClass(/\bon\b/);
    await page.locator('#rail button').nth(12).click();
    await expect.poll(() => page.locator('#barT').textContent(), { timeout: 10_000 }).toContain('2025.01  ·  제13판');
  });
});

test.describe('deep link', () => {
  test.use({ viewport: { width: 390, height: 780 } });
  test('opening /#scene-id lands on that scene after fonts settle', async ({ page }) => {
    await page.goto('./#2025-01-deepseek');
    await ready(page);
    await expect.poll(() => page.locator('#barT').textContent(), { timeout: 5_000 }).toContain('2025.01');
  });
});

test.describe('fonts blocked', () => {
  test('falls back after the timeout without breaking', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route(/\.(woff2?)$/, r => r.abort());
    await page.goto('./');
    await ready(page);
    await expect.poll(() => page.locator('#nums').evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
    await expect(page.locator('section.ch')).toHaveCount(28);
    expect(errors).toEqual([]);
  });
});

test.describe('short landscape', () => {
  test.use({ viewport: { width: 844, height: 390 } });
  test('no pinning, no errors, no horizontal scroll', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('./');
    await ready(page);
    expect(await page.evaluate(() => document.documentElement.classList.contains('pin'))).toBe(false);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/behavior.spec.ts`
Expected: FAIL — `ready` 대기 시간 초과 (아직 스크립트가 없음)

- [ ] **Step 3: env.ts, types.ts**

`src/client/env.ts`:
```ts
export const root = document.documentElement;
export const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const cs = getComputedStyle(root);
export const INK = cs.getPropertyValue('--ink').trim() || '#111110';
export const PAPER = cs.getPropertyValue('--paper').trim() || '#E3E1D9';
/* 원본은 FONT 상수로 --display를 중복 정의했다. 이제 CSS 토큰이 유일한 출처다 */
export const FONT = cs.getPropertyValue('--display').trim() || 'sans-serif';
export const BODY = cs.getPropertyValue('--body').trim() || 'serif';
export const MONO = cs.getPropertyValue('--mono').trim() || 'monospace';
/* 레이아웃 상태 (원본의 W, wide, stickyTop, heroLen, ready) */
export const L = { W: 0, wide: false, stickyTop: 0, heroLen: 1, ready: false };
```

`src/client/types.ts`:
```ts
import type { Print } from '../engine/mount.ts';

export interface SceneRec {
  kind: 'ch'; el: HTMLElement; i: number; stage: HTMLElement; plate: HTMLElement; cv: HTMLCanvasElement;
  lis: HTMLElement[]; n: number; glyph: string; pattern: string; angle: number; motif: string; seed: number;
  bar: string; p: number; print: Print | null; inked: number; sc: number; pin: boolean; sh: number;
}
export interface YearRec {
  kind: 'yr'; el: HTMLElement; y: string; cv: HTMLCanvasElement; text: HTMLElement; bar: string; p: number; print: Print | null;
}
export type Rec = SceneRec | YearRec;
```

- [ ] **Step 4: plates.ts (원본 498–530행)**

`src/client/plates.ts`:
```ts
import { compose } from '../engine/compose.ts';
import { fitGlyph, drawGlyph, type Fit, type Rect } from '../engine/glyph.ts';
import { vignette, border, motif } from '../engine/motif.ts';
import { engrave } from '../engine/engrave.ts';
import { mount } from '../engine/mount.ts';
import { mulberry } from '../engine/random.ts';
import { L, INK, PAPER, FONT } from './env.ts';
import type { SceneRec, YearRec } from './types.ts';

/* 원본 buildCh. 바뀐 점: CH[i] 대신 data-* 값, 시드는 o.seed(1단계에서는 순번) */
export function buildCh(o: SceneRec): void {
  const st = o.stage, w = st.clientWidth, h = st.clientHeight; if (!w || !h) return;
  const pl = o.plate, pt = pl.offsetTop, px = pl.offsetLeft, pw = pl.offsetWidth;
  let R: Rect;
  if (L.wide) { const x0 = px + pw + 28; R = { x: x0, y: 72, w: w - x0 - (L.W >= 960 ? 88 : 24), h: h - 72 - 36 }; }
  else R = { x: 14, y: 50, w: w - 28, h: pt - 50 - 12 };
  if (R.w < 140 || R.h < 96) R = { x: 14, y: 50, w: w - 28, h: Math.max(160, h * 0.42) };
  const s = L.wide ? 6.5 : 5, rng = mulberry(o.seed * 131 + 7);
  let fit!: Fit;
  const smp = compose(w, h, g => {
    g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, w, h);
    vignette(g, w, h, 0.15);
    fit = fitGlyph(g, o.glyph, R, 0.94, FONT);
    motif(g, o.motif, fit.box, R, w, h, rng);
    g.fillStyle = '#000'; drawGlyph(g, fit, FONT);
    border(g, w, h, s);
  });
  const P = engrave({
    w, h, s, src: smp, mode: o.pattern === 'c' ? 'rings' : 'lines', ang: o.pattern === 'd' ? (o.angle || 12) * Math.PI / 180 : 0,
    wave: o.pattern === 'w' ? { f: 6.2832 / (380 + rng() * 260), g: 0.005, ph: rng() * 6.28 } : null,
    cx: fit.box.x + fit.box.w / 2, cy: fit.box.y + fit.box.h / 2, maxR: 0.9, seed: o.seed + 1, sweep: rng() * 6.2832,
  });
  o.print = mount(o.cv, w, h, P as Path2D[], INK);
}

/* 원본 buildYr */
export function buildYr(o: YearRec): void {
  const el = o.el, w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
  const tt = o.text.offsetTop, side = L.wide ? L.W * 0.05 : 14;
  let R: Rect = { x: side, y: 60, w: w - side * 2 - (L.W >= 960 ? 70 : 0), h: tt - 60 - 24 };
  if (R.h < 120) R = { x: side, y: 60, w: w - side * 2, h: Math.max(140, h * 0.45) };
  const s = L.wide ? 7 : 5.5, yy = +o.y;
  const smp = compose(w, h, g => {
    g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, 0, w, h); vignette(g, w, h, 0.12);
    const fit = fitGlyph(g, o.y, R, 0.98, FONT); g.fillStyle = '#000'; drawGlyph(g, fit, FONT); border(g, w, h, s);
  });
  const P = engrave({ w, h, s, src: smp, mode: 'lines', ang: (yy % 2 ? -22 : 22) * Math.PI / 180, maxR: 0.86, seed: yy, sweep: (yy % 2 ? 0.4 : 2.6) });
  o.print = mount(o.cv, w, h, P as Path2D[], PAPER);
}
```
원본과 대조할 점: `rng()` 호출 순서(motif 안 → wave의 f, ph → sweep)가 원본과 같아야 판화가 같다. 위 코드는 원본 순서를 지킨다.

- [ ] **Step 5: hero.ts (원본 532–579행)**

`src/client/hero.ts`:
```ts
import { compose } from '../engine/compose.ts';
import { fitGlyph, drawGlyph, type Fit } from '../engine/glyph.ts';
import { engrave } from '../engine/engrave.ts';
import { mount, paint, buckets, type Print } from '../engine/mount.ts';
import { clamp } from '../engine/random.ts';
import { INK, PAPER, FONT } from './env.ts';

export interface HeroEls { stage: HTMLElement; num: HTMLElement; numCv: HTMLCanvasElement; raysCv: HTMLCanvasElement }
export const hero: { num: Print | null; rays: Print | null; t0: number; op: number; rot: number } = { num: null, rays: null, t0: 0, op: -1, rot: -1 };

/* 원본 buildHero. 바뀐 점: 표지 글자를 data-wide / data-tall에서 읽는다 */
export function buildHero(els: HeroEls): void {
  const st = els.stage, w = st.clientWidth, h = st.clientHeight; if (!w || !h) return;
  const nb = els.num.getBoundingClientRect(), sb = st.getBoundingClientRect();
  const R = { x: Math.max(8, nb.left - sb.left), y: nb.top - sb.top + 6, w: Math.min(w - 16, nb.width), h: nb.height - 12 };
  const txt = (w / h > 1.1) ? (els.num.dataset.wide || '') : (els.num.dataset.tall || ''), s = w >= 900 ? 7 : 5.2;
  let fit!: Fit;
  const smp = compose(w, h, g => { fit = fitGlyph(g, txt, R, 0.98, FONT); g.fillStyle = '#000'; drawGlyph(g, fit, FONT); });
  const P = engrave({ w, h, s, src: smp, mode: 'lines', ang: 0, maxR: 0.86, seed: 99, sweep: 0.2 });
  hero.num = mount(els.numCv, w, h, P as Path2D[], PAPER); hero.num.fit = fit;
  const cx = fit.box.x + fit.box.w / 2, cy = fit.box.y + fit.box.h / 2;
  const D = Math.ceil(2 * Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy))) + 16;
  const sr = w >= 900 ? 8 : 6;
  const smp2 = compose(D, D, g => {
    const c = D / 2, N = 36;
    g.fillStyle = 'rgba(0,0,0,.42)';
    for (let k = 0; k < N; k++) { const a = k / N * 6.2832, da = 6.2832 / N * 0.5; g.beginPath(); g.moveTo(c, c); g.arc(c, c, D, a, a + da); g.closePath(); g.fill(); }
    const r1 = Math.max(fit.box.w, fit.box.h) * 0.6;
    g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = sr * 1.7; g.beginPath(); g.arc(c, c, r1, 0, 7); g.stroke();
    g.lineWidth = sr * 1.1; g.beginPath(); g.arc(c, c, r1 + sr * 4, 0, 7); g.stroke();
    const gr = g.createRadialGradient(c, c, 0, c, c, Math.min(fit.box.w, fit.box.h) * 0.5);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, D, D);
  });
  const P2 = engrave({ w: D, h: D, s: sr, src: smp2, mode: 'rings', cx: D / 2, cy: D / 2, maxR: 0.82, seed: 7, sweep: 0 });
  hero.rays = mount(els.raysCv, D, D, P2 as Path2D[], PAPER, 5e6);
  els.raysCv.style.left = (cx - D / 2) + 'px'; els.raysCv.style.top = (cy - D / 2) + 'px';
  paint(hero.rays, 1, 0);
  hero.t0 = performance.now(); hero.op = -1; hero.rot = -1;
  els.num.classList.add('printed');
}

export function releaseHero(els: HeroEls): void {
  if (hero.num) { els.numCv.width = els.numCv.height = 0; hero.num = null; }
  if (hero.rays) { els.raysCv.width = els.raysCv.height = 0; hero.rays = null; }
}

/* 원본 paintHero */
export function paintHero(tin: number, tout: number): void {
  const pr = hero.num; if (!pr || !pr.fit) return;
  const key = (Math.round(tin * 512) << 10) | Math.round(tout * 512);
  if (key === pr.key) return; pr.key = key;
  const g = pr.ctx; g.setTransform(pr.k, 0, 0, pr.k, 0, 0); g.clearRect(0, 0, pr.w, pr.h);
  const ha = clamp(Math.min(tin * 1.6, 1 - tout));
  if (ha > 0) {
    const fit = pr.fit;
    g.globalAlpha = ha; g.fillStyle = INK; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineWidth = fit.F * 0.11;
    g.font = '400 ' + fit.F + 'px ' + FONT; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    fit.lines.forEach(L => { g.strokeText(L.t, L.x, L.y); g.fillText(L.t, L.x, L.y); });
    g.globalAlpha = 1;
  }
  buckets(pr, tin, tout);
}
```

- [ ] **Step 6: main.ts (원본 481–496, 581–686행)**

`src/client/main.ts`:
```ts
import { clamp, ease } from '../engine/random.ts';
import { paint } from '../engine/mount.ts';
import { root, reduce, L, FONT, BODY, MONO } from './env.ts';
import { buildCh, buildYr } from './plates.ts';
import { hero, buildHero, releaseHero, paintHero, type HeroEls } from './hero.ts';
import type { SceneRec, YearRec, Rec } from './types.ts';

const byId = (id: string) => document.getElementById(id) as HTMLElement;
const rail = byId('rail'), bar = byId('bar'), barT = byId('barT'), heroEl = byId('hero'), outro = byId('outro');
const els: HeroEls = { stage: byId('heroStage'), num: byId('numtext'), numCv: byId('nums') as HTMLCanvasElement, raysCv: byId('rays') as HTMLCanvasElement };
const ticks = [...rail.querySelectorAll<HTMLButtonElement>('button')];

const chs: SceneRec[] = [...document.querySelectorAll<HTMLElement>('.ch')].map((el, i) => {
  const d = el.dataset, lis = [...el.querySelectorAll<HTMLElement>('.cuts li')];
  return {
    kind: 'ch', el, i, stage: el.querySelector('.stage') as HTMLElement, plate: el.querySelector('.plate') as HTMLElement,
    cv: el.querySelector('.print') as HTMLCanvasElement, lis, n: lis.length,
    glyph: d.glyph || '', pattern: d.pattern || 'h', angle: d.angle ? +d.angle : 0, motif: d.motif || 'none',
    seed: d.seed ? +d.seed : i, bar: d.bar || '', p: d.p ? +d.p : 0, print: null, inked: -1, sc: -1, pin: false, sh: 0,
  };
});
const yrs: YearRec[] = [...document.querySelectorAll<HTMLElement>('.yr')].map(el => ({
  kind: 'yr', el, y: el.dataset.y || '', cv: el.querySelector('canvas') as HTMLCanvasElement,
  text: el.querySelector('.yr-text') as HTMLElement, bar: el.dataset.bar || '', p: el.dataset.p ? +el.dataset.p : 0, print: null,
}));

/* ── 배치 (원본 layout) ── */
function layout(): void {
  L.W = innerWidth; L.wide = L.W >= 900;
  const canPin = innerHeight >= 500;
  root.classList.toggle('pin', canPin);
  chs.forEach(o => o.el.classList.remove('dense', 'loose'));
  const st0 = getComputedStyle(chs[0].stage), padT = parseFloat(st0.paddingTop) || 0, padB = parseFloat(st0.paddingBottom) || 0;
  if (canPin) {
    const avail = chs[0].stage.clientHeight;
    chs.forEach(o => { if (o.plate.offsetHeight + padT + padB > avail) o.el.classList.add('dense'); });
    chs.forEach(o => { if (o.el.classList.contains('dense') && o.plate.offsetHeight + padT + padB > avail) { o.el.classList.remove('dense'); o.el.classList.add('loose'); } });
  }
  L.stickyTop = parseFloat(getComputedStyle(chs[0].stage).top) || 0;
  chs.forEach(o => { o.pin = canPin && !o.el.classList.contains('loose'); o.sh = o.stage.offsetHeight; o.inked = -1; });
  L.heroLen = Math.max(1, heroEl.offsetHeight - els.stage.offsetHeight);
}

/* ── 찍을 순서 (원본 want / release / pump) ── */
const queue: Rec[] = [];
let qTimer = 0;
function want(o: Rec): void { if (o.print || !L.ready || queue.indexOf(o) >= 0) return; queue.push(o); if (!qTimer) qTimer = window.setTimeout(pump, 0); }
function release(o: Rec): void {
  const k = queue.indexOf(o); if (k >= 0) queue.splice(k, 1);
  if (o.print) { o.cv.width = o.cv.height = 0; o.print = null; if (o.kind === 'ch') o.sc = -1; }
}
function pump(): void {
  qTimer = 0; if (!queue.length) return;
  const vh = innerHeight; let best = 0, bd = 1e9;
  queue.forEach((o, k) => { const r = o.el.getBoundingClientRect(), d = Math.abs(r.top + Math.min(r.height, vh) / 2 - vh / 2); if (d < bd) { bd = d; best = k; } });
  const o = queue.splice(best, 1)[0];
  if (!o.print) { try { if (o.kind === 'ch') buildCh(o); else buildYr(o); } catch (e) { console.warn(e); } }
  need();
  if (queue.length) qTimer = window.setTimeout(pump, 24);
}

/* ── 스크롤 (원본 tick). 바뀐 점: 표시줄 문구와 진행값을 data-bar / data-p에서 읽는다 ── */
let raf = 0, barOn: boolean | null = null, barKey = '', activeTick = -2;
function need(): void { if (!raf) raf = requestAnimationFrame(tick); }
function tick(): void {
  raf = 0;
  const vh = innerHeight, sy = window.scrollY || window.pageYOffset, now = performance.now();
  let more = false;
  const hp = clamp(sy / L.heroLen);

  const hr = heroEl.getBoundingClientRect();
  if (L.ready) { if (hr.bottom < -vh * 2.5) releaseHero(els); else if (!hero.num) { try { buildHero(els); } catch (e) { console.warn(e); } } }
  if (hero.num) {
    const ld = reduce ? 1 : clamp((now - hero.t0) / 1700); if (ld < 1) more = true;
    paintHero(ease(ld), reduce ? 0 : ease((hp - 0.1) / 0.75));
    const op = (reduce ? 1 : ease((now - hero.t0) / 1300)) * (1 - 0.9 * hp), rot = reduce ? 0 : hp * 16;
    if (Math.abs(op - hero.op) > 0.004) { hero.op = op; els.raysCv.style.opacity = op.toFixed(3); }
    if (Math.abs(rot - hero.rot) > 0.02) { hero.rot = rot; els.raysCv.style.transform = 'rotate(' + rot.toFixed(2) + 'deg)'; }
  }

  let activeY: YearRec | null = null, active: SceneRec | null = null;
  for (const o of yrs) {
    const r = o.el.getBoundingClientRect();
    if (r.top < vh * 1.8 && r.bottom > -vh * 0.8) want(o); else if (r.top > vh * 3.2 || r.bottom < -vh * 2.4) release(o);
    if (o.print) { const raw = (vh - r.top) / (r.height + vh); paint(o.print, reduce ? 1 : ease((raw - 0.03) / 0.33), reduce ? 0 : ease((raw - 0.68) / 0.28)); }
    if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) activeY = o;
  }
  for (const o of chs) {
    const r = o.el.getBoundingClientRect();
    if (r.top < vh * 1.8 && r.bottom > -vh * 0.8) want(o); else if (r.top > vh * 3.2 || r.bottom < -vh * 2.4) release(o);
    let tin = 1, tout = 0, inked = o.n;
    if (o.pin) {
      const top = r.top - L.stickyTop, len = Math.max(1, r.height - o.sh);
      const pinP = clamp(-top / len), enterP = clamp(1 - top / o.sh), leaveP = clamp(-(top + len) / o.sh);
      if (!reduce) {
        tin = top <= 0 ? 1 : ease((enterP - 0.1) / 0.8); tout = ease((leaveP - 0.04) / 0.8);
        inked = 0; for (let k = 0; k < o.n; k++) { if (pinP >= 0.04 + k * (0.64 / Math.max(1, o.n - 1))) inked = k + 1; }
      }
    } else if (!reduce) {
      const raw = (vh - r.top) / (r.height + vh); tin = ease((raw - 0.04) / 0.32); tout = ease((raw - 0.7) / 0.26);
    }
    if (inked !== o.inked) { o.inked = inked; o.lis.forEach((li, k) => li.classList.toggle('inked', k < inked)); }
    if (o.print) {
      paint(o.print, tin, tout);
      const sc = reduce ? 1 : Math.round((1.035 - 0.035 * tin) * 2000) / 2000;
      if (sc !== o.sc) { o.sc = sc; o.cv.style.transform = 'scale(' + sc + ')'; }
    }
    if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) active = o;
  }

  const on = sy > L.heroLen * 0.85;
  if (on !== barOn) { barOn = on; bar.classList.toggle('on', on); rail.classList.toggle('on', on); }
  let label: string, p: number;
  const a = active as SceneRec | null, ay = activeY as YearRec | null;
  if (a) { label = a.bar; p = a.p; }
  else if (ay) { label = ay.bar; p = ay.p; }
  else if (outro.getBoundingClientRect().top < vh * 0.5) { label = outro.dataset.bar || ''; p = 1; }
  else { label = bar.dataset.start || ''; p = 0; }
  if (label !== barKey) { barKey = label; barT.textContent = label; bar.style.setProperty('--p', p.toFixed(4)); }
  const at = a ? a.i : -1;
  if (at !== activeTick) { if (activeTick >= 0 && ticks[activeTick]) ticks[activeTick].classList.remove('on'); if (at >= 0) ticks[at].classList.add('on'); activeTick = at; }

  if (more) need();
}

/* ── 이벤트 (원본 657–676행) ── */
rail.addEventListener('click', e => {
  const b = (e.target as Element).closest('button'); if (!b) return;
  const o = chs[+(b.getAttribute('data-i') || 0)];
  const y = o.el.getBoundingClientRect().top + (window.scrollY || 0) - L.stickyTop + (o.pin ? (o.el.offsetHeight - o.sh) * 0.72 : 0);
  window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
});
addEventListener('scroll', need, { passive: true });
let rsT = 0, lastW = innerWidth, lastH = 0;
addEventListener('resize', () => {
  clearTimeout(rsT);
  rsT = window.setTimeout(() => {
    const sh = els.stage.clientHeight;
    if (innerWidth !== lastW || Math.abs(sh - lastH) > 2) { lastW = innerWidth; lastH = sh; relayout(); } else need();
  }, 220);
});
function relayout(): void { layout(); chs.forEach(release); yrs.forEach(release); releaseHero(els); need(); }

/* ── 시작 (원본 678–686행). 바뀐 점: 폰트 목록은 CSS 토큰과 현재 페이지의 글자에서,
   폰트 대기 뒤 레이아웃이 바뀌어 주소(#id)로 들어온 위치가 어긋나면 다시 맞춘다 ── */
layout(); lastH = els.stage.clientHeight; need();
const initialY = window.scrollY;
const glyphs = chs.map(o => o.glyph).join('') + (els.num.dataset.wide || '') + yrs.map(o => o.y).join('');
const fontJobs: Promise<unknown>[] = [];
try {
  if (document.fonts && document.fonts.load) {
    fontJobs.push(
      document.fonts.load('400 80px ' + FONT, glyphs),
      document.fonts.load('400 15px ' + BODY, '가나다'),
      document.fonts.load('600 15px ' + BODY, '가나다'),
      document.fonts.load('500 12px ' + MONO, '2026'),
    );
  }
} catch (e) { console.warn(e); }
Promise.race([Promise.all(fontJobs).catch(() => {}), new Promise(r => setTimeout(r, 3500))]).then(() => {
  L.ready = true; layout(); lastH = els.stage.clientHeight;
  const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  if (target && Math.abs(window.scrollY - initialY) < 2) target.scrollIntoView();
  need();
  root.dataset.ready = '1';
});
```

- [ ] **Step 7: 페이지에 스크립트 연결**

`src/pages/index.astro`의 `<Outro view={view} />` 다음 줄에 추가:
```astro
<script>import '../client/main.ts';</script>
```

- [ ] **Step 8: 동작 테스트 실행**

Run: `npx playwright test`
Expected: static 3개 + behavior 전부 PASS. 출력에 `[ko 390x780] dense: … | loose: …`와 `[ko 1440x860] …` 두 줄이 보인다. 이 목록을 기록해 둔다(Task 9에서 원본과 비교).

실패 시 순서:
1. `clipped`가 있으면: 원본에서도 같은 장면이 잘리는지 Task 9의 원본 스크린샷으로 확인한다. 원본도 같으면 이 계획의 범위 밖으로 기록하고 사용자에게 보고한다. 원본은 괜찮으면 CSS 복사 누락(특히 `.dense` 규칙, 원본 113–117·126–128행)을 확인한다.
2. `deep link`가 실패하면: `ready` 뒤의 `scrollIntoView` 블록이 실행되는지 확인한다.

- [ ] **Step 9: 단위 테스트와 타입 검사**

Run: `npm test && npm run check`
Expected: PASS, `astro check` 오류 0

- [ ] **Step 10: Commit**

```bash
git add src/client src/pages/index.astro tests/e2e/behavior.spec.ts
git commit -m "feat: port scroll, pinning and engraving behavior to modules" -m "$TRAILER"
```

---

### Task 9: 원본과 나란히 비교

**Files:**
- Create: `scripts/parity-shots.ts`

**Interfaces:**
- Consumes: 미리보기 서버(`npm run preview`, 4321), `reference/original/index.html`
- Produces: `.parity/<viewport>/<장면>-{original,new}.png` (git 제외)

- [ ] **Step 1: 스크린샷 스크립트**

`scripts/parity-shots.ts`:
```ts
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const NEW = 'http://localhost:4321/ai-timeline-log/';
const ORIGINAL = 'file://' + resolve('reference/original/index.html');
const VIEWPORTS = [{ width: 390, height: 780 }, { width: 1440, height: 860 }];
/* [이름, 원본 선택자, 새 선택자] — 장면 3개는 첫 장면과 글이 가장 긴 두 장면 */
const SHOTS: [string, string, string][] = [
  ['hero', '#hero', '#hero'],
  ['year-2023', '.yr[data-y="2023"]', '.yr[data-y="2023"]'],
  ['chatgpt', '#p01', '[id="2022-11-chatgpt"]'],
  ['pentagon', '#p23', '[id="2026-02-pentagon"]'],
  ['mythos', '#p24', '[id="2026-04-mythos"]'],
  ['outro', '#outro', '#outro'],
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const dir = `.parity/${vp.width}x${vp.height}`;
  mkdirSync(dir, { recursive: true });
  for (const [label, url, pick] of [['original', ORIGINAL, 1], ['new', NEW, 2]] as const) {
    const page = await browser.newPage({ viewport: vp });
    await page.goto(url);
    await page.waitForTimeout(4000);                       // 폰트·표지 찍기 연출
    for (const shot of SHOTS) {
      const sel = shot[pick];
      await page.evaluate((sel) => {
        const el = document.querySelector<HTMLElement>(sel)!;
        const stage = el.querySelector<HTMLElement>('.stage');
        const pinned = !!stage && document.documentElement.classList.contains('pin') && !el.classList.contains('loose');
        scrollTo(0, el.getBoundingClientRect().top + scrollY + (pinned ? (el.offsetHeight - stage!.offsetHeight) * 0.72 : 0));
      }, sel);
      await page.waitForTimeout(shot[0] === 'hero' ? 2000 : 1200);
      await page.screenshot({ path: `${dir}/${shot[0]}-${label}.png` });
    }
    await page.close();
  }
}
await browser.close();
console.log('saved to .parity/');
```

- [ ] **Step 2: 실행**

```bash
npm run build && (npm run preview > /dev/null 2>&1 &) && sleep 3
npm run parity
ls .parity/*/ | head -30
```
Expected: 뷰포트마다 12장(6개 × 원본/새 버전)

- [ ] **Step 3: 비교 확인**

각 쌍을 열어 비교한다. 같아야 하는 것: 색, 서체, 설명판 위치·크기, 판화 구성(글자·문양·칼선 방향), 표시줄 문구, 눈금자.
허용되는 차이: 칼선 끊김 위치의 미세한 차이(폰트 래스터라이즈 차이), 다른 해 항목 날짜의 4자리 연도 표기(`2023.01.23`).

원본과 새 버전의 dense/loose 목록도 비교한다. 원본에서는 브라우저 콘솔에서 다음을 실행한다.
`[...document.querySelectorAll('.ch.dense,.ch.loose')].map(e=>e.id+':'+e.className)`
그 결과를 Task 8의 출력과 대조한다(원본 `p13`은 새 버전 13번째 장면).

차이가 있으면 원인을 고치고 Task 8 테스트를 다시 돌린다. 판단하기 어려운 차이는 스크린샷 경로와 함께 사용자에게 보고한다.

- [ ] **Step 4: 미리보기 서버 종료와 Commit**

```bash
pkill -f "astro preview" || true
git add scripts/parity-shots.ts
git commit -m "test: add side-by-side parity screenshots against the original" -m "$TRAILER"
```

- [ ] **Step 5: 1단계 완료 보고**

사용자에게 다음을 보고하고 2단계 계획으로 넘어갈지 묻는다.
- 단위·브라우저 테스트 결과(통과 수)
- dense/loose 목록(원본과 같은지)
- `.parity/` 비교 결과와 허용 범위 밖 차이(있다면 스크린샷 경로)
