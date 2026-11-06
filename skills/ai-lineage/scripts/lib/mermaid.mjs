// 계보 데이터를 Mermaid flowchart로 옮긴다. 같은 입력이면 같은 문자열이다.
import { ROW_ORDER, clean } from './layout.mjs';
import { dateKey } from './schema.mjs';
import { STRINGS } from './strings.mjs';
import { TOKENS } from './styles.mjs';

/** @typedef {import('./schema.mjs').Lineage} Lineage */

const cmp = (/** @type {string} */ a, /** @type {string} */ b) => (a < b ? -1 : a > b ? 1 : 0);
const nid = (/** @type {string} */ id) => `n_${id.replaceAll('-', '_')}`;
const dotDate = (/** @type {string} */ d) => d.replaceAll('-', '.');
const esc = (/** @type {string} */ s) => clean(s).replaceAll('"', '#quot;').replace(/[<>]/g, (c) => (c === '<' ? '#lt;' : '#gt;'));

/** @param {Lineage} data */
export function toMermaid(data) {
  const S = STRINGS[data.lang];
  const out = ['flowchart TB'];
  /** @type {Lineage['nodes']} */
  const ordered = [];
  for (const row of ROW_ORDER) {
    const nodes = data.nodes
      .filter((n) => n.row === row)
      .sort((a, b) => cmp(dateKey(a.date), dateKey(b.date)) || cmp(a.id, b.id));
    if (!nodes.length) continue;
    ordered.push(...nodes);
    out.push(`  subgraph row_${row}["${esc(S.rows[row])}"]`);
    for (const n of nodes) out.push(`    ${nid(n.id)}["${esc(n.name)}<br/>${dotDate(n.date)}"]`);
    out.push('  end');
  }
  for (const e of data.edges) {
    const arrow = e.status === 'confirmed' && e.type !== 'enables' ? '-->' : '-.->';
    out.push(`  ${nid(e.from)} ${arrow} ${nid(e.to)}`);
  }
  const focal = data.focal?.node;
  for (const n of ordered) {
    if (n.id === focal) out.push(`  class ${nid(n.id)} focal`);
    else if (n.side) out.push(`  class ${nid(n.id)} side`);
  }
  out.push(`  classDef focal fill:${TOKENS.ink},color:${TOKENS.paper},stroke:${TOKENS.ink}`);
  out.push(`  classDef side fill:${TOKENS.wood},color:${TOKENS.ink},stroke:${TOKENS.ink}`);
  return `${out.join('\n')}\n`;
}
