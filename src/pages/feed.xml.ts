import { loadContent } from '../lib/content.ts';
import { renderRss } from '../lib/feed.ts';

/* 한국어 피드: 새 장면, 정정, 포스터 판 */
export const GET = () => new Response(renderRss(loadContent(), 'ko'), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
