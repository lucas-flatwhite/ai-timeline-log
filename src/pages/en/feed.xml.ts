import { loadContent } from '../../lib/content.ts';
import { renderRss } from '../../lib/feed.ts';

/* 영어 피드 */
export const GET = () => new Response(renderRss(loadContent(), 'en'), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
