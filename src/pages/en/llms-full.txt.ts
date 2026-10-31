import { loadContent } from '../../lib/content.ts';
import { buildLlmsFull } from '../../lib/export.ts';

/* 영어 전체 연표(마크다운) */
export const GET = () => new Response(buildLlmsFull(loadContent(), 'en'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
