import type { Content } from './content.ts';
import {
  daysBetween, formatDot, formatLong, formatMonthLong, todayISO, type Locale,
} from './dates.ts';
import { glyphFor, hashSeed, itemAddresses, sortWall, ymd, type WallEntry } from './grid.ts';
import type { Pics } from './schema.ts';
import { ORIGIN } from './origin.ts';
import { LICENSE, latestPosterEdition, posterUrl } from './export.ts';
import { agentSetupUrl, clipText, EXAMPLES } from './agent.ts';
import { ui, uiFor, locales } from '../i18n/index.ts';
import { lineageImage, lineageInstall, lineageLinks } from './lineage.ts';
import { GUIDE, type GuideAct } from './guide.ts';
import { formatMB, previewFile, previewSize } from './poster.ts';

/** 격자의 상자 하나. 날짜는 `YYYY.MM.DD`(월까지만 있으면 `YYYY.MM`, 연도 판은 `YYYY`). 주소에만 `YYYYMMDD`를 쓴다 */
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
  /** 윗줄의 저장소 링크 */
  repo: { label: string; href: string };
  /** 제보: href는 GitHub 이슈 목록(스크립트가 없을 때 가는 곳이자 사건 정정 링크의 기본값). 스크립트가 있으면 안내 창을 연다 */
  name: string; report: { label: string; href: string; note: string; issue: string; mailLabel: string; mail: string; email: string };
  /** glyph: 오늘까지 일수를 채운 글, tpl: 채우기 전 틀({days}), start: 일수를 세기 시작하는 날 */
  cover: { glyph: string; tpl: string; start: string; lede: string; ledeTpl: string };
  boxes: BoxView[]; scenes: SceneDetail[]; years: YearDetail[]; pics: Pics;
  /** 주제 목록(topics.yaml 순서)과 장면 수 */
  topics: { id: string; name: string; count: number }[];
  /** 가장 늦은 장면 추가일. 브라우저가 지난 방문과 비교한다 */
  latestAdded: string;
  /** 시기(arcs.yaml, 오래된 것부터). from·to는 YYYYMM, 마지막 시기는 to가 없다(화면에는 asOf까지) */
  eras: { from: string; to?: string; title: string; span: string; body: string }[];
  /** 찾기 창, 새 상자 줄, 강조 띠의 문구. newLine은 {n} 틀, pick.era는 {i}·{n} 틀, pick.boxes는 {n} 틀 */
  ui: {
    topic: string; topicAll: string; topicClear: string; newLine: string; newShow: string; newLabel: string;
    find: string; findLabel: string; findPlaceholder: string; eras: string; eraShow: string; eraPrev: string; eraNext: string; eraText: string;
    pick: { era: string; topic: string; find: string; new: string; clear: string; boxes: string; box1: string; none: string };
  };
  dialog: { prev: string; next: string; close: string; fix: string; sources: string; sceneSources: string };
  /** 격자(main)와 상세 글 묶음(section)의 이름 */
  aria: { wall: string; details: string };
  langNav: string; langs: LangView[];
  outro: {
    /** titleTpl: 일수를 채우기 전 제목 틀({days}) */
    bar: string; eyebrow: string; title: string; titleTpl: string; arcs: { from: string; span: string; title: string; body: string }[];
    ledgerTitle: string; ledgerNote: string; ledger: { lab: string; models: { name: string; date: string }[] }[];
    end: [string, string];
    making?: string; makingTitle: string;
    /** 포스터와 데이터: 포스터(포스터가 있는 마지막 판), 피드, AI에게 건네기. llms·json은 붙여 넣을 정식 주소 */
    take: {
      title: string;
      poster?: PosterView;
      feed: { label: string; note: string; href: string };
      ai: {
        eyebrow: string; title: string; desc: string; clip: string; slipCap: string; slipFoot: string;
        button: string; copied: string; hint: string; failed: string;
        steps: [string, string, string]; examples: { label: string; text: string }[];
        links: { agent: string; llms: string; json: string };
      };
      lineage: {
        eyebrow: string; title: string; desc: string; caption: string; alt: string;
        button: string; copied: string; hint: string; failed: string; command: string;
        steps: [string, string, string]; folderLabel: string; sampleLabel: string;
        links: { folder: string; sample: string }; img: { src: string; w: number; h: number };
      };
      license: string;
    };
    /** 쓰는 법: 번호 판과 그림 상자 한 쌍씩 다섯 칸. href는 스크립트가 없을 때 가는 곳, act는 스크립트가 하는 일 */
    guide: { title: string; steps: GuideStep[] };
  };
}

