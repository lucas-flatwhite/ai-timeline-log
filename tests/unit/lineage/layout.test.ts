import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadFonts, shapeText } from '../../../skills/ai-lineage/scripts/lib/fonts.mjs';
import { validate } from '../../../skills/ai-lineage/scripts/lib/schema.mjs';
import { layout, NAME_SIZE, TEXT_FLOOR, TAG_FLOOR, MARK_FLOOR, CANVAS } from '../../../skills/ai-lineage/scripts/lib/layout.mjs';
import { boxHeight, createPainter, tagRects } from '../../../skills/ai-lineage/scripts/lib/draw.mjs';
import { check } from '../../../skills/ai-lineage/scripts/lib/check.mjs';
import { STRINGS } from '../../../skills/ai-lineage/scripts/lib/strings.mjs';
import { STYLES, TOKENS, blend } from '../../../skills/ai-lineage/scripts/lib/styles.mjs';

const load = (name: string): any =>
  JSON.parse(readFileSync(new URL(`../../fixtures/lineage/${name}.lineage.json`, import.meta.url), 'utf8'));
const alpha = load('alpha');
const worst = load('worst');

const STYLE_IDS = ['woodcut', 'soft', 'proof'] as const;
const ORIENTS = [false, true];
const EPS = 1e-6;

// The ko variant of worst. A Hangul syllable at 28px is about 26px wide and a Latin letter about 16px,
// so a Hangul name with the same character count needs far more room than the English name.
// Each Korean name here is instead about as wide as its English name and takes as many lines.
const KO_NAMES: Record<string, string> = {
  'alpha-router': '알파 희소 라우팅의 문장 처리 적용판',
  'kappa-capacity': '카파 용량 계수 조정 실험 기록 모음',
  'gamma-pool': '감마 전문가 묶음 음성 인식 적용판',
  'delta-stack': '델타 융합 층의 설계',
  'eta-parallel': '에타 병렬 전문가 학습',
  'theta-shared': '세타 공유 전문가의 변형 모델 B판',
  'lambda-ablation': '람다 라우터 게이트 제거 실험 기록',
  'tau-pool': '타우 전문가 묶음',
  'iota-pool': '요타 공유 전문가 묶음',
};
// In worst, names in these rows take two lines and the others one, in both orientations.
const TWO_LINE_ROWS = ['root', 'merge'];
function worstKo(): any {
  const d = structuredClone(worst);
  d.lang = 'ko';
  d.title = '알파 희소 라우팅의 계보: 2015년 논문에서 2025년 공개까지';
  d.focal.note = '지어낸 징검다리: 모든 층이 전문가 묶음 하나를 함께 쓴 첫 모델.';
  d.omitted = ['뮤 밀집에서 희소로 바꾸기(2022), 작은 갈래', '뉴 전문가 선택 라우팅(2023), 뒤 노드가 인용하지 않음'];
  for (const n of d.nodes) n.name = KO_NAMES[n.id];
  return d;
}

let fonts: any;
beforeAll(async () => {
  fonts = await loadFonts();
});

const run = (data: any, style: string, portrait: boolean, credit = true): any =>
  layout(data, fonts, { style, credit, portrait } as any);
const has = (list: string[], word: string): boolean => list.some((m) => m.includes(word));

// Small graphs built from alpha's first node. rows: { id: row }, edges: [from, to].
function mini(rows: Record<string, string>, edges: [string, string][]): any {
  const d = structuredClone(alpha);
  const base = d.nodes[0];
  d.nodes = Object.entries(rows).map(([id, row], i) => ({
    ...structuredClone(base), id, row, name: `Node ${id.toUpperCase()}`, date: `20${10 + i}`,
  }));
  d.edges = edges.map(([from, to]) => ({ from, to, type: 'lineage', status: 'inferred' }));
  delete d.focal;
  return d;
}

function cases(): [string, any, string, boolean][] {
  const out: [string, any, string, boolean][] = [];
  for (const [name, data] of [['alpha', alpha], ['worst', worst], ['worst-ko', worstKo()]] as [string, any][]) {
    for (const style of STYLE_IDS) for (const portrait of ORIENTS) out.push([name, data, style, portrait]);
  }
  return out;
}

type Seg = { x1: number; y1: number; x2: number; y2: number };
const segsOf = (points: [number, number][]): Seg[] =>
  points.slice(1).map((p, i) => ({ x1: points[i][0], y1: points[i][1], x2: p[0], y2: p[1] }));

// True when the segment runs through the open interior of the box.
function crossesInterior(s: Seg, b: any): boolean {
  const [xa, xb] = [Math.min(s.x1, s.x2), Math.max(s.x1, s.x2)];
  const [ya, yb] = [Math.min(s.y1, s.y2), Math.max(s.y1, s.y2)];
  const ox = Math.min(xb, b.x + b.w) - Math.max(xa, b.x);
  const oy = Math.min(yb, b.y + b.h) - Math.max(ya, b.y);
  if (Math.abs(s.y1 - s.y2) < EPS) return s.y1 > b.y + EPS && s.y1 < b.y + b.h - EPS && ox > EPS;
  return s.x1 > b.x + EPS && s.x1 < b.x + b.w - EPS && oy > EPS;
}

