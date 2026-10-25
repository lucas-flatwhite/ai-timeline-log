import type { Locale } from '../lib/dates.ts';
import { ko, type UI } from './ko.ts';
import { en } from './en.ts';

export const ui: Partial<Record<Locale, UI>> = { ko, en };

/* 지원 언어. 두 글자 표시, 그 언어로 쓴 이름, base 뒤 주소. 문구(ui)와 사이트 글(site.yaml)이 다 있어야 페이지가 생긴다 */
export const locales: { code: Locale; label: string; name: string; path: string }[] = [
  { code: 'ko', label: 'KO', name: '한국어', path: '' },
  { code: 'en', label: 'EN', name: 'English', path: 'en/' },
];
export function uiFor(locale: Locale): UI {
  const t = ui[locale];
  if (!t) throw new Error(`No UI strings for locale ${locale}`);
  return t;
}
