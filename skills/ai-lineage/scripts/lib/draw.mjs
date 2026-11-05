// 배치(layout.mjs)가 정한 자리에 그림 조각(Scene items)을 놓는다. 글자도 모두 윤곽선이다.
// 둥근 모서리와 꺾임은 4분원을 3차 곡선(k = 0.5523)으로 그린다. 그래야 SVG와 PDF의 모양이 같다.
import { shapeText } from './fonts.mjs';
import { TOKENS, blend } from './styles.mjs';

/** @typedef {import('./fonts.mjs').Cmd} Cmd */
/** @typedef {import('./fonts.mjs').Fonts} Fonts */
/** @typedef {import('./fonts.mjs').Role} Role */
/** @typedef {import('./styles.mjs').Style} Style */
/** @typedef {{ cmds: Cmd[], fill?: string, stroke?: string, width?: number, dash?: number[],
 *   cap?: 'butt'|'round'|'square', join?: 'miter'|'round' }} Item */
/** @typedef {{ x: number, y: number, w: number, h: number }} Box */
/** @typedef {'lineage'|'side'|'confirmed'|'inferred'|'condition'|'focal'|'timeline'|'unverified'} LegendKey */

export const KAPPA = 0.5523;

/** 캔버스 가장자리에서 내용까지. 둘레(판 테두리, 재단선, 판 정보 줄)는 이 안쪽 여백에 그린다. */
export const INSET = 24;

/** 노드 이름 글자 크기. 가로 1200 그림을 400으로 줄여도 9px 이상이다. 맞지 않을 때 줄이지 않는다. */
export const NAME_SIZE = 28;

/** 이름 밖 글자의 하한(캔버스 px): 아래 줄, 범례, 징검다리 줄, 뺀 것 줄, 출처 줄, 줄 이름.
 *  가로 1200 그림을 블로그에서 800으로 보여도 9px 이상이다. */
export const TEXT_FLOOR = 14;

/** 상자 변에 걸친 꼬리표(연표 표지, 종류 꼬리표)의 하한. */
export const TAG_FLOOR = 11;

/** 상자 안 치수. 이름 줄 높이와 첫 줄 기준선은 NAME_SIZE 28에 맞춘 값이다. padTop은 위 변에 걸친 꼬리표 아래를 비운다. */
export const BOX = { padX: 10, padTop: 11, padBottom: 8, line: 30, ascent: 23, subGap: 12 };

/** @param {number} lines @param {number} subSize */
export const boxHeight = (lines, subSize) =>
  BOX.padTop + BOX.ascent + (lines - 1) * BOX.line + BOX.subGap + 0.97 * subSize + BOX.padBottom;

/** 범례 견본 치수 */
export const LEGEND = { box: 16, boxH: 10, line: 22, textGap: 5, itemGap: 12 };

/** 상자 위 변에 걸친 꼬리표(연표 표지, 종류 꼬리표)의 크기. 위로 `rise`만큼 튀어나온다. @param {number} size */
export const badgeMetrics = (size) => {
  const h = size + 7;
  return { h, rise: h / 2 + 2 };
};

// ---- 경로 조각 ----

/** @returns {Cmd[]} */
export function rect(x, y, w, h) {
  return [['M', x, y], ['L', x + w, y], ['L', x + w, y + h], ['L', x, y + h], ['Z']];
}

/** @returns {Cmd[]} */
export function roundRect(x, y, w, h, r) {
  if (r <= 0) return rect(x, y, w, h);
  r = Math.min(r, w / 2, h / 2);
  const c = r * (1 - KAPPA);
  return [
    ['M', x + r, y],
    ['L', x + w - r, y],
    ['C', x + w - c, y, x + w, y + c, x + w, y + r],
    ['L', x + w, y + h - r],
    ['C', x + w, y + h - c, x + w - c, y + h, x + w - r, y + h],
    ['L', x + r, y + h],
    ['C', x + c, y + h, x, y + h - c, x, y + h - r],
    ['L', x, y + r],
    ['C', x, y + c, x + c, y, x + r, y],
    ['Z'],
  ];
}

