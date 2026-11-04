/* 쓰는 법 다섯 칸을 누르면 그 일을 한다. 스크립트가 없으면 href(#wall, 최신 상자 주소, #take, #take-ai)로 간다.
   - look: 벽 맨 위로
   - open: 최신 상자를 상세 창으로 연다(표지 뽑기와 같은 open-addr). 닫으면 브라우저가 이 링크로 초점을 돌린다
   - follow: 벽 맨 위로 올라가 찾기 창(시기, 주제)을 연다
   - take, ask: 포스터와 데이터 칸의 포스터 줄, AI 줄로 */
export function initGuide(): void {
  const guide = document.querySelector<HTMLElement>('.guide');
  if (!guide) return;
  const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth') as ScrollBehavior;
  guide.addEventListener('click', e => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // 새 탭 열기 등은 그대로
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-act]');
    if (!a) return;
    const act = a.dataset.act, hash = a.hash.slice(1);
    e.preventDefault();
    if (act === 'open') { document.dispatchEvent(new CustomEvent('open-addr', { detail: hash })); return; }
    if (act === 'look') { scrollTo({ top: 0, behavior: smooth() }); return; }
    if (act === 'follow') {
      const btn = document.querySelector<HTMLButtonElement>('.top .tp-btn');
      if (!btn) return;
      /* 찾기 창은 바깥을 누르면 닫힌다(find.ts). 이 클릭이 문서까지 올라가 방금 연 창을 닫지 않게 여기서 멈춘다 */
      e.stopPropagation();
      scrollTo({ top: 0 });
      if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
      return;
    }
    document.getElementById(hash)?.scrollIntoView({ behavior: smooth(), block: 'start' });
  });
}
