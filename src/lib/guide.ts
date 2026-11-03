/* 쓰는 법(맺음 맨 끝의 다섯 칸)의 순서와 판 설정. 글(glyph, note)은 화면 문구(src/i18n의 guide)에서 같은 순서로 온다.
   그림은 pics.yaml에 있어야 한다(없으면 빌드 오류, checks.ts). open은 벽의 사건이 쓰는 cursor를 같이 쓴다 */
export type GuideAct = 'look' | 'open' | 'follow' | 'take' | 'ask';

export const GUIDE: readonly { act: GuideAct; pic: string; pattern: string; angle: number; seed: number }[] = [
  { act: 'look', pic: 'eye', pattern: 'l', angle: 0, seed: 11 },
  { act: 'open', pic: 'cursor', pattern: 'd', angle: 12, seed: 23 },
  { act: 'follow', pic: 'trail', pattern: 'w', angle: 0, seed: 37 },
  { act: 'take', pic: 'poster', pattern: 'c', angle: 0, seed: 41 },
  { act: 'ask', pic: 'bubble', pattern: 'l', angle: 0, seed: 59 },
];
