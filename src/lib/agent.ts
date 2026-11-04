import { createHash } from 'node:crypto';
import type { Content } from './content.ts';
import { formatDot, type Locale } from './dates.ts';
import { ATTRIBUTION, LICENSE, SCOPE } from './export.ts';
import { ORIGIN } from './origin.ts';

/** 에이전트에 연표를 들여놓는 파일들. 포스터와 데이터 칸의 버튼이 복사하는 글(clipText)은 agent.md를 읽으라고만 하고,
    agent.md(언어별)가 에이전트마다 할 일을, SKILL.md(영어 하나)가 설치된 뒤에 답하는 법을 적는다.
    SKILL.md에는 기준일을 넣지 않는다. 장면이 늘 때마다 digest가 바뀌어 다시 설치하라고 뜨지 않게, 기준일은 llms.txt에서 읽게 한다 */

export const SKILL_NAME = 'ai-timeline-log';
export const SKILL_DESCRIPTION = 'Answer questions about the history of generative AI since the launch of ChatGPT (model releases, company, research, policy and safety events, dates and eras) with dates and source links from AI Timeline Log, a curated bilingual English and Korean timeline. Use when the user asks what happened when in AI, checks AI facts or dates in a text, wants the background of an AI announcement, or asks what is new in the timeline.';
const SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';
const SITE = ORIGIN.replace(/\/$/, '');   // npx skills add에 주는 주소(끝의 /를 뺀다)
const SKILL_URL = `${ORIGIN}.well-known/agent-skills/${SKILL_NAME}/SKILL.md`;
const AGENTS_LIST = 'https://github.com/vercel-labs/skills/blob/main/docs/agents.md';

/* 스킬을 직접 저장할 곳. skills CLI의 agents.md(1.7.6)에 적힌 사용자 폴더 */
const PATHS: [string, string][] = [
  ['Claude Code', `~/.claude/skills/${SKILL_NAME}/SKILL.md`],
  ['Codex', `~/.agents/skills/${SKILL_NAME}/SKILL.md`],
  ['Cursor', `~/.cursor/skills/${SKILL_NAME}/SKILL.md`],
  ['OpenCode', `~/.config/opencode/skills/${SKILL_NAME}/SKILL.md`],
];

/** 포스터와 데이터 칸의 맥락 붙이기, 새 소식 챙기기 예시. 화면(i18n)과 agent.md가 같은 글을 쓴다 */
export const EXAMPLES: Record<Locale, { label: string; text: string }[]> = {
  ko: [
    { label: '맥락 붙이기', text: '이 기사에 나온 발표가 연표의 어느 흐름에 이어지는지, 앞선 장면을 날짜와 링크로 짚어 주세요.' },
    { label: '새 소식 챙기기', text: '매주 월요일에 연표의 새 장면과 정정을 확인해서 세 줄로 알려 주세요.' },
  ],
  en: [
    { label: 'Add context', text: 'Show where the announcement in this article fits in the timeline, citing earlier scenes with dates and links.' },
    { label: 'Keep up', text: 'Every Monday, check the timeline for new scenes and corrections and tell me in three lines.' },
  ],
};

export function agentSetupUrl(locale: Locale): string {
  return `${ORIGIN}${locale === 'ko' ? 'ko/' : ''}agent.md`;
}

export function clipText(c: Content, locale: Locale): string {
  const span = `${formatDot(c.site.start)}–${formatDot(c.site.asOf)}`;
  return locale === 'ko'
    ? `AI Timeline Log(생성형 AI 연표, ${span})를 참고 자료로 들여놓으려고 합니다.\n${agentSetupUrl('ko')} 를 읽고 거기 적힌 대로 해 주세요.\n링크를 열 수 없으면 먼저 알려 주세요.`
    : `I'd like to add AI Timeline Log (a timeline of generative AI, ${span}) as a reference.\nRead ${agentSetupUrl('en')} and follow it.\nIf you can't open the link, tell me first.`;
}

const fence = (s: string) => ['```', s, '```'];

