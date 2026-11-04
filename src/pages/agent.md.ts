import { loadContent } from '../lib/content.ts';
import { buildAgentSetup } from '../lib/agent.ts';

/* 포스터와 데이터 칸의 버튼이 복사하는 글이 가리키는 설치 안내(영어). 에이전트가 읽고 따른다 */
export const GET = () => new Response(buildAgentSetup(loadContent(), 'en'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
