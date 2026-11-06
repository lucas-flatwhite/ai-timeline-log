// 그림에 들어가는 고정 문구. 에이전트가 쓰는 것은 제목, 노드 이름과 부제, 징검다리 설명뿐이다.

/** @typedef {'ko'|'en'} Lang */
/** @typedef {'root'|'revival'|'merge'|'spread'} Row */
/** @typedef {'paper'|'model'|'hardware'|'release'|'dataset'|'other'} Kind */
/** @typedef {'lineage'|'side'|'confirmed'|'inferred'|'condition'|'focal'|'unverified'} LegendKey */

/** 상자 아래 줄 맨 앞의 꼬리표. 두 언어에서 같다. @type {Record<Kind, string>} */
export const KIND_TAGS = {
  paper: 'PAPER',
  model: 'MODEL',
  hardware: 'HW',
  release: 'RELEASE',
  dataset: 'DATA',
  other: 'OTHER',
};

/**
 * @typedef {{
 *   rows: Record<Row, string>,
 *   legend: Record<LegendKey, string>,
 *   focalPrefix: string,
 *   omittedPrefix: string,
 *   credit: string,
 *   kinds: Record<Kind, string>,
 *   desc: string,
 * }} Strings
 */

/** `desc`의 {subject}, {count}, {names}는 그릴 때 채운다. @type {Record<Lang, Strings>} */
export const STRINGS = {
  ko: {
    rows: { root: '뿌리', revival: '부활', merge: '합류', spread: '확산' },
    legend: {
      lineage: '본줄기',
      side: '다른 갈래·조건',
      confirmed: '확인',
      inferred: '추정',
      condition: '조건',
      focal: '징검다리',
      unverified: '확인 못 함',
    },
    focalPrefix: '징검다리 · ',
    omittedPrefix: '뺀 것 · ',
    credit: 'AI Timeline Log 계보 스킬로 그림 · lucasflatwhite.com/ai-timeline-log',
    kinds: KIND_TAGS,
    desc: '{subject} 계보도. 노드 {count}개: {names}.',
  },
  en: {
    rows: { root: 'Roots', revival: 'Revival', merge: 'Merge', spread: 'Spread' },
    legend: {
      lineage: 'Lineage',
      side: 'Other branch or condition',
      confirmed: 'Confirmed',
      inferred: 'Inferred',
      condition: 'Condition',
      focal: 'Key link',
      unverified: 'Not verified',
    },
    focalPrefix: 'Key link · ',
    omittedPrefix: 'Omitted · ',
    credit: 'Made with AI Timeline Log · lucasflatwhite.com/ai-timeline-log',
    kinds: KIND_TAGS,
    desc: 'Lineage of {subject}. {count} nodes: {names}.',
  },
};
