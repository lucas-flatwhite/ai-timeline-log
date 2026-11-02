/* 제보 안내 창. [data-report] 링크(위 막대, 만든 방법)를 누르면 GitHub로 가는 대신 창을 연다.
   창 바깥(배경)을 누르거나 Esc, ×로 닫는다. 닫으면 연 링크로 초점을 돌려준다.
   Safari는 마우스로 누른 링크에 초점을 주지 않아서 브라우저에 맡기면 초점이 body로 간다. 연 링크를 기억해 직접 돌려준다 */
export function initReport(): void {
  const dlg = document.getElementById('report') as HTMLDialogElement | null;
  if (!dlg?.showModal) return;
  let opener: HTMLElement | null = null;
  document.addEventListener('click', e => {
    const a = (e.target as Element).closest?.('a[data-report]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    opener = a as HTMLElement;
    dlg.showModal();
  });
  dlg.addEventListener('close', () => {
    const o = opener;
    opener = null;
    if (o && document.activeElement !== o) o.focus({ preventScroll: true });
  });
  /* 안쪽(.rin)이 창을 다 채우므로 target이 dialog면 배경이다. 글을 고르다 바깥에서 손을 떼도 닫히지 않게 누른 곳도 배경이어야 한다 */
  let downOut = false;
  dlg.addEventListener('pointerdown', e => { downOut = e.target === dlg; });
  dlg.addEventListener('click', e => {
    if (downOut && e.target === dlg) dlg.close();
    downOut = false;
  });
}
