import type { Locale } from '../lib/dates.ts';
import { ko, type UI } from './ko.ts';
import { en } from './en.ts';

export const ui: Partial<Record<Locale, UI>> = { ko, en };

/* 지원 언어. 두 글자 표시, 그 언어로 쓴 이름, base 뒤 주소. 문구(ui)와 사이트 글(site.yaml)이 다 있어야 페이지가 생긴다.
   기본 언어(영어)가 base 바로 아래에 있고, 한국어는 ko/ 아래에 있다. 예전 en/ 주소는 vercel.json이 base로 돌려보낸다 */
export const DEFAULT_LOCALE: Locale = 'en';
export const locales: { code: Locale; label: string; name: string; path: string }[] = [
  { code: 'ko', label: 'KO', name: '한국어', path: 'ko/' },
  { code: 'en', label: 'EN', name: 'English', path: '' },
];

/* 고른 언어를 기억하는 브라우저 저장소 키. lucasflatwhite.com 전체(아케이드 게임 포함)가 같은 키를 함께 쓴다 */
export const LOCALE_KEY = 'lucas-flatwhite:locale';

/** base 뒤 그 언어의 주소('' 또는 'ko/') */
export function localePath(locale: Locale): string {
  const l = locales.find(x => x.code === locale);
  if (!l) throw new Error(`Unknown locale ${locale}`);
  return l.path;
}

export function uiFor(locale: Locale): UI {
  const t = ui[locale];
  if (!t) throw new Error(`No UI strings for locale ${locale}`);
  return t;
}
