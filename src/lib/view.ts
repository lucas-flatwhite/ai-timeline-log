import type { Content } from './content.ts';
import {
  daysBetween, formatDate, formatDot, formatLong, formatMonthLong, formatYYMM, todayISO, type Locale,
} from './dates.ts';
import { glyphFor, hashSeed, itemAddresses, sortWall, ymd, type WallEntry } from './grid.ts';
import type { Pics } from './schema.ts';
import { ORIGIN } from './origin.ts';
import { LICENSE, latestPosterEdition, posterUrl } from './export.ts';
import { ui, uiFor, locales } from '../i18n/index.ts';

/** 격자의 상자 하나. 날짜는 `YYYYMMDD`(월까지만 있으면 `YYYYMM`, 연도 판은 `YYYY`) */
export interface BoxView {
  kind: 'scene' | 'item' | 'year'; addr: string; date: string; glyph: string; pattern: string; angle?: number;
  motif: string; seed: number; pic?: string; scene?: string; label: string; off: boolean;
  /** 장면의 주제(사건 상자는 장면 것을 물려받는다). 연도 판은 [] */
  topics: string[];
  /** 장면이 추가된 날. 지난 방문 이후 새 상자 표시에 쓴다. 연도 판에는 없다 */
  added?: string;
}
export interface SourceView { url: string; title: string }
export interface ItemDetail { addr: string; date: string; text: string; meta: string; fix: string; sources: SourceView[] }
export interface SceneDetail {
  id: string; aliases: string[]; meta: string; title: string; lede: string; items: ItemDetail[];
  corrections: string[]; sources: SourceView[]; fix: string;
}
export interface YearDetail { addr: string; year: string; title: string; body: string }
export interface LangView { code: Locale; label: string; name: string; path: string | null; current: boolean; soon?: string }
export interface PageView {
  lang: Locale; title: string; description: string; ogTitle: string; ogDescription: string;
  canonical: string; ogImage: string; alternates: { hreflang: string; href: string }[];
  /** 내보내기 파일의 주소(base 아래 절대 경로). rss는 언어별, json은 하나 */
  feeds: { rss: string; json: string };
  name: string; report: { label: string; href: string };
  /** glyph: 오늘까지 일수를 채운 글, tpl: 채우기 전 틀({days}), start: 일수를 세기 시작하는 날 */
  cover: { glyph: string; tpl: string; start: string; lede: string };
  boxes: BoxView[]; scenes: SceneDetail[]; years: YearDetail[]; pics: Pics;
  /** 주제 목록(topics.yaml 순서)과 장면 수 */
  topics: { id: string; name: string; count: number }[];
  /** 가장 늦은 장면 추가일. 브라우저가 지난 방문과 비교한다 */
  latestAdded: string;
  /** 주제 단추와 새 상자 줄의 문구. newLine은 {n} 틀 */
  ui: { topic: string; topicAll: string; topicClear: string; newLine: string; newShow: string; newLabel: string };
  dialog: { prev: string; next: string; close: string; fix: string; sources: string };
  /** 격자(main)와 상세 글 묶음(section)의 이름 */
  aria: { wall: string; details: string };
  langNav: string; langs: LangView[];
  outro: {
    /** titleTpl: 일수를 채우기 전 제목 틀({days}) */
    bar: string; eyebrow: string; title: string; titleTpl: string; arcs: { span: string; title: string; body: string }[];
    ledgerTitle: string; ledgerNote: string; ledger: { lab: string; models: { name: string; date: string }[] }[];
    sourcesTitle: string; sourcesNote: string; sources: { url: string; title: string }[]; end: [string, string];
    making?: string; makingTitle: string;
    /** 가져가기: 포스터(포스터가 있는 마지막 판), 피드, AI에게 건네기. llms·json은 붙여 넣을 정식 주소 */
    take: {
      title: string;
      poster?: { label: string; note: string; pdf: string; png: string; all: string; allLabel: string };
      feed: { label: string; note: string; href: string };
      ai: { label: string; note: string; llms: string; json: string };
      license: string;
    };
  };
}

export { ORIGIN };

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

