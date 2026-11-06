// 계보 데이터를 캔버스 위 자리로 바꾼다: 제목 띠, 줄 띠(뿌리, 부활, 합류, 확산), 맨 아래 띠.
// 맞지 않으면 캔버스를 키우거나 글자를 줄이지 않고 errors에 그 노드나 줄을 적는다.
import { dateKey } from './schema.mjs';
import { STRINGS, KIND_TAGS } from './strings.mjs';
import { STYLES, TOKENS } from './styles.mjs';
import {
  BOX, INSET, MARK_FLOOR, NAME_SIZE, TAG_FLOOR, TEXT_FLOOR, boxHeight, createPainter, drawBox, drawEdge, drawFrame, drawLegend,
  drawRowLabel, edgeDash, legendWidth, tagRects,
} from './draw.mjs';

export { MARK_FLOOR, NAME_SIZE, TAG_FLOOR, TEXT_FLOOR };

/** @typedef {import('./schema.mjs').Lineage} Lineage */
/** @typedef {import('./schema.mjs').LNode} LNode */
/** @typedef {import('./schema.mjs').LEdge} LEdge */
/** @typedef {import('./styles.mjs').StyleId} StyleId */
/** @typedef {import('./fonts.mjs').Fonts} Fonts */
/** @typedef {import('./draw.mjs').Item} Item */
/** @typedef {import('./draw.mjs').Box} Box */
/** @typedef {import('./draw.mjs').LegendKey} LegendKey */
/** @typedef {{ width: number, height: number, background: string, title: string, desc: string, items: Item[] }} Scene */
/** @typedef {{ from: string, to: string, points: [number, number][] }} EdgeGeom */
/** @typedef {{ scene: Scene, boxes: Record<string, Box>, edges: EdgeGeom[], texts: string[], errors: string[] }} Layout */

export const ROW_ORDER = /** @type {const} */ (['root', 'revival', 'merge', 'spread']);

/**
 * Canvas and type sizes. Floors: names NAME_SIZE; sub, legend, focal, omitted, credit and row labels TEXT_FLOOR;
 * the tags on a box's top border (kind, timeline) TAG_FLOOR. `cols` is the most nodes one row may hold.
 * The proof print marks (slug line `slug`, K labels `mark`) MARK_FLOOR.
 */
export const CANVAS = {
  landscape: { width: 1200, height: 675, cols: 4, title: 30, label: 16, sub: 14, tag: 11, legend: 14, credit: 14, focal: 14, omitted: 14, slug: 7, mark: 7, laneStep: 6, maxExtra: 56 },
  portrait: { width: 1080, height: 1350, cols: 3, title: 32, label: 18, sub: 14, tag: 11, legend: 14, credit: 14, focal: 15, omitted: 14, slug: 8, mark: 7, laneStep: 9, maxExtra: 150 },
};

const LABEL_GAP = 10; // 줄 이름 띠와 첫 칸 사이
const GAP_X = 16; // 칸 사이. 두 줄 이상 내려가는 선이 이 틈의 가운데로 지난다
const SIDE_GAP_X = 40; // 옆 상자로 곧장 가는 화살표가 있으면 모든 틈이 이만큼 넓어진다(선 24px 이상과 화살촉이 보인다)
const TITLE_GAP = 18;
const LANE_TOP = 12; // 줄 아래 변에서 첫 가로 길까지
const LANE_BOTTOM = 15; // 마지막 가로 길에서 아래 줄 위 변까지(화살촉과 위 변에 걸친 꼬리표가 들어간다)
const ROW_GAP_MIN = 26;
const LAST_LANE_BOTTOM = 6;
const BAND_GAP = 12;
const BAND_LINE_GAP = 4;
const PORT_STEP = 20;
const PORT_MARGIN = 16;
const CHANNEL_STEP = 5;
const CLEAR = 6; // 두 세로선이 이보다 가까우면 한 선처럼 보인다

