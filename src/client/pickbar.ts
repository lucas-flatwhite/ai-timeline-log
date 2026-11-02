import { currentPick, setPick } from './pick.ts';
import { pickEra, readEras } from './eras.ts';

/* 강조 띠: 지금 고른 것과 상자 수, 해제 단추. 시기는 그 시기 글과 앞뒤 시기 단추까지 보인다 */
const bar = () => document.getElementById('pickbar');

/** 상자 수 문구('상자 12개', '맞는 상자가 없습니다') */
export function countLabel(n: number): string {
  const d = bar()?.dataset ?? {};
  return n === 0 ? d.none ?? '' : n === 1 ? d.box1 ?? '1' : (d.boxes ?? '{n}').split('{n}').join(String(n));
}

export function initPickbar(): void {
  const el = bar();
  if (!el) return;
  const d = el.dataset, eras = readEras();
  const $ = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
  const k = $('.pb-k'), name = $('.pb-name'), n = $('.pb-n'), body = $('.pb-body');
  const prev = $<HTMLButtonElement>('.pb-prev'), next = $<HTMLButtonElement>('.pb-next'), more = $<HTMLButtonElement>('.pb-more');
  /* 휴대폰: 시기 글은 고른 직후에만 펴 두고, 손으로 벽을 굴리면 접어서 제목 줄만 위에 남긴다(접는 모양은 CSS가 좁은 화면에서만 따른다) */
  const fold = (v: boolean) => { el.classList.toggle('tight', v); more.setAttribute('aria-expanded', String(!v)); };
  const topicName = (id: string) => document.querySelector<HTMLElement>(`.tp-list button[data-topic="${CSS.escape(id)}"]`)?.dataset.name ?? id;
  let at = -1;   // 고른 시기의 순서(오래된 것부터)

  const render = () => {
    const p = currentPick();
    el.hidden = !p;
    el.classList.toggle('era', p?.kind === 'era');
    if (!p) return;
    at = p.kind === 'era' ? eras.findIndex(e => e.from === p.from) : -1;
    fold(false);
    const era = eras[at];
    k.textContent = p.kind === 'era' ? d.era!.replace('{i}', String(at + 1)).replace('{n}', String(eras.length))
      : p.kind === 'topic' ? d.topic! : p.kind === 'q' ? d.find! : d.new!;
    name.textContent = p.kind === 'era' ? `${era?.title ?? ''} · ${era?.span ?? ''}`
      : p.kind === 'topic' ? topicName(p.id) : p.kind === 'q' ? `“${p.q.trim()}”` : '';
    n.textContent = countLabel(document.querySelectorAll('.wall .box.on').length);
    body.textContent = era?.body ?? '';
    prev.hidden = next.hidden = !era;
    prev.disabled = at <= 0;
    next.disabled = at >= eras.length - 1;
  };
  document.addEventListener('pick', render);
  $('.pb-x').addEventListener('click', () => setPick(null));
  more.addEventListener('click', () => fold(!el.classList.contains('tight')));
  /* 스크립트가 내리는 스크롤(시기 첫 상자로 가기)은 접지 않는다. 손가락·휠로 굴릴 때만 */
  const onUser = () => { if (!el.hidden && el.classList.contains('era') && !el.classList.contains('tight')) fold(true); };
  addEventListener('touchmove', onUser, { passive: true });
  addEventListener('wheel', onUser, { passive: true });
  prev.addEventListener('click', () => { if (at > 0) pickEra(eras[at - 1].from); });
  next.addEventListener('click', () => { if (at >= 0 && at < eras.length - 1) pickEra(eras[at + 1].from); });
  render();
}