// True when two axis-parallel segments lie on the same line and share a stretch of positive length.
function overlaps(a: Seg, b: Seg): boolean {
  const ah = Math.abs(a.y1 - a.y2) < EPS;
  const bh = Math.abs(b.y1 - b.y2) < EPS;
  if (ah !== bh) return false;
  if (ah) {
    if (Math.abs(a.y1 - b.y1) > EPS) return false;
    return Math.min(Math.max(a.x1, a.x2), Math.max(b.x1, b.x2)) - Math.max(Math.min(a.x1, a.x2), Math.min(b.x1, b.x2)) > EPS;
  }
  if (Math.abs(a.x1 - b.x1) > EPS) return false;
  return Math.min(Math.max(a.y1, a.y2), Math.max(b.y1, b.y2)) - Math.max(Math.min(a.y1, a.y2), Math.min(b.y1, b.y2)) > EPS;
}

// True when the edge joins two boxes of one row with no box between them.
function isAdjacent(out: any, e: { from: string; to: string }): boolean {
  const [a, b] = [out.boxes[e.from], out.boxes[e.to]];
  if (Math.abs(a.y - b.y) > EPS) return false;
  const [lo, hi] = [Math.min(a.x, b.x), Math.max(a.x, b.x)];
  return !Object.values(out.boxes).some((o: any) => Math.abs(o.y - a.y) < EPS && o.x > lo + EPS && o.x < hi - EPS);
}

describe('fit', () => {
  test('worst is a valid worst case', () => {
    expect(validate(worst).errors).toEqual([]);
    expect(worst.nodes.length).toBe(9);
    const rows = ['root', 'revival', 'merge', 'spread'].map((r) => worst.nodes.filter((n: any) => n.row === r).length);
    expect(rows).toEqual([3, 2, 2, 2]);
    for (const n of worst.nodes) {
      expect(n.name).toContain(' ');
      expect(n.sub.length).toBeLessThanOrEqual(14);
    }
    expect(Math.max(...worst.nodes.map((n: any) => n.sub.length))).toBe(14);
    // all eight legend entries are drawn
    for (const lang of ['en', 'ko'] as const) {
      const data = lang === 'en' ? worst : worstKo();
      const t = run(data, 'woodcut', false).texts;
      for (const label of Object.values(STRINGS[lang].legend)) expect(t).toContain(label);
    }
    expect(worst.nodes.filter((n: any) => n.side).length).toBe(1);
    expect(worst.nodes.filter((n: any) => n.timeline).length).toBe(1);
    expect(worst.nodes.filter((n: any) => n.sources.every((s: any) => !s.opened)).length).toBe(1);
    expect(worst.focal).toBeTruthy();
    expect(worst.omitted.length).toBe(2);
    expect(worst.edges.length).toBe(10);
    const row = (id: string) => ['root', 'revival', 'merge', 'spread'].indexOf(worst.nodes.find((n: any) => n.id === id).row);
    expect(worst.edges.some((e: any) => row(e.to) - row(e.from) >= 2)).toBe(true);
    expect(worst.edges.some((e: any) => row(e.to) === row(e.from) && row(e.to) === 3)).toBe(true);
    for (const kind of ['inferred', 'enables']) {
      expect(worst.edges.some((e: any) => e.status === kind || e.type === kind)).toBe(true);
    }
  });

  test('ko names are about as wide as the en names', () => {
    for (const n of worst.nodes) {
      const en = shapeText(fonts, 'bodyBold', n.name, NAME_SIZE, 0, 0).width;
      const ko = shapeText(fonts, 'bodyBold', KO_NAMES[n.id], NAME_SIZE, 0, 0).width;
      expect(ko / en).toBeGreaterThan(0.85);
      expect(ko / en).toBeLessThan(1.1);
    }
  });

  test('worst case fits in every style and orientation', () => {
    for (const data of [worst, worstKo()]) {
      for (const style of STYLE_IDS) {
        for (const portrait of ORIENTS) {
          const out = run(data, style, portrait);
          expect({ lang: data.lang, style, portrait, errors: out.errors }).toEqual({ lang: data.lang, style, portrait, errors: [] });
          // names take two lines in the root and merge rows and one line elsewhere
          const O = portrait ? CANVAS.portrait : CANVAS.landscape;
          for (const n of data.nodes) {
            expect(out.boxes[n.id].h, n.id).toBeCloseTo(boxHeight(TWO_LINE_ROWS.includes(n.row) ? 2 : 1, O.sub), 6);
          }
        }
      }
    }
  });

  test('ko and en worst boxes have the same size', () => {
    for (const portrait of ORIENTS) {
      const en = run(worst, 'woodcut', portrait).boxes;
      const ko = run(worstKo(), 'woodcut', portrait).boxes;
      expect(ko).toEqual(en);
    }
  });

  test('a Hangul name with the English character count does not fit', () => {
    const d = structuredClone(worst);
    d.lang = 'ko';
    const n = d.nodes.find((x: any) => x.id === 'alpha-router');
    n.name = n.name.replace(/[^ ]/g, '가');
    for (const portrait of ORIENTS) {
      expect(run(d, 'woodcut', portrait).errors).toContain('node "alpha-router": name does not fit in two lines');
    }
  });

  test('alpha lays out with no errors', () => {
    for (const style of STYLE_IDS) for (const portrait of ORIENTS) expect(run(alpha, style, portrait).errors).toEqual([]);
  });
});