/** @returns {Cmd[]} */
export function circle(cx, cy, r) {
  const k = r * KAPPA;
  return [
    ['M', cx + r, cy],
    ['C', cx + r, cy + k, cx + k, cy + r, cx, cy + r],
    ['C', cx - k, cy + r, cx - r, cy + k, cx - r, cy],
    ['C', cx - r, cy - k, cx - k, cy - r, cx, cy - r],
    ['C', cx + k, cy - r, cx + r, cy - k, cx + r, cy],
    ['Z'],
  ];
}

/** @param {[number, number][]} segs pairs of points @returns {Cmd[]} */
function lines(...segs) {
  /** @type {Cmd[]} */
  const out = [];
  for (const [[x1, y1], [x2, y2]] of segs) out.push(['M', x1, y1], ['L', x2, y2]);
  return out;
}

/**
 * Orthogonal polyline whose corners are rounded with quarter circles of radius `r`
 * (smaller where a segment is short). r = 0 gives sharp corners.
 * @param {[number, number][]} pts
 * @param {number} r
 * @returns {Cmd[]}
 */
export function polyline(pts, r) {
  /** @type {Cmd[]} */
  const out = [['M', pts[0][0], pts[0][1]]];
  const last = pts.length - 1;
  for (let i = 1; i < last; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const lin = Math.hypot(x1 - x0, y1 - y0);
    const lout = Math.hypot(x2 - x1, y2 - y1);
    const room = Math.min(i === 1 ? lin : lin / 2, i + 1 === last ? lout : lout / 2);
    const rr = Math.min(r, room);
    if (rr < 0.5 || lin === 0 || lout === 0) {
      out.push(['L', x1, y1]);
      continue;
    }
    const [ix, iy] = [(x1 - x0) / lin, (y1 - y0) / lin];
    const [ox, oy] = [(x2 - x1) / lout, (y2 - y1) / lout];
    const s = [x1 - ix * rr, y1 - iy * rr];
    const e = [x1 + ox * rr, y1 + oy * rr];
    const k = rr * KAPPA;
    out.push(['L', s[0], s[1]], ['C', s[0] + ix * k, s[1] + iy * k, e[0] - ox * k, e[1] - oy * k, e[0], e[1]]);
  }
  out.push(['L', pts[last][0], pts[last][1]]);
  return out;
}

/** Filled triangle with its tip at (x, y), pointing along (dx, dy). @returns {Cmd[]} */
export function arrowHead(x, y, dx, dy, len, half) {
  const bx = x - dx * len;
  const by = y - dy * len;
  return [['M', x, y], ['L', bx - dy * half, by + dx * half], ['L', bx + dy * half, by - dx * half], ['Z']];
}

/** @param {Cmd[]} cmds @param {(x: number, y: number) => [number, number]} fn @returns {Cmd[]} */
export function mapPoints(cmds, fn) {
  return cmds.map((c) => {
    if (c[0] === 'Z') return c;
    const out = [c[0]];
    for (let i = 1; i < c.length; i += 2) out.push(...fn(/** @type {number} */ (c[i]), /** @type {number} */ (c[i + 1])));
    return /** @type {Cmd} */ (out);
  });
}

// ---- 그리는 판 ----

/**
 * Collects Scene items and the strings drawn. Every string goes through `text`, which shapes it with the
 * role's own font chain and turns glyphs no font has into errors that name where the string is.
 * Every stroked item gets the style's line cap and join.
 * @param {Fonts} fonts
 * @param {string[]} errors
 * @param {Style} S
 */
export function createPainter(fonts, errors, S) {
  /** @type {Item[]} */
  const items = [];
  /** @type {string[]} */
  const texts = [];
  /** @type {Map<string, number>} */
  const widths = new Map();

  /** @param {Role} role @param {string} str @param {number} size */
  const measure = (role, str, size) => {
    const key = `${role}\u0000${size}\u0000${str}`;
    let w = widths.get(key);
    if (w === undefined) {
      w = shapeText(fonts, role, str, size, 0, 0).width;
      widths.set(key, w);
    }
    return w;
  };

  /**
   * @param {Role} role @param {string} str @param {number} size @param {number} x @param {number} baseline
   * @param {string} fill
   * @param {{ where: string, map?: (x: number, y: number) => [number, number], record?: boolean }} o
   */
  const text = (role, str, size, x, baseline, fill, o) => {
    if (!str) return 0;
    const r = shapeText(fonts, role, str, size, x, baseline);
    for (const m of r.missing) {
      const msg = `${o.where}: no font has ${m}`;
      if (!errors.includes(msg)) errors.push(msg);
    }
    const cmds = o.map ? mapPoints(r.cmds, o.map) : r.cmds;
    if (cmds.length) items.push({ cmds, fill });
    if (o.record !== false) texts.push(str);
    return r.width;
  };

  /** @param {Item} item */
  const add = (item) => {
    if (!item.cmds.length) return;
    if (item.stroke) {
      item.cap = S.line.cap;
      item.join = S.line.join;
    }
    items.push(item);
  };

  return { items, texts, measure, text, add };
}

