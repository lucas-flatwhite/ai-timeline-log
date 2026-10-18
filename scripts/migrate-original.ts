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