/** 포스터와 데이터 칸의 포스터 자리. 크기(meta)와 교정지(proof)는 판 기록에 files가 있을 때만(Release 뒤 poster:pull) */
export interface PosterView {
  label: string; note: string; all: string; allLabel: string; from: string;
  desc: string;
  pdf: { href: string; label: string; meta?: string };
  png: { href: string; label: string; meta?: string };
  proof?: { src: string; w: number; h: number; alt: string; width: string; height: string; caption: string };
}

/** 쓰는 법의 한 칸. n은 번호 판, glyph·pic은 그림 상자에 새긴다. pattern·angle·seed는 그림 상자의 판 설정(guide.ts) */
export interface GuideStep {
  n: string; glyph: string; note: string; pic: string; act: GuideAct; href: string;
  pattern: string; angle: number; seed: number;
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

/** today: 일수와 소개 글 끝 날짜를 셀 날. 빌드 때는 빌드한 날이 들어가고, 브라우저가 보는 날로 다시 채운다 */
export function buildView(c: Content, locale: Locale, today: string = todayISO()): PageView {
  const t = uiFor(locale);
  const { site } = c;
  const st = site[locale];
  const days = daysBetween(site.start, today).toLocaleString('en-US');
  const count = c.scenes.length;
  const startDot = formatDot(site.start), asOfDot = formatDot(site.asOf);
  const vars = {
    days, count: String(count), startDot, asOfDot, email: site.email,
    startLong: formatLong(locale, site.start), asOfLong: formatLong(locale, site.asOf), todayLong: formatLong(locale, today),
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
    const sceneDate = formatDot(s.date);
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
      const addr = addrs[k], date = formatDot(it.date);
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
  const order = new Map(boxes.map((b, n) => [b.addr, n]));
  scenes.sort((a, b) => order.get(a.id)! - order.get(b.id)!);   // 격자와 같은 최신순
  // 상세 창의 사건 목록도 격자와 같은 최신순. 주소는 위에서 원래 순서로 이미 정했다
  scenes.forEach(s => s.items.sort((a, b) => order.get(a.addr)! - order.get(b.addr)!));

  const title = site.name;
  const poster = latestPosterEdition(c);
  // 시기: from·to는 주소(?era=)에 맞춰 YYYYMM. 화면에는 YYYY.MM으로 적고, 끝이 없는 시기는 마지막으로 고친 날(asOf)까지.
  // '현재'라고만 쓰면 언제 고쳤는지 알 수 없다
  const ym = (d: string) => ymd(d).slice(0, 6);
  const arcSpan = (a: Content['arcs'][number]) => `${formatDot(a.from)} – ${a.to ? formatDot(a.to) : asOfDot}`;
  return {
    lang: locale, title,
    description: fill(st.description, vars), ogTitle: title, ogDescription: fill(st.ogDescription, vars),
    canonical, ogImage: `${ORIGIN}og/${locale}.png`,
    alternates: [
      ...locales.filter(l => ui[l.code]).map(l => ({ hreflang: l.code, href: ORIGIN + l.path })),
      { hreflang: 'x-default', href: ORIGIN },
    ],
    feeds: { rss: `${new URL(canonical).pathname}feed.xml`, json: `${new URL(ORIGIN).pathname}timeline.json` },
    name: site.name,
    repo: { label: t.repo, href: site.repo },
    report: {
      label: t.report, href: `${site.repo}/issues`, note: fill(st.reportNote, vars), issue: t.reportIssue, mailLabel: t.reportMail,
      mail: `mailto:${site.email}?subject=${enc(t.reportSubject(site.name))}`, email: site.email,
    },
    cover: { glyph: fill(st.heroGlyph.wide, vars), tpl: st.heroGlyph.wide, start: site.start, lede: fill(st.lede, vars), ledeTpl: fill(st.lede, { ...vars, todayLong: '{todayLong}' }) },
    boxes, scenes, years, pics: c.pics,
    topics: Object.entries(c.topics).map(([id, v]) => ({ id, name: v[locale], count: c.scenes.filter(s => s.topics.includes(id)).length })),
    latestAdded: lastAdded,
    eras: c.arcs.map(a => ({ from: ym(a.from), to: a.to && ym(a.to), title: a[locale].title, span: arcSpan(a), body: a[locale].body })),
    ui: {
      topic: t.topic, topicAll: t.topicAll, topicClear: t.topicClear, newLine: t.newLine, newShow: t.newShow, newLabel: t.newLabel,
      find: t.find, findLabel: t.findLabel, findPlaceholder: t.findPlaceholder, eras: t.eras, eraShow: t.eraShow, eraPrev: t.eraPrev, eraNext: t.eraNext, eraText: t.eraText,
      pick: {
        era: t.pickEra('{i}', '{n}'), topic: t.pickTopic, find: t.pickFind, new: t.pickNew, clear: t.pickClear,
        boxes: t.boxes('{n}'), box1: t.boxes('1'), none: t.noBoxes,
      },
    },
    dialog: { prev: t.prev, next: t.next, close: t.close, fix: t.fix, sources: t.sources, sceneSources: t.sceneSources },
    aria: { wall: t.wall, details: t.details },
    langNav: t.langNav,
    langs: locales.map(l => (ui[l.code]
      ? { ...l, current: l.code === locale }
      : { ...l, path: null, current: false, soon: t.langSoon(l.name) })),
    outro: {
      bar: t.updated(asOfDot), eyebrow: t.updated(asOfDot), title: t.outroTitle(days), titleTpl: t.outroTitle('{days}'),
      arcs: c.arcs.map(a => ({ from: ym(a.from), span: arcSpan(a), title: a[locale].title, body: a[locale].body })),
      ledgerTitle: t.ledgerTitle, ledgerNote: st.ledgerNote,
      ledger: c.ledger.map(l => ({ lab: l.lab[locale], models: l.models.map(m => ({ name: m.name, date: formatDot(m.date) })) })),
      end: [t.endCount(count, startDot, asOfDot), title],
      making: st.making && fill(st.making, vars), makingTitle: t.making,
      take: {
        title: t.take,
        poster: poster && posterView(c, t, locale, poster),
        feed: { label: t.feedLabel, note: t.feedNote, href: `${new URL(canonical).pathname}feed.xml` },
        ai: {
          eyebrow: `${t.aiLabel} · ${t.aiAsOf(asOfDot)}`, title: t.aiTitle, desc: t.aiDesc,
          clip: clipText(c, locale), slipCap: t.aiSlipCap, slipFoot: t.aiSlipFoot,
          button: t.aiButton, copied: t.aiCopied, hint: t.aiHint, failed: t.aiFailed,
          steps: t.aiSteps, examples: EXAMPLES[locale],
          links: { agent: agentSetupUrl(locale), llms: `${canonical}llms-full.txt`, json: `${ORIGIN}timeline.json` },
        },
        lineage: {
          eyebrow: t.lnEyebrow, title: t.lnTitle, desc: t.lnDesc, caption: t.lnCaption, alt: t.lnAlt,
          button: t.lnButton, copied: t.lnCopied, hint: t.lnHint, failed: t.lnFailed, command: lineageInstall(c.site.repo),
          steps: t.lnSteps, folderLabel: t.lnFolder, sampleLabel: t.lnSample,
          links: lineageLinks(c.site.repo, locale), img: lineageImage(locale),
        },
        license: t.takeLicense(LICENSE.name, site.name),
      },
      guide: { title: t.guideTitle, steps: guideSteps(t, boxes) },
    },
  };
}

/* 포스터 칸: 그 판의 Release 파일. 장면·사건 수는 적지 않는다(판 뒤의 정정으로 지금 내용과 포스터의 수가 달라질 수 있다) */
function posterView(c: Content, t: ReturnType<typeof uiFor>, locale: Locale, e: Content['editions'][number]): PosterView {
  const f = e.files?.[locale], sp = locale === 'ko' ? '' : ' ';
  const date = formatDot(e.date);
  return {
    label: t.posterLabel(e.n, date), note: t.posterNote,
    desc: t.posterDesc,
    pdf: { href: posterUrl(c.site.repo, e.n, locale, 'pdf'), label: t.posterPdf, meta: f && `A2 · ${formatMB(f.pdf, locale)}` },
    png: { href: posterUrl(c.site.repo, e.n, locale, 'png'), label: t.posterPng, meta: f && `${f.px[0]}${sp}px · ${formatMB(f.png, locale)}` },
    all: `${c.site.repo}/releases`, allLabel: t.posterAll, from: t.posterFrom,
    proof: f && {
      src: `${new URL(ORIGIN).pathname}${previewFile(e.n, locale)}`, ...previewSize(f.px),
      alt: t.posterAlt(e.n), width: '420 mm', height: '594 mm', caption: t.posterCaption(e.n, date),
    },
  };
}

/* 열기(open)는 가장 최신 상자를 연다. 스크립트가 없으면 그 주소로 가서 아래 '모든 장면'의 글을 보인다 */
function guideSteps(t: ReturnType<typeof uiFor>, boxes: BoxView[]): GuideStep[] {
  if (t.guide.length !== GUIDE.length) throw new Error(`guide has ${t.guide.length} steps, expected ${GUIDE.length}`);
  const newest = need(boxes.find(b => b.kind !== 'year' && !b.off), 'a box to open');
  const href: Record<GuideAct, string> = {
    look: '#wall', open: `#${newest.addr}`, follow: '#wall', take: '#take', ask: '#take-ai',
  };
  return GUIDE.map((g, i) => ({ ...g, n: String(i + 1), glyph: t.guide[i].glyph, note: t.guide[i].note, href: href[g.act] }));
}