/** @typedef {ReturnType<typeof createPainter>} Painter */

// ---- 둘레 ----

/**
 * @param {Painter} p @param {Style} S @param {number} W @param {number} H
 * @param {{ slug: string, slugShort: string, slugSize: number, slugWhere: string }} info
 */
export function drawFrame(p, S, W, H, info) {
  const { ink, ink2 } = TOKENS;
  if (S.frame === 'block') {
    p.add({ cmds: rect(8, 8, W - 16, H - 16), stroke: ink, width: 3 });
    p.add({ cmds: rect(14, 14, W - 28, H - 28), stroke: ink, width: 0.8 });
    return;
  }
  if (S.frame !== 'proof') return;
  const T = 16; // 재단선 자리
  for (const [cx, dx] of [[T, -1], [W - T, 1]]) {
    for (const [cy, dy] of [[T, -1], [H - T, 1]]) {
      p.add({
        cmds: lines([[cx, cy + dy * 4], [cx, cy + dy * 15]], [[cx + dx * 4, cy], [cx + dx * 15, cy]]),
        stroke: ink,
        width: 0.6,
      });
    }
  }
  for (const cy of [T / 2, H - T / 2]) {
    p.add({ cmds: circle(W / 2, cy, 4), stroke: ink, width: 0.6 });
    p.add({ cmds: lines([[W / 2 - 7, cy], [W / 2 + 7, cy]], [[W / 2, cy - 7], [W / 2, cy + 7]]), stroke: ink, width: 0.6 });
  }
  // 먹 농도 견본 K100~K10, 오른쪽 아래 여백
  const size = info.slugSize;
  const steps = [1, 0.75, 0.5, 0.25, 0.1];
  const labels = steps.map((a) => `K${Math.round(a * 100)}`);
  const widths = labels.map((l) => p.measure('mono', l, size - 1));
  const sw = 18;
  const total = widths.reduce((a, w) => a + sw + 3 + w + 6, 0) - 6;
  let x = W - INSET - total;
  const base = H - 5;
  steps.forEach((a, i) => {
    p.add({ cmds: rect(x, base - 6, sw, 6), fill: blend(ink, a, S.background) });
    p.text('mono', labels[i], size - 1, x + sw + 3, base, ink2, { where: 'frame' });
    x += sw + 3 + widths[i] + 6;
  });
  // 판 정보 줄, 왼쪽 아래 여백. 맞춤표 앞에서 끝나야 한다.
  const room = W / 2 - 14 - INSET;
  const slug = p.measure('mono', info.slug, size) <= room ? info.slug : info.slugShort;
  if (p.measure('mono', slug, size) <= room) p.text('mono', slug, size, INSET, base, ink2, { where: info.slugWhere });
}

// ---- 줄 이름 ----

/**
 * Row label in the left margin strip [x, x + size]: Hangul stacked upright, anything else turned to read upward.
 * @param {Painter} p @param {Style} S @param {string} label @param {boolean} stack
 * @param {number} x @param {number} midY @param {number} size
 */
export function drawRowLabel(p, S, label, stack, x, midY, size) {
  const role = S.fonts.label;
  const { ink } = TOKENS;
  if (stack) {
    const chars = [...label];
    const step = size * 1.1;
    const top = midY - ((chars.length - 1) * step + 0.9 * size) / 2;
    chars.forEach((ch, i) => {
      const w = p.measure(role, ch, size);
      p.text(role, ch, size, x + (size - w) / 2, top + 0.8 * size + i * step, ink, { where: 'row label', record: false });
    });
    p.texts.push(label);
    return;
  }
  const w = p.measure(role, label, size);
  const x0 = x + 0.8 * size;
  const y0 = midY + w / 2;
  p.text(role, label, size, 0, 0, ink, { where: 'row label', map: (u, v) => [x0 + v, y0 - u] });
}

