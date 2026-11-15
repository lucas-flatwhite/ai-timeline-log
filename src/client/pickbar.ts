import { currentPick, scrollToPicked, setPick } from './pick.ts';
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
  const seq: string[] = JSON.parse(d.seq || '[]');
  const $ = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
  const k = $('.pb-k'), name = $('.pb-name'), n = $('.pb-n'), body = $('.pb-body');
  const prev = $<HTMLButtonElement>('.pb-prev'), next = $<HTMLButtonElement>('.pb-next'), more = $<HTMLButtonElement>('.pb-more');
  /* 휴대폰: 시기·판 글은 고른 직후에만 펴 두고, 손으로 벽을 굴리면 접어서 제목 줄만 위에 남긴다(접는 모양은 CSS가 좁은 화면에서만 따른다) */
  const fold = (v: boolean) => { el.classList.toggle('tight', v); more.setAttribute('aria-expanded', String(!v)); };
  const topicName = (id: string) => document.querySelector<HTMLElement>(`.tp-list button[data-topic="${CSS.escape(id)}"]`)?.dataset.name ?? id;
  let at = -1;   // 고른 시기의 순서(오래된 것부터)

  const render = () => {
    const p = currentPick();
    el.hidden = !p;
    el.classList.toggle('era', p?.kind === 'era');
    el.classList.toggle('edition', p?.kind === 'edition');
    el.classList.toggle('recent', p?.kind === 'recent');
    if (!p) return;
    at = p.kind === 'era' ? eras.findIndex(e => e.from === p.from) : -1;
    const bId = p.kind === 'edition' ? `edition-${p.n}` : p.kind === 'recent' ? 'recent' : '';
    const bIdx = bId ? seq.indexOf(bId) : -1;
    fold(false);
    const era = eras[at];
    const bundle = bId ? el.querySelector<HTMLElement>(`[data-bundle="${bId}"]`) : null;
    k.textContent = p.kind === 'era' ? d.era!.replace('{i}', String(at + 1)).replace('{n}', String(eras.length))
      : p.kind === 'edition' ? (d.editionK ?? '판')
      : p.kind === 'recent' ? (d.recent ?? '최근')
      : p.kind === 'topic' ? d.topic!
      : p.kind === 'q' ? d.find! : d.new!;
    name.textContent = p.kind === 'era' ? `${era?.title ?? ''} · ${era?.span ?? ''}`
      : p.kind === 'edition' ? (bundle?.dataset.label ?? `제 ${p.n}판`)
      : p.kind === 'topic' ? topicName(p.id)
      : p.kind === 'q' ? `“${p.q.trim()}”` : '';
    n.textContent = countLabel(document.querySelectorAll('.wall .box.on').length);
    el.querySelectorAll<HTMLElement>('.pb-era, .pb-bundle').forEach(b => { b.hidden = true; });
    if (era) {
      const eraEl = el.querySelector<HTMLElement>('.pb-era');
      if (eraEl) { eraEl.textContent = era.body; eraEl.hidden = false; body.prepend(eraEl); }
    } else if (bundle) {
      bundle.hidden = false;
      body.prepend(bundle);
    }
    prev.hidden = next.hidden = !era && bIdx < 0;
    prev.disabled = era ? at <= 0 : bIdx <= 0;
    next.disabled = era ? at >= eras.length - 1 : bIdx >= seq.length - 1;
  };
  document.addEventListener('pick', render);
  $('.pb-x').addEventListener('click', () => setPick(null));
  more.addEventListener('click', () => fold(!el.classList.contains('tight')));
  /* 스크립트가 내리는 스크롤은 접지 않는다. 손가락·휠로 굴릴 때만 */
  const onUser = () => {
    if (!el.hidden && (el.classList.contains('era') || el.classList.contains('edition') || el.classList.contains('recent')) && !el.classList.contains('tight')) fold(true);
  };
  addEventListener('touchmove', onUser, { passive: true });
  addEventListener('wheel', onUser, { passive: true });

  const stepBundle = (dir: number) => {
    if (at >= 0) {
      const nextAt = at + dir;
      if (nextAt >= 0 && nextAt < eras.length) pickEra(eras[nextAt].from);
    } else {
      const p = currentPick();
      const bId = p?.kind === 'edition' ? `edition-${p.n}` : p?.kind === 'recent' ? 'recent' : '';
      const bIdx = bId ? seq.indexOf(bId) : -1;
      const nextIdx = bIdx + dir;
      if (nextIdx >= 0 && nextIdx < seq.length) {
        const id = seq[nextIdx];
        if (id === 'recent') setPick({ kind: 'recent' });
        else setPick({ kind: 'edition', n: Number(id.replace('edition-', '')) });
        scrollToPicked();
      }
    }
  };
  prev.addEventListener('click', () => stepBundle(-1));
  next.addEventListener('click', () => stepBundle(1));

  el.addEventListener('click', e => {
    const chip = (e.target as Element).closest<HTMLAnchorElement>('.pb-chip');
    if (chip && chip.dataset.scene) {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('open-addr', { detail: chip.dataset.scene }));
    }
  });

  render();
}
