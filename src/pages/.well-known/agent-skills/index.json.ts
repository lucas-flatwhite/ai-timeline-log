import { loadContent } from '../../../lib/content.ts';
import { buildSkillIndex } from '../../../lib/agent.ts';

/* Agent Skills Discovery 0.2.0 목록. npx skills add https://lucasflatwhite.com/ai-timeline-log 가 이 경로를 먼저 찾는다 */
export const GET = () => new Response(JSON.stringify(buildSkillIndex(loadContent()), null, 2) + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
