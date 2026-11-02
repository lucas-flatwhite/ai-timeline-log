/* 제보 안내 창. [data-report] 링크(위 막대, 만든 방법)를 누르면 GitHub로 가는 대신 창을 연다.
   창 바깥(배경)을 누르거나 Esc, ×로 닫는다. 닫으면 브라우저가 연 링크로 초점을 돌려준다 */
export function initReport(): void {
  const dlg = document.getElementById('report') as HTMLDialogElement | null;
  if (!dlg?.showModal) return;
  document.addEventListener('click', e => {
    const a = (e.target as Element).closest?.('a[data-report]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    dlg.showModal();
  });
  /* 안쪽(.rin)이 창을 다 채우므로 target이 dialog면 배경이다. 글을 고르다 바깥에서 손을 떼도 닫히지 않게 누른 곳도 배경이어야 한다 */
  let downOut = false;
  dlg.addEventListener('pointerdown', e => { downOut = e.target === dlg; });
  dlg.addEventListener('click', e => {
    if (downOut && e.target === dlg) dlg.close();
    downOut = false;
  });
}
