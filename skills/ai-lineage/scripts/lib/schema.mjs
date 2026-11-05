// Data checks for a lineage file. No dependencies, no font or layout needed.

/** @typedef {'ko'|'en'} Lang */
/** @typedef {'root'|'revival'|'merge'|'spread'} Row */
/** @typedef {'paper'|'model'|'hardware'|'release'|'dataset'|'other'} Kind */
/** @typedef {{ title: string, by?: string, year?: number, venue?: string, url: string, opened: boolean, original?: string }} Source */
/** @typedef {{ id: string, row: Row, kind: Kind, side?: boolean, name: string, sub?: string, date: string,
 *   sources: Source[], timeline?: { id: string, url: string } | null }} LNode */
/** @typedef {{ from: string, to: string, type: 'lineage'|'merge'|'enables', status: 'confirmed'|'inferred',
 *   evidence?: { node: string, where: string } }} LEdge */
/** @typedef {'woodcut'|'soft'|'proof'} StyleId */
/** @typedef {{ schema: 1, subject: string, title: string, lang: Lang, researched: string,
 *   style?: StyleId, credit?: boolean, nodes: LNode[], edges: LEdge[],
 *   focal?: { node: string, note: string }, omitted?: string[], notes?: string }} Lineage */

export const TIMELINE_START = '2022-11-30';
export const MAX_NODES = 9;

const DATE_RE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;
const FULL_DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const ROWS = ['root', 'revival', 'merge', 'spread'];
const KINDS = ['paper', 'model', 'hardware', 'release', 'dataset', 'other'];
const EDGE_TYPES = ['lineage', 'merge', 'enables'];
const STATUSES = ['confirmed', 'inferred'];
const STYLES = ['woodcut', 'soft', 'proof'];

/** @param {unknown} v @returns {v is Record<string, any>} */
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
/** @param {unknown} v */
const isStr = (v) => typeof v === 'string' && v.trim() !== '';
/** @param {unknown} v */
const validDate = (v) => typeof v === 'string' && DATE_RE.test(v);

/**
 * Pads a valid date to YYYY-MM-DD with -01 for the missing parts.
 * @param {string} date
 * @returns {string}
 */
export function dateKey(date) {
  const parts = String(date).split('-');
  while (parts.length < 3) parts.push('01');
  return parts.slice(0, 3).join('-');
}