// ---- 상자 ----

/**
 * Where the two tags on a box's top border sit: the kind tag at the left, the timeline badge (if any) at the right.
 * Layout keeps arrival points clear of both.
 * @param {Painter} p @param {Style} S @param {Box} b @param {string} kind @param {string | null} badge @param {number} size
 */
export function tagRects(p, S, b, kind, badge, size) {
  const { h, rise } = badgeMetrics(size);
  const kw = p.measure('mono', kind, size) + 10;
  const kindRect = { x: b.x + 10, y: b.y - rise, w: kw, h };
  if (!badge) return { kind: kindRect, badge: null };
  const bw = p.measure(S.fonts.badge, badge, size) + 12;
  return { kind: kindRect, badge: { x: b.x + b.w - 10 - bw, y: b.y - rise, w: bw, h } };
}

/**
 * @param {Painter} p @param {Style} S @param {Box} b
 * @param {{ id: string, lines: string[], kind: string, sub: string, subSize: number, side: boolean, focal: boolean,
 *   unverified: boolean, badge: string | null, tagSize: number }} v
 */
export function drawBox(p, S, b, v) {
  const look = v.focal
    ? { fill: S.focal.fill, stroke: S.focal.stroke, width: S.focal.width, text: S.focal.text, sub: S.focal.sub }
    : v.side
      ? { fill: S.side.fill, stroke: S.side.stroke, width: S.node.width, text: S.node.text, sub: S.node.sub }
      : S.node;
  /** @type {Item} */
  const item = { cmds: roundRect(b.x, b.y, b.w, b.h, S.node.radius), fill: look.fill, stroke: look.stroke, width: look.width };
  if (v.unverified) item.dash = [6, 4];
  p.add(item);
  const where = `node "${v.id}"`;
  const tags = tagRects(p, S, b, v.kind, v.badge, v.tagSize);
  drawKindTag(p, S, tags.kind, v.kind, v.tagSize, where);
  if (v.badge && tags.badge) drawBadge(p, S, tags.badge, v.badge, v.tagSize, where);
  const cx = b.x + b.w / 2;
  // 아래 줄은 상자 아래 변에 붙여 한 줄의 상자끼리 맞춘다. 이름이 줄 높이보다 짧으면 남는 자리 가운데에 둔다.
  const room = Math.max(1, Math.round((b.h - boxHeight(1, v.subSize)) / BOX.line) + 1);
  let base = b.y + BOX.padTop + BOX.ascent + ((room - v.lines.length) * BOX.line) / 2;
  v.lines.forEach((line, i) => {
    if (i > 0) base += BOX.line;
    p.text('bodyBold', line, NAME_SIZE, cx - p.measure('bodyBold', line, NAME_SIZE) / 2, base, look.text, { where });
  });
  const sb = b.y + b.h - BOX.padBottom - 0.25 * v.subSize;
  p.text('mono', v.sub, v.subSize, cx - p.measure('mono', v.sub, v.subSize) / 2, sb, look.sub, { where });
}

/** The kind tag cuts the top border like a label on a folder: background fill, no frame, mono text.
 * @param {Painter} p @param {Style} S @param {Box} r @param {string} label @param {number} size @param {string} where */
function drawKindTag(p, S, r, label, size, where) {
  p.add({ cmds: rect(r.x, r.y, r.w, r.h), fill: S.background });
  p.text('mono', label, size, r.x + 5, r.y + r.h / 2 + 0.35 * size, TOKENS.ink2, { where });
}

/** @param {Painter} p @param {Style} S @param {Box} r @param {string} label @param {number} size @param {string} where */
function drawBadge(p, S, r, label, size, where) {
  const { ink } = TOKENS;
  const role = S.fonts.badge;
  const tw = p.measure(role, label, size);
  const { x, y, w, h } = r;
  if (S.badge === 'stamp') {
    p.add({ cmds: rect(x, y, w, h), fill: S.background, stroke: ink, width: 2 });
    p.add({ cmds: rect(x + 2.5, y + 2.5, w - 5, h - 5), stroke: ink, width: 0.8 });
  } else {
    p.add({ cmds: roundRect(x, y, w, h, S.node.radius > 0 ? 2 : 0), fill: S.background, stroke: ink, width: 0.8 });
  }
  p.text(role, label, size, x + (w - tw) / 2, y + h / 2 + 0.35 * size, ink, { where });
}

