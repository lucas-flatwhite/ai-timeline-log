// 계보 데이터를 Mermaid flowchart로 옮긴다. 같은 입력이면 같은 문자열이다.
import { ROW_ORDER } from './layout.mjs';
import { STRINGS } from './strings.mjs';
import { TOKENS } from './styles.mjs';

/** @typedef {import('./schema.mjs').Lineage} Lineage */

const nid = (/** @type {string} */ id) => `n_${id.replaceAll('-', '_')}`;
const dotDate = (/** @type {string} */ d) => d.replaceAll('-', '.');
const esc = (/** @type {string} */ s) => s.replaceAll('"', '#quot;').replace(/[<>]/g, (c) => (c === '<' ? '#lt;' : '#gt;'));

/** @param {Lineage} data */
export function toMermaid(data) {
  const S = STRINGS[data.lang];
  const out = ['flowchart TB'];
  for (const row of ROW_ORDER) {
    const nodes = data.nodes.filter((n) => n.row === row);
    if (!nodes.length) continue;
    out.push(`  subgraph row_${row}["${esc(S.rows[row])}"]`);
    for (const n of nodes) out.push(`    ${nid(n.id)}["${esc(n.name)}<br/>${dotDate(n.date)}"]`);
    out.push('  end');
  }
  for (const e of data.edges) {
    const arrow = e.status === 'confirmed' && e.type !== 'enables' ? '-->' : '-.->';
    out.push(`  ${nid(e.from)} ${arrow} ${nid(e.to)}`);
  }
  const focal = data.focal?.node;
  for (const n of data.nodes) {
    if (n.id === focal) out.push(`  class ${nid(n.id)} focal`);
    else if (n.side) out.push(`  class ${nid(n.id)} side`);
  }
  out.push(`  classDef focal fill:${TOKENS.ink},color:${TOKENS.paper},stroke:${TOKENS.ink}`);
  out.push(`  classDef side fill:${TOKENS.wood},color:${TOKENS.ink},stroke:${TOKENS.ink}`);
  return `${out.join('\n')}\n`;
}