/**
 * @param {unknown} data
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validate(data) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  if (!isObj(data)) {
    return { errors: ['data must be a JSON object'], warnings };
  }

  if (data.schema !== 1) errors.push('schema must be 1');
  if (!isStr(data.subject)) errors.push('subject must be a non-empty string');
  if (!isStr(data.title)) errors.push('title must be a non-empty string');
  if (data.lang !== 'ko' && data.lang !== 'en') errors.push('lang must be "ko" or "en"');
  if (typeof data.researched !== 'string' || !FULL_DATE_RE.test(data.researched)) {
    errors.push('researched must be a full date (YYYY-MM-DD)');
  }
  if (data.style !== undefined && !STYLES.includes(data.style)) {
    errors.push(`style must be one of ${STYLES.join(', ')}`);
  }
  if (data.credit !== undefined && typeof data.credit !== 'boolean') {
    errors.push('credit must be a boolean');
  }

  const nodes = Array.isArray(data.nodes) ? data.nodes : null;
  if (!nodes) errors.push('nodes must be an array');
  else if (nodes.length === 0) errors.push('nodes must not be empty');
  else if (nodes.length > MAX_NODES) errors.push(`at most ${MAX_NODES} nodes are allowed, found ${nodes.length}`);

  /** @type {Map<string, Record<string, any>>} */
  const byId = new Map();
  for (const [i, n] of (nodes ?? []).entries()) {
    if (!isObj(n)) {
      errors.push(`nodes[${i}] must be an object`);
      continue;
    }
    const hasId = typeof n.id === 'string' && ID_RE.test(n.id);
    const at = hasId ? `node "${n.id}"` : `nodes[${i}]`;
    if (!hasId) errors.push(`${at}: node id must match ${ID_RE}`);
    else if (byId.has(n.id)) errors.push(`${at}: duplicate node id`);
    else byId.set(n.id, n);

    if (!ROWS.includes(n.row)) errors.push(`${at}: row must be one of ${ROWS.join(', ')}`);
    if (!KINDS.includes(n.kind)) errors.push(`${at}: kind must be one of ${KINDS.join(', ')}`);
    if (n.side !== undefined && typeof n.side !== 'boolean') errors.push(`${at}: side must be a boolean`);
    if (!isStr(n.name)) errors.push(`${at}: name must be a non-empty string`);
    if (n.sub !== undefined && typeof n.sub !== 'string') errors.push(`${at}: sub must be a string`);
    if (!validDate(n.date)) errors.push(`${at}: date must be YYYY, YYYY-MM or YYYY-MM-DD`);

    if (!Array.isArray(n.sources) || n.sources.length === 0) {
      errors.push(`${at}: no source, at least one is required`);
    } else {
      for (const [j, s] of n.sources.entries()) {
        const sat = `${at} source ${j + 1}`;
        if (!isObj(s)) {
          errors.push(`${sat}: must be an object`);
          continue;
        }
        if (!isStr(s.title)) errors.push(`${sat}: title must be a non-empty string`);
        if (typeof s.url !== 'string' || !/^https?:\/\/\S+$/.test(s.url)) {
          errors.push(`${sat}: url must start with http:// or https://`);
        }
        if (typeof s.opened !== 'boolean') errors.push(`${sat}: opened must be true or false`);
        if (s.year !== undefined && !Number.isInteger(s.year)) errors.push(`${sat}: year must be an integer`);
        for (const k of ['by', 'venue', 'original']) {
          if (s[k] !== undefined && typeof s[k] !== 'string') errors.push(`${sat}: ${k} must be a string`);
        }
      }
      if (n.sources.every((s) => isObj(s) && s.opened === false)) {
        warnings.push(`${at}: not verified, no source was opened`);
      }
    }

    if (n.timeline !== undefined && n.timeline !== null) {
      if (!isObj(n.timeline) || !isStr(n.timeline.id) || !isStr(n.timeline.url)) {
        errors.push(`${at}: timeline must be null or { id, url }`);
      } else if (validDate(n.date) && dateKey(n.date) < TIMELINE_START) {
        errors.push(`${at}: timeline is not allowed before ${TIMELINE_START}`);
      }
    }
  }

  const edges = Array.isArray(data.edges) ? data.edges : null;
  if (!edges) errors.push('edges must be an array');
  const seen = new Set();
  const touched = new Set();
  for (const [i, e] of (edges ?? []).entries()) {
    if (!isObj(e)) {
      errors.push(`edges[${i}] must be an object`);
      continue;
    }
    const at = `edge ${e.from} -> ${e.to}`;
    if (!EDGE_TYPES.includes(e.type)) errors.push(`${at}: type must be one of ${EDGE_TYPES.join(', ')}`);
    if (!STATUSES.includes(e.status)) errors.push(`${at}: status must be one of ${STATUSES.join(', ')}`);
    let ok = true;
    for (const end of ['from', 'to']) {
      if (!byId.has(e[end])) {
        errors.push(`${at}: unknown node in ${end} "${e[end]}"`);
        ok = false;
      }
    }
    if (e.from === e.to) errors.push(`${at}: self edge`);
    const key = `${e.from}\u0000${e.to}\u0000${e.type}`;
    if (seen.has(key)) errors.push(`${at}: duplicate edge (${e.type})`);
    seen.add(key);
    if (ok) {
      touched.add(e.from);
      touched.add(e.to);
    }
    if (e.status === 'confirmed') {
      const ev = e.evidence;
      if (!isObj(ev) || !isStr(ev.node) || !isStr(ev.where)) {
        errors.push(`${at}: confirmed edge needs evidence { node, where }`);
      }
    }
    if (e.evidence !== undefined && isObj(e.evidence) && e.evidence.node !== e.from && e.evidence.node !== e.to) {
      errors.push(`${at}: evidence.node must be the from or to node`);
    }
    if (ok && e.type === 'lineage') {
      const a = byId.get(e.from)?.date;
      const b = byId.get(e.to)?.date;
      if (validDate(a) && validDate(b) && dateKey(b) < dateKey(a)) {
        warnings.push(`${at}: target is dated earlier than its source`);
      }
    }
  }

  if (data.focal !== undefined) {
    if (!isObj(data.focal) || !isStr(data.focal.note)) {
      errors.push('focal must be { node, note }');
    } else if (!byId.has(data.focal.node)) {
      errors.push(`focal node "${data.focal.node}" does not exist`);
    }
  }
  if (data.omitted !== undefined && (!Array.isArray(data.omitted) || data.omitted.some((s) => !isStr(s)))) {
    errors.push('omitted must be an array of strings');
  }
  if (data.notes !== undefined && typeof data.notes !== 'string') errors.push('notes must be a string');

  if (edges) {
    for (const id of byId.keys()) {
      if (!touched.has(id)) warnings.push(`node "${id}": no edges`);
    }
  }
  if (nodes && nodes.length === MAX_NODES && (!Array.isArray(data.omitted) || data.omitted.length === 0)) {
    warnings.push(`${MAX_NODES} nodes and omitted is empty: list what was left out`);
  }

  return { errors, warnings };
}
