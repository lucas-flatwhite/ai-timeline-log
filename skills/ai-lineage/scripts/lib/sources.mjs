// 출처 목록(Markdown). url 기준으로 번호를 한 번만 매긴다.
import { STRINGS } from './strings.mjs';
import { clean } from './layout.mjs';

/** @typedef {import('./schema.mjs').Lineage} Lineage */
/** @typedef {import('./schema.mjs').Source} Source */

const HEAD = {
  en: { sources: 'Sources', links: 'Links and evidence', unverified: 'Sources not verified', omitted: 'Omitted', researched: 'Researched', notes: 'Notes', timeline: 'AI Timeline Log' },
  ko: { sources: '출처', links: '관계와 근거', unverified: '확인 못 한 출처', omitted: '뺀 것', researched: '조사한 날', notes: '메모', timeline: 'AI Timeline Log' },
};

/** One line of plain text with no raw HTML. @param {unknown} s */
const txt = (s) => clean(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
const stop = (/** @type {string} */ s) => (/[.!?]$/.test(s) ? s : `${s}.`);

/** @param {Source} s */
function line(s) {
  const year = s.year ? `(${s.year})` : '';
  const head = s.by ? [txt(s.by), year].filter(Boolean).join(' ') : '';
  const title = [txt(s.title), s.original ? `(${txt(s.original)})` : '', s.by ? '' : year].filter(Boolean).join(' ');
  const parts = [head ? stop(head) : '', stop(title), s.venue ? stop(txt(s.venue)) : '', s.url].filter(Boolean);
  return parts.join(' ');
}

/** @param {Lineage} data */
export function toSourcesMd(data) {
  const H = HEAD[data.lang];
  const L = STRINGS[data.lang].legend;
  /** @type {Map<string, {n: number, s: Source}>} */
  const byUrl = new Map();
  for (const nd of data.nodes) {
    for (const s of nd.sources) if (!byUrl.has(s.url)) byUrl.set(s.url, { n: byUrl.size + 1, s });
  }
  const name = (/** @type {string} */ id) => txt(data.nodes.find((n) => n.id === id)?.name ?? id);
  const refs = (/** @type {string} */ id) => {
    const nd = data.nodes.find((n) => n.id === id);
    const nums = [...new Set((nd?.sources ?? []).map((s) => byUrl.get(s.url)?.n))].filter(Boolean);
    return nums.length ? `[${nums.join(', ')}]` : '';
  };

  const out = [`# ${txt(data.title)}`, '', `${H.researched}: ${data.researched}`, '', `## ${H.sources}`, ''];
  for (const { n, s } of byUrl.values()) out.push(`${n}. ${line(s)}`);

  if (data.edges.length) {
    out.push('', `## ${H.links}`, '');
    for (const e of data.edges) {
      const ev = e.evidence ? ` ${[refs(e.evidence.node), txt(e.evidence.where)].filter(Boolean).join(' ')}` : '';
      out.push(`- ${name(e.from)} -> ${name(e.to)}: ${L[e.status]}${ev ? `, ${ev.trim()}` : ''}`);
    }
  }
  const linked = data.nodes.filter((n) => n.timeline?.url);
  if (linked.length) {
    out.push('', `## ${H.timeline}`, '');
    for (const n of linked) out.push(`- ${txt(n.name)}: ${n.timeline?.url}`);
  }
  const bad = [...byUrl.values()].filter(({ s }) => s.opened === false);
  if (bad.length) {
    out.push('', `## ${H.unverified}`, '');
    for (const { n, s } of bad) out.push(`${n}. ${line(s)}`);
  }
  if (data.omitted?.length) {
    out.push('', `## ${H.omitted}`, '');
    for (const o of data.omitted) out.push(`- ${txt(o)}`);
  }
  const notes = typeof data.notes === 'string' ? data.notes.trim() : '';
  if (notes) out.push('', `## ${H.notes}`, '', notes.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  return `${out.join('\n')}\n`;
}