const enc = encodeURIComponent;
/** 이슈 제목 길이를 120자로 자른다(서로게이트 쌍을 가르지 않도록 코드 포인트 단위) */
const clip = (s: string) => [...s].slice(0, 120).join('');

type Entry = WallEntry & { box: BoxView };

/** today: 일수를 셀 날. 빌드 때는 빌드한 날이 들어가고, 브라우저가 보는 날로 다시 채운다 */
export function buildView(c: Content, locale: Locale, today: string = todayISO()): PageView {
  const t = uiFor(locale);
  const { site } = c;
  const st = site[locale];
  const days = daysBetween(site.start, today).toLocaleString('en-US');
  const count = c.scenes.length;
  const startDot = formatDot(site.start), asOfDot = formatDot(site.asOf);
  const vars = {
    days, count: String(count), startDot, asOfDot,
    startLong: formatLong(locale, site.start), asOfLong: formatLong(locale, site.asOf),
    asOfMonthLong: formatMonthLong(locale, site.asOf),
  };

  const canonical = ORIGIN + need(locales.find(l => l.code === locale), `locale ${locale}`).path;
  const fix = (addr: string, date: string, text: string) =>
    `${site.repo}/issues/new?template=correction.yml&title=${enc(clip(t.fixTitle(date, text)))}`
    + `&event=${enc(canonical + '#' + addr)}&lang=${locale}`;

  // 최근 추가 장면: added의 최댓값이 첫 판보다 늦을 때, 그 날짜에 추가된 장면들
  const lastAdded = c.scenes.reduce((m, s) => (s.added > m ? s.added : m), '');
  const recent = lastAdded > site.firstEdition ? lastAdded : null;

  const entries: Entry[] = [];
  const scenes: SceneDetail[] = [];

  c.scenes.forEach((s, i) => {
    const text = s[locale];
    const sceneDate = ymd(s.date);
    const sources = s.sources.map(x => ({ url: x.url, title: x.title }));
    // 최근 추가 표시: 장면 날짜 줄과 그 사건들의 날짜 줄 끝에 똑같이 붙인다
    const mark = recent && s.added === recent ? ` · ${t.added(formatDot(s.added))}` : '';
    entries.push({
      kind: 'scene', date: s.date, order: s.order, seq: i * 100,
      box: {
        kind: 'scene', addr: s.id, date: sceneDate, glyph: text.glyph ?? s.print.glyph,
        pattern: s.print.pattern, angle: s.print.angle, motif: s.print.motif, seed: hashSeed(s.id),
        scene: s.id, label: `${sceneDate} · ${text.title}`, off: false, topics: s.topics, added: s.added,
      },
    });

    const addrs = itemAddresses(s.id, s.items.map(it => it.date));
    const items: ItemDetail[] = s.items.map((it, k) => {
      const addr = addrs[k], date = ymd(it.date);
      const body = it[locale];
      entries.push({
        kind: 'item', date: it.date, order: s.order, seq: i * 100 + k + 1,
        box: {
          kind: 'item', addr, date, glyph: glyphFor(it.glyph, locale),
          pattern: s.print.pattern === 'c' ? 'h' : s.print.pattern, angle: s.print.angle, motif: 'none',
          seed: hashSeed(addr), pic: it.pic, scene: s.id, label: `${date} · ${body}`, off: false,
          topics: s.topics, added: s.added,
        },
      });
      return {
        addr, date, text: body, meta: `${date} · ${text.kicker} · ${t.sceneOf(text.title)}${mark}`,
        fix: fix(addr, date, body),
        // 사건 출처가 있으면 그것, 없으면 장면 출처
        sources: (it.sources.length ? it.sources : s.sources).map(x => ({ url: x.url, title: x.title })),
      };
    });

    scenes.push({
      id: s.id, aliases: s.aliases,
      meta: `${sceneDate} · ${text.kicker}${mark}`,
      title: text.title, lede: text.lede, items,
      corrections: s.corrections.map(x => `${formatDot(x.date)} ${need(x[locale], `${s.id}.corrections.${locale}`)}`),
      sources, fix: fix(s.id, sceneDate, text.title),
    });
  });

  // 연도 판: 장면이 있는 모든 연도. 요약이 없는 연도(시작 연도)는 누를 수 없다
  const years: YearDetail[] = [];
  for (const y of new Set(c.scenes.map(s => s.date.slice(0, 4)))) {
    const yt = c.years[y]?.[locale];
    entries.push({
      kind: 'year', date: y, order: 0, seq: +y,
      box: {
        kind: 'year', addr: `year-${y}`, date: y, glyph: y, pattern: 'd', angle: +y % 2 ? -22 : 22,
        motif: 'none', seed: +y, label: yt ? `${y} · ${yt.title}` : y, off: !yt, topics: [],
      },
    });
    if (yt) years.push({ addr: `year-${y}`, year: y, title: yt.title, body: yt.body });
  }
  years.reverse();

  const boxes = sortWall(entries).map(e => e.box);
  const order = new Map(boxes.filter(b => b.kind === 'scene').map((b, n) => [b.addr, n]));
  scenes.sort((a, b) => order.get(a.id)! - order.get(b.id)!);   // 격자와 같은 최신순

  const title = site.name;
  const poster = latestPosterEdition(c);
  return {
    lang: locale, title,
    description: fill(st.description, vars), ogTitle: title, ogDescription: fill(st.ogDescription, vars),
    canonical, ogImage: `${ORIGIN}og/${locale}.png`,
    alternates: [
      ...locales.filter(l => ui[l.code]).map(l => ({ hreflang: l.code, href: ORIGIN + l.path })),
      { hreflang: 'x-default', href: ORIGIN },
    ],
    feeds: { rss: `${new URL(canonical).pathname}feed.xml`, json: `${new URL(ORIGIN).pathname}timeline.json` },
    name: site.name, report: { label: t.report, href: `${site.repo}/issues` },
    cover: { glyph: fill(st.heroGlyph.wide, vars), tpl: st.heroGlyph.wide, start: site.start, lede: fill(st.lede, vars) },
    boxes, scenes, years, pics: c.pics,
    topics: Object.entries(c.topics).map(([id, v]) => ({ id, name: v[locale], count: c.scenes.filter(s => s.topics.includes(id)).length })),
    latestAdded: lastAdded,
    ui: { topic: t.topic, topicAll: t.topicAll, topicClear: t.topicClear, newLine: t.newLine, newShow: t.newShow, newLabel: t.newLabel },
    dialog: { prev: t.prev, next: t.next, close: t.close, fix: t.fix, sources: t.sources },
    aria: { wall: t.wall, details: t.details },
    langNav: t.langNav,
    langs: locales.map(l => (ui[l.code]
      ? { ...l, current: l.code === locale }
      : { ...l, path: null, current: false, soon: t.langSoon(l.name) })),
    outro: {
      bar: t.now, eyebrow: t.now, title: t.outroTitle(days), titleTpl: t.outroTitle('{days}'),
      arcs: c.arcs.map(a => ({
        span: formatDate(locale, a.from) + (a.to ? ' – ' + formatDate(locale, a.to) : ''), title: a[locale].title, body: a[locale].body,
      })),
      ledgerTitle: t.ledgerTitle, ledgerNote: st.ledgerNote,
      ledger: c.ledger.map(l => ({ lab: l.lab[locale], models: l.models.map(m => ({ name: m.name, date: formatYYMM(m.date) })) })),
      sourcesTitle: t.sourcesTitle, sourcesNote: fill(st.sourcesNote, vars),
      sources: c.sources.map(s => ({ url: s.url, title: s.title })),
      end: [t.endCount(count, startDot, t.now), title],
      making: st.making, makingTitle: t.making,
      take: {
        title: t.take,
        poster: poster && {
          label: t.posterLabel(poster.n, formatDot(poster.date)), note: t.posterNote,
          pdf: posterUrl(site.repo, poster.n, locale, 'pdf'), png: posterUrl(site.repo, poster.n, locale, 'png'),
          all: `${site.repo}/releases`, allLabel: t.posterAll,
        },
        feed: { label: t.feedLabel, note: t.feedNote, href: `${new URL(canonical).pathname}feed.xml` },
        ai: { label: t.aiLabel, note: t.aiNote, llms: `${canonical}llms-full.txt`, json: `${ORIGIN}timeline.json` },
        license: t.takeLicense(LICENSE.name, site.name),
      },
    },
  };
}
