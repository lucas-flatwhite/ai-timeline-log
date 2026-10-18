import { z } from 'astro/zod';
import { normalizeDate } from './dates.ts';

const isoDate = z.union([z.string(), z.number(), z.date()]).transform((v, ctx) => {
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
  sources: z.array(z.object({ url: z.url(), title: text, publisher: z.string().optional() })).default([]),
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
export const sourcesSchema = z.array(z.object({ url: z.url(), title: text }));

export type Scene = z.output<typeof sceneSchema>;
export type Site = z.output<typeof siteSchema>;
export type Years = z.output<typeof yearsSchema>;
export type Arc = z.output<typeof arcsSchema>[number];
export type Lab = z.output<typeof ledgerSchema>[number];
export type Source = z.output<typeof sourcesSchema>[number];