describe('geometry', () => {
  test('boxes and edges', () => {
    for (const [name, data, style, portrait] of cases()) {
      const at = `${name} ${style} ${portrait ? 'portrait' : 'landscape'}`;
      const out = run(data, style, portrait);
      const { width: W, height: H } = out.scene;
      expect([W, H], at).toEqual(portrait ? [1080, 1350] : [1200, 675]);
      const boxes = Object.entries(out.boxes) as [string, any][];
      expect(boxes.length, at).toBe(data.nodes.length);
      for (const [id, b] of boxes) {
        expect(b.x >= 0 && b.y >= 0 && b.x + b.w <= W && b.y + b.h <= H, `${at} ${id} in canvas`).toBe(true);
      }
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const [a, b] = [boxes[i][1], boxes[j][1]];
          const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
          expect(apart, `${at} ${boxes[i][0]} vs ${boxes[j][0]}`).toBe(true);
        }
      }
      expect(out.edges.length, at).toBe(data.edges.length);
      for (const e of out.edges) {
        const eat = `${at} ${e.from} -> ${e.to}`;
        const pts = e.points;
        expect(pts.length, eat).toBeGreaterThanOrEqual(2);
        for (let i = 1; i < pts.length; i++) {
          const ortho = Math.abs(pts[i][0] - pts[i - 1][0]) < EPS || Math.abs(pts[i][1] - pts[i - 1][1]) < EPS;
          expect(ortho, `${eat} segment ${i}`).toBe(true);
        }
        for (const s of segsOf(pts)) {
          for (const [id, b] of boxes) {
            if (id === e.from || id === e.to) continue;
            expect(crossesInterior(s, b), `${eat} crosses ${id}`).toBe(false);
          }
        }
        const fb = out.boxes[e.from];
        const tb = out.boxes[e.to];
        const [x0, y0] = pts[0];
        const [x1, y1] = pts[pts.length - 1];
        const sameRow = Math.abs(fb.y - tb.y) < EPS;
        if (sameRow && isAdjacent(out, e)) {
          // a direct side-to-side arrow at the vertical middle
          const right = tb.x > fb.x;
          expect(pts.length, `${eat} is one straight arrow`).toBe(2);
          expect(Math.abs(y0 - (fb.y + fb.h / 2)) < EPS && Math.abs(y1 - y0) < EPS, `${eat} is level at the middle`).toBe(true);
          expect(Math.abs(x0 - (right ? fb.x + fb.w : fb.x)) < EPS, `${eat} starts on the facing side of from`).toBe(true);
          expect(Math.abs(x1 - (right ? tb.x : tb.x + tb.w)) < EPS, `${eat} ends on the facing side of to`).toBe(true);
          continue;
        }
        expect(Math.abs(y0 - (fb.y + fb.h)) < EPS && x0 > fb.x && x0 < fb.x + fb.w, `${eat} starts on from bottom`).toBe(true);
        const edgeY = sameRow ? tb.y + tb.h : tb.y;
        expect(Math.abs(y1 - edgeY) < EPS && x1 > tb.x && x1 < tb.x + tb.w, `${eat} ends on to ${sameRow ? 'bottom' : 'top'}`).toBe(true);
        expect(Math.abs(x0 - (fb.x + fb.w / 2)) < EPS, `${eat} leaves from the bottom center`).toBe(true);
      }
      // edges from different nodes never run on top of each other
      for (let i = 0; i < out.edges.length; i++) {
        for (let j = i + 1; j < out.edges.length; j++) {
          const [a, b] = [out.edges[i], out.edges[j]];
          if (a.from === b.from) continue;
          for (const sa of segsOf(a.points)) {
            for (const sb of segsOf(b.points)) {
              expect(overlaps(sa, sb), `${at} ${a.from}->${a.to} overlaps ${b.from}->${b.to}`).toBe(false);
            }
          }
        }
      }
    }
  });

  test('edges in one gap use one lane per source', () => {
    for (const portrait of ORIENTS) {
      const out = run(worst, 'woodcut', portrait);
      const rowOf = (id: string) => out.boxes[id].y;
      // the first horizontal segment of every edge is its source lane in the gap below the source row
      const lane = (e: any) => {
        const s = segsOf(e.points).find((x) => Math.abs(x.y1 - x.y2) < EPS && Math.abs(x.x1 - x.x2) > EPS);
        return s ? s.y1 : null;
      };
      const byFrom = new Map<string, number>();
      for (const e of out.edges) {
        const y = lane(e);
        if (y === null) continue;
        if (byFrom.has(e.from)) expect(y).toBeCloseTo(byFrom.get(e.from)!, 6);
        byFrom.set(e.from, y);
      }
      const seen = new Map<string, string>();
      for (const [from, y] of byFrom) {
        const key = `${rowOf(from)}:${y.toFixed(3)}`;
        expect(seen.get(key), `${from} shares a lane with ${seen.get(key)}`).toBeUndefined();
        seen.set(key, from);
      }
    }
  });

  const tip = (out: any, from: string, to: string) => {
    const e = out.edges.find((x: any) => x.from === from && x.to === to);
    return e.points[e.points.length - 1];
  };
  const noOverlap = (out: any) => {
    for (const a of out.edges) {
      for (const b of out.edges) {
        if (a === b || a.from === b.from) continue;
        for (const sa of segsOf(a.points)) for (const sb of segsOf(b.points)) expect(overlaps(sa, sb)).toBe(false);
      }
    }
  };

  test('an arrival steps aside from the line leaving the box above', () => {
    // a -> d comes down column 1, where b leaves on a lower lane
    const d = mini({ a: 'root', b: 'root', c: 'revival', dd: 'revival' }, [['a', 'dd'], ['b', 'c']]);
    for (const style of STYLE_IDS) {
      for (const portrait of ORIENTS) {
        const out = run(d, style, portrait);
        expect(out.errors).toEqual([]);
        noOverlap(out);
        const b = out.boxes.b;
        expect(Math.abs(tip(out, 'a', 'dd')[0] - (b.x + b.w / 2))).toBeGreaterThanOrEqual(6);
      }
    }
  });

  test('a same-row arrival keeps clear of the target line leaving downward', () => {
    // x sits between a and b, so a -> b is not adjacent and still comes up from below
    const d = mini({ a: 'root', x: 'root', b: 'root', c: 'revival' }, [['a', 'b'], ['b', 'c']]);
    for (const portrait of ORIENTS) {
      const out = run(d, 'woodcut', portrait);
      noOverlap(out);
      const b = out.boxes.b;
      const [x, y] = tip(out, 'a', 'b');
      expect(y).toBeCloseTo(b.y + b.h, 6);
      expect(Math.abs(x - (b.x + b.w / 2))).toBeGreaterThanOrEqual(6);
    }
  });

  test('arrivals stay clear of the line leaving the box above', () => {
    for (const [name, data, style, portrait] of cases()) {
      const out = run(data, style, portrait);
      for (const e of out.edges) {
        const t = out.boxes[e.to];
        const [x, y] = e.points[e.points.length - 1];
        if (Math.abs(y - t.y) > EPS) continue;
        const aboveY = Math.max(-1, ...Object.values(out.boxes).map((b: any) => (b.y < t.y ? b.y : -1)));
        const above = Object.entries(out.boxes).find(([, b]: any) => Math.abs(b.y - aboveY) < EPS && Math.abs(b.x - t.x) < EPS);
        if (!above || above[0] === e.from || !out.edges.some((q: any) => q.from === above[0])) continue;
        const b: any = above[1];
        expect(Math.abs(x - (b.x + b.w / 2)), `${name} ${style} ${portrait} ${e.from}->${e.to}`).toBeGreaterThanOrEqual(6);
      }
    }
  });

  test('arrivals stay between the tags on the top border', () => {
    // eight lines into one narrow box that has both a kind tag and a timeline badge
    const rows: Record<string, string> = { t: 'merge' };
    for (const id of ['a', 'b', 'c', 'dd']) rows[id] = 'root';
    for (const id of ['e', 'f', 'g', 'h']) rows[id] = 'revival';
    const d = mini(rows, Object.keys(rows).filter((id) => id !== 't').map((id) => [id, 't'] as [string, string]));
    const t = d.nodes.find((n: any) => n.id === 't');
    t.date = '2024-01-01';
    t.timeline = { id: 'x', url: 'https://example.com/x' };
    for (const style of STYLE_IDS) {
      const out = run(d, style, false);
      expect(out.errors).toEqual([]);
      noOverlap(out);
      const b = out.boxes.t;
      const p = createPainter(fonts, [], STYLES[style as 'woodcut']);
      const tags = tagRects(p, STYLES[style as 'woodcut'], b, 'PAPER', 'Timeline', CANVAS.landscape.tag);
      const xs = out.edges.filter((e: any) => e.to === 't').map((e: any) => e.points[e.points.length - 1][0]);
      expect(new Set(xs.map((x: number) => x.toFixed(3))).size).toBe(8);
      for (const x of xs) {
        expect(x).toBeGreaterThan(tags.kind.x + tags.kind.w);
        expect(x).toBeLessThan(tags.badge!.x);
      }
    }
  });

  test('an adjacent same-row edge is one straight arrow between the facing sides', () => {
    const d = mini({ a: 'root', b: 'root' }, [['a', 'b']]);
    for (const portrait of ORIENTS) {
      const out = run(d, 'woodcut', portrait);
      expect(out.errors).toEqual([]);
      const [a, b] = [out.boxes.a, out.boxes.b];
      const mid = a.y + a.h / 2;
      expect(out.edges[0].points).toEqual([[a.x + a.w, mid], [b.x, mid]]);
      expect(b.x - (a.x + a.w)).toBeGreaterThanOrEqual(36);
    }
  });

  test('a leftward adjacent same-row edge also works', () => {
    // dates make a the left box, so the edge b -> a points left
    const d = mini({ a: 'root', b: 'root' }, [['b', 'a']]);
    for (const portrait of ORIENTS) {
      const out = run(d, 'woodcut', portrait);
      const [a, b] = [out.boxes.a, out.boxes.b];
      expect(a.x).toBeLessThan(b.x);
      const mid = a.y + a.h / 2;
      expect(out.edges[0].points).toEqual([[b.x, mid], [a.x + a.w, mid]]);
    }
  });

  test('a non-adjacent same-row edge keeps the route under the row', () => {
    const d = mini({ a: 'root', b: 'root', c: 'root' }, [['a', 'c']]);
    for (const portrait of ORIENTS) {
      const out = run(d, 'woodcut', portrait);
      expect(out.errors).toEqual([]);
      const [a, c] = [out.boxes.a, out.boxes.c];
      const pts = out.edges[0].points;
      expect(pts.length).toBe(4);
      expect(pts[0][1]).toBeCloseTo(a.y + a.h, 6);
      expect(pts[pts.length - 1][1]).toBeCloseTo(c.y + c.h, 6);
      expect(pts[1][1]).toBeGreaterThan(a.y + a.h);
    }
  });

  test('the column gap widens only when an adjacent same-row edge exists', () => {
    const gap = (out: any) => out.boxes.b.x - (out.boxes.a.x + out.boxes.a.w);
    const plain = run(mini({ a: 'root', b: 'root' }, []), 'woodcut', false);
    const wide = run(mini({ a: 'root', b: 'root' }, [['a', 'b']]), 'woodcut', false);
    expect(gap(plain)).toBeCloseTo(16, 6);
    expect(gap(wide)).toBeCloseTo(40, 6);
  });

  test('an adjacent same-row edge takes no lane', () => {
    const a = run(mini({ a: 'root', b: 'root', c: 'revival' }, [['a', 'b'], ['b', 'c']]), 'woodcut', false);
    const b = run(mini({ a: 'root', b: 'root', c: 'revival' }, [['b', 'c']]), 'woodcut', false);
    expect(a.boxes.c.y).toBeCloseTo(b.boxes.c.y, 6);
  });

  test('an edge two or more rows down travels between the columns', () => {
    const out = run(worst, 'woodcut', false);
    const e = out.edges.find((x: any) => x.from === 'gamma-pool' && x.to === 'iota-pool');
    const verticals = segsOf(e.points).filter((s) => Math.abs(s.x1 - s.x2) < EPS);
    const long = verticals.reduce((a, b) => (Math.abs(b.y2 - b.y1) > Math.abs(a.y2 - a.y1) ? b : a));
    for (const b of Object.values(out.boxes) as any[]) {
      expect(long.x1 > b.x && long.x1 < b.x + b.w).toBe(false);
    }
  });
});

