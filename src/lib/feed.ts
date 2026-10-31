import type { Content } from './content.ts';
import type { Locale } from './dates.ts';
import { newestFirst, releaseUrl, sceneUrl } from './export.ts';
import { ORIGIN } from './origin.ts';
import { uiFor } from '../i18n/index.ts';

/** RSS 2.0 피드. 항목: 첫 판(하나로 묶음), 첫 판 뒤에 더한 장면, 정정, 포스터가 있는 판. updated만 바뀐 것은 넣지 않는다 */

export interface FeedItem { guid: string; date: string; title: string; link: string; description: string }

export function feedItems(c: Content, locale: Locale): FeedItem[] {
  const t = uiFor(locale);
  const first = c.site.firstEdition;
  const items: FeedItem[] = [];
  const firstCount = c.scenes.filter(s => s.added === first).length;
  const ed1 = c.editions.find(e => e.date === first);
  items.push({
    guid: `first:${first}`, date: first, title: t.feedFirst(firstCount),
    link: ORIGIN + (locale === 'en' ? 'en/' : ''), description: ed1?.[locale] ?? t.feedFirst(firstCount),
  });
  for (const s of newestFirst(c.scenes)) {
    const st = s[locale];
    if (s.added > first) {
      items.push({
        guid: `scene:${s.id}:${s.added}`, date: s.added, title: st.title, link: sceneUrl(locale, s.id),
        description: [st.lede, ...s.items.map(it => it[locale])].join('\n'),
      });
    }
    for (const x of s.corrections) {
      items.push({
        guid: `correction:${s.id}:${x.date}`, date: x.date, title: t.feedCorrection(st.title), link: sceneUrl(locale, s.id),
        description: (locale === 'ko' ? x.ko : x.en) ?? t.feedCorrectionFallback,
      });
    }
  }
  for (const e of c.editions.filter(e => e.poster)) {
    items.push({ guid: `poster:${e.n}:${e.date}`, date: e.date, title: t.feedPoster(e.n), link: releaseUrl(c.site.repo, e.n), description: e[locale] });
  }
  // 날짜 내림차순. 같은 날이면 넣은 순서(안정 정렬)
  return items.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** YYYY-MM-DD → RFC 822, 한국 시각 자정 */
function rfc822(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[wd]}, ${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y} 00:00:00 +0900`;
}

export function renderRss(c: Content, locale: Locale): string {
  const items = feedItems(c, locale);
  const home = ORIGIN + (locale === 'en' ? 'en/' : '');
  const out = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    `<title>${esc(c.site.name)}</title>`,
    `<link>${home}</link>`,
    `<description>${esc(c.site[locale].ogDescription)}</description>`,
    `<language>${locale}</language>`,
    `<lastBuildDate>${rfc822(c.site.asOf)}</lastBuildDate>`,
    ...items.map(i => [
      '<item>',
      `<title>${esc(i.title)}</title>`,
      `<link>${esc(i.link)}</link>`,
      `<guid isPermaLink="false">${esc(i.guid)}</guid>`,
      `<pubDate>${rfc822(i.date)}</pubDate>`,
      `<description>${esc(i.description)}</description>`,
      '</item>',
    ].join('\n')),
    '</channel>',
    '</rss>',
    '',
  ];
  return out.join('\n');
}
