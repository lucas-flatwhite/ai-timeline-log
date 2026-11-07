import { describe, test, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { loadContent } from '../../src/lib/content.ts';
import { hasHangul } from '../../src/lib/checks.ts';
import {
  agentSetupUrl, buildAgentSetup, buildSkill, buildSkillIndex, clipText, SKILL_DESCRIPTION, SKILL_NAME,
} from '../../src/lib/agent.ts';

const c = loadContent();
const ORIGIN = 'https://lucasflatwhite.com/ai-timeline-log/';

describe('clipboard text', () => {
  test('clip text per locale', () => {
    expect(clipText(c, 'ko')).toBe('AI Timeline Log(생성형 AI 연표, 2022.11.30–2026.11.07)를 참고 자료로 들여놓으려고 합니다.\nhttps://lucasflatwhite.com/ai-timeline-log/ko/agent.md 를 읽고 거기 적힌 대로 해 주세요.\n링크를 열 수 없으면 먼저 알려 주세요.');
    expect(clipText(c, 'en')).toBe("I'd like to add AI Timeline Log (a timeline of generative AI, 2022.11.30–2026.11.07) as a reference.\nRead https://lucasflatwhite.com/ai-timeline-log/agent.md and follow it.\nIf you can't open the link, tell me first.");
  });
  test('setup urls', () => {
    expect(agentSetupUrl('ko')).toBe(`${ORIGIN}ko/agent.md`);
    expect(agentSetupUrl('en')).toBe(`${ORIGIN}agent.md`);
  });
});

describe('agent.md', () => {
  test('setup doc: install command, fallback paths, chat apps, closing message', () => {
    for (const l of ['ko', 'en'] as const) {
      const d = buildAgentSetup(c, l);
      expect(d).toContain('npx -y skills add https://lucasflatwhite.com/ai-timeline-log -g -a');
      for (const id of ['claude-code', 'codex', 'cursor', 'opencode']) expect(d).toContain(`\`${id}\``);
      for (const p of ['~/.claude/skills/ai-timeline-log/SKILL.md', '~/.agents/skills/ai-timeline-log/SKILL.md',
        '~/.cursor/skills/ai-timeline-log/SKILL.md', '~/.config/opencode/skills/ai-timeline-log/SKILL.md']) expect(d).toContain(p);
      expect(d).toContain(`${ORIGIN}.well-known/agent-skills/ai-timeline-log/SKILL.md`);
      expect(d).toContain('2026.11.07');
      expect(d).toContain('CC BY 4.0');
    }
    expect(hasHangul(buildAgentSetup(c, 'en'))).toBe(false);
    expect(buildAgentSetup(c, 'ko')).toContain('매주 월요일에 연표의 새 장면과 정정을 확인해서 세 줄로 알려 주세요.');
    expect(buildAgentSetup(c, 'en')).toContain('Every Monday, check the timeline for new scenes and corrections and tell me in three lines.');
  });
});

describe('served as UTF-8', () => {
  test('vercel.json gives .md files a charset so agents read the Korean setup correctly', async () => {
    const { readFileSync } = await import('node:fs');
    const v = JSON.parse(readFileSync('vercel.json', 'utf8')) as { headers?: { source: string; headers: { key: string; value: string }[] }[] };
    expect(v.headers).toContainEqual({ source: '/(.*)\\.md', headers: [{ key: 'Content-Type', value: 'text/markdown; charset=utf-8' }] });
  });
  test('the skill index and SKILL.md are open to browser-based agents (CORS)', async () => {
    const { readFileSync } = await import('node:fs');
    const v = JSON.parse(readFileSync('vercel.json', 'utf8')) as { headers?: { source: string; headers: { key: string; value: string }[] }[] };
    expect(v.headers).toContainEqual({ source: '/ai-timeline-log/.well-known/agent-skills/(.*)', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] });
  });
});

describe('SKILL.md', () => {
  test('skill: frontmatter, english only, no asOf', () => {
    const s = buildSkill(c);
    expect(SKILL_NAME).toBe('ai-timeline-log');
    expect(s.startsWith(`---\nname: ai-timeline-log\ndescription: ${SKILL_DESCRIPTION}\n---\n`)).toBe(true);
    expect(SKILL_DESCRIPTION.length).toBeLessThanOrEqual(1024);
    expect(SKILL_DESCRIPTION).not.toMatch(/[:#\n]/);   // YAML 한 줄 값으로 안전하게
    expect(hasHangul(s)).toBe(false);
    expect(s).not.toMatch(/2026\.11\.07|2026-11-07/);   // 장면이 늘어도 digest가 그대로
    for (const u of ['llms.txt', 'llms-full.txt', 'ko/llms-full.txt', 'timeline.json', 'feed.xml', 'ko/feed.xml']) expect(s).toContain(ORIGIN + u);
  });

  test('index digest matches SKILL.md bytes', () => {
    const i = buildSkillIndex(c);
    expect(i.$schema).toBe('https://schemas.agentskills.io/discovery/0.2.0/schema.json');
    expect(i.skills).toEqual([{
      name: 'ai-timeline-log', type: 'skill-md', description: SKILL_DESCRIPTION, url: 'ai-timeline-log/SKILL.md',
      digest: 'sha256:' + createHash('sha256').update(buildSkill(c), 'utf8').digest('hex'),
    }]);
  });
});