describe('rules', () => {
  test('name size floor', () => {
    expect(NAME_SIZE).toBeGreaterThanOrEqual(28);
    expect((NAME_SIZE * 400) / 1200).toBeGreaterThanOrEqual(9);
  });

  test('credit toggle', () => {
    for (const data of [alpha, worstKo()]) {
      const lang = data.lang as 'ko' | 'en';
      for (const style of STYLE_IDS) {
        expect(run(data, style, false, true).texts).toContain(STRINGS[lang].credit);
        const off = run(data, style, false, false).texts;
        expect(off).not.toContain(STRINGS[lang].credit);
        expect(off.some((t: string) => t.includes('lucasflatwhite.com'))).toBe(false);
      }
    }
    expect(run(worstKo(), 'woodcut', false).texts).toContain(
      'AI Timeline Log 계보 스킬로 그림 · lucasflatwhite.com/ai-timeline-log',
    );
    expect(run(alpha, 'woodcut', false).texts).toContain('Made with AI Timeline Log · lucasflatwhite.com/ai-timeline-log');
  });

  test('row labels localized', () => {
    for (const style of STYLE_IDS) {
      const ko = run(worstKo(), style, false).texts;
      const en = run(worst, style, false).texts;
      expect(ko).toEqual(expect.arrayContaining(['뿌리', '부활', '합류', '확산']));
      expect(en).toEqual(expect.arrayContaining(['Roots', 'Revival', 'Merge', 'Spread']));
      expect(en).not.toContain('뿌리');
    }
  });

  test('empty rows are not drawn', () => {
    const d = structuredClone(alpha);
    d.nodes = d.nodes.filter((n: any) => n.row !== 'revival');
    d.edges = d.edges.filter((e: any) => e.from !== 'gamma-pool' && e.to !== 'gamma-pool');
    const t = run(d, 'woodcut', false).texts;
    expect(t).toContain('Roots');
    expect(t).not.toContain('Revival');
  });

  test('focal and omitted lines', () => {
    const t = run(worst, 'woodcut', false).texts;
    expect(t).toContain(`Key link · ${worst.focal.note}`);
    expect(t).toContain(`Omitted · ${worst.omitted.join(', ')}`);
    const d = structuredClone(alpha);
    delete d.focal;
    delete d.omitted;
    const t2 = run(d, 'woodcut', false).texts;
    expect(t2.some((x: string) => x.startsWith('Key link · '))).toBe(false);
    expect(t2.some((x: string) => x.startsWith('Omitted · '))).toBe(false);
  });

  test('sub line has dotted date and sub, kind sits in a tag', () => {
    const t = run(worst, 'woodcut', false).texts;
    expect(t).toContain('2024.03.15 · 8x22B weights');
    expect(t).toContain('2016 · Accelerator');
    expect(t).toContain('2015.03 · A. Example');
    for (const tag of ['PAPER', 'HW', 'MODEL', 'RELEASE']) expect(t).toContain(tag);
    expect(t.some((x: string) => /^(PAPER|MODEL|HW|RELEASE|DATA|OTHER) · /.test(x))).toBe(false);
    expect(run(alpha, 'woodcut', false).texts).toContain('Timeline');
    expect(run(worstKo(), 'woodcut', false).texts).toContain('연표');
  });

  test('unbreakable names are reported, not cut', () => {
    const four = mini({ a: 'root', b: 'root', c: 'root', dd: 'root' }, []);
    for (const name of ['SuperLongUnbreakableModelName2026', '가나다라마바사아자차카타파하가나다라마바']) {
      for (const [data, id] of [[structuredClone(worst), 'gamma-pool'], [structuredClone(four), 'a']] as [any, string][]) {
        data.nodes.find((x: any) => x.id === id).name = name;
        for (const portrait of ORIENTS) {
          expect(has(run(data, 'woodcut', portrait).errors, `node "${id}": name does not fit`), `${id} ${portrait}`).toBe(true);
        }
      }
    }
    // in two wide columns the Hangul word fits on one line and is drawn whole
    const d = structuredClone(alpha);
    d.nodes[0].name = '가나다라마바사아자차카타파하가나다라마바';
    const out = run(d, 'woodcut', false);
    expect(out.errors).toEqual([]);
    expect(out.texts).toContain(d.nodes[0].name);
  });

  test('a sub that is too long is reported', () => {
    const d = structuredClone(alpha);
    d.nodes[0].sub = 'A very long subtitle that will never fit on one line of this box, not even a wide one';
    expect(run(d, 'woodcut', false).errors).toContain('node "alpha-routing": sub does not fit');
  });

  test('a title that is too long is reported', () => {
    const d = structuredClone(alpha);
    d.title = 'A title that goes on and on, '.repeat(4);
    expect(run(d, 'woodcut', false).errors).toContain('title does not fit');
  });

  test('dates of different precision sort by padded key, then id', () => {
    const d = structuredClone(alpha);
    const base = d.nodes[0];
    d.nodes = [
      { ...structuredClone(base), id: 'c', name: 'Node C', date: '2017-01-15' },
      { ...structuredClone(base), id: 'b', name: 'Node B', date: '2017' },
      { ...structuredClone(base), id: 'a', name: 'Node A', date: '2017-01' },
    ];
    d.edges = [];
    delete d.focal;
    for (const portrait of ORIENTS) {
      const b = run(d, 'woodcut', portrait).boxes;
      expect(b.a.x).toBeLessThan(b.b.x);
      expect(b.b.x).toBeLessThan(b.c.x);
    }
  });

  test('too many in a row', () => {
    const make = (count: number) => {
      const d = structuredClone(alpha);
      const base = d.nodes[0];
      d.nodes = Array.from({ length: count }, (_, i) => ({ ...structuredClone(base), id: `n${i}`, name: `Node ${i}` }));
      d.edges = [];
      delete d.focal;
      return d;
    };
    expect(has(run(make(5), 'woodcut', false).errors, 'at most 4')).toBe(true);
    expect(run(make(5), 'woodcut', false).errors).toContain('row "root": 5 nodes, at most 4 in landscape (3 in portrait)');
    expect(run(make(4), 'woodcut', false).errors).toEqual([]);
    expect(has(run(make(4), 'woodcut', true).errors, 'at most 4')).toBe(true);
    expect(run(make(3), 'woodcut', true).errors).toEqual([]);
  });

  test('upward edge', () => {
    const d = structuredClone(alpha);
    d.edges.push({ from: 'epsilon-open', to: 'alpha-routing', type: 'lineage', status: 'inferred' });
    expect(run(d, 'woodcut', false).errors).toContain('edge epsilon-open -> alpha-routing goes upward');
  });

  test('capacity: two-line names in all four rows do not fit in landscape', () => {
    const d = structuredClone(worst);
    const long: Record<string, string> = {
      'delta-stack': 'Delta Fused Stack and Router',
      'eta-parallel': 'Eta Parallel Expert Training',
      'tau-pool': 'Tau Expert Pool with Top-2 Gates',
      'iota-pool': 'Iota Shared Expert Pool v3',
    };
    for (const n of d.nodes) if (long[n.id]) n.name = long[n.id];
    const l = run(d, 'woodcut', false);
    expect(l.errors).toEqual(['too tall: shorten names, or move a node to omitted']);
    for (const style of STYLE_IDS) {
      const out = run(d, style, true);
      expect(out.errors).toEqual([]);
      for (const n of d.nodes) expect(out.boxes[n.id].h).toBeCloseTo(boxHeight(2, CANVAS.portrait.sub), 6);
    }
  });

  test('too tall', () => {
    const d = structuredClone(worst);
    // worst has little height to spare in landscape, and its same-row arrow takes no lane. These add lanes below revival and merge,
    // more than the one the same-row arrow gave back, so landscape runs out while portrait still has room.
    d.edges.push(
      { from: 'kappa-capacity', to: 'theta-shared', type: 'enables', status: 'inferred' },
      { from: 'gamma-pool', to: 'lambda-ablation', type: 'lineage', status: 'inferred' },
      { from: 'kappa-capacity', to: 'iota-pool', type: 'enables', status: 'inferred' },
      { from: 'delta-stack', to: 'iota-pool', type: 'lineage', status: 'inferred' },
      { from: 'eta-parallel', to: 'tau-pool', type: 'lineage', status: 'inferred' },
      { from: 'lambda-ablation', to: 'theta-shared', type: 'lineage', status: 'inferred' },
      { from: 'lambda-ablation', to: 'tau-pool', type: 'lineage', status: 'inferred' },
      { from: 'kappa-capacity', to: 'tau-pool', type: 'lineage', status: 'inferred' },
      { from: 'alpha-router', to: 'tau-pool', type: 'lineage', status: 'inferred' },
      { from: 'gamma-pool', to: 'tau-pool', type: 'lineage', status: 'inferred' },
    );
    expect(run(d, 'woodcut', false).errors).toContain('too tall: shorten names, or move a node to omitted');
    expect(run(d, 'woodcut', true).errors).toEqual([]);
  });

  test('deterministic', () => {
    for (const style of STYLE_IDS) {
      const a = JSON.stringify(run(worst, style, false));
      const b = JSON.stringify(run(structuredClone(worst), style, false));
      expect(a).toBe(b);
    }
  });

  test('every color is an uppercase hex', () => {
    for (const [, data, style, portrait] of cases()) {
      const s = run(data, style, portrait).scene;
      expect(s.background).toMatch(/^#[0-9A-F]{6}$/);
      for (const it of s.items) {
        for (const k of ['fill', 'stroke']) if (it[k] !== undefined) expect(it[k]).toMatch(/^#[0-9A-F]{6}$/);
        expect(it.fill !== undefined || it.stroke !== undefined).toBe(true);
        expect(it.cmds.length).toBeGreaterThan(0);
      }
    }
  });

  test('scene has a title and a description', () => {
    const s = run(alpha, 'woodcut', false).scene;
    expect(s.title).toBe(alpha.title);
    expect(s.desc.length).toBeGreaterThan(0);
  });
});

describe('floors and columns', () => {
  test('text floors', () => {
    expect(TEXT_FLOOR).toBeGreaterThanOrEqual(14);
    expect(TAG_FLOOR).toBeGreaterThanOrEqual(11);
    expect(MARK_FLOOR).toBeGreaterThanOrEqual(7);
    // 14px on the 1200 canvas is about 9px when the image is shown 800px wide
    expect((TEXT_FLOOR * 800) / 1200).toBeGreaterThanOrEqual(9);
    for (const O of [CANVAS.landscape, CANVAS.portrait]) {
      for (const k of ['sub', 'legend', 'credit', 'focal', 'omitted', 'label'] as const) {
        expect(O[k], k).toBeGreaterThanOrEqual(TEXT_FLOOR);
      }
      expect(O.tag).toBeGreaterThanOrEqual(TAG_FLOOR);
      expect(O.slug, 'slug').toBeGreaterThanOrEqual(MARK_FLOOR);
      expect(O.mark, 'mark').toBeGreaterThanOrEqual(MARK_FLOOR);
    }
  });

  test('columns fill the width', () => {
    const four = mini({ a: 'root', b: 'root', c: 'root', dd: 'root' }, [['a', 'b']]);
    const wide = run(alpha, 'woodcut', false).boxes;
    const narrow = run(four, 'woodcut', false).boxes;
    expect(wide['alpha-routing'].w).toBeGreaterThan(narrow.a.w);
    // two columns split the width between the gutter and the right inset
    const right = Math.max(...(Object.values(wide) as any[]).map((b) => b.x + b.w));
    expect(right).toBeCloseTo(1200 - 24, 6);
    expect(Math.max(...(Object.values(narrow) as any[]).map((b) => b.x + b.w))).toBeCloseTo(1200 - 24, 6);
    // a single node still gets a two-column cell
    const one = mini({ a: 'root' }, []);
    expect(run(one, 'woodcut', false).boxes.a.w).toBeCloseTo(wide['alpha-routing'].w, 6);
  });
});

describe('styles', () => {
  test('stroked items carry the style cap and join, dashed ones a butt cap', () => {
    const want: Record<string, [string, string]> = { woodcut: ['square', 'miter'], soft: ['round', 'round'], proof: ['butt', 'miter'] };
    for (const [, data, style, portrait] of cases()) {
      let solid = 0;
      let dashed = 0;
      for (const it of run(data, style, portrait).scene.items) {
        if (it.stroke === undefined) {
          expect(it.cap).toBeUndefined();
          continue;
        }
        if (it.dash) {
          dashed++;
          expect([it.cap, it.join]).toEqual(['butt', want[style][1]]);
        } else {
          solid++;
          expect([it.cap, it.join]).toEqual(want[style]);
        }
      }
      expect(solid).toBeGreaterThan(10);
      expect(dashed).toBeGreaterThan(0);
    }
    expect(STYLES.woodcut.line).toEqual({ cap: 'square', join: 'miter' });
  });

  test('tokens match the site', () => {
    const css = readFileSync(new URL('../../../src/styles/tokens.css', import.meta.url), 'utf8');
    const v = (name: string) => css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))![1].toUpperCase();
    expect(TOKENS).toEqual({ paper: v('paper'), ink: v('ink'), ink2: v('ink-2'), ghost: v('ghost'), wood: v('wood') });
  });

  test('blend premixes on the background', () => {
    expect(blend('#111110', 1, '#EEECE6')).toBe('#111110');
    expect(blend('#111110', 0, '#EEECE6')).toBe('#EEECE6');
    expect(blend('#111110', 0.06, '#EEECE6')).toMatch(/^#[0-9A-F]{6}$/);
    expect(blend('#000000', 0.5, '#ffffff')).toBe('#808080');
  });

  test('style values follow the spec table', () => {
    expect(Object.keys(STYLES).sort()).toEqual(['proof', 'soft', 'woodcut']);
    expect(STYLES.woodcut.background).toBe(TOKENS.paper);
    expect(STYLES.soft.background).toBe(TOKENS.paper);
    expect(STYLES.proof.background).toBe('#EEECE6');
    expect(STYLES.proof.side.fill).toBe(blend(TOKENS.ink, 0.06, '#EEECE6'));
    expect(STYLES.proof.focal.fill).toBe(blend(TOKENS.ink, 0.14, '#EEECE6'));
    expect([STYLES.woodcut.edge.width, STYLES.soft.edge.width, STYLES.proof.edge.width]).toEqual([2, 1, 0.8]);
    expect([STYLES.woodcut.edge.radius, STYLES.soft.edge.radius, STYLES.proof.edge.radius]).toEqual([0, 8, 6]);
  });
});

describe('check', () => {
  test('check passes alpha', async () => {
    expect(await check(alpha)).toEqual({ errors: [], warnings: [] });
    expect(await check(alpha, { portrait: true, style: 'proof', credit: false })).toEqual({ errors: [], warnings: [] });
  });

  test('check reports missing glyph', async () => {
    const d = structuredClone(alpha);
    d.nodes[0].name = 'Alpha 日 Routing';
    const r = await check(d);
    expect(has(r.errors, 'U+65E5')).toBe(true);
    expect(has(r.errors, 'node "alpha-routing"')).toBe(true);
  });

  test('check stops at validation errors and keeps warnings', async () => {
    const d = structuredClone(alpha);
    d.nodes[0].sources = [];
    const r = await check(d);
    expect(has(r.errors, 'no source')).toBe(true);
    const w = structuredClone(worst);
    expect((await check(w)).warnings.length).toBeGreaterThan(0);
    expect((await check(w)).errors).toEqual([]);
  });

  test('check finds what does not fit', async () => {
    const d = structuredClone(alpha);
    d.nodes[0].name = 'SuperLongUnbreakableModelName2026';
    expect(has((await check(d)).errors, 'name does not fit')).toBe(true);
  });
});