/** @param {string} a @param {string} b */
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
/** Collapses whitespace and control characters so no newline reaches shapeText. @param {unknown} s */
export const clean = (s) =>
  String(s ?? '')
    .replace(/[\u0000-\u001F\u007F\s]+/gu, ' ')
    .trim();
const dotDate = (/** @type {string} */ d) => d.replaceAll('-', '.');
/** Lexicographic order of number keys. @param {number[]} a @param {number[]} b */
const before = (a, b) => {
  for (let t = 0; t < a.length; t++) if (a[t] !== b[t]) return a[t] < b[t];
  return false;
};

/**
 * @param {Lineage} data
 * @param {Fonts} fonts
 * @param {{ style: StyleId, credit: boolean, portrait: boolean }} opts
 * @returns {Layout}
 */
export function layout(data, fonts, opts) {
  const S = STYLES[opts.style] ?? STYLES.woodcut;
  const O = opts.portrait ? CANVAS.portrait : CANVAS.landscape;
  const T = STRINGS[data.lang] ?? STRINGS.en;
  const { width: W, height: H } = O;
  /** @type {string[]} */
  const errors = [];
  const p = createPainter(fonts, errors, S);

  // ---- 칸: 줄마다 (날짜, id) 순서로 왼쪽부터 ----
  const rows = ROW_ORDER.filter((r) => data.nodes.some((n) => n.row === r));
  /** @type {Map<string, { node: LNode, row: number, col: number, lines: string[], sub: string }>} */
  const placed = new Map();
  /** @type {LNode[][]} */
  const grid = rows.map((r, ri) => {
    const list = data.nodes
      .filter((n) => n.row === r)
      .sort((a, b) => cmp(dateKey(a.date), dateKey(b.date)) || cmp(a.id, b.id));
    if (list.length > O.cols) {
      errors.push(`row "${r}": ${list.length} nodes, at most ${CANVAS.landscape.cols} in landscape (${CANVAS.portrait.cols} in portrait)`);
    }
    list.forEach((node, col) => placed.set(node.id, { node, row: ri, col, lines: [], sub: '' }));
    return list;
  });

  // 칸 수는 가장 많은 줄을 따르고(최소 2), 칸들이 너비를 고르게 나눈다
  const cols = Math.max(2, ...grid.map((l) => l.length));
  const left = INSET + O.label + LABEL_GAP;
  // 같은 줄에서 바로 옆 상자로 가는 선이 하나라도 있으면 틈을 넓힌다
  const adjacent = (/** @type {LEdge} */ e) => {
    const [a, b] = [placed.get(e.from), placed.get(e.to)];
    return Boolean(a && b && a.row === b.row && Math.abs(a.col - b.col) === 1);
  };
  const gapX = data.edges.some(adjacent) ? SIDE_GAP_X : GAP_X;
  const boxW = (W - INSET - left - (cols - 1) * gapX) / cols;
  const inner = boxW - 2 * BOX.padX;
  const colX = (/** @type {number} */ c) => left + c * (boxW + gapX);

  // ---- 상자 안 글: 이름은 띄어쓰기에서 최대 2줄, 아래 줄(날짜 · 부제)은 1줄. 종류는 위 변의 꼬리표 ----
  for (const [id, v] of placed) {
    const { lines, fits } = wrap(clean(v.node.name), inner, (s) => p.measure('bodyBold', s, NAME_SIZE));
    if (!fits) errors.push(`node "${id}": name does not fit in two lines`);
    v.lines = lines.slice(0, 2);
    const sub = clean(v.node.sub);
    v.sub = [dotDate(v.node.date), ...(sub ? [sub] : [])].join(' · ');
    if (p.measure('mono', v.sub, O.sub) > inner) errors.push(`node "${id}": sub does not fit`);
  }
  const rowH = grid.map((list) => Math.max(...list.map((n) => boxHeight(placed.get(n.id)?.lines.length || 1, O.sub))));

  // ---- 연결선 갈래: 같은 줄, 바로 아래 줄, 두 줄 이상 ----
  /** @typedef {{ e: LEdge, i: number, kind: 'side'|'same'|'next'|'long', a: NonNullable<ReturnType<typeof placed.get>>,
   *   b: NonNullable<ReturnType<typeof placed.get>>, ch?: number, chX?: number, ax?: number, laneA?: number,
   *   laneB?: number, approach?: number, portX?: number }} Route */
  /** @type {Route[]} */
  const routes = [];
  for (const [i, e] of data.edges.entries()) {
    const a = placed.get(e.from);
    const b = placed.get(e.to);
    if (!a || !b) continue;
    if (b.row < a.row) {
      errors.push(`edge ${e.from} -> ${e.to} goes upward`);
      continue;
    }
    routes.push({ e, i, a, b, kind: adjacent(e) ? 'side' : b.row === a.row ? 'same' : b.row === a.row + 1 ? 'next' : 'long' });
  }

  // 한 틈 안에서는 출발 노드마다 가로 길 하나. 그 줄에서 떠나는 노드(칸 순서)가 위, 먼 줄에서 온 선이 아래.
  // 옆 상자로 곧장 가는 화살표(side)는 길도 자리도 쓰지 않는다
  const laned = routes.filter((r) => r.kind !== 'side');
  /** @type {string[][]} */
  const lanes = rows.map((_, g) => {
    const dep = [...new Set(laned.filter((r) => r.a.row === g).map((r) => r.e.from))].sort(
      (x, y) => (placed.get(x)?.col ?? 0) - (placed.get(y)?.col ?? 0),
    );
    const far = [...new Set(laned.filter((r) => r.kind === 'long' && r.b.row - 1 === g).map((r) => r.e.from))]
      .filter((id) => !dep.includes(id))
      .sort((x, y) => {
        const [px, py] = [placed.get(x), placed.get(y)];
        return (px?.row ?? 0) - (py?.row ?? 0) || (px?.col ?? 0) - (py?.col ?? 0);
      });
    return [...dep, ...far];
  });
  const gapNeed = rows.map((_, g) => {
    const count = lanes[g].length;
    if (g === rows.length - 1) return count ? LANE_TOP + (count - 1) * O.laneStep + LAST_LANE_BOTTOM : 0;
    return Math.max(ROW_GAP_MIN, count ? LANE_TOP + (count - 1) * O.laneStep + LANE_BOTTOM : 0);
  });

  // ---- 맨 아래 띠: 범례, 징검다리, 뺀 것, 출처 줄(오른쪽 끝). 줄마다 하나 ----
  const legend = legendEntries(data, T);
  const focalText = data.focal ? T.focalPrefix + clean(data.focal.note) : '';
  const omittedText = data.omitted?.length ? T.omittedPrefix + data.omitted.map(clean).join(', ') : '';
  const lineH = { legend: O.legend * 1.4, focal: O.focal * 1.35, omitted: O.omitted * 1.35, credit: O.credit * 1.35 };
  const bandH =
    lineH.legend +
    (focalText ? BAND_LINE_GAP + lineH.focal : 0) +
    (omittedText ? BAND_LINE_GAP + lineH.omitted : 0) +
    (opts.credit ? BAND_LINE_GAP + lineH.credit : 0);
  const contentW = W - 2 * INSET;
  const creditW = opts.credit ? p.measure('body', T.credit, O.credit) : 0;
  if (legendWidth(p, legend, O.legend) > contentW) errors.push('legend does not fit in one line');
  if (creditW > contentW) errors.push('credit line does not fit in one line');
  if (focalText && p.measure('body', focalText, O.focal) > contentW) {
    errors.push('focal note does not fit in one line: shorten it');
  }
  if (omittedText && p.measure('body', omittedText, O.omitted) > contentW) {
    errors.push('omitted list does not fit in one line: shorten it');
  }

  // ---- 세로 자리: 제목 띠, 줄 띠, 맨 아래 띠. 남는 높이는 줄 사이와 위아래에 나눈다 ----
  const title = clean(data.title);
  if (p.measure(S.fonts.title, title, O.title) > contentW) errors.push('title does not fit');
  const rowsTop = INSET + O.title + TITLE_GAP;
  const bandTop = H - INSET - bandH;
  const need = rowH.reduce((a, h) => a + h, 0) + gapNeed.reduce((a, h) => a + h, 0);
  let slack = bandTop - BAND_GAP - rowsTop - need;
  if (slack < 0) {
    errors.push('too tall: shorten names, or move a node to omitted');
    slack = 0;
  }
  const n = rows.length;
  const extra = n > 1 ? Math.min(O.maxExtra, slack / (n + 1)) : 0;
  let y = rowsTop + (slack - extra * (n - 1)) / 2;
  const rowTop = [];
  /** @type {number[]} */
  const laneY0 = [];
  for (let g = 0; g < n; g++) {
    rowTop.push(y);
    y += rowH[g];
    const e = g < n - 1 ? extra : 0;
    laneY0.push(y + LANE_TOP + e / 2);
    y += gapNeed[g] + e;
  }
  /** @param {number} g @param {string} id */
  const laneY = (g, id) => laneY0[g] + lanes[g].indexOf(id) * O.laneStep;

  /** @type {Record<string, Box>} */
  const boxes = {};
  for (const [id, v] of placed) boxes[id] = { x: colX(v.col), y: rowTop[v.row], w: boxW, h: rowH[v.row] };
  const center = (/** @type {string} */ id) => boxes[id].x + boxes[id].w / 2;
  const kindOf = (/** @type {LNode} */ nd) => KIND_TAGS[nd.kind] ?? 'OTHER';
  const badgeOf = (/** @type {LNode} */ nd) => (nd.timeline ? T.timeline : null);
  // 위 변의 두 꼬리표 사이에서만 선이 들어온다. 가운데에서 잰 왼쪽, 오른쪽 한계
  /** @param {LNode} nd */
  const topRoom = (nd) => {
    const b = boxes[nd.id];
    const t = tagRects(p, S, b, kindOf(nd), badgeOf(nd), O.tag);
    const cx = b.x + b.w / 2;
    const lo = t.kind.x + t.kind.w + CLEAR - cx;
    const hi = (t.badge ? t.badge.x : b.x + b.w - PORT_MARGIN) - CLEAR - cx;
    return /** @type {[number, number]} */ ([lo, hi]);
  };

  // ---- 세로 길: 두 줄 이상 내려가는 선은 칸 사이 틈을 쓴다. 가까운 틈, 같으면 덜 붐비는 틈 ----
  /** @type {string[][]} */
  const chUsers = Array.from({ length: cols - 1 }, () => []);
  const chX = (/** @type {number} */ j) => colX(j) + boxW + gapX / 2;
  for (const r of laned) {
    r.ax = center(r.e.from);
    r.laneA = laneY(r.a.row, r.e.from);
    if (r.kind !== 'long') continue;
    const ax = r.ax;
    const bx = center(r.e.to);
    let best = 0;
    /** @type {number[] | null} */
    let bestKey = null;
    chUsers.forEach((users, j) => {
      const cx = chX(j);
      const cost = Math.round((Math.abs(ax - cx) + Math.abs(cx - bx)) * 1000) / 1000;
      const key = [cost, users.includes(r.e.from) ? 0 : 1, users.length, Math.abs(cx - (ax + bx) / 2), j];
      if (!bestKey || before(key, bestKey)) {
        best = j;
        bestKey = key;
      }
    });
    r.ch = best;
    if (!chUsers[best].includes(r.e.from)) chUsers[best].push(r.e.from);
  }
  // 한 틈 안에서는 왼쪽에서 온 선이 왼쪽 길을 쓴다. 그래야 서로 덜 건넌다.
  for (const users of chUsers) users.sort((x, y) => center(x) - center(y) || cmp(x, y));
  for (const r of laned) {
    if (r.kind !== 'long' || r.ch === undefined) continue;
    const users = chUsers[r.ch];
    const step = users.length > 1 ? Math.min(CHANNEL_STEP, (gapX - 6) / (users.length - 1)) : 0;
    r.chX = chX(r.ch) + (users.indexOf(r.e.from) - (users.length - 1) / 2) * step;
    r.laneB = laneY(r.b.row - 1, r.e.from);
  }
  for (const r of laned) {
    r.laneB ??= r.laneA;
    r.approach = r.kind === 'long' ? r.chX : r.ax;
  }

  // ---- 도착 자리: 상자 가운데. 선이 겹치게 되면 옆으로 비킨다 ----
  for (let g = 0; g < n; g++) {
    for (let c = 0; c < cols; c++) {
      const above = grid[g][c];
      const below = grid[g + 1]?.[c];
      /** @type {{ x: number, lane: number, from: string, dep: boolean }[]} */
      const upper = [];
      if (above) {
        const departs = lanes[g].includes(above.id);
        if (departs) upper.push({ x: center(above.id), lane: laneY(g, above.id), from: above.id, dep: true });
        const into = laned.filter((r) => r.kind === 'same' && r.e.to === above.id);
        const half = boxes[above.id].w / 2 - PORT_MARGIN;
        place(into, boxes[above.id], departs, () => false, [-half, half]);
        for (const r of into) upper.push({ x: /** @type {number} */ (r.portX), lane: /** @type {number} */ (r.laneB), from: r.e.from, dep: false });
      }
      if (below) {
        const into = laned.filter((r) => r.kind !== 'same' && r.e.to === below.id);
        // 위 상자에서 내려오는 선과 같은 x에 서면 한 선처럼 보인다. 위 상자에서 곧장 내려오는 선만 예외다.
        place(
          into,
          boxes[below.id],
          false,
          (r, x) => upper.some((u) => Math.abs(u.x - x) < CLEAR && !(u.dep && u.from === r.e.from)),
          topRoom(below),
        );
      }
    }
  }

  /** @type {EdgeGeom[]} */
  const edges = routes.map((r) => {
    const a = boxes[r.e.from];
    const b = boxes[r.e.to];
    if (r.kind === 'side') {
      const mid = a.y + a.h / 2;
      const right = b.x > a.x;
      return { from: r.e.from, to: r.e.to, points: /** @type {[number, number][]} */ ([[right ? a.x + a.w : a.x, mid], [right ? b.x : b.x + b.w, mid]]) };
    }
    const ax = /** @type {number} */ (r.ax);
    const px = /** @type {number} */ (r.portX);
    const la = /** @type {number} */ (r.laneA);
    const end = r.kind === 'same' ? b.y + b.h : b.y;
    /** @type {[number, number][]} */
    const pts =
      r.kind === 'long'
        ? [[ax, a.y + a.h], [ax, la], [/** @type {number} */ (r.chX), la], [/** @type {number} */ (r.chX), /** @type {number} */ (r.laneB)], [px, /** @type {number} */ (r.laneB)], [px, end]]
        : [[ax, a.y + a.h], [ax, la], [px, la], [px, end]];
    return { from: r.e.from, to: r.e.to, points: simplify(pts) };
  });

  // ---- 그리기 ----
  const slugTail = ['LINEAGE', clean(data.subject).toUpperCase(), data.researched].join(' · ');
  drawFrame(p, S, W, H, {
    slug: (opts.credit ? 'AI TIMELINE LOG · ' : '') + slugTail,
    slugShort: (opts.credit ? 'AI TIMELINE LOG · ' : '') + `LINEAGE · ${data.researched}`,
    slugSize: O.slug,
    markSize: O.mark,
    slugWhere: 'subject',
  });
  p.text(S.fonts.title, title, O.title, INSET, INSET + 0.8 * O.title, TOKENS.ink, { where: 'title' });
  rows.forEach((r, g) => drawRowLabel(p, S, T.rows[r], data.lang === 'ko', INSET, rowTop[g] + rowH[g] / 2, O.label));
  routes.forEach((r, k) => drawEdge(p, S, edges[k].points, edgeDash(r.e)));
  for (const list of grid) {
    for (const node of list) {
      const v = placed.get(node.id);
      if (!v) continue;
      drawBox(p, S, boxes[node.id], {
        id: node.id,
        lines: v.lines,
        sub: v.sub,
        subSize: O.sub,
        side: node.side === true,
        focal: data.focal?.node === node.id,
        unverified: node.sources.every((s) => s.opened === false),
        kind: kindOf(node),
        badge: badgeOf(node),
        tagSize: O.tag,
      });
    }
  }
  let by = bandTop + lineH.legend / 2;
  drawLegend(p, S, legend, INSET, by, O.legend);
  by += lineH.legend / 2;
  if (focalText) {
    by += BAND_LINE_GAP + lineH.focal;
    p.text('body', focalText, O.focal, INSET, by - lineH.focal / 2 + 0.35 * O.focal, TOKENS.ink, { where: 'focal note' });
  }
  if (omittedText) {
    by += BAND_LINE_GAP + lineH.omitted;
    p.text('body', omittedText, O.omitted, INSET, by - lineH.omitted / 2 + 0.35 * O.omitted, TOKENS.ink2, { where: 'omitted' });
  }
  if (opts.credit) {
    by += BAND_LINE_GAP + lineH.credit;
    p.text('body', T.credit, O.credit, W - INSET - creditW, by - lineH.credit / 2 + 0.35 * O.credit, TOKENS.ink2, { where: 'credit' });
  }

  const names = grid.flat().map((nd) => `${clean(nd.name)} (${dotDate(nd.date)})`);
  const desc = T.desc
    .replace('{subject}', () => clean(data.subject))
    .replace('{count}', () => String(names.length))
    .replace('{names}', () => names.join(', '));
  return {
    scene: { width: W, height: H, background: S.background, title, desc, items: p.items },
    boxes,
    edges,
    texts: p.texts,
    errors,
  };

  /**
   * Spreads the arrival points of `list` along one side of box `b`, ordered by where each line comes from.
   * `blockCenter` keeps the middle free (the box's own line leaves from there); `clash` rejects a point;
   * `room` bounds the offsets from the center.
   * @param {Route[]} list @param {Box} b @param {boolean} blockCenter
   * @param {(r: Route, x: number) => boolean} clash @param {[number, number]} room
   */
  function place(list, b, blockCenter, clash, room) {
    if (!list.length) return;
    list.sort((r, q) => /** @type {number} */ (r.approach) - /** @type {number} */ (q.approach) || /** @type {number} */ (r.laneB) - /** @type {number} */ (q.laneB) || r.i - q.i);
    const k = list.length;
    const cx = b.x + b.w / 2;
    const step = k > 1 ? Math.min(PORT_STEP, (b.w - 2 * PORT_MARGIN) / (k - 1)) : PORT_STEP;
    const mid = list[(k - 1) >> 1];
    const lean = /** @type {number} */ (mid.approach) < cx ? -1 : 1;
    const mults = [0, 0.5, -0.5, 1, -1, 0.25, -0.25, 1.5, -1.5, 0.75, -0.75];
    const [lo, hi] = room;
    /** @param {number} centerOff @param {number} st */
    const pick = (centerOff, st) => {
      const base = list.map((_, i) => centerOff + (i - (k - 1) / 2) * st);
      for (const m of mults) {
        const s = m * st * lean;
        const xs = base.map((o) => o + s);
        if (xs.some((o) => o < lo || o > hi)) continue;
        if (blockCenter && xs.some((o) => Math.abs(o) < CLEAR)) continue;
        if (list.some((r, i) => clash(r, cx + xs[i]))) continue;
        return xs;
      }
      return null;
    };
    let chosen = pick(0, step);
    // 꼬리표 사이 폭이 좁아 기본 간격이 안 맞으면 간격을 줄여 다시 찾는다
    if (!chosen && hi > lo) {
      const midOff = (lo + hi) / 2;
      for (const div of [k - 0.5, k, k + 0.5, k + 1]) {
        if (div <= 0) continue;
        const st = Math.min(PORT_STEP, (hi - lo) / div);
        chosen = pick(0, st) ?? pick(midOff, st);
        if (chosen) break;
      }
    }
    // 어느 자리도 맞지 않으면 꼬리표 사이 자리 안에 고르게 좁혀 놓는다
    if (!chosen) {
      chosen = k > 1 ? list.map((_, i) => lo + ((hi - lo) * i) / (k - 1)) : [Math.min(hi, Math.max(lo, 0))];
    }
    chosen.forEach((o, i) => {
      list[i].portX = cx + o;
    });
  }
}

