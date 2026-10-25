import { z } from 'astro/zod';
import { normalizeDate } from './dates.ts';

const isoDate = z.union([z.string(), z.number(), z.date()]).transform((v, ctx) => {
  try { return normalizeDate(v); }
  catch (e) { ctx.addIssue({ code: 'custom', message: (e as Error).message }); return z.NEVER; }
});
const dayDate = isoDate.refine(s => /^\d{4}-\d{2}-\d{2}$/.test(s), 'Expected YYYY-MM-DD');
const monthDate = isoDate.refine(s => /^\d{4}-\d{2}/.test(s), 'Expected YYYY-MM or YYYY-MM-DD');
const text = z.string().min(1);

const source = z.object({ url: z.url(), title: text, publisher: z.string().optional() });
// 사건 핵심어: 한 문자열이면 두 언어 공통, { ko, en }이면 언어별. 줄바꿈(\n)으로 두 줄을 나눌 수 있다.
export const glyphSpec = z.union([text, z.object({ ko: text, en: text })]);
// 사건 그림: 판화 엔진이 그리는 선(d)과 무게중심(cx, cy), 만든 방식 설명(note)
export const picSchema = z.object({ d: text, cx: z.number(), cy: z.number(), note: text });
export const picsSchema = z.record(z.string().regex(/^[a-z0-9-]+$/), picSchema);

const sceneText = z.object({ kicker: text, title: text, lede: text, glyph: text.optional() });

export const sceneSchema = z.object({
  id: z.string().regex(/^\d{4}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected YYYY-MM-slug'),
  date: dayDate,
  span: z.object({ from: monthDate, to: monthDate.optional() }).superRefine(({ from, to }, ctx) => {
    const n = Math.min(from.length, to?.length ?? 0);      // 2023-03-14 ~ 2023-03 처럼 정밀도가 다르면 공통 부분만 비교
    if (to && to.slice(0, n) < from.slice(0, n)) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: `span ends (${to}) before it starts (${from})` });
    }
  }),
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
  sources: z.array(source).default([]),
  corrections: z.array(z.object({ date: dayDate, ko: text, en: text.optional() })).default([]),
  items: z.array(z.object({
    date: isoDate, ko: text, en: text.optional(),
    glyph: glyphSpec,
    pic: z.string().optional(),
    sources: z.array(source).default([]),
  })).min(3).max(4),
  ko: sceneText,
  en: sceneText.optional(),
});

const siteText = z.object({
  heroGlyph: z.object({ wide: text, tall: text }),
  lede: text,
  description: text,
  ogDescription: text,
  ledgerNote: text,
  sourcesNote: text,
  making: text.optional(),
});
export const siteSchema = z.object({ name: text, repo: z.url(), start: dayDate, asOf: dayDate, firstEdition: dayDate, ko: siteText, en: siteText.optional() });

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
export type GlyphSpec = z.output<typeof glyphSpec>;
export type Pic = z.output<typeof picSchema>;
export type Pics = z.output<typeof picsSchema>;
export type Source = z.output<typeof sourcesSchema>[number];
