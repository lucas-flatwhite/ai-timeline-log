import { terms } from '../lib/search.ts';
import { currentPick, scrollToPicked, setPick } from './pick.ts';
import { loadOther } from './search.ts';
import { countLabel } from './pickbar.ts';

/* 위 막대의 찾기 창: 찾는 말, 시기, 주제. 고르면 그 상자만 남기고 흐리게 한다(시기는 eras.ts가 고른다).
   찾는 말은 치는 동안 바로 맞추고, Enter를 누르면 창을 닫고 첫 상자로 내린다 */
export function initFind(): void {
  const tp = document.querySelector<HTMLElement>('.top .tp');
  if (!tp) return;
  const btn = tp.querySelector<HTMLButtonElement>('.tp-btn')!, list = tp.querySelector<HTMLElement>('.tp-list')!;
  const input = list.querySelector<HTMLInputElement>('input')!, count = list.querySelector<HTMLElement>('.tp-n')!;
  const topics = [...list.querySelectorAll<HTMLButtonElement>('button[data-topic]')];
  const names = new Set(topics.map(b => b.dataset.topic).filter(Boolean));

  const open = (v: boolean) => {
    list.hidden = !v;
    btn.setAttribute('aria-expanded', String(v));
    if (!v) return;
    void loadOther();
    /* 마우스가 있는 기기에서만 바로 입력칸에 둔다. 휴대폰은 자판이 시기·주제 목록을 덮는다 */
    if (matchMedia('(hover: hover)').matches) input.focus();
  };
  const close = () => { open(false); btn.focus(); };

  btn.addEventListener('click', () => open(list.hidden));
  list.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button[data-topic], button[data-era], button[data-new]');
    if (!b) return;
    if (b.dataset.topic !== undefined) {
      const id = b.dataset.topic;
      setPick(id ? { kind: 'topic', id } : null);
    }
    close();   // 시기는 문서의 클릭이 이어서 고른다(eras.ts)
    if (b.dataset.new !== undefined) { setPick({ kind: 'new' }); scrollToPicked(); }
  });
  input.addEventListener('input', () => {
    const q = input.value;
    if (terms(q).length) setPick({ kind: 'q', q });
    else if (currentPick()?.kind === 'q') setPick(null);
  });
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    close();
    scrollToPicked();
  });
  document.addEventListener('click', e => { if (!list.hidden && !tp.contains(e.target as Node)) open(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !list.hidden) close();
  });
  document.addEventListener('pick', () => {
    const p = currentPick();
    btn.setAttribute('aria-pressed', String(!!p && p.kind !== 'new'));
    topics.forEach(b => b.setAttribute('aria-current', String(p?.kind === 'topic' && b.dataset.topic === p.id)));
    list.querySelector('button[data-new]')?.setAttribute('aria-current', String(p?.kind === 'new'));
    list.querySelectorAll<HTMLButtonElement>('button[data-era]').forEach(b =>
      b.setAttribute('aria-current', String(p?.kind === 'era' && b.dataset.era === p.from)));
    if (p?.kind !== 'q') input.value = '';
    else if (input.value !== p.q) input.value = p.q;
    count.textContent = p?.kind === 'q' ? countLabel(document.querySelectorAll('.wall .box.on').length) : '';
  });

  btn.setAttribute('aria-pressed', 'false');
  const id = new URLSearchParams(location.search).get('topic');
  if (id && names.has(id)) setPick({ kind: 'topic', id });
}
