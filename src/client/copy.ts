/* 포스터와 데이터 칸의 "에이전트에게 알려 주기". 누르면 쪽지(data-copy가 가리키는 글)를 클립보드에 넣고 버튼 글을 잠시 바꾼다.
   클립보드를 쓸 수 없으면(권한 거부, 옛 브라우저) 쪽지의 글을 골라 두고 직접 복사하라고 알린다.
   연달아 누르면 마지막 누름부터 4초를 다시 센다 */
export function initCopy(): void {
  document.querySelectorAll<HTMLButtonElement>('button[data-copy]').forEach(copyButton);
}
function copyButton(btn: HTMLButtonElement): void {
  const src = document.getElementById(btn.dataset.copy!);
  const label = btn.querySelector<HTMLElement>('.t');
  const hint = document.getElementById(btn.dataset.status!);
  if (!src || !label || !hint) return;
  const idle = label.textContent;
  let timer = 0;
  const show = (state: 'copied' | 'failed', text: string) => {
    btn.dataset.state = state;
    if (state === 'copied') label.textContent = btn.dataset.copied!;
    hint.textContent = text;
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      delete btn.dataset.state;
      label.textContent = idle;
      hint.textContent = '';
    }, 4000);
  };
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(src.textContent ?? '');
      show('copied', btn.dataset.hint!);
    } catch {
      const r = document.createRange();
      r.selectNodeContents(src);
      getSelection()?.removeAllRanges();
      getSelection()?.addRange(r);
      show('failed', btn.dataset.failed!);
    }
  });
}