export function buildAgentSetup(c: Content, locale: Locale): string {
  const start = formatDot(c.site.start), asOf = formatDot(c.site.asOf);
  const install = `npx -y skills add ${SITE} -g -a <agent> -y`;
  const ids = '`claude-code` (Claude Code), `codex` (Codex), `cursor` (Cursor), `opencode` (OpenCode)';
  const table = (h: [string, string]) => [`| ${h[0]} | ${h[1]} |`, '| --- | --- |', ...PATHS.map(([a, p]) => `| ${a} | \`${p}\` |`)];
  const ex = EXAMPLES[locale].map(e => `- ${e.text}`);
  const L = locale === 'ko' ? {
    title: `# ${c.site.name}: 에이전트 설치 안내`,
    intro: `이 글은 AI 에이전트가 읽고 따르는 안내입니다. 사용자가 이 주소를 읽고 따르라는 글을 붙여 넣었습니다.`,
    what: `${c.site.name}는 ChatGPT 출시(${start})부터 ${asOf}까지 생성형 AI의 흐름을 바꾼 사건을 한국어와 영어로 적은 연표입니다. 사건마다 날짜, 한 문장, 출처가 있습니다.`,
    meta: [`- 범위: ${SCOPE.ko}`, `- 기준일: ${asOf}`, `- 라이선스: ${LICENSE.name} (${LICENSE.url}), 출처 표기 "${ATTRIBUTION}"`],
    before: ['## 시작하기 전에', '', '무엇을 어디에 설치할지 사용자에게 한 줄로 알리고 진행하세요. 이 안내에 없는 명령은 돌리지 마세요.'],
    s1: ['## 1. 터미널 명령을 쓸 수 있는 에이전트', '', '스킬을 사용자 전체 폴더에, 지금 이 에이전트에만 설치합니다.'],
    s1b: `\`<agent>\` 자리에는 자기 이름을 넣으세요: ${ids}. 그 밖의 에이전트 이름은 ${AGENTS_LIST} 에 있습니다.`,
    s2: ['## 2. npx를 쓸 수 없으면', '', `${SKILL_URL} 를 받아 아래 경로에 저장하세요. 새 스킬을 읽으려면 다시 불러오기나 재시작이 필요한 에이전트도 있습니다.`],
    th: ['에이전트', '경로'] as [string, string],
    s3: ['## 3. 파일을 저장할 수 없는 채팅 앱 (ChatGPT, Claude, Gemini, Grok 등)', '', '아래 글을 메모리나 프로젝트 지침에 저장하세요. 그것도 안 되면 사용자에게 그렇다고 말하고 이 대화에서만 쓰세요.'],
    memo: [
      `생성형 AI의 역사를 물으면 ${ORIGIN}llms.txt 와 거기서 잇는 전체 연표(한국어 ${ORIGIN}ko/llms-full.txt)를 읽고 답한다.`,
      '사건마다 날짜와 출처 링크를 달고, 연표의 그 사건 주소(#과 id가 붙은 링크)를 붙인다.',
      '연표에 없는 내용은 연표 밖이라고 밝히고, 기준일 뒤의 일은 이 연표로 알 수 없다고 말한다.',
      `글을 옮겨 쓰면 "${ATTRIBUTION}"로 출처를 적는다.`,
    ].join('\n'),
    done: ['## 마치면', '', '사용자에게 이렇게 알려 주세요.'],
    msg: [`${c.site.name}를 들여놓았습니다: <설치한 곳>`, '', '이렇게 맡겨 보세요.', ...ex].join('\n'),
    sched: '예약 실행 기능이 있으면 매주 월요일 확인을 예약할지 사용자에게 물어보세요. 원한다고 할 때만 예약하세요.',
  } : {
    title: `# ${c.site.name}: agent setup`,
    intro: 'These instructions are for an AI agent. The user pasted a note asking you to read this page and follow it.',
    what: `${c.site.name} is a bilingual (English and Korean) timeline of generative AI from the launch of ChatGPT on ${start} to ${asOf}. Each event has a date, one sentence and its sources.`,
    meta: [`- Scope: ${SCOPE.en}`, `- As of: ${asOf}`, `- License: ${LICENSE.name} (${LICENSE.url}); credit "${ATTRIBUTION}"`],
    before: ['## Before you start', '', 'Tell the user in one line what you will install and where. Do not run any command that is not in these instructions.'],
    s1: ['## 1. Agents that can run terminal commands', '', 'Install the skill at the user level, for yourself only:'],
    s1b: `Replace \`<agent>\` with your own id: ${ids}. Other agents are listed at ${AGENTS_LIST}.`,
    s2: ['## 2. If npx is not available', '', `Download ${SKILL_URL} and save it at the path below. Some agents need a reload or restart to pick up a new skill.`],
    th: ['Agent', 'Path'] as [string, string],
    s3: ['## 3. Chat apps that cannot save files (ChatGPT, Claude, Gemini, Grok and others)', '', 'Save the text below to memory or project instructions. If you cannot, tell the user and use it for this conversation only.'],
    memo: [
      `For questions about the history of generative AI, read ${ORIGIN}llms.txt and the full timeline it links (English: ${ORIGIN}llms-full.txt).`,
      'Give each event its date and source links, and link the event on the timeline (the address with #id).',
      'Say when something is not in the timeline, and that events after its as-of date are not covered.',
      `When you reuse the text, credit "${ATTRIBUTION}".`,
    ].join('\n'),
    done: ['## When you are done', '', 'Tell the user:'],
    msg: [`${c.site.name} is set up: <where you installed it>`, '', 'Try asking:', ...ex].join('\n'),
    sched: 'If you can run scheduled tasks, ask the user whether to schedule the Monday check. Schedule it only if they say yes.',
  };
  return [
    L.title, '', L.intro, '', L.what, '', ...L.meta, '',
    ...L.before, '',
    ...L.s1, '', ...fence(install), '', L.s1b, '',
    ...L.s2, '', ...table(L.th), '',
    ...L.s3, '', ...fence(L.memo), '',
    ...L.done, '', ...fence(L.msg), '', L.sched, '',
  ].join('\n');
}

