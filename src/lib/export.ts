import type { Content, GlossaryEntry } from './content.ts';
import { formatDot, type Locale } from './dates.ts';
import { glyphFor, itemAddresses } from './grid.ts';
import { hasHangul } from './checks.ts';
import type { Edition, Scene, Topics } from './schema.ts';
import { ORIGIN } from './origin.ts';

/** 연표를 사이트 밖으로 내보내는 모양들(timeline.json, llms.txt). 사실은 Content 하나에서만 온다. */

export const LICENSE = { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' };
export const SCOPE = {
  ko: '흐름을 바꾼 사건을 골라 낸 연표이며, 모든 사건을 모은 것이 아니다. 여기 없다고 중요하지 않은 것은 아니다.',
  en: 'A curated timeline of events that changed the course of generative AI, not a complete record. An event missing here is not thereby unimportant.',
};
const ATTRIBUTION = 'AI Timeline Log (https://lucasflatwhite.com/ai-timeline-log/), CC BY 4.0';

const pagePath = (locale: Locale) => ORIGIN + (locale === 'en' ? 'en/' : '');
export function sceneUrl(locale: Locale, id: string): string {
  return `${pagePath(locale)}#${id}`;
}
export function posterUrl(repo: string, n: number, locale: Locale, ext: 'pdf' | 'png'): string {
  return `${repo}/releases/download/edition-${n}/poster-${locale}.${ext}`;
}
export function releaseUrl(repo: string, n: number): string {
  return `${repo}/releases/tag/edition-${n}`;
}
export function latestPosterEdition(c: Content): Edition | undefined {
  return c.editions.filter(e => e.poster).at(-1);
}

/** 최신순(날짜 내림차순, 같은 날이면 order 오름차순, 그다음 원래 순서) — 벽과 같은 순서 */
export function newestFirst(scenes: Scene[]): Scene[] {
  return scenes.map((s, i) => ({ s, i }))
    .sort((a, b) => (a.s.date === b.s.date ? a.s.order - b.s.order || a.i - b.i : a.s.date < b.s.date ? 1 : -1))
    .map(x => x.s);
}

interface Src { url: string; title: string; publisher?: string }
export interface TimelineJson {
  site: {
    name: string; start: string; asOf: string; repo: string; scope: typeof SCOPE;
    license: typeof LICENSE; attribution: string;
  };
  topics: Topics;
  scenes: {
    id: string; date: string; span: { from: string; to?: string }; added: string; updated?: string; topics: string[];
    url: { ko: string; en: string };
    ko: { kicker: string; title: string; lede: string }; en: { kicker: string; title: string; lede: string };
    sources: Src[]; corrections: { date: string; ko: string; en?: string }[];
    items: { addr: string; date: string; url: { ko: string; en: string }; ko: string; en: string; glyph: { ko: string; en: string }; sources: Src[] }[];
  }[];
  years: Content['years']; arcs: Content['arcs']; ledger: Content['ledger']; glossary: GlossaryEntry[]; editions: Edition[];
}

const text = (t: Scene['ko']) => ({ kicker: t.kicker, title: t.title, lede: t.lede });

export function buildTimeline(c: Content, glossary: GlossaryEntry[]): TimelineJson {
  return {
    site: {
      name: c.site.name, start: c.site.start, asOf: c.site.asOf, repo: c.site.repo,
      scope: SCOPE, license: LICENSE, attribution: ATTRIBUTION,
    },
    topics: c.topics,
    scenes: newestFirst(c.scenes).map(s => {
      const addrs = itemAddresses(s.id, s.items.map(it => it.date));
      return {
        id: s.id, date: s.date, span: s.span, added: s.added, ...(s.updated ? { updated: s.updated } : {}), topics: s.topics,
        url: { ko: sceneUrl('ko', s.id), en: sceneUrl('en', s.id) },
        ko: text(s.ko), en: text(s.en), sources: s.sources, corrections: s.corrections,
        items: s.items.map((it, k) => ({
          addr: addrs[k], date: it.date, url: { ko: sceneUrl('ko', addrs[k]), en: sceneUrl('en', addrs[k]) },
          ko: it.ko, en: it.en, glyph: { ko: glyphFor(it.glyph, 'ko'), en: glyphFor(it.glyph, 'en') }, sources: it.sources,
        })),
      };
    }),
    years: c.years, arcs: c.arcs, ledger: c.ledger, glossary, editions: c.editions,
  };
}

export function buildLlmsIndex(c: Content): string {
  const last = c.editions.at(-1);
  return [
    `# ${c.site.name}`,
    '',
    `> A bilingual (Korean and English) timeline of generative AI from the launch of ChatGPT on ${formatDot(c.site.start)} to ${formatDot(c.site.asOf)}. Each event has a date, one sentence and its sources. ${SCOPE.en}`,
    '',
    `Facts are current as of ${c.site.asOf}${last ? ` (edition ${last.n})` : ''}. Content is licensed under ${LICENSE.name} (${LICENSE.url}); credit "${ATTRIBUTION}".`,
    '',
    '## Timeline',
    '',
    `- [Full timeline in English](${ORIGIN}en/llms-full.txt): every scene and event with dates and source links`,
    `- [Full timeline in Korean](${ORIGIN}llms-full.txt): the same in Korean`,
    `- [timeline.json](${ORIGIN}timeline.json): structured data in both languages, with topics, eras, model releases and a glossary of official English names`,
    '',
    '## Optional',
    '',
    `- [RSS feed (English)](${ORIGIN}en/feed.xml): new scenes, corrections and poster editions`,
    `- [Website](${ORIGIN}): the timeline as a wall of woodcut boxes`,
    `- [Corrections](${c.site.repo}/issues): report mistakes with evidence`,
    '',
  ].join('\n');
}

const H = {
  ko: { scope: '범위', asOf: '기준일', license: '라이선스', credit: '출처 표기', eras: '시기', ledger: '주요 모델 판본', sources: '출처', correction: '정정' },
  en: { scope: 'Scope', asOf: 'As of', license: 'License', credit: 'Credit', eras: 'Eras', ledger: 'Major model releases', sources: 'Sources', correction: 'Correction' },
};

/** 영어판에는 한글을 섞지 않는다: 출처 제목이 한글이면 주소만 쓴다 */
function sourceLine(locale: Locale, x: Src): string {
  return locale === 'en' && (hasHangul(x.title) || hasHangul(x.publisher ?? '')) ? `<${x.url}>` : `[${x.title}](${x.url})`;
}

export function buildLlmsFull(c: Content, locale: Locale): string {
  const h = H[locale];
  const out: string[] = [
    `# ${c.site.name}`, '',
    `- ${h.scope}: ${SCOPE[locale]}`,
    `- ${h.asOf}: ${formatDot(c.site.asOf)}`,
    `- ${h.license}: ${LICENSE.name} (${LICENSE.url})`,
    `- ${h.credit}: ${ATTRIBUTION}`,
    '',
  ];
  let year = '';
  for (const s of newestFirst(c.scenes)) {
    const y = s.date.slice(0, 4);
    if (y !== year) {
      year = y;
      const yt = c.years[y]?.[locale];
      out.push(`## ${y}${yt ? ` · ${yt.title}` : ''}`, '');
      if (yt) out.push(yt.body, '');
    }
    const t = s[locale];
    out.push(`### ${formatDot(s.date)} · ${t.title}`, '', `${t.kicker}. ${t.lede}`, '', `<${sceneUrl(locale, s.id)}>`, '');
    const addrs = itemAddresses(s.id, s.items.map(it => it.date));
    s.items.forEach((it, k) => {
      const src = (it.sources.length ? it.sources : s.sources).map(x => sourceLine(locale, x)).join(', ');
      out.push(`- ${formatDot(it.date)} ${it[locale]}${src ? ` (${h.sources}: ${src})` : ''} <${sceneUrl(locale, addrs[k])}>`);
    });
    for (const x of s.corrections) {
      const body = locale === 'ko' ? x.ko : x.en;
      if (body) out.push(`- ${h.correction} ${formatDot(x.date)}: ${body}`);
    }
    if (s.sources.length) out.push('', `${h.sources}: ${s.sources.map(x => sourceLine(locale, x)).join(', ')}`);
    out.push('');
  }
  out.push(`## ${h.eras}`, '');
  for (const a of c.arcs) out.push(`- ${a.from}${a.to ? `–${a.to}` : '–'} ${a[locale].title}: ${a[locale].body}`);
  out.push('', `## ${h.ledger}`, '');
  for (const l of c.ledger) out.push(`- ${l.lab[locale]}: ${l.models.map(m => `${m.name} (${m.date})`).join(', ')}`);
  out.push('');
  return out.join('\n');
}
