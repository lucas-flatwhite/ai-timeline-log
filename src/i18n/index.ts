import type { Locale } from '../lib/dates.ts';
import { ko, type UI } from './ko.ts';

export const ui: Partial<Record<Locale, UI>> = { ko };
export function uiFor(locale: Locale): UI {
  const t = ui[locale];
  if (!t) throw new Error(`No UI strings for locale ${locale}`);
  return t;
}