export function buildSkill(c: Content): string {
  return [
    '---', `name: ${SKILL_NAME}`, `description: ${SKILL_DESCRIPTION}`, '---', '',
    `# ${c.site.name}`, '',
    `${SCOPE.en} Each event has a date, one sentence and its sources. The timeline has an as-of date: read it from llms.txt before answering.`, '',
    '## Where to read', '',
    `- ${ORIGIN}llms.txt: the index, with the as-of date and edition. Start here.`,
    `- ${ORIGIN}llms-full.txt (English) or ${ORIGIN}ko/llms-full.txt (Korean): every scene and event, newest first, with dates, source links and a link to each event. Use the user's language.`,
    `- ${ORIGIN}timeline.json: structured data in both languages. \`scenes[].items[]\` have \`date\`, \`en\`, \`ko\`, \`sources\` and \`url\`. Also \`topics\`, \`arcs\` (eras), \`ledger\` (major model releases by lab) and \`glossary\` (official English names).`,
    '- Read the full text once per task and work from it. If your fetch tool shortens long pages, use timeline.json or ask the user to attach llms-full.txt.', '',
    '## How to answer', '',
    '- Give each event you cite its date (YYYY.MM.DD), at least one source link and its link on the timeline.',
    '- Keep the timeline\'s qualifiers, such as "according to reports" or "ongoing".',
    '- If something is not in the timeline, say so, and mark anything you add from elsewhere as outside the timeline.',
    '- The timeline stops at its as-of date. Do not infer later events from it.',
    '- Use the official names in the glossary.', '',
    '## What is new', '',
    `- ${ORIGIN}feed.xml (English) or ${ORIGIN}ko/feed.xml (Korean) lists new scenes, corrections and poster editions with dates.`,
    '- Report the entries after the last date you checked. If you have no record of a last check, report the five most recent entries, and remember the date of this check if you can.', '',
    '## License and corrections', '',
    `- Content is licensed under ${LICENSE.name} (${LICENSE.url}). When you reuse it, credit "${ATTRIBUTION}".`,
    `- If an event disagrees with its source, tell the user and point them to ${c.site.repo}/issues to report it.`, '',
  ].join('\n');
}

export interface SkillIndex {
  $schema: string;
  skills: { name: string; type: 'skill-md'; description: string; url: string; digest: string }[];
}

/** Agent Skills Discovery 0.2.0 목록. digest는 SKILL.md 바이트의 sha256이라 늘 빌드 때 계산한다 */
export function buildSkillIndex(c: Content): SkillIndex {
  const digest = 'sha256:' + createHash('sha256').update(buildSkill(c), 'utf8').digest('hex');
  return { $schema: SCHEMA, skills: [{ name: SKILL_NAME, type: 'skill-md', description: SKILL_DESCRIPTION, url: `${SKILL_NAME}/SKILL.md`, digest }] };
}
