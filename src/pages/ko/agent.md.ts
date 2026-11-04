import { loadContent } from '../../lib/content.ts';
import { buildAgentSetup } from '../../lib/agent.ts';

/* 설치 안내(한국어). 사용자에게 하는 말은 존댓말 */
export const GET = () => new Response(buildAgentSetup(loadContent(), 'ko'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
