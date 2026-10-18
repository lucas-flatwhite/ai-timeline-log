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
