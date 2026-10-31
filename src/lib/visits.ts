/** 지난 방문 이후 새 상자: 어느 날짜 뒤에 추가된 상자를 표시할지 정하는 순수 함수.
 *  session: 같은 탭에서 처음 연 때의 기준(새로 고쳐도 표시가 남게), local: 마지막으로 본 판의 가장 늦은 추가일,
 *  latest: 이번 빌드의 가장 늦은 추가일. 날짜가 아니거나 latest보다 늦으면(롤백 배포) 버린다 */
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const valid = (d: string | null, latest: string) => (d !== null && DAY.test(d) && d <= latest ? d : null);

export function sinceFor(session: string | null, local: string | null, latest: string): { since: string | null; session: string | null } {
  const since = valid(session, latest) ?? valid(local, latest);
  return { since, session: since };
}

export function isNew(added: string | undefined, since: string | null): boolean {
  return !!added && !!since && added > since;
}
