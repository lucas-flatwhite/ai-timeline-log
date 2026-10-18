/* 고정된 화면 문구. 편집자가 고치는 문장은 content/site.yaml에 둔다 */
export const ko = {
  now: '현재',
  cue: '아래로',
  langNav: '언어',
  langSoon: (name: string) => `${name} 준비 중`,
  plateNo: (n: number) => `제${n}판`,
  yearCount: (count: number, first: number, last: number) => `장면 ${count}개 · 제${first}판–제${last}판`,
  barScene: (when: string, n: number, total: number) => `${when}  ·  제${n}판 / ${total}`,
  barYear: (y: string, count: number) => `${y}년  ·  장면 ${count}개`,
  railNav: '연표 바로가기',
  railLabel: (n: number, when: string, title: string) => `제${n}판 ${when} ${title}`,
  outroTitle: (days: string) => `${days}일 동안 바뀐 것`,
  ledgerTitle: '주요 모델 판본',
  sourcesTitle: '출처와 기준',
  endCount: (count: number, start: string, now: string) => `판 ${count}장 · ${start} – ${now}`,
};
export type UI = typeof ko;
