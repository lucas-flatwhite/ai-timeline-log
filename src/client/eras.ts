import { inEra } from '../lib/search.ts';
import { addMatch, currentPick, scrollToPicked, setPick } from './pick.ts';

/* 시기 강조: 시기(arcs.yaml)를 고르면 그 기간의 상자만 남기고 그 시기의 첫(가장 최신) 상자로 내린다.
   찾기 창, 맺음의 시기 글, 강조 띠의 앞뒤 단추가 모두 data-era(YYYYMM) 또는 pickEra로 고른다 */
export interface Era { from: string; to?: string; title: string; span: string; body: string }

export function readEras(): Era[] {
  try { return JSON.parse(document.getElementById('eras')?.textContent || '[]'); } catch { return []; }
}

export function initEras(): void {
  const eras = readEras();
  const byFrom = new Map(eras.map(e => [e.from, e]));
  addMatch('era', (b, p) => {
    const e = byFrom.get(p.from);
    return !!e && inEra(b.querySelector('.d')?.textContent ?? '', e.from, e.to);
  });
  document.addEventListener('click', e => {
    if (e instanceof MouseEvent && (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
    const a = (e.target as Element).closest<HTMLElement>('[data-era]');
    if (!a || !byFrom.has(a.dataset.era!)) return;
    e.preventDefault();
    pickEra(a.dataset.era!);
  });
  const q = new URLSearchParams(location.search).get('era')?.replace('-', '');
  if (q && byFrom.has(q)) pickEra(q);
}

/** 시기를 고르고 그 상자로 내린다. 이미 고른 시기면 그대로 둔다 */
export function pickEra(from: string): void {
  const p = currentPick();
  if (!(p?.kind === 'era' && p.from === from)) setPick({ kind: 'era', from });
  scrollToPicked();
}
