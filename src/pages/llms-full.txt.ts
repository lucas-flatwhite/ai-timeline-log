import { loadContent } from '../lib/content.ts';
import { buildLlmsFull } from '../lib/export.ts';

/* 한국어 전체 연표(마크다운). AI 채팅에 이 주소를 붙이면 출처를 달아 답할 수 있다 */
export const GET = () => new Response(buildLlmsFull(loadContent(), 'ko'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