// ---- 연결선 ----

/**
 * Draws the line through `points` and a filled arrowhead whose tip is the last point.
 * @param {Painter} p @param {Style} S @param {[number, number][]} points @param {number[] | undefined} dash
 */
export function drawEdge(p, S, points, dash) {
  const { color, width, radius, arrow, arrowHalf } = S.edge;
  const pts = points.map(([x, y]) => /** @type {[number, number]} */ ([x, y]));
  const n = pts.length;
  const [x1, y1] = pts[n - 2];
  const [x2, y2] = pts[n - 1];
  const len = Math.hypot(x2 - x1, y2 - y1);
  const dx = (x2 - x1) / len;
  const dy = (y2 - y1) / len;
  const trim = Math.min(arrow - 1, len);
  pts[n - 1] = [x2 - dx * trim, y2 - dy * trim];
  /** @type {Item} */
  const line = { cmds: polyline(pts, radius), stroke: color, width };
  if (dash) line.dash = dash;
  p.add(line);
  p.add({ cmds: arrowHead(x2, y2, dx, dy, arrow, arrowHalf), fill: color });
}

/** @param {{ type: string, status: string }} e */
export const edgeDash = (e) => (e.type === 'enables' ? [2, 5] : e.status === 'inferred' ? [8, 6] : undefined);

// ---- 범례 ----

/** @param {Painter} p @param {{ key: LegendKey, label: string }[]} entries @param {number} size */
export function legendWidth(p, entries, size) {
  let w = 0;
  for (const [i, e] of entries.entries()) {
    w += (isLine(e.key) ? LEGEND.line : LEGEND.box) + LEGEND.textGap + p.measure('body', e.label, size);
    if (i > 0) w += LEGEND.itemGap;
  }
  return w;
}

/** @param {LegendKey} k */
const isLine = (k) => k === 'confirmed' || k === 'inferred' || k === 'condition';

/**
 * @param {Painter} p @param {Style} S @param {{ key: LegendKey, label: string }[]} entries
 * @param {number} x @param {number} midY @param {number} size
 */
export function drawLegend(p, S, entries, x, midY, size) {
  const { ink, ink2 } = TOKENS;
  for (const e of entries) {
    const top = midY - LEGEND.boxH / 2;
    const sw = isLine(e.key) ? LEGEND.line : LEGEND.box;
    if (isLine(e.key)) {
      /** @type {Item} */
      const line = { cmds: lines([[x, midY], [x + sw, midY]]), stroke: S.edge.color, width: S.edge.width };
      const dash = edgeDash({ type: e.key === 'condition' ? 'enables' : 'lineage', status: e.key });
      if (dash) line.dash = dash;
      p.add(line);
    } else if (e.key === 'timeline') {
      if (S.badge === 'stamp') {
        p.add({ cmds: rect(x, top, sw, LEGEND.boxH), fill: S.background, stroke: ink, width: 1.6 });
        p.add({ cmds: rect(x + 2.5, top + 2.5, sw - 5, LEGEND.boxH - 5), stroke: ink, width: 0.6 });
      } else {
        p.add({ cmds: rect(x, top, sw, LEGEND.boxH), fill: S.background, stroke: ink, width: 0.8 });
      }
    } else {
      const look =
        e.key === 'focal' ? S.focal : e.key === 'side' ? { ...S.side, width: S.node.width } : S.node;
      /** @type {Item} */
      const box = {
        cmds: roundRect(x, top, sw, LEGEND.boxH, Math.min(S.node.radius, 2)),
        fill: look.fill,
        stroke: look.stroke,
        width: Math.min(look.width, 1.6),
      };
      if (e.key === 'unverified') box.dash = [4, 3];
      p.add(box);
    }
    x += sw + LEGEND.textGap;
    x += p.text('body', e.label, size, x, midY + 0.35 * size, ink2, { where: 'legend' }) + LEGEND.itemGap;
  }
}
