import type { Content } from './content.ts';
import {
  daysBetween, fraction, formatSpan, formatItemDate, formatDot, formatLong, formatMonthLong,
  formatYYMM, formatDate, type Locale,
} from './dates.ts';
import { uiFor } from '../i18n/index.ts';

export interface ItemView { date: string; label: string; text: string }
export interface SceneView {
  id: string; index: number; no: string; when: string; kicker: string; title: string; lede: string;
  items: ItemView[]; glyph: string; pattern: string; angle?: number; motif: string; seed: number;
  bar: string; p: number; year: string; aria: string;
}
export interface YearView { year: string; title: string; body: string; countLine: string; bar: string; p: number }
export type Block = { kind: 'year'; year: YearView } | { kind: 'scene'; scene: SceneView };
export interface PageView {
  lang: Locale; title: string; description: string; ogTitle: string; ogDescription: string;
  barTitle: string; barStart: string; heroName: string; heroRange: string; heroSr: string;
  heroWide: string; heroTall: string; heroLines: string[]; lede: string; cue: string;
  blocks: Block[]; scenes: SceneView[];
  rail: { nav: string; labels: { text: string; top: string }[]; ticks: { i: number; top: string; aria: string }[] };
  outro: {
    bar: string; eyebrow: string; title: string; arcs: { span: string; title: string; body: string }[];
    ledgerTitle: string; ledgerNote: string; ledger: { lab: string; models: { name: string; date: string }[] }[];
    sourcesTitle: string; sourcesNote: string; sources: { url: string; title: string }[]; end: [string, string];
  };
}

export function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => {
    if (!(k in vars)) throw new Error(`Unknown template key {${k}} in "${tpl}"`);
    return vars[k];
  });
}

function need<T>(v: T | undefined, what: string): T {
  if (v === undefined) throw new Error(`Missing ${what}`);
  return v;
}

const pct = (x: number) => (x * 100).toFixed(2) + '%';

export function buildView(c: Content, locale: Locale): PageView {
  const t = uiFor(locale);
  const { site } = c;
  const st = need(site[locale], `site.${locale}`);
  const days = daysBetween(site.start, site.asOf).toLocaleString('en-US');
  const count = c.scenes.length;
  const startDot = formatDot(site.start), asOfDot = formatDot(site.asOf);
  const vars = {
    days, count: String(count), startDot, asOfDot,
    startLong: formatLong(locale, site.start), asOfLong: formatLong(locale, site.asOf),
    asOfMonthLong: formatMonthLong(locale, site.asOf),
  };
  const fr = (d: string) => fraction(d, site.start, site.asOf);

  const scenes: SceneView[] = c.scenes.map((s, i) => {
    const text = need(s[locale], `${s.id}.${locale}`);
    const when = formatSpan(locale, s.span);
    const year = s.date.slice(0, 4);
    return {
      id: s.id, index: i, no: t.plateNo(i + 1), when,
      kicker: text.kicker, title: text.title, lede: text.lede,
      items: s.items.map((it, k) => ({
        date: it.date,
        label: formatItemDate(locale, it.date, +year),
        text: need(it[locale], `${s.id}.items.${k}.${locale}`),
      })),
      glyph: text.glyph ?? s.print.glyph, pattern: s.print.pattern, angle: s.print.angle, motif: s.print.motif,
      seed: i,                                   // 1단계: 원본과 같은 순번 시드 (스펙 6절)
      bar: t.barScene(when, i + 1, count), p: fr(s.date), year,
      aria: t.railLabel(i + 1, when, text.title.replace(/"/g, '')),
    };
  });

  const blocks: Block[] = [];
  const seen = new Set<string>();
  for (const s of scenes) {
    if (!seen.has(s.year)) {
      seen.add(s.year);
      const yt = c.years[s.year]?.[locale];
      if (yt) {
        const list = scenes.filter(x => x.year === s.year);
        blocks.push({ kind: 'year', year: {
          year: s.year, title: yt.title, body: yt.body,
          countLine: t.yearCount(list.length, list[0].index + 1, list[list.length - 1].index + 1),
          bar: t.barYear(s.year, list.length), p: fr(`${s.year}-01-01`),
        } });
      }
    }
    blocks.push({ kind: 'scene', scene: s });
  }

  const startYear = site.start.slice(0, 4);
  const railYears = [...new Set(scenes.map(s => s.year))].filter(y => y > startYear);
  const heroWide = fill(st.heroGlyph.wide, vars), heroTall = fill(st.heroGlyph.tall, vars);
  const title = t.title(days);

  return {
    lang: locale, title,
    description: fill(st.description, vars), ogTitle: title, ogDescription: fill(st.ogDescription, vars),
    barTitle: title, barStart: startDot,
    heroName: site.name, heroRange: `${startDot} → ${asOfDot}`, heroSr: t.heroSr,
    heroWide, heroTall, heroLines: heroTall.split('\n'),
    lede: fill(st.lede, vars), cue: t.cue,
    blocks, scenes,
    rail: {
      nav: t.railNav,
      labels: [
        { text: formatYYMM(site.start), top: '0' },
        ...railYears.map(y => ({ text: y, top: pct(fr(`${y}-01-01`)) })),
        { text: formatYYMM(site.asOf), top: '100%' },
      ],
      ticks: scenes.map(s => ({ i: s.index, top: pct(s.p), aria: s.aria })),
    },
    outro: {
      bar: t.barEnd(asOfDot), eyebrow: t.outroEyebrow(asOfDot), title: t.outroTitle(days),
      arcs: c.arcs.map(a => {
        const at = need(a[locale], `arc.${locale}`);
        return { span: formatDate(locale, a.from) + (a.to ? ' – ' + formatDate(locale, a.to) : ''), title: at.title, body: at.body };
      }),
      ledgerTitle: t.ledgerTitle, ledgerNote: st.ledgerNote,
      ledger: c.ledger.map(l => ({ lab: need(l.lab[locale], `ledger.lab.${locale}`), models: l.models.map(m => ({ name: m.name, date: formatYYMM(m.date) })) })),
      sourcesTitle: t.sourcesTitle, sourcesNote: fill(st.sourcesNote, vars),
      sources: c.sources.map(s => ({ url: s.url, title: s.title })),
      end: [t.endCount(count, startDot, asOfDot), title],
    },
  };
}
