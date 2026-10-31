import { loadContent, loadGlossary } from '../lib/content.ts';
import { buildTimeline } from '../lib/export.ts';

/* 두 언어를 함께 담은 전체 데이터 */
export const GET = () => new Response(JSON.stringify(buildTimeline(loadContent(), loadGlossary()), null, 1), {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