/**
 * Greedy wrap at spaces. `fits` is false when a word is wider than `max` or more than two lines are needed.
 * @param {string} text @param {number} max @param {(s: string) => number} width
 */
export function wrap(text, max, width) {
  /** @type {string[]} */
  const lines = [];
  let cur = '';
  let fits = true;
  for (const word of text.split(' ').filter(Boolean)) {
    const next = cur ? `${cur} ${word}` : word;
    if (width(next) <= max) {
      cur = next;
      continue;
    }
    if (cur) lines.push(cur);
    cur = word;
    if (width(word) > max) fits = false;
  }
  if (cur) lines.push(cur);
  if (lines.length > 2) fits = false;
  return { lines, fits };
}

/** Drops repeated points and middle points on a straight run. @param {[number, number][]} pts */
function simplify(pts) {
  /** @type {[number, number][]} */
  const out = [];
  for (const q of pts) {
    const last = out[out.length - 1];
    if (last && Math.abs(last[0] - q[0]) < 1e-9 && Math.abs(last[1] - q[1]) < 1e-9) continue;
    out.push(q);
  }
  for (let i = out.length - 2; i > 0; i--) {
    const [a, b, c] = [out[i - 1], out[i], out[i + 1]];
    const sameX = Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(b[0] - c[0]) < 1e-9;
    const sameY = Math.abs(a[1] - b[1]) < 1e-9 && Math.abs(b[1] - c[1]) < 1e-9;
    if (sameX || sameY) out.splice(i, 1);
  }
  return out;
}

/**
 * Legend entries for what this diagram draws, in the order of STRINGS.legend.
 * @param {Lineage} data @param {typeof STRINGS.en} T
 * @returns {{ key: LegendKey, label: string }[]}
 */
function legendEntries(data, T) {
  const lineEdges = data.edges.filter((e) => e.type !== 'enables');
  /** @type {Record<LegendKey, boolean>} */
  const on = {
    lineage: true,
    side: data.nodes.some((nd) => nd.side === true),
    confirmed: lineEdges.some((e) => e.status === 'confirmed'),
    inferred: lineEdges.some((e) => e.status === 'inferred'),
    condition: data.edges.some((e) => e.type === 'enables'),
    focal: Boolean(data.focal),
    timeline: data.nodes.some((nd) => nd.timeline),
    unverified: data.nodes.some((nd) => nd.sources.every((s) => s.opened === false)),
  };
  return /** @type {LegendKey[]} */ (Object.keys(T.legend))
    .filter((k) => on[k])
    .map((key) => ({ key, label: T.legend[key] }));
}
